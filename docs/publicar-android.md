# Publicar la app Android en Google Play

La app Android (`packages/movil`) es el mismo cliente web empaquetado con Capacitor. Esta guía
sigue el orden de una primera publicación. El servidor de salas tiene su propia guía:
[desplegar-servidor.md](desplegar-servidor.md).

## Datos fijos

| Dato                   | Valor                                                              | Nota                                                                                    |
| ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Identificador (appId)  | `com.crissdeveloper.juegosdemesa`                                  | No se puede cambiar después de la primera subida.                                       |
| Nombre                 | Juegos de mesa                                                     |                                                                                         |
| Esquema del WebView    | `https://localhost`                                                | No cambiarlo: se perderían las partidas guardadas, las estadísticas y las preferencias. |
| Servidor de salas      | `wss://juegosdemesajs-production.up.railway.app`                   | Variable del repositorio `SERVIDOR_RED`. El servidor debe aceptar `https://localhost`.  |
| Nivel de API           | `targetSdkVersion 36` (Android 16)                                 | El que exige Google Play desde el 31-08-2026. Revisarlo cada año.                       |
| Política de privacidad | `https://cristiancerda82.github.io/JuegosDeMesaJS/privacidad.html` | Se publica con la web (`packages/client/public/privacidad.html`).                       |

## En local

Hace falta Android Studio (trae el JDK 21 y el SDK de Android).

```sh
pnpm movil:build   # compila el cliente con el servidor público y lo copia al proyecto Android
pnpm movil:apk     # APK de depuración: packages/movil/android/app/build/outputs/apk/debug/
pnpm movil:aab     # AAB de publicación: packages/movil/android/app/build/outputs/bundle/release/
pnpm movil:abrir   # abre el proyecto en Android Studio
```

- Hay que lanzar `pnpm movil:build` después de cada cambio en el cliente.
- Para instalar el APK en un móvil con la depuración USB activada:
  `adb install -r packages/movil/android/app/build/outputs/apk/debug/app-debug.apk`.
- Sin las variables de la clave de subida, `movil:aab` genera un AAB sin firmar, que Play no
  acepta. Para firmarlo en local, define las mismas variables que usa el workflow
  (`ANDROID_KEYSTORE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y
  `ANDROID_KEY_PASSWORD`).
- El icono y la pantalla de inicio salen de `packages/client/public/icono.svg`. Si cambia, regenera
  las imágenes con `node packages/movil/scripts/iconos.mjs` y, desde `packages/movil`,
  `npx @capacitor/assets generate --android --assetPath assets --iconBackgroundColor '#0f5132' --splashBackgroundColor '#0f5132'`.

## 1. La clave de subida (una sola vez)

Con Play App Signing, Google guarda la clave con la que se firma la app para los usuarios, y tú
firmas cada subida con una **clave de subida** propia. Si la pierdes, se puede pedir a Google
que la cambie, pero lleva días. Guárdala fuera del repositorio, con copia de seguridad.

```sh
keytool -genkeypair -v -keystore subida-juegosdemesa.jks -alias subida \
  -keyalg RSA -keysize 2048 -validity 10000
```

`keytool` está en `C:\Program Files\Android\Android Studio\jbr\bin`. Te pedirá dos contraseñas
(la del almacén y la de la clave) y unos datos de nombre que no se publican.

En GitHub, _Settings → Secrets and variables → Actions → Secrets_, crea:

| Secret                      | Valor                                    |
| --------------------------- | ---------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`   | El archivo `.jks` en base64 (ver abajo). |
| `ANDROID_KEYSTORE_PASSWORD` | La contraseña del almacén.               |
| `ANDROID_KEY_ALIAS`         | `subida` (o el alias que usaste).        |
| `ANDROID_KEY_PASSWORD`      | La contraseña de la clave.               |

Para obtener el base64 en PowerShell:
`[Convert]::ToBase64String([IO.File]::ReadAllBytes("subida-juegosdemesa.jks")) | Set-Clipboard`.

## 2. Generar el AAB en GitHub

En _Actions → App Android → Run workflow_ (o al subir una etiqueta `v1.0.0`, `v1.1.0`…):

1. Compila el cliente con `SERVIDOR_RED` y ejecuta `cap sync`.
2. Firma el AAB con la clave de subida.
3. Lo deja como artefacto `juegos-de-mesa-<n>`, que se descarga desde la ejecución.

El `versionCode` es el número de ejecución del workflow, así que siempre sube. El `versionName`
es el nombre de la etiqueta, o `1.0.<n>` si se lanza a mano.

## 3. Crear la app en Play Console

1. _Crear app_: nombre «Juegos de mesa», idioma español, **juego**, **gratis**.
2. _Firma de apps_: acepta Play App Signing (la clave de subida es la del paso 1).
3. Ficha de la tienda:
   - descripción corta y larga, icono de 512 px (`packages/client/public/icono-512.png`) y gráfico
     de funciones de 1024 × 500;
   - capturas del móvil en vertical (al menos dos) y, si quieres, de tableta;
   - categoría **Cartas**.
4. _Política de privacidad_: la dirección de la tabla de arriba.

### Seguridad de los datos

Respuestas que coinciden con la política de privacidad:

- **¿Recoge o comparte datos?** Recoge: sí, solo para jugar en red. Comparte con terceros: no.
- **Datos recogidos**: _Actividad en apps → Otras acciones_ (las jugadas de la partida en red) y
  _Información personal → Nombre_ (el nombre que el jugador escribe para la sala, que no tiene
  por qué ser el real). En los dos: se tratan de forma **efímera** (solo en memoria mientras dura
  la sala), son **opcionales** (solo si se juega en red) y su fin es la **funcionalidad de la app**.
- **Cifrado en tránsito**: sí (`wss://`).
- **Borrado de datos**: no hay cuentas ni datos guardados en el servidor. Las salas desaparecen al
  cerrarse.
- **Anuncios**: no. **ID de publicidad**: no se usa.

### Clasificación por edades (cuestionario IARC)

- Categoría: **Juego**.
- Juegos de azar: hay **juego de azar simulado** (Texas Hold'em, póker de cinco cartas, Blackjack,
  Siete y media, Bourré…), **sin dinero real** y sin comprar ni ganar nada de valor.
- Sin violencia, sexo, lenguaje malsonante ni drogas.
- Interacción entre usuarios: los jugadores de una sala privada ven el nombre de los demás. No hay
  chat ni se comparte la ubicación.

La clasificación saldrá más alta de lo normal por el azar simulado (por ejemplo, PEGI 12 o más en
algunos países). Es lo esperado.

### Público objetivo

Mayores de 18 años (o al menos de 13). **No** marcar el programa Familias: hay juego de azar
simulado.

## 4. Pruebas

1. _Pruebas → Prueba interna_: crea una versión, sube el AAB y añade tu cuenta como tester.
   Instálala desde el enlace de la prueba y haz la prueba manual de abajo.
2. Si Play Console lo pide para las cuentas personales nuevas (fue el caso con Twistlab):
   _Prueba cerrada_ con al menos **12 testers durante 14 días seguidos**. Se pueden reutilizar los
   testers de Twistlab (su lista de correos o su Grupo de Google). Las versiones nuevas se suben a
   la misma prueba sin reiniciar el plazo.
3. Después, _Producción → Solicitar acceso_ y crear la versión de producción.

### Prueba manual en un dispositivo físico

- [ ] Primera apertura en **modo avión**: aparece el menú y se juega una partida entera contra la IA.
- [ ] No aparece «Instalar» ni el aviso de versión nueva.
- [ ] Botón atrás:
  - [ ] cierra la guía y los paneles de favoritos y recientes;
  - [ ] en el menú, vuelve de una familia y borra la búsqueda;
  - [ ] en las opciones, las estadísticas y el muestrario, vuelve al menú;
  - [ ] en una partida local, vuelve al menú y ofrece retomarla;
  - [ ] en red o en la sala de espera, pregunta antes de salir, y si cancelas sigues jugando;
  - [ ] en el menú principal, cierra la app.
- [ ] Segundo plano: deja una partida local a medias, abre otras apps, vuelve y sigue en el mismo
      punto (o el menú ofrece retomarla si el sistema cerró la app).
- [ ] Red: crea una sala en la app y únete desde la web publicada (y al revés). Pasa la app a
      segundo plano unos segundos durante la partida y comprueba que vuelve a su asiento.
- [ ] En horizontal y en vertical, nada queda tapado por la muesca ni por las barras del sistema.
- [ ] El icono, el nombre y la pantalla de inicio se ven bien.

## 5. Enlaces que abren la app (App Links)

Los enlaces de invitación a una sala (`https://cristiancerda82.github.io/JuegosDeMesaJS/?sala=XXXXX`)
abren la app, si está instalada, solo cuando Android puede verificar que el dominio es tuyo. Para
eso busca `https://cristiancerda82.github.io/.well-known/assetlinks.json`, que está en la **raíz**
del dominio. Una página de proyecto como `JuegosDeMesaJS` no puede publicar ese archivo. Hasta
que lo publiques, el enlace abre la web, que también entra en la sala.

1. En Play Console, _Prueba y publica → Integridad de la app → Firma de apps_, copia la huella
   **SHA-256** de la clave de firma de apps. Copia también la de la clave de subida, para que
   funcione con las versiones de la prueba interna. Su huella se obtiene con
   `keytool -list -v -keystore subida-juegosdemesa.jks -alias subida`.
2. En GitHub, crea un repositorio público llamado exactamente `cristiancerda82.github.io`, con
   Pages activado desde la rama `main`.
3. Añade al repositorio:
   - un archivo vacío `.nojekyll`. Sin él, Jekyll no publica las carpetas que empiezan por punto;
   - `.well-known/assetlinks.json`, copiado de `packages/movil/assetlinks.ejemplo.json` con tus
     dos huellas.
4. Comprueba que `https://cristiancerda82.github.io/.well-known/assetlinks.json` responde con el
   JSON. Después, con la app instalada desde Play (o la de la prueba interna), ejecuta:

   ```sh
   adb shell pm verify-app-links --re-verify com.crissdeveloper.juegosdemesa
   adb shell pm get-app-links com.crissdeveloper.juegosdemesa   # debe decir «verified»
   ```

Publicar el repositorio `cristiancerda82.github.io` no cambia la dirección de `JuegosDeMesaJS`.

## Lista de comprobación antes de cada versión de producción

- [ ] `targetSdkVersion` es el que exige Google Play en la fecha de publicación.
- [ ] AAB firmado con la clave de subida y generado por el workflow.
- [ ] Política de privacidad publicada y enlazada en la ficha. Si cambia lo que se envía al
      servidor (o se añaden anuncios o compras), actualizar la política y la seguridad de los datos.
- [ ] Formulario de seguridad de los datos y cuestionario de clasificación completos y al día.
- [ ] Todos los tests y los E2E en verde (`pnpm -r test` y `pnpm --filter @juegos/client test:e2e`).
- [ ] Prueba manual en al menos un dispositivo físico, en una pista de pruebas.
- [ ] El servidor de Railway responde en `/salud` y admite el origen `https://localhost`.
