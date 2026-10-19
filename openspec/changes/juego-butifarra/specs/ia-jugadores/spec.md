## ADDED Requirements

### Requirement: IA de la Butifarra nivel básico
La Butifarra MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Elegir el triunfo:** valora cada palo por sus cartas altas y su largo. Elige el mejor palo y elige butifarra con una mano muy fuerte. Como repartidor, delega si ningún palo es bueno.
- **Contros:** dice contro, recontro o Sant Vicenç solo con una mano fuerte para el triunfo elegido.
- **Al jugar:**
  - gana la baza con la carta más barata que la gane cuando merece la pena;
  - si la baza ya es de su compañero, le carga puntos;
  - si no puede ganar, juega la carta que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Delegar sin juego
- **WHEN** la IA reparte con una mano sin manillas ni ases y sin ningún palo de más de 3 cartas
- **THEN** delega en su compañero

#### Scenario: Cargar al compañero
- **WHEN** la baza la va ganando el compañero con una carta que nadie después puede superar, y la IA no tiene del palo
- **THEN** juega una carta con puntos en lugar de una de 0

#### Scenario: Partidas completas de Butifarra
- **WHEN** se juegan 500 partidas de Butifarra entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Butifarra
- **WHEN** una pareja de IAs básicas juega 500 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
