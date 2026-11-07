## Why

Hoy la red solo funciona con un servidor arrancado en un ordenador de la red local (`ws://192.168.x.x:8787`). Eso deja dos huecos:
- La versión publicada en GitHub Pages se sirve por https, y el navegador bloquea las conexiones `ws://` sin cifrar, así que desde ella no se puede jugar en red.
- El siguiente paso de la suite es publicarla en Google Play como app Android, y Android también bloquea el tráfico sin cifrar.

Para jugar en red desde la web publicada y desde el móvil hace falta un servidor público con conexión segura, y que el cliente aguante los cortes típicos del móvil.

## What Changes

- **Servidor público en Railway** con `wss://`. El TLS lo pone Railway y se reutiliza el Dockerfile actual. El servidor lee el puerto de `PORT`, tiene un endpoint de salud, permite los orígenes de la web publicada y de la app Android, y añade límites por dirección IP.
- **Servidor por defecto:** las versiones publicadas (web y Android) se conectan al servidor público sin configurar nada. El campo para escribir otra dirección se mantiene para jugar en la red local desde el navegador.
- **Conexión robusta en el móvil:**
  - el cliente detecta una conexión muerta aunque el sistema no la haya cerrado;
  - reconecta en cuanto la app vuelve del segundo plano;
  - el servidor cierra las conexiones que dejan de responder, lo que activa la desconexión y la IA de reemplazo que ya existen.
- **App Android con Capacitor**, desde el mismo build del cliente:
  - funciona sin conexión contra la IA;
  - el botón atrás del sistema navega dentro de la app;
  - guarda la partida al pasar a segundo plano;
  - sin elementos de PWA (instalar, aviso de versión nueva);
  - apunta a Android 16 (API 36), sin tráfico sin cifrar en la versión de publicación.
- **Publicación en Google Play** con la cuenta de desarrollador existente:
  - ficha de la tienda y política de privacidad publicada;
  - formulario de seguridad de datos;
  - cuestionario de clasificación por edades, declarando el juego de azar simulado del Hold'em, el Blackjack y la Siete y media;
  - pista de pruebas antes de producción.
- **Fuera de alcance, con su justificación en el diseño:**
  - **Google Play Games Services para la red:** retiró el multijugador en 2020.
  - **Videoconsolas:** Xbox, Switch y PlayStation no admiten publicar una app web.
  - **iOS y la Microsoft Store de PC:** son candidatos para changes futuros.

## Capabilities

### New Capabilities
- `app-android`: empaquetado como app Android, comportamiento nativo (botón atrás, ciclo de vida, sin PWA), seguridad de red de la versión de publicación y requisitos de publicación en Google Play.

### Modified Capabilities
- `partidas-en-red`: se añaden el despliegue público con conexión segura, el servidor por defecto, la detección de conexiones muertas y la reconexión al volver del segundo plano. Se amplía «Límites de seguridad» con límites por IP.

## Impact

- **Servidor:**
  - `packages/server/src/servidor.ts` pasa a montarse sobre un servidor HTTP (endpoint de salud y WebSocket en el mismo puerto), con latido del lado del servidor y límites por IP;
  - `main.ts` lee `PORT`;
  - configuración de Railway (`railway.json`).
- **Cliente:** en `sesion/red.svelte.ts`:
  - el servidor por defecto viene de `VITE_SERVIDOR_RED`;
  - tiempo máximo de espera del pong;
  - reconexión con `visibilitychange`.

  Además, la detección de plataforma nativa desactiva el service worker y el botón de instalar, y el botón atrás se conecta con la navegación de `App.svelte`.
- **Nuevo paquete `packages/movil`:**
  - proyecto Capacitor y proyecto Android;
  - iconos y pantalla de inicio;
  - configuración de seguridad de red;
  - scripts de build.

  Nuevas dependencias: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` y `@capacitor/app`.
- **CI:**
  - el workflow de Pages compila con la URL del servidor público;
  - un workflow nuevo compila el AAB, que se firma con la clave de subida guardada fuera del repositorio.
- **Documentación:** la política de privacidad, publicada en GitHub Pages, y la guía de despliegue y publicación.
- **Coste:** el servidor siempre encendido en Railway, unos 5 USD al mes más el uso.
