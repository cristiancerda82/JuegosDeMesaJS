## Why

La Pesca (Go Fish) es el juego de cartas familiar por excelencia: se piden cartas a los rivales para reunir cuartetos. Es muy sencillo de aprender, admite de 2 a 6 jugadores y se juega de memoria, recordando lo que ha pedido cada uno. Le da a la suite un juego ligero para todas las edades, distinto de los de bazas recientes.

## What Changes

- Nuevo juego **Pesca** para 2 a 6 jugadores, cada uno por su cuenta, jugable contra la IA y en red.
  - **Baraja y reparto:**
    - la francesa de 52;
    - 7 cartas a cada uno con 2 o 3 jugadores, y 5 con 4 a 6;
    - el resto forma el *mar*, boca abajo.
  - **El turno:**
    - el jugador pide a un rival todas las cartas de un valor del que tenga al menos una;
    - si el rival tiene, se las da todas y el jugador sigue pidiendo;
    - si no, le dice «¡A pescar!» y el jugador roba una carta del mar: si es del valor que pidió, la enseña y sigue pidiendo; si no, el turno pasa al de su izquierda.
  - **Cuartetos:** en cuanto un jugador reúne las cuatro cartas de un valor, las baja delante de él.
  - **Sin cartas:** si a un jugador le toca y no tiene cartas, roba una del mar y pide; si el mar está vacío, queda fuera.
  - **Fin:** cuando se han bajado los 13 cuartetos. Gana quien tenga más; si empatan varios, hay empate.
- **IA de la Pesca en los tres niveles:**
  - la normal recuerda lo que se ha pedido y dado en la mesa: pide a quien sabe que tiene el valor y, si no, el valor del que tiene más cartas al rival con más cartas;
  - la fácil se equivoca a veces;
  - la difícil simula unos turnos por delante cada petición posible, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite la Pesca como un juego más en red.
- **Cliente:**
  - la Pesca en el menú, con la opción de jugadores (2 a 6);
  - una mesa propia con los rivales, sus cartas y sus cuartetos, el mar y la mano agrupada por valores;
  - se pide tocando un valor de la mano y después un rival;
  - avisos de cada petición, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:** las variantes de parejas en vez de cuartetos y la de pedir una carta concreta.

## Capabilities

### New Capabilities
- `juego-pesca`: reglas de la Pesca:
  - baraja y reparto;
  - el turno: pedir, dar y pescar;
  - cuartetos;
  - jugadores sin cartas;
  - fin y empate;
  - vista del jugador, con el registro público de peticiones.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Pesca.
- `niveles-ia`: la Pesca entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye la Pesca con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/pesca.ts`, `ia/pesca-basica.ts` y `ia/reconstruir/pesca.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaPesca.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 7 cartas con 2 o 3 jugadores y 5 con 4 a 6;
  - quien acierta sigue pidiendo, también si pesca la carta pedida;
  - quien se queda sin cartas roba del mar y sigue.
