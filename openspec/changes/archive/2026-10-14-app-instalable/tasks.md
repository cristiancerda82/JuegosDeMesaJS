## 1. Manifiesto e iconos

- [x] 1.1 Diseñar el icono SVG fuente (`public/icono.svg`) y generar los PNG de 192, 512, maskable 512 y apple-touch 180 con un script sobre el Chromium de Playwright
- [x] 1.2 Escribir `public/manifest.webmanifest` y enlazarlo en `index.html` con los iconos y las metaetiquetas de iOS

## 2. Service worker

- [x] 2.1 Escribir la plantilla del service worker (instalar con precarga, activar limpiando cachés viejas, responder desde caché con navegación a `index.html`, activar al recibir el mensaje)
- [x] 2.2 Escribir el plugin de Vite que genera `sw.js` con la lista de archivos del build y una versión por hash de contenido
- [x] 2.3 Registrar el service worker solo en producción, con el estado reactivo de actualización e instalación

## 3. Interfaz

- [x] 3.1 Mostrar el aviso «Hay una versión nueva» con «Actualizar» en `App.svelte`
- [x] 3.2 Mostrar «Instalar» en el menú cuando el navegador lo ofrece, la indicación para iOS, y nada si ya está instalada; textos en español

## 4. Verificación

- [x] 4.1 Añadir a Playwright un proyecto `pwa` contra `vite preview` del build
- [x] 4.2 E2E: manifiesto e iconos válidos, service worker registrado y partida completa sin conexión tras la primera visita
- [x] 4.3 E2E: aviso de actualización con un `sw.js` nuevo y recarga al pulsar «Actualizar»
- [x] 4.4 Ejecutar el build, todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
