# modo-asistido Specification

## Purpose
Ayuda al jugador a aprender los juegos contra la IA mientras juega: le sugiere una jugada y le explica por qué, le comenta las jugadas que podían haber sido mejores y le da consejos al empezar cada fase del juego.

## Requirements

### Requirement: Juegos con modo asistido
Todos los juegos con IA (los de la lista de «Tres niveles en cada juego contra la máquina» de `niveles-ia`) MUST ofrecer el modo asistido. Los solitarios MUST NOT ofrecerlo, porque ya tienen su botón «Pista». El modo asistido MUST estar disponible solo en las partidas locales contra la IA: en una partida en red con otros humanos MUST NOT ofrecerse, porque daría ventaja a un jugador sobre los demás.

#### Scenario: Juego de bazas
- **WHEN** el jugador abre las opciones de la Brisca
- **THEN** encuentra la opción «Modo asistido»

#### Scenario: Solitario
- **WHEN** el jugador abre las opciones del Klondike
- **THEN** no aparece la opción «Modo asistido»

#### Scenario: En red
- **WHEN** el jugador está en una partida en red de Tute con otro humano
- **THEN** la mesa no muestra sugerencias, comentarios ni consejos del modo asistido

### Requirement: Activar el modo asistido
Las opciones de cada juego con modo asistido MUST incluir un interruptor «Modo asistido», desactivado por defecto. Cada juego MUST recordar en el dispositivo si se activó y proponerlo así la próxima vez. La partida guardada MUST incluir si el modo asistido está activo, y al retomarla MUST seguir igual. Una partida guardada por una versión anterior MUST retomarse sin modo asistido. Durante la partida, el jugador MUST poder desactivarlo y volver a activarlo desde la mesa sin cambiar el estado del juego.

#### Scenario: Recordar la elección
- **WHEN** el jugador activa «Modo asistido» en el Mus, empieza una partida y, más tarde, vuelve a abrir las opciones del Mus
- **THEN** «Modo asistido» aparece activado

#### Scenario: Apagarlo en la mesa
- **WHEN** a mitad de una partida asistida el jugador lo desactiva desde la mesa
- **THEN** dejan de aparecer las sugerencias, y la partida sigue en el mismo punto

### Requirement: Sugerencia de jugada
Con el modo asistido activo, cada vez que el jugador tiene que decidir, la mesa MUST mostrar una sugerencia sin hacer la jugada por él:
- MUST resaltar lo que habría que tocar: las cartas de su mano que jugaría o, si la jugada no es de cartas (pasar, pedir, envidar, plantarse…), el botón correspondiente;
- MUST mostrar una frase que nombra la jugada y explica por qué conviene, en el idioma de la suite.

La jugada sugerida MUST ser la que elegiría la IA difícil del juego en el asiento del jugador. La IA, igual que en sus propias jugadas, MUST decidir solo con la vista del jugador, sin ver ninguna carta oculta. Por eso la sugerencia nunca revela información que el jugador no tenga. La sugerencia MUST ser siempre una acción legal y MUST aparecer en menos de un segundo.

La explicación MUST describir algo cierto de la jugada en esa situación (qué gana, qué evita o qué prepara). Si no hay un motivo concreto que contar, MUST decir solo qué jugada conviene, sin inventar un motivo. Si el jugador solo tiene una acción posible, la sugerencia MUST indicarlo («Es tu única jugada posible»).

#### Scenario: Ganar una baza con puntos
- **WHEN** en la Brisca asistida el rival ha salido con el caballo de copas y el jugador tiene el as de copas, y la IA difícil elegiría el as
- **THEN** el as de copas queda resaltado y la frase explica que gana la baza y se lleva sus puntos sin gastar triunfo

#### Scenario: Jugada que no es una carta
- **WHEN** en la Siete y media asistida la IA difícil se plantaría
- **THEN** se resalta el botón «Plantarse» y la frase explica por qué conviene plantarse

#### Scenario: Sin información oculta
- **WHEN** se pide la sugerencia en dos estados de juego en los que el jugador ve exactamente lo mismo
- **THEN** la sugerencia y su explicación son las mismas en los dos

#### Scenario: Libertad de jugar otra cosa
- **WHEN** el jugador ve la sugerencia y juega otra carta legal
- **THEN** la jugada se hace con normalidad

### Requirement: Toda sugerencia dice por qué
Cada sugerencia MUST decir qué jugar y por qué. Cuando no hay un hecho seguro (nadie tiene la baza asegurada, o la jugada no gana en la mayoría de los repartos simulados), la explicación MUST dar el mejor dato que haya: la carta con más opciones de ganar la baza o la que menos puntos arriesga, la que mejor sale de media en la simulación o, para las acciones que no son cartas, lo que esa acción consigue con la mano del jugador. MUST NOT quedarse en un «te conviene» sin razón.

#### Scenario: Baza dudosa
- **WHEN** ninguna carta del jugador gana la baza con seguridad y la sugerida es la que más opciones tiene
- **THEN** la sugerencia dice que es la carta con más opciones de ganarla y en cuántos de cada 100 repartos posibles

#### Scenario: Acción sin carta
- **WHEN** la sugerencia es pasar en una subasta
- **THEN** dice que con su mano no le conviene ir más allá

### Requirement: Comentario de la jugada
Con el modo asistido activo, cuando el jugador hace una jugada distinta de la sugerida y esa jugada le cuesta algo concreto respecto a la sugerida, la mesa MUST mostrar un comentario breve que diga qué ha pasado y qué habría sido mejor. Por ejemplo, ha regalado puntos que podía evitar, ha perdido una baza que podía ganar, ha gastado un triunfo sin necesidad o ha descartado una carta que le formaba combinación. Si no hay un coste concreto que señalar, MUST NOT mostrar ningún comentario: el modo asistido no regaña por jugar distinto a la IA. El comentario MUST NOT deshacer ni bloquear la jugada, y MUST desaparecer solo en unos segundos o al tocarlo.

#### Scenario: Regalar puntos
- **WHEN** en la Brisca asistida el jugador no puede ganar la baza, juega el tres de oros (10 puntos) y tenía el cuatro de copas (0 puntos)
- **THEN** aparece un comentario que dice que ha dado 10 puntos al rival y que con el cuatro de copas no perdía nada

#### Scenario: Jugada distinta pero razonable
- **WHEN** el jugador juega una carta distinta de la sugerida, pero sin ningún coste concreto frente a ella
- **THEN** no aparece ningún comentario

### Requirement: Lectura de las jugadas de los rivales
Con el modo asistido activo, cada jugada de un rival de la IA MUST ir acompañada de una frase que explique por qué la hizo, con su nombre visto desde el jugador («Rival 1», «Compañero»…). Por ejemplo, juega una carta para llevarse la baza y sus puntos, entrega la que menos da porque no le compensa pelear la baza, se descarta de la carta que menos le sirve o se planta para no pasarse. El motivo MUST medirse con la vista de ese rival, que es quien decidió, pero la frase MUST NOT revelar sus cartas ocultas: no dice qué más tiene ni que era su única jugada posible. La mesa MUST enseñar las lecturas de los rivales desde la última jugada del jugador (al menos la última en el móvil). Calcularlas MUST NOT retrasar ni bloquear la partida ni la interacción con la mesa.

#### Scenario: El rival gana la baza
- **WHEN** en la Brisca asistida un rival juega el as de su palo y se lleva la baza con 21 puntos
- **THEN** la mesa explica que el rival juega el as para llevarse la baza, que vale 21 puntos

#### Scenario: Sin delatar sus cartas
- **WHEN** un rival juega la única carta que podía jugar
- **THEN** la frase explica qué consigue con ella, pero no dice que era su única jugada

#### Scenario: La mesa sigue fluida
- **WHEN** el asistente está calculando una sugerencia o una lectura y el jugador arrastra una carta
- **THEN** la carta sigue al dedo sin quedarse pegada

### Requirement: Consejos de fase
Con el modo asistido activo, la primera vez que el jugador llega a cada fase del juego en una partida (por ejemplo, la subasta, el cambio de cartas, el cante o el recuento), la mesa MUST mostrar un consejo breve que explica qué se decide en esa fase y qué tener en cuenta. Cada juego MUST tener al menos un consejo, el de su jugada principal. El consejo MUST poder cerrarse y MUST NOT volver a aparecer en esa partida para la misma fase.

#### Scenario: Primera subasta
- **WHEN** en una partida asistida de Tute subastado el jugador puja por primera vez
- **THEN** ve un consejo que explica qué significa pujar y cómo calcular cuánto puede pedir con su mano

#### Scenario: Una sola vez
- **WHEN** el jugador cierra el consejo de la subasta y en la mano siguiente vuelve a pujar
- **THEN** el consejo no aparece otra vez

### Requirement: El modo asistido no cambia el juego
El modo asistido MUST NOT cambiar las reglas, el reparto, las decisiones de los rivales ni el resultado de ninguna jugada. Las partidas asistidas MUST contar en las estadísticas igual que las demás. Con el modo asistido desactivado, la mesa MUST verse y comportarse exactamente como antes de este cambio.

#### Scenario: Misma partida
- **WHEN** se juega la misma semilla con las mismas jugadas del jugador, una vez con modo asistido y otra sin él
- **THEN** los rivales hacen las mismas jugadas y la partida acaba igual
