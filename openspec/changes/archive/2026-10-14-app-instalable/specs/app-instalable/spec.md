## ADDED Requirements

### Requirement: Manifiesto e iconos
La aplicación MUST publicar un manifiesto web con nombre («Juegos de mesa»), nombre corto, idioma español, modo `standalone`, colores de fondo y de tema, y `start_url` y `scope` relativos. MUST incluir iconos PNG de 192 y 512 px y un icono «maskable» de 512 px, además de un icono para iOS. Todas las rutas MUST ser relativas, para que la aplicación funcione igual en cualquier carpeta de publicación.

#### Scenario: Manifiesto válido
- **WHEN** se carga la aplicación publicada
- **THEN** la página enlaza un manifiesto con nombre, `display: standalone` e iconos de 192 y 512 px que existen y son PNG

### Requirement: Funcionamiento sin conexión
Después de la primera visita, un service worker MUST tener en caché todos los archivos del build, incluidos HTML, scripts, estilos, iconos y manifiesto. A partir de ahí, la aplicación MUST abrirse y poder jugarse sin conexión. La lista de archivos MUST generarse en el build y cambiar de versión cuando cambia su contenido.

#### Scenario: Abrir sin conexión
- **WHEN** el jugador visitó la aplicación una vez y después la abre sin conexión
- **THEN** se carga el menú y puede empezar y terminar una partida contra la IA

### Requirement: Actualización sin interrumpir
Cuando se publica una versión nueva, la aplicación MUST descargarla en segundo plano y mostrar un aviso «Hay una versión nueva» con un botón «Actualizar». La versión nueva MUST activarse solo cuando el jugador pulsa «Actualizar», y entonces la página se recarga. La partida en curso sigue guardada como siempre, así que se puede retomar.

#### Scenario: Aviso de versión nueva
- **WHEN** hay un service worker nuevo esperando a activarse
- **THEN** la aplicación muestra el aviso y, al pulsar «Actualizar», se activa la versión nueva y la página se recarga

### Requirement: Instalar desde el menú
Si el navegador ofrece instalar la aplicación (evento `beforeinstallprompt`), el menú MUST mostrar un botón «Instalar» que abre el diálogo del navegador. En iOS, donde no existe ese evento, el menú MUST mostrar una indicación breve para añadirla a la pantalla de inicio. Si la aplicación ya está instalada (se abre en modo `standalone`), el menú MUST NOT mostrar ninguna de las dos cosas.

#### Scenario: Botón de instalar
- **WHEN** el navegador lanza `beforeinstallprompt`
- **THEN** el menú muestra «Instalar» y, al pulsarlo, se abre el diálogo de instalación del navegador
