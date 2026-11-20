## Why

La guía del Julepe ya cuenta que «en otros sitios el que reparte puede "bailarla": quedarse la muestra sin haber visto sus cartas. Y cuando solo juega uno, los demás defienden el bote entre todos». Son dos reglas caseras muy conocidas. Las dos le dan más peso al que reparte: la primera, una apuesta a ciegas; la segunda, la tarea de defender el bote frente al único que se atreve.

Las fuentes no coinciden en los detalles:
- **Bailarla:** ninguna dice qué gana quien la baila.
- **Defensa:** Ludoteka la llama «defensa de la baceta».

La suite toma esta forma, elegida con el usuario:
- **Bailarla:** quien la baila cobra doble y paga doble.
- **Defensa:** la defiende el que reparte, con 6 cartas, y no paga julepe si la pierde.

Es la sexta y última de las variantes que las guías solo mencionaban.

## What Changes

- **Opción «Bailarla» en el Julepe**, desactivada por defecto. Con ella activada, al empezar cada mano, antes de que nadie decida:
  - el que reparte, viendo solo la muestra, elige si la baila o mira sus cartas;
  - si la baila, juega la mano seguro y ve sus cartas al llegar el descarte;
  - cada baza suya vale el doble, sin pasar de lo que quede en el bote;
  - si no hace 2 bazas, paga julepe doble;
  - si mira, decide como siempre.
- **Opción «Defensa del bote»**, desactivada por defecto. Con ella activada, cuando antes del que reparte solo juega uno, el que reparte, obligado a jugar como hasta ahora, defiende el bote:
  - recibe una sexta carta del mazo, se descarta de una y no roba;
  - si hace 2 bazas o más, cobra como siempre;
  - si no, no paga julepe.
  - Si la bailó, ya juega por su cuenta y no defiende.
- **Lo demás no cambia:** el reparto, la puesta, las bazas, el cobro de los demás, el julepe de los demás y el fin de la partida. Sin las opciones, las partidas guardadas y las salas sin ellas siguen como siempre.
- **IA:**
  - **Normal:**
    - la baila si la muestra es un As o un Tres;
    - al defender, se descarta de su peor carta: la más baja de las que no son triunfo, As ni Tres; si todas lo son, la más baja.
  - **Difícil:** bailarla lo decide la normal, como los descartes.
- **Cliente:**
  - las dos casillas en las opciones del Julepe, en local y al crear una sala en red;
  - en la mesa, con «Bailarla», el que reparte tiene los botones «La bailo» y «Miro mis cartas», y no ve sus cartas hasta elegir;
  - todos ven si la bailó o si defiende el bote;
  - el descarte del defensor pide una sola carta;
  - la línea «En otros sitios…» de la guía pasa a explicar las dos variantes y en qué opción se activan.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-julepe`: bailarla y la defensa del bote.
- `ia-jugadores`: la IA básica del Julepe con las dos opciones.
- `mesa-cliente`: las opciones, la mesa con las dos variantes y la guía.

## Impact

- `packages/engine`:
  - `juegos/julepe.ts`:
    - la config;
    - la fase y las acciones de bailarla;
    - la sexta carta y el descarte del defensor;
    - el cobro;
    - la vista;
  - `ia/julepe-basica.ts` e `ia/reconstruir/julepe.ts`;
  - los tests.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - `MesaJulepe.svelte`;
  - las opciones;
  - los textos y la guía;
  - el E2E.
