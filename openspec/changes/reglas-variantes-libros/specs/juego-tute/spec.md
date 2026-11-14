## ADDED Requirements

### Requirement: Sobrefallo libre en el Tute
La configuración MUST tener la opción de sobrefallo libre, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa y las obligaciones en vigor, el jugador MUST poder jugar cualquier carta de su mano cuando se cumplen tres condiciones:
- no tiene el palo de salida;
- tiene triunfos;
- ninguno de sus triunfos supera al triunfo que va ganando la baza.

Si la baza no la va ganando un triunfo, sigue obligado a fallar con triunfo, como siempre.

#### Scenario: Sin poder superar el fallo
- **WHEN** con el sobrefallo libre activo la salida es de copas, un rival ha fallado con el caballo de triunfo y el jugador, sin copas, solo tiene el 4 de triunfo y cartas de otros palos
- **THEN** cualquier carta de su mano es una jugada legal

#### Scenario: Opción desactivada
- **WHEN** con la opción por defecto se da la misma situación
- **THEN** solo el 4 de triunfo es una jugada legal

#### Scenario: Fallar sigue siendo obligatorio
- **WHEN** con el sobrefallo libre activo la salida es de copas, nadie ha fallado y el jugador no tiene copas pero tiene triunfos
- **THEN** solo sus triunfos son jugadas legales
