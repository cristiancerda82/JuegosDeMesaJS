## ADDED Requirements

### Requirement: Reconstrucción del Polignac con el orden antiguo
Con la opción del orden antiguo, la reconstrucción del Polignac MUST respetar además lo que se sabe de las Jotas: la mano de un jugador que no siguió el palo y echó una carta que no era Jota MUST quedar sin Jotas, y la de uno que echó una Jota que no era la de picas sin seguir el palo MUST quedar sin la Jota de picas.

#### Scenario: Quien no soltó Jota no tiene Jotas
- **WHEN** con la opción un rival no siguió el palo y echó un 8, y otro jugador reconstruye el estado
- **THEN** la mano reconstruida de ese rival no tiene ninguna Jota
