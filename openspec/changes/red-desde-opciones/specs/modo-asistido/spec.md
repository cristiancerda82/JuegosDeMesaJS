## MODIFIED Requirements

### Requirement: Juegos con modo asistido
Todos los juegos con IA (los de la lista de «Tres niveles en cada juego contra la máquina» de `niveles-ia`) MUST ofrecer el modo asistido. Los solitarios MUST NOT ofrecerlo, porque ya tienen su botón «Pista». En las partidas locales contra la IA, el modo asistido MUST estar siempre disponible. En una partida en red MUST estar disponible solo si el anfitrión lo permitió al crear la sala (spec `partidas-en-red`), para que todos los jugadores conozcan la regla antes de empezar.

#### Scenario: Juego de bazas
- **WHEN** el jugador abre las opciones de la Brisca
- **THEN** encuentra la opción «Modo asistido»

#### Scenario: Solitario
- **WHEN** el jugador abre las opciones del Klondike
- **THEN** no aparece la opción «Modo asistido»

#### Scenario: En red
- **WHEN** el jugador está en una partida en red de Tute cuyo anfitrión no permitió el modo asistido
- **THEN** la mesa no ofrece el modo asistido ni muestra sugerencias, comentarios ni consejos

## ADDED Requirements

### Requirement: Modo asistido en red
En una partida en red con el modo asistido permitido, cada jugador humano MUST poder activarlo y desactivarlo desde la mesa, por su cuenta y sin que cambie lo que ven los demás. Al empezar, MUST estar activo o no según lo que ese jugador recuerda en su dispositivo para ese juego (el mismo valor que proponen las opciones locales). Activo, MUST dar la sugerencia de jugada, el comentario de la jugada del jugador y los consejos de fase con las mismas reglas que en local, calculados en el dispositivo del jugador con la vista de su asiento, sin pedir nada al servidor ni ver cartas ocultas. MUST NOT dar las lecturas de las jugadas de los rivales, porque se miden con la vista del rival, que el dispositivo del jugador no tiene. Activarlo, desactivarlo o calcular una sugerencia MUST NOT cambiar la partida ni retrasar a los demás jugadores.

#### Scenario: Sugerencia en red
- **WHEN** en una sala de Brisca con el modo asistido permitido le toca a un jugador que lo tiene activo
- **THEN** la mesa le resalta la carta sugerida y explica por qué, y los demás jugadores no ven nada nuevo

#### Scenario: Apagarlo en red
- **WHEN** a mitad de una partida en red con el modo asistido permitido un jugador lo desactiva desde la mesa
- **THEN** dejan de aparecerle las sugerencias y la partida sigue en el mismo punto para todos

#### Scenario: Sin lecturas de los rivales
- **WHEN** un jugador con el modo asistido activo en red ve jugar a un rival
- **THEN** la mesa no muestra ninguna frase sobre por qué jugó el rival
