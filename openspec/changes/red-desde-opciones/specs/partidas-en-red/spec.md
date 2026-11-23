## MODIFIED Requirements

### Requirement: Crear una sala y unirse
Un jugador MUST poder crear una sala eligiendo el juego (uno de los que tienen IA), sus opciones, el nivel de la IA y si se permite el modo asistido. Quien la crea es el anfitrión, ocupa el asiento 0 y recibe un código de 5 letras, sin letras que se confundan (sin I, L, O ni U).

Otro jugador MUST poder unirse con el código y un nombre (de 1 a 20 caracteres). Entra en el primer asiento libre y, mientras la partida no ha empezado, puede cambiarse a otro asiento libre. Unirse con un código que no existe, a una sala llena o a una partida empezada MUST dar un error claro.

El mensaje para crear la sala MUST admitir que falte el permiso del modo asistido, para que los clientes de versiones anteriores sigan creando salas: en ese caso la sala se crea sin modo asistido. La información de la sala que reciben todos los jugadores MUST incluir si el modo asistido está permitido.

#### Scenario: Unirse con código
- **WHEN** el anfitrión crea una sala de Mus y otro jugador se une con su código
- **THEN** los dos ven la sala de espera con los 4 asientos: el anfitrión en el 0, el nuevo en el 1 y los otros dos libres

#### Scenario: Código que no existe
- **WHEN** un jugador intenta unirse con un código que no corresponde a ninguna sala
- **THEN** recibe el error «No hay ninguna sala con ese código»

#### Scenario: Cliente anterior
- **WHEN** un cliente que no envía el permiso del modo asistido crea una sala de Tute
- **THEN** la sala se crea y su información dice que el modo asistido no está permitido

## ADDED Requirements

### Requirement: Empezar en red desde las opciones del juego
Las opciones de cada juego que se puede jugar en red MUST ofrecer, además de «Empezar partida», el botón «Empezar en red». Al pulsarlo, MUST crearse una sala de ese juego con las opciones y el nivel de la IA elegidos, y el jugador MUST pasar directamente a la sala de espera como anfitrión, sin pasar por la pantalla de red. Las opciones MUST incluir la casilla «Permitir el modo asistido» de la sala y el campo «Tu nombre en red», relleno con el último nombre usado en red. Si el nombre está vacío o es demasiado largo, «Empezar en red» MUST NOT crear la sala y MUST pedir el nombre. Al crear la sala, el nombre MUST guardarse como último nombre usado. Si no se puede conectar con el servidor, el jugador MUST ver el aviso de conexión en la pantalla de red, como al crear la sala desde ella. Los solitarios MUST NOT ofrecer «Empezar en red».

Las opciones abiertas desde «Jugar en red → Crear sala» MUST seguir mostrando un único botón, «Crear sala», porque ya se está creando una sala.

#### Scenario: Sala directa
- **WHEN** el jugador, con el nombre «Ana» ya guardado, abre las opciones de la Escoba, elige el nivel Difícil y pulsa «Empezar en red»
- **THEN** pasa a la sala de espera de una sala de Escoba con la IA en Difícil, sentado en el primer asiento como anfitrión con el nombre «Ana»

#### Scenario: Sin nombre
- **WHEN** el jugador, sin nombre guardado, pulsa «Empezar en red» en las opciones de la Brisca
- **THEN** sigue en las opciones, ve el aviso de que falta el nombre y no se crea ninguna sala

#### Scenario: Solitario
- **WHEN** el jugador abre las opciones del Klondike
- **THEN** no aparecen «Empezar en red» ni el campo «Tu nombre en red»

### Requirement: Elegir el juego de la sala por familias
Al crear una sala desde «Jugar en red», la elección del juego MUST mostrar las familias del menú principal que tienen juegos en red (todas menos los solitarios), cada una con su nombre y su número de juegos. Al elegir una familia, MUST mostrar sus juegos en el orden del menú principal, y el jugador MUST poder volver a las familias. La elección MUST incluir un buscador por nombre que, como el del menú principal, no distingue mayúsculas ni tildes y muestra los juegos de todas las familias que coinciden. El botón atrás de Android MUST volver de una familia a las familias, y de las familias a la pantalla de red.

#### Scenario: Elegir por familia
- **WHEN** el jugador pulsa «Crear sala» y elige la familia «Captura»
- **THEN** ve los 7 juegos de captura y, al elegir la Escoba, se abren las opciones de la sala de Escoba

#### Scenario: Sin solitarios
- **WHEN** el jugador pulsa «Crear sala»
- **THEN** ve las 7 familias con juegos en red y no aparece «Solitarios»

#### Scenario: Buscar
- **WHEN** el jugador escribe «guinote» en el buscador
- **THEN** aparece el Guiñote

### Requirement: Permitir el modo asistido en la sala
Las opciones de una sala en red (las de «Crear sala» y las que acompañan a «Empezar en red») MUST incluir la casilla «Permitir el modo asistido», desactivada por defecto. La sala de espera MUST indicar a todos los jugadores si el modo asistido está permitido. El permiso MUST valer para toda la partida y para sus revanchas.

#### Scenario: Anfitrión que lo permite
- **WHEN** el anfitrión crea una sala de Tute marcando «Permitir el modo asistido» y otro jugador se une
- **THEN** los dos ven en la sala de espera que el modo asistido está permitido
