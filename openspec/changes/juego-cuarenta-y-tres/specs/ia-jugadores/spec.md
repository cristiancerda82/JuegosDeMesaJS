## ADDED Requirements

### Requirement: IA del Cuarenta y tres nivel básico
El Cuarenta y tres MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST:
- cambiar la muestra siempre que pueda;
- al salir con 5 triunfos o más, arrastrar: con el triunfo más alto que queda por jugar, si lo tiene, y si no, con el más bajo;
- al salir sin arrastrar, echar una carta con puntos de otro palo que nadie pueda superar sin fallar (el As, o el Tres cuando ya ha salido el As), si la tiene;
- jugando segundo, si una de esas cartas del palo de salida gana la baza, ganarla con ella;
- en lo demás, jugar con la heurística de bazas del Tute, sin compañero: ganar las bazas con puntos sin gastar triunfo si puede, fallar solo si hay puntos en la mesa y, si no le conviene ganar, echar la carta que menos vale.

Este nivel MUST hacer claramente más tantos que jugadores que eligen acciones legales al azar.

#### Scenario: Cambia la muestra
- **WHEN** la IA puede cambiar la muestra
- **THEN** la cambia

#### Scenario: Arrastra con muchos triunfos
- **WHEN** a la IA le toca salir, tiene 5 triunfos y entre ellos el As de triunfo, que no se ha jugado
- **THEN** sale con el As de triunfo

#### Scenario: Sale con un As para arañar tantos
- **WHEN** a la IA le toca salir con pocos triunfos y tiene el As de un palo que no es triunfo
- **THEN** sale con ese As

#### Scenario: Partidas completas de Cuarenta y tres
- **WHEN** se juegan partidas de Cuarenta y tres entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cuarenta y tres
- **WHEN** la IA básica juega muchas manos contra dos jugadores que eligen acciones legales al azar
- **THEN** hace claramente más tantos que cada uno de ellos
