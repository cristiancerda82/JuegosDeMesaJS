## Context

El Cuarenta comparte con la Scopa:
- las capturas por número y por suma;
- las cartas recogidas boca abajo;
- la mesa que va al último que capturó;
- 2 jugadores o 4 en parejas.

Cambian varias cosas:
- la baraja es la francesa sin 8, 9 y 10, y las figuras no suman;
- capturar es opcional;
- la escalera alarga la captura sola;
- se puntúa durante la mano (ronda, caída y limpia) y la partida acaba en cuanto un bando llega a 40;
- al final de la mano solo cuentan los cartones.

Se reaprovechan `combinaciones` de la Escoba y el modelo de la reconstrucción y de la mesa de la Scopa.

## Goals / Non-Goals

**Goals:**
- Cuarenta de 2 y de 4 en parejas a 40 puntos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- «38 no juega»;
- la doble ronda;
- el «dos por darlas»;
- la mesa a dos chicas;
- las variantes de Quito (caída y limpia que no se suman).

## Decisions

### 1. Cartas y capturas (`juegos/cuarenta.ts`)
- **Baraja:** `crearBaraja('francesa52')` sin los valores 8, 9 y 10 (`BARAJA_CUARENTA`). La J, la Q y la K tienen los valores internos 11, 12 y 13.
- **Orden y valor:**
  - `rangoCuarenta(carta)` da el orden de la escalera: 1 a 7, J 8, Q 9 y K 10.
  - `valorCuarenta(carta)` da el valor para sumar: 1 a 7, o `null` en las figuras.
- **Capturas base:** `capturasCuarenta(mesa, carta)` devuelve las capturas legales sin la escalera.
  - Cada carta de la mesa del mismo rango, por separado.
  - Si la carta jugada tiene valor, `combinaciones` de la Escoba sobre las cartas de la mesa con valor, solo las de dos o más cartas.
- **Escalera:** `escaleraCuarenta(mesaRestante, carta)` va tomando, desde el rango de la carta jugada más 1, la primera carta de la mesa de cada rango seguido.
- **Acción:** `jugar { carta, captura }`, con `captura` la elección base (vacía para dejarla en la mesa). La transición añade la escalera, así que hay una acción por elección y no por escalera.
  - Dejar la carta en la mesa es siempre legal.
  - Se quitan las elecciones repetidas: dos cartas de la mesa del mismo rango dan dos acciones, porque solo una puede ser la caída.

### 2. Caída, limpia y ronda
- **Caída:** el estado guarda `caible`, la carta que el jugador anterior acaba de dejar en la mesa.
  - Se pone al dejar una carta sin capturar.
  - Se borra al capturar y al repartir.
  - Hay caída si la captura base es esa sola carta.
- **Limpia:** la mesa queda vacía tras la captura con la escalera.
- **Ronda:** al repartir, `rondaCuarenta(mano)` da el rango con tres o más cartas, o `null`.
  - Las rondas del reparto (`rondas: { asiento, rango, cartas: 3 | 4 }[]`) son públicas.
  - Se anotan por orden de juego desde el que sale.
- **Anotar:** `anotar(estado, bando, puntos)` suma a `puntos` y a los tantos de la mano.
  - Si el bando llega a la meta, el estado queda terminado y se cierra la mano a medias, con su resultado sin cartones (`completa: false`), para que la pantalla de fin tenga resumen.

### 3. Cartones y fin de la mano
- `cartonesCuarenta(cartas)`: con menos de 20, 0; si no, `6 + 2 · ⌈(n − 20) / 2⌉`. Con 20 y 20 nadie anota: ninguno pasa de 20 y el otro no lo supera, así que se trata aparte.
- **Al cerrar la mano:**
  - la mesa va al último que capturó;
  - se anotan los cartones;
  - se guarda `ResultadoManoCuarenta`: por bando, las cartas, las rondas, caídas y limpias, los puntos de cada concepto y `puntosTras`;
  - si nadie llega a la meta, nueva mano con el siguiente repartidor.

### 4. Estado
- **Config:** `{ jugadores: 2 | 4, meta: 40 }`. La meta va en la config para que las pruebas usen partidas más cortas; el cliente juega siempre a 40.
- **Como en la Scopa:**
  - `repartidor`, `mazo`, `mesa`, `manos`, `turno`;
  - `recogidas` (por bando), `ultimoEnRecoger`, `ultimaJugada`;
  - `puntos` y `resultadosManos`.
- **Del Cuarenta:**
  - `caible`;
  - `rondas` del reparto;
  - `jugadasReparto` (las cartas que ha jugado cada asiento desde el reparto, que son públicas);
  - `tantos` (por bando: rondas, caídas y limpias de la mano).
- **Otros:** `azar`.

### 5. Vista
- La mano propia, la mesa, el mazo, las cartas recogidas (solo cuántas) de cada bando, la última jugada, `caible`, las rondas, los tantos, los resultados y los puntos de la partida.
- Para la reconstrucción y la IA, la vista lleva las cartas jugadas por cada asiento en el reparto (`jugadasReparto`), que son públicas: se vieron caer en la mesa. Con ellas se sabe cuántas cartas de su ronda le quedan a cada uno, sin guardar aparte las cartas de la ronda.

### 6. IAs
- **Normal (`ia/cuarenta-basica.ts`):** la valoración de la spec.
  - «No ha visto» cuenta su mano, la mesa y las jugadas visibles de la mano, en la última jugada y en las jugadas del reparto.
  - Las cartas recogidas de manos anteriores no cuentan: se reparten de nuevo.
- **Difícil (`ia/reconstruir/cuarenta.ts`):** `SIMULABLE_CUARENTA`.
  - **Reconstrucción:**
    - con `repartirConPermitidos`, las manos ajenas, el mazo y las recogidas de cada bando al azar con su tamaño;
    - a quien anunció ronda se le dan primero las cartas de su rango que no se ven, menos las que ya jugó en el reparto;
    - si la ronda era de tres, la cuarta queda fuera de su mano.
  - **Valoración:** la diferencia de puntos de la mano entre su bando y el otro, más un desempate con las cartas recogidas, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 50, `presupuesto` 500 y `horizonte` 32; a medias, cada carta recogida de más vale 0,5.
    - Con los de la Scopa (30, 300 y 24, con 0,3 por carta), la difícil ganaba a la normal 112 de 200 partidas con 2, pero solo 52 de 100 con 4.
    - Con estos gana 120 de 200 con 2 (137 ms como máximo) y 58 de 100 con 4 (158 ms).
    - Con 4 la ventaja es pequeña: la mano tiene mucho azar y la normal ya evita las caídas y las limpias fáciles.

### 7. Cliente
- **`MesaCuarenta.svelte`:** a partir de `MesaScopa`.
  - **Elección:** al tocar una carta con más de una opción (contando dejarla), se eligen las cartas de la mesa o «Dejar».
  - **Información:**
    - la carta `caible` resaltada;
    - las rondas del reparto;
    - las caídas y limpias de la última jugada.
  - **Con 4:** los rivales a los lados y el compañero enfrente.
- **`ResumenCuarenta.svelte`:** por bando, cartas, cartones, rondas, caídas y limpias, con los puntos.
- **Opciones:** 2 o 4 jugadores.
- **Fin:** el Cuarenta entra en la rama de parejas de `Fin.svelte` (con 2, cada bando es un jugador, como en la Scopa).
- **Sala de espera:** entra en la lista de `PAREJAS`.

## Risks / Trade-offs

- **Duplicar la mesa de la Scopa** → se copia y se adapta, como la Scopa hizo con la Escoba, para no tocar un juego que funciona.
- **Capturar opcional** → casi duplica las acciones legales. La IA difícil tiene más ramas que simular; se compensa con el horizonte.
