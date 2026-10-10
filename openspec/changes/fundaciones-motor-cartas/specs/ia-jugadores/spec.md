## Purpose

Define los jugadores controlados por la IA: qué información usan, qué garantías dan y con qué nivel de juego se ofrece la primera IA, la de la Brisca.

## ADDED Requirements

### Requirement: Decide solo con la vista del jugador
Un jugador IA MUST decidir usando solo la vista de su asiento, la misma que recibiría un humano. MUST NOT tener acceso a las manos ajenas, al orden del mazo ni a la semilla.

#### Scenario: Sin información oculta
- **WHEN** la IA decide su jugada
- **THEN** su decisión depende solo de la vista de su asiento; dos estados con la misma vista para ese asiento producen la misma decisión

### Requirement: Siempre juega una acción legal
Cuando tiene acciones legales, la IA MUST elegir siempre una de ellas.

#### Scenario: Partidas completas
- **WHEN** se juegan 1.000 partidas de Brisca entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

### Requirement: Reproducible
Si la IA usa azar, MUST tomarlo de una semilla propia, de modo que la misma vista y la misma semilla den la misma decisión.

#### Scenario: Misma decisión
- **WHEN** se le pide a la IA una decisión dos veces con la misma vista y la misma semilla
- **THEN** elige la misma acción

### Requirement: Tiempo de respuesta
La IA MUST decidir en menos de 500 ms en un móvil de gama media. El tiempo de espera visible antes de que juegue la IA es una decisión del cliente, no de la IA.

#### Scenario: Decisión rápida
- **WHEN** la IA decide una jugada de Brisca en cualquier momento de la partida
- **THEN** responde en menos de 500 ms

### Requirement: Asientos intercambiables
Cualquier asiento de una partida MUST poder ocuparlo un humano o una IA, sin que las reglas del juego cambien.

#### Scenario: Partida solo de IAs
- **WHEN** se crea una partida de Brisca con todos los asientos ocupados por IAs
- **THEN** la partida se juega completa hasta su resultado

### Requirement: IA de Brisca nivel básico
La Brisca MUST ofrecer al menos un nivel de IA que juegue de forma razonable:
- Si puede ganar una baza con puntos sin gastar triunfo, la gana.
- No gasta triunfos altos en bazas sin puntos.
- Cuando no puede ganar, entrega la carta de menor valor.
- Cambia la muestra cuando le conviene.

Este nivel MUST ganar a un jugador que elige cartas al azar en la mayoría de las partidas.

#### Scenario: Contra el azar
- **WHEN** la IA básica juega 1.000 manos contra un jugador que elige cartas legales al azar
- **THEN** gana claramente más de la mitad de las manos

#### Scenario: No regala puntos
- **WHEN** la IA responde a una baza que no puede ganar
- **THEN** juega una carta de 0 puntos si tiene alguna
