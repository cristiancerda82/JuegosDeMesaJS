## ADDED Requirements

### Requirement: IA del Remigio de diez cartas
Con la opción «Diez cartas», la IA básica del Remigio MUST mantener las garantías de siempre y jugar así:
- **Cerrar:** cierra en cuanto puede, con la carta que da el mayor premio.
- **Robar:** roba del montón si, con su carta de arriba, puede descartar otra y quedarse con menos puntos sin ligar que ahora. Si no, roba del mazo.
- **Descartar:** descarta la carta que le deja menos puntos sin ligar. Entre las que dejan lo mismo, la que menos combina con el resto de su mano y, después, la que más vale. No descarta comodines mientras tenga otra opción.

Con la opción, este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Cierra en cuanto puede
- **WHEN** con diez cartas, la IA ha robado y puede cerrar
- **THEN** cierra

#### Scenario: Roba del montón si le liga
- **WHEN** con diez cartas, la IA tiene dos ochos sueltos y en el montón hay otro ocho
- **THEN** roba del montón

#### Scenario: Partidas de diez cartas
- **WHEN** se juegan partidas de Remigio con diez cartas entre IAs, de 2 a 5 jugadores
- **THEN** todas terminan sin ninguna acción ilegal y la IA gana claramente al azar
