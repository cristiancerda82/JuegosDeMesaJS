## Context

- `cartas/Carta.svelte` dibuja cada carta como un `<svg viewBox="0 0 100 140">` en línea: papel, índices en dos esquinas, numerales (`pips`), as grande o figura. Los dibujos están en `cartas/dibujo.ts`: un path por palo (`PALOS`), iconos de figura en capas (`FIGURAS`), posiciones de los numerales (`PIPS`) y `nombreCarta` para el nombre accesible.
- Solo `Carta.svelte` usa los dibujos. Las mesas importan de `dibujo.ts` únicamente `nombreCarta`. Cambiar el render de la carta no toca ninguna mesa.
- Los dorsos ya funcionan como preferencia: variables CSS (`--dorso`, `--dorso-claro`) bajo `:root[data-dorso=…]`, guardadas en `localStorage` desde `App.svelte`. El papel y el borde también son variables (`--papel`, `--borde-carta`).
- El service worker propio (`pwa/service-worker.ts`) precarga **todos** los archivos del build. Cualquier trozo cargado de forma diferida queda disponible sin conexión una vez instalada la app.
- Las mesas más cargadas (Spider, con 104 cartas; Canasta y Pinacle, con dos barajas) montan más de 100 `<Carta>` a la vez.
- El estilo de referencia está en `JuegosDeMesaJS_Docs/DiseñoNaipes` (naipe español clásico, napolitanas y una baraja americana de ~1880), solo como inspiración (ver el spec «Originalidad del arte»).

## Goals / Non-Goals

**Goals:**
- Un modelo de tema en el que añadir un diseño nuevo sea añadir arte y una tabla de datos, sin tocar `Carta.svelte` ni las mesas.
- Separar el **arte** (SVG editables en herramientas de dibujo) del **código**, con un contrato de ids, para que las ilustraciones se puedan mejorar o sustituir más adelante, por ejemplo por las de un ilustrador, sin cambios de código.
- Que el tema ilustrado no penalice las mesas grandes.

**Non-Goals:**
- Temas para los comodines, los triunfos y la Excusa del Tarot, o para los dorsos (siguen como están).
- Cartas animadas o en relieve, temas descargables de terceros, o temas que cambien la proporción 100 × 140 de la carta.
- Un editor de temas dentro de la app.

## Decisions

### 1. Modelo de tema: datos más sprite de símbolos
```ts
interface TemaNaipes {
  id: 'minimal' | 'castizo' | 'napolitano' | 'victoriano';
  baraja: 'espanola' | 'francesa';
  papel: string; borde: string;            // colores del papel y del canto
  indice: { fuente: string; peso: number; color(palo): string };
  palo(palo): RefDibujo;                   // símbolo del palo (esquinas y numerales)
  numeral(palo, valor): RefDibujo | Pips;  // composición propia o posiciones de pips
  as(palo): RefDibujo;
  figura(palo, valor): RefDibujo;
  marco?(palo): RefDibujo;                 // p. ej. las pintas del Castizo
}
```
`RefDibujo` es el id de un `<symbol>` del sprite del tema, o en Minimal un path en línea como hoy. `Carta.svelte` deja de saber de palos concretos: pide al tema cada pieza y la coloca. Minimal se reescribe con este modelo a partir de `dibujo.ts`, sin cambiar su aspecto. Un test de capturas lo garantiza.

- `numeral` puede devolver una **composición entera** en lugar de posiciones de pips. Hace falta para el Napolitano, donde las espadas y los bastos del 2 al 10 son trazos entrelazados y no símbolos sueltos, y para los bastos y espadas cruzados del Castizo.
- *Alternativa:* un componente Svelte por tema (`CartaCastizo.svelte`…). Se descarta porque duplicaría la lógica de índices, accesibilidad y colocación en cada tema, que es justo lo que el spec exige igual en todos.

### 2. Render: sprite inyectado una vez y `<use>` en cada carta
Cada tema ilustrado aporta un sprite (`<svg><symbol id="castizo-rey-copas" viewBox="…">…</symbol>…</svg>`) que se inserta **una sola vez** en un contenedor oculto del documento. Cada carta solo referencia con `<use href="#castizo-rey-copas"/>`. Una figura ilustrada puede tener cientos de nodos: con `<use>`, las 104 cartas de Spider no multiplican ese DOM, y el navegador reutiliza el árbol del símbolo.

- Los colores que varían por palo (por ejemplo, el vestido del rey) se pasan como variables CSS en el `<use>` (`style="--ropa: …"`). Las variables CSS se heredan dentro del árbol de `<use>`, así que un mismo símbolo sirve con paletas distintas.
- *Alternativa A:* incluir el SVG de la figura en línea en cada carta. Se descarta por el tamaño del DOM en las mesas grandes (spec «Rendimiento con muchas cartas»).
- *Alternativa B:* un archivo SVG por carta mostrado con `<img>`. Es un DOM mínimo, pero obliga a generar unos 100 archivos por tema con el índice incrustado, pierde las variables CSS del papel y separa el índice del resto del render. Se descarta.

### 3. Figuras: base por rango más atributo del palo
Para que el arte sea abordable, cada tema dibuja **una figura base por rango** y **un atributo por palo**, que es el objeto que sostiene: copa, espada, basto, oro, o el símbolo del palo francés. `figura(palo, valor)` compone base, atributo y paleta del palo. Así se cumple que las cuatro figuras de un rango se distingan por el dibujo, con unos 3–4 dibujos base y 4 atributos por tema, en lugar de 12–16 ilustraciones completas.

| Tema | Figuras | Notas de estilo |
|---|---|---|
| Castizo | sota, caballo y rey de cuerpo entero, sin espejo | Colores planos (rojo, azul celeste, amarillo, verde) con contorno negro; marco con **pintas** (oros sin corte, copas 1, espadas 2, bastos 3); bastos nudosos y espadas rectas |
| Napolitano | fante, cavallo y re de cuerpo entero | Papel crema, paleta apagada; espadas curvas y bastos de maza en composición; oros como rosetón; **índices añadidos** |
| Victoriano | jota, reina, rey y caballo de **doble cabeza** | Se dibuja media figura y se refleja con `rotate(180)`; filete fino alrededor de la figura; índices con serifa; as de picas ornamental propio |

### 4. Contrato de arte y flujo de trabajo
El arte vive como SVG editables en `cartas/temas/<tema>/arte/` (`figura-rey.svg`, `atributo-copas.svg`, `palo-oros.svg`, `numeral-espadas-7.svg`, `marco-bastos.svg`…), con viewBox fijos por tipo de pieza. Un script de build del tema (`temas/<tema>/sprite.ts`) los reúne con `import.meta.glob('./arte/*.svg', { query: '?raw', import: 'default', eager: true })`, los convierte en `<symbol>` con el prefijo del tema y exporta el sprite como texto.

Un **test de contrato** comprueba para cada tema:
- que existen todos los símbolos que pide `TemaNaipes` para todas las cartas de su baraja (48 españolas; 52 más 4 caballos franceses);
- que el arte no contiene `<script>`, atributos `on*`, `<foreignObject>`, referencias externas (`href` a otro archivo o a `http`) ni elementos `<text>` (así no se cuela texto de marcas y el sprite es seguro de inyectar);
- que el sprite comprimido no pasa de un presupuesto (objetivo: 150 KB gzip por tema).

El arte se optimiza con SVGO, como dependencia de desarrollo, mediante un script (`pnpm arte:optimizar`) que se ejecuta al añadir o cambiar arte. Lo que se versiona es el SVG ya optimizado: el build no depende de SVGO.

Primera versión del arte: ilustración vectorial plana hecha en el proyecto (formas cerradas, colores planos y contorno), coherente con el estilo de cada referencia. Como el contrato fija ids y viewBox, una versión más detallada puede sustituir los archivos más adelante sin cambiar código.

### 5. Carga diferida y precarga
`cartas/temas/index.ts` registra cada tema con `cargar: () => import('./castizo')`, con lo que Vite genera un trozo por tema. Minimal va en el bundle principal. El estado `cartas/tema.svelte.ts` guarda:
- la **elección** (`espanola`, `francesa`), leída de `juegos-de-mesa/tema-espanola` y `juegos-de-mesa/tema-francesa` con `try`, como el dorso;
- los **temas listos**: el tema efectivo de cada baraja es el elegido si ya está cargado, y Minimal si no.

Al arrancar, `main.ts` lanza la carga de los temas guardados y espera como mucho 300 ms antes de montar la app. Si el tema llega antes, no hay parpadeo; si no, se monta con Minimal y las cartas cambian al llegar. Si la importación falla, se registra en consola y se queda en Minimal (spec «Disponibilidad y carga»). Como el service worker precarga todo el build, los temas funcionan sin conexión. Además, solo se descarga el tema que se usa, salvo en la app instalada.

### 6. Cómo recibe `Carta` el tema
`Carta.svelte` lee el tema efectivo del estado de módulo, sin prop, para no tener que pasarlo por las ~70 mesas. Tiene un prop opcional `tema` que lo fuerza; lo usan las vistas previas del selector y el muestrario para enseñar un tema distinto del elegido. Abrir el selector de una baraja carga sus temas (2 o 3) para poder previsualizarlos.

### 7. Selector y muestrario
- En el pie del menú, junto al dorso, un botón «Diseño de las cartas» abre un panel con dos grupos de radio (española y francesa). Cada opción es una tarjeta con su vista previa (as, numeral y figura) dibujada con `<Carta tema=…>`. Los radios dan teclado y lector de pantalla sin trabajo extra.
- El muestrario gana los mismos dos selectores encima de las barajas.
- Si el change `menu-familias-favoritos` ya está aplicado, el selector va en el mismo pie, que ese change no toca.

### 8. Tests
- **Unitarios:** la lectura y el guardado de la elección (valor inválido, almacenamiento que falla) y el contrato de arte (decisión 4).
- **Capturas (Playwright `toHaveScreenshot`):** el muestrario completo con cada tema, y Minimal comparado con capturas tomadas **antes** del cambio, para garantizar «Por defecto, sin cambios».
- **E2E:** cambiar el tema y que se recuerde al recargar; Escoba con Napolitano y Klondike con Minimal; columna de Klondike con 12 cartas solapadas en Victoriano; mano de la Escoba a 360 × 640 en Castizo; el mismo nombre accesible con todos los temas; sin conexión con la app instalada (ampliando `pwa.spec.ts`); fallo de carga simulado bloqueando la petición del trozo.
- **Rendimiento:** e2e que mide el tiempo hasta mostrar Spider de 4 palos con Minimal y con Victoriano en la misma ejecución, y exige que el segundo no pase del doble del primero.

### 9. Diseños propios del usuario: generadores incorporados y sprite al cargar
Las 24 barajas del usuario son librerías JS (una por baraja) que generan cada carta como un SVG completo de 240 × 336 (`svgCarta(valor, palo)`), la misma proporción que nuestras cartas. Se copian **sin modificar** en `cartas/temas/propios/vendor/`, para que el usuario pueda actualizarlas copiando sus archivos, y se cargan con `import.meta.glob` diferido: un trozo por baraja (5–19 KB comprimido). Al cargar el tema se generan todas sus cartas y se convierten en `<symbol>` (uno por carta), reescribiendo los ids internos de cada una (degradados, patrones) con un prefijo único, porque varias barajas usan los mismos ids. `TemaNaipes` gana `completa(palo, valor)`, que devuelve el símbolo de la carta entera: `Carta.svelte` dibuja entonces un solo `<use>`, sin papel ni índices propios (la carta del usuario ya los trae). Las cartas que una baraja no tiene (el caballo francés del Tarot) caen en el dibujo de Minimal.

- *Alternativa:* pregenerar los SVG en el build. Se descarta: el sprite generado pesa 7–30 KB comprimido frente a 5–19 KB del generador, y obligaría a regenerar a mano cada vez que el usuario cambie un diseño.
- Los generadores quedan fuera de lint y formato (son del usuario) y su salida se valida en el test de contrato (sin `<script>`, `on*`, `<foreignObject>`, imágenes ni referencias externas).
- El selector solo monta sus vistas previas al abrirse, para no descargar las 24 barajas al cargar el menú.

## Risks / Trade-offs

- [La calidad de las ilustraciones vectoriales hechas en el proyecto puede quedar lejos de un grabado tradicional] → El estilo plano es intencionado y coherente con las referencias de colores planos. El contrato de arte permite sustituir los SVG por otros mejores sin tocar código. Cada tema se revisa visualmente con el usuario antes de cerrarlo.
- [Parecido excesivo con una baraja concreta] → Solo se toman rasgos de estilo genéricos (paleta, pintas, doble cabeza). No se trabaja calcando sobre las imágenes de referencia, y la revisión del spec «Originalidad del arte» se hace tema a tema.
- [Las capturas cambian entre sistemas por el suavizado de fuentes] → Las capturas se generan y comparan en el mismo entorno (Chromium de Playwright) con un umbral de diferencia pequeño, y los índices usan familias genéricas (`serif`, `system-ui`), que Playwright resuelve igual en cada ejecución.
- [La precarga de 300 ms retrasa el primer render] → Solo ocurre si hay un tema no Minimal guardado. Con la app instalada, el trozo sale de la caché en milisegundos.
- [El tamaño del build crece con tres temas] → Presupuesto de 150 KB gzip por tema, comprobado en el test de contrato. Los temas no elegidos no se descargan fuera de la app instalada.
- [Bugs de `<use>` con variables CSS en WebView antiguas] → Las WebView actuales de Android (Chromium) y iOS (WebKit) lo admiten. Se prueba en Chromium y WebKit de Playwright.

## Migration Plan

No hay datos que migrar: las claves de tema son nuevas y sin ellas todo queda en Minimal. Primero se reescribe Minimal con el modelo nuevo, verificado por capturas, y después se añaden los temas uno a uno: Castizo, Victoriano y Napolitano. Cada tema puede publicarse por separado. Para volver atrás basta con revertir el cliente; las claves guardadas se ignoran.
