## ADDED Requirements

### Requirement: IA de la Siete y media con cartas tapadas
Con la opción de pedir tapada, la IA básica de la Siete y media MUST:
- como punto, decidir si pide igual que sin la opción y, cuando pide, pedir tapada;
- como banca, contar como valor mínimo de cada punto plantado sus cartas boca arriba más medio punto por cada carta tapada, y con eso decidir si pide; cuando pide, pedir destapada.

Con la opción, la IA básica MUST cumplir las mismas garantías y ganar a jugadores al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: El punto pide tapada
- **WHEN** con la opción la IA es punto, tiene 3 y le toca
- **THEN** pide tapada

#### Scenario: La banca cuenta las tapadas
- **WHEN** con la opción la IA es banca con 5, y el único punto plantado tiene un 4 boca arriba y tres cartas tapadas (al menos 5,5)
- **THEN** pide destapada, porque ese punto le gana aunque sus tapadas valgan lo mínimo

#### Scenario: Partidas con cartas tapadas
- **WHEN** se juegan partidas de Siete y media con la opción entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal
