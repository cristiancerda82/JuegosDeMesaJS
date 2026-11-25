## Context

- **Entrar en una sala.** Se hace desde `PantallaRed`, con el nombre y el código. `App.unirseSala(codigo)` abre un `ClienteRed(servidorGuardado())` y envía `unirse`, con el nombre que da `nombreGuardado()`. `volverSala()` reutiliza la sala guardada (`salaGuardada()`) para volver al asiento después de recargar.
- **Sala de espera.** Ya tiene «Copiar código», que usa `navigator.clipboard`.
- **App nativa.** `App.svelte` importa `@capacitor/app` de forma dinámica para el botón atrás. `MainActivity` es `singleTask`.
- **Dirección de la web y de la app.** La web publicada vive en `https://cristiancerda82.github.io/JuegosDeMesaJS/`, que es una página de proyecto de GitHub Pages. La app se sirve desde `https://localhost`.

## Goals / Non-Goals

**Goals:**
- Compartir la sala en un toque.
- Que el enlace lleve a la sala tanto en la web como en la app.

**Non-Goals:**
- Enlaces cortos, códigos QR o previsualización con imagen (Open Graph).
- Un esquema propio (`juegosdemesa://`): WhatsApp no lo convierte en enlace.
- Publicar `assetlinks.json`: depende de un repositorio del usuario, y la guía lo explica.

## Decisions

### 1. El enlace es la web con `?sala=`
Usar una única dirección https vale para todo:
- quien no tiene la app abre la web;
- quien la tiene abre la app gracias a App Links;
- WhatsApp lo muestra como enlace.

`sesion/invitacion.ts` es puro y contiene dos funciones:
- `enlaceSala(codigo, servidor, base)` construye el enlace.
- `leerInvitacion(url)` lo lee.

La base del enlace depende de dónde corre el juego:
- en la web, es `location.origin + location.pathname`, así en desarrollo y en los E2E apunta al propio servidor;
- en la app, es `VITE_URL_PUBLICA`, que por defecto vale la dirección de Pages.

El parámetro `servidor` solo se añade si el anfitrión no usa `servidorPorDefecto()`.

- **Alternativa descartada:** `/sala/XCCRB` como ruta. GitHub Pages no tiene reescrituras de rutas, así que haría falta una página 404 especial.

### 2. Compartir: Capacitor, `navigator.share` y, si no, un panel
- **En la app:** `@capacitor/share`, importado de forma dinámica. El WebView de Android no tiene `navigator.share`.
- **En el navegador:** `navigator.share({ title, text })`. El enlace va dentro de `text` para que WhatsApp reciba un único mensaje. Si el jugador cancela, llega un `AbortError`, que se ignora.
- **Si no hay nada de lo anterior:** un panel con un enlace `https://wa.me/?text=…` (con `target="_blank"`) y «Copiar enlace». El panel se registra como capa para el botón atrás.

### 3. `abrirInvitacion` en `App.svelte`
Es la misma función para la web (`onMount`) y para la app (`getLaunchUrl` en frío y `appUrlOpen` en caliente).

El orden de decisiones:
1. Si el jugador está en red, en la pantalla `espera` o en una partida en red, se pide `confirm(T.red.confirmarSalir)`. Si no confirma, no se hace nada.
2. Si la sala de la invitación es la sala guardada, se llama a `volverSala()`.
3. Si hay nombre guardado, se llama a `unirseSala(codigo, servidor)`.
4. Si no hay nombre, se pasa a la pantalla de red con `codigoInicial`.

Antes de cambiar de pantalla:
- una partida local se guarda con `guardarAhora()` y se cierra, igual que con `irAlMenu`;
- una sala o partida en red se cierra igual que al salir.

`unirseSala` y `entrarEnRed` aceptan un servidor opcional, que tiene prioridad sobre `servidorGuardado()` y no se guarda como preferencia.

Antes de empezar la partida, el servidor libera el asiento de quien se desconecta. Por eso, al abrir otra vez el enlace en la web, volver con el testigo da el error `testigo`. En ese caso, un `$effect` cierra ese cliente y vuelve a unir al jugador con su nombre, o lo lleva a la pantalla de red si no tiene nombre.

En la web, la invitación se quita de la dirección con `history.replaceState`. Al recargar, ya actúa `salaGuardada()`.

### 4. App Links
- En `MainActivity` hay un `intent-filter` con `autoVerify="true"`, para `https://cristiancerda82.github.io/JuegosDeMesaJS`.
- La verificación de Android busca `https://cristiancerda82.github.io/.well-known/assetlinks.json`, en la raíz del dominio. Una página de proyecto no puede publicar ese archivo, así que el usuario tiene que crear el repositorio `cristiancerda82.github.io`, con `.nojekyll` y ese archivo.
- La plantilla queda en `packages/movil/assetlinks.ejemplo.json`. Las huellas SHA-256 salen de Play Console (Integridad de la app) y de la clave de subida.
- Sin la verificación, Android abre el navegador, que también entra en la sala, así que no se rompe nada.

## Risks / Trade-offs

- **Que el usuario no publique `assetlinks.json` o lo publique con una huella equivocada.** → El enlace abre la web y todo funciona igual. La guía explica cómo comprobarlo con `adb shell pm get-app-links`.
- **WhatsApp en escritorio y `wa.me`.** Abre WhatsApp Web o la app de escritorio, según lo que tenga el jugador. Es el comportamiento estándar.
- **Un enlace con `servidor` de un tercero.** Solo se aceptan direcciones `ws://` o `wss://` que la plataforma admite, y el servidor no se guarda como preferencia. En el peor caso, el jugador se conecta a una sala de ese servidor, igual que si escribiera la dirección a mano.
