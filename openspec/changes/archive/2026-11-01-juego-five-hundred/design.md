## Context

El Five Hundred junta piezas que ya tiene la suite:
- una subasta por parejas, como el Bridge pero con valores fijos (Avondale);
- una viuda con descarte, como el Tarot;
- los «bowers» del Euchre, con el comodín por encima.

Lo nuevo es el comodín sin palo en los contratos sin triunfo, el misère con el compañero fuera, y que los rivales también suman con sus bazas, con el tope de 490.

## Goals / Non-Goals

**Goals:**
- Five Hundred de 4 en parejas a 500/−500, con subasta de Avondale, misère y misère abierto, viuda y comodín; con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Las variantes para 3, 5 o 6 jugadores y otras tablas de puntos.

## Decisions

### 1. Cartas (`juegos/five-hundred.ts`)
- **Baraja:** `BARAJA_FIVE_HUNDRED`: las 40 del 5 al As de cada palo, los cuatros rojos y `comodin-1`.
- **Palo efectivo:** `paloEfectivo(carta, contrato)`:
  - la otra Jota del color es del triunfo;
  - el comodín es del triunfo en los contratos con triunfo y `null` en los demás.
- **Rango:** `rangoFiveHundred(carta, contrato)`:
  - comodín 100;
  - Jota del triunfo 90;
  - otra Jota 80;
  - el resto, su valor natural (As 14).
- **Ganadora:** `ganadoraFiveHundred(mesa, contrato, paloNombrado)`.
- **Legales:** `cartasLegalesFiveHundred(mano, mesa, contrato, paloNombrado)`.

### 2. Pujas
- **Tipo:** `PujaFiveHundred` = `{ bazas, palo }` (con `palo` un palo o `'sin'`), `'misere'` o `'misereAbierto'`.
- **Funciones:** `valorPuja(p)` con la tabla, y `ordenPuja(p)` para comparar. El orden es el del valor, con el misère justo tras 8 picas y el misère abierto justo tras 10 diamantes.

### 3. Estado
- **Config:** `{ jugadores: 4, meta: 500 }`. El cliente siempre juega a 500; las pruebas usan menos, con el tope de los rivales en `meta − 10` y la derrota en `−meta`.
- **Fases:** `fase` (`'subasta'`, `'descarte'`, `'bazas'`), `repartidor`, `turno`.
- **Subasta:** `pujas` (la última de cada uno, o `'paso'`), `pasados`, `mejor` (`{ asiento, puja }` o `null`).
- **Cartas:**
  - `manos` y `viuda`;
  - `descartes` (de quien juega);
  - `mesa`, `paloNombrado`, `ultimaBaza` y `bazasGanadas` por pareja;
  - `jugadasPor` y `fallos`.
- **Partida:** `puntos` por pareja, `resultadosManos` y `azar`.

### 4. Acciones
- **`pujar { puja }` y `pasar`:** en la subasta.
- **`descartar { carta }`:** una a una, tres veces; tras la tercera empiezan las bazas.
- **`jugar { carta, palo? }`:** `palo` solo al salir con el comodín sin triunfo o en el misère, y es obligatorio entonces. Las acciones legales incluyen el comodín una vez por palo.

### 5. Fin de mano
- **Cierre:** al acabar las 10 bazas, o en el misère al ganar quien juega una baza, se anotan los puntos de la spec, con el tope de 490 para los rivales.
- **Resultado de la mano:** guarda el contrato, quién jugó, las bazas, lo que suma cada pareja y los puntos tras la mano.
- **Fin de la partida:** si la pareja que jugó cumple y llega a la meta, o si una pareja baja a −meta, termina; si no, se reparte con el siguiente repartidor.
- **Subasta sin pujas:** si pasan los cuatro, se reparte sin anotar nada y queda en el resultado como mano sin contrato (`contrato: null`).

### 6. Vista
- **Visible:** lo de la spec.
- **Misère abierto:** `abiertas` lleva la mano de quien juega desde que hay alguna carta jugada.
- **Descartes:** se ven solo en la vista de quien los hizo.

### 7. IAs
- **Normal (`ia/five-hundred-basica.ts`):** las reglas de la spec.
- **Difícil (`ia/reconstruir/five-hundred.ts`):** `SIMULABLE_FIVE_HUNDRED`.
  - **Qué decide la normal:** el descarte (`decideLaBase`).
  - **Subasta simulada (`candidatas`):** compara la puja de la normal, pasar y una baza más del mismo palo; si la normal pasa, compara pasar con la puja más baja de cada palo. Con la subasta igual que la normal, la difícil apenas ganaba a la normal (102 de 200), porque en el Five Hundred la puja decide casi toda la mano.
  - **Reconstrucción:**
    - huecos para las manos ajenas y, si los hizo otro, para sus 3 descartes;
    - los fallos con el palo efectivo;
    - la mano de quien juega el misère abierto, fija.
  - **Valoración:** la diferencia de lo que suman las parejas en la mano, entre 50, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80. La difícil gana a la normal 135 de 150 partidas a 500 puntos y 151 de 200 a 200 puntos, y decide en 100 ms como máximo; la normal gana 198 de 200 a una pareja que juega al azar.

### 8. Cliente
- **`MesaFiveHundred.svelte`:** sobre `MesaBazas`.
  - **Subasta:** una tabla de botones `puja-{bazas}-{palo}` (5 filas × 5 columnas), más `puja-misere`, `puja-misereAbierto` y `pasar`, con las que no se pueden apagadas.
  - **Descarte:** las cartas de la mano se marcan jugables y al tocarlas se descartan.
  - **Comodín:** al tocar el comodín cuando hay que nombrar palo, salen los botones `palo-{palo}`.
  - **Barra de información:**
    - el contrato (`contrato-500`);
    - las pujas (`puja-de-{asiento}`);
    - las bazas y los puntos de cada pareja;
    - las cartas del misère abierto (`abiertas`).
- **`ResumenFiveHundred.svelte`:** el contrato, las bazas y lo que suma cada pareja.
- **Fin:** juego por parejas, en la rama de parejas de `Fin.svelte`.

## Risks / Trade-offs

- **[La tabla de pujas en 360 px]** → 25 botones en 5 columnas de unos 56 px más una fila de misère y pasar; se comprueba en el E2E de 360 × 640.
- **[Comodín con palo nombrado]** → Duplicar la acción por palo es más simple que una fase aparte, y la IA la trata como cuatro acciones más.
