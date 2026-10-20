## Why

El Remigio es el rummy de la baraja española que más se juega en casa: dos barajas, comodines y la emoción de cerrar «de golpe» para que los demás paguen doble. Junta lo que ya tienen dos juegos de la suite:
- el Chinchón aporta la mano de 7 cartas, la eliminación a 100 y la baraja española;
- el Pinacle aporta las combinaciones a la vista en la mesa, añadir cartas y cambiar comodines.

Su motor sigue la misma arquitectura que el del Pinacle: combinaciones a la vista, jugadas pequeñas para bajar, añadir y cambiar, y planes para bajar una selección.

## What Changes

- Nuevo juego **Remigio**, jugable contra la IA y en red, de 2 a 5 jugadores, cada uno por su cuenta:
  - **Baraja y reparto:** dos barajas españolas de 40 cartas y 4 comodines (84 cartas), 7 cartas a cada jugador. La primera carta del mazo empieza el montón de descartes. El reparto rota y sale el siguiente al repartidor.
  - **Turno:**
    1. robar del mazo o la carta de arriba del montón;
    2. opcionalmente bajar combinaciones;
    3. tras haber bajado la primera, añadir cartas a las combinaciones de cualquier jugador y cambiar comodines por la carta que representan;
    4. descartar una carta.

    Si se acaba el mazo, el montón (menos su carta de arriba) se baraja y pasa a ser el mazo.
  - **Combinaciones:**
    - **Escaleras:** 3 o más cartas seguidas del mismo palo, en el orden As, 2…7, Sota, Caballo, Rey (el 7 y la Sota van seguidos), con el As solo abajo.
    - **Grupos:** 3 o 4 cartas del mismo número de palos distintos.
    - **Comodines:** sustituyen a cualquier carta, y cada combinación lleva al menos 2 cartas naturales.
  - **Cerrar:** gana la mano quien se queda sin cartas, bajando o descartando la última. Si cierra bajando toda la mano en un solo turno sin haber bajado antes, es **remigio** y los demás pagan doble.
  - **Puntuación:** quien no cierra suma los puntos de las cartas que le quedan en la mano: el número de la carta, las figuras 10 y los comodines 25. Quien pasa de 100 queda eliminado y gana el último que queda.
- **Combinaciones del Remigio** en su propio módulo, con las mismas piezas que el Pinacle:
  - generación de las bajadas de 3, los añadidos y los cambios de comodín;
  - planes para bajar una selección.

  El Pinacle no cambia. Sacar un núcleo de rummy común queda fuera, porque sus reglas difieren en lo fino: los doses comodín, el comodín cambiado que pasa a un extremo y los grupos con palos repetidos.
- **IA del Remigio en los tres niveles:**
  - la básica roba del montón si le sirve, baja en cuanto puede (o guarda para el remigio si lo tiene cerca), añade a las combinaciones de la mesa y descarta la carta menos útil y que más puntos vale;
  - la fácil se equivoca a veces;
  - la difícil simula robar y descartar, y lo que baja lo decide como la básica, como en el Pinacle.
- El servidor de salas admite el Remigio como un juego más en red.
- **Cliente:**
  - el Remigio en el menú y sus opciones (jugadores, nivel de la IA);
  - una mesa con la misma forma de jugar que la del Pinacle: mano en dos filas, selección y «Bajar», combinaciones de cada jugador y cambiar comodín;
  - el resumen de cada mano y la guía «¿Cómo se juega?».
- **Fuera de alcance:** un núcleo de rummy común con el Pinacle, el mínimo de puntos para la primera bajada, el «reenganche» de los eliminados, la variante de 48 cartas y las escaleras con el As arriba.

## Capabilities

### New Capabilities
- `juego-remigio`: reglas del Remigio:
  - baraja, reparto y turno;
  - combinaciones con comodines;
  - bajar, añadir y cambiar comodines en las combinaciones de todos;
  - cerrar y remigio;
  - puntuación, eliminación a 100 y fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Remigio.
- `niveles-ia`: el Remigio entra en la lista de juegos con tres niveles y en la reconstrucción de las cartas ocultas. Su difícil simula robar y descartar.
- `mesa-cliente`: el menú incluye el Remigio, con su mesa y el resumen de la mano.

## Impact

- `packages/engine`:
  - nuevos `juegos/remigio-combinaciones.ts`, `juegos/remigio-plan.ts`, `juegos/remigio.ts`, `ia/remigio-basica.ts` e `ia/reconstruir/remigio.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaRemigio.svelte` y `ResumenRemigio.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del Remigio clásico y las valida el usuario: grupos de palos distintos, el As solo abajo, el comodín a 25, el remigio doble, el montón sin obligación de bajar su carta y la primera bajada sin mínimo.
