## ADDED Requirements

### Requirement: IA del Polignac nivel básico
El Polignac MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **General:** lo anuncia solo si, en cada palo que tiene, sus cartas son las más altas seguidas desde el As (el As; el As y el K; el As, el K y la Q…). Si no, pasa.
- **En las bazas, sin general:**
  - al salir, juega la carta más baja de su palo más corto, sin contar las J mientras tenga otras cartas;
  - al seguir el palo, la más alta que no gana la baza; si todas ganan, la más alta que no sea una J;
  - sin el palo, se descarta de la J de picas; si no la tiene, de otra J; y si no, de la más alta.
- **Con general:**
  - si lo juega ella, echa la carta más alta;
  - si lo juega otro, la más baja que gana la baza o, si no puede ganar, la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Anuncia el general con las cartas más altas
- **WHEN** la IA tiene As, K y Q de picas, As y K de corazones, As de diamantes y As y K de tréboles
- **THEN** anuncia el general

#### Scenario: Pasa sin una racha desde el As
- **WHEN** la IA tiene los cuatro Ases y la Q de picas sin el K
- **THEN** pasa

#### Scenario: Se descarta de la J de picas
- **WHEN** la IA no tiene el palo de salida y tiene la J de picas y la J de corazones
- **THEN** echa la J de picas

#### Scenario: No gana la baza si puede evitarlo
- **WHEN** sale el 10 de diamantes y la IA tiene el 9 y el As de diamantes
- **THEN** echa el 9 de diamantes

#### Scenario: Partidas completas de Polignac
- **WHEN** se juegan 100 partidas de Polignac entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Polignac
- **WHEN** una IA básica juega 200 partidas de 4 jugadores contra tres que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
