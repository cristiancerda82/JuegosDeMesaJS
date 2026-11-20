## ADDED Requirements

### Requirement: Bailarla en el Julepe
El Julepe MUST tener la opción «Bailarla», desactivada por defecto. Con la opción, al empezar cada mano y antes de que decida nadie, el que reparte MUST elegir, viendo solo la muestra, si la baila o mira sus cartas. Mientras no elige, su vista MUST enseñarle solo la muestra.

Si la baila:
- MUST jugar la mano sin volver a decidir, y los demás deciden sabiéndolo;
- cada baza suya MUST valer el doble, sin pasar de lo que quede en el bote tras cobrar los demás;
- si no hace 2 bazas, MUST pagar julepe doble (el doble de lo que valía el bote), sin pasar de sus fichas;
- si no juega nadie más, MUST llevarse el bote como siempre.

Si mira sus cartas, la mano MUST seguir como sin la opción.

#### Scenario: Elegir a ciegas
- **WHEN** con la opción empieza una mano
- **THEN** el que reparte decide primero, viendo solo la muestra, si la baila o mira sus cartas

#### Scenario: Cobro doble
- **WHEN** con un bote de 10, el que reparte la bailó y hace 3 bazas, y otro jugador hace 2
- **THEN** el otro cobra 4, y el que reparte, que cobraría 12, cobra los 6 que quedan en el bote

#### Scenario: Julepe doble
- **WHEN** con un bote de 10, el que reparte la bailó y hace 1 baza
- **THEN** paga 20 de julepe

### Requirement: Defensa del bote en el Julepe
El Julepe MUST tener la opción «Defensa del bote», desactivada por defecto. Con la opción, si antes del que reparte juega exactamente uno y el que reparte no la bailó, el que reparte MUST jugar defendiendo el bote:
- recibe la primera carta del mazo, con lo que tiene 6;
- en el descarte MUST soltar exactamente una carta y no roba;
- cobra sus bazas como siempre;
- si no hace 2 bazas, no paga julepe.

Todos MUST ver que defiende el bote. Sin la opción, el que reparte obligado MUST jugar como siempre.

#### Scenario: Defender con 6 cartas
- **WHEN** con la opción solo juega uno antes del que reparte
- **THEN** el que reparte juega con 6 cartas y en el descarte solo puede soltar una

#### Scenario: Defensa perdida
- **WHEN** el que defiende el bote hace 1 baza
- **THEN** cobra esa baza y no paga julepe
