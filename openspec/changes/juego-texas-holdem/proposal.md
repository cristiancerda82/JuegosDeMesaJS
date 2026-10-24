## Why

El Texas Hold'em es el póker más jugado del mundo y el gran ausente de la suite. Es distinto de todo lo que hay: no se gana por bazas ni por combinaciones bajadas, sino apostando con información oculta. Hay que decidir cuánto vale tu mano frente a las cartas comunes, cuánto cuesta seguir y cuándo apretar. Aprovecha las fichas y apuestas del Blackjack y la Siete y media, y su formato de torneo, con ciegas que suben y jugadores eliminados, le da un final claro a cada partida.

## What Changes

- Nuevo juego **Texas Hold'em** sin límite, jugable contra la IA y en red, de 2 a 6 jugadores (4 por defecto), cada uno por su cuenta, con la baraja francesa de 52 cartas:
  - **Torneo:** cada jugador empieza con 100 fichas. Las ciegas empiezan en 1/2 y suben cada 10 manos (2/4, 3/6, 5/10, 10/20, 15/30, 25/50, 50/100…). Quien se queda sin fichas queda eliminado, y gana el último que queda.
  - **Botón y ciegas:** el botón pasa cada mano al siguiente jugador que sigue en la partida. La ciega pequeña es el siguiente al botón y la grande el de después; con 2 jugadores, el botón pone la pequeña.
  - **Reparto y rondas:** dos cartas tapadas a cada jugador, y cuatro rondas de apuestas: antes del flop, flop (3 cartas comunes), turn (1) y river (1). Antes del flop empieza el de después de la ciega grande; en las demás rondas, el primero que sigue en la mano después del botón.
  - **Acciones:** retirarse, pasar (si no hay nada que igualar), igualar, apostar o subir a cualquier cantidad entre el mínimo y todas sus fichas (all-in). La subida mínima es la última subida de la ronda, y como poco la ciega grande. Un all-in que no llega a una subida completa no reabre las apuestas a quien ya había actuado.
  - **Botes secundarios:** si alguien va all-in, lo que los demás apuestan por encima va a botes aparte, en los que solo participan quienes lo cubren.
  - **Fin de la mano:** si todos menos uno se retiran, ese se lleva el bote sin enseñar. Si no, tras el river (o en cuanto ya nadie puede apostar, repartiendo las cartas comunes que falten) se enseñan las manos y cada bote se lo lleva la mejor mano de cinco cartas entre sus dos y las cinco comunes de quienes participan en él. Los empates se reparten, y la ficha que sobra va al primero después del botón.
  - **Manos**, de mayor a menor: escalera de color, póker, full, color, escalera (el As cuenta alto o bajo: A-2-3-4-5), trío, doble pareja, pareja y carta alta, con desempate por las cartas.
- **IA del Texas Hold'em en los tres niveles:**
  - la normal juega por la fuerza de su mano: antes del flop, según sus dos cartas; después, según la jugada que tiene y sus proyectos de color o escalera, con apuestas de medio bote a bote;
  - la fácil se equivoca a veces;
  - la difícil estima su probabilidad de ganar simulando al azar las cartas que no ve, la compara con lo que le cuesta seguir frente al bote, apuesta fuerte con buenas manos y a veces va de farol.
- El servidor de salas admite el Texas Hold'em como un juego más en red, de 2 a 6 asientos.
- **Cliente:**
  - el Texas Hold'em en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa propia: los rivales con sus fichas, su apuesta, si se han retirado o van all-in y el botón; en el centro las cartas comunes y los botes; abajo las dos cartas propias y los botones «Retirarse», «Pasar» o «Igualar» y «Apostar» o «Subir», con un selector de cantidad y atajos (mínimo, medio bote, bote, all-in);
  - el resumen de cada mano con las manos enseñadas, su jugada y quién se lleva cada bote; el fin de partida con la clasificación y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - límite fijo y límite de bote;
  - partidas de dinero sin eliminación (cash);
  - antes (ante), reentradas y mesas múltiples;
  - enseñar las cartas voluntariamente al ganar sin showdown.

## Capabilities

### New Capabilities
- `juego-texas-holdem`: reglas del Texas Hold'em:
  - torneo, ciegas y botón;
  - reparto y rondas de apuestas;
  - acciones sin límite y all-in;
  - botes secundarios;
  - showdown y valor de las manos;
  - eliminación y fin de partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Texas Hold'em.
- `niveles-ia`: el Texas Hold'em entra en la lista de juegos con tres niveles; su difícil no simula partidas con la normal, sino que estima su probabilidad de ganar con las cartas que no ve, y no necesita reconstruir el estado.
- `mesa-cliente`: el menú incluye el Texas Hold'em con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/holdem.ts` y `juegos/holdem-manos.ts` (evaluar la mejor mano de cinco entre siete), `ia/holdem-basica.ts` (la normal y la difícil), con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaHoldem.svelte` y `ResumenHoldem.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - sin límite;
  - de 2 a 6 jugadores;
  - torneo hasta que quede uno;
  - la difícil estima su probabilidad de ganar.
