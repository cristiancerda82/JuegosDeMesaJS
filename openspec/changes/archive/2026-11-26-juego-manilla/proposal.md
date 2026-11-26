## Why

La revisión de los libros recomienda primero la Manilla: es la madre de la Butifarra y se juega sobre todo en Cataluña, en la Comunidad Valenciana y en el sur de Francia. La describe Núñez Elvira.

Se diferencia de la Butifarra en tres cosas:
- el triunfo no se elige: lo marca la última carta del que reparte, el «pinte»;
- no hay contros;
- la partida es corta, a 40.

Casi todo lo demás ya existe en la suite:
- el orden y los puntos de las cartas;
- la obligación de montar solo contra los rivales;
- el sobrefallo libre;
- la IA de bazas en pareja.

## What Changes

- Nuevo juego **Manilla** para 4 jugadores en dos parejas, contra la IA y en red.
  - **Reparto:** 12 cartas a cada uno, de cuatro en cuatro. La última del que reparte, el pinte, marca el triunfo y queda a la vista en su mano hasta que la juega. El que reparte pasa al siguiente en cada mano.
  - **Cartas:** el orden es 9 (la manilla), As, Rey, Caballo, Sota, 8… 2; valen 5, 4, 3, 2 y 1, y cada baza 1 punto más (72 por mano).
  - **Bazas:** si gana un rival, hay que seguir el palo y montar, fallar y sobrefallar. Sin poder superar el fallo se echa cualquier carta. Si gana el compañero, basta con seguir el palo.
  - **Puntuación:** cada pareja se anota lo que pasa de 36, y la del que reparte, además, el valor del pinte. Si el pinte le daría la partida, solo lo anota si ha hecho al menos 36.
  - **Partida:** a 40 puntos (o a 20, en las opciones).
- **IA de la Manilla en los tres niveles:**
  - **Normal:** juega como la de la Butifarra. Su juego de cartas pasa a ser una función común que comparten las dos.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada carta hasta el final de la mano. La reconstrucción deja el pinte en la mano del que reparte y aplica lo que se sabe por las obligaciones.
- El servidor de salas admite la Manilla como un juego más en red.
- **Cliente:**
  - la Manilla en el menú (familia «Bazas por puntos»), con la opción de los puntos de la partida;
  - una mesa de bazas por parejas con el pinte a la vista en la mano de quien reparte, el triunfo, los puntos de la mano y el marcador;
  - el resumen de cada mano con el pinte;
  - el fin de partida;
  - la guía con tres ejemplos comprobados con el motor y su historia;
  - el consejo del modo asistido.
- **Fuera de alcance:** otros números de jugadores y variantes regionales de la Manilla.

## Capabilities

### New Capabilities
- `juego-manilla`: reglas de la Manilla:
  - reparto y pinte;
  - valor y orden de las cartas;
  - bazas y obligaciones;
  - puntuación con el pinte;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Manilla.
- `niveles-ia`: la Manilla entra en la lista de juegos con tres niveles, con su reconstrucción.
- `mesa-cliente`: el menú incluye la Manilla con su mesa y su fin de partida.
- `menu-juegos`: la Manilla entra en la familia «Bazas por puntos».

## Impact

- `packages/engine`:
  - **Nuevos:** `juegos/manilla.ts`, `ia/manilla-basica.ts` e `ia/reconstruir/manilla.ts`, con sus tests y la suite genérica del contrato.
  - **IA de la Butifarra:** `ia/butifarra-basica.ts` exporta su juego de cartas (`cartaEnPareja`) sin cambiar lo que decide.
  - **Registro:** en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - **Nuevos:** `MesaManilla.svelte` y `ResumenManilla.svelte`.
  - **Cambian:**
    - el registro de juegos y las opciones;
    - el catálogo y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los E2E.
- No hay dependencias nuevas.
- Las reglas son las de Núñez Elvira; la partida a 20 es una opción de la suite.
