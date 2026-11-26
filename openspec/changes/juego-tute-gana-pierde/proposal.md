## Why

El siguiente juego recomendado de la revisión de los libros es el **Tute gana-pierde**, que describe Núñez Elvira. Es una variante del Tute para 3 jugadores con un objetivo al revés de lo normal: hay que hacer más tantos que nadie o menos que nadie. Quien se queda en medio se lleva la penalización.

Tiene dos rasgos propios:
- no hay triunfo al empezar: nace cuando un Rey y un Caballo del mismo palo caen en la misma baza, y quien la gana canta las cuarenta a la fuerza;
- cantar suma tantos, que pueden venir bien o mal según lo que busque cada uno.

Casi todo lo demás ya existe en la suite:
- el orden y los puntos de las cartas del Tute;
- las obligaciones de asistir, montar y fallar, con el sobrefallo libre;
- la partida por penalizaciones del Burro de bazas.

## What Changes

- Nuevo juego **Tute gana-pierde** para 3 jugadores, cada uno contra los demás, contra la IA y en red.
  - **Reparto:** con la baraja española sin ochos, nueves ni doses (36 cartas), 12 cartas a cada uno, de tres en tres. No hay carta de triunfo. El que reparte pasa al siguiente en cada mano.
  - **Cartas:** el orden y los puntos del Tute: As (11), Tres (10), Rey (4), Caballo (3), Sota (2), 7, 6, 5 y 4. Con las 10 de últimas, 130 tantos por mano.
  - **Bazas:** hay que asistir al palo y montar; sin el palo, fallar y montar el fallo. Si no se puede superar el fallo, cualquier carta. Sin triunfo, sin el palo se echa cualquiera.
  - **Triunfo y cantes:** cuando en una baza caen el Rey y el Caballo de un palo, quien la gana canta a la fuerza: si aún no hay triunfo, las cuarenta (40 tantos), y ese palo es triunfo desde la baza siguiente; si ya lo hay, las veinte (20) en ese palo.
  - **Penalización:** al acabar la mano, se penaliza a quien no ha hecho ni más ni menos tantos que nadie. Con empates, se penaliza a quienes no tienen el mínimo; si los tres empatan, a nadie.
  - **Partida:** acaba cuando alguien llega a 6 penalizaciones (o a 3, en las opciones). Ganan los que tienen menos.
- **IA del Tute gana-pierde en los tres niveles:**
  - **Normal:** en cada jugada decide si va a por el mínimo o a por el máximo, según sus tantos y los de los demás, y juega en consecuencia: cargar los puntos a otros y no ganar bazas, o ganarlas con puntos.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada carta hasta el final de la mano. La reconstrucción aplica lo que se sabe por las obligaciones, con el triunfo que había en cada baza.
- El servidor de salas admite el Tute gana-pierde como un juego más en red.
- **Cliente:**
  - el Tute gana-pierde en el menú (familia «Bazas para evitar»), con la opción del límite de penalizaciones;
  - una mesa de bazas para 3 con los tantos de cada uno, el triunfo (o «sin triunfo»), los cantes y las penalizaciones;
  - el resumen de cada mano con los tantos y quién se lleva la penalización;
  - el fin de partida con la clasificación;
  - la guía con sus ejemplos comprobados con el motor y su historia;
  - el consejo del modo asistido.
- **Fuera de alcance:** otras variantes «gana-pierde» (el Burro gana-pierde) y otros números de jugadores.

## Capabilities

### New Capabilities
- `juego-tute-gana-pierde`: reglas del Tute gana-pierde:
  - baraja y reparto;
  - valor y orden de las cartas;
  - bazas y obligaciones;
  - triunfo y cantes;
  - tantos y penalización;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Tute gana-pierde.
- `niveles-ia`: el Tute gana-pierde entra en la lista de juegos con tres niveles, con su reconstrucción.
- `mesa-cliente`: el menú incluye el Tute gana-pierde con su mesa y su fin de partida.
- `menu-juegos`: el Tute gana-pierde entra en la familia «Bazas para evitar».

## Impact

- `packages/engine`:
  - **Nuevos:** `juegos/tute-gana-pierde.ts`, `ia/tute-gana-pierde-basica.ts` e `ia/reconstruir/tute-gana-pierde.ts`, con sus tests y la suite genérica del contrato.
  - **Topes de la Manilla:** el cálculo de lo que se sabe por las obligaciones pasa a ser común (`topesPorObligaciones`), con el triunfo de cada baza y quién es rival de quién; la Manilla lo usa sin cambiar lo que deduce.
  - **Registro:** en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - **Nuevos:** `MesaTuteGanaPierde.svelte` y `ResumenTuteGanaPierde.svelte`.
  - **Cambian:**
    - el registro de juegos y las opciones;
    - el catálogo y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los E2E.
- No hay dependencias nuevas.
- Las reglas son las de Núñez Elvira; el límite de 3 penalizaciones es una opción de la suite.
