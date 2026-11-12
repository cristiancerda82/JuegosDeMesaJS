## Context

El Hand and Foot es una canasta por parejas con dos montones por jugador (mano y pie), robo de 2 cartas y libros de 7. La Canasta del motor ya resuelve casi todo lo que comparten:
- las cartas con copia del Pinacle (`"picas-12#1"`), sus puntos y la clasificación de comodines, naturales y treses;
- la primera bajada con mínimo, con su `apertura` y la acción `deshacer`;
- la puntuación por desglose y el resumen de cada mano;
- la IA básica y la difícil, que simula solo robar o llevarse el pozo y qué descartar;
- la mesa del cliente, con la selección de cartas para bajar y añadir.

## Goals / Non-Goals

**Goals:**
- Hand and Foot para 4 en parejas a 4 rondas (mínimos 50, 90, 120 y 150), cerrar con 2 libros limpios y 2 sucios, y libro de comodines; con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Pedir permiso para cerrar, otras cantidades de jugadores y coger el descarte entero.

## Decisions

### 1. Cartas (`juegos/hand-and-foot.ts`)
- **Baraja:** `cartasHandAndFoot()`: las de `cartasPinacle` con copias de 0 a 4 (270). Si hace falta, `cartasPinacle(copias)` recibe el número de copias en lugar de duplicar el código.
- **Puntos y tipos:** los de la Canasta (`puntosCanasta`, `esComodinCanasta`, `esTresRojo`, `esTresNegro`, `valorCanasta`, `compararCanasta`), que ya están exportados.
- **Combinaciones:** `CombinacionHandAndFoot { id, bando, valor, cartas }`, con `valor` 0 para la de comodines.
  - `combinacionValidaHF(valor, cartas)`: de 3 a 7 cartas; si `valor` es 0, todas comodines; si no, al menos 2 naturales de ese valor y como mucho 3 comodines.
  - `esLibro` (7 cartas), `tipoLibro`: `'limpio' | 'sucio' | 'comodines'`.

### 2. Estado
- `ronda` (1 a 4), `repartidor`, `turno`, `fase: 'robar' | 'bajar'`.
- `manos` (lo que juega cada uno ahora: la mano o el pie), `pies` (el pie sin coger, o `[]` si ya lo cogió) y `enPie` por asiento.
- `pieAlSiguienteTurno`: quien se quedó sin mano al descartar; coge el pie al empezar su turno (en `transicion` del descarte se mueve ya a `manos`, con `enPie`, para que la vista sea simple; lo que cambia es solo que el turno pasa).
- `conocidas`, `mazo`, `descarte`, `combinaciones`, `siguienteId`, `treses` por pareja, `abierto` por pareja, `apertura` (como en la Canasta), `puntos`, `resultadosRondas`, `terminada`, `ultimaAccion`.

### 3. Acciones
- `robar` (2 cartas; los treses rojos se ponen y se repone cada uno), `cogerDescarte { cartas, combinacion }` (`cartas`: los 2 naturales; `combinacion`: la suya sin terminar de ese valor, o `null`), `bajar { cartas }`, `anadir { combinacion, cartas }`, `deshacer`, `descartar { carta }` y `acabar` (sin mazo y sin poder coger el descarte, como en la Canasta).
- **Generación de `bajar` y `anadir`:** como en `accionesBajar` de la Canasta, con estos cambios:
  - las combinaciones de comodines (valor 0) entre las nuevas, y como destino de comodines al añadir;
  - un libro no admite cartas, y no se baja una combinación de un valor (o de comodines) si la pareja ya tiene una sin terminar;
  - el tope de 7 cartas;
  - `cartasMinimas`: 0 si el jugador aún juega la mano (se queda sin mano y coge el pie) o si su pareja puede cerrar; 2 en el pie si no puede (descarta una y se queda con otra).
- **Coger el pie:** cuando `manos[a]` queda vacía y `enPie[a]` es falso, `manos[a] = pies[a]` (reponiendo los treses rojos), `pies[a] = []` y `enPie[a] = true`. Si fue al bajar, sigue en `fase: 'bajar'`; si fue al descartar, pasa el turno.
- **Cerrar:** vaciar la mano estando en el pie (bajando o descartando), con la pareja en 2 limpios y 2 sucios (`puedeCerrar`).

### 4. Puntuación y partida
- **`DesgloseHandAndFoot`:** `cartas`, `limpios`, `sucios`, `deComodines`, `libros` (puntos), `treses`, `cierre`, `mano` (lo que queda en manos y pies, en negativo) y `total`.
- **`ResultadoRondaHandAndFoot`:** `ronda`, `cierra` (o `null`), `desglose` por pareja y `puntosTras`.
- **Fin:** tras la cuarta ronda; empate si los puntos son iguales. **Config:** `{ rondas: number }` (4 por defecto) para que las pruebas sean cortas; el mínimo de cada ronda es `[50, 90, 120, 150][min(ronda, 4) − 1]`.

### 5. Vista
- La mano propia, `cartasEnMano`, `cartasEnPie` (del pie sin coger), `enPie`, `conocidas`, `cartasEnMazo`, el `descarte`, `combinaciones`, `treses`, `abierto`, `apertura`, `minimo`, `ronda`, `repartidor`, `turno`, `fase`, `puntos`, `puedeCerrar` por pareja, `ultimaAccion` y `resultadosRondas`.

### 6. IAs
- **Normal (`ia/hand-and-foot-basica.ts`):** las reglas de la spec, a partir de `canasta-basica` (sus funciones de primera bajada y de descarte se reutilizan si se pueden generalizar sin cambiar su comportamiento en la Canasta; si no, se adaptan aquí).
- **Difícil (`ia/reconstruir/hand-and-foot.ts`):** `SIMULABLE_HAND_AND_FOOT`, como `SIMULABLE_CANASTA`:
  - **Reconstrucción:** las conocidas se quedan en su mano; el resto de manos ajenas, los pies sin coger (también el propio) y el mazo, al azar entre las cartas que no se ven.
  - **Candidatas:** solo la carta que se descarta (las 4 mejores para la normal); robar o coger el descarte y lo que se baja, la normal. Simular también el robo no la hacía más fuerte (104 de 200 frente a 108).
  - **Valoración:** a mitad de ronda, lo bajado (cartas, libros y medio libro por combinación de 5 o 6 cartas) menos la mitad de los pies sin coger; las cartas de la mano no restan, porque si no coger el descarte (6 cartas más) parece malo. Al terminar la ronda, el desglose real; más `bonoPartida`.
  - **Valores:** 8 reconstrucciones, 32 partidas simuladas y 24 jugadas por delante. Gana 108 de 200 partidas de una ronda a la normal (la parte justa son 100), con 126 ms como máximo.

### 7. Cliente
- **`MesaHandAndFoot.svelte`:** a partir de `MesaCanasta.svelte`.
  - **Información:** ronda y mínimo, «Mano» o «Pie» junto a cada jugador (con las cartas del pie sin coger), libros de la pareja y lo que falta para cerrar.
  - **Combinaciones:** con el tipo de libro marcado.
  - **Botones:** «Robar 2», «Coger el descarte», bajar, añadir, deshacer y descartar, con `data-jugada` / `data-accion` como en la Canasta.
- **`ResumenHandAndFoot.svelte`:** el desglose de cada pareja y el total.
- **Menú y modo asistido:** entrada en `CATALOGO` (familia `combinaciones`, baraja francesa), consejo en `CONSEJOS_JUEGO`; la cuenta de juegos con IA de `contexto.test.ts` pasa de 69 a 70 y la de la familia de 8 a 9.
- **Fin:** juego por parejas, con su bloque en `Fin.svelte`.

## Risks / Trade-offs

- **270 cartas y manos largas** → la simulación es cara: como en la Canasta, la difícil solo simula el descarte, con un límite de jugadas, y decide la base cuando el descarte o las manos son grandes.
- **Muchas acciones de bajar y añadir con tantas copias** → se generan por firma (valor, naturales, comodines), como en la Canasta, para no repetir acciones iguales.
- **Rondas que no terminan** → la ronda acaba cuando el mazo no tiene dos cartas y no se puede coger el descarte.
