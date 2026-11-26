## ADDED Requirements

### Requirement: IA de la Manilla nivel básico
La Manilla MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar las bazas como la IA básica de la Butifarra, con el triunfo del pinte:
- **Al salir:** sale con una carta de un palo que no es triunfo y que gana seguro (la más alta de las que quedan por salir de su palo); si no tiene, sale como en el resto de juegos de bazas.
- **Si la baza ya es de su compañero** (es el último en jugar, o nadie de los que faltan puede quitársela), le carga los puntos con la carta que más vale y no es triunfo.
- **En los demás casos,** responde con la heurística común de bazas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Sale con la manilla
- **WHEN** a la IA le toca salir y tiene la manilla de copas, que no es triunfo
- **THEN** sale con el 9 de copas

#### Scenario: Carga puntos al compañero
- **WHEN** la IA juega la última y su compañero gana la baza con la manilla de copas
- **THEN** echa su As de copas

#### Scenario: Partidas completas de Manilla
- **WHEN** se juegan partidas de Manilla entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Manilla
- **WHEN** la pareja de la IA básica juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
