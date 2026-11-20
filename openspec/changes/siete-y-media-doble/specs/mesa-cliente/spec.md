## ADDED Requirements

### Requirement: Siete y media con el doble para cualquier siete y media en la mesa
Las opciones de la Siete y media MUST tener la casilla «Con cualquier siete y media», desactivada por defecto, junto al pago doble, en local y al crear una sala en red. La casilla MUST estar desactivada mientras el pago doble no esté marcado. La guía de la Siete y media MUST explicar la variante y decir que se activa con esa opción.

#### Scenario: La casilla depende del pago doble
- **WHEN** el jugador desmarca el pago doble en las opciones de la Siete y media
- **THEN** la casilla «Con cualquier siete y media» queda desactivada

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía de la Siete y media
- **THEN** ve explicado que se puede cobrar el doble con cualquier siete y media y en qué opción se activa
