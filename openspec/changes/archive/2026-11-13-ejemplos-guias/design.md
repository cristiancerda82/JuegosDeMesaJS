## Context

- La guía es `pantallas/ComoSeJuega.svelte`, un `<dialog>` que pinta las secciones de `T.ayuda[juego]` (título y párrafos).
- Una sección puede llevar `ejemplo: '<clave>'`, y el componente tiene una cadena de `{#if}` con 19 claves, cada una con sus cartas fijas en constantes del propio componente (`ESCALERA`, `VALORES`, `MUS_31`…).
- Algunas etiquetas ya se calculan con el motor (`puntosDe`, `valorEscoba`, `puntosPocha`), pero nada comprueba que un ejemplo sea correcto.
- Las cartas se pintan con `cartas/Carta.svelte`, que sigue el tema y el dorso elegidos.
- Las guías están en `textos.ts` (81 entradas, una de ellas `red`).
- El E2E `partidas.spec.ts` abre la guía de una lista de juegos, desde las opciones y en la partida, y hace una captura.
- El catálogo agrupa los 80 juegos en 8 familias: solitarios, bazas por puntos, bazas con contrato, bazas para evitar, combinaciones, captura, descarte y envite.

## Goals / Non-Goals

**Goals:**
- Al menos un ejemplo visual en las 80 guías de juego, en las secciones donde una regla se entiende mejor viéndola.
- Cuatro tipos de ejemplo genéricos, para no añadir un `{#if}` por juego.
- Que cada ejemplo se pueda comprobar con el motor y que un ejemplo equivocado rompa los tests.
- Accesible, y legible a 360 px.

**Non-Goals:**
- Ejemplos animados o interactivos.
- Reescribir los textos de las guías, salvo frases que ahora remiten al ejemplo.
- La guía de la red.

## Decisions

### 1. Los ejemplos son datos, no componentes por juego

Un tipo `Ejemplo` en `client/src/ayuda/ejemplos/tipos.ts`:

```ts
type Ejemplo =
  | { tipo: 'cartas'; descripcion: string; cartas: { id: IdCarta; etiqueta?: string }[]; resultado?: string }
  | { tipo: 'jugadas'; descripcion: string; filas: { nombre: string; cartas: IdCarta[] }[] }
  | { tipo: 'baza'; descripcion: string; jugadas: { quien: string; id: IdCarta }[];
      triunfo?: IdCarta | Palo; gana: number; porque: string }
  | { tipo: 'antesDespues'; descripcion: string; antes: Zona[]; despues: Zona[];
      resaltadas: IdCarta[]; explicacion: string };
type Zona = { nombre: string; cartas: IdCarta[]; abanico?: 'fila' | 'columna' };
```

- `descripcion` es el texto para los lectores de pantalla (`role="img"` + `aria-label`). El resto de textos del ejemplo (etiquetas, nombres de jugada, `porque`) también se leen, porque son texto real.
- Los datos van en `ayuda/ejemplos/<familia>.ts`, un archivo por familia del catálogo, con un `Record<IdJuego, Record<string, Ejemplo>>` parcial. `ayuda/ejemplos/index.ts` los junta en `EJEMPLOS`.
- La sección de `T.ayuda` sigue diciendo `ejemplo: '<clave>'`, como ahora, o `ejemplos: ['<a>', '<b>']` si lleva varios.
- *Alternativa descartada:* dejar los textos de los ejemplos en `textos.ts`. Separaría el texto de sus cartas, y un error en uno no se vería en el otro. Los textos de los ejemplos, en castellano como el resto, viven junto a sus cartas.

### 2. Un componente por tipo

`ayuda/EjemploCartas.svelte`, `EjemploJugadas.svelte`, `EjemploBaza.svelte` y `EjemploAntesDespues.svelte`, más `ayuda/Ejemplo.svelte`, que elige el que toca. `ComoSeJuega.svelte` pierde la cadena de `{#if}` y las constantes.

- **Cartas:** la fila actual (`.valores`), con etiqueta y resultado. La escalera solapada del Klondike pasa a ser un `antesDespues` o una zona en `columna`.
- **Jugadas:** una fila por jugada, con el nombre a la izquierda y las cartas, más pequeñas (40 px), a la derecha. A 360 px el nombre pasa encima de las cartas.
- **Baza:** las cartas en fila con el nombre del asiento encima («Tú», «Izquierda», «Pareja», «Derecha», o «Jugador 1…» si no hay parejas). El triunfo se muestra como chip de palo o como la carta de muestra. La ganadora lleva un borde de `--acento`, y `porque` va debajo.
- **Antes y después:** dos bloques, «Antes» y «Después», con sus zonas y una flecha entre ellos (en vertical a 360 px). Las cartas resaltadas llevan el mismo borde.
- Tamaños: el `.hueco` actual (52 px) para cartas y bazas, 40 px para jugadas y antes y después; con `flex-wrap`, y a 360 px todo cabe en el ancho del diálogo.

### 3. Comprobar los ejemplos con el motor

`client/src/ayuda/ejemplos/ejemplos.test.ts` (vitest) recorre `EJEMPLOS`:
- **Común:**
  - toda clave que use `T.ayuda` existe en `EJEMPLOS`, y todo ejemplo se usa;
  - toda carta existe en la baraja del juego (española, francesa, Tarot, con comodín o no);
  - no hay cartas repetidas donde la baraja no las repite;
  - cada juego tiene al menos un ejemplo.
- **Por juego,** con un comprobador cuando la regla está en el motor:
  - **Jugadas:** la categoría que calcula el motor coincide con el nombre de la fila y el orden es descendente. Para el póker, `mejorManoPoker`; para las combinaciones, las funciones de validez de cada juego (`combinacionValidaHandAndFoot`, las de Chinchón, Canasta, Gin…).
  - **Baza:** la ganadora que calcula el motor con el palo de salida y el triunfo es la que el ejemplo resalta (`cartaGanadora` de `motor/bazas.ts`, o la función de cada juego).
  - **Cartas con etiqueta de valor:** la etiqueta es la que da el motor (`puntosDe`, `valorEscoba`, los valores del Cribbage…).
  - **Antes y después:** la diferencia es una acción legal. Se construye un estado mínimo con `crear` y una semilla, se colocan las cartas de «antes» y se comprueba que la acción que lleva a «después» está en `accionesLegales` y que `transicion` da ese «después» en las zonas mostradas. Si un estado no se puede construir de forma razonable para un juego, el ejemplo se comprueba con la función de validez de esa regla (una captura con la de capturas, un movimiento de solitario con la de «se puede poner sobre»).
- Para cada ejemplo, el test dice qué comprobador usó; los que no tienen ninguno se listan en el diseño de su familia (tarea 1.4) y se revisan a mano. Se apunta a que sean pocos.
- Si un juego no exporta la función que hace falta, se exporta desde `engine/src/index.ts` sin cambiar su comportamiento.

### 4. Qué enseña cada familia

Una guía orientativa; en cada juego se elige lo que más ayude, sin repetir lo que ya está claro en el texto:

| Familia | Ejemplos típicos |
|---|---|
| Solitarios | antes y después de un movimiento legal (escalera alterna, palo igual, suma 13 en la Pirámide, ±1 en el Golf y el TriPeaks), y la base de una fundación |
| Bazas por puntos | valores de las cartas (cartas), una baza resuelta con triunfo, cantes y combinaciones de anuncio (jugadas: belote, cincuenta del Bezique, los anuncios del Jass…) |
| Bazas con contrato | jerarquía del triunfo (los matadores, las jotas del Euchre, el Skat), una baza resuelta, y la puja o el contrato con su puntuación (cartas o tabla) |
| Bazas para evitar | las cartas que puntúan y una baza en la que te llevas puntos |
| Combinaciones | escalera y grupo válidos, con comodín, y uno no válido; la apertura mínima; el robo del descarte (antes y después) |
| Captura | antes y después de una captura (por suma, por igual, la escoba o la pishti) |
| Descarte | qué se puede jugar encima (cartas), la jerarquía (Big Two, Culo), un ataque y su defensa en el Durak |
| Envite | jugadas del Mus y del Truco, las manos del póker, los valores del Blackjack y de la Siete y media, el Treinta y uno |

### 5. Textos

- Las secciones que ahora describen con palabras lo que el ejemplo enseña se acortan para no repetirlo: la lista de manos del póker se queda en una frase introductoria.
- Los textos de los ejemplos siguen el estilo de las guías: tuteo, frases cortas y los nombres de las cartas como en la mesa («el 7 de oros», «la J de picas»).

### 6. Tests de la interfaz

- `partidas.spec.ts`: el bucle de la guía pasa a recorrer todos los juegos del catálogo, no una lista fija.
  - Comprueba que hay al menos un `[data-testid^="ejemplo-"]` visible.
  - En el proyecto `movil` (360 px), comprueba que el `scrollWidth` del contenido de la guía no supera su `clientWidth`.
- Los componentes se comprueban en ese mismo E2E (cada ejemplo visible, con su `aria-label`, y una captura de cada uno en `test-results/ejemplos/`): el cliente no tiene entorno DOM en vitest, y montarlo solo para esto no compensa.
- Cada ejemplo lleva `data-testid="ejemplo-<clave>"`. Los cuatro que había (`ejemplo-corazones`, `ejemplo-spider`, `ejemplo-mus`, `ejemplo-pocha`) no los usaba ningún test, así que pasan a ese formato.

## Risks / Trade-offs

- **[Volumen: 80 juegos]** → Se trabaja por familias, con el test de comprobación en marcha desde la primera. Cada familia se cierra con sus tests en verde.
- **[Construir estados para los «antes y después»]** → Es lo más costoso. Se usa la función de validez de la regla si el estado no sale fácil, y se anota.
- **[Guías más largas en el móvil]** → Uno o dos ejemplos por juego en las secciones clave, y tamaños de carta pequeños en los tipos con muchas cartas.
- **[Capturas de pantalla]** → Las capturas de referencia de `temas.spec.ts` no incluyen la guía, así que no cambian. Las de `partidas.spec.ts` solo se guardan, no se comparan.

## Migration Plan

Sin migración: es solo del cliente y no hay datos guardados. Las 19 guías con ejemplos se pasan al formato nuevo en la primera tarea, y sus tests deben seguir pasando antes de seguir con las familias.
