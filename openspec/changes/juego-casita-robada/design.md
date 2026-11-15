## Context

La suite ya tiene varios juegos de captura (Escoba, Scopa, Pishti), pero todos con reglas de suma o puntuación propias. La Casita robada es más simple: solo cuenta el número de la carta. Lo nuevo es que lo capturado (la casita) queda a la vista y se puede robar entero.

## Goals / Non-Goals

**Goals:**
- Casita robada de 2 a 4 jugadores, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Varias manos, parejas y variantes con suma.

## Decisions

### 1. Una partida es una pasada del mazo
La partida dura lo que tarda en acabarse el mazo. Con 40 cartas, 4 en la mesa y 3 por jugador, los repartos encajan:
- con 2 jugadores, 6 repartos;
- con 3, 4 repartos;
- con 4, 3 repartos.

Es una partida de pocos minutos, lo que se busca para los niños. No hay marcador entre manos.

### 2. Estado y acción (`juegos/casita-robada.ts`)
- **Config:** `{ jugadores: 2 | 3 | 4 }`; por defecto, 2.
- **Estado:**
  - `mesa`, `manos`, `mazo`, `casitas`;
  - `turno`, `ultimoEnLlevarse`;
  - `ultimaJugada`: quién, qué carta, qué se llevó de la mesa y a quién robó;
  - `final`: a quién fueron las cartas que quedaban en la mesa.
  - Cada casita es una lista de cartas, de abajo arriba.
- **Turno:** empieza el asiento 0. Al quedarse todos sin cartas, se reparten 3 más empezando por el 0 y sigue el orden.
- **Acción:** `{ tipo: 'jugar'; carta: IdCarta; robar: Asiento | null }`.
  - **Legales:** para cada carta de la mano, `robar: null` y un `robar: a` por cada rival con casita cuya carta de arriba tiene el mismo número. Robar es opcional: el jugador puede preferir no hacerlo.
  - **Al jugar**, la casita del jugador queda, de abajo arriba, así:
    1. lo que tenía;
    2. la casita robada;
    3. las de la mesa;
    4. la carta jugada.
- **Información pública:** las casitas son públicas enteras, porque todas sus cartas se han visto al entrar. La mesa muestra la carta de arriba de cada casita y cuántas tiene. Lo oculto es solo las manos ajenas y el mazo.
- **Resultado:** gana quien más cartas tiene en su casita; si todos empatan, es empate. `puntos` son las cartas de cada casita.

### 3. IAs
- **Normal (`ia/casita-robada-basica.ts`):**
  1. Si puede robar, roba la casita más grande. Si hay empate, la roba con la carta de la que quedan menos sin ver, para que no se la roben luego.
  2. Si no, si puede llevarse cartas de la mesa, juega la que se lleva más; a igualdad, la de la que quedan menos sin ver.
  3. Si no, deja en la mesa la carta de la que quedan menos sin ver (la que menos probabilidades tiene de servir a un rival); a igualdad, la más baja.
- **Difícil (`ia/reconstruir/casita-robada.ts`):** `SIMULABLE_CASITA_ROBADA`.
  - **Reconstrucción:** reparte al azar las manos ajenas y el mazo entre las cartas que no se ven (las que no están en la mesa, en las casitas ni en su mano).
  - **Valoración:** sus cartas al final menos la media de los rivales, dividido entre 5, más `bonoPartida`.
  - **Ajuste:** `reconstrucciones` y `presupuesto` se ajustan con las pruebas de tiempo y de fuerza.

### 4. Cliente
- **`MesaCasitaRobada.svelte`:**
  - **Asientos:** los rivales arriba, cada uno con sus cartas boca abajo y su casita (la carta de arriba y la cuenta).
  - **Centro:** la mesa con sus cartas, y el mazo con su cuenta.
  - **Abajo:** la mano del jugador y su propia casita.
  - **Jugar:**
    - si la carta solo tiene una jugada legal, al tocarla se juega;
    - si puede robar a alguien, sale un pequeño panel: «Robar a Rival 1», …, o «No robar» (`data-jugada` en cada botón, para el modo asistido).
  - **Aviso:** muestra lo que hizo el último («Rival 1 se lleva 2», «Rival 2 te roba la casita»).
- **Fin:** juego sin parejas, con la tabla de cartas de cada casita.
- **Guía y ejemplos:**
  - una captura (`antesDespues`): la carta jugada se lleva las de la mesa de su número;
  - un robo (`antesDespues`): la carta jugada se lleva la casita del rival.
  - Se comprueban con la transición del motor.
  - La guía termina con «Un poco de historia», plegada, como todas.

## Risks / Trade-offs

- **Con 2 jugadores hay 6 repartos y con 4 solo 3** → es el juego; la partida es corta en todos los casos.
- **Robar es opcional** → duplica algunas acciones legales, pero deja al jugador elegir no exponerse (por ejemplo, para no dejar arriba una carta que le pueden robar).
