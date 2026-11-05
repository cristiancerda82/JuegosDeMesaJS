## ADDED Requirements

### Requirement: IA del Sheepshead nivel básico
El Sheepshead MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar con estas reglas:
- **Coger:** coge el blind si tiene al menos 3 triunfos que sean Q o J, o al menos 4 triunfos de los que uno sea Q; si no, pasa.
- **Enterrar:** entierra primero las cartas de otro palo que tiene solas en su palo, empezando por las que más puntos valen (y nunca la J de diamantes); si no, las de menos rango.
- **Salir:**
  - el picker y su compañero conocido, con su triunfo más alto;
  - los demás, con el As de un palo sin triunfo si lo tienen; si no, con su carta más baja de otro palo.
- **Responder:**
  - si la baza la gana alguien de su bando conocido, echa la carta que más puntos vale de las que no ganan;
  - si no, la carta legal más baja que gana la baza;
  - si no puede ganarla, la que menos puntos vale.
- **Leaster:** intenta no ganar bazas: echa la carta más alta que no gana y, si todas ganan, la más alta; al salir, su carta más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Coge con buena mano
- **WHEN** la IA tiene la Q de tréboles, la Q de picas y la J de corazones
- **THEN** coge el blind

#### Scenario: Pasa con mala mano
- **WHEN** la IA tiene un solo triunfo
- **THEN** pasa

#### Scenario: Entierra un As suelto
- **WHEN** el picker tiene el As de picas como única pica
- **THEN** lo entierra

#### Scenario: Partidas completas de Sheepshead
- **WHEN** se juegan 100 partidas de Sheepshead entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Sheepshead
- **WHEN** una IA básica juega 200 partidas contra cuatro jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la quinta parte
