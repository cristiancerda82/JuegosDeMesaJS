## 1. Catálogo del menú

- [x] 1.1 Crear `menu/catalogo.ts` con `FAMILIAS` (orden y textos) y `CATALOGO: Record<IdJuego, EntradaCatalogo>` (familia, barajas, desc, cartas), moviendo la lista que hoy está en `Menu.svelte` y clasificando los 78 juegos según la tabla del spec
- [x] 1.2 Añadir a `textos.ts` los textos de las familias, el filtro, el buscador, los favoritos, los recientes y los paneles
- [x] 1.3 Tests unitarios: cada juego en exactamente una familia, cada familia con al menos un juego, todos los ids de `ID_JUEGOS` en el catálogo, y los ejemplos del filtro del spec (Brisca, Tute y Guiñote españolas; Skat no; ningún solitario español)

## 2. Preferencias: favoritos, recientes y filtro

- [x] 2.1 Crear `menu/preferencias.ts` con las funciones puras `alternarFavorito`, `registrarReciente` (primero, sin duplicados, máximo 10) y `leerLista` (tolera JSON roto e ids desconocidos)
- [x] 2.2 Crear `menu/preferencias.svelte.ts` con el estado reactivo `favoritos`, `recientes` y `filtroBaraja`, que lee y guarda en `localStorage` con `try` y sigue funcionando en memoria si falla
- [x] 2.3 Tests unitarios de los escenarios «El último jugado, primero», «Como mucho diez», el orden de los favoritos, los datos inválidos y el almacenamiento que lanza errores
- [x] 2.4 Registrar los recientes en `App.svelte`: `empezar` (incluida la revancha), `continuar`, `crearSala` y, en la pantalla de espera, el juego de la sala al unirse o volver; solo cuando la acción sale bien

## 3. Menú por familias

- [x] 3.1 Crear `menu/navegacion.svelte.ts` (familia abierta y texto de búsqueda) para que la vista se conserve al ir a las opciones y volver
- [x] 3.2 Crear `menu/TarjetaFamilia.svelte` y `menu/TarjetaJuego.svelte`; esta última es la tarjeta actual más la estrella como botón hermano, con `data-testid` `familia-<id>` y `juego-<id>`
- [x] 3.3 Reorganizar `Menu.svelte`: buscador y chips de baraja; rejilla de familias, lista de una familia con «‹ Familias» o resultados de búsqueda; el aviso «sin resultados»; recuento por familia según el filtro y ocultación de las familias vacías
- [x] 3.4 Búsqueda sin mayúsculas ni tildes, con resultados en el orden de las familias

## 4. Favoritos y paneles flotantes

- [x] 4.1 Crear `menu/BotonFavorito.svelte` (estado visible, nombre accesible «Añadir a favoritos» / «Quitar de favoritos») y usarlo en `TarjetaJuego` y en `Opciones.svelte`
- [x] 4.2 Crear `menu/AccesosRapidos.svelte`: botones flotantes ★ y ⟲, un solo panel abierto a la vez, cierre con botón, Escape o pulsación fuera, el foco devuelto al disparador y los textos de panel vacío
- [x] 4.3 Colocación fija con `safe-area-inset-bottom` y padding inferior en el menú; panel lateral en escritorio y hoja inferior en móvil; montado solo dentro de `Menu.svelte`

## 5. Tests e2e

- [x] 5.1 Crear `e2e/menu.ts` con `abrirJuego(page, id)` (familia y después juego, a partir de `CATALOGO`) y sustituir en los e2e existentes cada `getByTestId('juego-<id>').click()` por `abrirJuego`
- [x] 5.2 Crear `e2e/menu.spec.ts`: elegir un solitario, volver desde las opciones a la familia, el filtro español y que se recuerda al recargar, buscar «guinote» y sin resultados
- [x] 5.3 E2E de favoritos (marcar en el menú, quitar desde las opciones, conservar el orden al recargar) y de recientes (orden, sin duplicados, partida en red al unirse)
- [x] 5.4 E2E de los paneles: Escape devuelve el foco, 360 × 640 sin tapar la última tarjeta ni scroll horizontal, sin botones flotantes durante una partida, y almacenamiento que falla sin errores visibles

## 6. Verificación

- [x] 6.1 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
