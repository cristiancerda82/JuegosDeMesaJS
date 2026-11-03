## ADDED Requirements

### Requirement: Préférence en la suite
El menú MUST incluir el Préférence junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 3 y con la pulka a 10. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Préférence
- **WHEN** el jugador elige el Préférence en el menú y empieza
- **THEN** se abre su mesa con su mano de 10 cartas, dos rivales y la viuda boca abajo

### Requirement: Mesa del Préférence
La mesa del Préférence MUST mostrar:
- la mano del jugador y la de cada rival boca abajo, y la viuda (boca abajo hasta que se enseña);
- en la subasta, lo que ha dicho cada uno y, cuando le toca, la elección del número de bazas, del palo (con la miseria) o de pasar, solo con las pujas permitidas;
- al ganar la subasta, la selección de las 2 cartas que descarta y la declaración del contrato;
- al decidir el whist, los botones de «Whist» y «Paso»;
- durante las bazas, el contrato, quién juega, el triunfo, quién hace whist y las bazas de cada uno;
- la pulka, la montaña y los whists de cada jugador.

Al acabar cada mano, la mesa MUST mostrar un resumen con el contrato, las bazas, si se cumplió y lo que cada uno suma a su pulka, a su montaña y a sus whists (o la raspasy), y esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar el cierre de cuentas: la pulka, la montaña y el saldo de cada jugador.

#### Scenario: Pujar
- **WHEN** al jugador le toca pujar sin pujas antes
- **THEN** elige 6 y después el palo, y la mesa muestra su puja de 6 en ese palo

#### Scenario: Descartar y declarar
- **WHEN** el jugador gana la subasta
- **THEN** ve las 2 cartas de la viuda en su mano, elige 2 cartas para descartar y declara su contrato

#### Scenario: Fin de la partida
- **WHEN** las pulkas de los tres suman 30
- **THEN** sale la pantalla de fin con el saldo de cada jugador y el ganador
