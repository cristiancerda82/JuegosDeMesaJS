## Why

La Belle Lucie («los abanicos») es un solitario clásico francés de una baraja con todas las cartas a la vista desde el principio. El reto no es descubrir cartas, sino ordenar bien las jugadas, aprovechando los dos rebarajes y la «merci» final. Es distinto de los solitarios de columnas que ya tiene la suite.

## What Changes

- Nuevo solitario **La Belle Lucie**, con la baraja francesa de 52 cartas.
  - **Reparto:** 17 abanicos de 3 cartas y uno de 1, todas boca arriba. Solo se puede mover la carta de arriba de cada abanico.
  - **Fundaciones:** 4, una por palo, del As al K.
  - **Mover:** la carta de arriba de un abanico va a su fundación o sobre la de arriba de otro abanico si es la siguiente más baja del mismo palo (el 6 de picas sobre el 7 de picas). Los abanicos vacíos no se rellenan.
  - **Rebarajes:** dos veces por partida, el jugador puede recoger todas las cartas de los abanicos, barajarlas y repartirlas de nuevo de tres en tres.
  - **Merci:** una sola vez, después del último rebaraje, el jugador puede sacar una carta de debajo de un abanico y ponerla arriba de ese abanico.
  - **Victoria:** las 52 cartas en las fundaciones. Movimientos, tiempo, deshacer y abandonar, como en el resto de solitarios.
- **Pista:**
  - sube cartas a las fundaciones;
  - mueve cartas que dejan libre otra que puede subir o encajar;
  - si no hay nada útil, sugiere la merci (cuando deja subir una carta) o rebarajar.
- **Récords:** el mejor tiempo y los menos movimientos, como en el resto de solitarios.
- **Cliente:**
  - La Belle Lucie en el menú;
  - una mesa con las 4 fundaciones y los 18 abanicos en una rejilla que cabe en 360 px;
  - mover tocando la carta y el destino (o tocando dos veces para subirla a la fundación);
  - los botones de rebarajar (con los que quedan), merci, deshacer, pista y abandonar, y el aviso de partida atascada;
  - el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:** las variantes Trefoil (Ases en las fundaciones desde el principio) y Shamrocks, los rebarajes ilimitados y mover grupos de cartas.

## Capabilities

### New Capabilities
- `juego-belle-lucie`: reglas de La Belle Lucie:
  - reparto en abanicos;
  - fundaciones;
  - mover la carta de arriba;
  - rebarajes;
  - merci;
  - deshacer, victoria y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: La Belle Lucie tiene su pista, y su partida atascada se detecta como en el resto de solitarios.
- `estadisticas`: La Belle Lucie entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye La Belle Lucie con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevo `juegos/belle-lucie.ts`, con sus tests y la suite genérica del contrato;
  - `pistaBelleLucie` en `ia/pistas.ts`.
- `packages/server`: ningún cambio (los solitarios no se juegan en red).
- `packages/client`:
  - nueva `MesaBelleLucie.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - dos rebarajes;
  - una merci tras el último rebaraje;
  - construir del mismo palo moviendo una sola carta.
