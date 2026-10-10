## Context

Es un proyecto nuevo, sin código previo. La motivación está en `proposal.md`, en la sección Why, y los requisitos en `specs/`. Hay tres restricciones que dan forma al diseño:

- El motor de reglas tiene que poder ejecutarse sin cambios en el navegador, en el futuro servidor de red y en los tests, así que no puede depender del DOM, de Node ni de la hora.
- El cliente se empaquetará más adelante como PWA, Capacitor y Tauri/Electron. Por eso tiene que ser una SPA estática, sin servidor propio y sin peticiones de red en modo local.
- Las reglas de la Brisca tienen variantes regionales que el usuario validará, así que tienen que poder ajustarse sin reescribir el juego.

Decisiones ya tomadas con el usuario: render con DOM/CSS, UI con Svelte y cartas dibujadas en SVG desde el código.

## Goals / Non-Goals

**Goals:**
- Un contrato de juego único que cumplan Klondike y Brisca, y que sirva tal cual para el Tute y para el modo en red.
- Que la vista de jugador sea la única puerta de la UI y de la IA hacia el estado, para que el modo en red no exija reescribir nada.
- Partidas reproducibles: configuración + semilla + acciones bastan para reconstruir cualquier partida.
- Que el paquete `engine` se pueda probar entero sin navegador.

**Non-Goals:**
- No se crea el paquete `server` ni se elige su librería de WebSockets. Eso queda para el change de red.
- No hay service worker ni manifest de PWA. "Sin red" aquí significa no hacer peticiones después de la carga.
- No hay sistema de traducción: los textos van en español, centralizados en un módulo por si hace falta traducir más adelante.
- No hay librería global de estado ni router. El cliente tiene pocas pantallas.

## Decisions

### 1. Monorepo con pnpm workspaces: `packages/engine` y `packages/client`
`engine` no tiene dependencias de runtime. `client` depende de `engine`. TypeScript estricto en ambos y una configuración base compartida.
- *Alternativas:* un solo paquete con carpetas, descartado porque nada impediría que el motor importe cosas de la UI. Nx o Turborepo, descartados por excesivos para dos paquetes; se pueden sumar después.

### 2. El contrato de juego como objeto de funciones puras
Cada juego exporta un objeto que implementa `Juego<Config, Estado, Accion, Vista>`:

```
crear(config, semilla)            -> Resultado<Estado>
accionesLegales(estado, asiento)  -> Accion[]
aplicar(estado, asiento, accion)  -> Resultado<Estado>
vistaDe(estado, asiento | null)   -> Vista      // null = espectador
resultado(estado)                 -> Fin | null
```

- Los errores se devuelven como `Resultado` ({ ok, valor } | { ok: false, error }), sin excepciones. La acción ilegal es un caso esperado, sobre todo cuando las acciones lleguen por la red.
- `aplicar` valida la acción comparándola con `accionesLegales`, así que hay una sola fuente de verdad sobre qué es legal.
- El estado es JSON plano: arrays, objetos, números y strings, sin clases ni `Map`. Así se serializa sin adaptadores.
- La inmutabilidad se logra copiando de forma explícita y superficial lo que cambia. Los estados de cartas son pequeños y no hace falta Immer.
- *Alternativa:* clases con métodos que mutan el estado, descartadas porque complican el deshacer, la repetición y el envío por la red.

### 3. Vista como tipo distinto del estado
`Vista` es un tipo propio de cada juego. Las cartas ocultas se representan solo como un número, nunca como un array con identificadores. Que el compilador las distinga evita filtrar información sin querer. Además, un test por propiedades serializa vistas de muchos estados y comprueba que no aparece ningún identificador de carta oculta.

### 4. Generador aleatorio propio: sfc32 sembrado con un hash de 128 bits de la semilla
La semilla es un string. Un hash (cyrb128) la convierte en 4 enteros de 32 bits para sfc32, y el barajado usa Fisher–Yates. Solo usa aritmética entera de 32 bits, así que da los mismos resultados en cualquier motor de JS. El generador vive dentro del estado (4 números), de modo que cualquier azar posterior también es reproducible.
- *Alternativas:* `Math.random` no se puede sembrar. mulberry32 tiene solo 32 bits de estado, que es muy poco para barajas. Una librería externa es innecesaria para unas 20 líneas.
- *Nota:* con 128 bits no se alcanzan todos los órdenes posibles de 52 cartas (52! ≈ 2^226). La spec de baraja se ajustó para exigir ausencia de sesgo, no alcanzabilidad.

### 5. Deshacer en Klondike como acción del juego, con historial en el estado
El estado de Klondike guarda una pila de movimientos con lo necesario para revertirlos: origen, destino, cantidad, si volteó una carta y si fue un reciclado. `deshacer` es una acción legal más. Así sigue siendo determinista, entra en el guardado y no exige guardar copias completas del estado.
- *Alternativa:* pila de estados completos en el cliente. Es más simple, pero queda fuera del motor y engorda el guardado.

### 6. El tiempo lo lleva el cliente, no el motor
El motor no puede leer la hora (spec motor-reglas). El contador de movimientos sí está en el estado de Klondike; el tiempo de juego lo mide el cliente y lo guarda junto a la partida.

### 7. Brisca configurable con un único objeto de variante
`ConfigBrisca` incluye `jugadores` (2 | 4), `cambioMuestra` ('no' | 'libre' | 'trasGanarBaza'), `arrastreFinal` (boolean) y `manos` (1, 3, 5…), con valores por defecto iguales a la variante base. `crear` valida la combinación. El orden de las cartas y los puntos son tablas de datos, no lógica condicional. Así el Tute puede reutilizar el modelo de bazas cambiando tablas y agregando reglas. Con 4 jugadores el turno avanza en sentido antihorario, como es tradicional en los juegos de naipes españoles.

### 8. IA como función `decidir(vista, acciones, rng) -> Accion`
La IA recibe solo la vista de su asiento, la lista de acciones legales y su propio generador sembrado. La IA básica de la Brisca usa reglas en orden de prioridad, sin búsqueda:
1. Cambiar la muestra si le conviene.
2. Si responde, ganar con la carta más barata que gane cuando la baza tiene puntos.
3. No gastar triunfos altos en bazas sin puntos.
4. Si no puede ganar, soltar la carta de menor valor.
5. Al salir, salir con una carta baja que no sea triunfo.

Hay también un agente aleatorio para tests y comparaciones. La IA corre en el hilo principal: las reglas son O(cartas en mano) y entran holgadas en el límite de 500 ms.
- *Alternativa:* búsqueda Monte Carlo sobre las manos posibles. Es más fuerte, pero queda para un nivel "difícil" en otro change.

### 9. Cliente: Svelte 5 + Vite como SPA estática, sin SvelteKit
El build produce archivos estáticos que sirven tal cual para Capacitor y Tauri. Hay tres pantallas (menú, opciones y mesa) controladas por un estado simple, sin router.
- Una **sesión de juego** (un módulo con runes de Svelte) guarda el estado completo, el tipo de cada asiento (humano o IA), aplica acciones, programa los turnos de la IA con una pausa breve y guarda la partida.
- Los componentes de la mesa reciben solo `vistaDe(estado, asientoHumano)` y las acciones legales. Nunca leen el estado completo. En el modo en red, la sesión se cambia por una que habla con el servidor, sin tocar los componentes.
- *Alternativas:* SvelteKit, descartado porque agrega rutas y SSR que no se usan y complica el empaquetado estático. React se descartó por decisión del usuario.

### 10. Interacción y animación
- Pointer Events dan un único camino para ratón y toque. Mientras se arrastra se usa `touch-action: none` en la mesa para que el navegador no haga scroll.
- Arrastrar y tocar comparten la misma lógica: elegir un origen, calcular sus destinos legales a partir de `accionesLegales`, resaltarlos y aplicar la acción al soltar o tocar el destino.
- Las cartas se animan con la técnica FLIP: se mide la posición antes y después del cambio de estado y se interpola con la Web Animations API. Así cualquier cambio del motor se anima solo, sin coreografía por juego.

### 11. Cartas en SVG generadas por componentes
Un componente `Carta` dibuja la carta en SVG a partir de baraja, palo y valor. Los cuatro palos españoles y los cuatro franceses son paths propios. Las figuras (sota, caballo, rey / J, Q, K) se dibujan de forma estilizada con el símbolo del palo y la letra o el número. El dorso es configurable. El tamaño sale de una variable CSS calculada según el contenedor (`clamp`) para que la mesa encaje desde 360 px.
- *Riesgo aceptado:* el aspecto no es el clásico. El componente aísla el arte, así que se puede reemplazar por un tema más adelante.

### 12. Guardado como registro repetible
En `localStorage` se guarda `{ versión, juego, config, semilla, acciones[], tiempoMs }` y la partida se reconstruye repitiendo las acciones. Ocupa poco y verifica el determinismo en cada carga. Si la versión no es compatible o la repetición falla, se descarta el guardado y se avisa al jugador.
- *Alternativa:* guardar una foto del estado. Es más robusta frente a cambios del motor, pero no verifica nada y ocupa más. Se puede agregar como respaldo si hiciera falta.

### 13. Pruebas
- **Vitest** para `engine`: tests unitarios por regla y escenario de las specs.
- **fast-check** para invariantes: no se crean ni pierden cartas, ninguna vista filtra cartas ocultas, la repetición es determinista y una acción ilegal no cambia el estado.
- **Simulaciones:** 1.000 partidas entre IAs, y la IA básica contra el agente aleatorio.
- **Playwright** para el cliente: una partida completa de cada juego, la pantalla de 360 × 640, jugar sin conexión y recargar a mitad de partida.

## Risks / Trade-offs

- [Reglas de la Brisca distintas a las que conoce el usuario] → Todas las variantes son configuración y tienen tests con nombre de escenario. El usuario valida las specs antes de implementar.
- [El arrastre en móviles choca con el scroll o con los gestos del sistema] → `touch-action: none` solo dentro de la mesa, umbral de movimiento antes de empezar a arrastrar, y tocar-y-tocar como alternativa siempre disponible.
- [La repetición falla tras cambiar las reglas del motor] → Versión en el guardado. Si la repetición falla, se descarta con aviso; nunca se rompe la app.
- [Las animaciones FLIP pierden fluidez en móviles modestos] → Solo se animan `transform` y `opacity`, y se respeta `prefers-reduced-motion`.
- [Las figuras estilizadas no gustan] → El arte está aislado en el componente `Carta`, así que cambiarlo después es local.
- [Svelte 5 (runes) es relativamente nuevo] → La lógica no trivial vive en `engine` (TS puro) y Svelte se usa solo para la presentación y la sesión.

## Migration Plan

No aplica: es un proyecto nuevo. No hay datos ni usuarios que migrar.

## Open Questions

- Si el escritorio se empaqueta con Tauri o con Electron: se decide en el change de empaquetado y no afecta a este.
- Proveedor de hosting para el cliente web y el futuro servidor: no afecta a este change.
