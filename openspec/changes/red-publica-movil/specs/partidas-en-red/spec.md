## ADDED Requirements

### Requirement: Servidor público con conexión segura
El servidor de salas MUST poder desplegarse en un servicio público detrás de TLS, de modo que los clientes se conecten con `wss://`. Para ello MUST:
- leer el puerto de la variable `PORT` si existe, y si no de `PUERTO` (por defecto 8787);
- atender en el mismo puerto las conexiones WebSocket y una ruta de salud `/salud` que responde `200` con un cuerpo mínimo, sin datos de las salas ni de los jugadores;
- responder a cualquier otra ruta HTTP con `404`;
- permitir, en el despliegue público, solo los orígenes de la web publicada y de la app Android.

#### Scenario: Comprobación de salud
- **WHEN** el servicio de despliegue pide `GET /salud`
- **THEN** el servidor responde `200` sin revelar cuántas salas o jugadores hay

#### Scenario: Origen no permitido
- **WHEN** una página de otro dominio intenta abrir una conexión WebSocket con el servidor público
- **THEN** el servidor rechaza la conexión

### Requirement: Servidor por defecto
Las versiones publicadas del cliente (la web de GitHub Pages y la app Android) MUST conectarse por defecto al servidor público, sin que el jugador escriba ninguna dirección. En el navegador, el jugador MUST poder seguir escribiendo otra dirección para jugar con un servidor de su red local. En la app Android, solo MUST aceptarse direcciones `wss://`, y una dirección `ws://` MUST rechazarse con una explicación clara.

#### Scenario: Jugar en red desde la web publicada
- **WHEN** un jugador abre la web publicada por primera vez y crea una sala
- **THEN** la sala se crea en el servidor público sin pedirle la dirección

#### Scenario: Dirección insegura en la app
- **WHEN** en la app Android el jugador escribe `ws://192.168.1.20:8787` como servidor
- **THEN** la app no la acepta y explica que en la app solo se pueden usar servidores seguros (`wss://`)

### Requirement: Detección de conexiones muertas
El cliente MUST considerar perdida la conexión si no recibe respuesta a su latido en 10 segundos, aunque el sistema no la haya cerrado, y entonces MUST reconectar con su testigo como en cualquier corte. El servidor MUST cerrar una conexión de la que no recibe ningún mensaje durante 60 segundos, y ese cierre MUST tratarse como una desconexión normal: el asiento se marca como desconectado y, si no vuelve en 10 segundos, la IA juega por él.

#### Scenario: Red que se cae sin aviso
- **WHEN** la red del móvil deja de transmitir sin cerrar el socket
- **THEN** en menos de 30 segundos el cliente muestra que está reconectando e intenta volver a su asiento

#### Scenario: Cliente que deja de responder
- **WHEN** un jugador con la partida empezada deja de enviar mensajes durante 60 segundos
- **THEN** el servidor cierra su conexión, los demás lo ven desconectado y la IA cubre su asiento

### Requirement: Volver del segundo plano
Cuando el cliente vuelve a primer plano (la página o la app se hace visible) y estaba en una sala, MUST comprobar su conexión de inmediato, sin esperar al siguiente latido. Si se ha perdido, MUST reconectar al momento y recuperar su asiento y la vista actual de la partida.

#### Scenario: Contestar un mensaje y volver
- **WHEN** en mitad de una partida de Brisca en red el jugador cambia a otra app durante 2 minutos y vuelve
- **THEN** la app reconecta enseguida y el jugador ve la partida en el punto actual, en su mismo asiento

## MODIFIED Requirements

### Requirement: Límites de seguridad
El servidor MUST:
- aceptar solo mensajes JSON de hasta 16 KB con una forma válida, y cerrar la conexión que envíe demasiados mensajes (más de 30 por segundo);
- aceptar conexiones solo desde los orígenes permitidos;
- generar los códigos y los testigos con azar criptográfico;
- tener como mucho 500 salas a la vez;
- aceptar como mucho 20 conexiones simultáneas desde una misma dirección IP, y que una misma IP tenga como mucho 5 salas abiertas como anfitriona. Detrás del proxy del despliegue, la IP es la del cliente que indica el proxy, no la del proxy.

#### Scenario: Mensaje malformado
- **WHEN** un cliente envía un texto que no es un mensaje válido
- **THEN** el servidor responde con un error y la sala no cambia

#### Scenario: Demasiadas salas desde una IP
- **WHEN** desde una misma IP ya hay 5 salas abiertas y se intenta crear otra
- **THEN** el servidor la rechaza con un error claro y las salas existentes no cambian
