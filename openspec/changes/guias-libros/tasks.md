## 1. Sección plegable

- [x] 1.1 Añadir `plegada?: true` al tipo de sección de la guía (en `ComoSeJuega.svelte` y en el `Seccion` de `ayuda/ejemplos/ejemplos.test.ts`). Pintar las secciones plegadas como `<details>` con el título en `<summary>` y `data-testid="historia"`, con el mismo estilo de título que `h3`.
- [x] 1.2 Test unitario sobre `ID_JUEGOS`: la última sección de cada guía se titula «Un poco de historia», lleva `plegada: true` y su texto no está vacío.

## 2. Un poco de historia

- [x] 2.1 Escribir la historia de los solitarios (Klondike, Spider, FreeCell, Pirámide, Golf, Yukón, Escorpión, Canfield, Bella Lucía, TriPeaks, Cuarenta ladrones…). Un párrafo corto, prudente con lo dudoso.
- [x] 2.2 Historia de los juegos de bazas por puntos y con contrato (Brisca, Tute, Guiñote, Butifarra, Tute subastado, Tresillo, Bridge, Whist, Skat, Belote, Tarot…).
- [x] 2.3 Historia de los juegos de bazas para evitar, de combinaciones, de captura, de descarte y de envite (Polignac, Barbu, Corazones, Chinchón, Canasta, Escoba, Casino, Ocho loco, Mus, Truco, Siete y media, Póker…).
- [x] 2.4 Añadir en la copia de trabajo la historia del Póker de cinco, sin incluirla en el commit (va con `juego-poker-cinco`).
- [x] 2.5 Pasar el test 1.2 sin excepciones.

## 3. Consejos de los libros

- [x] 3.1 Tute: contra el As de triunfo no se arrastra; buscar primero el cante que falta con el As de ese palo; arrastrar en cuanto se entra en baza si el compañero ha enseñado el As de triunfo.
- [x] 3.2 Brisca (llevar la cuenta de los puntos que han salido) y Burro (fijarse en lo que piden y pasan los demás).
- [x] 3.3 Mus (cuándo cortar el mus y qué indican los descartes) y Butifarra (cuándo delegar y cuándo cantar butifarra).

## 4. Variantes regionales («En otros sitios…»)

- [x] 4.1 Juegos españoles: la Escoba a 31, la Siete y media con la carta tapada o destapada, «bailarla» en el Julepe, las señas en la Brisca, el Tute subastado de 3 con 12 cartas, el Remigio de 10 cartas con dos barajas de 52 y el otro Burro de bazas.
- [x] 4.2 Juegos franceses: el Polignac con el orden antiguo, el Treinta y uno con viuda, el Oh Hell de 1 al máximo y el dominó del Barbu desde el número que elige quien reparte.

## 5. Ejemplos de las variantes

- [x] 5.1 Chinchón: ejemplo `colocar` (`antesDespues`), con la suelta que pasa a la escalera a la vista, enlazado en la línea de la variante «Colocar las sueltas». Comprobarlo en `combinaciones.test.ts` con `colocarEnMesa` y `combinacionChinchon` del motor.
- [x] 5.2 Escoba: ejemplo `premios` (`tabla`), con los oros y los sietes sin el premio y con él. Comprobarlo en `captura.test.ts` con `puntuarMano(…, true)`.

## 6. Verificación

- [x] 6.1 E2E: en la guía del Tute, la historia empieza plegada y se abre al tocarla, y se ve el consejo de no arrastrar contra el As. En la guía de la Escoba aparecen la línea de la partida a 31 y el ejemplo de los premios. En la del Chinchón, el ejemplo de colocar. Ejecutar el E2E de la guía de todos los juegos a 360 px.
- [x] 6.2 Ejecutar `pnpm -r test`, el `check` del cliente, `lint`, `format:check` y `openspec validate guias-libros --strict`.
- [x] 6.3 Pedir al usuario que revise los textos de historia antes del commit. En el commit, añadir solo nuestros trozos, sin los del Póker.
- [x] 6.4 Actualizar la memoria «registro de un juego nuevo»: cada juego nuevo necesita su apartado «Un poco de historia».
