## ADDED Requirements

### Requirement: Reconstrucción de la Brisca con señas
Con las señas, la reconstrucción de la IA difícil de la Brisca MUST repartir al compañero las cartas de sus señas. El resto de su mano MUST salir de las cartas ocultas que no sean de triunfo con puntos, y ninguna MUST ser de triunfo si las señas dicen que no tiene triunfo. Las manos de los rivales y el mazo MUST repartirse al azar como sin señas.

#### Scenario: La mano del compañero cumple sus señas
- **WHEN** con señas, la IA difícil reconstruye una partida en la que su compañero señala el Caballo de triunfo
- **THEN** en todas las reconstrucciones el compañero tiene el Caballo de triunfo y ninguna otra carta de triunfo con puntos

#### Scenario: El compañero sin triunfo
- **WHEN** con señas, el compañero de la IA difícil señala que no tiene triunfo
- **THEN** en ninguna reconstrucción tiene cartas del palo de triunfo
