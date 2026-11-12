## Why

La Briscola Chiamata es la brisca para 5 jugadores que más se juega en Italia:
- quien gana la subasta llama una carta y quien la tiene es su compañero en secreto;
- el resto de la mano, nadie sabe quién va con quién hasta que esa carta sale a la mesa.

Ninguno de los juegos de la suite tiene a 5 jugadores con bandos de 2 contra 3 que se descubren jugando. Se reaprovechan:
- la baraja española de 40 cartas y el orden y los puntos de la Brisca;
- la mesa de bazas compartida, que ya admite 5 jugadores (como el Julepe);
- la carta llamada y el compañero oculto de la Cuatrola, en el motor y en la reconstrucción.

## What Changes

- Nuevo juego **Briscola Chiamata** para 5 jugadores, jugable contra la IA y en red.
  - **Baraja:** la española de 40. En cada palo el orden de mayor a menor es As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2.
  - **Puntos de las cartas:** el As 11, el 3 10, el Rey 4, el Caballo 3 y la Sota 2; las demás nada. En total, 120.
  - **Reparto:** 8 cartas a cada uno.
  - **Subasta:** desde el siguiente al que reparte, cada uno puja más bajo que la última puja, o pasa, y quien pasa no vuelve.
    - Las pujas de carta van del As al 2: pujar una carta más baja es comprometerse a ganar con un compañero más flojo. Cada puja de carta pide 61 puntos.
    - Después del 2, se puja por puntos, de 62 a 120, siempre llamando un 2.
    - Si los cuatro primeros pasan, el que reparte no puede pasar: tiene que pujar el As.
  - **Llamada:** quien gana la subasta nombra un palo; la carta de su puja de ese palo es la carta llamada y ese palo es el triunfo. Quien tiene la carta llamada es su compañero, pero no lo dice.
  - **Jugar solo:** si llama una carta que tiene él mismo, juega solo contra los otros cuatro.
  - **Bazas:** sale el siguiente al que reparte. No hay que seguir el palo. Gana el triunfo más alto o, si no hay, la carta más alta del palo de salida. El compañero se descubre cuando se juega la carta llamada.
  - **Puntuación:** si el bando del llamador suma al menos los puntos de su puja (61 o los pujados), el llamador gana 2 puntos de partida, su compañero 1 y cada defensor pierde 1; si no, al revés. Jugando solo, el llamador gana o pierde 4.
  - **Partida:** 5 manos, una por repartidor. Gana quien más puntos de partida tiene, o empatan los que más tienen.
- **IA de la Briscola Chiamata en los tres niveles:**
  - **Normal:**
    - puja según los puntos de su mano y su palo más largo;
    - llama la carta de su puja en su palo más largo, si no la tiene;
    - en las bazas, carga puntos cuando gana alguien de su bando, gana las bazas con puntos con la carta más baja que puede, y si no, echa la que menos vale.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** puja y llama como la normal, y simula cada carta hasta el final de la mano.
- El servidor de salas admite la Briscola Chiamata como un juego más en red.
- **Cliente:**
  - la Briscola Chiamata en el menú, en la familia «Bazas con contrato o subasta», y su consejo en el modo asistido;
  - una mesa de bazas para 5 con:
    - la subasta de cartas y de puntos;
    - la llamada;
    - la puja, la carta llamada, el triunfo y el compañero (cuando se sabe);
    - los puntos de la mano y el marcador;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el cappotto (llevarse todas las bazas para cobrar doble);
  - las señas entre compañeros;
  - jugar con 4 o con 6.

## Capabilities

### New Capabilities
- `juego-briscola-chiamata`: reglas de la Briscola Chiamata:
  - baraja, orden y puntos;
  - reparto y subasta;
  - llamada y compañero oculto;
  - jugar solo;
  - bazas;
  - puntuación y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Briscola Chiamata.
- `niveles-ia`: la Briscola Chiamata entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas (y de dónde está la carta llamada) y su difícil por simulación.
- `mesa-cliente`: el menú incluye la Briscola Chiamata con su mesa y su fin de partida.
- `menu-juegos`: la Briscola Chiamata entra en la familia «Bazas con contrato o subasta».

## Impact

- `packages/engine`:
  - nuevos `juegos/briscola-chiamata.ts`, `ia/briscola-chiamata-basica.ts` e `ia/reconstruir/briscola-chiamata.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBriscolaChiamata.svelte` y `ResumenBriscolaChiamata.svelte`;
  - cambian el registro de juegos, el catálogo del menú, el consejo del modo asistido (y su cuenta de juegos con IA), los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - subasta por carta y después por puntos;
  - se puede llamar una carta propia y jugar solo;
  - puntos de partida por mano (±2, ±1 y ∓1; ±4 solo);
  - partida a 5 manos.
