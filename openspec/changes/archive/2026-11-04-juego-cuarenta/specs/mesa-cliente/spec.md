## ADDED Requirements

### Requirement: Cuarenta en la suite
El menú MUST incluir el Cuarenta junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y 2 jugadores o 4 en parejas; la partida es siempre a 40. Como el resto de juegos con IA, MUST poder jugarse en red, y con 4 la sala de espera MUST mostrar las parejas.

#### Scenario: Empezar una partida de Cuarenta
- **WHEN** el jugador elige el Cuarenta con 2 jugadores y empieza
- **THEN** se abre su mesa con su mano de 5 cartas y la mesa vacía

#### Scenario: Cuarenta por parejas
- **WHEN** el jugador elige 4 jugadores y empieza
- **THEN** se abre su mesa con su mano de 5 cartas y su compañero enfrente

### Requirement: Mesa del Cuarenta
La mesa del Cuarenta MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- la mesa y el mazo;
- las cartas recogidas de cada bando y los puntos de la partida;
- la última jugada con lo que capturó, y si fue caída o limpia;
- las rondas del reparto.

Al tocar una carta de su mano, el jugador MUST elegir qué se lleva, o dejarla en la mesa, si tiene más de una opción. La escalera se añade sola a lo que elige.

Al acabar cada mano, la mesa MUST mostrar un resumen con lo que anotó cada bando en la mano (rondas, caídas, limpias y cartones, con sus cartas recogidas) y los puntos de la partida.

#### Scenario: Elegir la captura
- **WHEN** el jugador juega un 7 y en la mesa hay un 7, un 3 y un 4
- **THEN** elige entre llevarse el 7, llevarse el 3 y el 4, o dejar su carta en la mesa

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra las cartas recogidas y los cartones de cada bando

#### Scenario: Fin de la partida
- **WHEN** un bando llega a 40
- **THEN** sale la pantalla de fin con el bando ganador y los puntos de cada uno
