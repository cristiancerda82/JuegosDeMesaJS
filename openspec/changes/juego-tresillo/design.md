## Context

El Tresillo junta piezas que la suite ya tiene:
- la subasta con un jugador solo contra dos, como el Tysiącha y el Préférence;
- el cambio de cartas con el monte para varios jugadores, como el Bourré;
- las fichas y el bote, como el Bourré.

Lo propio es:
- el orden de las cartas, que depende del palo del triunfo y de su color;
- los matadores, que son siempre triunfo y tienen el privilegio de no tener que echarse;
- la vuelta, con el triunfo descubierto del monte;
- el cobro por sacada, puesta o codillo.

Se reaprovechan:
- la mesa de bazas compartida (`MesaBazas`) para 3, como el Tysiącha;
- el cambio carta a carta del Bourré (descartar y luego robar);
- la reconstrucción con `repartirConPermitidos` y los fallos.

## Goals / Non-Goals

**Goals:**
- Tresillo para 3 con entrada, vuelta y solo, 100 fichas y 12 manos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- La bola, la preferencia de los oros, ver el resto del monte y las variantes de 4.

## Decisions

### 1. Cartas (`juegos/tresillo.ts`)
- **Baraja:** la española de 40.
- **Triunfo:** `esTriunfoTresillo(carta, triunfo)`: las del palo del triunfo, más la espadilla (`espadas-1`) y el basto (`bastos-1`).
- **Malilla:** `malillaTresillo(triunfo)`: `${triunfo}-2` si es negro, `${triunfo}-7` si es rojo.
- **Matadores:** `esMatadorTresillo(carta, triunfo)`: espadilla, malilla y basto.
- **Rango:** `rangoTresillo(carta, triunfo)`, un número mayor cuanto más alta:
  - los triunfos, según el orden de la spec, por encima de 100;
  - las demás, según el orden de su color.
- **Cartas legales:** `cartasLegalesTresillo(mano, mesa, triunfo)`.
  - **Al salir:** todas.
  - **Sale un palo que no es triunfo:** las de ese palo sin contar la espadilla ni el basto (que son triunfo); si no tiene, todas.
  - **Sale triunfo:** las que obligan son los triunfos que no son matadores y los matadores más bajos que la carta de salida (si es un matador). Si tiene alguna de ellas, MUST echar un triunfo (cualquiera, también un matador); si no, todas.
- **Ganadora:** `ganadoraTresillo`: el triunfo con más rango o, si no hay, la carta de más rango del palo de salida.

### 2. Fases y acciones
- **Fases:** `'subasta' | 'triunfo' | 'cambio' | 'bazas'`.
- **Acciones:**
  - `pujar { contrato }` y `pasar` (en `subasta`);
  - `triunfo { palo }` (en `triunfo`, solo con entrada o solo);
  - `descartar { carta }` y `robar` (en `cambio`: una carta por acción; `robar` cierra su cambio y roba tantas como descartó; en la vuelta, el hombre no puede `robar` sin haber descartado);
  - `jugarCarta { carta }` (en `bazas`).
- **Subasta:** `pujas: (Contrato | 'paso' | null)[]` por asiento y `pujaMayor`. Se va por turno saltando a quien ha pasado. Acaba:
  - cuando hay una puja y los demás han pasado: el que la hizo es el hombre;
  - cuando pasan los tres: se cierra la mano sin jugar, con un resultado `pasada`.
- **Tras la subasta:**
  - con entrada o solo, `triunfo` con el hombre;
  - con vuelta, se descubre `vuelta = monte[0]`, su palo es el triunfo y empieza el `cambio` del hombre;
  - con solo, tras elegir el triunfo se salta el cambio del hombre.
- **Cambio:** el hombre (salvo en el solo) y luego cada defensor desde el siguiente al hombre. Al `robar`, el jugador roba del principio del monte; en la vuelta, la primera es la carta vuelta. `descartar` se limita a las que quedan en el monte (contando lo ya descartado en su turno).
- **Bazas:** sale el mano; 9 bazas.

### 3. Fichas y cobro
- **`fichas`** por asiento y **`bote`**. Al repartir, cada jugador pone 1 si tiene.
- **`VALOR_CONTRATO_TRESILLO`:** entrada 2, vuelta 4, solo 6.
- **Al cerrar las bazas** (con `pago(de, a, n)` que no pasa de las fichas de `de`):
  - **sacada:** el hombre se lleva el bote y cada defensor le paga el contrato;
  - **puesta:** el hombre paga al bote tanto como había y el contrato a cada defensor;
  - **codillo:** el hombre paga al defensor con más bazas tanto como había en el bote (el primero desde el hombre si empatan) y el contrato a cada defensor.
- **`ResultadoManoTresillo`:**
  - `repartidor`, `pasada` (si pasan los tres);
  - `hombre`, `contrato`, `triunfo`, `bazas` (sin la vuelta, que en la mano siguiente vuelve a estar oculta);
  - `desenlace` (`'sacada' | 'puesta' | 'codillo'`), `codillo` (asiento o `null`);
  - `bote` (el que se jugó), `cambioFichas`, `fichasTras`, `boteTras`.
- **Fin:** tras `config.manos` manos (12; menos en las pruebas), o cuando un jugador se queda sin fichas. Gana quien tiene más fichas.

### 4. Estado y vista
- **Config:** `{ manos: number; fichas: number }`, con 12 y 100 por defecto.
- **Estado:**
  - `repartidor`, `manos`, `monte`, `descartes`;
  - `fase`, `turno`, `pujas`, `pujaMayor`, `hombre`, `contrato`, `triunfo`, `vuelta`;
  - `cambiadas` (cuántas cambió cada uno, o `null` si aún no), `descartando`;
  - `mesa`, `ultimaBaza`, `jugadasPor`, `fallos`, `bazas`;
  - `fichas`, `bote`, `boteJugado`, `numeroMano`, `resultadosManos`, `azar`.
- **Fallos:** por asiento, los palos que no siguió (cuando salió un palo que no era triunfo) y la carta de salida de triunfo más alta a la que no echó triunfo (para la reconstrucción).
- **Vista:**
  - la mano propia y cuántas cartas tiene cada uno;
  - cuántas quedan en el monte;
  - la vuelta;
  - todo lo público (salvo los descartes y el monte).

  `ultimaBaza` se vacía al repartir.

### 5. IAs
- **Normal (`ia/tresillo-basica.ts`):** las reglas de la spec, con `bazasEsperadasTresillo(mano, triunfo)` y `mejorTriunfoTresillo(mano)`.
- **Difícil (`ia/reconstruir/tresillo.ts`):** `SIMULABLE_TRESILLO`.
  - **Reconstrucción:**
    - con `repartirConPermitidos`, entre las manos ajenas, los descartes ajenos y el monte;
    - la vuelta va a la mano del hombre si no la ha jugado y ya ha robado;
    - se respetan los fallos.
  - **`decideLaBase`:** solo en el cambio. La subasta y el triunfo también se simulan: decidiéndolos como la normal, la difícil ganaba 65 de 200 partidas contra dos normales (la parte justa son 67), y simulándolos, 92.
  - **Valoración:** el cambio de fichas del asiento en la mano, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 40 y `presupuesto` 400. La difícil gana 92 de 200 partidas contra dos normales, con 95 ms como máximo.

### 6. Cliente
- **`MesaTresillo.svelte`:** sobre `MesaBazas` con 3 jugadores, a partir de `MesaTysiacha` y `MesaBourre`.
  - **Subasta:** botones con los contratos que puede pujar y «Paso».
  - **Triunfo:** un botón por palo.
  - **Cambio:** las cartas tocadas se descartan y luego «Cambiar N» o «No cambiar».
  - **Información:** la vuelta (mini carta), el monte, el hombre, el contrato, el triunfo, el bote, mis fichas y la mano de las 12.
  - **Detalle de cada asiento:** su puja, «Hombre», cuántas cambió, sus bazas y sus fichas.
- **`ResumenTresillo.svelte`:** la línea con el hombre, el contrato, el triunfo y el desenlace (o «Pasan todos»), y la tabla de bazas, el cambio de fichas y las fichas.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **El orden de las cartas es poco intuitivo** → la guía lo explica con una tabla por color, y la mano se ordena por rango con el triunfo a la izquierda.
- **El privilegio de los matadores complica las cartas legales y la reconstrucción** → se guarda la carta de salida de triunfo más alta a la que no se echó triunfo, que basta para saber qué triunfos no puede tener.
- **Manos en que pasan los tres** → cuentan como mano para que la partida no se alargue; el bote crece.
