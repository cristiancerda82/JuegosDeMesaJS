## Context

El Texas Hold'em (`juegos/holdem.ts`) ya resuelve:
- el torneo, con sus ciegas y el botón;
- las apuestas sin límite, con la subida mínima y el all-in corto;
- los botes secundarios y el reparto del showdown;
- la eliminación.

`holdem-manos.ts` valora las manos de cinco cartas, y `ia/holdem-basica.ts` tiene la IA básica y la experta.

El Póker de cinco cartas cambia:
- las calles del Hold'em (preflop, flop, turn y river) por apuestas, descarte y apuestas;
- la mejor mano de siete por la de las cinco propias.

## Goals / Non-Goals

**Goals:**
- Póker de cinco cartas de 2 a 6 jugadores, con la IA de los tres niveles, en red y con su mesa.
- Que se juegue y se lea como el Hold'em de la suite: las mismas acciones, los mismos botes y la misma escala de ciegas.

**Non-Goals:**
- Límite fijo, ante, apertura con pareja de J o mejor y comodines.

## Decisions

### 1. Reutilizar sin generalizar el Hold'em
`juegos/poker-cinco.ts` es un juego aparte.
- **Se importa del Hold'em:**
  - `ciegasHoldem`, `FICHAS_INICIALES_HOLDEM`;
  - `botesHoldem`, `botesEnJuegoHoldem`;
  - `mejorManoPoker`.
- **Se copian y adaptan:** la lógica de turnos y apuestas (`transicion`, `continuar`, `cerrarMano`).

Sacar un motor de apuestas común obligaría a tocar el Hold'em, que ya está probado y en red. Las diferencias (el descarte y que no hay comunes) caen justo en `continuar` y en el showdown.

### 2. Estado y fases
- **Config:** `{ jugadores: 2 | 3 | 4 | 5 | 6 }`; por defecto, 4.
- **Fases:** `'antes' | 'descarte' | 'despues'`.
  - `antes`: como el preflop del Hold'em.
  - Al cerrarse esa ronda, siempre se pasa a `descarte`, aunque haya all-in. Quien sigue en la mano cambia, en orden desde el siguiente al botón.
  - Después:
    - `despues`, si al menos dos pueden apostar;
    - si no, directamente el showdown.
- **Acción del descarte:** `{ tipo: 'cambiar'; cartas: IdCarta[] }`, con las cartas ordenadas.
  - **Legales:** todos los subconjuntos de 0 a 3 cartas de la mano y los de 4 que dejan un As (31 como mucho).
  - **Al cambiar 4:** el As que queda se enseña (`asEnsenado[asiento]`).
- **Mazo:** las cartas no repartidas y `descartes`. Si el mazo no alcanza para un cambio, se barajan los descartes de los anteriores con el azar del estado y se ponen debajo.
- **Información pública:** `cambiadas: (number | null)[]` dice cuántas cambió cada uno en la mano, y `null` si aún no ha cambiado o no juega.
- **Vista:** la del Hold'em sin `comunes`, con `fase`, `cambiadas` y `asEnsenado`.
- **`ResultadoManoPokerCinco`:** el del Hold'em sin `comunes`.

### 3. IAs
- **Normal (`ia/poker-cinco-basica.ts`):**
  - **Antes del descarte**, según su jugada:
    - trío o mejor sube a 3 ciegas grandes (o 3 veces la apuesta);
    - doble pareja abre subiendo y, si ya subieron, iguala;
    - pareja de J o mejor iguala o abre;
    - pareja baja, o 4 cartas de color o de escalera abierta, sigue si el precio lo compensa;
    - el resto pasa o se retira;
    - con menos de 10 ciegas grandes, va all-in con pareja de J o mejor y, si no, pasa o se retira.
  - **Descarte:**
    - con escalera, color, full, póker o escalera de color, no cambia;
    - con trío, cambia 2; con doble pareja, 1; con pareja, 3;
    - con 4 al color o a escalera abierta, cambia 1;
    - sin nada: si tiene As, se queda con él y cambia 4; si no, se queda con las dos más altas y cambia 3.
  - **Después del descarte:**
    - escalera o mejor apuesta o sube unos tres cuartos del bote;
    - trío o doble pareja apuesta medio bote si nadie apostó y, si no, sigue si compensa;
    - pareja sigue si compensa;
    - el resto pasa o se retira.
- **Difícil (experta):** `equityPokerCinco` reparte al azar, un número fijo de veces, las cinco cartas de cada rival que sigue en la mano.
  - **Antes del descarte:**
    - simula también los cambios: los de cada rival con la regla de la normal, y el suyo con la que hará;
    - a quien ha subido le da manos de pareja o mejor (con unos intentos).
  - **Después del descarte:**
    - a quien no cambió ninguna carta le da una mano hecha (escalera o mejor) si sale en los intentos;
    - a quien enseñó un As, una mano con ese As.
  - **Decisión:** la misma regla que la experta del Hold'em (probabilidades del bote, subida entre medio bote y el bote, y farol ocasional).
  - **Descarte:** decide como la normal.
- **Niveles:** `IAS.pokerCinco` = `{ facil: conErrores(normal), normal, dificil: experta }`, sin `simulable`, como el Hold'em.

### 4. Cliente
- **`MesaPokerCinco.svelte`:** copia de `MesaHoldem.svelte`, sin las cartas comunes, y con:
  - **en el descarte:** las cartas de la mano se marcan y desmarcan, y el botón «Cambiar N» (o «Servido», con 0) juega `{ tipo: 'cambiar', cartas }`. Solo se pueden marcar combinaciones legales: 4 únicamente si la que queda es un As;
  - **en cada asiento:** «Cambia N», «Servido» y el As enseñado;
  - **la mano:** ordenada de mayor a menor.
- **Resumen:** se reutiliza `ResumenHoldem.svelte`, que ya oculta las comunes cuando no hay.
- **Opciones:** jugadores, de 2 a 6.
- **Fin:** el bloque del Hold'em (orden de eliminación).
- **Guía y ejemplos:** reutiliza las manos del póker (`jugadas`) del Hold'em, más un ejemplo de descarte (`antesDespues`) comprobado con `valorMano5`.

## Risks / Trade-offs

- **Lógica de apuestas duplicada** → se acepta para no tocar el Hold'em. Los tests de apuestas del Hold'em se repiten aquí con las mismas situaciones.
- **El difícil puede ser lento con 6 jugadores** antes del descarte, al simular también los cambios de los rivales → se limitan las simulaciones (150 antes y 300 después), y lo comprueba la prueba de tiempo.
