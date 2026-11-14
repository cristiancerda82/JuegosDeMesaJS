## ADDED Requirements

### Requirement: IA del Póker de cinco cartas nivel básico
El Póker de cinco cartas MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar por la fuerza de su mano:
- **Antes del descarte:**
  - con trío o mejor, sube a unas tres ciegas grandes (o a tres veces la apuesta más alta);
  - con doble pareja, abre subiendo, y si ya han subido, iguala;
  - con pareja de J o mejor, iguala, o abre subiendo si nadie ha subido;
  - con pareja más baja, o cuatro cartas de color o de escalera abierta, iguala si lo que cuesta frente al bote lo compensa;
  - con el resto, pasa o se retira;
  - si le quedan menos de 10 ciegas grandes, va all-in con pareja de J o mejor y, si no, pasa o se retira.
- **Descarte:**
  - con escalera, color, full, póker o escalera de color, no cambia;
  - con trío, cambia las 2 que no son del trío;
  - con doble pareja, cambia 1;
  - con pareja, cambia 3;
  - con cuatro cartas de color o de escalera abierta, cambia la otra;
  - sin nada, se queda con el As y cambia 4, o si no tiene As, con las dos más altas y cambia 3.
- **Después del descarte:**
  - con escalera o mejor, apuesta o sube unos tres cuartos del bote;
  - con trío o doble pareja, apuesta medio bote si nadie ha apostado y, si no, iguala si compensa;
  - con pareja, iguala si compensa;
  - sin nada, pasa si puede y si no se retira.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Cambia tres con una pareja
- **WHEN** la IA tiene pareja de 8 y tres cartas sueltas en el descarte
- **THEN** cambia las tres sueltas

#### Scenario: Se queda con el As
- **WHEN** la IA no tiene ninguna jugada y tiene un As en el descarte
- **THEN** se queda con el As y cambia las otras cuatro

#### Scenario: Servida con color
- **WHEN** la IA tiene color en el descarte
- **THEN** no cambia ninguna carta

#### Scenario: Trío antes del descarte
- **WHEN** la IA tiene un trío antes del descarte y nadie ha subido
- **THEN** sube

#### Scenario: Partidas completas de Póker de cinco cartas
- **WHEN** se juegan 200 partidas de Póker de cinco cartas entre IAs con semillas distintas, de 2 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Póker de cinco cartas
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
