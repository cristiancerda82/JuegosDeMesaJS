## ADDED Requirements

### Requirement: IA del Skat nivel básico
El Skat MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Valorar la mano:** para cada juego posible (cada palo, Grand y Nulo) estima si lo ganaría, contando las J, los triunfos, los Ases y los dieces acompañados. En el Nulo, que no tenga cartas altas sin las bajas de su palo.
- **Subasta:** puja o acepta mientras el valor no pase del de su mejor juego, contando el Skat como desconocido.
- **El Skat:** lo coge siempre, se descarta de las 2 cartas que menos le sirven para su mejor juego (prefiriendo dejar dieces y reyes sueltos en el Skat) y declara el juego mejor valorado que llegue a lo pujado.
- **Bazas como solista:** en palo y Grand, sale con sus triunfos más altos mientras los rivales tengan triunfos, y después con sus Ases. En Nulo, juega siempre la carta más alta que no gane la baza.
- **Bazas como defensor:** gana la baza con la carta más barata que la gane si no la va ganando el otro defensor. Si la va ganando el otro defensor y juega el último, le echa su carta de más puntos. Si no, echa la que menos vale. En Nulo, intenta que el solista gane alguna baza saliendo con cartas bajas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Puja con una mano fuerte
- **WHEN** la IA tiene las cuatro J y dos Ases, y le toca pujar 18
- **THEN** puja

#### Scenario: Pasa con una mano floja
- **WHEN** la IA no tiene ninguna J, ni Ases, ni una mano de Nulo
- **THEN** pasa en la subasta

#### Scenario: Partidas completas de Skat
- **WHEN** se juegan 100 partidas de Skat entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Skat
- **WHEN** una IA básica juega 200 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de un tercio
