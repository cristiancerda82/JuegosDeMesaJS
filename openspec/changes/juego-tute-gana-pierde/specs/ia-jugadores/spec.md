## ADDED Requirements

### Requirement: IA del Tute gana-pierde nivel básico
El Tute gana-pierde MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Antes de cada jugada, este nivel MUST elegir su objetivo: ir a por el máximo si ya tiene más tantos que cada uno de los demás con ventaja, o si al principio de la mano su mano promete muchos tantos; si no, ir a por el mínimo.

- **A por el mínimo:**
  - si puede no ganar la baza, echa la carta que más vale de las que no la ganan, sin completar el Rey y el Caballo de un palo en una baza que se vaya a llevar;
  - si tiene que ganarla, la gana con la carta que menos vale;
  - al salir, echa la carta más baja de su palo más corto, y nunca un Rey si tiene otra.
- **A por el máximo:** sale con la carta más alta de su palo más largo y gana las bazas con la carta que más vale de las que las ganan; si no puede ganarlas, echa la que menos vale.

Este nivel MUST quedarse en medio claramente menos veces que jugadores que eligen acciones legales al azar.

#### Scenario: Carga los puntos sin ganar la baza
- **WHEN** la IA va a por el mínimo, juega la última, se ha salido con el Rey de copas y la baza la gana el As de copas, y la IA tiene el Tres y el 4 de copas
- **THEN** echa el Tres de copas, que no gana la baza

#### Scenario: No sale con un Rey
- **WHEN** la IA va a por el mínimo, le toca salir y tiene el Rey de oros y el 5 de bastos
- **THEN** no sale con el Rey de oros

#### Scenario: Partidas completas de Tute gana-pierde
- **WHEN** se juegan partidas de Tute gana-pierde entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tute gana-pierde
- **WHEN** la IA básica juega muchas manos contra dos jugadores que eligen acciones legales al azar
- **THEN** se lleva claramente menos penalizaciones que cada uno de ellos
