## Why

El Tresillo (el Hombre de tres) es el gran juego español de bazas de los siglos XVII al XIX y el antepasado de la Malilla, el Solo y el Préférence:
- se juega entre 3 con la baraja española de 40 cartas;
- quien gana la subasta (el hombre) juega solo contra los otros dos;
- los triunfos más altos son los matadores: la espadilla (As de espadas), la malilla y el basto (As de bastos), que no hay que echar aunque salga triunfo.

Es el juego español que falta en la suite, y su orden de cartas, que cambia según el palo del triunfo, lo hace distinto a todos los demás. Se reaprovechan:
- la mesa de bazas compartida para 3, como la del Tysiącha;
- las fichas y el bote del Bourré;
- el cambio de cartas del Écarté y del Bourré.

## What Changes

- Nuevo juego **Tresillo** para 3 jugadores, jugable contra la IA y en red.
  - **Baraja:** la española de 40. Cada uno recibe 9 cartas y quedan 13 en el monte.
  - **Orden de las cartas:** cambia según el palo del triunfo:
    - **Matadores:** la espadilla (As de espadas) y el basto (As de bastos) son siempre triunfo; la malilla es el 2 del triunfo si es negro (espadas o bastos) y el 7 si es rojo (oros o copas).
    - **Triunfo negro:** espadilla, malilla, basto, rey, caballo, sota, 7, 6, 5, 4, 3.
    - **Triunfo rojo:** espadilla, malilla, basto, el punto (As del triunfo), rey, caballo, sota, 2, 3, 4, 5, 6.
    - **Palos negros sin triunfo:** rey, caballo, sota, 7, 6, 5, 4, 3, 2.
    - **Palos rojos sin triunfo:** rey, caballo, sota, As, 2, 3, 4, 5, 6, 7.
  - **Fichas:** cada jugador empieza con 100 y pone 1 en el bote al empezar cada mano.
  - **Subasta:** desde el mano (el siguiente al que reparte), cada uno puja más alto o pasa, y quien pasa ya no vuelve a pujar. Los contratos, de menor a mayor:
    - **Entrada:** el hombre elige el triunfo y cambia cartas con el monte;
    - **Vuelta:** se descubre la primera carta del monte, su palo es el triunfo y el hombre se la queda al cambiar;
    - **Solo:** el hombre elige el triunfo y no cambia.
    - Si pasan los tres, no se juega la mano y el bote se queda.
  - **Cambio:** primero el hombre (salvo en solo), luego cada defensor por turno, se descartan y roban del monte otras tantas mientras quede.
  - **Bazas:** 9 bazas; sale el mano.
    - hay que seguir el palo de salida si se puede; sin el palo, se puede echar cualquier carta;
    - si sale triunfo, quien solo tiene matadores puede no echarlos, salvo que la carta de salida sea un matador más alto que el suyo.
  - **Cobro:**
    - **Sacada:** si el hombre hace más bazas que cada defensor, se lleva el bote y cada defensor le paga el contrato (entrada 2, vuelta 4, solo 6).
    - **Puesta:** si empata con el defensor que más hace, paga al bote tanto como había y el contrato a cada defensor.
    - **Codillo:** si un defensor hace más bazas que él, paga a ese defensor tanto como había en el bote y el contrato a cada defensor; el bote se queda.
  - **Partida:** termina tras 12 manos o cuando un jugador se queda sin fichas. Gana quien tiene más fichas.
- **IA del Tresillo en los tres niveles:**
  - **Normal:**
    - cuenta las bazas que espera con el mejor palo de triunfo (los matadores y el punto cuentan 1);
    - puja solo con 5,5 bazas esperadas, entrada con 3,5 y vuelta si espera 3 de media con cualquier triunfo;
    - en el cambio se descarta de lo que no es triunfo ni rey;
    - en las bazas, los defensores se ayudan y nadie gasta una carta alta en una baza que ya gana su compañero.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** cambia como la normal, y simula la subasta, la elección del triunfo y cada carta hasta el final de la mano.
- El servidor de salas admite el Tresillo como un juego más en red.
- **Cliente:**
  - el Tresillo en el menú;
  - una mesa de bazas para 3 con:
    - la subasta;
    - la elección del triunfo;
    - el cambio de cartas;
    - la vuelta;
    - el hombre, el contrato, el bote, las fichas y las bazas de cada uno;
  - el resumen de cada mano (sacada, puesta o codillo), el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - la bola (comprometerse a hacer las 9 bazas);
  - la preferencia de los oros en la subasta;
  - ver el resto del monte;
  - las variantes de 4 jugadores (Cuatrillo y Cascarela).

## Capabilities

### New Capabilities
- `juego-tresillo`: reglas del Tresillo:
  - baraja y orden de las cartas;
  - fichas y reparto;
  - subasta y contratos;
  - cambio;
  - bazas y el privilegio de los matadores;
  - sacada, puesta y codillo;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Tresillo.
- `niveles-ia`: el Tresillo entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Tresillo con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/tresillo.ts`, `ia/tresillo-basica.ts` e `ia/reconstruir/tresillo.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTresillo.svelte` y `ResumenTresillo.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - los contratos clásicos (entrada, vuelta y solo);
  - 100 fichas y partida a 12 manos.
