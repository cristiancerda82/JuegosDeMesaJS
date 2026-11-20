## ADDED Requirements

### Requirement: Polignac con el orden antiguo
El Polignac MUST tener la opción «Orden antiguo», desactivada por defecto. Con la opción:
- el orden de cada palo MUST ser Rey, Dama, Jota, As, 10, 9, 8 y 7, y la baza la MUST ganar la carta más alta del palo de salida con ese orden;
- quien no tiene el palo de salida MUST echar la Jota de picas si la tiene; si no la tiene, MUST echar una Jota si tiene alguna; y solo sin Jotas MUST poder echar cualquier carta;
- la vista MUST enseñar a todos lo que se sabe de las Jotas de cada uno en la mano: quien no siguió el palo y echó una carta que no era Jota no tiene Jotas, y quien echó otra Jota sin seguir el palo no tiene la de picas.

El reparto, los puntos, el fin de la mano y el general MUST ser iguales que sin la opción. Sin la opción, el orden y las cartas legales MUST ser los de siempre.

#### Scenario: El As por debajo de la Jota
- **WHEN** con la opción sale el As de corazones y otro echa la Jota de corazones
- **THEN** la Jota gana la baza

#### Scenario: Soltar la Jota de picas
- **WHEN** con la opción un jugador sin el palo de salida tiene la Jota de picas, la de diamantes y otras cartas
- **THEN** solo puede echar la Jota de picas

#### Scenario: Soltar otra Jota
- **WHEN** con la opción un jugador sin el palo de salida tiene la Jota de diamantes y no la de picas
- **THEN** solo puede echar Jotas

#### Scenario: Sin Jotas
- **WHEN** con la opción un jugador sin el palo de salida no tiene Jotas
- **THEN** puede echar cualquier carta, y todos ven que no tiene Jotas
