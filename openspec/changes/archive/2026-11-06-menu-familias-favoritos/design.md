## Context

- `pantallas/Menu.svelte` lleva dentro una lista literal de los 78 juegos con su descripción y sus 3 cartas de muestra. `sesion/juegos.ts` tiene el registro `JUEGOS` (nombre, motor, configuración, IA…), un tipo `DefJuego` genérico y ya muy grande.
- `App.svelte` cambia de pantalla con un estado `pantalla` (`menu`, `opciones`, `partida`, `red`, `espera`…). Al volver de `Opciones` se llama a `irAlMenu()`, y el `Menu` se monta de nuevo desde cero.
- Las preferencias locales siguen un patrón común: claves `juegos-de-mesa/<algo>` en `localStorage`, con lectura y escritura dentro de `try` que nunca rompen la app (`guardado.ts`, `nivel.ts`, el dorso en `App.svelte`).
- Hay 82 e2e de Playwright que abren cada juego con `page.getByTestId('juego-<id>').click()` desde la pantalla inicial, sin un helper común.
- Los specs del cambio están en `specs/menu-juegos/spec.md` y `specs/mesa-cliente/spec.md`.

## Goals / Non-Goals

**Goals:**
- Que los datos del menú de cada juego (familia, barajas, descripción y cartas) estén en un solo sitio, con tipos que obliguen a clasificar cualquier juego nuevo.
- Que la lógica de favoritos y recientes sea pura y se pueda probar con tests unitarios, igual que `estadisticas.ts`.
- Que la vista del menú (familia abierta, búsqueda, filtro) sobreviva al ir a las opciones y volver.

**Non-Goals:**
- Sincronizar favoritos o recientes entre dispositivos: no hay cuentas.
- Reordenar favoritos a mano, ni más de un nivel de familias (subfamilias).
- Cambiar el aspecto de las cartas: eso es el change de temas de naipes.

## Decisions

### 1. Catálogo del menú separado de `JUEGOS`
Un módulo nuevo, `menu/catalogo.ts`, con `CATALOGO: Readonly<Record<IdJuego, EntradaCatalogo>>`, donde `EntradaCatalogo = { familia, barajas, desc, cartas }`, y `FAMILIAS`, la lista ordenada de familias con su id y su texto. El `Record<IdJuego, …>` hace que TypeScript falle si un juego nuevo no se clasifica. Eso cubre el escenario «Todos los juegos están en una familia» en tiempo de compilación, y además se comprueba en un test.

- *Alternativa:* añadir los campos a `DefJuego`. Se descarta porque `DefJuego` describe cómo se *juega* (motor, IA, pausas) y es genérico. Mezclar en él datos de presentación del menú hace crecer un archivo de ~1500 líneas, y el catálogo no necesita los tipos genéricos.
- `barajas` es un array (`readonly ('espanola' | 'francesa')[]`), para que un juego que admita las dos aparezca con ambos filtros. El Tarot se marca como `['francesa']`.
- La lista de juegos que hoy está en `Menu.svelte` se mueve aquí, con sus `desc` y `cartas` sin cambios.

### 2. Preferencias del menú: módulo puro más envoltorio de almacenamiento
`menu/preferencias.ts` con funciones puras:
- `alternarFavorito(lista, id)`: si estaba, lo quita; si no, lo pone primero.
- `registrarReciente(lista, id)`: lo pone primero, quita el duplicado y corta a 10.
- `leerLista(texto)`: parsea JSON y filtra lo que no sea un `IdJuego` válido (`ID_JUEGOS`), sin lanzar nunca.

Encima, un estado reactivo `menu/preferencias.svelte.ts` (`favoritos`, `recientes`, `filtroBaraja`) que lee al arrancar y guarda en cada cambio, con `try` como en `guardado.ts`. Claves: `juegos-de-mesa/favoritos`, `juegos-de-mesa/recientes` y `juegos-de-mesa/filtro-baraja`. Si guardar falla, el estado en memoria sigue valiendo durante la sesión, que es lo que pide el spec «Almacenamiento no disponible».

- *Alternativa:* guardar la fecha del último juego en `estadisticas.ts`. Se descarta porque las estadísticas solo se registran al *terminar*, y los recientes cuentan al *empezar*. Mezclarlas obligaría a migrar el formato guardado.

### 3. Dónde se registra un juego reciente
Todo en `App.svelte`, que es por donde pasa cada inicio:
- `empezar()` (cubre también la revancha local) y `continuar()`;
- `crearSala()` y, para quien se une o vuelve, un `$effect` en la pantalla `espera` que registra `cliente.sala.juego` la primera vez que llega la información de la sala. El que se une no sabe el juego hasta entonces.

Solo se registra si la acción sale bien. Si `nuevaPartida` falla, no cuenta.

### 4. Estado de navegación del menú fuera del componente
`menu/navegacion.svelte.ts` guarda `{ familia: IdFamilia | null, busqueda: string }` como estado de módulo. `Menu.svelte` lo lee y lo escribe. Como el módulo persiste aunque el `Menu` se desmonte, al volver de `Opciones` se restaura la vista de la que se vino sin tocar el tipo `Pantalla` de `App.svelte`. No se guarda en el dispositivo: al recargar se empieza en las familias. El filtro de baraja sí se guarda (decisión 2).

- *Alternativa:* añadir `familia` a `{ tipo: 'menu' }` y a `{ tipo: 'opciones' }`. Se descarta porque obliga a pasarlo por todas las transiciones y por `irAlMenu()` sin aportar nada.

### 5. Componentes
- `Menu.svelte` mantiene los avisos, el bloque de retomar, el de red, el pie y el bloque de instalar. Su centro pasa a ser: buscador y chips de baraja, y debajo **o** la rejilla de familias, **o** la lista de una familia con «‹ Familias», **o** los resultados de búsqueda.
- `menu/TarjetaJuego.svelte`: la tarjeta actual (abanico, nombre, descripción, «Jugar») más la estrella. La estrella es un `<button>` hermano del botón de la tarjeta, no anidado (HTML no permite botón dentro de botón), colocado en posición absoluta en la esquina.
- `menu/TarjetaFamilia.svelte`: nombre, número de juegos y un abanico con las cartas del primer juego de la familia.
- `menu/BotonFavorito.svelte`: estrella reutilizable en la tarjeta y en `Opciones.svelte`.
- `menu/AccesosRapidos.svelte`: los dos botones flotantes (★ y ⟲) y el panel abierto, como `<dialog>` no modal, con su gestión de foco y Escape. Solo lo monta `Menu.svelte`, así que nunca aparece durante una partida.
- La lista de un panel reutiliza filas compactas (nombre y 1 carta), no la tarjeta grande.

### 6. Búsqueda
Se normaliza con `texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()` y se compara por `includes` con el nombre del juego (`JUEGOS[id].nombre`), normalizado igual. Así «guinote» encuentra «Guiñote». Los resultados salen en el orden de las familias.

### 7. Diseño de los flotantes
Los botones van fijos abajo a la derecha (`position: fixed`, respetando `env(safe-area-inset-bottom)`). El contenedor del menú gana un `padding-bottom` igual a la altura de los botones, para que la última tarjeta no quede tapada (escenario de 360 px). En pantallas anchas el panel se abre como columna anclada a los botones; en móvil, como hoja inferior a todo el ancho.

### 8. Tests e2e
Un helper nuevo, `e2e/menu.ts`, con `abrirJuego(page, id)`, que pulsa `familia-<familia>` (sacada de `CATALOGO`) y después `juego-<id>`. Los 82 e2e cambian `page.getByTestId('juego-<id>').click()` por `await abrirJuego(page, '<id>')`, un cambio mecánico. Las cartas de muestra no cambian, así que los tests que dependen del menú solo cambian en ese paso. Además hay un e2e nuevo, `e2e/menu.spec.ts`, para familias, filtro, búsqueda, favoritos, recientes y paneles.

- *Alternativa:* dejar todos los juegos en el DOM ocultos para no tocar los tests. Se descarta porque mantendría 78 tarjetas montadas, justo lo que se quiere aligerar, y los tests no reflejarían el flujo real.

## Risks / Trade-offs

- [El cambio en 82 e2e es grande y fácil de romper] → Se hace con un reemplazo mecánico y se ejecuta la batería e2e completa antes de dar el change por terminado.
- [Clasificación discutible: el Tarot, el Mus o el Julepe podrían ir en otra familia] → Es un dato del catálogo: moverlo es cambiar una línea y el escenario de la tabla del spec.
- [Los botones flotantes tapan contenido en pantallas bajas] → Padding inferior reservado y verificación en el e2e de 360 px.
- [`<dialog>` no modal y foco en navegadores antiguos o WebView] → Las WebView de Android y iOS actuales admiten `<dialog>`; la gestión del foco se hace a mano igualmente (guardar el disparador y devolverle el foco al cerrar).
- [Datos de favoritos o recientes con ids de juegos retirados] → `leerLista` los filtra contra `ID_JUEGOS`.

## Migration Plan

No hay datos previos que migrar: las claves de favoritos, recientes y filtro son nuevas. El resto del guardado no cambia. Para volver atrás basta con revertir el cliente; las claves nuevas quedarían ignoradas.
