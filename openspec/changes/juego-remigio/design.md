## Context

El Pinacle ya resolvió los problemas difíciles de un rummy con combinaciones en la mesa:
- **Cartas repetidas:** dos barajas, con ids que llevan la copia (`carta#copia`).
- **Bajadas como jugadas pequeñas:** `bajar` de 3 cartas, `anadir` y `cambiar`. Así las acciones legales son pocas y la IA puede simular.
- **Planes para bajar:** `planesParaBajar` convierte una selección de la mano en esas jugadas.
- **Mesa:** la mano en dos filas y la elección del puesto de un comodín.
- **IA difícil:** simula solo robar y descartar.

El Chinchón aporta el orden de las escaleras españolas (7 y Sota seguidos) y la eliminación por puntos.

Las reglas del Remigio difieren lo bastante para no compartir el código del Pinacle sin riesgo:
- no hay doses comodín;
- los grupos son de palos distintos y de 4 como mucho;
- el comodín cambiado vuelve a la mano;
- se puede añadir a las combinaciones de todos.

## Goals / Non-Goals

**Goals:**
- Remigio completo de 2 a 5 jugadores:
  - robar del mazo o del montón, con el mazo que se rehace del montón;
  - bajar, añadir y cambiar en las combinaciones de todos;
  - cerrar y remigio;
  - puntuación y eliminación a 100.
- IA en los tres niveles. La difícil gana a la normal en la prueba de fuerza.
- Mesa con la misma forma de jugar que la del Pinacle.

**Non-Goals:**
- Refactorizar el Pinacle hacia un núcleo común (ver Context).
- El mínimo de la primera bajada y el reenganche.

## Decisions

### 1. Cartas y combinaciones (`juegos/remigio-combinaciones.ts`)
- **Cartas:** `CartaRemigio = \`${IdCarta}#${copia}\``. `cartasRemigio()` da las 80 naturales (dos barajas de 40) y 4 comodines (`comodin-1#0`, `comodin-2#0`, `comodin-1#1`, `comodin-2#1`).
- **Posición en la escalera:** `posicion(c)` va de 1 a 10 (As=1, …, 7=7, Sota=8, Caballo=9, Rey=10) y es 0 para el comodín.
- **Puntos:** `puntosCartaRemigio(c)` da el número, 10 a las figuras y 25 al comodín.
- **Tipos:** `Combinacion` es un `GrupoRemigio { id, duenio, numero, cartas }` o una `EscaleraRemigio { id, duenio, palo, desde, puestos }`. En un grupo, cada comodín ocupa un palo sin fijarlo, porque basta con que haya palos libres.
- **Jugadas:**
  - `bajar`: grupos de 3 (3 naturales de palos distintos, o 2 y un comodín) y escaleras de 3 puestos con un comodín como mucho.
  - `anadir`: a un grupo, mientras no pase de 4, con un natural de un palo que falte o un comodín si quedan palos; a una escalera, en un extremo.
  - `cambiar`: una carta natural ocupa el puesto de un comodín (en un grupo, un natural de un palo que falte) y el comodín va a la mano.
- **Combinaciones largas:** se forman con un `bajar` y varios `anadir` en el mismo turno, como en el Pinacle. Para mantener «al menos 2 naturales», solo se puede añadir un comodín a una combinación con ≥ 2 naturales, que es lo que garantiza el `bajar` de 3.
- **Planes:** `planesParaBajar(vista, seleccion, destino)` busca en profundidad, igual que la del Pinacle pero con estas jugadas.

### 2. Estado y turno (`juegos/remigio.ts`)
`EstadoRemigio` guarda:
- **Partida:** `config` (`jugadores: 2..5`), `azar`, `repartidor` y `manos`.
- **Cartas en juego:** `mazo` (oculto), `monton` (visible entero) y `combinaciones`, con `siguienteId`.
- **Turno:** `turno`, `fase: 'robar' | 'bajar'`, `bajado: boolean[]` (quién ha bajado en la mano) y `bajadoEsteTurno` (cuántas jugadas lleva en el turno, para el remigio).
- **Marcador:** `puntos`, `eliminados`, `resultadosManos` y `numeroMano`.

Acciones: `robarMazo`, `robarMonton`, `bajar`, `anadir`, `cambiar` y `descartar{carta}`.
- `anadir` y `cambiar` solo están si `bajado[asiento]`.
- `descartar` está en la fase `bajar`. Si tras una jugada la mano queda vacía, se cierra sin descartar.
- **Remigio:** se cierra con todas las jugadas en el mismo turno y `bajado[asiento]` era falso al empezar ese turno. Lo marca `bajadoAntesDelTurno`.
- **Rehacer el mazo:** si el mazo está vacío al robar, se baraja el montón menos su carta de arriba con el azar del estado.
- **Cierre de la mano:**
  1. los demás suman los puntos de su mano, ×2 si fue remigio;
  2. se marcan los eliminados (> 100);
  3. si queda uno, termina la partida; si no, reparte el siguiente que sigue en juego y se quitan de la mesa todas las combinaciones (cada mano empieza con la mesa vacía).

### 3. IA básica (`ia/remigio-basica.ts`)
Sigue el esquema de `pinacle-basica.ts`:
- **Robar:** roba del montón si su carta de arriba aparece en alguna bajada o añadido posible con la mano.
- **Bajar:**
  - aplica la jugada de mayor tamaño (primero las combinaciones sin comodín), luego los añadidos y los cambios;
  - si aún no ha bajado y le faltan como mucho 2 cartas para poder bajarlo todo, no baja y espera el remigio;
  - se acota el número de turnos que espera.
- **Descartar:** puntúa cada carta según cuántas combinaciones de 3 posibles la usan con la mano (`bajadasPosibles` y vecinas) y descarta la de menor uso y más puntos. Nunca descarta un comodín si tiene otra carta.

### 4. IA difícil (`ia/reconstruir/remigio.ts`)
- **Reconstrucción:** reparte las cartas no vistas entre las manos ajenas y el mazo. Las combinaciones y el montón son públicos. Se usa `Ocultas`.
- **`candidatas`:** como en el Pinacle, solo se simulan robar (mazo o montón) y descartar (las 3 mejores según la base). El resto lo decide la base.
- **Horizonte y presupuesto:** horizonte de 12 jugadas, 8 reconstrucciones y presupuesto de 24, ajustados en la prueba de fuerza.
- **`valorar`:** la diferencia entre la media de puntos de los rivales y los suyos en la mano. Si la mano no ha terminado, cada carta en mano cuesta 3 más sus puntos rebajados por su utilidad (`utilidadRemigio`): un comodín colocable o una carta que encaja en la mesa no cuentan. Sumar los puntos tal cual hacía que la IA soltara comodines y no superaba a la normal.

### 5. Cliente
- **`MesaRemigio.svelte`:** adapta la estructura de `MesaPinacle`:
  - info, mazo y montón, rivales con cartas y puntos;
  - combinaciones agrupadas por jugador, todas tocables para añadir y cambiar;
  - mano en dos filas con orden por palo o por número;
  - «Bajar», elección del puesto del comodín y descartar.

  Se reutilizan los textos y estilos del Pinacle que encajan, copiados con su propio prefijo.
- **`ResumenRemigio.svelte`:** quién cerró, el remigio, los puntos de cada uno con sus cartas y los totales, que pausa hasta «Siguiente mano». La pantalla de fin muestra la clasificación.
- **Registro:** `DEF_REMIGIO`, con la pausa de un rival como en el Pinacle; `IdJuego`, `partida.ts`, opciones, textos, guía y `red.ts`.

## Risks / Trade-offs

- **Copiar la forma del Pinacle duplica algo de lógica** → es una decisión consciente para no arriesgar el Pinacle. Si llega un tercer rummy, se saca el núcleo común con los dos como referencia.
- **Combinaciones de todos los jugadores con 5 en la mesa:** la pantalla se llena → la zona de la mesa tiene scroll vertical propio y las combinaciones usan cartas mini.
- **Remigio que la IA persigue sin fin** → se acota cuántos turnos lo espera.
- **Variantes regionales** (grupos con palo repetido, el comodín a 25, obligación de bajar la carta del montón) → se documentan para que las valide el usuario.
