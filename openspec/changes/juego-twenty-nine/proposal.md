## Why

El Twenty-Nine es el juego de bazas más popular de la India y Bangladés:
- se juega por parejas con 32 cartas;
- la jota y el nueve son las cartas más altas y las que más puntos valen;
- quien gana la subasta elige el triunfo en secreto, y el triunfo no se descubre hasta que alguien no puede seguir el palo y lo pide.

El triunfo oculto lo hace distinto a todos los juegos de bazas de la suite. Se reaprovechan:
- la mesa de bazas compartida para 4 por parejas, como la de la Sueca o el Jass;
- la subasta numérica del Tute subastado y del Five Hundred;
- la reconstrucción con `repartirConPermitidos` y los fallos.

## What Changes

- Nuevo juego **Twenty-Nine** para 4 jugadores por parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** la francesa de 32 (del 7 al As). En cada palo el orden de mayor a menor es J, 9, As, 10, K, Q, 8 y 7.
  - **Puntos de las cartas:** la J 3, el 9 2, el As 1 y el 10 1; las demás nada. En total, 28.
  - **Reparto:** 4 cartas a cada uno, la subasta, y después otras 4 a cada uno.
  - **Subasta:** desde el siguiente al que reparte, cada uno puja de 16 a 28 (más que la última) o pasa, y quien pasa no vuelve. Si pasan los cuatro, se reparte de nuevo con el siguiente que reparte.
  - **Triunfo:** quien gana la subasta elige en secreto el palo del triunfo o juega sin triunfo (que se anuncia).
  - **Doblar y redoblar:** antes de repartir el resto, los rivales del que pujó pueden doblar; si doblan, el que pujó puede redoblar. La mano vale 1, 2 o 4 puntos de juego.
  - **Bazas:** sale el siguiente al que reparte.
    - Hay que seguir el palo de salida.
    - Quien no puede seguirlo puede echar cualquier carta o pedir que se descubra el triunfo. Si lo pide, tiene que echar triunfo si tiene.
    - Mientras el triunfo está oculto, sus cartas no ganan bazas; desde que se descubre, sí.
  - **La pareja:** con el triunfo descubierto, quien tiene el K y la Q del triunfo puede cantarla en su turno. Si es del lado que pujó, la puja baja 4 (sin bajar de 16); si es del otro lado, sube 4 (sin pasar de 28).
  - **Puntuación:** si la pareja que pujó llega a su puja con los puntos de sus bazas, gana tantos puntos de juego como vale la mano; si no, los pierde.
  - **Partida:** gana la pareja que llega a 6 puntos de juego, o la otra si una llega a −6. Si tras 40 manos ninguna lo consigue, gana la que más tiene, o es empate.
- **IA del Twenty-Nine en los tres niveles:**
  - **Normal:**
    - puja según los puntos y el palo más largo de sus 4 primeras cartas;
    - elige como triunfo su palo más largo, o juega sin triunfo si no repite palo y tiene muchos puntos;
    - dobla y redobla con muchos puntos;
    - canta la pareja siempre;
    - pide el triunfo cuando la baza tiene puntos y la va ganando el otro lado;
    - en las bazas, gana con la carta más baja que puede y carga puntos en las de su compañero.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** puja, elige el triunfo y dobla como la normal, y simula cada carta y cuándo pedir el triunfo hasta el final de la mano.
- El servidor de salas admite el Twenty-Nine como un juego más en red.
- **Cliente:**
  - el Twenty-Nine en el menú, en la familia «Bazas con contrato o subasta», y su consejo en el modo asistido;
  - una mesa de bazas para 4 con:
    - la subasta;
    - la elección del triunfo en secreto;
    - doblar y redoblar;
    - pedir el triunfo y cantar la pareja;
    - la puja, el triunfo (cuando se conoce), los puntos de cada pareja y el marcador;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el punto de la última baza;
  - jugar una sola mano contra los tres («single hand»);
  - apartar la carta del triunfo boca abajo.

## Capabilities

### New Capabilities
- `juego-twenty-nine`: reglas del Twenty-Nine:
  - baraja, orden y puntos;
  - reparto en dos tandas;
  - subasta;
  - triunfo oculto o sin triunfo;
  - doblar y redoblar;
  - bazas y pedir el triunfo;
  - la pareja;
  - puntuación y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Twenty-Nine.
- `niveles-ia`: el Twenty-Nine entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas (también del triunfo oculto) y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Twenty-Nine con su mesa y su fin de partida.
- `menu-juegos`: el Twenty-Nine entra en la familia «Bazas con contrato o subasta».

## Impact

- `packages/engine`:
  - nuevos `juegos/twenty-nine.ts`, `ia/twenty-nine-basica.ts` e `ia/reconstruir/twenty-nine.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTwentyNine.svelte` y `ResumenTwentyNine.svelte`;
  - cambian el registro de juegos, el catálogo del menú, el consejo del modo asistido (y su cuenta de juegos con IA), los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - partida a 6 puntos de juego;
  - la pareja, doblar y redoblar, y jugar sin triunfo.
