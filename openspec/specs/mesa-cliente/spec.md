# mesa-cliente Specification

## Purpose
Define el cliente 2D de la suite: el menú para elegir juego, la mesa donde se juega y cómo interactúa el jugador con las cartas en escritorio y en móvil, sin depender de la red en modo local.

## Requirements

### Requirement: Menú de la suite
El cliente MUST mostrar un menú con los juegos disponibles (Klondike y Brisca). Desde el menú, el jugador MUST poder abrir las opciones de cada juego y empezar una partida nueva.

#### Scenario: Elegir juego
- **WHEN** el jugador abre la aplicación
- **THEN** ve el menú con Klondike y Brisca y puede empezar cualquiera de los dos

#### Scenario: Opciones de partida
- **WHEN** el jugador prepara una partida de Brisca
- **THEN** puede elegir las variantes disponibles (número de jugadores, cambio de muestra, arrastre, número de manos) antes de empezar

### Requirement: Interacción con las cartas
El jugador MUST poder mover cartas arrastrándolas y también tocándolas (tocar la carta y luego el destino, o tocar la carta para que vaya a su destino obvio). Al empezar a mover una carta, el cliente MUST resaltar los destinos legales. Un movimiento ilegal MUST devolver la carta a su lugar sin cambiar el estado.

#### Scenario: Arrastre válido
- **WHEN** el jugador arrastra una carta a un destino legal
- **THEN** la carta queda en ese destino

#### Scenario: Movimiento ilegal
- **WHEN** el jugador suelta una carta en un destino no legal
- **THEN** la carta vuelve a su lugar con una animación y la partida no cambia

#### Scenario: Doble toque a la fundación
- **WHEN** en Klondike el jugador toca dos veces una carta que puede ir a una fundación
- **THEN** la carta se mueve a la fundación

### Requirement: Información visible en la mesa
El cliente MUST mostrar solo la información de la vista del jugador. En la Brisca muestra su mano, el dorso de las cartas rivales, la muestra, las cartas que quedan en el mazo, la baza en curso y de quién es el turno. En Klondike muestra los movimientos, el tiempo, y los botones de deshacer y de autocompletar cuando está disponible.

#### Scenario: Mano rival oculta
- **WHEN** se juega una partida de Brisca
- **THEN** las cartas del rival se ven boca abajo hasta que se juegan

### Requirement: Turnos de la IA
Las jugadas de la IA MUST mostrarse con una pausa y una animación breves para que el jugador pueda seguirlas. Mientras juega la IA, el jugador MUST NOT poder hacer acciones de juego.

#### Scenario: Jugada de la IA
- **WHEN** es el turno de la IA
- **THEN** su carta se ve salir de su mano hacia la mesa tras una pausa breve, y el jugador no puede jugar hasta que termine

### Requirement: Fin de partida
Al terminar una partida, el cliente MUST mostrar el resultado (en la Brisca, los puntos de cada jugador o pareja) y ofrecer jugar otra vez o volver al menú.

#### Scenario: Resultado de Brisca
- **WHEN** termina una mano de Brisca
- **THEN** se muestran los puntos de cada lado, el ganador o el empate, y las opciones de revancha y de volver al menú

### Requirement: Diseño adaptable
La mesa MUST ser usable desde 360 px de ancho en vertical hasta escritorio, sin scroll horizontal, con cartas legibles y objetivos táctiles cómodos.

#### Scenario: Móvil pequeño
- **WHEN** se abre una partida en una pantalla de 360 x 640 px
- **THEN** todas las zonas de juego se ven sin scroll horizontal y cada carta se identifica por palo y valor

### Requirement: Juego local sin red
En modo local, la partida MUST jugarse completa sin hacer ninguna petición de red después de cargar la aplicación.

#### Scenario: Sin conexión
- **WHEN** se corta la conexión después de cargar la aplicación
- **THEN** se puede empezar y terminar una partida de Klondike o de Brisca contra la IA

### Requirement: Retomar la partida
El cliente MUST guardar en el dispositivo la partida local en curso y ofrecer retomarla al volver a abrir la aplicación.

#### Scenario: Recargar la página
- **WHEN** el jugador recarga la aplicación a mitad de una partida
- **THEN** se le ofrece continuarla en el mismo punto

### Requirement: Idioma
Todos los textos del cliente MUST estar en español.

#### Scenario: Textos en español
- **WHEN** se recorren el menú, las opciones y una partida completa
- **THEN** todos los textos visibles están en español

### Requirement: Tute en la suite
El menú MUST incluir el Tute junto a Klondike y la Brisca. Sus opciones MUST permitir elegir el número de jugadores (2 o 4 en parejas), el cambio del 7 de triunfo, si hay que montar sobre el compañero y el número de manos, antes de empezar.

#### Scenario: Empezar una partida de Tute
- **WHEN** el jugador elige el Tute en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Tute con la configuración elegida

### Requirement: Cantar desde la mesa
Cuando cantar o cantar el tute sea una acción legal, la mesa MUST ofrecerla con un control que diga qué se canta (por ejemplo, "Cantar las 40 en oros"). Cada cante, propio o de la IA, MUST anunciarse a todos los jugadores mostrando quién canta, qué palo y cuántos puntos, y la mesa MUST mantener visible la lista de cantes de la mano.

#### Scenario: Cante de la IA
- **WHEN** la IA canta las 20 en espadas
- **THEN** la mesa muestra un aviso con el cante y el rey y el caballo de espadas, y el cante queda en la lista de cantes de la mano

### Requirement: Manos grandes en pantallas pequeñas
La mano propia MUST caber completa, con hasta 10 cartas, desde 360 px de ancho y sin scroll horizontal. Si hace falta, las cartas se solapan, pero el índice de cada una (valor y palo) MUST quedar a la vista y cada carta MUST poder elegirse con el dedo.

#### Scenario: Diez cartas en 360 px
- **WHEN** empieza una partida de Tute de 4 jugadores en una pantalla de 360 × 640 px
- **THEN** las 10 cartas de la mano se ven sin scroll horizontal y se identifica el valor y el palo de cada una

### Requirement: Guía de cada juego
Cada juego de la suite MUST tener una guía "¿Cómo se juega?" pensada para quien nunca lo jugó, que explique el objetivo, el valor de las cartas, cómo se juega una ronda o un movimiento y cómo se hacen las acciones en la mesa. La guía MUST poder abrirse desde las opciones del juego y durante la partida, y MUST poder cerrarse sin afectar a la partida.

#### Scenario: Guía del Tute
- **WHEN** el jugador abre la guía desde las opciones del Tute
- **THEN** ve explicados el objetivo, el valor de las cartas, el triunfo, las bazas, los cantes, el tute y las obligaciones de juego

#### Scenario: Consultar la guía en plena partida
- **WHEN** el jugador abre y cierra la guía durante una partida
- **THEN** la partida sigue en el mismo punto

### Requirement: Escoba en la suite
El menú MUST incluir la Escoba junto al resto de juegos. Sus opciones MUST permitir elegir el número de jugadores (2 o 4 en parejas), los puntos de la partida (15, 21 o 31), si recoger es obligatorio y si la mesa inicial que suma 15 cuenta como escoba, antes de empezar.

#### Scenario: Empezar una partida de Escoba
- **WHEN** el jugador elige la Escoba en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Escoba con la configuración elegida

### Requirement: Elegir qué recoger
Al jugar una carta en la Escoba, el jugador MUST poder elegir qué cartas de la mesa recoge. Al elegir una carta de la mano, la mesa MUST resaltar las cartas que pueden formar 15 con ella. El jugador puede tocar cartas de la mesa para armar la captura y confirmarla, o dejar la carta en la mesa si es legal. Si arrastra la carta a la mesa y solo hay una jugada posible, se aplica directamente. Si hay varias, la mesa MUST mostrar las opciones para que elija una. Una captura que no suma 15 MUST NOT poder confirmarse.

#### Scenario: Elegir entre dos capturas
- **WHEN** el jugador suelta en la mesa una carta que puede recoger de dos formas
- **THEN** la mesa le muestra las dos capturas y la opción de no recoger (si es legal), y aplica la que elija

#### Scenario: Armar la captura tocando
- **WHEN** el jugador elige una carta de su mano y toca cartas de la mesa que suman 15 con ella
- **THEN** puede confirmar la captura y las cartas pasan a su montón

### Requirement: Escobas y puntuación visibles
La mesa de la Escoba MUST anunciar cada escoba, propia o de la IA, y mostrar durante la mano cuántas cartas y escobas lleva cada bando. Al terminar cada mano MUST mostrar el desglose de la puntuación (escobas, cartas, oros, 7 de oros y sietes) de cada bando, junto con los puntos acumulados de la partida.

#### Scenario: Fin de una mano de Escoba
- **WHEN** termina una mano de Escoba
- **THEN** el jugador ve el desglose de puntos de cada bando y el total de la partida antes de que se reparta la siguiente mano

### Requirement: Chinchón en la suite
El menú MUST incluir el Chinchón junto al resto de juegos. Sus opciones MUST permitir elegir el número de jugadores (2, 3 o 4), la baraja (40 o 48 cartas), si hay comodines, el límite de eliminación y el valor máximo de la carta suelta para cerrar, antes de empezar.

#### Scenario: Empezar una partida de Chinchón
- **WHEN** el jugador elige el Chinchón en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Chinchón con la configuración elegida

### Requirement: Robar, descartar y cerrar en la mesa
En la mesa del Chinchón el jugador MUST poder robar tocando o arrastrando desde el mazo o desde la carta de arriba del descarte, y descartar arrastrando una carta al descarte o eligiéndola y pulsando "Descartar". Cuando cerrar sea legal con la carta elegida, MUST poder hacerlo con un botón "Cerrar". La mesa MUST indicar en qué fase está el jugador (robar o descartar) y de quién es el turno, y mostrar qué carta roba y descarta cada rival.

#### Scenario: Turno completo desde la mesa
- **WHEN** el jugador toca el mazo y después arrastra una carta de su mano al descarte
- **THEN** roba una carta, la descartada queda arriba del descarte y el turno pasa al siguiente

#### Scenario: Cerrar desde la mesa
- **WHEN** el jugador elige una carta con la que puede cerrar
- **THEN** el botón "Cerrar" está disponible y, al pulsarlo, termina la mano

### Requirement: Ordenar la mano y ver sus combinaciones
La mano propia del Chinchón MUST mostrar marcadas sus combinaciones según la mejor agrupación y las cartas sin ligar, con los puntos que sumarían. El jugador MUST poder ordenar la mano por combinaciones, por palo o por valor.

#### Scenario: Ver combinaciones
- **WHEN** el jugador tiene en la mano un trío y una escalera
- **THEN** la mesa los muestra agrupados y marcados, y separa las cartas sin ligar con sus puntos

### Requirement: Resultado de la mano de Chinchón
Al terminar cada mano del Chinchón, la mesa MUST mostrar quién cerró, las manos destapadas de todos los jugadores con sus combinaciones y sus cartas sin ligar, los puntos de la mano y los acumulados de cada jugador, y quién queda eliminado, antes de que se reparta la siguiente mano.

#### Scenario: Fin de una mano de Chinchón
- **WHEN** un rival cierra la mano
- **THEN** el jugador ve las manos de todos agrupadas, los puntos de cada uno y los totales, y la partida espera a que pulse "Siguiente mano"

### Requirement: Guiñote en la suite
El menú MUST incluir el Guiñote junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (2, o 4 en parejas), el cambio del 7 de triunfo, si hay que montar sobre el compañero y los puntos de la partida.

#### Scenario: Empezar una partida de Guiñote
- **WHEN** el jugador elige el Guiñote en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Guiñote con la configuración elegida

### Requirement: Mesa del Guiñote
La mesa del Guiñote MUST reutilizar la mesa de bazas: mano propia, asientos rivales, mazo con la muestra y baza en curso. Cuando cantar o cambiar el 7 sea una acción legal, la mesa MUST ofrecerlo con un control que diga qué se hace (por ejemplo, "Cantar las 40 en oros"). Cada cante, propio o de la IA, MUST anunciarse mostrando quién canta, qué palo, cuántos puntos y el rey y la sota de ese palo. La mesa MUST mantener visibles la lista de cantes de la mano, los puntos acumulados de cada bando con la meta de la partida, y un aviso de que se está en el arrastre cuando se agota el mazo.

#### Scenario: Cante de la IA
- **WHEN** la IA canta las 20 en espadas
- **THEN** la mesa muestra un aviso con el cante y el rey y la sota de espadas, y el cante queda en la lista de cantes de la mano

#### Scenario: Empieza el arrastre
- **WHEN** se roba la muestra y se agota el mazo
- **THEN** la mesa indica que se está en el arrastre y solo deja jugar las cartas que obligan las reglas

### Requirement: Resumen de la mano de Guiñote
Al terminar cada mano del Guiñote, la mesa MUST mostrar los puntos de cada bando en bazas, cantes y 10 de últimas, el total de la mano y los acumulados de la partida. Si la partida sigue, MUST indicar que se juega de vueltas y esperar a que el jugador pulse "Siguiente mano" antes de repartir.

#### Scenario: Ir de vueltas
- **WHEN** termina la primera mano y ningún bando llega a 101
- **THEN** el jugador ve el resumen de la mano con los acumulados y el aviso de que se juega de vueltas, y la partida espera a que pulse "Siguiente mano"

### Requirement: Siete y media en la suite
El menú MUST incluir la Siete y media junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (2, 3 o 4), el número de manos, las fichas iniciales, la apuesta máxima, el pago doble de la siete y media natural y cómo cambia la banca.

#### Scenario: Empezar una partida de Siete y media
- **WHEN** el jugador elige la Siete y media en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Siete y media con la configuración elegida

### Requirement: Mesa de la Siete y media
La mesa MUST mostrar quién es la banca, las fichas y la apuesta de cada jugador, las cartas de cada jugador (la tapada boca abajo, salvo la propia, y las pedidas boca arriba) y el valor de la jugada propia. Cuando le toca apostar, el jugador MUST poder elegir su apuesta dentro de los límites y confirmarla. En su turno MUST poder pedir carta o plantarse con botones. La mesa MUST anunciar cuando un jugador pide, se planta o se pasa.

#### Scenario: Turno completo desde la mesa
- **WHEN** el jugador apuesta 5 fichas, pide una carta y se planta
- **THEN** su apuesta queda en la mesa, la carta pedida aparece boca arriba en su jugada y el turno pasa al siguiente

### Requirement: Resultado de la mano de Siete y media
Al terminar cada mano, la mesa MUST mostrar las cartas destapadas de todos, el valor de cada jugada, quién se pasó, cuántas fichas ganó o perdió cada jugador y sus fichas tras la mano. MUST esperar a que el jugador pulse "Siguiente mano" antes de empezar la siguiente.

#### Scenario: Fin de una mano
- **WHEN** la banca se planta y se liquida la mano
- **THEN** el jugador ve las jugadas destapadas de todos con su valor y las fichas ganadas o perdidas, y la partida espera a que pulse "Siguiente mano"
