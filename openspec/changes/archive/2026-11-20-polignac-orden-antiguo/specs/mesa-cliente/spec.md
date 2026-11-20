## ADDED Requirements

### Requirement: Polignac con el orden antiguo en el cliente
Las opciones del Polignac MUST tener la casilla «Orden antiguo», desactivada por defecto, en local y al crear una sala en red. La guía del Polignac MUST explicar la variante y decir que se activa con esa opción. Con la opción, la mesa MUST ordenar la mano con el orden de la variante y dejar jugar solo las cartas legales.

#### Scenario: Sin el palo, solo la Jota
- **WHEN** con la opción el jugador no tiene el palo de salida y tiene una Jota
- **THEN** en su mano solo se pueden jugar las Jotas que le obliga la regla

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Polignac
- **THEN** ve explicado el orden antiguo, la obligación de soltar las Jotas y que se activa en las opciones
