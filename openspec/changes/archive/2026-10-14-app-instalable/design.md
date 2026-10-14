## Context

El cliente es una SPA de Svelte 5 + Vite con `base: './'`, publicada en GitHub Pages en `/JuegosDeMesaJS/`. No hace peticiones de red después de cargar: las cartas son SVG generados por código y las fuentes son del sistema. El guardado vive en `localStorage`. El proyecto pide no añadir dependencias si no hace falta.

## Goals / Non-Goals

**Goals:**
- Aplicación instalable en Android, iOS y escritorio, que funcione sin conexión después de la primera visita.
- Actualizaciones controladas por el jugador, sin recargas inesperadas en mitad de una partida.

**Non-Goals:**
- Notificaciones push, sincronización en segundo plano y empaquetado nativo.

## Decisions

### 1. Service worker propio generado en el build (sin `vite-plugin-pwa`)
Un plugin de Vite en `vite.config.ts` usa el hook `generateBundle`. Ahí recoge los nombres de todos los archivos del bundle y de `public/`, calcula un hash corto de su contenido y emite `sw.js` a partir de una plantilla (`src/pwa/sw-plantilla.js`) con dos constantes: `VERSION` y `ARCHIVOS`.

Así funciona el service worker:
- **`install`:** abre la caché `juegos-<VERSION>` y añade `./` y todos los `ARCHIVOS`. No llama a `skipWaiting`, para esperar a que lo pida el jugador.
- **`activate`:** borra las cachés antiguas y llama a `clients.claim()`.
- **`fetch`:** solo atiende las peticiones `GET` del mismo origen. Responde primero desde la caché y, si no está, desde la red. Para las navegaciones, sirve `./index.html` de la caché.
- **`message` con `'activar'`:** llama a `skipWaiting()`.

En desarrollo (`vite dev`) no se registra el service worker, para no interferir con la recarga en caliente.

*Alternativa descartada:* `vite-plugin-pwa` con Workbox. Funciona bien, pero añade una dependencia pesada para unas 60 líneas de código propio.

### 2. Registro y aviso de actualización
`src/pwa/registro.svelte.ts` exporta un estado reactivo `pwa` con `hayActualizacion`, `puedeInstalar` y `esIOS`, y las funciones `actualizar()` e `instalar()`:
- **Registro:** si `import.meta.env.PROD` y `'serviceWorker' in navigator`, se registra `./sw.js`.
- **Actualización:** cuando hay un `registration.waiting`, o un worker nuevo pasa a `installed` mientras ya hay un controlador, se pone `hayActualizacion`. `actualizar()` le envía `'activar'` al worker que espera, y en `controllerchange` se recarga la página.
- **Instalación:** `beforeinstallprompt` se guarda (con `preventDefault`) y activa `puedeInstalar`, e `instalar()` llama a `prompt()`. El modo `standalone` se detecta con `matchMedia('(display-mode: standalone)')` y `navigator.standalone`.

`App.svelte` muestra una barra fija abajo con «Hay una versión nueva» y el botón «Actualizar». `Menu.svelte` muestra «Instalar» o la indicación de iOS.

### 3. Manifiesto e iconos
`public/manifest.webmanifest` lleva `start_url: "./"`, `scope: "./"`, `display: "standalone"`, `background_color` y `theme_color` del tapete (`#0f5132`) y `lang: "es"`. Los iconos `icono-192.png`, `icono-512.png`, `icono-maskable-512.png` y `apple-touch-icon.png` (180 px) se generan una vez desde un SVG fuente (`public/icono.svg`): una carta de as de oros sobre el tapete. La conversión a PNG se hace con un script que usa el Chromium de Playwright (`scripts/iconos.mjs`), y los PNG se versionan en el repositorio. `index.html` enlaza el manifiesto, `apple-touch-icon`, `apple-mobile-web-app-capable` y el icono SVG.

### 4. Tests
- **E2E sobre `vite preview` (build real):**
  - el manifiesto es válido y sus iconos cargan;
  - `navigator.serviceWorker.ready` se resuelve;
  - con `context.setOffline(true)`, al recargar se ve el menú y se juega una partida de Klondike con autocompletar, o de Brisca.
- **Actualización:** se simula con un worker en espera. El test registra el service worker, cambia `sw.js` interceptando la ruta para que la versión sea distinta, llama a `registration.update()` y comprueba que aparece el aviso y que, al pulsar «Actualizar», la página se recarga.
- Todos los E2E ya corren contra `vite preview` del build. Los proyectos de los juegos bloquean el service worker (`serviceWorkers: 'block'`), para que cada carga venga del servidor. Un proyecto `pwa` aparte lo permite y ejecuta en serie solo `pwa.spec.ts`, porque el test de actualización reescribe `dist/sw.js` y lo restaura al terminar.
- Dos detalles que salieron al probar:
  - El `controllerchange` de la primera visita (por `clients.claim`) no debe recargar la página. Solo se recarga si el jugador pulsó «Actualizar».
  - El service worker busca en la caché con `ignoreVary`, porque los scripts de módulo piden con cabecera `Origin` y el servidor responde con `Vary: Origin`.
- `@types/node` entra como dependencia de desarrollo del cliente, solo de tipos, para el plugin que corre en Node durante el build. No llega al build.

## Risks / Trade-offs

- **Caché obsoleta que deja la aplicación vieja** → la versión es un hash del contenido del build: cualquier cambio publica un `sw.js` distinto, el navegador lo detecta y se ofrece actualizar.
- **GitHub Pages sirve `sw.js` con caché HTTP de 10 minutos** → el navegador revisa el service worker al navegar, y como mucho tarda esos minutos en ver la versión nueva.
- **iOS limita el almacenamiento y no tiene `beforeinstallprompt`** → se muestra la indicación manual. El juego cabe de sobra en la cuota.
