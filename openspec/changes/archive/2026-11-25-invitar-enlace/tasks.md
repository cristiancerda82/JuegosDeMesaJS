## 1. Enlace

- [x] 1.1 `sesion/invitacion.ts`: `enlaceSala` y `leerInvitacion`, con sus tests (con y sin servidor, en la web y en la app, códigos válidos, en minúsculas o inválidos, y servidores no admitidos)

## 2. Compartir

- [x] 2.1 Dependencia `@capacitor/share` (8.x) en el cliente y en `packages/movil`
- [x] 2.2 `SalaEspera.svelte`: botón «Invitar» con Capacitor, `navigator.share` o un panel con «WhatsApp» y «Copiar enlace» (registrado como capa); textos en `textos.ts`

## 3. Entrar desde el enlace

- [x] 3.1 `App.svelte`: `abrirInvitacion` (confirmación, volver a la misma sala, unirse con nombre o pantalla de red con el código), servidor opcional en `unirseSala` y `entrarEnRed`, lectura en `onMount` y `replaceState`
- [x] 3.2 `PantallaRed.svelte`: prop `codigoInicial`, y el foco en el nombre si falta
- [x] 3.3 App nativa: `App.getLaunchUrl()` y `appUrlOpen` con `@capacitor/app`
- [x] 3.4 Guía de la red en `ComoSeJuega`: el botón «Invitar»

## 4. Android

- [x] 4.1 `AndroidManifest.xml`: `intent-filter` con `autoVerify` para `https://cristiancerda82.github.io/JuegosDeMesaJS`; `cap sync`
- [x] 4.2 `packages/movil/assetlinks.ejemplo.json` y la sección «Enlaces que abren la app» en `docs/publicar-android.md`
- [x] 4.3 En el emulador: el enlace abre la app en la sala (estando cerrada y estando abierta) y «Invitar» abre la hoja de compartir

## 5. Pruebas

- [x] 5.1 E2E `e2e/invitar.spec.ts`: compartir (con `navigator.share` simulado y con el panel), invitado con nombre, invitado sin nombre, sala inexistente y volver a la misma sala
- [x] 5.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
