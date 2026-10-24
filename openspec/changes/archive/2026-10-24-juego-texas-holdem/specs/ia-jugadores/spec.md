## ADDED Requirements

### Requirement: IA del Texas Hold'em nivel básico
El Texas Hold'em MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar por la fuerza de su mano:
- **Antes del flop:** puntúa sus dos cartas (parejas, cartas altas, del mismo palo, seguidas). Con las mejores sube unas tres ciegas grandes (o resube); con el resto, iguala si lo que cuesta frente al bote lo compensa según esa puntuación y los rivales que quedan, y si no pasa o se retira.
- **Después del flop:** según la jugada que forma con las comunes. De pareja alta para arriba apuesta o sube unos tres cuartos del bote. Con pareja baja o un proyecto de color o escalera, iguala si el precio frente al bote lo compensa. Sin nada, pasa si puede y si no se retira.
- **Pocas fichas:** si le quedan menos de 10 ciegas grandes, con una mano buena va all-in.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Pareja de ases antes del flop
- **WHEN** la IA tiene dos ases antes del flop y nadie ha subido
- **THEN** sube

#### Scenario: Mano mala ante una subida
- **WHEN** la IA tiene un 7 y un 2 de distinto palo y alguien ha subido antes del flop
- **THEN** se retira

#### Scenario: Pasa sin nada
- **WHEN** en el flop la IA no tiene ninguna jugada ni proyecto y nadie ha apostado
- **THEN** pasa

#### Scenario: Partidas completas de Texas Hold'em
- **WHEN** se juegan 200 partidas de Texas Hold'em entre IAs con semillas distintas, de 2 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Texas Hold'em
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
