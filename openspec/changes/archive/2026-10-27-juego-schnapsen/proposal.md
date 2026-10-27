## Why

El Schnapsen es el juego de cartas nacional de Austria: bazas para dos con solo 20 cartas, rápido y lleno de decisiones. Hay que llegar a 66 puntos antes que el rival, cantando parejas de rey y dama y decidiendo cuándo cerrar el mazo para jugar con las reglas estrictas. Se parece al Guiñote de dos, pero con baraja francesa, sin diez de últimas y con el cierre del mazo, y la partida se cuenta por *bummerls*.

## What Changes

- Nuevo juego **Schnapsen** clásico para 2, jugable contra la IA y en red.
  - **Baraja:** francesa de 20 cartas: As (11 puntos), 10 (10), K (4), Q (3) y J (2) de cada palo, en ese orden de mayor a menor.
  - **Reparto:** 5 cartas a cada uno, y la siguiente se pone boca arriba bajo el mazo: su palo es el triunfo. Quedan 9 cartas boca abajo encima.
  - **Bazas con el mazo abierto:** sale el que no reparte, y después quien gana cada baza. No hay que seguir el palo. Gana el triunfo más alto o la más alta del palo de salida. Tras cada baza, roba primero el ganador y después el otro; la última carta que se roba es la vuelta.
  - **Cambiar la J del triunfo:** en su turno de salida, mientras el mazo esté abierto, quien tiene la J del triunfo puede cambiarla por la carta vuelta.
  - **Cantar:** en su turno de salida, quien tiene el K y la Q de un palo puede cantarlos (20, o 40 en el triunfo) y tiene que salir con uno de los dos. Los puntos de un cante solo cuentan cuando ese jugador ha ganado alguna baza.
  - **Cerrar el mazo:** en su turno de salida, con cartas en el mazo, un jugador puede cerrarlo. Ya no se roba y se juega con las reglas estrictas.
  - **Reglas estrictas** (mazo cerrado o agotado): hay que seguir el palo y ganar la baza si se puede; sin el palo, hay que fallar con triunfo; si no, cualquier carta.
  - **Fin de la mano:**
    - en cuanto un jugador llega a 66 puntos (bazas y cantes), gana la mano;
    - si se agota el mazo y nadie llega, gana quien hace la última baza;
    - si se cerró el mazo, quien cerró tiene que llegar a 66; si no, gana el otro.
  - **Puntos de partida:** quien gana la mano se apunta 3 si el rival no hizo ninguna baza, 2 si hizo menos de 33 puntos y 1 si no. Si quien cerró no llega a 66, el rival se apunta 2, o 3 si al cerrar aún no tenía bazas.
  - **Partida (*bummerl*):** gana el primero que llega a 7 puntos. El repartidor se alterna cada mano.
- **IA del Schnapsen en los tres niveles:**
  - la normal cambia la J siempre que puede, canta en cuanto puede y cierra con una mano que le asegura llegar a 66. Con el mazo abierto sale con cartas bajas que no son triunfo y gana las bazas que valen la pena; con las reglas estrictas juega para ganar las bazas;
  - la fácil se equivoca a veces;
  - la difícil simula cada decisión con la mano del rival y el mazo repartidos al azar.
- El servidor de salas admite el Schnapsen como un juego más en red.
- **Cliente:**
  - el Schnapsen en el menú;
  - la mesa de bazas compartida, con el mazo, la carta vuelta, los botones para cambiar la J, cantar y cerrar, y los puntos de la mano de cada uno;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - decir «me bastan» a mano: la mano termina sola en cuanto alguien llega a 66;
  - la variante de 24 cartas (Sechsundsechzig).

## Capabilities

### New Capabilities
- `juego-schnapsen`: reglas del Schnapsen:
  - baraja, reparto y triunfo;
  - bazas con el mazo abierto y robo;
  - cambiar la J del triunfo;
  - cantes de 20 y 40;
  - cerrar el mazo y reglas estrictas;
  - fin de la mano y puntos de partida;
  - partida a 7;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Schnapsen.
- `niveles-ia`: el Schnapsen entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Schnapsen con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/schnapsen.ts`, `ia/schnapsen-basica.ts` y `ia/reconstruir/schnapsen.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaSchnapsen.svelte` y `ResumenSchnapsen.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - baraja de 20 cartas;
  - partida por *bummerl* a 7;
  - se puede cambiar la J del triunfo por la carta vuelta.
