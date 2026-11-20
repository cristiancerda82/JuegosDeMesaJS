## ADDED Requirements

### Requirement: Treinta y uno con viuda en la mesa
Las opciones del Treinta y uno MUST tener la casilla «Con viuda», desactivada por defecto, en local y al crear una sala en red. La guía del Treinta y uno MUST explicar la variante y decir que se activa con esa opción, con un ejemplo de un cambio.

Con la viuda activada, la mesa MUST:
- mostrar las tres cartas de la viuda en lugar del descarte, y cuántas quedan en el mazo;
- dejar cambiar una carta tocando una propia y una de la viuda;
- tener botones para cambiar las tres, pasar y plantarse;
- avisar de lo que hizo el último jugador y de cuándo se pone una viuda nueva.

#### Scenario: Cambiar tocando dos cartas
- **WHEN** con la viuda el jugador toca su 4 de tréboles y después el As de picas de la viuda
- **THEN** se cambian y el As de picas pasa a su mano

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Treinta y uno
- **THEN** ve explicada la viuda y que se activa en las opciones
