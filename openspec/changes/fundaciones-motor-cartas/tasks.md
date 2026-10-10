## 1. Estructura del monorepo

- [x] 1.1 Inicializar git, `package.json` raíz con pnpm workspaces, `.gitignore` y `.editorconfig`
- [x] 1.2 Crear `tsconfig.base.json` estricto compartido y los paquetes `packages/engine` y `packages/client` con su `package.json` y `tsconfig.json`
- [x] 1.3 Configurar Vitest en `engine` con un test de humo que pase
- [x] 1.4 Configurar ESLint y Prettier, y los scripts raíz `build`, `test`, `lint` y `dev`
- [x] 1.5 Verificar que `engine` no tiene dependencias de runtime ni importa nada del DOM ni de Node (regla de lint o test)

## 2. Baraja y azar (engine)

- [x] 2.1 Implementar el hash cyrb128 de la semilla y el generador sfc32 con su estado serializable; tests de que la misma semilla da la misma secuencia
- [x] 2.2 Modelar cartas, palos y valores de la baraja española (40/48) y la francesa (52), con colores e identificadores serializables; tests de composición e ida y vuelta
- [x] 2.3 Implementar el barajado Fisher–Yates con el generador; tests de determinismo, conservación de cartas y ausencia de sesgo (frecuencia por posición)
- [x] 2.4 Implementar el reparto desde el mazo con error si faltan cartas, sin reparto parcial; tests

## 3. Contrato del motor (engine)

- [ ] 3.1 Definir los tipos `Resultado`, `Juego<Config, Estado, Accion, Vista>`, `Fin` y asiento/espectador
- [ ] 3.2 Implementar una función común `aplicar` que valide contra `accionesLegales` antes de la transición propia de cada juego
- [ ] 3.3 Implementar la utilidad de repetición: config + semilla + acciones → estado, con error si alguna acción falla
- [ ] 3.4 Crear la suite genérica de propiedades (fast-check) para cualquier `Juego`: inmutabilidad, acción ilegal sin cambios, repetición determinista, serialización JSON de ida y vuelta, sin acciones legales al terminar y vistas sin cartas ocultas

## 4. Klondike (engine)

- [ ] 4.1 Definir la configuración (robo 1/3, límite de vueltas), el estado y las acciones; implementar `crear` con el reparto en 7 columnas
- [ ] 4.2 Implementar robar y reciclar el mazo, con el límite de vueltas
- [ ] 4.3 Implementar los movimientos en las columnas (cartas sueltas y secuencias, rey a columna vacía) y el volteo automático
- [ ] 4.4 Implementar los movimientos a y desde las fundaciones
- [ ] 4.5 Implementar el historial de movimientos y la acción deshacer, incluidos volteos y reciclados
- [ ] 4.6 Implementar la detección de autocompletar y la acción, la victoria y el contador de movimientos
- [ ] 4.7 Implementar `vistaDe` (cartas boca abajo y mazo como números) y `resultado`
- [ ] 4.8 Tests de todos los escenarios de `specs/juego-klondike` y pasar la suite genérica del contrato

## 5. Brisca (engine)

- [ ] 5.1 Definir `ConfigBrisca` con valores por defecto y validación (2/4 jugadores, cambio de muestra, arrastre, número de manos), y las tablas de orden y puntos
- [ ] 5.2 Implementar `crear`: reparto de 3 cartas, la muestra al fondo del mazo y la salida del jugador que no reparte
- [ ] 5.3 Implementar jugar carta, la resolución de la baza (triunfo o palo de salida), el robo empezando por el ganador y la salida siguiente
- [ ] 5.4 Implementar el cambio de muestra con el 7, o con el 2 si la muestra es baja, y sus variantes (`no`, `libre`, `trasGanarBaza`)
- [ ] 5.5 Implementar el fin de la mano (más de 60 gana, 60 a 60 empate) y la partida al mejor de N con el reparto alternado
- [ ] 5.6 Implementar 4 jugadores en parejas: turno antihorario y puntos por pareja
- [ ] 5.7 Implementar el arrastre opcional con el mazo agotado (seguir el palo, superar, fallar con triunfo)
- [ ] 5.8 Implementar `vistaDe` (mano propia, número de cartas ajenas incluido el compañero, muestra, mazo y baza en curso) y `resultado`
- [ ] 5.9 Tests de todos los escenarios de `specs/juego-brisca` y pasar la suite genérica del contrato

## 6. IA (engine)

- [ ] 6.1 Definir la interfaz `decidir(vista, acciones, rng)` y un agente aleatorio
- [ ] 6.2 Implementar la IA básica de la Brisca con las reglas de prioridad del design
- [ ] 6.3 Simulación de 1.000 partidas entre IAs (2 y 4 jugadores, distintas variantes) sin acciones ilegales
- [ ] 6.4 Test de la IA básica contra el agente aleatorio en 1.000 manos (gana claramente más de la mitad) y del escenario "no regala puntos"
- [ ] 6.5 Tests de reproducibilidad (misma vista + semilla = misma decisión) y de tiempo de decisión por debajo de 500 ms

## 7. Base del cliente

- [ ] 7.1 Crear `client` con Svelte 5 + Vite como SPA estática que importa `engine`, con un build que funcione
- [ ] 7.2 Crear el módulo de textos en español y los estilos base: variables CSS, tamaño de carta con `clamp` y `prefers-reduced-motion`
- [ ] 7.3 Implementar la navegación entre las tres pantallas (menú, opciones, mesa) sin router
- [ ] 7.4 Implementar la sesión de juego: estado completo, asientos humano/IA, aplicar acciones, exponer solo la vista y las acciones legales del humano, y turnos de la IA con pausa
- [ ] 7.5 Implementar el guardado y la carga en `localStorage` por repetición, con versión, descarte con aviso y el tiempo medido por el cliente

## 8. Cartas en SVG

- [ ] 8.1 Dibujar los paths de los 4 palos españoles y los 4 franceses
- [ ] 8.2 Implementar el componente `Carta` (numerales, figuras estilizadas e índices legibles) para ambas barajas
- [ ] 8.3 Implementar el dorso configurable y una página de muestra con todas las cartas para revisión visual

## 9. Interacción y animación

- [ ] 9.1 Implementar arrastre con Pointer Events: umbral de inicio, `touch-action: none` en la mesa y volver al origen si el destino no es legal
- [ ] 9.2 Implementar tocar-y-tocar y el doble toque al destino obvio, con la misma lógica de origen y destinos legales
- [ ] 9.3 Resaltar los destinos legales al seleccionar o empezar a arrastrar una carta
- [ ] 9.4 Implementar las animaciones FLIP (Web Animations, solo `transform`/`opacity`) para cualquier cambio de la vista

## 10. Pantallas de juego

- [ ] 10.1 Menú de la suite con Klondike y Brisca, y la oferta de retomar una partida guardada
- [ ] 10.2 Opciones de Klondike (robo 1/3, vueltas) y de Brisca (jugadores, cambio de muestra, arrastre, manos)
- [ ] 10.3 Mesa de Klondike: columnas, fundaciones, mazo y descarte, contadores de movimientos y tiempo, deshacer y autocompletar
- [ ] 10.4 Mesa de Brisca para 2 y 4 jugadores: mano propia, dorsos rivales, muestra, mazo, baza en curso, indicador de turno y acción de cambiar la muestra
- [ ] 10.5 Pantalla de fin de partida con el resultado, revancha y volver al menú

## 11. Verificación del cliente

- [ ] 11.1 Configurar Playwright con un perfil de escritorio y otro de móvil de 360 × 640
- [ ] 11.2 E2E: partida de Klondike completa (semilla fija) y partida de Brisca completa contra la IA
- [ ] 11.3 E2E: sin scroll horizontal y cartas legibles a 360 px
- [ ] 11.4 E2E: sin conexión tras la carga se puede jugar una partida completa, sin peticiones de red
- [ ] 11.5 E2E: recargar a mitad de partida ofrece continuarla en el mismo punto
- [ ] 11.6 Revisar que todos los textos visibles están en español y ejecutar `openspec validate --strict` antes de cerrar el change
