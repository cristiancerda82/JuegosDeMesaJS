# ia-jugadores Specification

## Purpose
Define los jugadores controlados por la IA: qué información usan, qué garantías dan y con qué nivel de juego se ofrece la primera IA, la de la Brisca.

## Requirements

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

### Requirement: IA de Tute nivel básico
El Tute MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Canta el tute cuando puede y, si no, canta siempre que puede, las 40 antes que las 20.
- Cambia el 7 de triunfo cuando puede.
- No juega el rey ni el caballo de una pareja que aún puede cantar, si tiene otra carta legal.
- Si puede ganar una baza con puntos sin gastar triunfo, la gana, y cuando no puede ganar entrega la carta de menor valor.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las manos.

#### Scenario: Canta lo que puede
- **WHEN** la IA ganó la última baza y tiene el rey y el caballo de triunfo sin cantar
- **THEN** canta las 40 antes de salir

#### Scenario: Guarda la pareja
- **WHEN** la IA sale, tiene el rey y el caballo de un palo sin cantar y tiene otras cartas legales
- **THEN** no juega ni ese rey ni ese caballo

#### Scenario: Partidas completas de Tute
- **WHEN** se juegan 1.000 partidas de Tute entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tute
- **WHEN** la IA básica juega 1.000 manos de Tute contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las manos

### Requirement: IA de Escoba nivel básico
La Escoba MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Hace escoba siempre que puede.
- Si puede recoger, elige la captura más valiosa: la que lleva el 7 de oros, luego más sietes, más oros y más cartas.
- Si no recoge, evita dejar en la mesa una suma que permita al rival hacer escoba, y evita soltar sietes y oros cuando tiene otra opción.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las manos.

#### Scenario: Hace escoba
- **WHEN** la IA tiene una jugada que deja la mesa vacía
- **THEN** la elige

#### Scenario: Se lleva el 7 de oros
- **WHEN** la IA puede recoger de dos formas y solo una incluye el 7 de oros
- **THEN** elige la que incluye el 7 de oros

#### Scenario: No da escoba
- **WHEN** la IA no puede recoger y una de sus cartas dejaría en la mesa una suma entre 5 y 14 mientras otra no
- **THEN** juega la que no deja la mesa a tiro de escoba

#### Scenario: Partidas completas de Escoba
- **WHEN** se juegan 1.000 partidas de Escoba entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Escoba
- **WHEN** la IA básica juega 1.000 manos de Escoba contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las manos

### Requirement: IA de Chinchón nivel básico
El Chinchón MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Roba del descarte solo si esa carta le baja los puntos sin ligar de su mejor mano posible tras descartar. Si no, roba del mazo.
- Descarta la carta con la que su mano queda con menos puntos sin ligar y, a igualdad, la de más valor.
- Cierra siempre que puede.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: Roba del descarte cuando le sirve
- **WHEN** la carta del descarte completa una combinación en la mano de la IA
- **THEN** la IA roba del descarte

#### Scenario: Descarta lo que menos sirve
- **WHEN** la IA tiene que descartar y una carta suelta de mucho valor no forma parte de ninguna combinación
- **THEN** descarta esa carta

#### Scenario: Cierra cuando puede
- **WHEN** cerrar está entre las acciones legales de la IA
- **THEN** cierra

#### Scenario: Partidas completas de Chinchón
- **WHEN** se juegan 1.000 partidas de Chinchón entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Chinchón
- **WHEN** la IA básica juega 1.000 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA de Guiñote nivel básico
El Guiñote MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Canta siempre que puede, las 40 antes que las 20.
- Cambia el 7 de triunfo cuando puede.
- No juega el rey ni la sota de una pareja que aún puede cantar, si tiene otra carta legal y queda mazo.
- Si puede ganar una baza con puntos sin gastar triunfo, la gana. Cuando no puede ganar, entrega la carta de menor valor.

Este nivel MUST ganar la mayoría de las partidas contra un jugador que elige acciones legales al azar.

#### Scenario: Canta lo que puede
- **WHEN** la IA ganó la última baza, queda mazo y tiene el rey y la sota de triunfo sin cantar
- **THEN** canta las 40 antes de salir

#### Scenario: Guarda la pareja
- **WHEN** la IA sale con mazo, tiene el rey y la sota de un palo sin cantar y tiene otras cartas legales
- **THEN** no juega ni ese rey ni esa sota

#### Scenario: Partidas completas de Guiñote
- **WHEN** se juegan 1.000 partidas de Guiñote entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Guiñote
- **WHEN** la IA básica juega 1.000 partidas de Guiñote contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
