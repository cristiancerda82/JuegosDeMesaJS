## Context

- **Servidor** (`packages/server`):
  - `crearServidor` crea un `WebSocketServer({ port })` suelto, así que una petición HTTP normal no tiene respuesta útil;
  - filtra por `origin` en `verifyClient`;
  - limita el ritmo por conexión y el total de salas;
  - responde `pong` al `ping` del cliente;
  - `main.ts` lee `PUERTO` y `ORIGENES`;
  - ya hay un `Dockerfile` (Node 24 alpine, usuario `node`).
- **Cliente** (`sesion/red.svelte.ts`):
  - envía un `ping` cada 20 s, pero no mide si llega el `pong`;
  - reconecta con esperas crecientes (1–10 s) solo cuando el socket se cierra;
  - el servidor por defecto es `VITE_SERVIDOR_RED` o `ws://<host>:8787`. Dentro de Capacitor el host es `localhost`, así que ese valor no sirve.
- **Web publicada:** se sirve en GitHub Pages (`.github/workflows/pages.yml`) por https. Ahí el navegador bloquea `ws://`, así que la red hoy solo funciona en desarrollo o sirviendo el cliente por http en la LAN.
- **PWA:** `pwa/registro.svelte.ts` registra el service worker y gestiona «Instalar» y «Hay una versión nueva». `App.svelte` guarda la partida en `pagehide` y `visibilitychange`, eventos que también llegan en el WebView de Android.
- **Resultados de la investigación** (fuentes en la conversación de exploración, noviembre de 2026):
  - **Google Play Games Services:** retiró el multijugador en tiempo real y por turnos en 2020. Quedan logros, clasificaciones y guardado en la nube.
  - **Capacitor 6 o superior:** la app carga desde `https://localhost`. `ws://` falla por contenido mixto y Android bloquea el tráfico sin cifrar desde la API 28.
  - **Google Play:** exige apuntar a la API 36 a las apps nuevas y actualizaciones desde el 31-08-2026. Las cuentas personales nuevas deben hacer una prueba cerrada de 12 testers durante 14 días.
  - **Railway:** termina el TLS en su borde, inyecta `PORT` y no corta los WebSocket por inactividad.
  - **Consolas:** Xbox exige ID@Xbox con concepto aprobado (la vía PWA de la Microsoft Store es solo para PC). Switch y PlayStation no admiten HTML5: hay que embeber un motor web o portar a nativo con su SDK.

## Goals / Non-Goals

**Goals:**
- Que jugar en red funcione desde la web publicada y desde la app Android sin configurar nada.
- Que el servidor sea seguro de exponer en Internet con un coste mínimo.
- Que la app Android sea el mismo cliente, con lo mínimo de código específico.

**Non-Goals:**
- Cuentas, emparejamiento automático, salas públicas o chat.
- Google Play Games Services (logros, clasificaciones): se valorará en otro change.
- iOS (App Store), la Microsoft Store de PC y las videoconsolas.
- Escalar a varias instancias del servidor: las salas viven en memoria en una sola instancia.
- Notificaciones push o mantener el socket vivo en segundo plano.

## Decisions

### 1. Railway como hosting, con el Dockerfile actual
Un servicio de Railway construido con `packages/server/Dockerfile`, configurado en `railway.json` en la raíz:
- `build.dockerfilePath`;
- `deploy.healthcheckPath: "/salud"`;
- `restartPolicyType: ON_FAILURE`;
- una sola réplica.

Railway da el dominio `*.up.railway.app` con TLS automático, y más adelante se puede añadir un dominio propio. La región se elige cerca de los jugadores.

Variables:
- `ORIGENES=https://<usuario>.github.io,https://localhost`. El segundo es el origen de Capacitor en Android.
- `PORT` la pone Railway.

- *Alternativas consideradas:*
  - **Fly.io:** precio parecido y regiones más finas. Se elige Railway por preferencia del usuario.
  - **Plan gratuito de Render:** apaga el servicio y corta los WebSocket, así que no sirve.
  - **VPS con Caddy:** más mantenimiento.
  - **Cloudflare Durable Objects:** obligaría a reescribir el servidor para otro runtime.

### 2. Servidor HTTP y WebSocket en el mismo puerto
`crearServidor` crea un `http.createServer` que atiende `GET /salud`, respondiendo `200` con `ok`, y `404` para todo lo demás. El `WebSocketServer` se monta con `{ server }`. Los tests existentes siguen usando `puerto: 0`.

- *Alternativa:* un segundo puerto para la salud. Se descarta porque Railway enruta un solo puerto público.

### 3. IP real y límites por IP
Railway pone delante un proxy. La IP del cliente sale de `X-Forwarded-For` (el primer valor) **solo si** `CONFIAR_PROXY=1`. En local se usa `req.socket.remoteAddress`, para que nadie pueda falsearla cuando no hay proxy. `Map<ip, { conexiones, salasAnfitrion }>` aplica los límites de 20 conexiones y 5 salas. Superar el de conexiones cierra el socket nuevo con 1008. Superar el de salas responde con un error nuevo, `demasiadas-salas`, que se añade a `protocolo.ts` y a sus textos.

### 4. Latido en los dos sentidos
- **Cliente:** el `ping` pasa de cada 20 s a cada **10 s**. Tras cada `ping` arranca un temporizador de 10 s que el `pong` cancela. Si vence, el cliente cierra el socket a mano (`socket.close()`) y deja que actúe la lógica de reconexión actual. Así se cumple el «menos de 30 s» del spec en el peor caso.
- **Servidor:** guarda la hora del último mensaje de cada conexión. Una revisión cada 15 s cierra (`terminate()`) las que llevan más de 60 s calladas. El cierre pasa por el `close` ya existente, que llama a `sala.desconectar`.

- *Alternativa:* el ping de protocolo de WebSocket (`ws.ping()`). Se descarta del lado del cliente porque el navegador no lo expone. Del lado del servidor no aporta frente a medir el silencio, que ya cubre el latido de aplicación.

### 5. Reconexión al volver del segundo plano
`ClienteRed` escucha `visibilitychange`. Al pasar a `visible`, y si no está `cerrado`:
- si el socket no está `OPEN`, cancela la espera pendiente y reconecta **ya**, poniendo los intentos a cero;
- si parece abierto, envía un `ping` inmediato con el mismo temporizador de 10 s. Esto cubre el socket «zombi» que Android deja aparentemente abierto.

Al reconectar se envía `volver` con el testigo, como ya ocurre, y el servidor responde con la vista actual.

- *Alternativa:* un plugin de servicio en primer plano para mantener el socket vivo. Se descarta porque exige una notificación permanente y permisos, y la ventana de 10 s más la IA de reemplazo ya cubren las ausencias.

### 6. Servidor por defecto según la plataforma
`servidorPorDefecto()` usa `VITE_SERVIDOR_RED` si existe. El workflow de Pages y el build de Android lo fijan a `wss://<servicio>.up.railway.app`. Sin la variable (desarrollo), sigue `ws://<host>:8787`.

La dirección guardada en `localStorage` tiene prioridad, como hoy. En la app, si la guardada empieza por `ws://`, se descarta y se usa la de por defecto. En la pantalla de red de la app, una dirección `ws://` se rechaza con el texto del spec.

### 7. Paquete `packages/movil` con Capacitor
- `capacitor.config.ts` con:
  - `appId`, que es el identificador de la ficha en Play y no se puede cambiar después;
  - `appName: 'Juegos de mesa'`;
  - `webDir: '../client/dist'`;
  - `server.androidScheme: 'https'`, el valor por defecto y el que se usa siempre. Cambiarlo más tarde haría perder el `localStorage`: partidas guardadas, estadísticas y preferencias.
- El proyecto `android/` se versiona.
- Scripts:
  - `pnpm movil:build` (build del cliente con la URL pública y `cap sync`);
  - `pnpm movil:abrir` (Android Studio);
  - `pnpm movil:aab` (`./gradlew bundleRelease`).
- `targetSdkVersion 36` y `minSdkVersion` el que marque la versión de Capacitor en uso.
- Seguridad de red:
  - `network_security_config.xml` con `cleartextTrafficPermitted="false"` en `main`;
  - una variante en `debug` que permite cleartext para probar con un servidor LAN;
  - `allowMixedContent` solo en depuración.
- Iconos adaptables y pantalla de inicio generados con `@capacitor/assets` a partir de los iconos de la PWA.

- *Alternativa:* una TWA (Trusted Web Activity), que empaqueta la web publicada. Se descarta porque depende de que la web esté accesible para el primer arranque sin conexión, de Chrome instalado y del dominio verificado. Capacitor incluye los archivos en el APK y abre la puerta a plugins nativos.

### 8. Detección de plataforma nativa
`plataforma.ts` exporta `esNativa = Capacitor.isNativePlatform()`. `@capacitor/core` es ligero y en la web devuelve `false`.

Con `esNativa`:
- `pwa/registro.svelte.ts` no registra el service worker y marca `instalada = true`, así que el menú oculta «Instalar» sin tocar `Menu.svelte`;
- `red.svelte.ts` aplica la decisión 6;
- `main.ts` registra el botón atrás.

### 9. Botón atrás
Con `@capacitor/app`, `App.addListener('backButton', …)` llama a una función `atras()` que expone `App.svelte`, en este orden:
1. Si hay un panel, diálogo o guía abierto, se cierra. Para eso hay un pequeño registro de «capas abiertas» (`interfaz/capas.svelte.ts`) donde los diálogos existentes se apuntan y se dan de baja.
2. Según `pantalla.tipo`:
   - `partida` local: `irAlMenu()`;
   - `partida` en red o `espera`: diálogo de confirmación;
   - `opciones`, `muestrario` o `estadisticas`: volver al menú;
   - `menu`: `App.exitApp()`.

Si el change `menu-familias-favoritos` ya está aplicado, en el menú, con una familia abierta o una búsqueda escrita, atrás vuelve primero a las familias.

### 10. Política de privacidad y guía
- `packages/client/public/privacidad.html`: página estática en español, publicada con la web en Pages y enlazada desde el menú y la ficha.
- `docs/publicar-android.md`:
  - despliegue en Railway;
  - generar y guardar la clave de subida (fuera del repo; en CI, como *secret* en base64);
  - pistas de prueba;
  - respuestas del formulario de seguridad de datos y del cuestionario IARC: juego de azar simulado sin dinero real (Hold'em, Blackjack, Siete y media, Bourré). No es un juego para niños, así que no se adhiere al programa Familias.
  - la lista de comprobación del spec.

### 11. CI
- `pages.yml`: añade `VITE_SERVIDOR_RED` desde una variable del repositorio.
- `android.yml`, que se lanza a mano o con una etiqueta `v*`:
  - instala JDK 21 y Android SDK;
  - compila el cliente y ejecuta `cap sync`;
  - genera el AAB firmado con los *secrets* de la clave de subida y lo deja como artefacto.

  La subida a Play se hace a mano desde Play Console. Automatizarla con la API de publicación se deja para más adelante.

### 12. Por qué no Play Games ni las consolas
- **Play Games Services:** no ofrece multijugador desde 2020. Usarlo solo para la identidad obligaría a añadir cuentas, que están fuera de alcance. El servidor de salas propio, autoritativo y con `vistaDe`, es independiente de la tienda y sirve igual para web, Android y un futuro iOS.
- **Consolas:** la única vía realista es otro proyecto aparte:
  - portar el cliente a un motor con exportación a consola, o embeber un motor web licenciado;
  - darse de alta como desarrollador en cada fabricante (ID@Xbox, Nintendo Developer Portal, PlayStation Partners);
  - certificar el juego en cada uno.

  Queda documentado como no viable con la arquitectura actual. La alternativa cercana es la Microsoft Store de PC con la misma PWA, que se propone como change futuro.

## Risks / Trade-offs

- [Las salas viven en memoria y un redespliegue o reinicio de Railway las borra] → Los despliegues del servidor se hacen fuera de las horas de juego habituales, y el cliente muestra el error de sala inexistente al reconectar. Persistir salas queda fuera de alcance.
- [Coste mensual y abuso] → Una sola instancia pequeña, límites por IP, máximo de 500 salas y alerta de uso en Railway.
- [Un `X-Forwarded-For` falso si el servidor queda expuesto sin proxy] → Solo se confía en él con `CONFIAR_PROXY=1`, que se pone únicamente en Railway.
- [Los nombres de jugador son contenido de usuario visible para otros] → Solo los ven los jugadores de una sala privada, no hay chat y se limitan a 20 caracteres. Se declara así en la política y en la ficha. Si Play lo exige, más adelante se añade un filtro de palabras.
- [Cambiar `androidScheme` o `appId` después de publicar rompe datos o la ficha] → Ambos se fijan en este change y se documentan como inamovibles.
- [La regla de 12 testers y 14 días puede aplicarse a esta app aunque la cuenta ya tenga otra en producción] → Se comprueba en Play Console al crear la app. Si aplica, se planifica la prueba cerrada antes de la fecha deseada.
- [Doze y los fabricantes con ahorro de batería agresivo] → La reconexión al volver (decisión 5) y la detección por latido no dependen de que el socket sobreviva en segundo plano.

## Migration Plan

1. Desplegar el servidor actualizado en Railway y comprobar `/salud` y una sala real con `wss://`.
2. Configurar `VITE_SERVIDOR_RED` en el repositorio y publicar la web. Desde ese momento, la red funciona en Pages.
3. Generar la app, probarla en la pista interna y, cuando la lista de comprobación esté completa, pasarla a producción.

**Vuelta atrás:**
- **Web:** quitar la variable devuelve el comportamiento actual.
- **Servidor:** es compatible con los clientes viejos (mismo protocolo, más un código de error nuevo).
- **App:** se detiene el lanzamiento desde Play Console.

## Open Questions

- El `appId` definitivo, por ejemplo `com.<tu-dominio>.juegosdemesa`: sigue la convención de la cuenta del usuario en Play. Hay que fijarlo antes de la primera subida.
- La región de Railway y si se usa un dominio propio para el servidor (`wss://salas.<dominio>`) en lugar de `*.up.railway.app`.
