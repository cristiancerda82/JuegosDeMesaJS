## ADDED Requirements

### Requirement: Burro en la suite
El menú MUST incluir el Burro junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores: 3, 4 (por defecto) o 5.

#### Scenario: Empezar una partida de Burro
- **WHEN** el jugador elige el Burro en el menú, elige 5 jugadores y empieza
- **THEN** se abre la mesa del Burro con él y 4 rivales de la IA

### Requirement: Acciones simultáneas en tiempo real
En los juegos en los que varios jugadores pueden actuar a la vez, como el Burro, el jugador MUST poder actuar siempre que tenga acciones legales, sin esperar a la IA. Cada IA MUST actuar tras su propio retraso, elegido por el cliente con azar propio: breve para elegir carta y, para plantarse, de reacción humana (de 1 a 3,5 segundos, aproximadamente), de forma que un jugador atento pueda adelantarse. Las acciones MUST aplicarse en el orden en que llegan. La partida MUST poder guardarse y retomarse en el mismo punto. Mientras la guía está abierta, la IA MUST NOT actuar.

#### Scenario: Adelantarse a la IA
- **WHEN** un rival de la IA se planta y el jugador pulsa «¡Me planto!» antes de que lo hagan los demás rivales
- **THEN** el jugador no es el último y no lleva letra

#### Scenario: El jugador no espera a la IA
- **WHEN** en el pase la IA aún no ha elegido su carta
- **THEN** el jugador puede elegir la suya sin esperar

### Requirement: Mesa del Burro
La mesa del Burro MUST mostrar las manos de los rivales boca abajo y la del jugador boca arriba.
- **Pase:** el jugador MUST elegir la carta que pasa tocándola, y ver a quién se la pasa. Tras el intercambio MUST ver resaltada la carta que ha recibido.
- **Plantarse:** cuando un jugador se planta, su mano MUST verse tumbada en la mesa, sin otro aviso. El botón «¡Me planto!» MUST estar siempre visible y con el mismo aspecto, tenga o no el jugador la acción disponible; pulsarlo sin poder plantarse MUST NOT tener efecto en la partida.
- **Letras:** la mesa MUST mostrar las letras de B-U-R-R-O de cada jugador.

#### Scenario: Pasar una carta
- **WHEN** en el pase el jugador toca una carta de su mano
- **THEN** esa carta queda elegida y, cuando todos han elegido, sale de su mano y recibe la del jugador anterior, que se ve resaltada

#### Scenario: Botón que no delata
- **WHEN** el jugador no tiene 4 iguales y nadie se ha plantado
- **THEN** el botón «¡Me planto!» se ve igual que cuando puede plantarse, y pulsarlo no cambia la partida

### Requirement: Resumen de la mano de Burro
Al terminar cada mano, la mesa MUST mostrar quién se plantó primero y con qué 4 cartas, el orden en que se plantaron los demás y quién lleva letra, o que la mano fue nula, junto a las letras de cada jugador. La partida MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar quién es el burro y las letras de todos.

#### Scenario: Fin de una mano de Burro
- **WHEN** se planta el penúltimo jugador
- **THEN** el jugador ve el resumen de la mano con quién lleva letra, y la partida espera a que pulse «Siguiente mano»

## MODIFIED Requirements

### Requirement: Turnos de la IA
Las jugadas de la IA MUST mostrarse con una pausa y una animación breves para que el jugador pueda seguirlas. Mientras juega la IA, el jugador MUST NOT poder hacer acciones de juego, salvo en los juegos con acciones simultáneas en tiempo real, en los que el jugador y la IA actúan a la vez.

#### Scenario: Jugada de la IA
- **WHEN** es el turno de la IA
- **THEN** su carta se ve salir de su mano hacia la mesa tras una pausa breve, y el jugador no puede jugar hasta que termine

#### Scenario: Juego simultáneo
- **WHEN** en el Burro la IA está a punto de actuar
- **THEN** el jugador puede actuar igualmente, y vale la acción que llegue antes
