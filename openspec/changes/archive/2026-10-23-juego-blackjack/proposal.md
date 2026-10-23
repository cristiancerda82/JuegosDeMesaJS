## Why

La Siete y media es el único juego de la suite contra la banca, y se juega con baraja española. El Blackjack es su hermano de casino con baraja francesa, y es el juego de cartas más conocido del mundo: llegar a 21 sin pasarse, con decisiones de verdad (doblar la apuesta o separar una pareja) que la Siete y media no tiene. Además, la banca la lleva siempre la máquina con una regla fija, así que se juega igual de solo que con amigos en red.

## What Changes

- Nuevo juego **Blackjack**, jugable contra la IA y en red, de 1 a 4 jugadores (2 por defecto) contra la banca, que juega la máquina con una regla fija y no ocupa asiento:
  - **Fichas y manos:** cada jugador empieza con 100 fichas. La partida dura un número de manos (5, 10 o 20; 10 por defecto). Quien se queda sin fichas suficientes para apostar deja de jugar.
  - **Apuesta:** al empezar cada mano, cada jugador apuesta, por turno, un número par de fichas entre 2 y 20, sin pasar de las que tiene.
  - **Reparto:** se baraja una baraja francesa de 52 cartas en cada mano. Cada jugador recibe dos cartas boca arriba; la banca, una boca arriba y otra boca abajo.
  - **Valores:** del 2 al 10, su número; J, Q y K, 10; el As, 11 o 1, lo que más convenga sin pasarse. Un As y una carta de 10 en las dos primeras cartas son **blackjack**.
  - **Blackjack de la banca:** si la carta visible de la banca es un As o vale 10, la banca mira la tapada; si tiene blackjack, la descubre y la mano termina: pierden todos menos quien también tenga blackjack, que recupera su apuesta.
  - **Jugar:** por turnos, cada jugador **pide** carta o se **planta**. Con sus dos primeras cartas también puede **doblar** (dobla la apuesta, recibe una sola carta y se planta) o, si son del mismo valor, **separar** en dos manos con una apuesta igual cada una, que juega una tras otra. Se puede separar una vez por mano; los ases separados reciben una sola carta cada uno. Quien pasa de 21 pierde su apuesta. Con blackjack no se juega: se planta solo.
  - **Banca:** después de los jugadores, la banca descubre su carta y pide mientras tenga 16 o menos; se planta con 17 o más, también con un 17 que cuente un As como 11.
  - **Pago:** quien gana a la banca (o no se pasó y la banca sí) cobra lo apostado; un blackjack cobra 3 a 2; un empate devuelve la apuesta. Una mano separada que suma 21 con dos cartas cuenta como 21, no como blackjack.
  - **Fin:** al acabar las manos o si nadie puede apostar, gana quien más fichas tenga. Jugando solo, se gana si se acaba con más fichas de las iniciales.
- **IA del Blackjack en los tres niveles:**
  - la básica apuesta 10 fichas (o lo que le quede) y juega como la banca: pide con 16 o menos y se planta con 17 o más, dobla con 10 u 11 y separa ases y ochos;
  - la fácil se equivoca a veces;
  - la difícil sigue la estrategia básica completa del Blackjack (según su mano y la carta visible de la banca) y, sobre ella, simula la mano repartiendo al azar las cartas que no ve.
- El servidor de salas admite el Blackjack como un juego más en red, de 1 a 4 asientos.
- **Cliente:**
  - el Blackjack en el menú y sus opciones (jugadores, manos y nivel de la IA);
  - una mesa propia: la banca arriba con sus cartas, los jugadores con sus manos, apuestas y fichas, y los botones «Pedir», «Plantarse», «Doblar» y «Separar»; para apostar, botones de 2 a 20 fichas;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el seguro y la rendición;
  - varias barajas y reciclar el sabot;
  - separar más de una vez o doblar después de separar;
  - que un jugador haga de banca.

## Capabilities

### New Capabilities
- `juego-blackjack`: reglas del Blackjack:
  - fichas, manos y apuesta;
  - reparto, valores y blackjack;
  - pedir, plantarse, doblar y separar;
  - juego de la banca y pago;
  - fin de partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Blackjack.
- `niveles-ia`: el Blackjack entra en la lista de juegos con tres niveles; su difícil simula sobre una IA experta con la estrategia básica.
- `mesa-cliente`: el menú incluye el Blackjack con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/blackjack.ts`, `ia/blackjack-basica.ts` e `ia/reconstruir/blackjack.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBlackjack.svelte` y `ResumenBlackjack.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas son las del Blackjack de casino y las ha elegido el usuario:
  - doblar y separar;
  - de 1 a 4 jugadores contra la banca de la máquina;
  - un número de manos.
