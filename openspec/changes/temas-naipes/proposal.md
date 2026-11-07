## Why

Todas las cartas de la suite usan un único diseño minimalista y propio: palos geométricos y figuras reducidas a un icono (corona, tiara, cabeza de caballo, paje). Es claro, pero no se parece a las barajas que conocen los jugadores. Queremos ofrecer diseños con el aire de los naipes tradicionales, como el castizo español, el napolitano y el victoriano inglés, y que cada jugador elija el suyo.

## What Changes

- **Temas de naipes** seleccionables, uno para la baraja española y otro para la francesa, independientes entre sí:
  - Española: **Minimal** (el diseño actual), **Castizo** (inspirado en el naipe español clásico de fines del XIX) y **Napolitano** (inspirado en los naipes regionales italianos).
  - Francesa: **Minimal** (el actual) y **Victoriano** (inspirado en las barajas inglesas y americanas de hacia 1880).
- Todo el arte es **propio e inspirado en esos estilos**: no se copian ni calcan ilustraciones existentes, ni se usan marcas, logotipos o nombres de fabricantes.
- Cada tema define el papel, el marco, la tipografía de los índices, los dibujos de los palos, la disposición de los numerales y las **figuras ilustradas** (sota, caballo y rey; jota, reina y rey).
- Todos los temas conservan los **índices en las esquinas** y el nombre accesible de cada carta, aunque la baraja histórica no los tuviera, para que se pueda jugar en abanico y con lector de pantalla.
- Un **selector de diseño** en el menú, junto al del dorso, con una vista previa de cartas de cada baraja. El muestrario de cartas permite ver el mazo completo con el tema elegido.
- La elección se guarda en el dispositivo y se aplica a todas las mesas, al menú y al muestrario. Los comodines, los triunfos y la Excusa del Tarot y los dorsos no cambian en este change.

## Capabilities

### New Capabilities
- `temas-naipes`: catálogo de diseños de baraja española y francesa, su elección y guardado, las reglas que todo tema debe cumplir (índices, legibilidad, accesibilidad, sin conexión) y su aplicación en toda la interfaz.

### Modified Capabilities
(ninguna)

## Impact

- Cliente: `cartas/Carta.svelte` y `cartas/dibujo.ts` se reorganizan alrededor de un tema; el diseño actual pasa a ser el tema «Minimal». Hay temas nuevos en `cartas/temas/`, cada uno cargado de forma diferida. `pantallas/Menu.svelte` gana el selector y `cartas/Muestrario.svelte` la elección de tema. `App.svelte` guarda y aplica el tema como hoy hace con el dorso, y hay textos nuevos en `textos.ts`.
- Recursos: las ilustraciones de los tres temas nuevos, unas 30 figuras con atributos por palo, más los palos y los marcos, como SVG de autoría propia en el repositorio.
- Build y PWA: los temas se generan como trozos separados del bundle. El service worker ya precarga todo el build, así que cualquier tema funciona sin conexión.
- Tests: unitarios de la elección y del guardado, y e2e con capturas de cada tema en el muestrario y en una mesa grande (Spider).
- Sin cambios en el motor, el servidor ni el protocolo de red.
