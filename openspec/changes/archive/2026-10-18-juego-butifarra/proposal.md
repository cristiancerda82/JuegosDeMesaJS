## Why

La Butifarra es el gran juego de bazas por parejas de Cataluña. Añade a la suite decisiones que aún no tiene ningún juego:
- el repartidor elige el triunfo, juega sin triunfo («butifarra») o delega en su compañero;
- los rivales pueden doblar el valor de la mano con el contro, y los otros redoblarlo.

Se apoya en el motor de bazas que ya usan la Brisca, el Tute, el Guiñote y la Pocha, y por primera vez usa en un juego de bazas la baraja de 48 cartas, con la manilla (el 9) como carta más alta.

## What Changes

- Nuevo juego **Butifarra** para 4 jugadores en dos parejas (asientos 0-2 contra 1-3), jugable de principio a fin contra la IA y en red.
  - **Baraja y reparto:** baraja española de 48 cartas, 12 a cada jugador. El repartidor rota cada mano y sale el jugador siguiente al repartidor.
  - **Orden y puntos de las cartas:**

    | Carta | Puntos |
    |---|---|
    | 9 (manilla) | 5 |
    | As | 4 |
    | Rey | 3 |
    | Caballo | 2 |
    | Sota | 1 |
    | 8, 7, 6, 5, 4, 3, 2 | 0 |

    Las cartas van de mayor a menor en ese orden. Cada baza vale además 1 punto, así que cada mano reparte 72 puntos.
  - **Triunfo:** el repartidor elige uno de los cuatro palos, juega «butifarra» (sin triunfo, la mano vale el doble) o delega en su compañero, que entonces tiene que elegir y no puede delegar.
  - **Contros:** una vez elegido el triunfo, los rivales pueden decir contro (×2). Después, el bando que eligió puede decir recontro (×4) y, por último, los rivales Sant Vicenç (×8).
  - **Obligaciones clásicas:**
    - hay que seguir el palo y superar la carta que va ganando si se puede;
    - si no se tiene del palo, hay que fallar con triunfo y superar el triunfo más alto si se puede;
    - si la baza la va ganando el compañero, no hace falta superarla ni fallar, pero sí seguir el palo.
  - **Puntuación:** la pareja que pasa de 36 puntos se anota lo que pasa, multiplicado por la butifarra y los contros. Con 36 a 36 no se anota nadie.
  - **Fin de la partida:** gana la primera pareja que llega al objetivo: 101 puntos por defecto, o 51 o 151 en Opciones.
- **IA de la Butifarra en los tres niveles:**
  - la básica elige el triunfo según su mano, delega cuando no tiene un palo bueno, decide los contros según la fuerza de su mano y juega en pareja;
  - la fácil se equivoca a veces;
  - la difícil simula al elegir el triunfo y al jugar cada carta. Los contros los decide como la básica.
- El servidor de salas admite la Butifarra como un juego más en red.
- **Cliente:**
  - la Butifarra en el menú y sus opciones (objetivo y nivel de la IA);
  - una mesa sobre la mesa de bazas compartida, con botones para elegir el triunfo o delegar y para los contros, el triunfo y el multiplicador a la vista;
  - el resumen de cada mano;
  - la guía «¿Cómo se juega?».
- **Fuera de alcance:** las variantes de 3 jugadores, la puntuación «a 36» sin multiplicar, y las señas entre compañeros.

## Capabilities

### New Capabilities
- `juego-butifarra`: reglas de la Butifarra:
  - baraja de 48, reparto y rotación del repartidor;
  - elección del triunfo, butifarra y delegar;
  - contro, recontro y Sant Vicenç;
  - bazas con obligaciones, puntuación de la mano y fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Butifarra (triunfo, contros y juego en pareja).
- `niveles-ia`: la Butifarra entra en la lista de juegos con tres niveles y en la reconstrucción de las cartas ocultas. Su IA difícil simula el triunfo y las cartas, no los contros.
- `mesa-cliente`: el menú incluye la Butifarra, con su mesa (elegir triunfo, delegar, contros) y el resumen de la mano.

## Impact

- `packages/engine`:
  - nuevos `juegos/butifarra.ts`, `ia/butifarra-basica.ts` y `ia/reconstruir/butifarra.ts`, con sus tests y la suite genérica del contrato;
  - `motor/bazas.ts` gana los valores de la Butifarra y acepta jugar sin triunfo (`null`) en `cartaGanadora` y `cartasObligadas`, sin cambiar los demás juegos;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código, porque toma los juegos de `red.ts`.
- `packages/client`: nueva `MesaButifarra.svelte` sobre `MesaBazas`; cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del juego clásico y las valida el usuario: las obligaciones, los contros hasta Sant Vicenç y la partida a 101.
