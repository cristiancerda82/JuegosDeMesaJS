## Context

El Klaverjas se parece mucho al Jass que acabamos de hacer: cuatro en parejas, la Jota y el 9 del triunfo arriba y puntos casi iguales. Cambian cuatro cosas:
- **Triunfo:** se propone un palo al azar en lugar de elegir modo.
- **Bazas:** las reglas de Rotterdam obligan a fallar y subir.
- **Roem:** las combinaciones se cuentan en cada baza y no en la mano.
- **Nat y partida:** el nat castiga a la pareja que juega y no gana, y la partida dura 8 manos.

Se reaprovecha el modelo del Jass: el motor de bazas, la reconstrucción y la mesa.

## Goals / Non-Goals

**Goals:**
- Klaverjas de Rotterdam para 4 en parejas a 8 manos, con propuesta del triunfo, roem, stuk, pit y nat; con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- La variante de Amsterdam, anunciar el roem a mano y otras duraciones.

## Decisions

### 1. Cartas (`juegos/klaverjas.ts`)
- **Baraja:** `BARAJA_KLAVERJAS`: la francesa de 52 del 7 al As.
- **Rango (`rangoKlaverjas(carta, triunfo)`):**
  - en el triunfo: J 8, 9 7, A 6, 10 5, K 4, Q 3, 8 2 y 7 1;
  - en los demás palos: A 8, 10 7, K 6, Q 5, J 4, 9 3, 8 2 y 7 1.
- **Puntos:** `puntosCartaKlaverjas(carta, triunfo)`, con las tablas de la spec.
- **Ganadora y legales:** `ganadoraKlaverjas(mesa, triunfo)` y `cartasLegalesKlaverjas(mano, mesa, triunfo)`, con las reglas de Rotterdam de la spec.
- **Roem:** `roemBaza(cartas, triunfo)` cuenta el roem de una baza:
  - la escalera más larga del mismo palo en el orden natural (7 … A);
  - los cuatro iguales;
  - el stuk.

### 2. Estado
- **Config:** `{ jugadores: 4, manos: 8 }`. El cliente siempre juega a 8; las pruebas usan menos.
- **Triunfo:**
  - `fase` (`'propuesta'`, `'eleccion'` o `'bazas'`);
  - `propuesto` (el palo al azar);
  - `pasados` (quién ha pasado);
  - `triunfo` y `juega` (la pareja que juega).
- **Cartas:** `manos`, `turno`, `mesa`, `ultimaBaza` (con su roem), `bazasGanadas` por pareja, `jugadasPor` y `fallos` (los palos de los que se sabe que no tiene).
- **Puntos de la mano:** `cartasMano` y `roemMano` por pareja.
- **Partida:** `puntos`, `resultadosManos` y `repartidor`.
- **Otros:** `azar`.

### 3. Acciones
- **`jugar`:** en la propuesta, juega con el palo propuesto.
- **`pasar`:** en la propuesta. Si pasa el cuarto, la fase pasa a `'eleccion'`, con el turno del siguiente al repartidor.
- **`elegir { palo }`:** en la elección, cualquiera de los cuatro.
- **`carta { carta }`:** en las bazas.

### 4. Fin de mano
- **Anotación:** se suman las cartas, los 10 de la última y el pit, y se aplica el nat. El resultado guarda:
  - las cartas, el roem y lo anotado por pareja;
  - si hubo nat o pit;
  - el triunfo y la pareja que jugó;
  - los puntos tras la mano.
- **Siguiente:** si quedan manos, se reparte con el siguiente repartidor y un nuevo palo propuesto.
- **Resultado:** al acabar la última mano, ganan los dos asientos de la pareja con más puntos, o es empate; los `puntos` del `Fin` son los de la pareja de cada asiento.

### 5. Vista
Lo de la spec, con `jugadasPor` y `fallos` para reconstruir.

### 6. IAs
- **Normal (`ia/klaverjas-basica.ts`):** las reglas de la spec; el juego de cartas, como el del Jass.
- **Difícil (`ia/reconstruir/klaverjas.ts`):** `SIMULABLE_KLAVERJAS`.
  - **Qué decide la normal:** la propuesta y la elección (`decideLaBase` en las fases `'propuesta'` y `'eleccion'`).
  - **Reconstrucción:** como en el Jass, con los fallos de la spec niveles-ia.
  - **Valoración:** la diferencia de lo anotado en la mano entre parejas, entre 50, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80. La difícil gana a la normal 125 de 200 partidas (de 2 manos) y decide en 49 ms como máximo; la normal gana 169 de 200 a una pareja que juega al azar.

### 7. Cliente
- **`MesaKlaverjas.svelte`:** como `MesaJass`.
  - **Botones:** `jugar`, `pasar` y `palo-{palo}`.
  - **Barra de información:**
    - el palo propuesto (`propuesto`), o el triunfo y quién juega (`triunfo-klaverjas`);
    - la mano de las 8 (`mano-ronda`);
    - los puntos de la mano y de la partida;
    - el roem de la última baza (`roem`).
- **`ResumenKlaverjas.svelte`:** por pareja, las cartas, el roem y lo anotado, con el nat y el pit.
- **Fin:** juego por parejas, en la rama de parejas de `Fin.svelte`, con los puntos de cada pareja.

## Risks / Trade-offs

- **[Roem automático]** → En el juego real hay que anunciarlo; aquí se anota solo para no añadir una decisión que la IA y el jugador siempre tomarían igual.
