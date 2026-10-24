## Why

El Klondike es el solitario más conocido de la suite, pero buena parte de la partida se va en pasar el mazo. El Yukon es su primo sin mazo: todas las cartas se reparten en la mesa desde el principio y se puede mover cualquier carta boca arriba con todo lo que tenga encima, aunque no esté ordenado. Es más de pensar y menos de suerte, y reutiliza casi todo lo del Klondike: columnas, fundaciones, deshacer, pista y récords. Su variante de construir por palo, el Solitario ruso, da además un reto bastante más difícil.

## What Changes

- Nuevo solitario **Yukon**, con baraja francesa de 52 cartas:
  - **Reparto:** 7 columnas. La primera tiene 1 carta boca arriba; cada una de las otras seis tiene, de la segunda a la séptima, de 1 a 6 cartas boca abajo y 5 boca arriba encima. No hay mazo; las 4 fundaciones empiezan vacías.
  - **Mover:** cualquier carta boca arriba de una columna puede moverse a otra, con todas las que tiene encima, aunque no estén ordenadas, si la carta movida va sobre una de valor uno más:
    - en el **Yukon clásico** (por defecto), de color contrario;
    - en el **Solitario ruso** (opción), del mismo palo.
  - **Columna vacía:** solo puede ocuparla un rey, con lo que tenga encima.
  - **Fundaciones:** por palo, del as al rey. Sube la última carta de una columna, y la de arriba de una fundación puede volver a una columna.
  - **Descubrir:** al quedar boca abajo la última carta de una columna, se vuelve boca arriba.
  - **Autocompletar:** cuando no quedan cartas boca abajo y cada columna está ordenada según la regla de construir, todo sube a las fundaciones.
  - **Victoria:** las 52 cartas en las fundaciones. Movimientos, tiempo, deshacer y abandonar, como en el Klondike.
- **Pista:** como la del Klondike: subir a las fundaciones, descubrir una carta, vaciar una columna o dejar arriba una carta que sube a las fundaciones; sin movimientos de ida y vuelta.
- **Récords:** el Yukon guarda el mejor tiempo y los menos movimientos, como el resto de solitarios.
- **Cliente:**
  - el Yukon en el menú, con la opción de construir por colores alternos o por palo;
  - una mesa propia con las 7 columnas y las 4 fundaciones, arrastrar o tocar para mover un grupo, doble toque para subir a las fundaciones, deshacer, pista, autocompletar, abandonar y el aviso de partida atascada;
  - el fin de partida con movimientos y tiempo, y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - otras variantes (Alaska, Moosehide);
  - cualquier carta en una columna vacía;
  - partidas con solución garantizada.

## Capabilities

### New Capabilities
- `juego-yukon`: reglas del Yukon:
  - reparto;
  - mover grupos, columnas vacías y fundaciones;
  - descubrir, deshacer y autocompletar;
  - victoria, contadores y abandonar;
  - variante del Solitario ruso;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: el Yukon tiene su pista, y su partida atascada se detecta como en el resto de solitarios.
- `estadisticas`: el Yukon entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye el Yukon con sus opciones, su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevo `juegos/yukon.ts`, con sus tests y la suite genérica del contrato;
  - `pistaYukon` en `ia/pistas.ts`.
- `packages/server`: ningún cambio (los solitarios no se juegan en red).
- `packages/client`:
  - nueva `MesaYukon.svelte`, a partir de la del Klondike;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - colores alternos por defecto y el Solitario ruso como opción;
  - solo un rey en una columna vacía;
  - las ayudas del Klondike.
