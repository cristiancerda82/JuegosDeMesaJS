## Why

La guía del Barbu ya cuenta que «en otros sitios el que reparte elige el número con el que se empieza, en lugar de las Jotas». Es una regla muy extendida del dominó del Barbu. Le da a quien reparte una decisión más: elegir el número que mejor le va a su mano. Así el dominó deja de depender tanto de tener Jotas.

Es la quinta de las variantes que las guías solo mencionaban, tras el Treinta y uno con viuda, la Siete y media con cartas tapadas, el Oh Hell empezando con 1 carta y el Polignac con el orden antiguo.

## What Changes

- **Opción «Dominó: elige el número» en el Barbu**, desactivada por defecto. Con ella activada:
  - cuando el repartidor elige el dominó, elige después el número con el que se empieza: del 2 al As;
  - las filas se abren con las cartas de ese número, como sin la opción se abren con las Jotas;
  - las filas crecen igual, hacia arriba hasta el As y hacia abajo hasta el 2.
- **Lo demás no cambia:** los otros contratos, quién empieza el dominó, el pasar, los puntos y el orden de acabar. Sin la opción, las partidas guardadas y las salas sin la opción siguen como siempre.
- **IA:**
  - **Normal:**
    - elige el número con el que más cartas puede soltar: las que tiene de ese número y las seguidas a ellas;
    - para decidir si elige el dominó, lo valora con el mejor número posible;
    - al jugar, cuenta las filas desde el número elegido.
  - **Difícil:** el número lo decide la normal, como el contrato y el triunfo; se simulan las cartas.
- **Cliente:**
  - la casilla en las opciones del Barbu, en local y al crear una sala en red;
  - en la mesa, con la opción, el repartidor elige el número con un botón por número;
  - las filas del dominó marcan el hueco de salida en el número elegido;
  - el contrato dice con qué número se empieza;
  - la línea «En otros sitios…» de la guía pasa a explicar la variante y en qué opción se activa.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-barbu`: el número de salida del dominó elegido por el repartidor.
- `ia-jugadores`: la IA básica del Barbu con el número elegido.
- `mesa-cliente`: la opción, la elección del número en la mesa y la guía.

## Impact

- `packages/engine`:
  - `juegos/barbu.ts`: la config, la fase y la acción para elegir el número, el número en el estado y la vista, y el encaje de las filas;
  - `ia/barbu-basica.ts` e `ia/reconstruir/barbu.ts`;
  - los tests.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - `MesaBarbu.svelte` y `DominoBarbu.svelte`;
  - las opciones;
  - los textos y la guía;
  - el E2E.
