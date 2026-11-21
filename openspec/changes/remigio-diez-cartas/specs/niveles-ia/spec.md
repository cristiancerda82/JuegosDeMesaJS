## ADDED Requirements

### Requirement: IA difícil del Remigio de diez cartas
Con la opción «Diez cartas», la IA difícil del Remigio MUST simular solo desde dónde roba y qué carta descarta cuando la normal descartaría. Si la normal cierra, MUST cerrar como ella. Al valorar una mano que no ha terminado, MUST contar los puntos sin ligar de cada jugador. La reconstrucción MUST repartir las cartas ocultas de la baraja francesa.

#### Scenario: El difícil cierra como la normal
- **WHEN** con diez cartas, la IA difícil puede cerrar
- **THEN** cierra, igual que la normal
