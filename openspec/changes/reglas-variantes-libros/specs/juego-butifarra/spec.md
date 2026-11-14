## ADDED Requirements

### Requirement: Sobrefallo libre en la Butifarra
La configuración MUST tener la opción de sobrefallo libre, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa, el jugador MUST poder jugar cualquier carta de su mano cuando se cumplen tres condiciones:
- no tiene el palo de salida;
- la baza la va ganando un rival con un triunfo;
- ninguno de sus triunfos supera ese triunfo.

Si la baza no la va ganando un triunfo, sigue obligado a fallar con triunfo.

#### Scenario: Sin poder superar el fallo del rival
- **WHEN** con el sobrefallo libre activo la salida es de espadas, un rival ha fallado con la manilla de triunfo y el jugador, sin espadas, tiene el As de triunfo y cartas de otros palos
- **THEN** cualquier carta de su mano es una jugada legal

#### Scenario: Opción desactivada en la Butifarra
- **WHEN** con la opción por defecto se da la misma situación
- **THEN** solo sus triunfos son jugadas legales
