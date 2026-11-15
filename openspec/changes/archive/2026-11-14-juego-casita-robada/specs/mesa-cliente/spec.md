## ADDED Requirements

### Requirement: Casita robada en la suite
El menú MUST incluir la Casita robada junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y el número de jugadores (de 2 a 4). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Casita robada
- **WHEN** el jugador elige la Casita robada con 4 jugadores y empieza
- **THEN** se abre su mesa con sus 3 cartas, las 4 de la mesa y los tres rivales

### Requirement: Mesa de la Casita robada
La mesa de la Casita robada MUST mostrar:
- la mano del jugador y las de los rivales boca abajo;
- las cartas de la mesa;
- cuántas cartas quedan en el mazo;
- la casita de cada uno, con su carta de arriba y cuántas cartas tiene;
- a quién le toca;
- lo que hizo el último en jugar.

Al tocar una carta de su mano, el jugador MUST jugarla. Si con esa carta puede robar alguna casita, la mesa MUST preguntarle antes a quién roba, o si no roba.

#### Scenario: Elegir a quién robar
- **WHEN** el jugador toca un Rey y dos rivales tienen un Rey arriba de su casita
- **THEN** la mesa le ofrece robar a cualquiera de los dos o no robar

#### Scenario: Fin de la partida
- **WHEN** se acaban el mazo y las manos
- **THEN** sale la pantalla de fin con el ganador y las cartas de cada casita
