## Context

En la revisión de los libros (`JuegosDeMesaJS_Docs/revision-libros.md`) salieron cuatro reglas clásicas que no tenemos. El usuario las quiere todas como opciones desactivadas por defecto.

Hay tres cosas del código que condicionan cómo se hace:
- Las obligaciones de las bazas viven en una sola función compartida, `cartasObligadas` (`motor/bazas.ts`), que usan el Tute, el Guiñote, la Butifarra y otros juegos.
- La configuración de cada juego se valida en `crear`, y la validan igual el cliente y el servidor.
- Las partidas guardadas guardan el estado con su `config` y no vuelven a pasar por `crear`.

## Goals / Non-Goals

**Goals:**
- Las cuatro variantes, como opciones del motor, con tests de reglas.
- Que sin la opción todo siga exactamente igual, también las partidas guardadas y los tests existentes.
- Una casilla en las opciones, una línea en la guía y lo justo en la mesa para entender cada variante.

**Non-Goals:**
- Otras reglas de los libros:
  - el «más de 30 cartas» de la Escoba;
  - el 2 fuera de turno y la puntuación del Ocho americano;
  - el Polignac clásico;
  - el Póker italiano.
- Que la IA tenga una estrategia propia para cada variante. Basta con que juegue legal y con sentido usando `accionesLegales`.

## Decisions

### 1. Campos opcionales en cada `Config`
Cada opción nueva es un campo opcional (`readonly sobrefalloLibre?: boolean`, etc.) que cuenta como `false` si falta.

En `crear`, se valida que sea `boolean` o `undefined`, y la configuración limpia lo guarda siempre como `boolean`. Así:
- las partidas guardadas antiguas (con un `config` sin el campo) siguen igual;
- los tests con configuraciones literales no hay que tocarlos;
- en red, un cliente antiguo que no envía el campo juega sin la variante.

*Alternativa descartada:* hacerlo obligatorio, como `escobaInicial`. Obligaría a migrar los guardados y a reescribir decenas de configuraciones de los tests.

### 2. Sobrefallo libre en `cartasObligadas`
`OpcionesObligadas` gana `sobrefalloLibre?: boolean`. En la rama «sin el palo de salida y con triunfos»: si la ganadora es un triunfo y ninguno de los triunfos de la mano la supera, devuelve la mano entera; si no, sigue como ahora.

Tute, Guiñote y Butifarra pasan `e.config.sobrefalloLibre === true`. El Julepe, la Pocha y el resto no lo pasan, así que no cambian.

### 3. Premios de la Escoba en `puntuarMano`
`puntuarMano(recogidas, escobas, premios = false)`:
- con los 10 oros, `oros` vale 2;
- con los 4 sietes, `sietes` vale 3.

Los tipos de `PuntosBando.oros` y `sietes` pasan de `0 | 1` a `number`. El desglose del cliente ya enseña el número, así que solo hay que revisar que no compare con `1`.

### 4. Chinchón: colocar las sueltas, automático
No hay una fase nueva en la que cada jugador elija qué colocar. Colocar nunca perjudica, porque solo quita puntos, así que el motor coloca lo máximo, en orden de turno, al cerrar la mano.

Para cada jugador, a partir de su `mejorReparto`:
- se repite: tomar la suelta de más puntos que encaje en alguna combinación de la mesa y meterla en ella;
- para comprobar si encaja, una función nueva, `combinacionChinchon(cartas, baraja)` en `chinchon-combinaciones.ts`, reutiliza `candidatas` y busca una candidata que use todas las cartas;
- las combinaciones del jugador se añaden a la mesa para los siguientes.

`ManoDestapada` gana `colocadas?: readonly IdCarta[]`. Los puntos se calculan con las sueltas que quedan. Si quien cierra lo hace con todo ligado, o con chinchón, no se coloca nada.

*Alternativa descartada:* una fase interactiva de colocar. Supone acciones, vista, IA y mesa nuevas para una decisión que siempre tiene la misma respuesta.

### 5. Chinchón: reenganche, automático
El estado gana `reenganchados: readonly boolean[]`, que se inicializa en `crear` y se lee con `?.` para los guardados antiguos.

En `cerrarMano`, tras sumar los puntos:
- quien pasa del límite con la opción activa, sin haberse reenganchado y con al menos otro jugador que no ha pasado, vuelve con el máximo de los puntos de los que no han pasado;
- se marca en `reenganchados`.

`ResultadoManoChinchon` gana `reenganchesTras?: readonly Asiento[]` (los de esa mano) y `puntosTras` ya refleja los puntos nuevos. Es automático: sin apuestas, reengancharse siempre conviene, y lo que decide el jugador es la casilla de la opción.

### 6. Ocho loco: estado de sentido, castigo y nueve
`EstadoOchoLoco` gana tres campos, todos opcionales en el tipo para los guardados antiguos:
- `sentido: 1 | -1`;
- `castigo: { numero: 1 | 6; robar: 1 | 2 } | null`;
- `trasNueve: boolean`.

`siguiente(a, n, sentido)` sustituye al `siguiente` de ahora.

**`accionesLegales`:**
- Con `castigo`, y sin haber robado: las jugadas con cartas de ese número, más `{ tipo: 'robar' }`.
- Con `trasNueve` y sin jugadas posibles: `{ tipo: 'robar' }`.
- Si no, igual que ahora.

**`transicion`:**
- **Jugar:**
  - el 10 invierte el sentido (si hay más de 2 jugadores);
  - el 7 salta uno;
  - el As y el 6 ponen el `castigo` para el siguiente;
  - el 9 pone `trasNueve`;
  - cualquier jugada borra el castigo y el nueve anteriores.
- **Robar con castigo:** roba N cartas (rehaciendo el mazo si hace falta, y robando las que haya), borra el castigo y deja `robada` en `null`. El jugador sigue en su turno normal.
- **Robar tras un 9:** roba 1 y pasa el turno.

`UltimaOchoLoco` de tipo `robar` gana `cartas?: number`, para enseñar «roba 2».

La vista expone `sentido` y `castigo`. La simulación de la IA difícil (`SIMULABLE_OCHO_LOCO`) copia los campos nuevos al reconstruir el estado.

### 7. Cliente
- **Opciones:** una casilla por variante (con `T.opciones.*` y su descripción), en los bloques de `Opciones.svelte` de cada juego. La Butifarra pasa a tener la suya junto a la del objetivo.
- **Guía:** en la sección de cada regla afectada, una línea «Variante (opción …)» que cuenta la regla del libro.
- **Mesas:**
  - en el Ocho loco, un indicador del sentido (↻/↺) cuando la opción está activa, y el aviso de la obligación pendiente («Echa un As o roba 2»);
  - en el Chinchón, en el resultado, las cartas colocadas de cada jugador, con su etiqueta, y «se reengancha con N»;
  - en la Escoba, el desglose ya muestra el número de cada concepto.
- **Modo asistido:** el consejo del Ocho loco añade una frase sobre las cartas especiales cuando están activas.

## Risks / Trade-offs

- **[Colocar automático puede sorprender]** → El resultado enseña las cartas colocadas, con su etiqueta, y la guía explica que se colocan solas.
- **[Ocho loco con más estado: la simulación de la IA difícil podría reconstruir mal]** → Un test de la IA con la opción activa, y partidas completas con fast-check que comprueban que siempre hay una acción legal y que las cartas se conservan.
- **[Cambiar `cartasObligadas` afecta a muchos juegos]** → La rama nueva solo se activa con la opción. Los tests actuales de `bazas.test.ts` y de cada juego tienen que pasar sin cambios.
- **[Tipos `0 | 1` en la Escoba]** → Pasan a `number`. `check` detecta cualquier comparación que se rompa.
