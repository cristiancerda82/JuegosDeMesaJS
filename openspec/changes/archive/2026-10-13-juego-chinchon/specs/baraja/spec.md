## ADDED Requirements

### Requirement: Comodines
El sistema MUST ofrecer 2 comodines con identificadores propios y estables, distintos de los de cualquier carta con palo, que se pueden añadir a una baraja española. Un comodín no tiene palo ni valor, y las funciones que piden el palo o el valor de una carta MUST distinguirlo de las cartas normales. Las barajas sin comodines no cambian.

#### Scenario: Baraja con comodines
- **WHEN** se crea una baraja española de 40 cartas con comodines
- **THEN** tiene 42 cartas distintas: las 40 de siempre y 2 comodines

#### Scenario: Identidad del comodín
- **WHEN** se pregunta si una carta es un comodín
- **THEN** la respuesta es afirmativa solo para los 2 identificadores de comodín
