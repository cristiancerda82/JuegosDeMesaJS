## Why

El Barbu (y su pariente alemán, el Rentz) es un compendio de juegos: en cada mano, quien reparte elige uno de siete contratos, casi todos de evitar bazas o cartas, uno de ganarlas y un dominó. Es cada uno contra todos, con 52 cartas, y obliga a jugar la misma mano de formas opuestas según el contrato. Aprovecha lo aprendido en Corazones y Sevens y añade un juego sin parejas para cuatro.

## What Changes

- Nuevo juego **Barbu** para 4 jugadores, cada uno contra todos, jugable contra la IA y en red.
  - **Baraja:** 52 cartas francesas, del 2 al As; 13 cartas a cada uno.
  - **Contratos:** quien reparte elige el contrato de la mano entre los que aún no se han jugado, y sale en la primera baza. Los siete suman cero:
    - **Sin bazas:** −2 por baza.
    - **Sin corazones:** −2 por corazón y −6 por el As de corazones. No se puede salir de corazones mientras se tengan otros palos.
    - **Sin damas:** −6 por dama.
    - **Sin el Rey de corazones:**
      - −20 para quien se lo lleva;
      - no se puede salir de corazones mientras se tengan otros palos;
      - quien no puede seguir el palo y tiene el Rey de corazones debe echarlo.
    - **Sin las dos últimas:** −10 por la penúltima baza y −20 por la última.
    - **Triunfo:** quien reparte elige el palo de triunfo; +5 por baza.
    - **Dominó:** se juega desde las Jotas hacia arriba y hacia abajo en cada palo; +45, +20, +5 y −5 según el orden en que se acaba la mano.
  - **Bazas:** hay que seguir el palo. En el triunfo, sin el palo hay que fallar y, si ya hay triunfo en la baza, subir si se puede. En los contratos de evitar cartas, la mano acaba en cuanto se han llevado todas las cartas que penalizan.
  - **Partida:** 7 manos; tras ellas se han jugado los siete contratos una vez. Gana quien más puntos tiene.
- **IA del Barbu en los tres niveles:**
  - **Normal:** elige el contrato con la mejor estimación para su mano; en los contratos negativos evita ganar bazas y se descarta de las cartas que penalizan; en el triunfo gana con lo justo; en el dominó abre las cartas que le dejan seguir jugando.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** elige el contrato como la normal y simula sus jugadas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Barbu como un juego más en red.
- **Cliente:**
  - el Barbu en el menú;
  - una mesa de bazas para cuatro con la elección del contrato y del triunfo, el contrato y la penalización de cada uno en la mano;
  - una mesa de dominó para ese contrato;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - los dobles;
  - la partida completa de 28 manos;
  - elegir el número del dominó: se empieza siempre por las Jotas.

## Capabilities

### New Capabilities
- `juego-barbu`: reglas del Barbu:
  - baraja y reparto;
  - elección del contrato;
  - los seis contratos de bazas con sus restricciones y puntos;
  - el dominó;
  - partida a 7 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Barbu.
- `niveles-ia`: el Barbu entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Barbu con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/barbu.ts`, `ia/barbu-basica.ts` e `ia/reconstruir/barbu.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBarbu.svelte`, `DominoBarbu.svelte` y `ResumenBarbu.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la partida corta de 7 manos;
  - sin dobles;
  - los 7 contratos clásicos.
