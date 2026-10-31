## Context

El Piquet tiene tres fases por mano: el cambio con el montón, las declaraciones (sin decisiones, porque el usuario eligió que se comparen solas) y doce bazas sin triunfo. Se parece al Schnapsen y al Bezique en ser para dos y tener montón, pero sus declaraciones son comparaciones entre manos y no cantes.

## Goals / Non-Goals

**Goals:**
- Piquet de 2 con cambio, declaraciones automáticas, bazas con sus puntos, repique, pique, capote y *rubber* de 6 manos.
- IA normal por reglas y difícil que simula el carteo.

**Non-Goals:**
- La *carte blanche*, callar combinaciones y mirar el montón que sobra.

## Decisions

### 1. Cartas (`juegos/piquet.ts`)
- **Baraja:** `BARAJA_PIQUET`: la francesa de 52 del 7 al As.
- **Rango:** A 14, K 13, Q 12, J 11 y el resto su número.
- **Valor para el punto:** As 11, figuras 10 y el resto su número.

### 2. Estado
- **Config:** `{ manos: 6 }`.
- **Cartas:** `manos`, `monton` (el siguiente que se roba es el primero), `descartes` (por jugador) y `cambiadas` (cuántas cambió cada uno).
- **Turno:** `fase` (`'cambio'` o `'bazas'`), `turno`, `mayor`, `mesa`, `ultimaBaza` y `bazas` (por jugador).
- **Declaraciones:** `declaraciones`: el resultado del punto, la secuencia y el conjunto, cada uno con su ganador, sus cartas y sus puntos.
- **Puntos:** `puntosMano`, `repique` y `pique` (quién, si alguno), `puntos` (de la partida) y `resultadosManos`.
- **Otros:** `azar`.

### 3. Acciones
- **`descartar { carta }`:** en el cambio, una a una.
  - El mayor, mientras tenga menos de 5 descartadas.
  - El menor, mientras haya en el montón más cartas que descartes suyos.
- **`robar`:** cierra el cambio del jugador y roba tantas como descartó.
  - El mayor solo puede robar con 1 descarte o más.
  - Tras robar el menor, se hacen las declaraciones y empiezan las bazas.
- **`jugar { carta }`:** en las bazas, siguiendo el palo.

### 4. Declaraciones (`declararPiquet(manos, mayor)`)
- **El punto:** por cada jugador, el mejor (largo, valor) de sus palos.
- **La secuencia:** todas las escaleras de 3 o más (cada palo, tramos máximos), la mejor por (largo, carta alta).
- **El conjunto:** los grupos de 3 o 4 cartas iguales del 10 al As, el mejor por (tamaño, rango).
- **Anotación:** se anotan los tres en orden, primero el mayor. Si uno llega a 30 con sus declaraciones y el otro no ganó ninguna, suma el repique.

### 5. Bazas y pique
- **Al salir:** se anota 1 para quien sale.
- **Al resolver:** si gana quien no salió, anota 1; la última baza suma 1 más.
- **Pique:** mientras el menor tenga 0 en la mano, sin repique, el primer punto que lleve al mayor a 30 suma los 30 del pique.
- **Fin de la mano:** al acabar se suman las cartas o el capote.

### 6. Rubber
- **Siguiente mano:** se alternan el repartidor y el mayor.
- **Fin:** tras la sexta mano, termina.
- **Resultado:** el `Fin` da como `puntos` los totales. La vista da el valor de la partida para el ganador.

### 7. Vista
- **Visible:** su mano y sus descartes; `cartasEnMano`, `enMonton` y `cambiadas`; las declaraciones (con sus cartas); `mesa`, `ultimaBaza` y `bazas`; los puntos y los resultados.
- **Jugadas:** las cartas jugadas en la mano, para reconstruir.

### 8. IAs
- **Normal (`ia/piquet-basica.ts`):** la valoración de la spec.
  - **Valor de cada carta:** rango − 6, + 4 si es de su palo más largo, + 3 si tiene la carta de al lado del mismo palo, y + 3 si hay otra igual del 10 al As.
  - **Descarte:** se descartan las de valor menor que 6, empezando por la más baja.
- **Difícil (`ia/reconstruir/piquet.ts`):** `SIMULABLE_PIQUET`.
  - **Qué decide la normal:** el cambio.
  - **Qué simula:** las bazas hasta el final de la mano.
  - **Reconstrucción:** las cartas que no se ven se reparten entre la mano del rival, sus descartes y el montón, con las restricciones de la spec niveles-ia.
  - **Valoración:** sus puntos de la mano menos los del rival, entre 10.
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 80. La difícil gana a la normal 131 de 200 partidas (de 2 manos) y decide en 87 ms como máximo; la normal gana 184 de 200 al azar.

### 9. Cliente
- **`MesaPiquet.svelte`:** sobre `MesaBazas`.
  - **El montón:** como `mazo`.
  - **El cambio:** las cartas de la mano que se pueden descartar se marcan jugables; al tocarlas se descartan, y el botón `robar` cierra el cambio.
  - **Las declaraciones:** en la barra de información (`declaracion-{tipo}`).
- **`ResumenPiquet.svelte`:** el resumen de la mano.
- **Fin:** el Piquet entra en la lista de juegos sin parejas de `Fin.svelte`, con los totales y el valor de la partida.
- **Manos de 11 y 12 cartas en la mesa para dos:** las cartas son más grandes que en la de cuatro y no cabían en 360 px. `ManoPropia` estrecha la separación entre cartas en pantallas pequeñas cuando hay 11 o 12; en escritorio no cambia nada.

## Risks / Trade-offs

- **[Descartar carta a carta]** → Generar todos los descartes posibles (hasta 1.585) haría las acciones demasiadas; carta a carta son como mucho 13.
