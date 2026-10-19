## Why

El Truc es el juego de envites por excelencia de la baraja española en Valencia y Cataluña: manos cortas de 3 cartas en las que pesa más el farol que las cartas. Añade a la suite apuestas de dos tipos que ningún juego tiene: el envit sobre los puntos de la mano y el truc sobre quién gana las bazas, con su escalera de subidas. Además permite retirarse a mitad de mano. Reutiliza el reparto y la mesa de bazas existentes, con una jerarquía de cartas propia.

## What Changes

- Nuevo juego **Truc** (valenciano, sin flor), jugable contra la IA y en red, con 2 jugadores o 4 en parejas (0-2 contra 1-3):
  - **Baraja y reparto:** baraja española de 40 cartas y 3 cartas a cada jugador. El reparto rota y es mano el siguiente al repartidor.
  - **Jerarquía**, de mayor a menor:

    | Puesto | Cartas |
    |---|---|
    | 1 | As de espadas |
    | 2 | As de bastos |
    | 3 | 7 de espadas |
    | 4 | 7 de oros |
    | 5 | Treses |
    | 6 | Doses |
    | 7 | Ases de copas y oros |
    | 8 | Reyes |
    | 9 | Caballos |
    | 10 | Sotas |
    | 11 | 7 de copas y de bastos |
    | 12 | Seises |
    | 13 | Cincos |
    | 14 | Cuatros |

    Las cartas del mismo puesto empatan: la baza es «parda».
  - **Bazas:**
    - gana la mano el bando que gana dos de las tres bazas;
    - una parda la decide la baza siguiente, y una parda tras una baza ganada la gana quien ganó esa;
    - si todo es pardo, gana el bando de la mano.
  - **Envit**, sobre los puntos de la mano:
    - dos cartas del mismo palo valen 20 más sus valores, con las figuras a 0; sin dos del mismo palo, vale la carta más alta;
    - solo se puede envidar en la primera baza, antes de haber jugado la propia carta;
    - se puede responder «vull», «no vull», «torne» (subir a 4) o «falta» (lo que le falta al que va ganando para cerrar la came);
    - con empate gana el más cercano a la mano;
    - se cobra al terminar la mano.
  - **Truc**, sobre la mano:
    - truc (2), retruc (3), quatre val (4) y joc fora (gana la came);
    - solo puede subir el bando que aceptó la última apuesta;
    - quien no quiere da a quien apostó el valor anterior.
  - **El envit va primero:** a un truc en la primera baza se puede responder envidando antes.
  - **Retirarse:** en su turno, un jugador se puede ir de la mano («me'n vaig»). Los rivales cobran lo que valga la mano en ese momento.
  - **Partida:** cada came se juega a 12 piedras y gana la partida quien gana dos cames. En Opciones se puede elegir una sola came.
- **IA del Truc en los tres niveles:**
  - la básica envida y truca según sus puntos y la fuerza de su mano, y a veces farolea con una probabilidad fija y reproducible;
  - la fácil se equivoca a veces;
  - la difícil simula las cartas que juega, y las apuestas las decide como la básica, como en el Mus.
- El servidor de salas admite el Truc como un juego más en red.
- **Cliente:**
  - el Truc en el menú y sus opciones (jugadores, cames, nivel de la IA);
  - una mesa sobre la mesa de bazas compartida, con los botones de envit, truc y respuestas, y «Me'n vaig»;
  - lo apostado y las bazas ganadas y pardas a la vista;
  - el resumen de cada mano y la guía «¿Cómo se juega?».
- **Fuera de alcance:** la flor, las señas entre compañeros y las variantes de 6 jugadores.

## Capabilities

### New Capabilities
- `juego-truc`: reglas del Truc:
  - jerarquía, reparto y bazas con pardas;
  - envit con sus respuestas y su valor;
  - truc y sus subidas;
  - retirarse;
  - puntuación por cames y fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Truc (envit, truc, respuestas, faroles y juego de cartas).
- `niveles-ia`: el Truc entra en la lista de juegos con tres niveles y en la reconstrucción de las cartas ocultas. Su difícil simula las cartas y no las apuestas.
- `mesa-cliente`: el menú incluye el Truc, con su mesa de apuestas y el resumen de la mano.

## Impact

- `packages/engine`:
  - nuevos `juegos/truc.ts`, `ia/truc-basica.ts` e `ia/reconstruir/truc.ts`, con sus tests y la suite genérica del contrato;
  - el Truc no usa las obligaciones del motor de bazas, pero sí sus tipos y su rotación de asientos;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`: nueva `MesaTruc.svelte` sobre `MesaBazas` y `ResumenTruc.svelte`; cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la sala de espera, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del Truc valenciano clásico y las valida el usuario: las figuras a 0 en el envit, las pardas, el envit primero, la falta y la partida a dos cames de 12.
