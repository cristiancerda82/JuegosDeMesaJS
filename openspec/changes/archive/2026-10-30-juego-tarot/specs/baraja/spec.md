## ADDED Requirements

### Requirement: Baraja de Tarot
El sistema MUST poder crear la baraja de Tarot de 78 cartas:
- los cuatro palos franceses con 14 cartas cada uno: del 1 al 10, Sota (J), Caballo, Dama (Q) y Rey (K). El Caballo es una carta propia de esta baraja, con su identificador de palo y valor 14;
- 21 triunfos numerados del 1 al 21, con identificadores propios;
- la Excusa, con un identificador propio.

Los triunfos y la Excusa no tienen palo francés: las funciones que piden el palo o el valor de una carta MUST distinguirlos de las cartas con palo, como a los comodines. Las demás barajas no cambian.

#### Scenario: Composición de la baraja de Tarot
- **WHEN** se crea la baraja de Tarot
- **THEN** contiene exactamente 78 cartas distintas: 56 de palo (14 por palo), 21 triunfos y la Excusa

#### Scenario: Caballo
- **WHEN** se lee el identificador del Caballo de picas
- **THEN** se obtiene la carta de picas con valor 14, que la baraja francesa de 52 no contiene
