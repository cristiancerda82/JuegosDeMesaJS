## Why

La revisión de los libros de juegos de cartas (`JuegosDeMesaJS_Docs/revision-libros.md`, punto 3) dejó material que no cabía en el change de las reglas:

- consejos de estrategia que da quien conoce bien el juego;
- variantes regionales que no son opciones de la mesa;
- un poco de historia de cada juego.

Las reglas variantes ya están (change `reglas-variantes-libros`). Ahora toca completar la guía, que es lo que lee quien aprende a jugar.

## What Changes

- **Un poco de historia.** Cada guía, la de todos los juegos de la suite, termina con un apartado plegado «Un poco de historia», cerrado por defecto. Es un párrafo corto: de dónde viene el juego y su nombre. Ejemplos: el Tute viene del italiano *tutti*, el Polignac lleva el nombre del ministro de Carlos X y el Écarté se extendió con el ejército napoleónico. Cuando un dato no es seguro, el texto lo dice («se cree», «probablemente»).
- **Consejos de los libros**, redactados con nuestras palabras y añadidos a la sección «Consejos» que ya existe:
  - **Tute:** contra el As no se arrastra; primero se busca el cante que falta con el As de ese palo; si el compañero ha enseñado el As de triunfo, se arrastra en cuanto se entra en baza.
  - **Brisca:** lleva la cuenta de los puntos que han salido más que de las cartas.
  - **Burro:** ordena la mano y fíjate en lo que piden y en lo que pasan los demás.
  - **Mus:** cuándo cortar el mus y qué dicen los descartes de los rivales.
  - **Butifarra:** cuándo delegar y cuándo cantar butifarra.
- **«En otros sitios…»**: una línea en la guía para cada variante regional que los libros cuentan y la suite no juega, sin opción en la mesa:
  - la Escoba a 31;
  - la carta tapada o destapada en la Siete y media;
  - «bailarla» en el Julepe;
  - las señas en la Brisca;
  - el Tute subastado de 3 con 12 cartas;
  - el Remigio de 10 cartas con dos barajas de 52;
  - el orden antiguo del Polignac;
  - el Treinta y uno con viuda;
  - el Oh Hell que sube de 1 al máximo;
  - el dominó del Barbu empezando por el número que elige quien reparte;
  - el otro juego que en algunas zonas se llama Burro.
- **Dos ejemplos visuales nuevos** de las variantes de los libros, comprobados con el motor como los demás:
  - en el Chinchón, colocar una carta suelta en una combinación a la vista;
  - en la Escoba, el premio de los 10 oros y los 4 sietes.
- No cambia ninguna regla, ningún motor ni ninguna IA. El Póker de cinco queda fuera mientras su change (`juego-poker-cinco`) está en curso. Solo recibe su párrafo de historia en la copia de trabajo, para que pase el test, y ese trozo va con su change.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `mesa-cliente`: la guía de cada juego añade el apartado plegado de historia, los consejos de los libros, las líneas «En otros sitios…» y los dos ejemplos nuevos de las variantes.

## Impact

- `packages/client/src/textos.ts`: las secciones nuevas o ampliadas de `T.ayuda`.
- `packages/client/src/pantallas/ComoSeJuega.svelte`: la sección plegable (`plegada: true`, que se pinta como `<details>`).
- `packages/client/src/ayuda/ejemplos/combinaciones.ts`, `captura.ts` y sus tests: los dos ejemplos nuevos.
- Tests: un test unitario de que cada juego tiene su historia, y el E2E de la guía (que el apartado empieza plegado y se abre, también a 360 px).
- Sin cambios en `packages/engine` ni en `packages/server`. Las partidas guardadas no se ven afectadas.
