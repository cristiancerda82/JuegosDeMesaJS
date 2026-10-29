## Context

La Pesca no tiene bazas ni mesa común: cada turno es una o varias peticiones a otros jugadores, con robos del mar. La información pública es justamente lo interesante: quién pidió qué y qué se dio. La vista lleva ese registro completo, y la IA lo usa como memoria.

## Goals / Non-Goals

**Goals:**
- Pesca clásica de 2 a 6, con cuartetos y las reglas elegidas: reparto de 7 o 5, repetir al acertar y robar al quedarse sin cartas.
- Una mesa propia con selección de valor y rival.
- IA normal con memoria del registro y difícil por simulación con horizonte.

**Non-Goals:**
- Parejas en vez de cuartetos, pedir cartas concretas y jugar por equipos.

## Decisions

### 1. Estado (`juegos/pesca.ts`)
- **Config:** `{ jugadores: 2..6 }`, por defecto 4.
- **Cartas:** `manos`, `mar` (la siguiente que se roba es la última) y `cuartetos` (por jugador, la lista de valores bajados).
- **Turno:** `turno`.
- **Registro:** `registro`, una lista de `Peticion`:
  - `{ asiento, a, valor }`, quién pide, a quién y qué valor;
  - `dadas` (las cartas que dio el rival, quizá ninguna);
  - `pesco` (`null` si no hubo que pescar, `'nada'` si el mar estaba vacío, `'otra'` si pescó otra carta, o la carta si era del valor pedido);
  - `cuarteto` (el valor bajado tras la petición, o `null`).
- **Azar:** `azar`.

### 2. Acciones
- **Única acción:** `pedir { a, valor }`, solo a rivales con cartas y de valores que tiene en la mano. Las acciones se ofrecen ordenadas por rival y por valor.
- **Automático:**
  - los cuartetos (también los del reparto) se bajan solos;
  - el robo de quien empieza su turno, o sigue pidiendo, sin cartas;
  - saltar a quien no tiene cartas con el mar vacío.
- **Fin:** cuando hay 13 cuartetos bajados. Antes, si a un jugador le toca sin acciones posibles, se pasa al siguiente que las tenga. Siempre hay alguno: si solo uno tuviera cartas, tendría valores completos y ya los habría bajado.

### 3. Vista
- **Visible:** su mano, `cartasEnMano`, `enMar`, `cuartetos`, `turno` y el `registro` entero. En el registro, `pesco` solo enseña la carta si era la pedida; si no, sale `'otra'`.
- **Oculto:** las manos ajenas y el mar.

### 4. IAs
- **Conocimiento (`conocimientoPesca(vista)`):** recorre el registro y calcula, por jugador:
  - `tiene`: valores que tiene seguro. Se añade el que pide, el que recibe o enseña al pescar, y se quita al dar o bajar cuarteto.
  - `noTiene`: valores que no tiene. Se añade al decir «¡A pescar!» y se vacía cuando roba (al pescar o al quedarse sin cartas).
  - `cartasSabidas`: las cartas concretas que recibió o enseñó y aún tiene.

  Es una función pura, compartida por la normal y la reconstrucción.
- **Normal (`ia/pesca-basica.ts`):** las reglas de la spec con ese conocimiento.
- **Difícil (`ia/reconstruir/pesca.ts`):** `SIMULABLE_PESCA`.
  - **Reconstrucción:** primero deja en su mano las cartas sabidas de cada jugador. Después le da una carta oculta de cada valor que `tiene` y que no cubren las sabidas. El resto lo reparte con `repartirConPermitidos`, prohibiendo los valores de `noTiene`, y el mar se queda lo que sobra.
  - **Cuándo decide la normal:** si se sabe que un rival tiene uno de sus valores, pedírselo es lo mejor y decide la normal (`decideLaBase`); solo se simula cuando hay que adivinar.
  - **Horizonte:** 24 jugadas. Con 12, la difícil no ganaba a la normal.
  - **Valoración:** mis cuartetos menos los del mejor rival, más mis cartas en la mano / 20, más el bono de la partida.
  - **Candidatas:** todas, porque son pocas (rivales × valores en la mano).
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 80. Gana a la normal 63 de 200 partidas a cuatro (le corresponderían 50) y decide en menos de 100 ms. Es poca ventaja, porque la Pesca depende mucho de la suerte.
  - **Cuartetos en la mano:** si el reparto al azar deja las cuatro cartas de un valor en una mano (en una partida real se habrían bajado), se cambia una por otra del mar o de otra mano.

### 5. Cliente
- **`MesaPesca.svelte`:** mesa propia.
  - **Arriba, los rivales:** en una fila que se ajusta en 360 px, cada uno con su nombre, sus cartas (`asiento-{a}`) y sus cuartetos.
  - **Centro:** el mar (`mar`) y el aviso de la última petición (`aviso`).
  - **Abajo:** mis cuartetos y mi mano agrupada por valor. Cada grupo es un botón `valor-{v}`, y el que está marcado se resalta.
  - **Pedir:** tocar un rival activo (`pedir-{a}`) con un valor marcado hace la petición.
- **Pausa:** `pausaTras` hace una pausa cuando una petición de la IA cambia el registro, para leer el aviso.
- **Fin:** la pantalla de fin con los cuartetos de cada jugador.

## Risks / Trade-offs

- **[Registro largo]** → La vista crece con la partida, pero el total de peticiones es pequeño (unas decenas a cientos), y la reconstrucción solo lo recorre una vez.
- **[Restricciones imposibles al reconstruir]** → Si no se pueden cumplir (casos raros de muchas restricciones), las de `noTiene` se relajan, como en el Ocho loco.
- **[Partidas largas a dos]** → Con el mar grande, las peticiones fallidas son muchas. La suite del contrato usa un límite de pasos generoso.
