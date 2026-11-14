## ADDED Requirements

### Requirement: Premios de los oros y los sietes
La configuración MUST tener la opción de premios, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa:
- el bando que recoja los 10 oros MUST apuntarse 2 puntos por los oros en lugar de 1;
- el bando que recoja los 4 sietes MUST apuntarse 3 puntos por los sietes en lugar de 1.

El resto de conceptos no cambia. El desglose de la mano MUST mostrar el valor de los oros y de los sietes con el premio.

#### Scenario: Todos los oros
- **WHEN** con los premios activos un bando termina la mano con los 10 oros
- **THEN** se apunta 2 puntos por los oros

#### Scenario: Los cuatro sietes
- **WHEN** con los premios activos un bando termina la mano con los 4 sietes
- **THEN** se apunta 3 puntos por los sietes, además del punto del 7 de oros

#### Scenario: Sin premios
- **WHEN** con la opción por defecto un bando termina la mano con los 10 oros y los 4 sietes
- **THEN** se apunta 1 punto por los oros y 1 por los sietes
