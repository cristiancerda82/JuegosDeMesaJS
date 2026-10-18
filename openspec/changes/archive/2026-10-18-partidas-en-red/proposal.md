## Why

Todos los juegos de la suite se juegan contra la máquina en un solo dispositivo. Lo que falta del plan inicial es jugar con amigos, cada uno desde su móvil o su ordenador. El motor ya está pensado para eso: cada asiento recibe solo su vista (`vistaDe`) y la IA puede ocupar cualquier asiento.

## What Changes

- **Nuevo servidor de salas** (`packages/server`), en Node con WebSockets. Es la autoridad de la partida: guarda el estado, valida cada acción con el motor y envía a cada jugador solo su vista y sus acciones legales.
  - Se arranca en local (`pnpm servidor`), con lo necesario para desplegarlo después: puerto y orígenes permitidos por variables de entorno, y un Dockerfile. Las salas viven en memoria.
- **Salas con código:**
  - El anfitrión crea una sala eligiendo el juego, sus opciones y el nivel de la IA, y recibe un código de 5 letras.
  - Los demás entran con el código y un nombre, y eligen asiento.
  - El anfitrión empieza cuando quiere: los asientos libres los juega la IA.
  - Al terminar, el anfitrión puede pedir la revancha con los mismos asientos.
- **Reconexión:** cada jugador recibe un testigo secreto que el navegador guarda. Si se desconecta, la IA juega por él a los pocos segundos. Al volver con el mismo testigo recupera su asiento y la partida en el punto en que esté.
- **Todos los juegos con IA** se pueden jugar en red: Brisca, Tute, Guiñote, Escoba, Chinchón, Siete y media, Cinquillo, Pocha, Mus, Corazones, Burro y Pinacle. El Burro sigue en tiempo real: las acciones se aplican en el orden en que llegan al servidor. Los solitarios quedan fuera.
- **Cliente:**
  - El menú gana «Jugar en red», con crear sala y unirse.
  - Hay una sala de espera con los asientos y quién los ocupa.
  - En la partida se ven los nombres y si cada jugador está conectado o lo juega la IA.
  - La dirección del servidor se puede cambiar en la pantalla de red.
- **Mesas desde cualquier asiento:** hoy todas las mesas suponen que el jugador está en el asiento 0. Pasan a dibujarse desde el asiento propio: el jugador abajo, los demás alrededor en el orden del juego, y «nosotros» siempre su bando. En las partidas locales no cambia nada.
- Fuera de alcance:
  - cuentas, emparejamiento y salas públicas;
  - chat;
  - guardar las salas si el servidor se reinicia;
  - espectadores;
  - desplegar en un proveedor concreto;
  - contar las partidas en red en las estadísticas.

## Capabilities

### New Capabilities
- `partidas-en-red`: el servidor de salas y el protocolo:
  - crear y unirse con código, asientos, IA en los asientos libres;
  - acciones validadas por el servidor y vistas por asiento;
  - reconexión con testigo, revancha y limpieza de salas;
  - límites de seguridad.

### Modified Capabilities
- `mesa-cliente`: el menú incluye «Jugar en red» con sus pantallas (crear, unirse, sala de espera), la partida en red muestra los jugadores y su conexión, y las mesas se dibujan desde el asiento del jugador.

## Impact

- **Nuevo `packages/server`:**
  - Lógica de sala pura y testeable (sin sockets ni reloj real).
  - Una capa fina de WebSockets con la dependencia `ws`, la única nueva.
  - Tests de la sala y de integración con clientes WebSocket reales.
- **`packages/engine`:** un registro de juegos para red (id → juego e IAs por nivel) y los retrasos de reacción del Burro, que se mueven desde el cliente para que los usen el cliente y el servidor. Sin cambios en las reglas.
- **`packages/client`:**
  - Una `SesionRed` con la misma interfaz que la `Sesion` local, que recibe las vistas del servidor y las muestra con las mismas pausas.
  - Las mesas, el fin y los textos dejan de suponer el asiento 0.
  - Pantallas nuevas de red y tests E2E con el servidor arrancado y dos navegadores.
- **Raíz:** script `servidor` y arranque del servidor en la configuración de Playwright.
