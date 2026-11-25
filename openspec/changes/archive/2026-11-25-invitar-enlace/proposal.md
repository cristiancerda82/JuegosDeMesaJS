## Why

Para invitar a alguien a una sala, hoy el anfitrión le pasa el código de 5 letras, y el invitado tiene que abrir el juego, ir a «Jugar en red», escribir su nombre y el código. Compartir la sala con un enlace por WhatsApp (o cualquier otra app) que lleve directamente a la sala agiliza la invitación.

## What Changes

- La sala de espera tiene un botón **«Invitar»** que comparte un mensaje con el enlace de la sala, por ejemplo `https://cristiancerda82.github.io/JuegosDeMesaJS/?sala=XCCRB`:
  - en la app Android, con la hoja de compartir del sistema;
  - en el navegador, con `navigator.share` si existe;
  - si no, con un panel que ofrece «WhatsApp» y «Copiar enlace».
- El enlace lleva el servidor solo si el anfitrión usa uno distinto del de por defecto.
- **Al abrir el enlace**, el juego entra en la sala:
  - si el jugador ya tiene un nombre guardado, entra directamente en la sala de espera;
  - si no, ve la pantalla de red con el código ya escrito y solo tiene que poner su nombre;
  - si es la sala en la que ya estaba, vuelve a su asiento;
  - si está en otra sala o en una partida en red, se le pide confirmación antes de salir;
  - si estaba en una partida local, esta queda guardada.
- **App Android:** el enlace abre la app si está instalada, gracias a los App Links (intent filter verificado). Para ello hay que publicar `assetlinks.json` en la raíz de `cristiancerda82.github.io`; la guía de publicación explica cómo. Mientras no esté publicado, el enlace abre la web, que también entra en la sala.

## Capabilities

### New Capabilities

### Modified Capabilities
- `partidas-en-red`: requisitos nuevos para invitar con un enlace y para entrar en una sala al abrir el enlace, en la web y en la app.

## Impact

- Cliente:
  - nuevo `sesion/invitacion.ts`, que crea y lee los enlaces;
  - cambios en `SalaEspera.svelte` (botón «Invitar» y panel), `PantallaRed.svelte` (código inicial), `App.svelte` (abrir la invitación al arrancar y con `appUrlOpen`) y `textos.ts`.
- Dependencia nueva `@capacitor/share` en el cliente y en `packages/movil`.
- Android: intent filter con `autoVerify` en `AndroidManifest.xml` y la plantilla `assetlinks.ejemplo.json`.
- Documentación: `docs/publicar-android.md`, nueva sección «Enlaces que abren la app».
- E2E nuevos en `e2e/invitar.spec.ts`.
