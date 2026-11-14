## ADDED Requirements

### Requirement: Sobrefallo libre en el Guiñote
La configuración MUST tener la opción de sobrefallo libre, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa, en el arrastre, el jugador MUST poder jugar cualquier carta de su mano cuando se cumplen tres condiciones:
- no tiene el palo de salida;
- tiene triunfos;
- ninguno de sus triunfos supera al triunfo que va ganando la baza.

Si la baza no la va ganando un triunfo, sigue obligado a fallar con triunfo.

#### Scenario: Sin poder superar el fallo en el arrastre
- **WHEN** con el sobrefallo libre activo, en el arrastre, un rival ha fallado con el rey de triunfo y el jugador, sin el palo de salida, solo tiene el 2 de triunfo y cartas de otros palos
- **THEN** cualquier carta de su mano es una jugada legal

#### Scenario: Opción desactivada en el arrastre
- **WHEN** con la opción por defecto se da la misma situación
- **THEN** solo el 2 de triunfo es una jugada legal
