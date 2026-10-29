## ADDED Requirements

### Requirement: Bezique en la suite
El menú MUST incluir el Bezique junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 2. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Bezique
- **WHEN** el jugador elige el Bezique en el menú y empieza
- **THEN** se abre su mesa con su mano de 8 cartas, la carta vuelta junto al mazo y el triunfo

### Requirement: Mesa del Bezique
La mesa del Bezique MUST mostrar:
- la mano del jugador, con sus cartas cantadas marcadas;
- el rival, con cuántas cartas tiene, y sus cartas cantadas boca arriba;
- el mazo con la carta vuelta, la baza en curso, el triunfo, los puntos de la mano y el marcador.

Cuando el jugador gana una baza mientras quede mazo, la mesa MUST ofrecer un botón por cada declaración posible, con sus puntos («Matrimonio de ♥ · 20», «Cambiar el 7 · 10»…), y otro para no declarar. La mesa MUST avisar de los cantes del rival y, al acabar cada mano, mostrar un resumen con los cantes, las brisques, la última baza y los puntos de cada uno.

#### Scenario: Cantar
- **WHEN** el jugador gana una baza y toca «Bézique · 40»
- **THEN** la Q de picas y la J de diamantes quedan marcadas como cantadas, suma 40 y roba

#### Scenario: Fin de la partida
- **WHEN** al acabar una mano alguien llega a 1.000
- **THEN** sale la pantalla de fin con el ganador y los puntos de cada uno
