## ADDED Requirements

### Requirement: Dominó del Barbu con el número elegido
El Barbu MUST tener la opción «Dominó: elige el número», desactivada por defecto. Con la opción:
- cuando el repartidor elige el dominó, MUST elegir después el número con el que se empieza, del 2 al As;
- en el dominó, una carta de ese número MUST encajar siempre y abrir la fila de su palo, como sin la opción la Jota;
- las filas MUST crecer igual que sin la opción, con la carta siguiente o la anterior en el orden 2, 3 … 10, J, Q, K, A;
- la vista MUST enseñar a todos el número elegido.

Quién empieza el dominó, el pasar, los puntos y el resto de contratos MUST ser iguales que sin la opción. Sin la opción, el dominó MUST empezar con las Jotas.

#### Scenario: Elegir el número
- **WHEN** con la opción el repartidor elige el dominó
- **THEN** antes de jugar tiene que elegir un número del 2 al As

#### Scenario: Abrir con el número elegido
- **WHEN** con la opción se ha elegido el 7 y aún no hay filas
- **THEN** solo encajan los sietes, y una Jota no encaja

#### Scenario: Fila desde el As
- **WHEN** con la opción se ha elegido el As y la fila de picas tiene el As
- **THEN** en picas solo encaja el Rey
