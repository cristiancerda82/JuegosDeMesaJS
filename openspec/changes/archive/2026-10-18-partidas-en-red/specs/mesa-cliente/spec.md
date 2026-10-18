## ADDED Requirements

### Requirement: Jugar en red
El menú MUST incluir «Jugar en red», con dos opciones:
- **Crear sala:** elegir el juego (solo los que tienen IA), sus opciones y el nivel de la IA, con las mismas pantallas de opciones que en local, y un nombre.
- **Unirse:** escribir el código y un nombre.

El nombre se recuerda entre visitas. La pantalla de red MUST mostrar la dirección del servidor, que se puede cambiar y se recuerda. Si no se puede conectar, MUST decirlo con un mensaje claro.

#### Scenario: Crear una sala
- **WHEN** el jugador elige «Jugar en red», «Crear sala», la Brisca, y confirma con su nombre
- **THEN** ve la sala de espera con el código de la sala y su nombre en el asiento 0

#### Scenario: Sin servidor
- **WHEN** el jugador intenta crear una sala y el servidor no responde
- **THEN** ve el aviso «No se puede conectar con el servidor» y puede volver al menú

### Requirement: Sala de espera
La sala de espera MUST mostrar:
- el código de la sala, con un botón para copiarlo;
- el juego y sus opciones;
- cada asiento, con el nombre de quien lo ocupa o «IA» si está libre, y la pareja de cada uno en los juegos por parejas.

Un jugador MUST poder cambiarse a un asiento libre. El anfitrión MUST ver el botón «Empezar»; los demás ven que esperan al anfitrión. Al empezar, todos pasan a la mesa.

#### Scenario: Cambiar de asiento
- **WHEN** en la sala de espera de un Mus un jugador toca un asiento libre
- **THEN** pasa a ese asiento y todos lo ven

### Requirement: Partida en red
La partida en red MUST usar la misma mesa que la partida local, dibujada desde el asiento del jugador. Además, MUST mostrar:
- el nombre de cada jugador, y si está conectado, desconectado o lo juega la IA;
- el código de la sala.

Al recargar la página con una partida en red en marcha, el cliente MUST volver a entrar solo en su asiento. La pantalla de fin MUST ofrecer la revancha al anfitrión, y a los demás esperar la revancha o salir.

#### Scenario: Jugar desde el asiento 1
- **WHEN** un jugador se une a una Brisca de 2 y le toca el asiento 1
- **THEN** ve su mano abajo y la del anfitrión arriba, y su turno se indica como «Tu turno»

#### Scenario: Un rival se desconecta
- **WHEN** el otro jugador cierra su página
- **THEN** su nombre aparece como desconectado y, pasados 10 segundos, como jugado por la IA

### Requirement: Mesas desde cualquier asiento
Todas las mesas de los juegos con IA MUST dibujarse desde el asiento del jugador:
- su mano y su sitio abajo, y los demás alrededor en el orden del juego;
- «Tú» es siempre él, y «Tu pareja» o «Nosotros» es siempre su bando;
- los resúmenes de mano y la pantalla de fin, igual.

En las partidas locales el jugador está en el asiento 0 y no cambia nada.

#### Scenario: Mesa de 4 desde el asiento 2
- **WHEN** un jugador ocupa el asiento 2 de un Mus en red
- **THEN** ve abajo su mano, enfrente al jugador del asiento 0 (su pareja), y a los asientos 3 y 1 a los lados en el orden de juego
