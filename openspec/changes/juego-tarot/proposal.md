## Why

El Tarot francés es el juego de bazas más popular de Francia. Se juega con una baraja propia de 78 cartas: los cuatro palos con un caballo de más, 21 triunfos numerados y la Excusa. En cada mano, uno (el *preneur*) apuesta un contrato contra los demás, se queda con el perro y tiene que llevarse en las bazas los puntos que exige el número de *oudlers* que gane. La suite gana una baraja nueva y un juego de bazas de uno contra todos distinto de los que ya tiene.

## What Changes

- **Baraja de Tarot** en el motor:
  - 78 cartas: los cuatro palos franceses del 1 al 10 con Sota, Caballo, Dama y Rey (el caballo es una carta nueva de la baraja francesa), los triunfos del 1 al 21 y la Excusa;
  - el cliente dibuja los triunfos, la Excusa y el caballo francés.
- Nuevo juego **Tarot** para 3, 4 o 5, jugable contra la IA y en red.
  - **Reparto:** 24 cartas a cada uno con 3 jugadores, 18 con 4 y 15 con 5, y un perro de 6 cartas (3 con 5 jugadores). Si alguien recibe el 1 de triunfo (el Petit) como único triunfo, se reparte de nuevo.
  - **Subasta:** una vuelta, cada uno pasa o sube: *Petite* (×1), *Garde* (×2), *Garde sans le chien* (×4) y *Garde contre le chien* (×6). Si todos pasan, la mano es nula.
  - **Perro:**
    - en la Petite y la Garde, se enseña a todos y el preneur se lo queda y descarta otras tantas cartas (ni Reyes ni *oudlers*; triunfos solo si no tiene otra cosa, y se enseñan);
    - en la Garde sans, cuenta para el preneur sin verse;
    - en la Garde contre, cuenta para la defensa sin verse.
  - **Con 5 jugadores:** el preneur llama a un Rey (o una Dama si tiene los cuatro Reyes) y quien lo tiene es su pareja secreta; si está en el perro o es suyo, juega solo.
  - **Bazas:**
    - hay que seguir el palo; si no se puede, fallar con triunfo; y con triunfo, subir si se puede;
    - la Excusa se puede jugar siempre, no gana nunca y vuelve al bando de quien la juega, que da a cambio media carta al ganador.
  - **Puntos de la mano:**
    - Reyes y *oudlers* (el 1 y el 21 de triunfo y la Excusa) 4,5; Damas 3,5; Caballos 2,5; Sotas 1,5; el resto 0,5; en total 91;
    - el preneur necesita 56 con ningún *oudler*, 51 con uno, 41 con dos y 36 con tres;
    - la mano vale (25 + la diferencia) por el multiplicador del contrato, más el *petit au bout* (10 por el multiplicador para quien gana la última baza con el Petit), más la *poignée* (20, 30 o 40 para el bando ganador, si alguien enseñó 10, 13 o 15 triunfos con 4 jugadores; 13, 15 o 18 con 3; 8, 10 o 13 con 5).
    - El preneur cobra de cada defensor; con 5, su pareja cobra una parte.
  - **Partida:** una ronda en la que cada uno reparte dos veces (6, 8 o 10 manos). Gana quien más puntos sume.
- **IA del Tarot en los tres niveles:**
  - **Normal:**
    - puja según el valor de su mano;
    - llama al Rey del palo que más tiene;
    - descarta las cartas de sus palos más cortos;
    - enseña la *poignée* si es el preneur;
    - en el carteo, carga puntos a su bando, gana con lo justo las bazas con puntos y guarda el Petit.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Tarot como un juego más en red.
- **Cliente:**
  - el Tarot en el menú, con el número de jugadores en las opciones;
  - una mesa de bazas para 3, 4 o 5 con la subasta, el perro, el descarte, la llamada al Rey, la *poignée* y el contrato;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:** el chelem, los anuncios de *misère* y las variantes de 3 jugadores sin perro.

## Capabilities

### New Capabilities
- `juego-tarot`: reglas del Tarot:
  - reparto y perro;
  - subasta y contratos;
  - perro y descarte;
  - llamada al Rey con 5;
  - bazas y la Excusa;
  - puntos de la mano, *petit au bout* y *poignées*;
  - la ronda;
  - vista del jugador.

### Modified Capabilities
- `baraja`: se añade la baraja de Tarot.
- `ia-jugadores`: se agrega la IA básica del Tarot.
- `niveles-ia`: el Tarot entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Tarot con su mesa, sus cartas y su fin de partida.

## Impact

- `packages/engine`:
  - la baraja de Tarot en `baraja/cartas.ts` (nuevos identificadores `triunfo-N` y `excusa`, y el caballo francés con valor 14);
  - nuevos `juegos/tarot.ts`, `ia/tarot-basica.ts` e `ia/reconstruir/tarot.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - el dibujo de las cartas de Tarot en `Carta.svelte` y `dibujo.ts`;
  - nuevas `MesaTarot.svelte` y `ResumenTarot.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - de 3 a 5 jugadores, con la llamada al Rey con 5;
  - los cuatro contratos oficiales;
  - el *petit au bout* y las *poignées*, sin chelem;
  - una ronda en la que cada uno reparte dos veces.
