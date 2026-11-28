## Context

Núñez Elvira describe el Rams con una «partida tipo», porque «no existen reglas preestablecidas»:
- baraja de póquer de 32 cartas, del As al 7; de 3 a 8 jugadores;
- con 3, 4 o 5, 5 cartas a cada uno (dos y tres, o tres y dos) y otras 5 aparte, la niña; con 6 o 7, 4 cartas y niña (con 7, el que reparte se queda el pinte); con 8, 4 cartas y sin niña;
- cada jugador pone 5 fichas en la canasta y tiene otras 5 propias; se quita una por baza y, si juega y no hace ninguna, está «ramse» y toma 5 de la canasta;
- desde la derecha del que reparte, cada uno dice «Rams» o «Paso»; el primero puede cambiar su mano por la niña y, si no, el siguiente, y así hasta el último, menos el que reparte; si todos pasan, el que reparte gana la mano;
- el que reparte descarta una carta y se queda el pinte;
- se sube sobre el palo jugado si se puede; si no, una más baja del palo; sin el palo, se falla; si ya se falló, se sube con un triunfo mayor y, si no se puede, se echa triunfo igualmente;
- quien se queda sin fichas se retira; cuando quedan dos, el primero que acaba gana y el otro pierde;
- variantes: el Rams general y el triunfo de auxilio.

La suite ya tiene `cartasObligadas` (con `sobrefalloLibre: false`, sin poder superar el fallo hay que echar triunfo), la mesa de bazas (`MesaBazas`) para 3 a 7 y el pinte visible en la mano del que reparte (Manilla).

## Goals / Non-Goals

**Goals:**
- El Rams de Núñez para 3 a 6, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- 7 y 8 jugadores: la mesa de bazas no tiene sitio para 7 rivales en el móvil, y con 8 no hay niña.
- El Rams general y el triunfo de auxilio, que el libro presenta como variantes.
- Las fórmulas de reparto de las apuestas en dinero.

## Decisions

### 1. Estado y acciones (`juegos/rams.ts`)
- **Config:** `{ jugadores: 3 | 4 | 5 | 6 }`; por defecto, 4. Cada uno empieza con `FICHAS_RAMS` = 5.
- **Valores:** `VALORES_RAMS`, el orden As, Rey, Dama, Jota, 10, 9, 8 y 7, sin puntos.
- **En juego:** reciben cartas solo los que tienen fichas (`enJuego`). Con 2 a 5 en juego, 5 cartas cada uno; con 6, 4. La niña tiene las mismas cartas que cada mano (el libro no dice cuántas con 6; con 5 y manos de 4, quien la cogiera jugaría una baza de más), y después va el pinte.
- **Canasta:** empieza con 5 fichas por jugador. El ramsé toma de ella 5, o las que queden; las fichas que se quitan con las bazas van aparte, como dice el libro («existen dos clases de fichas»). Así la partida siempre termina: cuando la canasta se vacía, cada mano quita al menos una ficha y ninguna vuelve.
- **Repartidor:** el primero empieza repartiendo el último asiento, así habla el 0. Después reparte el siguiente que esté en juego.
- **Fases y acciones:**
  - `hablar`: `{ tipo: 'rams' }`, `{ tipo: 'paso' }` o `{ tipo: 'nina' }` (si nadie la ha cogido; cambia la mano y juega). Habla cada uno en juego desde el siguiente al que reparte, menos el que reparte, que siempre juega.
  - `descartar`: el que reparte elige la carta que deja, `{ tipo: 'descartar'; carta }`, y se queda el pinte.
  - `jugar`: `{ tipo: 'jugar'; carta }` entre los que juegan.
- **Si todos pasan:** el que reparte gana la mano sin descartar ni jugar: se quita una ficha por cada baza de la mano.
- **Obligaciones:** `cartasObligadas` con `VALORES_RAMS`, `montarSobreCompanero: true` (no hay compañeros) y `sobrefalloLibre: false`.
- **Cierre de la mano:** cada uno que jugó se quita una ficha por baza (sin bajar de 0); quien jugó sin hacer ninguna toma 5 de la canasta, por orden de asiento, mientras queden. Se anota en qué mano se quedó cada uno sin fichas.
- **Fin:** cuando solo uno (o ninguno) tiene fichas. Ganan los que se quedaron sin fichas en la primera mano en que alguien lo hizo; `puntos` es, para cada uno, el número de manos que tardó en quitarse las fichas en negativo, y para el que pierde, sus fichas en negativo menos las manos jugadas.
- **Vista:**
  - la mano propia, cuántas cartas tienen los demás, la niña (cuántas cartas quedan y quién la cogió);
  - el pinte: en la mesa hasta que el que reparte se lo queda, y después en su mano a la vista hasta que lo juega;
  - lo que ha dicho cada uno, las bazas de la mano y las bazas jugadas;
  - las fichas de cada uno y los resultados de las manos.

### 2. IAs
- **Normal (`ia/rams-basica.ts`):**
  - **Bazas esperadas:** 1 por cada As; 0,8 por el Rey y 0,5 por la Dama de triunfo; 0,5 por cada triunfo más allá del segundo; 0,5 por cada Rey de otro palo con otra carta del palo.
  - **Hablar:** juega si espera al menos 1 baza, o si espera al menos 0,5 y le quedan pocas fichas (2 o menos). Con una mano que no llega a 0,3 bazas, coge la niña si puede.
  - **Descartar:** la carta más baja que no sea triunfo.
  - **Jugar:** al salir, la carta más alta de su mejor palo (los Ases primero, luego los triunfos altos); al responder, si es el último o la baza aún se puede ganar, gana con la carta más barata que la gana; si no, echa la más baja.
- **Difícil (`ia/reconstruir/rams.ts`):**
  - **Reconstrucción:** las manos ajenas, la niña, el descarte del que reparte y el resto de la baraja al azar entre las cartas que no se ven, con el pinte en la mano del que reparte y lo que se sabe por las obligaciones (quien no siguió el palo no lo tiene; quien no echó triunfo sin tener el palo no tiene triunfos).
  - **Valoración:** las fichas que se quita (o se carga) en la mano frente a la media de los demás que juegan, más `bonoPartida`.
- **Deducción común:** `topesPorObligaciones` preparaba solo los palos españoles; ahora prepara también los franceses, sin cambiar lo que deduce para los demás juegos.
- **Mediciones** (partidas de 4; ganar es quedarse sin fichas el primero):

  | Duelo | Partidas ganadas |
  |---|---|
  | Azar contra el azar | 64 de 200 |
  | Normal contra el azar | 103 de 200 |
  | Normal contra la normal | 48 de 200 |
  | Difícil contra la normal | 65 de 200, con 49 ms como máximo por decisión |

  La difícil usa 600 simulaciones por decisión (60 reconstrucciones): cada mano es corta y se simula deprisa.

### 3. Cliente
- **`MesaRams.svelte`:** sobre `MesaBazas`, para 3 a 6:
  - junto a cada jugador, sus fichas y lo que ha dicho («Juega», «Pasa», «Niña», «Reparte»), o «Sin fichas» si se ha retirado;
  - el pinte en la mesa y, después, a la vista en la mano del que reparte;
  - en la fase de hablar, los botones «¡Rams!», «Paso» y «Coger la niña»; en la de descartar, el que reparte toca la carta que deja;
  - en la barra, el triunfo, la mano y tus fichas.
- **`ResumenRams.svelte`:** las bazas y las fichas de cada uno en la mano, y quién queda ramsé o se retira.
- **Fin:** la clasificación por la mano en que se quedó cada uno sin fichas.
- **Menú:** familia «Envite y apuestas», con 9 juegos.
- **Guía:** ejemplos comprobados con el motor (una baza en la que hay que echar triunfo sin poder superar el fallo, y la cuenta de las fichas de una mano) y la historia.

## Risks / Trade-offs

- **Reglas sin canon** → el libro lo avisa; se sigue su partida tipo.
- **Partidas largas** → con 6 jugadores y ramsés, la partida puede durar muchas manos; cada mano son 4 o 5 bazas, así que se juega deprisa.
- **El que reparte siempre juega** → el libro no lo dice, pero da la mano al que reparte cuando todos pasan, que solo tiene sentido si él juega.
