## ADDED Requirements

### Requirement: Cartas especiales del Ocho loco
La configuración MUST tener la opción de cartas especiales, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa, al jugar estas cartas pasa lo siguiente:
- **10:** el sentido del juego cambia; con 2 jugadores no tiene efecto.
- **As:** el siguiente jugador MUST echar otro As o robar 2 cartas.
- **6:** el siguiente jugador MUST echar otro 6 o robar 1 carta.
- **7:** el siguiente jugador pierde el turno.
- **9:** si el siguiente jugador no puede echar ninguna carta, roba una y pierde el turno, sin poder jugar la que roba.

Más detalles:
- Quien roba por un As o un 6 sigue con su turno normal: puede jugar una carta de su mano que case con el descarte o, si no tiene ninguna, robar como siempre.
- Echar un As sobre un As, o un 6 sobre un 6, pasa la obligación al siguiente; las obligaciones no se suman.
- Si no quedan cartas para robar, roba las que haya.
- La carta que abre el descarte al repartir no tiene efecto.

La vista MUST indicar el sentido del juego y la obligación pendiente.

#### Scenario: El As hace robar 2
- **WHEN** con las cartas especiales un jugador juega el As de picas y el siguiente no tiene ningún As
- **THEN** su única acción legal es robar, roba 2 cartas y después puede jugar una carta de su mano que case

#### Scenario: Responder con otro As
- **WHEN** con las cartas especiales un jugador juega un As y el siguiente juega otro As
- **THEN** el siguiente a este tiene que echar un As o robar 2

#### Scenario: El 7 salta un turno
- **WHEN** con las cartas especiales y 4 jugadores el asiento 0 juega un 7
- **THEN** el turno pasa al asiento 2

#### Scenario: El 10 cambia el sentido
- **WHEN** con las cartas especiales y 4 jugadores el asiento 1 juega un 10
- **THEN** el turno pasa al asiento 0 y el juego sigue en sentido contrario

#### Scenario: Tras un 9 sin carta
- **WHEN** con las cartas especiales un jugador juega un 9 y el siguiente no tiene ninguna carta que case
- **THEN** roba una carta y el turno pasa al siguiente, aunque la carta robada case

#### Scenario: Sin cartas especiales
- **WHEN** con la opción por defecto un jugador juega un As
- **THEN** el siguiente juega con normalidad, sin tener que robar
