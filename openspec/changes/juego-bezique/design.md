## Context

El Bezique se parece al Schnapsen: dos jugadores, bazas con robo, cantes y una fase final con obligaciones. Pero hay tres diferencias:
- hay dos copias de cada carta, como en el Spite and Malice;
- las cartas cantadas quedan a la vista y se pueden volver a usar en otras combinaciones;
- la mano dura muchas bazas (24 con mazo y 8 sin él).

## Goals / Non-Goals

**Goals:**
- Bezique clásico para 2, a 1.000, con las combinaciones elegidas y las 8 últimas bazas estrictas.
- IA normal por reglas y difícil que simula el carteo.
- La mesa de bazas compartida, con las cartas cantadas.

**Non-Goals:**
- Rubicon, Bezique chino, más jugadores y cantar varias combinaciones a la vez.

## Decisions

### 1. Cartas
- **Baraja:** `BARAJA_BEZIQUE`, dos veces la francesa del 7 al As. Las copias comparten `IdCarta`, así que las manos son multiconjuntos (como en el Spite and Malice).
- **Rango:** A 8, 10 7, K 6, Q 5, J 4, 9 3, 8 2 y 7 1.

### 2. Estado (`juegos/bezique.ts`)
- **Config:** `{ objetivo: 1000 }`.
- **Cartas:** `manos`, `cantadas` (por jugador, el multiconjunto de cartas de su mano que están boca arriba), `mazo`, `vuelta` (la carta vuelta o `null`) y `triunfo`.
- **Turno:** `fase` (`'bazas'`, `'declarar'` o `'final'`), `turno`, `mesa` y `ultimaBaza`.
- **Cantes:**
  - `usadas`: por jugador y por tipo de combinación, el multiconjunto de cartas ya usadas;
  - `cantes`: la lista de declaraciones hechas en la mano, con su jugador, tipo, cartas y puntos.
- **Puntos:** `bazasGanadas` (las cartas ganadas por cada uno, para las brisques), `puntosMano`, `puntos` (marcador) y `resultadosManos`.
- **Otros:** `repartidor` y `azar`.

### 3. Acciones
- **`jugar { carta }`:** con mazo, cualquier carta; en la fase final, las legales según la spec.
- **`cantar { tipo, cartas }`:** solo en la fase `'declarar'` del ganador de la baza.
  - `cartas` va ordenada, para que la acción sea canónica.
  - Para cada tipo se generan las combinaciones posibles con las copias que tenga (como mucho una por tipo y palo), y se filtran por las reglas de cartas nuevas y de cartas ya usadas.
- **`cambiar`:** el 7 de triunfo por la vuelta.
- **`pasar`:** no declarar.

Tras la declaración se roba solo, y si el mazo se ha acabado se pasa a la fase final.

### 4. Combinaciones y reutilización
Tipos: `matrimonio`, `bezique`, `dobleBezique`, `cuatroJ`, `cuatroQ`, `cuatroK`, `cuatroA`, `escalera` y `siete`.

Una combinación es legal si:
- las cartas están en la mano;
- al menos una no está en `cantadas`;
- para cada carta, las ya usadas en ese tipo son menos que las copias de esa carta en la mano;
- en un matrimonio de triunfo, el K y la Q no están ya usados en una `escalera`.

Para las reglas, el matrimonio de triunfo y el de otro palo son el mismo tipo; los puntos se calculan aparte.

### 5. Fin y puntos
- **Fin de la mano:** se suman 10 por la última baza y 10 por cada brisque (A o 10) en `bazasGanadas`.
- **Siguiente mano:** se alterna el repartidor. Si alguno llega al objetivo y no hay empate, la partida termina.
- **Resultado:** gana el de más puntos, y los `puntos` del `Fin` son los del marcador.

### 6. Vista
- **Visible:** su mano y sus cantadas; las cantadas del rival; `cartasEnMano`, `enMazo`, `vuelta` y `triunfo`; la mesa y la última baza; `jugadas` (las cartas jugadas en la mano), los `cantes`, los puntos, la fase y el turno.
- **Oculto:** el resto de la mano del rival y el mazo.

### 7. IAs
- **Normal (`ia/bezique-basica.ts`):** las reglas de la spec.
  - Guarda las cartas de las combinaciones que ya podría cantar, los K y las Q, la Q de picas y la J de diamantes.
  - En las últimas bazas, cuando sale, juega su carta más alta que no sea triunfo. La spec no dice nada de la salida.
- **Difícil (`ia/reconstruir/bezique.ts`):** `SIMULABLE_BEZIQUE`.
  - **Qué decide la normal:** las declaraciones (`decideLaBase` en la fase `'declarar'`).
  - **Qué simula:** las cartas, como mucho `horizonte` 24 jugadas, con la valoración de la mano: sus puntos de la mano menos los del rival, contando las brisques que lleva.
  - **Reconstrucción:**
    - la mano del rival son sus cantadas más cartas al azar de las que no se ven, contando las copias;
    - el mazo, al azar;
    - la vuelta, la que se ve.
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 80. Gana a la normal 135 de 200 partidas (a 300 puntos) y decide en 161 ms como máximo.

### 8. Cliente
- **`MesaBezique.svelte`:** sobre `MesaBazas`.
  - **Mazo y vuelta:** `mazo` y `muestra` (la carta vuelta).
  - **Cartas cantadas del rival:** en la barra de información, en pequeño (`cantadas-rival`).
  - **Mi mano:** mis cartas cantadas se marcan con una clase.
  - **Declarar:** las acciones de declaración son botones (`cantar-{tipo}-{i}`, `cambiar` y `pasar`).
- **Cartas repetidas en la mesa compartida:** `ManoPropia` y `Tapete` usaban la carta como clave y no admitían copias. Ahora cada copia lleva su número, y `ManoPropia` marca las cartas cantadas (`marcadas`, que llega a través de `MesaBazas`).
- **`ResumenBezique.svelte`:** el resumen de la mano.
- **Fin:** la pantalla de fin con el marcador.

## Risks / Trade-offs

- **[Muchas combinaciones posibles]** → Por tipo y palo se genera una sola: la que más cartas nuevas usa. Es suficiente para el jugador y para la IA.
- **[Partidas largas]** → Una partida a 1.000 dura varias manos de 32 bazas. Los tests de partidas completas usan IAs rápidas y la suite del contrato limita los pasos.
- **[Copias de cartas]** → Como en el Spite and Malice, la interfaz identifica las cartas de la mano por su posición, y la acción por el `IdCarta`.
