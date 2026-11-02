## Why

El Schafkopf es el juego de cartas tradicional de Baviera y uno de los más jugados de Alemania. Es un juego de bazas para cuatro con triunfos fijos (todas las damas y jotas) en el que, en cada mano, uno elige el contrato: jugar en pareja con quien tiene el As que llama (sin saber quién es), o jugar solo contra los otros tres. Las alianzas ocultas y las fichas por mano lo hacen distinto del Doppelkopf y del Skat que ya tiene la suite, y reaprovecha su motor de bazas y su baraja de 32 cartas.

## What Changes

- Nuevo juego **Schafkopf** para 4 jugadores, jugable contra la IA y en red, con la baraja francesa de 32 cartas: las damas hacen de Ober, las jotas de Unter, y tréboles, picas, corazones y diamantes de Eichel, Gras, Herz y Schellen.
  - **Puntos de las cartas:** As 11, 10 10, rey 4, dama 3 y jota 2; en total, 120.
  - **Reparto:** 8 cartas a cada uno. Sale el siguiente al repartidor.
  - **Elección del contrato:** desde el siguiente al repartidor, cada uno pasa o anuncia un contrato más alto que el anunciado: Rufspiel < Wenz < Solo. Juega quien anuncia el más alto.
    - **Rufspiel:** el jugador llama a un As de tréboles, picas o diamantes de un palo del que tenga alguna carta que no sea triunfo y sin tener ese As; quien lo tiene es su compañero en secreto. Triunfos: las damas, las jotas y los corazones.
    - **Wenz:** solo contra los tres; solo las 4 jotas son triunfo, y las damas van en su palo entre el rey y el 9.
    - **Solo:** solo contra los tres, con las damas, las jotas y el palo que elige como triunfos.
    - Si todos pasan, no se juega y se reparte la siguiente mano.
  - **Bazas:** hay que seguir el palo de salida, contando los triunfos como un palo; si no, cualquier carta. Gana el triunfo más alto o la carta más alta del palo de salida.
  - **El As llamado:** si sale su palo, su dueño tiene que echarlo; no puede descartarlo en otro palo salvo en la última baza, y si sale con ese palo, tiene que salir con el As.
  - **Mano:** el lado del jugador gana con 61 puntos o más. Schneider si el perdedor hace 30 o menos y Schwarz si no hace ninguna baza.
  - **Fichas:** Rufspiel 10 y Wenz o Solo 50, más 10 por Schneider, otros 10 por Schwarz y 10 por cada Laufende (triunfos más altos seguidos de un mismo lado, desde 3, o desde 2 en el Wenz). En el Rufspiel, cada perdedor paga la tarifa a un ganador; en el Wenz y el Solo, cada uno de los tres paga la tarifa al que juega solo (o la cobra de él).
  - **Partida:** 12 manos (tres vueltas de reparto, contando las que nadie juega); gana quien tiene más fichas.
- **IA del Schafkopf en los tres niveles:**
  - **Normal:** anuncia según sus triunfos y sus Ases; carga puntos cuando la baza es de su compañero conocido; gana con lo justo las bazas que valen y suelta lo que menos vale.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** anuncia como la normal y simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Schafkopf como un juego más en red.
- **Cliente:**
  - el Schafkopf en el menú;
  - una mesa de bazas para cuatro con el anuncio del contrato (pasar, el As que se llama, Wenz o el palo del Solo), el contrato, el As llamado y el compañero cuando se descubre;
  - el resumen de cada mano con los puntos, Schneider, Schwarz, los Laufende y las fichas; el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el Geier, el Farbwenz, el Ramsch y el Hochzeit;
  - doblar con Kontra y Re;
  - el «Davonlaufen» (salir con otra carta del palo llamado teniendo cuatro);
  - que un jugador que ya ha anunciado suba su contrato si otro le supera.

## Capabilities

### New Capabilities
- `juego-schafkopf`: reglas del Schafkopf:
  - baraja, puntos y reparto;
  - elección del contrato;
  - triunfos de cada contrato;
  - bazas y el As llamado;
  - puntos de la mano y fichas;
  - partida de 12 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Schafkopf.
- `niveles-ia`: el Schafkopf entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Schafkopf con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/schafkopf.ts`, `ia/schafkopf-basica.ts` e `ia/reconstruir/schafkopf.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaSchafkopf.svelte` y `ResumenSchafkopf.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - Rufspiel, Wenz y Solo;
  - si nadie juega, se reparte otra vez;
  - fichas y partida de 12 manos.
