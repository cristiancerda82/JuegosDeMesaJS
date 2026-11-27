## Why

El siguiente juego recomendado de la revisión de los libros es el **Cuarenta y tres**, que describe Núñez Elvira como una «variación sobre el tema del Tute» para 3 jugadores, cada uno por su cuenta. Su nombre viene de la cuenta: los tantos de una mano son 129, y su tercio es 43. Al acabar cada mano, cada uno cobra lo que pasa de 43 tantos y paga lo que le falta.

Tiene dos rasgos propios:
- no hay cantes: solo cuentan las cartas y las 9 de últimas;
- se reparte toda la baraja menos una carta, la muestra, que marca el triunfo y se queda a la vista en la mesa; quien tenga el 7 (o el 2) de triunfo puede cambiarlo por ella sin haber ganado ninguna baza, a diferencia del Tute para 2.

Casi todo lo demás ya existe en la suite:
- el orden y los puntos de las cartas del Tute;
- las obligaciones de asistir, montar y fallar, con el sobrefallo libre;
- el cambio de la muestra del Tute para 2;
- la mesa de bazas para 3 y la deducción de lo que se sabe por las obligaciones del Tute gana-pierde.

## What Changes

- Nuevo juego **Cuarenta y tres** para 3 jugadores, cada uno contra los demás, contra la IA y en red.
  - **Reparto:** con la baraja española de 40 cartas, 13 cartas a cada uno, de una en una. La carta 40, la muestra, queda boca arriba en la mesa y su palo es el triunfo. El que reparte pasa al siguiente en cada mano.
  - **Cambio de la muestra:** una vez por mano, quien tiene el 7 de triunfo puede cambiarlo por la muestra si es mayor que el 7, y quien tiene el 2, si es menor que la Sota. Se puede hacer en cualquier turno propio, también antes de la primera baza.
  - **Cartas:** el orden y los puntos del Tute: As (11), Tres (10), Rey (4), Caballo (3), Sota (2), 7, 6, 5, 4 y 2. Con las 9 de últimas, 129 tantos por mano.
  - **Bazas:** hay que asistir al palo y montar; sin el palo, fallar y montar el fallo. Si no se puede superar el fallo, cualquier carta.
  - **Liquidación:** al acabar la mano, cada uno se anota lo que pasa de 43 tantos, o en negativo lo que le falta.
  - **Partida:** de 6 manos (o de 3, en las opciones), para que todos repartan lo mismo. Gana quien acaba con más saldo.
- **IA del Cuarenta y tres en los tres niveles:**
  - **Normal:** cambia siempre la muestra y sigue los consejos del libro: arrastra cuando tiene muchos triunfos y juega los Ases para «arañar» tantos. En lo demás juega como la del Tute.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada jugada hasta el final de la mano. La reconstrucción aplica lo que se sabe por las obligaciones y deja la muestra cambiada en la mano de quien la cogió.
- El servidor de salas admite el Cuarenta y tres como un juego más en red.
- **Cliente:**
  - el Cuarenta y tres en el menú (familia «Bazas por puntos»), con la opción del número de manos;
  - una mesa de bazas para 3 con la muestra, el botón para cambiarla, los tantos y el saldo de cada uno;
  - el resumen de cada mano con los tantos, las últimas y lo que cada uno cobra o paga;
  - el fin de partida con la clasificación;
  - la guía con sus ejemplos comprobados con el motor y su historia;
  - el consejo del modo asistido.
- **Fuera de alcance:** la partida de 4 en la que el que reparte descansa, y la partida «a tiempo» del libro.

## Capabilities

### New Capabilities
- `juego-cuarenta-y-tres`: reglas del Cuarenta y tres:
  - baraja, reparto y muestra;
  - cambio de la muestra;
  - valor y orden de las cartas;
  - bazas y obligaciones;
  - tantos y liquidación;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Cuarenta y tres.
- `niveles-ia`: el Cuarenta y tres entra en la lista de juegos con tres niveles, con su reconstrucción.
- `mesa-cliente`: el menú incluye el Cuarenta y tres con su mesa y su fin de partida.
- `menu-juegos`: el Cuarenta y tres entra en la familia «Bazas por puntos».

## Impact

- `packages/engine`:
  - **Nuevos:** `juegos/cuarenta-y-tres.ts`, `ia/cuarenta-y-tres-basica.ts` e `ia/reconstruir/cuarenta-y-tres.ts`, con sus tests y la suite genérica del contrato.
  - **Registro:** en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - **Nuevos:** `MesaCuarentaYTres.svelte` y `ResumenCuarentaYTres.svelte`.
  - **Cambian:**
    - el registro de juegos y las opciones;
    - el catálogo y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los E2E.
- No hay dependencias nuevas.
- Las reglas son las de Núñez Elvira; el número fijo de manos sustituye a la partida «hasta la hora acordada».
