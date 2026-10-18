## ADDED Requirements

### Requirement: Servidor de salas
El servidor MUST ser la autoridad de cada partida en red:
- guarda el estado completo y aplica las acciones con el motor, validándolas contra las acciones legales del asiento que las envía;
- envía a cada jugador solo la vista de su asiento (`vistaDe`) y sus acciones legales, nunca el estado ni las manos ajenas;
- rechaza una acción ilegal, o de un asiento que no es el del jugador, sin cambiar la partida, y se lo dice a quien la envió.

El servidor MUST arrancar en local con un comando. El puerto y los orígenes permitidos se configuran con variables de entorno. Las salas MUST vivir en memoria: si el servidor se reinicia, se pierden.

#### Scenario: Cada uno ve solo lo suyo
- **WHEN** en una sala de Brisca de 2 jugadores humanos se reparte la mano
- **THEN** cada jugador recibe su propia mano y el número de cartas del otro, nunca sus cartas

#### Scenario: Acción ilegal
- **WHEN** un jugador envía una carta que no tiene, o juega fuera de su turno
- **THEN** el servidor la rechaza, la partida no cambia y el jugador recibe un aviso

### Requirement: Crear una sala y unirse
Un jugador MUST poder crear una sala eligiendo el juego (uno de los que tienen IA), sus opciones y el nivel de la IA. Quien la crea es el anfitrión, ocupa el asiento 0 y recibe un código de 5 letras, sin letras que se confundan (sin I, L, O ni U).

Otro jugador MUST poder unirse con el código y un nombre (de 1 a 20 caracteres). Entra en el primer asiento libre y, mientras la partida no ha empezado, puede cambiarse a otro asiento libre. Unirse con un código que no existe, a una sala llena o a una partida empezada MUST dar un error claro.

#### Scenario: Unirse con código
- **WHEN** el anfitrión crea una sala de Mus y otro jugador se une con su código
- **THEN** los dos ven la sala de espera con los 4 asientos: el anfitrión en el 0, el nuevo en el 1 y los otros dos libres

#### Scenario: Código que no existe
- **WHEN** un jugador intenta unirse con un código que no corresponde a ninguna sala
- **THEN** recibe el error «No hay ninguna sala con ese código»

### Requirement: Empezar con la IA en los asientos libres
Solo el anfitrión MUST poder empezar la partida. Al empezar, los asientos libres los ocupa la IA del nivel elegido. La partida MUST crearse con una semilla al azar del servidor. Cuando le toca a un asiento de la IA, el servidor MUST hacerla jugar tras una pausa breve, para que los jugadores puedan seguir la partida. En el Burro se usan los mismos retrasos de reacción por nivel que en la partida local.

#### Scenario: Dos humanos contra la IA en el Tute de 4
- **WHEN** el anfitrión y otro jugador ocupan los asientos 0 y 1 de una sala de Tute de 4 y el anfitrión empieza
- **THEN** los asientos 2 y 3 los juega la IA y la partida avanza sin esperar a nadie más

### Requirement: Desconexión y reconexión
Al entrar en una sala, cada jugador MUST recibir un testigo secreto, que solo él conoce, ligado a su asiento.
- **Desconexión:** si un jugador se desconecta con la partida empezada, los demás lo ven desconectado. Si no vuelve en 10 segundos, la IA juega por él hasta que vuelva.
- **Reconexión:** al reconectar con el código y su testigo, el jugador MUST recuperar su asiento y recibir la vista actual.
- **Sala de espera:** quien se desconecta antes de empezar deja libre su asiento. Si es el anfitrión, el anfitrión pasa al siguiente jugador conectado.

#### Scenario: Volver tras recargar la página
- **WHEN** a mitad de una partida un jugador recarga la página
- **THEN** vuelve a su asiento con la partida en el mismo punto, sin que la IA haya jugado por él si volvió en menos de 10 segundos

#### Scenario: La IA cubre a quien no vuelve
- **WHEN** un jugador cierra la página en su turno y no vuelve
- **THEN** pasados 10 segundos la IA juega por él, y la partida sigue para los demás

### Requirement: Pausas en la partida en red
Cuando un jugador tiene abierto un resumen de mano o la guía, el servidor MUST esperar para hacer jugar a la IA, hasta que lo cierre o pasen 60 segundos. Los jugadores humanos pueden seguir jugando.

#### Scenario: Resumen de la mano
- **WHEN** termina una mano de Chinchón y un jugador tiene abierto el resumen
- **THEN** la IA no empieza la mano siguiente hasta que lo cierra, o hasta que pasan 60 segundos

### Requirement: Fin, revancha y limpieza
Al terminar la partida, todos MUST recibir el resultado. El anfitrión MUST poder pedir la revancha: una partida nueva del mismo juego, con las mismas opciones y los mismos asientos. Una sala sin jugadores conectados durante 30 minutos MUST borrarse.

#### Scenario: Revancha
- **WHEN** termina una partida de Brisca en red y el anfitrión pulsa «Revancha»
- **THEN** empieza otra partida en la misma sala con los mismos jugadores en los mismos asientos

### Requirement: Límites de seguridad
El servidor MUST:
- aceptar solo mensajes JSON de hasta 16 KB con una forma válida, y cerrar la conexión que envíe demasiados mensajes (más de 30 por segundo);
- aceptar conexiones solo desde los orígenes permitidos;
- generar los códigos y los testigos con azar criptográfico;
- tener como mucho 500 salas a la vez.

#### Scenario: Mensaje malformado
- **WHEN** un cliente envía un texto que no es un mensaje válido
- **THEN** el servidor responde con un error y la sala no cambia
