## Why

El Klaverjas es el juego de cartas más popular de los Países Bajos y Flandes: cuatro en parejas, con 32 cartas, la Jota y el 9 del triunfo como cartas más altas y la obligación de fallar y subir. Su roem (las combinaciones que se forman dentro de cada baza) y el «nat» (la pareja que juega y no gana lo pierde todo) lo hacen distinto del Jass y la Belote.

## What Changes

- Nuevo juego **Klaverjas** (variante de Rotterdam) para 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** 32 cartas francesas, del 7 al As de cada palo; 8 cartas a cada uno.
  - **Triunfo:**
    - se propone un palo al azar y cada uno, desde el siguiente al repartidor, dice si juega con él o pasa;
    - el primero que juega hace de su pareja la que juega la mano;
    - si pasan los cuatro, el siguiente al repartidor debe jugar y elige el palo que quiera.
    - Sale siempre el siguiente al repartidor.
  - **Órdenes y puntos:**
    - en el triunfo, J 20, 9 14, A 11, 10 10, K 4, Q 3, 8 y 7;
    - en los demás palos, A 11, 10 10, K 4, Q 3, J 2, 9, 8 y 7.
    - La última baza suma 10: 162 por mano.
  - **Bazas (Rotterdam):**
    - hay que seguir el palo;
    - si no se puede, hay que fallar, aunque la baza sea del compañero;
    - si ya hay triunfo en la baza, hay que subir; si no se puede, no se puede echar un triunfo más bajo, salvo con solo triunfos en la mano;
    - si sale triunfo, hay que subir si se puede.
  - **Roem:** se anota a quien gana la baza, por las cartas de la baza:
    - escalera de 3 del mismo palo, 20; de 4, 50;
    - cuatro iguales, 100 (cuatro Jotas, 200);
    - el Rey y la Dama del triunfo (stuk), 20.
    - La pareja que gana las 8 bazas (pit) suma 100 de roem.
  - **Nat:** si la pareja que juega no hace más puntos (cartas y roem) que la otra, la otra se lleva los 162 y todo el roem de la mano.
  - **Partida:** 8 manos; gana la pareja con más puntos.
- **IA del Klaverjas en los tres niveles:**
  - **Normal:** juega con el palo propuesto si su mano vale para ello; sale con las cartas más altas que quedan; carga puntos cuando la baza es de su compañero; gana con lo justo las bazas que valen.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** decide el triunfo como la normal y simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Klaverjas como un juego más en red.
- **Cliente:**
  - el Klaverjas en el menú;
  - una mesa de bazas para cuatro con la propuesta del triunfo, el triunfo y quién juega, el roem de cada baza, los puntos de la mano y de la partida;
  - el resumen de cada mano con el nat y el pit, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - la variante de Amsterdam;
  - anunciar el roem a mano (se anota solo);
  - otras duraciones de la partida.

## Capabilities

### New Capabilities
- `juego-klaverjas`: reglas del Klaverjas:
  - baraja y reparto;
  - propuesta del triunfo;
  - órdenes y puntos;
  - bazas de Rotterdam;
  - roem y pit;
  - nat;
  - partida a 8 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Klaverjas.
- `niveles-ia`: el Klaverjas entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Klaverjas con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/klaverjas.ts`, `ia/klaverjas-basica.ts` e `ia/reconstruir/klaverjas.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaKlaverjas.svelte` y `ResumenKlaverjas.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la variante de Rotterdam;
  - el palo propuesto al azar;
  - la partida a 8 manos.
