## Why

La suite ya tiene 9 juegos y una publicación automática en GitHub Pages pensada para jugar desde el móvil en cualquier lugar. Pero hoy es solo una página web: hay que abrir el navegador, escribir o buscar la dirección y tener conexión para cargarla. Si se puede instalar como aplicación, tiene icono en la pantalla de inicio, se abre a pantalla completa y funciona sin conexión, que es justo cuando más se juega a las cartas: en el metro, de viaje o en el pueblo.

## What Changes

- **Instalable (PWA):** manifiesto web con nombre, colores, orientación libre e iconos propios (una carta con los palos españoles) en 192, 512 y versión «maskable». En Android y en Chrome de escritorio se puede instalar desde el navegador, y en iOS con «Añadir a pantalla de inicio».
- **Sin conexión:** un service worker guarda en caché todos los archivos del build en la primera visita, así que después la aplicación se abre y se juega sin red. La lista de archivos la genera el propio build con un pequeño plugin de Vite, sin dependencias nuevas.
- **Actualizaciones:** cuando se publica una versión nueva, la aplicación la descarga en segundo plano y muestra un aviso «Hay una versión nueva» con un botón «Actualizar». Nunca se recarga sola en mitad de una partida.
- **Botón «Instalar»** en el menú cuando el navegador lo permite (evento `beforeinstallprompt`), y una indicación breve para iOS.
- Las rutas son relativas, así que todo funciona igual en local, en GitHub Pages (`/JuegosDeMesaJS/`) y en cualquier carpeta.
- Fuera de alcance: notificaciones, sincronización entre dispositivos, empaquetado nativo (Capacitor o Tauri) y tiendas de aplicaciones.

## Capabilities

### New Capabilities
- `app-instalable`: instalación como aplicación (manifiesto e iconos), funcionamiento sin conexión con caché del build, aviso de actualización y botón de instalar.

### Modified Capabilities
<!-- Ninguna: el juego local sin red de `mesa-cliente` ya existe; esta capacidad lo extiende a abrir la aplicación sin conexión. -->

## Impact

- `packages/client`: el manifiesto y los iconos en `public/`, `index.html` (enlace al manifiesto, iconos de Apple y `theme-color`), un `sw.js` generado en el build, el registro del service worker y el aviso de actualización en `main.ts` y `App.svelte`, el botón «Instalar» en el menú, y los textos.
- `vite.config.ts`: un plugin propio que escribe `sw.js` con la lista de archivos del build y una versión basada en su contenido.
- Tests E2E: el manifiesto es válido, el service worker se registra, la aplicación funciona sin conexión después de la primera visita y aparece el aviso de actualización.
- Sin dependencias nuevas.
