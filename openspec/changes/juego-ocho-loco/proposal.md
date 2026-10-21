## Why

La suite tiene juegos de bazas, de combinaciones, de apuestas, de faroles y solitarios, pero ninguno de descarte al estilo del Uno: soltar cartas que casen por palo o por número hasta quedarse sin ninguna. El Ocho loco es el clásico de esa familia con baraja francesa. Es fácil de aprender, rápido, de 2 a 5 jugadores y muy jugable en red. Además, el 8 que cambia de palo le da una decisión interesante a la IA.

## What Changes

- Nuevo juego **Ocho loco**, jugable contra la IA y en red, de 2 a 5 jugadores (4 por defecto), cada uno por su cuenta:
  - **Reparto:** baraja francesa de 52 cartas. Se reparten 7 cartas con 2 jugadores y 5 con 3 o más. Se pone boca arriba la primera del mazo para empezar el descarte; si es un 8, se mete al fondo del mazo y se descubre la siguiente.
  - **Turno:** empieza el jugador a la izquierda del que reparte. Se juega una carta del mismo palo o del mismo número que la de arriba del descarte.
  - **El 8:** se puede jugar siempre, encima de cualquier carta, y quien lo juega elige el palo que sigue.
  - **Robar:** quien no puede jugar roba una carta del mazo. Si esa carta encaja, puede jugarla; si no, o si no quiere, pasa. Cuando se acaba el mazo, se baraja el descarte (menos la carta de arriba) y se forma uno nuevo. Si no queda ninguna carta que robar, pasa sin robar.
  - **Fin de la mano:** termina cuando un jugador se queda sin cartas, que se apunta los puntos de las cartas que les quedan a los demás: el 8 vale 50, las figuras (J, Q, K) 10, el As 1 y el resto su número. Si nadie puede jugar ni robar y pasan todos seguidos, la mano queda bloqueada: gana quien tenga menos puntos en la mano y se apunta los de los demás; si empatan, nadie se apunta nada.
  - **Partida:** se juegan manos hasta que alguien llega a 100 puntos, y ese jugador gana. El reparto pasa al siguiente en cada mano.
- **IA del Ocho loco en los tres niveles:**
  - la básica juega la carta que la deja con más cartas del palo que tocará, ochos incluidos, y al jugar un 8 elige el palo del que más cartas tiene. Juega la carta robada si encaja;
  - la fácil se equivoca a veces;
  - la difícil guarda los ochos mientras tenga otra carta que case, que es lo que más pesa en el juego, y además simula el resto de la mano repartiendo al azar las cartas que no ve, sabiendo qué palo y qué número no tenía cada uno al robar.
- El servidor de salas admite el Ocho loco como un juego más en red, de 2 a 5 asientos.
- **Cliente:**
  - el Ocho loco en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa propia: rivales con su número de cartas, el mazo, el descarte con el palo que toca, la mano propia para jugar, el botón «Robar» y «Pasar», y la elección de palo al jugar un 8;
  - el resumen de cada mano y el fin de partida con los puntos, y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - otras cartas especiales (el 2 que hace robar, la J que salta, el As que cambia el sentido);
  - robar hasta poder jugar;
  - jugar una sola mano;
  - jugar varias cartas iguales de una vez.

## Capabilities

### New Capabilities
- `juego-ocho-loco`: reglas del Ocho loco:
  - reparto y carta inicial;
  - jugar por palo o número, y el 8 que elige palo;
  - robar, pasar y rehacer el mazo;
  - fin de la mano (sin cartas o bloqueada) y puntos;
  - partida a 100;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Ocho loco.
- `niveles-ia`: el Ocho loco entra en la lista de juegos con tres niveles; su difícil simula sobre una IA experta que guarda los ochos, y su reconstrucción usa lo que se sabe de quien robó.
- `mesa-cliente`: el menú incluye el Ocho loco con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/ocho-loco.ts`, `ia/ocho-loco-basica.ts` e `ia/reconstruir/ocho-loco.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaOchoLoco.svelte` y `ResumenOchoLoco.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del Ocho loco clásico (Crazy Eights) y las ha elegido el usuario:
  - solo el 8 es especial;
  - se roba una carta y se puede jugar;
  - la partida es a 100 puntos.
