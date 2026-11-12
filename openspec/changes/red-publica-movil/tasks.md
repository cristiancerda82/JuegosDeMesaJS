## 1. Servidor preparado para Internet

- [x] 1.1 Montar el `WebSocketServer` sobre `http.createServer` con `GET /salud` (200 `ok`, sin datos) y 404 para el resto; `main.ts` lee `PORT` y si no `PUERTO`
- [x] 1.2 IP del cliente (`X-Forwarded-For` solo con `CONFIAR_PROXY=1`), límites de 20 conexiones y 5 salas de anfitrión por IP, y error `demasiadas-salas` en `protocolo.ts` y en los textos del cliente
- [x] 1.3 Latido del servidor: hora del último mensaje por conexión y revisión cada 15 s que cierra las conexiones calladas más de 60 s, pasando por la desconexión normal
- [x] 1.4 Tests del servidor: salud y 404, origen rechazado, límites por IP con y sin proxy de confianza, cierre por silencio que marca el asiento desconectado y deja jugar a la IA a los 10 s

## 2. Cliente: conexión robusta y servidor por defecto

- [x] 2.1 `ClienteRed`: `ping` cada 10 s con un tiempo máximo de 10 s para el `pong`, cerrando a mano el socket si vence, para que actúe la reconexión existente
- [x] 2.2 `visibilitychange`: al volver a visible, reconexión inmediata si el socket no está abierto, o ping de comprobación si parece abierto
- [x] 2.3 `servidorPorDefecto` desde `VITE_SERVIDOR_RED`; en la plataforma nativa, descartar una dirección `ws://` guardada y rechazar `ws://` en la pantalla de red con su explicación
- [x] 2.4 Tests unitarios de `ClienteRed` con un WebSocket simulado: pong perdido, socket zombi al volver a visible, reconexión con testigo

## 3. Despliegue en Railway

- [x] 3.1 `railway.json` (Dockerfile, `healthcheckPath`, una réplica, reinicio en fallo) y documentar las variables `ORIGENES` y `CONFIAR_PROXY`
- [ ] 3.2 Desplegar, comprobar `/salud` y crear y jugar una sala real por `wss://` desde dos navegadores
- [ ] 3.3 Añadir `VITE_SERVIDOR_RED` como variable del repositorio en `pages.yml`, publicar y comprobar que la red funciona desde GitHub Pages

## 4. App Android con Capacitor

- [ ] 4.1 Fijar el `appId` con el usuario; crear `packages/movil` con `capacitor.config.ts` (`webDir` del cliente, `androidScheme: 'https'`), el proyecto `android/` y los scripts `movil:build`, `movil:abrir` y `movil:aab`
- [ ] 4.2 `targetSdkVersion 36`, `network_security_config.xml` sin cleartext en `main` y con excepción solo en `debug`, sin `allowMixedContent` en publicación
- [ ] 4.3 `plataforma.ts` (`esNativa`): sin service worker, «Instalar» ni aviso de versión nueva en la app
- [ ] 4.4 Registro de capas abiertas (`interfaz/capas.svelte.ts`), con los diálogos, paneles y guías existentes apuntándose en él
- [ ] 4.5 Botón atrás con `@capacitor/app`: cerrar capa, volver al menú (guardando la partida local), confirmar salida en red o espera, y cerrar la app desde el menú principal
- [ ] 4.6 Icono adaptable y pantalla de inicio con `@capacitor/assets`, y márgenes de zonas seguras (`env(safe-area-inset-*)`) revisados en la mesa y en el menú, en vertical y en horizontal

## 5. Publicación en Google Play

- [ ] 5.1 `privacidad.html` publicada en Pages y enlazada desde el menú
- [ ] 5.2 Workflow `android.yml`: JDK, Android SDK, build del cliente, `cap sync` y AAB firmado con la clave de subida desde *secrets*, como artefacto
- [ ] 5.3 `docs/publicar-android.md`: Railway, clave de subida, pistas de prueba, respuestas de seguridad de datos e IARC (juego de azar simulado sin dinero real), y la lista de comprobación del spec
- [ ] 5.4 Crear la app en Play Console con la cuenta existente, comprobar si aplica la prueba cerrada de 12 testers y 14 días, y subir el primer AAB a la pista interna
- [ ] 5.5 Prueba manual en un dispositivo físico: sin conexión contra la IA, botón atrás en cada pantalla, segundo plano y vuelta en local y en red, y sala en red entre la app y la web

## 6. Verificación

- [x] 6.1 E2E en el navegador: volver del segundo plano (visibilidad simulada) recupera el asiento, y la red cortada se detecta en menos de 30 s (ampliando `red.spec.ts`)
- [ ] 6.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
