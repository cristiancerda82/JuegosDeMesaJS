## Context

`T.ayuda[juego]` (en `packages/client/src/textos.ts`) es una lista de secciones `{ titulo, texto[], ejemplo?, ejemplos? }`. `pantallas/ComoSeJuega.svelte` las pinta una detrás de otra, y casi todas las guías ya tienen una sección «Consejos». Los ejemplos viven en `ayuda/ejemplos/<familia>.ts` y cada test de familia los comprueba con el motor mediante `verificador`.

En la parte de las guías, `textos.ts` es solo texto. El change no toca el motor.

## Goals / Non-Goals

**Goals:**
- Que la historia no alargue la guía para quien solo quiere aprender a jugar. Por eso va plegada y al final.
- Que un test falle si un juego nuevo llega sin historia.

**Non-Goals:**
- Una pantalla aparte de historia, o fuentes y bibliografía en la app.
- Traducir las guías, o cambiar el tono o la estructura de las que ya existen.
- Tocar el Póker de cinco (`juego-poker-cinco` está en curso) y la ayuda de red (`T.ayuda.red`).

## Decisions

1. **La sección lleva el campo opcional `plegada?: true`, sin un tipo nuevo.** `ComoSeJuega.svelte` pinta esas secciones con `<details><summary>` (el `summary` es el título) y las demás igual que ahora. `<details>` es nativo: se abre con el teclado, los lectores de pantalla lo anuncian bien y no necesita estado.
   - Descartado, una clave aparte `T.historia[juego]`: obligaría a tocar el componente para unirla a la guía y la separaría del resto del texto del juego.

2. **«Un poco de historia» es siempre la última sección.** El test unitario nuevo, junto a `ayuda/ejemplos/ejemplos.test.ts` y sobre `ID_JUEGOS`, comprueba tres cosas: que la última sección se titula así, que tiene `plegada: true` y que su texto no está vacío. Así un juego nuevo no puede olvidarla. `catalogo.test.ts` y la memoria de «registro de un juego nuevo» deben recordarlo.

3. **Las líneas de variante regional van en la sección de reglas a la que afectan**, no en una sección «Variantes» propia. Empiezan por «En otros sitios» para distinguirlas de las líneas «Variante (opción «…»)», que sí se pueden activar. Quien lee la regla ve en el mismo sitio que en otras zonas se juega distinto.

4. **Cada consejo nuevo es un elemento más de `texto` en la sección «Consejos».** Se redacta con nuestras palabras a partir del contenido del libro, sin citarlo. Para el Mus y la Butifarra bastan dos o tres frases, no el capítulo entero de Núñez.

5. **Los ejemplos nuevos son de tipos que ya existen.**
   - **Chinchón, `colocar`:** un `antesDespues`. Antes, la combinación de quien cierra (por ejemplo, 4-5-6 de copas) y la suelta del rival (el 7 de copas); después, el 7 dentro de la escalera, resaltado. El test comprueba con `colocarEnMesa` del motor que la carta encaja y que la combinación resultante es válida (`combinacionChinchon`).
   - **Escoba, `premios`:** un `tabla` con las filas de oros y sietes, sin el premio y con él. El test lo comprueba con `puntuarMano(…, true)` del motor.

   La sección de la guía que enseña cada variante gana la clave en `ejemplos`.

6. **La historia es prudente con lo que no se sabe.** Solo se escriben datos conocidos y repetidos en las fuentes clásicas (la etimología, el país de origen, el siglo aproximado). Lo dudoso se dice con «se cree», «probablemente» o «hay quien dice». En el informe ya constan casos: el Tute de *tutti*, el Polignac por el ministro de Carlos X, el Écarté y el ejército napoleónico y el Klondike por la fiebre del oro. El usuario revisa todos los textos antes del commit.

## Risks / Trade-offs

- **Un dato histórico equivocado en un juego poco conocido.** Se mitiga con frases prudentes, un párrafo corto por juego y la revisión del usuario. Ante la duda, mejor una historia más corta que un dato inventado.
- **`textos.ts` crece en unas 85 secciones.** Es aceptable: el archivo ya es el sitio de todos los textos y, al ser una SPA, el texto pesa poco comprimido. Si algún día pesara, las guías podrían cargarse aparte, pero eso no entra en este change.
- **Choques con el trabajo del Póker en `textos.ts`.** El Póker de cinco ya está en `ID_JUEGOS` en la copia de trabajo, y sin su historia el test de la decisión 2 fallaría. Por eso su guía recibe también el apartado, pero ese trozo no entra en este commit: se queda en la copia de trabajo y va con el change `juego-poker-cinco`. Al hacer el commit se añaden solo nuestros trozos, como en `reglas-variantes-libros`. En lo que se sube, `ID_JUEGOS` no incluye el Póker, así que el test pasa igual.
