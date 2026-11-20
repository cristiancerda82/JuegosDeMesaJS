## ADDED Requirements

### Requirement: IA del Treinta y uno con viuda
Con la opción de la viuda, la IA básica del Treinta y uno MUST jugar así:
- con una mano de 27 o más, se planta si puede;
- si no, calcula el valor de su mano tras el mejor cambio de una carta y tras cambiar las tres, y hace el cambio que más la sube. Si los dos la suben lo mismo, cambia una;
- si ningún cambio la sube, pasa.

Con viuda, la IA básica MUST cumplir las mismas garantías y ganar a jugadores al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Coge el As de su palo
- **WHEN** la IA tiene el K y el 9 de corazones y el 2 de picas, y en la viuda está el As de corazones
- **THEN** cambia el 2 de picas por el As de corazones

#### Scenario: Se lleva la viuda entera
- **WHEN** la mano de la IA vale 12 y la viuda tiene el As, la K y la Q de diamantes
- **THEN** cambia las tres

#### Scenario: Pasa si nada la mejora
- **WHEN** la mano de la IA vale 25 y ningún cambio la sube
- **THEN** pasa

#### Scenario: Partidas con viuda
- **WHEN** se juegan partidas de Treinta y uno con viuda entre IAs con semillas distintas, de 2 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal
