## ADDED Requirements

### Requirement: IA del Julepe con bailarla y la defensa del bote
Con la opción «Bailarla», la IA básica del Julepe MUST bailarla cuando la muestra es un As o un Tres, y mirar sus cartas si no. Con la opción «Defensa del bote», al defender MUST soltar en el descarte su peor carta: la más baja de las que no son triunfo, As ni Tres, o, si todas lo son, la más baja. Con las opciones, la IA básica MUST cumplir las mismas garantías y ganar a jugadores al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Bailarla con un As de muestra
- **WHEN** con la opción la IA reparte y la muestra es el As de su palo
- **THEN** la baila

#### Scenario: Soltar la peor al defender
- **WHEN** la IA defiende el bote con un 4 de un palo que no es triunfo y el resto triunfos, Ases o Treses
- **THEN** suelta el 4

#### Scenario: Partidas con las opciones
- **WHEN** se juegan partidas de Julepe con las dos opciones entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal
