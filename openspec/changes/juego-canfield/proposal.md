## Why

El Canfield es uno de los solitarios clásicos más conocidos, y tiene un giro que ningún solitario de la suite tiene: las fundaciones no empiezan por el As, sino por una carta al azar que marca la base para las cuatro, y tanto las fundaciones como las columnas dan la vuelta (después de la K va el As). Además tiene una reserva de 13 cartas que hay que ir sacando, con solo cuatro columnas. Es rápido, difícil de ganar y reutiliza casi todo lo del Klondike: mazo y descarte, columnas, fundaciones, deshacer, pista y récords.

## What Changes

- Nuevo solitario **Canfield**, con baraja francesa de 52 cartas:
  - **Reparto:**
    - 13 cartas forman la **reserva**, con solo la de arriba boca arriba;
    - la siguiente va a la primera fundación y su número es la **base** de las cuatro fundaciones;
    - 4 columnas reciben una carta boca arriba cada una;
    - las 34 restantes forman el mazo.
  - **Fundaciones:** cada una empieza con una carta del número base y sube por palo, dando la vuelta: con base 9, la fundación de picas va 9, 10, J, Q, K, A, 2… hasta el 8.
  - **Columnas:** se construye bajando y alternando colores, también con vuelta (una K puede ir sobre un As). Se puede mover una carta o un tramo ordenado desde cualquier punto de una columna.
  - **Huecos:** una columna vacía se llena sola en el acto con la carta de arriba de la reserva. Si la reserva está vacía, el hueco se puede ocupar con cualquier carta o tramo, a mano.
  - **Reserva:** su carta de arriba se puede jugar a una fundación o a una columna, y la siguiente se pone boca arriba.
  - **Mazo:** se roba de 3 en 3 (por defecto) o de 1 en 1, según la opción, y se recicla sin límite.
  - **Autocompletar:** cuando el mazo, el descarte y la reserva están vacíos y las cartas de las columnas pueden subir una tras otra, todo sube a las fundaciones.
  - **Victoria:** las 52 cartas en las fundaciones. Movimientos, tiempo, deshacer y abandonar, como en el Klondike.
- **Pista:** como la del Klondike, sacando cartas de la reserva antes que del descarte.
- **Récords:** el Canfield guarda el mejor tiempo y los menos movimientos, como el resto de solitarios.
- **Cliente:**
  - el Canfield en el menú, con la opción de robar de 3 o de 1;
  - una mesa propia con la reserva, el mazo y el descarte, las 4 fundaciones con la base a la vista y las 4 columnas;
  - mover arrastrando o tocando, doble toque para subir a las fundaciones, deshacer, pista, autocompletar, abandonar y el aviso de partida atascada;
  - el fin de partida con movimientos y tiempo, y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - límite de vueltas al mazo;
  - mover solo columnas enteras;
  - llenar los huecos a mano mientras quede reserva;
  - puntuación por cartas en las fundaciones (la del Canfield de casino).

## Capabilities

### New Capabilities
- `juego-canfield`: reglas del Canfield:
  - reparto con reserva y base;
  - fundaciones y columnas con vuelta;
  - huecos llenados con la reserva;
  - mazo, descarte y reciclar;
  - deshacer, autocompletar, victoria y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: el Canfield tiene su pista, y su partida atascada se detecta como en el resto de solitarios.
- `estadisticas`: el Canfield entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye el Canfield con sus opciones, su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevo `juegos/canfield.ts`, con sus tests y la suite genérica del contrato;
  - `pistaCanfield` en `ia/pistas.ts`.
- `packages/server`: ningún cambio (los solitarios no se juegan en red).
- `packages/client`:
  - nueva `MesaCanfield.svelte`, a partir de la del Klondike;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - robar de 3 por defecto y de 1 como opción;
  - mover cualquier tramo ordenado;
  - huecos llenados solos con la reserva.
