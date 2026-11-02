## Context

La Scopa comparte con la Escoba la baraja, los valores de las cartas, las capturas por suma, las cartas recogidas boca abajo y la mesa que va al último que capturó. Cambian varias cosas:
- se captura por el valor de la carta y no completando 15;
- hay que capturar la carta igual antes que una suma, y capturar es obligatorio;
- con 4 se reparten 10 cartas de golpe;
- la puntuación usa la primiera y umbrales fijos;
- la última jugada no hace scopa.

Se reaprovechan `valorEscoba` y `combinaciones` de la Escoba y el modelo de su reconstrucción y su mesa.

## Goals / Non-Goals

**Goals:**
- Scopa de 2 y Scopone de 4 a 11 puntos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El «asso piglia tutto», la partida a 21 y la Scopa por rondas con 4.

## Decisions

### 1. Capturas (`juegos/scopa.ts`)
- **Capturas posibles:** `capturasScopa(mesa, carta)` devuelve las capturas legales.
  - Si hay cartas de su valor en la mesa, cada una por separado.
  - Si no, `combinaciones(mesa, valor)` de la Escoba (las de dos o más cartas, porque una sola sería de su valor).
- **Captura obligatoria:** la acción de dejar la carta en la mesa solo existe si no hay ninguna captura.

### 2. Puntos
- **Primiera:** `primieraScopa(cartas)`, la suma de la mejor carta de cada palo con la tabla de la spec.
- **Mano:** `puntuarManoScopa(recogidas, scopas)` da por bando:
  - el recuento: cartas, oros, settebello, primiera y scopas;
  - los puntos de cada concepto y el total.

### 3. Estado
- **Config:** `{ jugadores: 2 | 4, meta: 11 }`. La meta va en la config para que las pruebas usen partidas más cortas; el cliente juega siempre a 11.
- **Como en la Escoba:** `repartidor`, `mazo`, `mesa`, `manos`, `turno`, `recogidas` (por bando), `scopas`, `ultimoEnRecoger`, `ultimaJugada` y `resultadosManos`.
- **Otros:** `azar`.

### 4. Acciones y reparto
- **Acción:** `jugar { carta, captura }`, como en la Escoba.
- **Scopa:** si la mesa queda vacía tras capturar y no es la última jugada de la mano (quedan cartas en alguna mano o en el mazo), es scopa.
- **Con 2:** se reparten 3 más a cada uno cuando las dos manos se vacían y queda mazo.
- **Fin de la mano:** sin cartas en las manos ni en el mazo, se cierra la mano.
- **Fin de la partida:** si un bando llega a la meta con más puntos que el otro, termina. Si no, nueva mano con el siguiente repartidor.

### 5. Vista
La de la Escoba: la mano propia, la mesa, el mazo, las cartas recogidas (solo cuántas) y las scopas de cada bando, la última jugada, los resultados y los puntos de la partida.

### 6. IAs
- **Normal (`ia/scopa-basica.ts`):** la valoración de la spec, como la de la Escoba con el riesgo de dejar la mesa en 10 o menos.
- **Difícil (`ia/reconstruir/scopa.ts`):** `SIMULABLE_SCOPA`.
  - **Reconstrucción:** como en la Escoba, con `Ocultas` y `manosOcultas`: manos ajenas, mazo y recogidas al azar.
  - **Valoración:** la diferencia de puntos de la mano, más un desempate con el recuento (cartas, oros, sietes y primiera), más `bonoPartida`.
  - **Valores:** `reconstrucciones` 30, `presupuesto` 300 y `horizonte` 24.
    - Con 4, la mano entera son 40 jugadas y simularla toda llegaba a 241 ms; con el horizonte se simulan 24 jugadas y se valora la mano a medias con lo recogido.
    - La difícil gana a la normal 117 de 200 partidas con 2 (68 ms como máximo) y 68 de 100 con 4 (97 ms).
    - La normal gana 181 de 200 al azar.
    - Como en la Escoba, la difícil no lleva la cuenta de las cartas recogidas, que no se ven.

### 7. Cliente
- **`MesaScopa.svelte`:** a partir de `MesaEscoba`.
  - **Captura:** al tocar una carta con varias capturas, se eligen las cartas de la mesa.
  - **Scopone:** con 4, los rivales a los lados y el compañero enfrente.
- **`ResumenScopa.svelte`:** por bando, cartas, oros, settebello, primiera y scopas, con los puntos.
- **Opciones:** 2 o 4 jugadores.
- **Fin:** la Scopa entra en la rama de parejas de `Fin.svelte` (con 2, cada bando es un jugador, como en la Escoba).

## Risks / Trade-offs

- **[Duplicar la mesa de la Escoba]** → `MesaEscoba` tiene la lógica de elegir capturas; se copia y se adapta en lugar de generalizarla, para no tocar un juego que funciona.
