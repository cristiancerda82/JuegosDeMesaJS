## ADDED Requirements

### Requirement: Julepe con bailarla y la defensa del bote en el cliente
Las opciones del Julepe MUST tener las casillas «Bailarla» y «Defensa del bote», desactivadas por defecto, en local y al crear una sala en red. La guía del Julepe MUST explicar las dos variantes y decir en qué opción se activa cada una.

Con «Bailarla», la mesa MUST:
- ofrecer al que reparte los botones «La bailo» y «Miro mis cartas»;
- enseñarle en su mano solo la muestra hasta que elige;
- decir a todos si la bailó.

Con «Defensa del bote», la mesa MUST decir a todos quién defiende el bote, y el descarte del defensor MUST pedirle una sola carta.

#### Scenario: Bailarla en la mesa
- **WHEN** con la opción el jugador reparte
- **THEN** ve solo la muestra y los botones «La bailo» y «Miro mis cartas»; si toca «La bailo», todos ven que la baila

#### Scenario: Defender el bote en la mesa
- **WHEN** con la opción el jugador reparte y antes de él solo juega uno
- **THEN** juega obligado con 6 cartas, la mesa dice que defiende el bote y en el descarte solo puede marcar una carta

#### Scenario: Las variantes en la guía
- **WHEN** el jugador abre la guía del Julepe
- **THEN** ve explicadas bailarla y la defensa del bote, y en qué opción se activa cada una
