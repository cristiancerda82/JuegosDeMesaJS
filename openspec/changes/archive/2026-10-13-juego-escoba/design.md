## Context

El motor tiene el contrato de juego, la baraja, el azar, el reparto y el módulo de bazas (`motor/bazas.ts`), con `bandoDe` y `siguiente` para los asientos y las parejas. El cliente tiene una sesión genérica (con `pausar()` y `reanudar()`), el guardado repetible, la interacción con arrastre y toque, las animaciones FLIP y las piezas de la mesa de bazas (`AsientoRival` y `ManoPropia`).

La Escoba no es un juego de bazas: no hay triunfo ni ganador de una ronda. Cada jugada es una carta más una captura opcional de la mesa. Eso cambia tres cosas: las acciones legales (cada combinación que suma 15 es una acción), la interacción (hay que elegir qué recoger) y la puntuación (un desglose por conceptos al final de la mano). Las reglas están en specs/juego-escoba.

## Goals / Non-Goals

**Goals:**
- Que la Escoba cumpla el contrato del motor y pase la suite genérica de propiedades.
- Que el jugador pueda elegir cualquier captura legal con ratón o con el dedo, también en 360 px.
- Reutilizar del cliente todo lo que no es específico de las bazas.

**Non-Goals:**
- Un módulo genérico de "juegos de capturas": hasta que llegue un segundo juego de capturas (Scopa, Casino) no hay de dónde abstraer.
- Animar las cartas recogidas hasta el montón: se muestra la jugada durante una pausa y luego desaparecen de la mesa.

## Decisions

### 1. La captura forma parte de la acción
`AccionEscoba = { tipo: 'jugar', carta, captura: IdCarta[] }`, donde `captura` vacía significa dejar la carta en la mesa. `accionesLegales` enumera, por cada carta de la mano, todas las combinaciones de la mesa que suman 15 con ella, más la jugada sin captura cuando es legal.
- `captura` se ordena siempre en el orden en que las cartas están en la mesa. Así, `aplicar` (que compara con `accionesLegales` por igualdad JSON) acepta una acción solo si es exactamente una de las legales, y la UI elige de esa lista en lugar de construir acciones.
- Las combinaciones se buscan con un recorrido en profundidad que poda en cuanto la suma pasa de 15. Los valores son positivos y la mesa rara vez supera las 12 cartas, así que el coste es pequeño incluso en las simulaciones de 1.000 partidas.
- *Alternativa:* dos acciones (jugar carta y luego elegir captura), con un estado intermedio. Se descarta porque complica el contrato y la repetición, y abre estados a medias que la red tendría que sincronizar.

### 2. Estado
JSON plano, con:
- `mesa: IdCarta[]`, en orden de llegada.
- `recogidas: [IdCarta[], IdCarta[]]` y `escobas: [n, n]`, por bando.
- `ultimoEnRecoger: Asiento | null`.
- `ultimaJugada: { asiento, carta, captura, escoba } | null`, que es pública y la usa la UI para mostrar la jugada durante la pausa.
- `resultadosManos: ResultadoManoEscoba[]`, con el desglose por bando (`escobas`, `cartas`, `oros`, `sieteOros`, `sietes`, `total`).

Los puntos de la partida se derivan de `resultadosManos`. El repartidor alterna, y la mesa inicial que suma 15 o 30 se resuelve dentro de `nuevaMano`.

`puntuarMano(recogidas, escobas)` es una función pura y exportada, con tests propios para cada concepto y para los empates.

### 3. Vista y cartas ocultas
`VistaEscoba` muestra la mesa completa, la mano propia, `cartasEnMano`, el mazo como número, `cartasRecogidas` y `escobas` por bando, `ultimoEnRecoger`, `ultimaJugada`, los puntos de la partida y `resultadosManos`. No muestra las cartas recogidas: las vio todo el mundo al pasar por la mesa, pero en el juego real van boca abajo y recordarlas es parte de la habilidad. El oráculo de la suite genérica considera ocultos el mazo y las manos ajenas.

### 4. IA básica por evaluación de jugadas
La IA puntúa cada acción legal y elige la mejor. El primer criterio de desempate es el orden de las acciones, así que es determinista.
- Captura: escoba (+1000), 7 de oros (+100), cada siete (+30), cada oro (+10) y cada carta (+3).
- Sin captura: penaliza soltar el 7 de oros (−100), un siete (−30) o un oro (−10).
- Riesgo: si la suma de la mesa resultante está entre 5 y 14, el rival podría hacer escoba con una sola carta (−80). Con 4 jugadores, el siguiente en jugar siempre es rival, así que la regla vale igual.

Usa solo su vista: la mesa, su mano y los contadores públicos.

### 5. Cliente: mesa de la Escoba
`MesaEscoba.svelte` reutiliza `AsientoRival` y `ManoPropia` de `mesas/bazas/` y añade:
- **La mesa** como una rejilla de cartas que se ajusta al ancho. Todas son visibles y no son orígenes de arrastre: se tocan para elegirlas.
- **La captura en curso:** con una carta de la mano elegida, se resaltan las cartas de la mesa que aparecen en alguna de sus capturas legales. Tocar una carta de la mesa la añade o la quita de la selección. Un panel muestra la suma ("12 / 15"), el botón **Recoger**, activo solo cuando la selección coincide con una captura legal, y **Dejar en la mesa**, cuando es legal.
- **Al soltar en la mesa** (arrastre o doble toque): si la carta tiene una sola jugada legal, se aplica. Si tiene varias, se abre un selector con cada opción dibujada como un grupo de cartas pequeñas, más "Dejar en la mesa" si es legal. Así se cumple "elegir entre capturas" sin obligar a tocar carta a carta.
- **La jugada reciente:** durante la pausa que sigue a una jugada, la mesa muestra la carta jugada y las recogidas destacadas, y un aviso ("Escoba de Rival", "Recoges 3 cartas"…). La pausa la da `pausaTras` comparando `ultimaJugada`.
- **Montones:** junto a cada asiento se muestran las cartas recogidas y las escobas del bando en la mano en curso.

### 6. Desglose al terminar la mano
Cuando aparece un nuevo resultado de mano y la partida sigue, la mesa abre un panel con el desglose de la mano y los totales, y llama a `sesion.pausar()`. Con "Siguiente mano" se cierra y se llama a `reanudar()`. Esto reutiliza la pausa que ya usa la guía y evita depender de una pausa con tiempo fijo para leer una tabla. La pantalla de fin muestra el desglose de la última mano y los totales.

### 7. Registro en el cliente
`IdJuego` suma `'escoba'`, con su `DEF_ESCOBA`, `SesionEscoba` en `partida.ts`, las opciones, los textos, la entrada del menú y la guía con dos ejemplos de cartas: los valores para sumar y una captura de 15.

## Risks / Trade-offs

- [Variantes regionales: captura obligatoria, puntos de la partida, mesa inicial, sietes o «primera»] → Las tres primeras son configuración. La primera italiana queda fuera de alcance y se documenta en la propuesta. El usuario valida las specs.
- [Muchas acciones legales con la mesa llena] → Las capturas se buscan con poda. La UI no lista todas: filtra por la carta elegida y por la selección.
- [El panel de desglose detiene la partida hasta que se toca "Siguiente mano"] → Es lo deseado para poder leerlo. En los tests E2E se cierra explícitamente, y con `?rapido` sigue siendo un clic.
- [Las cartas recogidas desaparecen sin viajar al montón] → La jugada queda visible durante la pausa con un aviso. Animarlas al montón se puede añadir después, porque el FLIP ya admite `data-desde`.

## Migration Plan

No hay datos que migrar. Los guardados de los otros juegos siguen siendo válidos y `VERSION_MOTOR` no cambia.
