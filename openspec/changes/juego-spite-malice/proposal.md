## Why

Spite and Malice es el clásico de carreras para dos: cada jugador tiene que vaciar su montón antes que el rival, colocando cartas en escaleras comunes del As a la Q y usando los reyes como comodines. No es de bazas ni de combinaciones, sino de planificar jugadas en cadena y de no dejarle al rival lo que necesita. Aporta a la suite un tipo de juego distinto de los últimos.

## What Changes

- Nuevo juego **Spite and Malice** para 2, jugable contra la IA y en red.
  - **Baraja:** dos barajas francesas sin comodines, 104 cartas. Los K son comodines.
  - **Reparto:**
    - cada jugador recibe un *montón* de 20 cartas boca abajo con la de arriba boca arriba, y 5 cartas en la mano;
    - el resto forma el *mazo*.
  - **Mesa:**
    - hasta 4 *escaleras* comunes en el centro, que se empiezan con un As y suben de uno en uno hasta la Q;
    - un K vale como la carta que haga falta, también para empezar;
    - cada jugador tiene 4 montones de *descarte* propios, boca arriba.
  - **El turno:**
    - al empezar, el jugador roba del mazo hasta tener 5 cartas;
    - después juega a las escaleras todas las cartas que quiera, desde la mano, desde la carta de arriba de su montón o desde la carta de arriba de sus descartes;
    - si vacía la mano, roba otras 5 y sigue;
    - termina descartando una carta de la mano en uno de sus 4 descartes.
  - **Escaleras completas:** cuando una escalera llega a la Q, sale de la mesa. Cuando el mazo se acaba, las escaleras completas se barajan y forman un mazo nuevo.
  - **Ganar:** gana quien vacía antes su montón. Si el mazo se acaba sin escaleras completas para rehacerlo y ningún jugador puede mover, la partida termina en empate.
- **IA del Spite and Malice en los tres niveles:**
  - la normal busca una cadena de jugadas que le permita colocar la carta de su montón, evita dejar una escalera justo en la carta que necesita el rival, guarda los K y descarta en escalera descendente;
  - la fácil se equivoca a veces;
  - la difícil simula sus jugadas con las cartas ocultas repartidas al azar, unos turnos por delante, valorando cuánto le queda en el montón frente al rival.
- El servidor de salas admite el Spite and Malice como un juego más en red.
- **Cliente:**
  - el Spite and Malice en el menú;
  - una mesa propia con el montón, la mano y los descartes de cada uno, las escaleras del centro y el mazo;
  - se juega tocando la carta de origen y después la escalera o el descarte de destino;
  - el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - montones de otro tamaño, comodines y menos descartes;
  - más de 2 jugadores.

## Capabilities

### New Capabilities
- `juego-spite-malice`: reglas del Spite and Malice:
  - baraja y reparto;
  - escaleras con los K como comodines;
  - el turno: robar, jugar y descartar;
  - escaleras completas y el mazo rehecho;
  - fin de la partida y empate;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Spite and Malice.
- `niveles-ia`: el Spite and Malice entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Spite and Malice con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/spite-malice.ts`, `ia/spite-malice-basica.ts` y `ia/reconstruir/spite-malice.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaSpiteMalice.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - montones de 20 cartas;
  - dos barajas sin comodines;
  - 4 descartes por jugador.
