## ADDED Requirements

### Requirement: Siete y media con cartas tapadas en la mesa
Las opciones de la Siete y media MUST tener la casilla «Pedir tapada», desactivada por defecto, en local y al crear una sala en red. La guía de la Siete y media MUST explicar la variante y decir que se activa con esa opción.

Con la opción activada, la mesa MUST:
- ofrecer dos botones para pedir: «Pedir destapada» y «Pedir tapada»;
- marcar las cartas propias que van tapadas;
- mostrar boca abajo las cartas tapadas de los demás;
- decir en el aviso si el último pidió tapada o destapada.

#### Scenario: Pedir tapada en la mesa
- **WHEN** con la opción el jugador toca «Pedir tapada»
- **THEN** ve su carta nueva con la marca de tapada, y en la mesa de los demás aparece boca abajo

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía de la Siete y media
- **THEN** ve explicada la carta tapada o destapada y que se activa en las opciones
