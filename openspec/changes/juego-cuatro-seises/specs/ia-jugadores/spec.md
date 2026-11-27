## ADDED Requirements

### Requirement: IA del Cuatro seises nivel básico
El Cuatro seises MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST valorar sus jugadas como la IA básica del Cinquillo, con el orden de la baraja en juego y las escaleras naciendo del 6:
- suma por cada carta propia del mismo palo que la jugada acerca;
- resta por cada hueco que abre a los demás;
- prefiere soltar pronto el As y el Rey.

Así, MUST guardar un 6 que no le abre camino a ninguna carta propia mientras tenga otra jugada.

Este nivel MUST ganar claramente más fichas que jugadores que eligen acciones legales al azar.

#### Scenario: Guarda el 6 que bloquea
- **WHEN** la IA puede jugar el 6 de copas, sin más copas en la mano, o el 5 de oros, con el 4 de oros en la mano
- **THEN** juega el 5 de oros

#### Scenario: Partidas completas de Cuatro seises
- **WHEN** se juegan partidas de Cuatro seises entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cuatro seises
- **WHEN** la IA básica juega muchas manos contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más fichas que cada uno de ellos
