# juego-klondike Specification

## Purpose
Define las reglas del solitario Klondike con baraja francesa: preparación, movimientos válidos, opciones de robo, deshacer, autocompletar y victoria.

## Requirements

### Requirement: Preparación de la mesa
Una partida de Klondike MUST repartir una baraja francesa barajada en 7 columnas: la columna n recibe n cartas, solo la última boca arriba. Las 24 cartas restantes forman el mazo boca abajo. Las 4 fundaciones y el descarte empiezan vacíos.

#### Scenario: Reparto inicial
- **WHEN** se crea una partida de Klondike
- **THEN** las columnas tienen 1, 2, 3, 4, 5, 6 y 7 cartas, con solo la última de cada una boca arriba
- **AND** el mazo tiene 24 cartas y las fundaciones y el descarte están vacíos

### Requirement: Opciones de robo
La partida MUST configurarse para robar de 1 en 1 o de 3 en 3. Por defecto se roba de 1. Robar mueve esa cantidad de cartas del mazo al descarte, o las que queden si son menos. Solo la carta superior del descarte se puede jugar.

#### Scenario: Robar de 3
- **WHEN** en modo robar 3 se roba con 10 cartas en el mazo
- **THEN** pasan 3 cartas al descarte y solo la última queda jugable

#### Scenario: Robar con menos cartas que el modo
- **WHEN** en modo robar 3 se roba con 2 cartas en el mazo
- **THEN** pasan las 2 cartas al descarte

### Requirement: Reciclar el mazo
Cuando el mazo está vacío y el descarte no, el jugador MUST poder volver a pasar el descarte al mazo, conservando el orden de robo. Por defecto las vueltas son ilimitadas; la configuración MUST permitir limitarlas.

#### Scenario: Reciclar
- **WHEN** el mazo está vacío y se recicla el descarte
- **THEN** el descarte queda vacío y el mazo vuelve a entregar las cartas en el mismo orden que la vuelta anterior

#### Scenario: Límite de vueltas alcanzado
- **WHEN** la partida limita las vueltas y ya se usaron todas
- **THEN** reciclar no está entre las acciones legales

### Requirement: Movimientos en las columnas
Una carta o una secuencia de cartas boca arriba MUST poder moverse sobre la última carta de una columna si la carta movida que queda abajo es un valor menor y de color opuesto. Solo un rey, o una secuencia que empieza por rey, MUST poder ocupar una columna vacía. Una secuencia solo se mueve si está ordenada de mayor a menor y alterna colores.

#### Scenario: Movimiento válido
- **WHEN** se mueve un 9 de picas sobre un 10 de corazones
- **THEN** el movimiento se acepta

#### Scenario: Mismo color
- **WHEN** se intenta mover un 9 de picas sobre un 10 de tréboles
- **THEN** el movimiento se rechaza

#### Scenario: Columna vacía
- **WHEN** se intenta mover una reina a una columna vacía
- **THEN** el movimiento se rechaza, y con un rey se acepta

### Requirement: Fundaciones
Cada fundación MUST construirse por un solo palo, del as al rey en orden ascendente. MUST poder moverse a una fundación la carta superior del descarte o la última de una columna. MUST poder devolverse la carta superior de una fundación a una columna, respetando las reglas de las columnas.

#### Scenario: Iniciar fundación
- **WHEN** se mueve un as a una fundación vacía
- **THEN** el movimiento se acepta, y con cualquier otra carta se rechaza

#### Scenario: Continuar fundación
- **WHEN** se mueve el 2 de corazones a una fundación que tiene el as de corazones
- **THEN** el movimiento se acepta, y con el 2 de picas se rechaza

### Requirement: Descubrir cartas
Cuando una columna queda con su última carta boca abajo, esa carta MUST voltearse boca arriba automáticamente como parte del mismo movimiento.

#### Scenario: Volteo automático
- **WHEN** se retira la única carta boca arriba de una columna que tiene cartas boca abajo
- **THEN** la nueva última carta de esa columna queda boca arriba

### Requirement: Deshacer
El jugador MUST poder deshacer los movimientos en orden inverso, uno por uno, hasta el inicio de la partida. Deshacer restaura también los volteos automáticos y los reciclados del mazo.

#### Scenario: Deshacer un movimiento con volteo
- **WHEN** se deshace un movimiento que provocó el volteo de una carta
- **THEN** la carta vuelve a su lugar y la carta volteada vuelve a quedar boca abajo

#### Scenario: Nada que deshacer
- **WHEN** se intenta deshacer al inicio de la partida
- **THEN** la acción no está disponible

### Requirement: Autocompletar
Cuando el mazo y el descarte están vacíos y todas las cartas de las columnas están boca arriba, el jugador MUST poder autocompletar: el sistema mueve todas las cartas a las fundaciones.

#### Scenario: Autocompletar disponible
- **WHEN** no quedan cartas boca abajo ni en el mazo ni en el descarte
- **THEN** autocompletar está disponible y, al usarlo, las 52 cartas terminan en las fundaciones

### Requirement: Victoria y contadores
La partida MUST terminar con victoria cuando las 52 cartas están en las fundaciones. La partida MUST llevar el número de movimientos y el tiempo jugado. El jugador MUST poder abandonar en cualquier momento.

#### Scenario: Victoria
- **WHEN** se coloca la última carta en una fundación
- **THEN** la partida termina con victoria y muestra los movimientos y el tiempo
