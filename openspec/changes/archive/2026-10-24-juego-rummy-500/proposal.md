## Why

El Gin Rummy es un duelo en el que las combinaciones se guardan en la mano hasta cerrar. El Rummy 500 es su primo de mesa abierta, de 2 a 4 jugadores: las combinaciones se bajan en cuanto se tienen y suman puntos a quien las baja, cualquiera puede añadir cartas a las de los demás, y el descarte está abierto, así que puedes llevarte varias cartas de golpe si te sirve la de más abajo. Combina lo mejor del Remigio (bajar y añadir en la mesa) con la baraja francesa del Gin Rummy, y la partida a 500 premia bajar mucho y pronto.

## What Changes

- Nuevo juego **Rummy 500**, jugable contra la IA y en red, de 2 a 4 jugadores (2 por defecto) cada uno por su cuenta, con la baraja francesa de 52 cartas:
  - **Reparto:** 13 cartas a cada uno con 2 jugadores, y 7 con 3 o 4. La siguiente se pone boca arriba como primera carta del descarte y el resto es el mazo. El reparto rota.
  - **Descarte abierto:** las cartas del descarte se ven todas, en orden.
  - **Robar:** la carta de arriba del mazo, o cualquier carta del descarte junto con todas las que tiene encima. Si se coge más de una, la de más abajo hay que usarla en ese mismo turno, bajándola en una combinación o añadiéndola a una de la mesa. No se puede descartar en el mismo turno la carta cogida de arriba del descarte.
  - **Combinaciones:** grupos de 3 o 4 cartas del mismo número y escaleras de 3 o más cartas seguidas del mismo palo. El As va abajo (A-2-3) o arriba (Q-K-A), pero no da la vuelta (K-A-2 no).
  - **Bajar y añadir:** en su turno, tras robar, cada jugador puede bajar combinaciones de su mano y añadir cartas a cualquier combinación de la mesa, propia o ajena. Cada carta cuenta para quien la pone.
  - **Descartar:** el turno termina descartando una carta. Para quedarse sin cartas hay que acabar descartando, así que no se puede bajar ni añadir la última carta de la mano.
  - **Fin de la mano:** cuando un jugador descarta su última carta, o cuando le toca robar a alguien y el mazo está vacío.
  - **Puntos:** cada jugador suma los puntos de las cartas que ha puesto en la mesa y resta los de las que le quedan en la mano. El As vale 15, salvo en una escalera A-2-3, donde vale 1; del 2 al 10, su número; J, Q y K, 10.
  - **Partida a 500:** al acabar una mano, si alguien llega a 500, gana quien más puntos tenga. Si hay empate arriba, se juega otra mano.
- **IA del Rummy 500 en los tres niveles:**
  - la básica coge del descarte si puede bajar enseguida la carta de más abajo y le compensa lo que se lleva, baja y añade todo lo que puede y suelta la carta que menos le sirve;
  - la fácil se equivoca a veces;
  - la difícil simula, como en el Remigio, qué roba y qué descarta.
- El servidor de salas admite el Rummy 500 como un juego más en red, de 2 a 4 asientos.
- **Cliente:**
  - el Rummy 500 en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa propia a partir de la del Remigio: el descarte abierto en abanico para coger desde cualquier carta, las combinaciones de la mesa con quién puso cada carta, bajar, añadir y descartar;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - comodines;
  - bajar o añadir la última carta sin descartar;
  - cantar «¡Rummy!» al ver una carta del descarte que se podía usar;
  - partidas a otra puntuación.

## Capabilities

### New Capabilities
- `juego-rummy-500`: reglas del Rummy 500:
  - reparto y descarte abierto;
  - robar varias cartas con la obligada;
  - combinaciones, bajar y añadir;
  - descartar y fin de la mano;
  - puntuación y partida a 500;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Rummy 500.
- `niveles-ia`: el Rummy 500 entra en la lista de juegos con tres niveles; su difícil simula el robo y el descarte, y su reconstrucción reparte las manos ajenas y el mazo.
- `mesa-cliente`: el menú incluye el Rummy 500 con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/rummy-500.ts` (con sus combinaciones), `ia/rummy-500-basica.ts` e `ia/reconstruir/rummy-500.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaRummy500.svelte` y `ResumenRummy500.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - coger varias cartas del descarte;
  - As de 15, o de 1 en A-2-3;
  - cerrar con descarte final;
  - de 2 a 4 jugadores, a 500.
