## ADDED Requirements

### Requirement: IA de la Brisca con señas
Con las señas, la IA básica de la Brisca MUST decidir igual que sin ellas: ante la misma mano y la misma mesa, MUST elegir la misma jugada tenga su compañero las señas que tenga. Las partidas con señas entre IAs MUST cumplir las mismas garantías que sin ellas.

#### Scenario: Las señas no cambian la decisión de la normal
- **WHEN** con señas, la IA normal responde a una carta del rival y su compañero señala el As de triunfo
- **THEN** juega la misma carta que jugaría sin señas

#### Scenario: Partidas con señas entre IAs
- **WHEN** se juegan partidas de 4 con señas entre IAs normales y al azar
- **THEN** todas terminan sin acciones ilegales
