## 1. Motor

- [x] 1.1 Mover los retrasos de la IA del Burro del cliente a `engine/src/ia/reaccion.ts` (`retrasoIA`) y usarlos desde la sesión simultánea local, sin cambiar su comportamiento
- [x] 1.2 Crear `engine/src/red.ts` con `JUEGOS_EN_RED` (los 12 juegos con IA: juego, IAs por nivel, configuración por defecto y si es simultáneo), con su test

## 2. Servidor

- [x] 2.1 Crear `packages/server` (package.json, tsconfig, vitest, dependencia `ws`) y el script `servidor` en la raíz
- [x] 2.2 Escribir `protocolo.ts`: tipos de los mensajes y su validación, con tests de mensajes válidos e inválidos
- [x] 2.3 Escribir `sala.ts`: crear, unirse, cambiar de asiento, anfitrión, empezar con la IA en los asientos libres, aplicar jugadas con su `n`, vistas por asiento, temporizadores de la IA (también simultáneos), pausas con su límite, desconexión con relevo de la IA a los 10 s, reconexión con testigo, fin y revancha
- [x] 2.4 Tests de la sala para todos los escenarios de `specs/partidas-en-red`, y la propiedad de que ningún mensaje muestra cartas ocultas a su asiento en partidas de IAs de todos los juegos
- [x] 2.5 Escribir `servidor.ts`: WebSockets, registro y limpieza de salas, temporizadores reales, códigos y testigos con azar criptográfico, límites de tamaño, ritmo, orígenes y número de salas, y variables de entorno
- [x] 2.6 Test de integración: servidor en un puerto libre y una Brisca completa con dos clientes WebSocket; Dockerfile del servidor

## 3. Cliente: mesas desde cualquier asiento

- [x] 3.1 Extraer la interfaz `SesionMesa` (con `asiento`) que implementa la `Sesion` local con el asiento 0, y tipar las mesas con ella
- [x] 3.2 Hacer relativos `lado`, `nombreAsiento` y los bandos, y quitar `HUMANO` de todas las mesas, los resúmenes y la pantalla de fin; los E2E locales siguen pasando sin cambios

## 4. Cliente: red

- [x] 4.1 Escribir `SesionRed`: conexión, cola de vistas con las pausas de `pausaTras`, `jugar` con `n`, pausas, `pensando`, nombres y conexión de los jugadores, y reconexión con espera creciente
- [x] 4.2 Pantalla «Jugar en red»: crear (reutilizando las opciones del juego) o unirse, nombre recordado, dirección del servidor y aviso sin conexión
- [x] 4.3 Sala de espera: código copiable, asientos con nombres o IA, cambiar de asiento y «Empezar» del anfitrión
- [x] 4.4 Partida en red: franja de jugadores con su estado y el código, «Volver a la sala» al recargar, y fin con revancha del anfitrión
- [x] 4.5 Textos en español y una sección de la ayuda sobre cómo jugar en red

## 5. Verificación

- [x] 5.1 Playwright arranca también el servidor; E2E de una Brisca de 2 humanos en dos navegadores, con una recarga a mitad de partida
- [x] 5.2 E2E de un Mus de 2 humanos y 2 IAs jugando desde los asientos 0 y 2, y del aviso sin servidor
- [x] 5.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
