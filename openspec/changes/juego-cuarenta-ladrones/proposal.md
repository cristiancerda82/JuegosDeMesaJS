## Why

Cuarenta ladrones es el gran solitario de dos barajas, y uno de los más difíciles de ganar: diez columnas con todas las cartas a la vista, ocho fundaciones y un mazo que solo se pasa una vez. Es distinto de los que ya hay en la suite porque se construye por palo y se mueve una sola carta, así que cada columna vacía vale oro. Reutiliza casi todo de los otros solitarios: las cartas con copia del Spider; el mazo y el descarte del Klondike; los huecos y los tramos del FreeCell; y deshacer, la pista y los récords.

## What Changes

- Nuevo solitario **Cuarenta ladrones**, con dos barajas francesas (104 cartas):
  - **Reparto:** 10 columnas de 4 cartas, todas boca arriba; las 64 restantes forman el mazo.
  - **Fundaciones:** 8, dos por palo, del As a la K.
  - **Columnas:** se construye bajando de uno en uno y del mismo palo. Una columna vacía admite cualquier carta.
  - **Mover:** se mueve una sola carta. Como en el FreeCell, la mesa deja mover un tramo ordenado del mismo palo si cabe haciéndolo carta a carta por las columnas vacías: como mucho 2 elevado al número de columnas vacías, o la mitad si el destino es una de ellas.
  - **Mazo:** se roba de una en una al descarte, sin volver a pasarlo. Solo la carta de arriba del descarte se puede jugar.
  - **Deshacer, autocompletar y abandonar:** como en el resto de solitarios. Autocompletar está disponible cuando el mazo y el descarte están vacíos y todas las cartas de las columnas pueden subir.
  - **Victoria:** las 104 cartas en las fundaciones, con movimientos y tiempo.
- **Pista:** como la del Klondike, y además prefiere sacar la carta del descarte o vaciar una columna.
- **Récords:** guarda el mejor tiempo y los menos movimientos, como el resto de solitarios.
- **Cliente:**
  - Cuarenta ladrones en el menú;
  - una mesa con el mazo, el descarte, las 8 fundaciones y las 10 columnas, que cabe en el móvil;
  - mover arrastrando o tocando, doble toque para subir a las fundaciones, deshacer, pista, autocompletar, abandonar y el aviso de partida atascada;
  - el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - pasar el mazo más de una vez;
  - las variantes alternando colores;
  - la puntuación.

## Capabilities

### New Capabilities
- `juego-cuarenta-ladrones`: reglas de Cuarenta ladrones:
  - reparto;
  - fundaciones y columnas por palo;
  - mover una carta y los tramos por los huecos;
  - mazo y descarte;
  - deshacer, autocompletar, victoria y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: Cuarenta ladrones tiene su pista, y su partida atascada se detecta como en el resto de solitarios.
- `estadisticas`: Cuarenta ladrones entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye Cuarenta ladrones con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevo `juegos/cuarenta-ladrones.ts`, con sus tests y la suite genérica del contrato;
  - `pistaCuarentaLadrones` en `ia/pistas.ts`.
- `packages/server`: ningún cambio (los solitarios no se juegan en red).
- `packages/client`:
  - nueva `MesaCuarentaLadrones.svelte`, a partir de las del Klondike y el Canfield;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - columnas por palo;
  - una sola vuelta al mazo;
  - una carta cada vez, con tramos si hay huecos.
