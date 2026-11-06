## ADDED Requirements

### Requirement: IA del Tresillo nivel básico
El Tresillo MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Bazas esperadas con un palo de triunfo:** 1 por cada matador y por el punto; 0,75 por el rey del triunfo y 0,5 por cada otro triunfo; 0,75 por cada rey de otro palo.
- **Subasta:** con el palo que más bazas espera, puja solo si espera al menos 5,5, entrada si espera al menos 3,5, y vuelta si de media con los cuatro palos espera al menos 3; puja el más alto de esos contratos si supera al último pujado, y si no, pasa.
- **Triunfo:** el palo con el que más bazas espera.
- **Cambio:** se descarta de todas las cartas que no son triunfo ni rey, empezando por las más bajas y sin pasar de las que quedan en el monte (en la vuelta, al menos una).
- **Salir:** el hombre, con su triunfo más alto mientras tenga triunfos; un defensor, con un rey de otro palo si tiene, y si no, con su carta más baja.
- **Responder:** si la baza ya la gana el otro defensor, un defensor echa su carta legal más baja; si no, la carta legal más baja que gana la baza, o la más baja si no puede ganarla.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja el solo con una gran mano
- **WHEN** la IA tiene los tres matadores, el punto y el rey de oros, y dos reyes de otros palos
- **THEN** puja solo

#### Scenario: Pasa con mala mano
- **WHEN** la IA no tiene matadores, ni reyes, y como mucho dos cartas de cada palo
- **THEN** pasa

#### Scenario: No gasta en la baza del compañero
- **WHEN** la IA defiende y el otro defensor va ganando la baza con un rey
- **THEN** echa su carta legal más baja

#### Scenario: Partidas completas de Tresillo
- **WHEN** se juegan 100 partidas de Tresillo entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tresillo
- **WHEN** una IA básica juega 300 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la tercera parte
