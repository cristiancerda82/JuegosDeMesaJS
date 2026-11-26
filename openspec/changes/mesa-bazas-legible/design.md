## Context

`MesaBazas.svelte` dibuja la mesa de más de 40 juegos de bazas:
- reparte los rivales con `lado()` en una fila de arriba y dos laterales;
- `Tapete.svelte` coloca cada carta de la baza según el lado de su jugador.

`lado()` solo conocía hasta 6 jugadores, y con 7 (el Oh Hell) devolvía `undefined` para tres rivales. Además, el centro (mazo y tapete) tiene un ancho mínimo, y con 5 o más jugadores en un móvil se salía de su columna por debajo de los laterales.

## Goals / Non-Goals

**Goals:**
- Nada se pisa con el máximo de jugadores de cada juego, desde 360 px.
- Se sabe siempre quién echó cada carta de la baza.

**Non-Goals:**
- Cambiar las mesas que no son la de bazas común (Chinchón, Siete y media…), que tienen su propio reparto.

## Decisions

### 1. Los lados con 7
Se añaden `arriba-centro-derecha` y `arriba-centro-izquierda`. La fila de arriba admite hasta cuatro rivales: `arriba-izquierda`, `arriba-centro-izquierda`, `arriba`, `arriba-centro-derecha` y `arriba-derecha`, en orden visual. Con 7, por orden de juego desde el jugador:
1. derecha;
2. arriba-derecha;
3. arriba-centro-derecha;
4. arriba-centro-izquierda;
5. arriba-izquierda;
6. izquierda.

### 2. La baza de 7, en anillo
Las cartas de la baza de 7 van en tres filas (desplazamientos en tamaños de carta):
- **abajo:** el jugador en el centro y los laterales a los lados;
- **en medio:** los de las esquinas de arriba, a los lados;
- **arriba:** los dos del centro.

Así cada carta queda hacia su jugador y ninguna tapa el índice de otra. Para que quepan tres filas en el alto del tapete, las cartas de la mesa pasan a 0,66 del ancho de carta (0,75 con 4 a 6).

### 3. Que el centro quepa
- **Laterales:** con 5 o más, el nombre de los laterales tiene un máximo de 18vw (antes 22vw) y letra de 0,8rem. Es lo que faltaba para que el mazo y el tapete quepan en su columna a 360 y a 412 px.
- **Dorsos de arriba:** con 7, son más pequeños (`--ancho-rival` de 4,5vw), para que los cuatro rivales de arriba quepan sin pisarse.

### 4. El autor de cada carta
- **Etiqueta:** con 3 o más jugadores, todas las cartas de la baza llevan la etiqueta con el nombre. La última conserva su resalte y `data-testid="ultima-jugada"`; las demás llevan un fondo oscuro, más discreto.
- **Abreviatura:** con 5 o más las cartas son pequeñas, y «Rival 3» no cabe («Riv…» no distingue a nadie). Por eso, un nombre que termina en número se abrevia a la inicial y el número («R3»), con el nombre completo en `title`. Los nombres de las partidas en red no terminan en número y se dejan como están (se recortan si no caben).

### 5. «Ver baza»
- **Botón:** en `MesaBazas`, mientras `vista.mesa` tiene cartas, ocupa el sitio de «Última baza», que solo sale con la mesa vacía.
- **Panel:** un diálogo con las cartas en orden, a 64 px, y el nombre completo debajo de cada una. Lee `vista.mesa`, así que se actualiza si llega otra carta, y se cierra solo al recogerse la baza.
- **Estado:** no toca el estado del juego.

### 6. La prueba
`e2e/mesa-bazas-solapes.spec.ts` toma las cajas de:
- cada `.nombre` y `.mano-rival` de los rivales;
- la mesa y el mazo;
- el nombre propio y la mano;
- cada carta de la baza.

Falla si dos cajas se cruzan más de 1 px, si una se sale de la pantalla o si un rival queda por debajo del nombre del jugador. Lo hace con:
- el máximo de jugadores de los juegos de bazas con más asientos y con mazo o muestra (Oh Hell 7, Polignac, Burro de bazas, Corazones y Julepe 6; Bourré, Tarot y Briscola Chiamata 5; Brisca y Tute 4), en los perfiles de escritorio y móvil;
- el Oh Hell de 7 en mitad de una baza;
- el Oh Hell de 7 en 412 × 915 con las apuestas hechas, que alargan el texto de cada rival.

Antes del arreglo, la prueba reproducía las capturas: los rivales 4 a 6 debajo del jugador, el Rival 1 sobre la mesa y el Rival 3 sobre el mazo.

## Risks / Trade-offs

- **Etiquetas en todas las cartas** → tapan algo más de la parte de abajo de cada carta, pero solo el índice invertido; el de arriba sigue a la vista, como pide la spec.
- **«R3» en lugar de «Rival 3»** → solo con 5 o más; el panel de «Ver baza» y el título de la etiqueta dan el nombre completo.
