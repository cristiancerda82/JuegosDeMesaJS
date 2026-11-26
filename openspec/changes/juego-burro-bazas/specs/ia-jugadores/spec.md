## ADDED Requirements

### Requirement: IA del Burro de bazas nivel básico
El Burro de bazas MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así, contando como sin ver las cartas que no están en su mano, ni en la mesa, ni entre las jugadas de la mano:
- **Al salir:** elige el palo en el que los rivales tienen menos cartas. Valen más los palos que algún rival se sabe que no tiene, y menos los que tienen más cartas sin ver y aquel del que solo le queda una carta mientras haya otras sin ver. Dentro del palo, echa la punta (una carta que no puede superar ninguna de las que no ve) si la tiene; si no, la más alta.
- **Al seguir el palo:** si con la punta del palo gana la baza, la echa; si no, gana con la más baja que gana cuando es el último en jugar, y si no, echa la más baja.
- **Sin el palo:** roba, o pasa si no queda mazo.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Sale por el palo que falta a un rival
- **WHEN** a la IA le toca salir y un rival se sabe que no tiene espadas
- **THEN** sale con una carta de espadas

#### Scenario: Sale con la punta
- **WHEN** a la IA le toca salir y tiene el Rey de copas
- **THEN** sale con el Rey de copas

#### Scenario: El último gana con lo justo
- **WHEN** la IA es la última en jugar una baza de oros que va ganando el 8 y tiene el As, el 9 y el Caballo de oros, pero aún no se ha visto el Rey de oros
- **THEN** echa el 9 de oros

#### Scenario: Partidas completas de Burro de bazas
- **WHEN** se juegan 100 partidas de Burro de bazas entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Burro de bazas
- **WHEN** la IA básica juega 200 partidas de 4 jugadores contra tres que eligen acciones legales al azar
- **THEN** está entre los ganadores claramente más veces que un jugador al azar en su sitio
