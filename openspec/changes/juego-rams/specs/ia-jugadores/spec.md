## ADDED Requirements

### Requirement: IA del Rams nivel básico
El Rams MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST calcular las bazas que espera hacer con su mano (los Ases, los triunfos altos, los triunfos de sobra y los Reyes acompañados) y:
- jugar la mano si espera al menos una baza, o al menos media si le quedan 2 fichas o menos;
- coger la niña, si puede, con una mano que casi no promete bazas;
- al repartir, descartar la carta más baja que no sea triunfo;
- al jugar, salir con su carta más fuerte y, al responder, ganar la baza con la carta más barata que la gane cuando pueda.

Este nivel MUST quedarse sin fichas antes que jugadores que eligen acciones legales al azar en claramente más partidas de las que le tocarían.

#### Scenario: Juega con un As
- **WHEN** la IA habla con el As de picas, el Rey de triunfo y cartas bajas
- **THEN** juega la mano

#### Scenario: Pasa sin bazas
- **WHEN** la IA habla con 5 cartas bajas sin triunfos, con 5 fichas y la niña ya cogida
- **THEN** pasa

#### Scenario: Partidas completas de Rams
- **WHEN** se juegan partidas de Rams entre IAs con semillas distintas, con 3 y con 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Rams
- **WHEN** la IA básica juega muchas partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más partidas de las que le tocarían
