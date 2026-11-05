## ADDED Requirements

### Requirement: IA del Bourré nivel básico
El Bourré MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Bazas esperadas:** 1 por cada triunfo de la J al As y por cada As de otro palo; 0,5 por cada otro triunfo y por cada K de otro palo.
- **Jugar o pasar:** juega si espera al menos 1,5 bazas o tiene al menos 2 triunfos; si no, pasa.
- **Cambio:** se descarta de todas las cartas que no son triunfo, ni As, ni K (nunca de la vuelta), empezando por las más bajas.
- **Salir:** con el As de otro palo si tiene; si no, con su triunfo más alto; si no, con su carta más baja.
- **Responder:** con la carta legal más baja que gana la baza; si no puede ganarla, con la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega con dos triunfos
- **WHEN** la IA tiene dos triunfos bajos y tres cartas bajas de otros palos
- **THEN** juega la mano

#### Scenario: Pasa con mala mano
- **WHEN** la IA no tiene triunfos, ni Ases, ni K
- **THEN** pasa

#### Scenario: Se descarta de lo flojo
- **WHEN** la IA cambia con el As de picas, dos triunfos, el 4 de tréboles y el 6 de corazones (que no son triunfo)
- **THEN** se descarta del 4 de tréboles y del 6 de corazones

#### Scenario: Partidas completas de Bourré
- **WHEN** se juegan 100 partidas de Bourré entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Bourré
- **WHEN** una IA básica juega 200 partidas contra cuatro jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la quinta parte
