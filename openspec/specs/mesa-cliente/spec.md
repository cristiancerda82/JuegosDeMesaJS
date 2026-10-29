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
Las jugadas de la IA MUST mostrarse con una pausa y una animación breves para que el jugador pueda seguirlas. Mientras juega la IA, el jugador MUST NOT poder hacer acciones de juego, salvo en los juegos con acciones simultáneas en tiempo real, en los que el jugador y la IA actúan a la vez.

#### Scenario: Jugada de la IA
- **WHEN** es el turno de la IA
- **THEN** su carta se ve salir de su mano hacia la mesa tras una pausa breve, y el jugador no puede jugar hasta que termine

#### Scenario: Juego simultáneo
- **WHEN** en el Burro la IA está a punto de actuar
- **THEN** el jugador puede actuar igualmente, y vale la acción que llegue antes

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

### Requirement: FreeCell en la suite
El menú MUST incluir el FreeCell junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir una partida al azar o una por su número (del 1 al 32.000), el número de celdas y si las cartas van solas a las fundaciones.

#### Scenario: Jugar una partida concreta
- **WHEN** el jugador elige el FreeCell, escribe el número 617 y empieza
- **THEN** se abre la mesa con el reparto de la partida 617 y el número a la vista

### Requirement: Mesa del FreeCell
La mesa MUST mostrar arriba las celdas y las fundaciones, y debajo las 8 columnas con todas sus cartas a la vista. Los movimientos MUST hacerse arrastrando o tocando, como en el Klondike. Al tocar una carta, la mesa resalta los destinos posibles, y con doble toque la carta va a su fundación o, si no puede, a una celda libre. Al arrastrar una carta de una columna se lleva consigo la secuencia que tiene encima, si se puede mover entera. La mesa MUST mostrar el número de partida, los movimientos, el tiempo, cuántas cartas se pueden mover a la vez y los botones de deshacer, autocompletar (cuando esté disponible) y abandonar.

#### Scenario: Mover una secuencia arrastrando
- **WHEN** el jugador arrastra la tercera carta empezando por el final de una columna ordenada, con suficientes celdas libres, sobre una columna válida
- **THEN** las tres cartas se mueven juntas

#### Scenario: Columnas largas en pantallas pequeñas
- **WHEN** una columna tiene más de 12 cartas en una pantalla de 360 × 640
- **THEN** las cartas se solapan más para que la columna quepa sin scroll, y el índice de cada carta sigue a la vista

### Requirement: Cinquillo en la suite
El menú MUST incluir el Cinquillo junto al resto de juegos. Sus opciones MUST permitir elegir, antes de empezar, el número de jugadores (2, 3 o 4) y el número de manos (1, 3 o 5).

#### Scenario: Empezar una partida de Cinquillo
- **WHEN** el jugador elige el Cinquillo en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Cinquillo con la configuración elegida

### Requirement: Mesa del Cinquillo
La mesa MUST mostrar en el centro una fila por palo con su escalera, colocada en su sitio del As al Rey, y los huecos donde se puede jugar. La mano propia MUST resaltar las cartas jugables. El jugador MUST poder jugar una carta arrastrándola a la mesa, tocándola y tocando la mesa, o con doble toque. Cuando solo pueda pasar, la mesa MUST ofrecer un botón «Paso». La mesa MUST anunciar qué juega o si pasa cada rival, y mostrar cuántas cartas le quedan a cada uno.

#### Scenario: Jugar y pasar desde la mesa
- **WHEN** el jugador toca una carta jugable y después la mesa, y en un turno posterior no tiene jugada
- **THEN** la carta aparece en su sitio en la escalera de su palo y, más tarde, el botón «Paso» le permite pasar el turno

### Requirement: Resultado de la mano de Cinquillo
Al terminar cada mano, la mesa MUST mostrar quién ganó, las cartas que le quedaron a cada jugador, los puntos de la mano y los totales. MUST esperar a que el jugador pulse «Siguiente mano» antes de repartir la siguiente.

#### Scenario: Fin de una mano
- **WHEN** un rival se queda sin cartas
- **THEN** el jugador ve quién ganó, las cartas que le quedaron a cada uno y los totales, y la partida espera a que pulse «Siguiente mano»

### Requirement: Pocha en la suite
El menú MUST incluir la Pocha junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (3 o 4), la duración (corta o completa) y si el repartidor puede cuadrar las apuestas.

#### Scenario: Empezar una partida de Pocha
- **WHEN** el jugador elige la Pocha en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Pocha con la configuración elegida

### Requirement: Mesa de la Pocha
La mesa de la Pocha MUST reutilizar la mesa de bazas, con 3 o 4 jugadores y sin parejas. Cuando le toca apostar, el jugador MUST ver un botón por cada apuesta posible y no ver la prohibida. Junto a cada jugador, la mesa MUST mostrar su apuesta y las bazas que lleva en la mano. MUST mostrar también el triunfo, el número de cartas de la mano y su posición en la partida, y los puntos de cada uno.

#### Scenario: Apostar desde la mesa
- **WHEN** al jugador le toca apostar en una mano de 3 cartas
- **THEN** ve botones para 0, 1, 2 y 3 bazas (menos la prohibida si es el repartidor) y, al pulsar uno, su apuesta queda a la vista de todos

### Requirement: Resultado de la mano de Pocha
Al terminar cada mano, la mesa MUST mostrar las apuestas, las bazas hechas, los puntos de la mano y los totales de cada jugador, marcando quién acertó. MUST esperar a que el jugador pulse «Siguiente mano» antes de repartir la siguiente.

#### Scenario: Fin de una mano
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve quién acertó, los puntos de la mano y los totales, y la partida espera a que pulse «Siguiente mano»

### Requirement: Mus en la suite
El menú MUST incluir el Mus junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir entre ocho y cuatro reyes, los puntos de cada juego (30 o 40) y cuántos juegos hacen falta para ganar la partida (1, 2 de 3 o 3 de 5).

#### Scenario: Empezar una partida de Mus
- **WHEN** el jugador elige el Mus en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Mus con la configuración elegida, con el jugador abajo, su compañero enfrente y los rivales a los lados

### Requirement: Mesa del Mus
La mesa del Mus MUST permitir al jugador:
- pedir mus o cortarlo;
- elegir de 1 a 4 cartas tocándolas y descartarlas;
- en su turno de un lance, apostar con botones que muestran solo las acciones legales (pasar, envidar, subir, quiero, no quiero, órdago).

La mesa MUST mostrar:
- el marcador de piedras y juegos de cada pareja;
- quién es mano;
- el lance en curso y el estado de los lances ya jugados;
- el envite pendiente;
- las declaraciones de pares y juego;
- lo último que ha dicho cada jugador.

#### Scenario: Descartar
- **WHEN** en la fase de descarte el jugador toca dos cartas y pulsa «Descartar»
- **THEN** esas dos cartas se cambian por dos nuevas del mazo

#### Scenario: Contestar un envite
- **WHEN** un rival envida a Grande y le toca contestar al jugador
- **THEN** ve los botones «Quiero», «No quiero», de subida y de órdago, y no ve el de pasar

### Requirement: Conteo de la mano en la mesa
Al terminar cada mano, la mesa MUST mostrar un panel con las cartas de los cuatro jugadores y, por cada lance, quién lo ganó y las piedras que cobró cada pareja, y el marcador tras el conteo. Si la mano terminó por un órdago, el panel MUST indicarlo. La partida MUST esperar a que el jugador pulse «Siguiente mano».

#### Scenario: Fin de una mano
- **WHEN** termina el conteo de una mano
- **THEN** el jugador ve las cartas de todos, las piedras de cada lance y el marcador, y la partida espera a que pulse «Siguiente mano»

### Requirement: Spider en la suite
El menú MUST incluir el Spider junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de palos (1, 2 o 4) y si se puede repartir con columnas vacías.

#### Scenario: Empezar una partida de Spider
- **WHEN** el jugador elige el Spider en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Spider con la configuración elegida

### Requirement: Mesa del Spider
La mesa del Spider MUST mostrar las 10 columnas sin scroll horizontal en una pantalla de 360 px de ancho, comprimiendo las cartas boca abajo y las columnas largas para que quepan en la altura.

El jugador MUST poder:
- mover una carta o una escalera arrastrándola o tocándola y tocando el destino; con un doble toque va al mejor destino;
- repartir tocando el mazo;
- deshacer y abandonar.

La mesa MUST resaltar los destinos legales de la carta elegida y mostrar los repartos que quedan, las escaleras completadas, los movimientos y el tiempo.

#### Scenario: Mover una escalera tocando
- **WHEN** el jugador toca la primera carta de una escalera del mismo palo y después una columna en la que encaja
- **THEN** toda la escalera pasa a esa columna

#### Scenario: Repartir
- **WHEN** el jugador toca el mazo
- **THEN** aparece una carta nueva al final de cada columna y quedan menos repartos

### Requirement: Fin del Spider
Al completar las 8 escaleras, la mesa MUST mostrar la victoria con los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Abandonar el Spider
- **WHEN** el jugador abandona y lo confirma
- **THEN** ve la pantalla de partida abandonada con la opción de jugar otra vez

### Requirement: Corazones en la suite
El menú MUST incluir los Corazones junto al resto de juegos. Antes de empezar, sus opciones MUST permitir activar o desactivar el pase de cartas y elegir los puntos con los que termina la partida (100 o 50).

#### Scenario: Empezar una partida de Corazones
- **WHEN** el jugador elige los Corazones en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de los Corazones con la configuración elegida

### Requirement: Mesa de los Corazones
La mesa de los Corazones MUST reutilizar la mesa de bazas con 4 jugadores sin parejas.
- **Pase:** el jugador MUST elegir 3 cartas tocándolas y pulsar «Pasar», viendo a quién se las pasa. Después ve qué cartas ha recibido.
- **Información:** la mesa MUST mostrar los puntos de cada jugador en la mano y en la partida, y si los corazones están rotos.
- **Juego:** las cartas que no se pueden jugar MUST NOT poder jugarse.

#### Scenario: Pasar tres cartas
- **WHEN** en la fase de pase el jugador toca tres cartas y pulsa «Pasar»
- **THEN** esas cartas salen de su mano y, cuando todos han pasado, ve las tres que ha recibido

### Requirement: Resumen de la mano de Corazones
Al terminar cada mano, la mesa MUST mostrar los puntos de la mano y los totales de cada jugador, e indicar si alguien tiró la luna. La partida MUST esperar a que el jugador pulse «Siguiente mano».

#### Scenario: Fin de una mano de Corazones
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve los puntos de la mano y los totales, y la partida espera a que pulse «Siguiente mano»

### Requirement: Pantalla de estadísticas
El menú MUST tener un botón «Estadísticas» que abre una pantalla con:
- una tarjeta por cada juego con alguna partida terminada: jugadas, ganadas, empatadas, perdidas, porcentaje de victorias, racha actual y mejor racha, y en los solitarios el mejor tiempo y el menor número de movimientos;
- el total de partidas jugadas y ganadas.

Sin partidas registradas, MUST mostrar un mensaje que invite a jugar. La pantalla MUST permitir borrar todas las estadísticas, después de confirmarlo, y volver al menú.

#### Scenario: Ver las estadísticas
- **WHEN** el jugador ha ganado una partida de Klondike y abre las estadísticas desde el menú
- **THEN** ve la tarjeta del Klondike con 1 partida jugada, 1 ganada, el 100 % de victorias y su tiempo y movimientos como récords

#### Scenario: Borrar las estadísticas
- **WHEN** el jugador pulsa «Borrar estadísticas» y lo confirma
- **THEN** la pantalla muestra que no hay partidas registradas

### Requirement: Racha y récords en el fin de partida
La pantalla de fin de partida MUST mostrar, debajo del resultado:
- la racha de victorias en curso, cuando el jugador lleva al menos 2 victorias seguidas en ese juego;
- un aviso cuando la partida bate su mejor racha o, en un solitario, su mejor tiempo o su menor número de movimientos.

#### Scenario: Aviso de récord
- **WHEN** el jugador gana un FreeCell con menos movimientos que nunca
- **THEN** la pantalla de fin avisa del nuevo récord de movimientos

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

### Requirement: Elegir el nivel de la IA
Las opciones de cada juego contra la máquina MUST incluir «Nivel de la IA» con tres opciones: Fácil, Normal y Difícil, con Normal por defecto. Cada juego MUST recordar en el dispositivo el último nivel elegido y proponerlo la próxima vez. Todos los rivales de la IA de la partida MUST jugar con el nivel elegido. Los solitarios MUST NOT mostrar esta opción.

#### Scenario: Elegir Difícil
- **WHEN** el jugador elige «Difícil» en las opciones de la Brisca y empieza
- **THEN** el rival juega con la IA difícil, y la próxima vez que abra las opciones de la Brisca aparece «Difícil» elegido

#### Scenario: Solitario sin nivel
- **WHEN** el jugador abre las opciones del Klondike
- **THEN** no hay opción de nivel de la IA

### Requirement: El nivel se guarda con la partida
La partida guardada MUST incluir el nivel de la IA, y al retomarla la IA MUST seguir con ese nivel. Una partida guardada sin nivel (de una versión anterior) MUST retomarse con el nivel Normal.

#### Scenario: Retomar una partida en difícil
- **WHEN** el jugador recarga a mitad de una partida empezada en Difícil y la continúa
- **THEN** la IA sigue jugando en Difícil

### Requirement: Reacción de la IA en el Burro según el nivel
En el Burro, el retraso con el que la IA se planta MUST depender del nivel:
- **Fácil:** más lento que en Normal (aproximadamente entre 2 y 5 segundos).
- **Normal:** como hasta ahora.
- **Difícil:** más rápido (aproximadamente entre 0,6 y 2 segundos).

#### Scenario: Burro en difícil
- **WHEN** en una partida de Burro en Difícil un rival se planta
- **THEN** los demás rivales reaccionan antes, de media, que en Normal

### Requirement: Botón de pista en los solitarios
Las mesas de los solitarios MUST tener un botón «Pista». Al pulsarlo:
- si la pista sugiere un movimiento, MUST resaltar durante unos segundos las cartas que se moverían y el destino; si sugiere robar o repartir, el mazo;
- si no hay pista, MUST mostrar el aviso «No veo ningún movimiento útil: prueba a deshacer».

Cada pulsación con pista MUST sumar una pista usada. La pista MUST NOT hacer el movimiento por el jugador.

#### Scenario: Pedir una pista
- **WHEN** el jugador pulsa «Pista» en el Klondike y hay un As que se puede subir a una fundación
- **THEN** el As y la fundación se resaltan durante unos segundos, la partida no cambia y se cuenta una pista usada

### Requirement: Aviso de atasco
Cuando un solitario está atascado, la mesa MUST mostrar «No quedan movimientos» con los botones Deshacer (si se puede) y Abandonar.

#### Scenario: Atascado
- **WHEN** el jugador llega a una posición sin ningún movimiento posible
- **THEN** ve el aviso «No quedan movimientos» y puede deshacer o abandonar desde él

### Requirement: Pistas usadas en el fin de partida
La pantalla de fin de los solitarios MUST mostrar cuántas pistas se usaron. El número MUST guardarse con la partida y conservarse al retomarla.

#### Scenario: Ganar con pistas
- **WHEN** el jugador gana un Klondike después de pedir dos pistas
- **THEN** la pantalla de fin indica que usó 2 pistas

### Requirement: Pinacle en la suite
El menú MUST incluir el Pinacle junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir 2 jugadores (por defecto) o 4 por parejas, además del nivel de la IA.

#### Scenario: Empezar una partida de Pinacle por parejas
- **WHEN** el jugador elige el Pinacle en el menú, elige 4 jugadores y empieza
- **THEN** se abre la mesa del Pinacle con él, un compañero de la IA enfrente y dos rivales de la IA

### Requirement: Mesa del Pinacle
La mesa del Pinacle MUST mostrar:
- la mano del jugador boca arriba;
- las manos de los demás boca abajo, con su número de cartas y las cartas conocidas que se llevaron del montón;
- el mazo con su número de cartas;
- el montón de descartes con su carta de arriba;
- las combinaciones de cada bando, con los comodines en su puesto;
- los puntos de cada bando y si está barbelé.

Además:
- **Mano:** el jugador MUST poder ordenarla por palos o por números, y verla entera aunque crezca mucho al llevarse el montón, sin scroll horizontal en 360 × 640.
- **Montón:** el jugador MUST poder abrirlo para ver todas sus cartas.
- **Robar:** el jugador roba tocando el mazo o el montón; si no puede llevarse el montón, la mesa MUST decir por qué.
- **Bajar:** el jugador elige cartas de su mano y pulsa «Bajar» para formar una combinación nueva, o toca una combinación de su bando para añadirlas. Si un comodín puede ocupar más de un puesto, la mesa MUST preguntar cuál. Cuando la elección no forma una combinación legal, el botón MUST estar desactivado.
- **Cambiar un comodín:** con la carta natural elegida, tocar el comodín de la mesa MUST hacer el cambio, preguntando a qué extremo va si hay dos.
- **Descartar:** tocar una carta y el montón descarta esa carta.
- **Avisos:** la mesa MUST recordar que hay que bajar la carta de arriba del montón antes de descartar, y avisar del barbelé antes de descartar con una bajada de menos de 70.

#### Scenario: Bajar un grupo
- **WHEN** tras robar, el jugador elige tres reinas de su mano y pulsa «Bajar»
- **THEN** el grupo aparece en la zona de su bando y las reinas salen de su mano

#### Scenario: Elección que no es combinación
- **WHEN** el jugador elige 4♣, 9♥ y K♠
- **THEN** el botón «Bajar» está desactivado

#### Scenario: Mano grande en el móvil
- **WHEN** en una pantalla de 360 × 640 el jugador se lleva un montón de 30 cartas
- **THEN** ve todas las cartas de su mano sin scroll horizontal

### Requirement: Resumen de la mano de Pinacle
Al terminar cada mano del Pinacle, la mesa MUST mostrar para cada bando:
- quién cerró, o que se acabó el mazo;
- sus combinaciones con su valor, marcando las que tienen premio;
- los premios por cerrar y por cambiar comodines;
- lo que resta por las cartas en la mano y la penalización del barbelé, si la hubo;
- el total de la mano y los puntos acumulados.

La partida MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar los puntos de los dos bandos.

#### Scenario: Fin de una mano de Pinacle
- **WHEN** un jugador cierra
- **THEN** el jugador ve el desglose de los dos bandos y la partida espera a que pulse «Siguiente mano»

### Requirement: Jugar en red
El menú MUST incluir «Jugar en red», con dos opciones:
- **Crear sala:** elegir el juego (solo los que tienen IA), sus opciones y el nivel de la IA, con las mismas pantallas de opciones que en local, y un nombre.
- **Unirse:** escribir el código y un nombre.

El nombre se recuerda entre visitas. La pantalla de red MUST mostrar la dirección del servidor, que se puede cambiar y se recuerda. Si no se puede conectar, MUST decirlo con un mensaje claro.

#### Scenario: Crear una sala
- **WHEN** el jugador elige «Jugar en red», «Crear sala», la Brisca, y confirma con su nombre
- **THEN** ve la sala de espera con el código de la sala y su nombre en el asiento 0

#### Scenario: Sin servidor
- **WHEN** el jugador intenta crear una sala y el servidor no responde
- **THEN** ve el aviso «No se puede conectar con el servidor» y puede volver al menú

### Requirement: Sala de espera
La sala de espera MUST mostrar:
- el código de la sala, con un botón para copiarlo;
- el juego y sus opciones;
- cada asiento, con el nombre de quien lo ocupa o «IA» si está libre, y la pareja de cada uno en los juegos por parejas.

Un jugador MUST poder cambiarse a un asiento libre. El anfitrión MUST ver el botón «Empezar»; los demás ven que esperan al anfitrión. Al empezar, todos pasan a la mesa.

#### Scenario: Cambiar de asiento
- **WHEN** en la sala de espera de un Mus un jugador toca un asiento libre
- **THEN** pasa a ese asiento y todos lo ven

### Requirement: Partida en red
La partida en red MUST usar la misma mesa que la partida local, dibujada desde el asiento del jugador. Además, MUST mostrar:
- el nombre de cada jugador, y si está conectado, desconectado o lo juega la IA;
- el código de la sala.

Al recargar la página con una partida en red en marcha, el cliente MUST volver a entrar solo en su asiento. La pantalla de fin MUST ofrecer la revancha al anfitrión, y a los demás esperar la revancha o salir.

#### Scenario: Jugar desde el asiento 1
- **WHEN** un jugador se une a una Brisca de 2 y le toca el asiento 1
- **THEN** ve su mano abajo y la del anfitrión arriba, y su turno se indica como «Tu turno»

#### Scenario: Un rival se desconecta
- **WHEN** el otro jugador cierra su página
- **THEN** su nombre aparece como desconectado y, pasados 10 segundos, como jugado por la IA

### Requirement: Mesas desde cualquier asiento
Todas las mesas de los juegos con IA MUST dibujarse desde el asiento del jugador:
- su mano y su sitio abajo, y los demás alrededor en el orden del juego;
- «Tú» es siempre él, y «Tu pareja» o «Nosotros» es siempre su bando;
- los resúmenes de mano y la pantalla de fin, igual.

En las partidas locales el jugador está en el asiento 0 y no cambia nada.

#### Scenario: Mesa de 4 desde el asiento 2
- **WHEN** un jugador ocupa el asiento 2 de un Mus en red
- **THEN** ve abajo su mano, enfrente al jugador del asiento 0 (su pareja), y a los asientos 3 y 1 a los lados en el orden de juego

### Requirement: Butifarra en la suite
El menú MUST incluir la Butifarra junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el objetivo de la partida (51, 101 por defecto o 151) y el nivel de la IA. El jugador juega en el asiento 0, con un compañero de la IA enfrente y dos rivales de la IA. Como el resto de juegos con IA, la Butifarra MUST poder jugarse en red.

#### Scenario: Empezar una partida de Butifarra
- **WHEN** el jugador elige la Butifarra en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa de la Butifarra con 12 cartas en su mano, su compañero enfrente y la partida a 101

### Requirement: Mesa de la Butifarra
La mesa de la Butifarra MUST reutilizar la mesa de bazas de 4 jugadores por parejas. Además, MUST:
- **Elegir el triunfo:** cuando le toca, el jugador ve un botón por cada palo, uno de «Butifarra» y, si es el repartidor, uno de «Delegar».
- **Contros:** cuando le toca, el jugador ve «Contro», «Recontro» o «Sant Vicenç», según el paso, y «Paso».
- **Información de la mano:** muestra el triunfo (o «Butifarra»), quién lo eligió y si fue delegado, y el multiplicador.
- **Avisos:** muestra lo que deciden los demás jugadores, como el triunfo elegido, un delegado o un contro.
- **Puntos:** muestra los puntos de cada bando en la partida y el objetivo.

#### Scenario: Elegir el triunfo
- **WHEN** al jugador le toca elegir siendo el repartidor
- **THEN** ve los botones de los cuatro palos, «Butifarra» y «Delegar», y al pulsar uno la elección queda a la vista de todos

#### Scenario: Contro desde la mesa
- **WHEN** un rival elige el triunfo y al jugador le toca decidir el contro
- **THEN** ve «Contro» y «Paso» y, si dice contro, el multiplicador de la mano pasa a ×2

### Requirement: Resumen de la mano de Butifarra
Al terminar cada mano, la mesa MUST mostrar:
- el triunfo, quién lo eligió y el multiplicador;
- los puntos de cartas y las bazas de cada bando, y el total de la mano de cada uno;
- lo que se anota cada bando y los totales de la partida.

MUST esperar a que el jugador pulse «Siguiente mano» antes de repartir la siguiente. La pantalla de fin MUST mostrar los puntos de los dos bandos.

#### Scenario: Fin de una mano de Butifarra
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve los puntos de cada bando, lo que se anota el que pasó de 36 con su multiplicador y los totales, y la partida espera a que pulse «Siguiente mano»

### Requirement: Truc en la suite
El menú MUST incluir el Truc junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- 2 jugadores o 4 en parejas (por defecto, 2);
- la partida a dos cames (por defecto) o a una;
- el nivel de la IA.

Como el resto de juegos con IA, el Truc MUST poder jugarse en red.

#### Scenario: Empezar una partida de Truc
- **WHEN** el jugador elige el Truc en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Truc con 3 cartas en su mano y un rival de la IA

### Requirement: Mesa del Truc
La mesa del Truc MUST reutilizar la mesa de bazas.
- **Botones en su turno:** cuando puede, el jugador ve «Envit», el truc que toque («Truc», «Retruc», «Quatre val» o «Joc fora») y «Me'n vaig».
- **Botones al responder:** ante una apuesta, ve «Vull», «No vull», la subida que toque («Torne», «Falta» o la del truc) y, si el envit va primero, «Envit».
- **Información:** muestra lo que vale la mano, el envit aceptado o pendiente, las bazas ganadas y pardas de cada bando, y las piedras y cames de cada bando.
- **Avisos:** avisa de lo que dicen los demás jugadores y, al aceptarse un envit, de los puntos de cada bando.

#### Scenario: Responder a un truc
- **WHEN** el rival de la IA truca
- **THEN** el jugador ve «Vull», «No vull», «Retruc» y «Me'n vaig» y, al pulsar «Vull», la mano pasa a valer 2

### Requirement: Resumen de la mano de Truc
Al terminar cada mano, la mesa MUST mostrar:
- el envit (nivel, si se quiso, puntos de cada bando y quién lo ganó);
- el truc (lo que valía la mano y quién la ganó, o quién se fue);
- las piedras de cada bando, y si se cerró una came.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar las cames de los dos bandos.

#### Scenario: Fin de una mano de Truc
- **WHEN** termina una mano con un envit querido y un truc
- **THEN** el jugador ve los puntos de envit de cada bando, lo que cobra cada uno y las piedras de la came, y la partida espera a que pulse «Siguiente mano»

### Requirement: Julepe en la suite
El menú MUST incluir el Julepe junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el número de jugadores, de 3 a 6 (por defecto, 4);
- el número de manos: 6, 12 (por defecto) o 20;
- el nivel de la IA.

Como el resto de juegos con IA, el Julepe MUST poder jugarse en red.

#### Scenario: Empezar una partida de Julepe
- **WHEN** el jugador elige el Julepe en el menú, elige 6 jugadores y empieza
- **THEN** se abre la mesa del Julepe con 5 cartas en su mano y cinco rivales de la IA

### Requirement: Mesa de bazas con 5 y 6 jugadores
La mesa de bazas MUST admitir 5 y 6 jugadores. Los rivales se reparten así: uno a la derecha, uno a la izquierda y los demás arriba, en el orden de juego (antihorario). Sus nombres son «Rival 1», «Rival 2»… Con 2, 3 y 4 jugadores la mesa no cambia. En 360 × 640 MUST verse entera sin scroll horizontal.

#### Scenario: Seis jugadores en el móvil
- **WHEN** en una pantalla de 360 × 640 empieza una partida de Julepe de 6 jugadores
- **THEN** se ven los cinco rivales y la mano propia sin scroll horizontal

### Requirement: Mesa del Julepe
La mesa del Julepe MUST mostrar:
- la carta de triunfo a la vista;
- el bote;
- las fichas de cada jugador;
- quién juega y quién pasa;
- las bazas de cada uno en la mano;
- el número de la mano.

Según la fase:
- **Decidir:** el jugador ve «Juego» y «Paso». Si está obligado, solo «Juego».
- **Descartar:** el jugador marca las cartas que quiere cambiar y pulsa «Cambiar N» (o «No cambio»). Los demás ven cuántas cartas cambió cada uno.
- **Jugar:** los que pasaron aparecen apagados, sin cartas.

#### Scenario: Descartar desde la mesa
- **WHEN** el jugador juega la mano, marca dos cartas y pulsa «Cambiar 2»
- **THEN** esas dos cartas salen de su mano y entran dos del mazo

### Requirement: Resumen de la mano de Julepe
Al terminar cada mano, la mesa MUST mostrar:
- quién jugó;
- las bazas de cada uno;
- lo que cobró y lo que pagó de julepe cada uno;
- el bote;
- las fichas tras la mano, marcando a los eliminados.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por fichas.

#### Scenario: Fin de una mano de Julepe
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve quién cobró y quién pagó julepe y las fichas de cada uno, y la partida espera a que pulse «Siguiente mano»

### Requirement: Remigio en la suite
El menú MUST incluir el Remigio junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 5 (por defecto, 2), y el nivel de la IA. Como el resto de juegos con IA, el Remigio MUST poder jugarse en red.

#### Scenario: Empezar una partida de Remigio
- **WHEN** el jugador elige el Remigio en el menú, elige 4 jugadores y empieza
- **THEN** se abre la mesa del Remigio con 7 cartas en su mano y tres rivales de la IA

### Requirement: Mesa del Remigio
La mesa del Remigio MUST mostrar:
- la mano del jugador boca arriba, que se puede ordenar por palos o por números;
- los rivales con su número de cartas y sus puntos;
- el mazo con su número de cartas y el montón con su carta de arriba;
- las combinaciones de cada jugador, con los comodines en su puesto.

El jugador juega su turno así:
- **Robar:** toca el mazo o el montón.
- **Bajar:** elige cartas y pulsa «Bajar». Si un comodín puede ocupar más de un puesto, la mesa pregunta cuál. Si la elección no es una combinación, el botón está desactivado.
- **Añadir:** toca una combinación de cualquier jugador con cartas elegidas. Solo es posible si ya ha bajado en la mano.
- **Cambiar un comodín:** con la carta natural elegida, toca el comodín de la mesa.
- **Descartar:** toca una carta y el montón.

#### Scenario: Bajar una escalera
- **WHEN** tras robar, el jugador elige el 4, el 5 y el 6 de oros y pulsa «Bajar»
- **THEN** la escalera aparece en su zona de la mesa y las cartas salen de su mano

#### Scenario: Añadir a la combinación de un rival
- **WHEN** el jugador ya ha bajado, elige el 7 de copas y toca la escalera del 4 al 6 de copas de un rival
- **THEN** el 7 de copas se añade a esa escalera

### Requirement: Resumen de la mano de Remigio
Al terminar cada mano, la mesa MUST mostrar:
- quién cerró y si fue con remigio;
- los puntos de la mano de cada jugador, con las cartas que le quedaron;
- los totales, marcando a los eliminados.

MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por puntos.

#### Scenario: Fin de una mano de Remigio
- **WHEN** un rival cierra con remigio
- **THEN** el jugador ve que fue remigio, sus puntos dobles y los totales, y la partida espera a que pulse «Siguiente mano»

### Requirement: Tute subastado en la suite
El menú MUST incluir el Tute subastado junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el número de manos: 4, 8 (por defecto) o 12;
- el nivel de la IA.

Siempre se juega con 4 jugadores. Como el resto de juegos con IA, el Tute subastado MUST poder jugarse en red.

#### Scenario: Empezar una partida de Tute subastado
- **WHEN** el jugador elige el Tute subastado en el menú y empieza
- **THEN** se abre su mesa con 10 cartas en la mano, tres rivales de la IA y la subasta en marcha

### Requirement: Mesa del Tute subastado
La mesa del Tute subastado MUST usar la mesa de bazas de 4 y mostrar además:
- la puja vigente y quién la hizo, y quién ha pasado;
- cuando hay pujador, el triunfo y los puntos que lleva el pujador frente a lo que pujó;
- los cantes de la mano;
- las fichas de cada jugador;
- el número de la mano.

Según la fase:
- **Subasta:** en su turno, el jugador ve «Paso» y las pujas que puede hacer, de la mínima a la máxima, sin scroll horizontal en 360 × 640.
- **Triunfo:** si es el pujador, elige el palo con cuatro botones.
- **Bazas:** juega sus cartas como en el Tute, con las no jugables apagadas, y ve los botones de cantar cuando puede.

#### Scenario: Pujar desde la mesa
- **WHEN** le toca hablar al jugador, nadie ha pujado y pulsa «60»
- **THEN** la mesa muestra que la puja vigente es 60 y es suya

#### Scenario: Elegir el triunfo desde la mesa
- **WHEN** el jugador gana la subasta y pulsa «Copas»
- **THEN** el triunfo es copas y le toca salir

### Requirement: Resumen de la mano del Tute subastado
Al terminar cada mano, la mesa MUST mostrar:
- el pujador, su puja y el triunfo;
- los puntos del pujador y los de los defensores, y si hubo tute;
- si el pujador cumplió;
- lo que ganó o perdió cada jugador y sus fichas tras la mano.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por fichas.

#### Scenario: Fin de una mano de Tute subastado
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve si el pujador cumplió y las fichas de cada uno, y la partida espera a que pulse «Siguiente mano»

### Requirement: Cuatrola en la suite
El menú MUST incluir la Cuatrola junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el número de manos: 4, 8 (por defecto) o 12;
- el nivel de la IA.

Siempre se juega con 4 jugadores. Como el resto de juegos con IA, la Cuatrola MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cuatrola
- **WHEN** el jugador elige la Cuatrola en el menú y empieza
- **THEN** se abre su mesa con 10 cartas en la mano, tres rivales de la IA y la subasta en marcha

### Requirement: Mesa de la Cuatrola
La mesa de la Cuatrola MUST usar la mesa de bazas de 4 y mostrar además:
- lo que ha dicho cada jugador en la subasta;
- cuando hay jugador, su modalidad, el triunfo y la carta llamada;
- el compañero, en cuanto se descubre (y al propio jugador, si tiene la carta llamada);
- las bazas que llevan el jugador con su compañero y los defensores;
- las fichas de cada jugador;
- el número de la mano.

Según la fase:
- **Subasta:** en su turno, el jugador ve «Paso» y las modalidades que puede pujar, «Con rey» y «Solo».
- **Triunfo:** si es el jugador, elige el palo con cuatro botones y, si juega con rey, la carta que llama.
- **Bazas:** juega sus cartas con las no jugables apagadas.

#### Scenario: Pujar con rey y llamar
- **WHEN** el jugador puja «Con rey», gana la subasta, elige oros y llama el Rey de copas
- **THEN** la mesa muestra el triunfo de oros y el Rey de copas llamado

#### Scenario: Saber que eres el compañero
- **WHEN** un rival juega con rey y llama un rey que tiene el jugador
- **THEN** la mesa le indica que es el compañero

### Requirement: Resumen de la mano de Cuatrola
Al terminar cada mano, la mesa MUST mostrar:
- el jugador, la modalidad, el triunfo, la carta llamada y el compañero;
- las bazas de cada bando, si ganó el jugador y si hubo bola;
- lo que ganó o perdió cada jugador y sus fichas tras la mano.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por fichas.

#### Scenario: Fin de una mano de Cuatrola
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve si el jugador ganó y las fichas de cada uno, y la partida espera a que pulse «Siguiente mano»

### Requirement: Pirámide en la suite
El menú MUST incluir la Pirámide junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir cuántas veces se recorre el mazo: 3 (por defecto), 1 o sin límite.

#### Scenario: Empezar una partida de Pirámide
- **WHEN** el jugador elige la Pirámide en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Pirámide con la configuración elegida

### Requirement: Mesa de la Pirámide
La mesa de la Pirámide MUST mostrar la pirámide entera sin scroll horizontal en una pantalla de 360 × 640, con las cartas de cada fila solapando a las de la fila de arriba, y debajo el mazo y el descarte.

El jugador MUST poder:
- quitar una pareja tocando las dos cartas, una tras otra, y una K tocándola;
- cancelar la selección tocando otra vez la carta elegida;
- robar tocando el mazo y dar la vuelta al descarte tocando el mazo vacío;
- deshacer, abandonar y pedir una pista.

Las cartas libres MUST distinguirse de las tapadas. La mesa MUST resaltar la carta elegida y mostrar los movimientos, el tiempo y las vueltas que quedan. Si la partida se atasca, MUST avisar como en el resto de solitarios.

#### Scenario: Quitar una pareja tocando
- **WHEN** el jugador toca un 9 libre y después un 4 libre
- **THEN** las dos cartas desaparecen y los movimientos suben en uno

#### Scenario: Pareja que no suma 13
- **WHEN** el jugador toca un 9 libre y después un 5 libre
- **THEN** no se quita nada y queda elegido el 5

### Requirement: Fin de la Pirámide
Al vaciar la pirámide, la mesa MUST mostrar la victoria con los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar la Pirámide
- **WHEN** el jugador quita la última carta de la pirámide
- **THEN** ve la pantalla de victoria con sus movimientos y su tiempo

### Requirement: Golf en la suite
El menú MUST incluir el Golf junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir si la K y el As se tocan (con vuelta) o no (sin vuelta, por defecto).

#### Scenario: Empezar una partida de Golf
- **WHEN** el jugador elige el Golf en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Golf con la configuración elegida

### Requirement: Mesa del Golf
La mesa del Golf MUST mostrar las 7 columnas sin scroll horizontal en una pantalla de 360 × 640, con las cartas de cada columna solapadas de modo que se vea el índice de todas, y debajo el mazo y el descarte.

El jugador MUST poder:
- mover una carta al descarte tocándola;
- robar tocando el mazo;
- deshacer, abandonar y pedir una pista.

Las cartas que se pueden mover MUST distinguirse de las demás. La mesa MUST mostrar los movimientos, el tiempo y las cartas que quedan en el mazo. Si la partida se atasca, MUST avisar como en el resto de solitarios.

#### Scenario: Mover tocando
- **WHEN** el jugador toca la última carta de una columna que vale una más que la del descarte
- **THEN** la carta pasa al descarte y los movimientos suben en uno

#### Scenario: Una carta que no se puede mover
- **WHEN** el jugador toca una carta que no se puede mover
- **THEN** no cambia nada

### Requirement: Fin del Golf
Al vaciar las columnas, la mesa MUST mostrar la victoria con los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Golf
- **WHEN** el jugador mueve la última carta de las columnas
- **THEN** ve la pantalla de victoria con sus movimientos y su tiempo

### Requirement: Mentiroso en la suite
El menú MUST incluir el Mentiroso junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 3 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Mentiroso MUST poder jugarse en red.

#### Scenario: Empezar una partida de Mentiroso
- **WHEN** el jugador elige el Mentiroso en el menú y empieza con 4 jugadores
- **THEN** se abre su mesa con 13 cartas en la mano y tres rivales de la IA

### Requirement: Mesa del Mentiroso
La mesa del Mentiroso MUST mostrar:
- los rivales con su número de cartas;
- el montón con su número de cartas y el valor que toca declarar;
- la última bajada («Rival 2: 3 sietes»);
- la mano propia ordenada por valor.

En su turno, el jugador:
- elige de 1 a 4 cartas de su mano y pulsa «Bajar N»;
- si hay una bajada anterior, puede pulsar antes «¡Mentiroso!»;
- si el anterior se quedó sin cartas, solo ve «Me lo creo» y «¡Mentiroso!».

Al desconfiar, MUST verse un momento las cartas descubiertas y quién se lleva el montón. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Bajar desde la mesa
- **WHEN** al jugador le toca declarar Ases, elige dos cartas y pulsa «Bajar 2»
- **THEN** las cartas salen de su mano, el montón crece en 2 y la mesa muestra «Tú: 2 Ases»

#### Scenario: Desconfiar desde la mesa
- **WHEN** un rival acaba de bajar y el jugador pulsa «¡Mentiroso!»
- **THEN** ve las cartas descubiertas y quién se lleva el montón

### Requirement: Fin del Mentiroso
Al terminar, la pantalla de fin MUST mostrar quién se ha quedado sin cartas y cuántas le quedaron a cada uno de los demás.

#### Scenario: Ganar el Mentiroso
- **WHEN** el jugador baja sus últimas cartas y el siguiente le cree
- **THEN** ve la pantalla de victoria con las cartas que les quedaron a los rivales

### Requirement: Ocho loco en la suite
El menú MUST incluir el Ocho loco junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 5 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Ocho loco MUST poder jugarse en red.

#### Scenario: Empezar una partida de Ocho loco
- **WHEN** el jugador elige el Ocho loco en el menú y empieza con 4 jugadores
- **THEN** se abre su mesa con 5 cartas en la mano, tres rivales de la IA y una carta en el descarte

### Requirement: Mesa del Ocho loco
La mesa del Ocho loco MUST mostrar:
- los rivales con su número de cartas y su última acción;
- el mazo con su número de cartas;
- el descarte con la carta de arriba y el palo que toca, destacado cuando lo eligió un 8;
- la mano propia, con las cartas jugables destacadas en su turno;
- los puntos de cada jugador.

En su turno, el jugador:
- toca una carta jugable para jugarla;
- al jugar un 8, elige el palo entre cuatro botones;
- si no tiene jugables, pulsa «Robar»; con la carta robada, puede jugarla o pulsar «Pasar».

Al terminar cada mano, MUST verse un resumen con quién la ganó, los puntos de lo que le quedó a cada uno y los totales, antes de repartir la siguiente. La mesa MUST caber en 360 × 640 sin scroll horizontal con 5 jugadores.

#### Scenario: Jugar un 8 desde la mesa
- **WHEN** el jugador toca un 8 de su mano y elige corazones
- **THEN** el 8 queda arriba del descarte y la mesa muestra que toca corazones

#### Scenario: Robar y pasar desde la mesa
- **WHEN** el jugador no tiene jugables, pulsa «Robar» y la carta robada no casa
- **THEN** la carta entra en su mano y solo puede pulsar «Pasar»

### Requirement: Fin del Ocho loco
Al terminar, la pantalla de fin MUST mostrar quién llegó a 100 y los puntos de cada jugador.

#### Scenario: Ganar el Ocho loco
- **WHEN** el jugador llega a 100 puntos al ganar una mano
- **THEN** ve la pantalla de victoria con los puntos de todos

### Requirement: Picas en la suite
El menú MUST incluir Picas junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. Como el resto de juegos con IA, Picas MUST poder jugarse en red.

#### Scenario: Empezar una partida de Picas
- **WHEN** el jugador elige Picas en el menú y empieza
- **THEN** se abre su mesa con 13 cartas en la mano, un compañero enfrente y dos rivales de la IA

### Requirement: Mesa de Picas
La mesa de Picas MUST usar la mesa de bazas compartida y mostrar:
- junto a cada jugador, su apuesta y las bazas que lleva en la mano («3 / 1»), o «Nil»;
- en la barra de información, el contrato y las bazas de cada pareja, los puntos y los sacos de cada pareja, y si las picas están rotas;
- la baza en curso y la última baza.

Cuando le toca apostar, el jugador MUST ver una ventana con su mano y botones para Nil y de 1 a 13, con las apuestas de los que ya hablaron. Durante las bazas solo MUST poder tocar las cartas legales.

Al terminar cada mano, MUST verse un resumen con las apuestas, las bazas, los puntos de cada pareja, los sacos y los totales, antes de repartir la siguiente.

#### Scenario: Apostar desde la mesa
- **WHEN** al jugador le toca apostar y pulsa «4»
- **THEN** su apuesta aparece junto a su nombre y le toca al siguiente

#### Scenario: Salir sin picas rotas
- **WHEN** al jugador le toca salir, las picas no están rotas y tiene otras cartas
- **THEN** sus picas no se pueden tocar

### Requirement: Fin de Picas
Al terminar, la pantalla de fin MUST mostrar qué pareja ganó, con los puntos de las dos y el resumen de la última mano.

#### Scenario: Ganar Picas
- **WHEN** la pareja del jugador llega a 500 puntos con más que la otra
- **THEN** ve la pantalla de victoria con los puntos de las dos parejas

### Requirement: TriPeaks en la suite
El menú MUST incluir TriPeaks junto al resto de juegos. No tiene opciones de reglas: al elegirlo se MUST poder empezar directamente.

#### Scenario: Empezar una partida de TriPeaks
- **WHEN** el jugador elige TriPeaks en el menú y empieza
- **THEN** se abre la mesa de TriPeaks con los tres picos repartidos

### Requirement: Mesa de TriPeaks
La mesa de TriPeaks MUST mostrar los tres picos con sus cartas solapadas como en una pirámide, las boca abajo con su dorso, y debajo el mazo y el descarte. MUST caber sin scroll horizontal en una pantalla de 360 × 640.

El jugador MUST poder:
- quitar una carta tocándola;
- robar tocando el mazo;
- deshacer, abandonar y pedir una pista.

Las cartas que se pueden quitar MUST distinguirse de las demás. La mesa MUST mostrar los movimientos, el tiempo, las cartas que quedan en el mazo, los puntos y la racha en curso. Si la partida se atasca, MUST avisar como en el resto de solitarios.

#### Scenario: Quitar tocando
- **WHEN** el jugador toca una carta sin nada encima que vale una más que la del descarte
- **THEN** la carta pasa al descarte y los puntos y la racha suben

#### Scenario: Una carta que no se puede quitar
- **WHEN** el jugador toca una carta que no encaja o que está tapada
- **THEN** no cambia nada

### Requirement: Fin de TriPeaks
Al despejar los tres picos, la mesa MUST mostrar la victoria con los puntos, los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada con los puntos conseguidos.

#### Scenario: Ganar TriPeaks
- **WHEN** el jugador quita la última carta de los picos
- **THEN** ve la pantalla de victoria con sus puntos, sus movimientos y su tiempo

### Requirement: Blackjack en la suite
El menú MUST incluir el Blackjack junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (de 1 a 4; 2 por defecto), el número de manos (5, 10 o 20; 10 por defecto) y el nivel de la IA. Como el resto de juegos con IA, el Blackjack MUST poder jugarse en red.

#### Scenario: Empezar una partida de Blackjack
- **WHEN** el jugador elige el Blackjack en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con la banca, un rival de la IA y los botones para apostar

### Requirement: Mesa del Blackjack
La mesa del Blackjack MUST mostrar:
- arriba, la banca con sus cartas (la tapada con su dorso) y su valor cuando se conoce;
- cada jugador con sus manos, el valor de cada una, su apuesta y sus fichas, con la mano que se juega destacada;
- las manos jugadas y las que quedan.

En la apuesta, el jugador MUST ver botones con las apuestas legales (de 2 a 20). En su turno, MUST ver los botones «Pedir», «Plantarse» y, cuando se pueda, «Doblar» y «Separar». Al terminar cada mano MUST verse un resumen con las cartas de la banca y lo que gana o pierde cada mano, antes de la siguiente. La mesa MUST caber en 360 × 640 sin scroll horizontal con 4 jugadores.

#### Scenario: Pedir desde la mesa
- **WHEN** al jugador le toca y pulsa «Pedir»
- **THEN** recibe una carta y el valor de su mano se actualiza

#### Scenario: Separar desde la mesa
- **WHEN** el jugador tiene una pareja y pulsa «Separar»
- **THEN** la mesa muestra sus dos manos y destaca la que juega

### Requirement: Fin del Blackjack
Al terminar, la pantalla de fin MUST mostrar las fichas de cada jugador ordenadas de más a menos y el resumen de la última mano.

#### Scenario: Ganar el Blackjack
- **WHEN** acaba la última mano y el jugador es quien más fichas tiene
- **THEN** ve la pantalla de victoria con las fichas de todos

### Requirement: Gin Rummy en la suite
El menú MUST incluir el Gin Rummy junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. Como el resto de juegos con IA, el Gin Rummy MUST poder jugarse en red.

#### Scenario: Empezar una partida de Gin Rummy
- **WHEN** el jugador elige el Gin Rummy en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con su mano de 10 cartas, el mazo, el descarte y el botón para pasar la primera carta

### Requirement: Mesa del Gin Rummy
La mesa del Gin Rummy MUST mostrar:
- arriba, el rival con el número de cartas que tiene y, a la vista, las que cogió del descarte;
- en el centro, el mazo con las cartas que quedan y el descarte con su carta de arriba;
- abajo, la mano propia ordenada con sus combinaciones juntas y marcadas, y sus puntos sueltos;
- los puntos y manos ganadas de cada jugador.

Como en el Chinchón, el jugador MUST robar tocando (o arrastrando) el mazo o el descarte, y descartar eligiendo una carta de su mano y pulsando «Descartar» o arrastrándola al descarte. Con la carta elegida MUST ver también el botón «Cerrar» (o «¡Gin!» si cierra sin puntos sueltos), activo solo si con esa carta se puede cerrar. Al terminar cada mano MUST verse un resumen con las dos manos destapadas, lo colocado y los puntos, antes de la siguiente. La mesa MUST caber en 360 × 640 sin scroll horizontal con 11 cartas en la mano.

#### Scenario: Robar y descartar desde la mesa
- **WHEN** al jugador le toca, toca el mazo, elige una carta de su mano y pulsa «Descartar»
- **THEN** roba una carta y la carta elegida pasa al descarte

#### Scenario: Cerrar desde la mesa
- **WHEN** el jugador elige una carta con la que puede cerrar y pulsa «Cerrar»
- **THEN** la mano termina y ve el resumen con las dos manos destapadas

### Requirement: Fin del Gin Rummy
Al terminar, la pantalla de fin MUST mostrar el marcador final de cada jugador desglosado (puntos, bonos por mano, bono de partida y si se dobla) y el resumen de la última mano.

#### Scenario: Ganar el Gin Rummy
- **WHEN** acaba la mano en la que el jugador llega a 100
- **THEN** ve la pantalla de victoria con el marcador final desglosado

### Requirement: Yukon en la suite
El menú MUST incluir el Yukon junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir cómo se construye en las columnas: por colores alternos (por defecto) o por palo (Solitario ruso).

#### Scenario: Empezar una partida de Yukon
- **WHEN** el jugador elige el Yukon en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Yukon con las 7 columnas repartidas y las 4 fundaciones vacías

### Requirement: Mesa del Yukon
La mesa del Yukon MUST mostrar las 4 fundaciones arriba y las 7 columnas debajo, con las cartas boca abajo con su dorso y las boca arriba solapadas de forma que se vea el valor de cada una. MUST caber sin scroll horizontal en una pantalla de 360 × 640.

Como en el Klondike, el jugador MUST poder:
- mover cualquier carta boca arriba con todo lo que tiene encima, arrastrándola o tocándola y tocando el destino;
- subir una carta a las fundaciones con un doble toque;
- deshacer, autocompletar cuando se pueda, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, y avisar si la partida se atasca, como en el resto de solitarios.

#### Scenario: Mover un grupo desde la mesa
- **WHEN** el jugador arrastra una carta boca arriba del medio de una columna sobre una carta en la que encaja
- **THEN** esa carta y todas las que tenía encima pasan a la otra columna

#### Scenario: Doble toque a la fundación
- **WHEN** el jugador hace doble toque en un as que es la última carta de su columna
- **THEN** el as sube a una fundación

### Requirement: Fin del Yukon
Al subir las 52 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Yukon
- **WHEN** la última carta sube a una fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo

### Requirement: Rummy 500 en la suite
El menú MUST incluir el Rummy 500 junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 4 (por defecto, 2), y el nivel de la IA. Como el resto de juegos con IA, el Rummy 500 MUST poder jugarse en red.

#### Scenario: Empezar una partida de Rummy 500
- **WHEN** el jugador elige el Rummy 500 en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Rummy 500 con 13 cartas en su mano y un rival de la IA

### Requirement: Mesa del Rummy 500
La mesa del Rummy 500 MUST mostrar:
- la mano del jugador boca arriba, que se puede ordenar por palos o por números;
- los rivales con su número de cartas y sus puntos;
- el mazo con su número de cartas y el descarte abierto en abanico, con todas sus cartas;
- las combinaciones de la mesa, marcando las cartas que puso cada jugador;
- la carta obligada pendiente, si la hay.

Como en el Remigio, el jugador juega su turno así:
- **Robar:** toca el mazo, o toca una carta del descarte para cogerla con todas las de encima. Las cartas del descarte desde las que no se puede coger no responden.
- **Bajar:** elige cartas y pulsa «Bajar». Si la elección no es una combinación, el botón está desactivado.
- **Añadir:** con una carta elegida, toca una combinación de la mesa.
- **Descartar:** elige una carta y pulsa «Descartar», o la arrastra al descarte.

La mesa MUST caber en 360 × 640 sin scroll horizontal con 4 jugadores.

#### Scenario: Coger varias del descarte
- **WHEN** el jugador toca una carta del descarte que tiene otras dos encima y puede usar
- **THEN** las tres pasan a su mano y la mesa le avisa de que tiene que usar la de más abajo

#### Scenario: Bajar una escalera
- **WHEN** tras robar, el jugador elige el 4, el 5 y el 6 de diamantes y pulsa «Bajar»
- **THEN** la escalera aparece en la mesa marcada como suya y las cartas salen de su mano

### Requirement: Resumen de la mano y fin del Rummy 500
Al terminar cada mano, la mesa MUST mostrar quién cerró (o que se acabó el mazo) y, de cada jugador, los puntos bajados, los que le quedaron en la mano, los de la mano y el total, y esperar a que pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar los puntos de cada jugador ordenados y el resumen de la última mano.

#### Scenario: Fin de una mano de Rummy 500
- **WHEN** un rival descarta su última carta
- **THEN** el jugador ve el resumen con los puntos de cada uno, y la partida espera a que pulse «Siguiente mano»

### Requirement: Canfield en la suite
El menú MUST incluir el Canfield junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir si se roba de 3 en 3 (por defecto) o de 1 en 1.

#### Scenario: Empezar una partida de Canfield
- **WHEN** el jugador elige el Canfield en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Canfield con la reserva, el mazo, la primera fundación con la base y las 4 columnas

### Requirement: Mesa del Canfield
La mesa del Canfield MUST mostrar:
- arriba, el mazo, el descarte y las 4 fundaciones, con la base a la vista;
- debajo, la reserva con su carta de arriba y cuántas quedan, y las 4 columnas con las cartas solapadas de forma que se vea el valor de cada una.

Como en el Klondike, el jugador MUST poder robar tocando el mazo; mover cartas y tramos arrastrándolos o tocándolos y tocando el destino; subir una carta a las fundaciones con un doble toque; y deshacer, autocompletar cuando se pueda, abandonar y pedir una pista. La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Jugar la reserva
- **WHEN** el jugador toca la carta de arriba de la reserva y luego una columna en la que encaja
- **THEN** la carta pasa a esa columna y se descubre la siguiente de la reserva

#### Scenario: Doble toque a la fundación
- **WHEN** el jugador hace doble toque en una carta del número base que es la última de su columna
- **THEN** la carta sube a una fundación vacía

### Requirement: Fin del Canfield
Al subir las 52 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Canfield
- **WHEN** la última carta sube a una fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo

### Requirement: Texas Hold'em en la suite
El menú MUST incluir el Texas Hold'em junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Texas Hold'em MUST poder jugarse en red.

#### Scenario: Empezar una partida de Texas Hold'em
- **WHEN** el jugador elige el Texas Hold'em en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus dos cartas, tres rivales de la IA y las ciegas puestas

### Requirement: Mesa del Texas Hold'em
La mesa del Texas Hold'em MUST mostrar:
- los rivales, con sus fichas, su apuesta en la ronda, si se han retirado o van all-in y quién tiene el botón; sus cartas, tapadas salvo en el showdown;
- en el centro, las cartas comunes, el bote y los botes secundarios, y las ciegas y la mano;
- abajo, las dos cartas propias, sus fichas y su apuesta.

En su turno, el jugador MUST ver los botones «Retirarse», «Pasar» o «Igualar N», y «Apostar» o «Subir», con un selector de cantidad entre el mínimo y todas sus fichas y atajos para el mínimo, medio bote, el bote y all-in. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Igualar desde la mesa
- **WHEN** al jugador le toca con una apuesta de 6 que igualar y pulsa «Igualar 6»
- **THEN** su apuesta en la ronda pasa a 6 y sus fichas bajan en lo que puso

#### Scenario: Subir con el atajo del bote
- **WHEN** al jugador le toca, pulsa el atajo «Bote» y después «Subir»
- **THEN** sube a la cantidad que da el bote

### Requirement: Resumen de la mano y fin del Texas Hold'em
Al terminar cada mano, la mesa MUST mostrar las cartas comunes, las manos enseñadas con el nombre de su jugada y quién se lleva cada bote y cuánto, y esperar a que el jugador pulse «Siguiente mano». Si la mano se ganó sin showdown, MUST decir quién se llevó el bote sin enseñar. Al terminar la partida, la pantalla de fin MUST mostrar la clasificación por orden de eliminación.

#### Scenario: Showdown en la mesa
- **WHEN** dos jugadores llegan al river y se enseñan las manos
- **THEN** el resumen muestra las dos manos, su jugada (por ejemplo «Doble pareja») y quién gana el bote

### Requirement: Culo en la suite
El menú MUST incluir el Culo junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 3 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Culo MUST poder jugarse en red.

#### Scenario: Empezar una partida de Culo
- **WHEN** el jugador elige el Culo en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 10 cartas ordenadas de menor a mayor y tres rivales de la IA

### Requirement: Mesa del Culo
La mesa del Culo MUST mostrar:
- los rivales, con cuántas cartas tienen, su cargo de la mano anterior, si han pasado en la ronda y, si ya han salido, su puesto;
- en el centro, la jugada que hay que superar y quién la hizo, y la mano que se juega;
- abajo, la mano propia ordenada de menor a mayor.

En su turno, el jugador MUST poder marcar cartas de su mano y pulsar «Jugar», que solo se activa si las marcadas forman una jugada legal, o «Pasar» si puede pasar. Cuando hay una jugada que superar, al tocar una carta la mesa MUST marcar también otras de su valor hasta el número de cartas que pide la ronda, para que superar sea un solo toque más; al abrir, cada toque marca o desmarca una sola carta. En el intercambio, el presidente o el vicepresidente MUST marcar las cartas que devuelve y pulsar «Devolver»; los demás ven qué intercambio se está haciendo. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Superar desde la mesa
- **WHEN** la jugada que hay que superar son dos cincos y el jugador toca uno de sus dos sietes
- **THEN** quedan marcados los dos sietes, se activa «Jugar», y al pulsarlo pasan al centro

#### Scenario: Devolver en el intercambio
- **WHEN** empieza la segunda mano, el jugador es el presidente, marca dos cartas y pulsa «Devolver»
- **THEN** esas cartas salen de su mano y empieza la mano

### Requirement: Resumen de la mano y fin del Culo
Al terminar cada mano, la mesa MUST mostrar el orden de salida con el cargo y los puntos de cada uno y el marcador, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar la clasificación con los puntos de cada uno.

#### Scenario: Resumen tras una mano
- **WHEN** termina la primera mano
- **THEN** el resumen muestra quién es presidente y quién es culo, con sus puntos, y el marcador de la partida

### Requirement: Canasta en la suite
El menú MUST incluir la Canasta junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre con 4 jugadores en parejas, con el compañero de la IA enfrente. Como el resto de juegos con IA, la Canasta MUST poder jugarse en red.

#### Scenario: Empezar una partida de Canasta
- **WHEN** el jugador elige la Canasta en el menú y empieza
- **THEN** se abre su mesa con sus 11 cartas, su compañero enfrente, los dos rivales a los lados y el pozo con una carta

### Requirement: Mesa de la Canasta
La mesa de la Canasta MUST mostrar:
- los demás jugadores, con cuántas cartas tienen;
- las combinaciones de cada pareja, agrupadas por valor, con cuántas cartas tienen, y las canastas marcadas como limpias o sucias;
- los treses rojos de cada pareja;
- el pozo, con la carta de arriba, cuántas cartas tiene y si está congelado o tapado; el mazo, con cuántas cartas quedan;
- el marcador y, mientras su pareja no ha bajado, el mínimo de la primera bajada y lo que lleva bajado en el turno;
- abajo, la mano propia ordenada por valor.

En su turno, el jugador MUST poder:
- robar del mazo o, si puede, llevarse el pozo, marcando antes las cartas de la mano que van con la carta de arriba;
- marcar cartas de su mano y bajarlas como combinación nueva, o añadirlas a una combinación de su pareja tocándola;
- deshacer lo bajado en el turno mientras no llega al mínimo;
- descartar una carta marcada.

Los botones MUST activarse solo cuando las cartas marcadas forman una jugada legal. La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Bajar desde la mesa
- **WHEN** la pareja del jugador ya ha bajado y él marca tres jotas y pulsa «Bajar»
- **THEN** aparece una combinación de jotas de su pareja y las tres jotas salen de su mano

#### Scenario: Llevarse el pozo desde la mesa
- **WHEN** arriba del pozo hay un 6, el jugador marca dos seises de su mano y pulsa «Coger el pozo»
- **THEN** su pareja tiene una combinación de seises y las demás cartas del pozo pasan a su mano

### Requirement: Resumen de la mano y fin de la Canasta
Al terminar cada mano, la mesa MUST mostrar el desglose de cada pareja: cartas bajadas, canastas, treses rojos, cierre, cartas en la mano, el total de la mano y el marcador. Después MUST esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último desglose y el marcador final.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra el desglose de las dos parejas y el marcador

### Requirement: Cuarenta ladrones en la suite
El menú MUST incluir Cuarenta ladrones junto al resto de juegos. No tiene opciones: se empieza directamente.

#### Scenario: Empezar una partida de Cuarenta ladrones
- **WHEN** el jugador elige Cuarenta ladrones en el menú y empieza
- **THEN** se abre su mesa con el mazo, el descarte, las 8 fundaciones y las 10 columnas de 4 cartas

### Requirement: Mesa de Cuarenta ladrones
La mesa de Cuarenta ladrones MUST mostrar:
- arriba, el mazo con cuántas cartas quedan, el descarte y las 8 fundaciones;
- debajo, las 10 columnas, con las cartas solapadas de forma que se vea el valor de cada una.

Como en el Klondike, el jugador MUST poder:
- robar tocando el mazo;
- mover cartas y tramos, arrastrándolos o tocándolos y tocando el destino;
- subir una carta a las fundaciones con un doble toque;
- deshacer, autocompletar cuando se pueda, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Mover una carta
- **WHEN** el jugador toca el 7 de picas al final de una columna y luego una columna que acaba en el 8 de picas
- **THEN** el 7 pasa a esa columna

#### Scenario: Doble toque a la fundación
- **WHEN** el jugador hace doble toque en un As que es la última carta de su columna
- **THEN** el As sube a una fundación vacía

### Requirement: Fin de Cuarenta ladrones
Al subir las 104 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar Cuarenta ladrones
- **WHEN** la última carta sube a una fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo

### Requirement: Whist en la suite
El menú MUST incluir el Whist junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre con 4 jugadores en parejas, con el compañero enfrente. Como el resto de juegos con IA, el Whist MUST poder jugarse en red.

#### Scenario: Empezar una partida de Whist
- **WHEN** el jugador elige el Whist en el menú y empieza
- **THEN** se abre su mesa con sus 13 cartas, el compañero enfrente, los rivales a los lados y el triunfo a la vista

### Requirement: Mesa del Whist
La mesa del Whist MUST mostrar:
- los demás jugadores con cuántas cartas tienen;
- la baza en curso en el centro;
- el triunfo: su palo y, mientras el repartidor no la juegue, la carta;
- quién reparte, las bazas que lleva cada pareja en la mano, y los puntos y los juegos de cada pareja.

En su turno, el jugador MUST poder jugar una carta legal tocándola; las que no puede jugar MUST verse apagadas. La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Jugar una carta
- **WHEN** al jugador le toca y toca una carta del palo de salida
- **THEN** la carta pasa a la baza en curso

### Requirement: Resumen de la mano y fin del Whist
Al terminar cada mano, la mesa MUST mostrar las bazas de cada pareja, los puntos que suma, el marcador y los juegos, y avisar si alguna pareja ha ganado un juego. Después MUST esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar los juegos ganados por cada pareja.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano en la que una pareja hizo 8 bazas
- **THEN** el resumen muestra 8 bazas y 2 puntos para esa pareja

### Requirement: Sevens en la suite
El menú MUST incluir el Sevens junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 3 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Sevens MUST poder jugarse en red.

#### Scenario: Empezar una partida de Sevens
- **WHEN** el jugador elige el Sevens en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 13 cartas y tres rivales de la IA

### Requirement: Mesa del Sevens
La mesa del Sevens MUST mostrar:
- las cuatro escaleras, una por palo, con las cartas puestas de la más baja a la más alta y el hueco del 7 en los palos sin abrir;
- los rivales, con cuántas cartas tienen y su última acción;
- abajo, la mano propia, con las cartas jugables resaltadas.

En su turno, el jugador MUST poder jugar una carta legal tocándola, o pulsar «Pasar» si no tiene ninguna. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Jugar una carta
- **WHEN** al jugador le toca y toca el 8 de corazones, con la escalera de corazones en el 7
- **THEN** la escalera de corazones pasa a ir del 7 al 8

### Requirement: Resumen de la mano y fin del Sevens
Al terminar cada mano, la mesa MUST mostrar quién se quedó sin cartas, las cartas que le quedaron a cada uno y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar la clasificación con los puntos.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién ganó la mano y los puntos de cada uno

### Requirement: Scorpion en la suite
El menú MUST incluir el Scorpion junto al resto de juegos. No tiene opciones: se empieza directamente.

#### Scenario: Empezar una partida de Scorpion
- **WHEN** el jugador elige el Scorpion en el menú y empieza
- **THEN** se abre su mesa con las 7 columnas y la reserva

### Requirement: Mesa del Scorpion
La mesa del Scorpion MUST mostrar las 7 columnas con las cartas solapadas, de forma que se vea el valor de cada una (las tapadas, más juntas), y la reserva con cuántas cartas le quedan.

El jugador MUST poder:
- mover una carta con las que tiene encima, arrastrándola o tocándola y tocando el destino;
- repartir la reserva tocándola;
- deshacer, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Mover desde la mesa
- **WHEN** el jugador toca el 6 de picas de una columna y después una columna que acaba en el 7 de picas
- **THEN** el 6 de picas y las cartas que tenía encima pasan a esa columna

### Requirement: Fin del Scorpion
Al completar las cuatro escaleras, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Scorpion
- **WHEN** el último movimiento completa las cuatro escaleras
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo

### Requirement: Casino en la suite
El menú MUST incluir el Casino junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (2, 3 o 4), si con 4 se juega en parejas, y el nivel de la IA. Como el resto de juegos con IA, el Casino MUST poder jugarse en red.

#### Scenario: Empezar una partida de Casino
- **WHEN** el jugador elige el Casino en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 4 cartas, un rival y 4 cartas en la mesa

### Requirement: Mesa del Casino
La mesa del Casino MUST mostrar:
- los rivales, con cuántas cartas tienen y cuántas han recogido;
- la mesa: las cartas sueltas y cada construcción como un montón con su valor, su dueño y la marca de múltiple;
- el mazo, con cuántas cartas quedan, y los puntos;
- abajo, la mano propia.

En su turno, el jugador MUST tocar una carta de su mano para ver las jugadas que puede hacer con ella (recoger, cada construcción posible y dejar), con las cartas de la mesa que se llevaría o usaría resaltadas, y elegir una. Si la carta solo tiene una jugada, MUST hacerla al tocar la mesa. La mesa MUST caber en 360 × 640 sin scroll horizontal con 4 jugadores.

#### Scenario: Recoger desde la mesa
- **WHEN** el jugador toca un 8, que puede recoger un 8 de la mesa, y elige «Recoger»
- **THEN** el 8 de la mesa sale de ella y su cuenta de recogidas sube en 2

#### Scenario: Construir desde la mesa
- **WHEN** el jugador toca un 3, con un 5 en la mesa y un 8 en la mano, y elige «Construir 8»
- **THEN** aparece en la mesa una construcción de 8 suya con el 5 y el 3

### Requirement: Resumen de la mano y fin del Casino
Al terminar cada mano, la mesa MUST mostrar el desglose de puntos de cada jugador o pareja (cartas, picas, Big Casino, Little Casino, Ases y barridas) y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último desglose y la clasificación.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién se llevó las cartas, las picas, el Big Casino y el Little Casino, y los totales

### Requirement: Durak en la suite
El menú MUST incluir el Durak junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (de 2 a 6) y el nivel de la IA. Como el resto de juegos con IA, el Durak MUST poder jugarse en red.

#### Scenario: Empezar una partida de Durak
- **WHEN** el jugador elige el Durak en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 6 cartas, un rival, el mazo y la carta del triunfo

### Requirement: Mesa del Durak
La mesa del Durak MUST mostrar:
- los rivales, con cuántas cartas tienen, quién ataca y quién defiende, y quién ha salido;
- el mazo con cuántas cartas quedan y la carta del triunfo debajo, o el palo del triunfo cuando ya no queda mazo;
- la mesa, con cada carta de ataque y encima la que la gana;
- cuántas cartas hay en el descarte;
- abajo, la mano propia.

En su turno, el jugador MUST jugar tocando una carta de su mano y después la mesa, como en el resto de juegos. Al defender, MUST haber un botón «Me las llevo»; al echar, un botón «Paso». La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Defender desde la mesa
- **WHEN** el jugador defiende y toca una carta que gana el ataque y luego la mesa
- **THEN** su carta queda encima de la de ataque

#### Scenario: Llevarse las cartas desde la mesa
- **WHEN** el jugador defiende y pulsa «Me las llevo»
- **THEN** las cartas de la mesa pasan a su mano

### Requirement: Fin del Durak
Al terminar la partida, la pantalla de fin MUST decir quién es el durak (o que ha habido empate) y el orden en que salieron los demás.

#### Scenario: Pantalla de fin
- **WHEN** termina una partida de Durak
- **THEN** la pantalla de fin muestra quién es el durak y el orden de salida

### Requirement: Euchre en la suite
El menú MUST incluir el Euchre junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Euchre se juega siempre con 4 en parejas. Como el resto de juegos con IA, el Euchre MUST poder jugarse en red.

#### Scenario: Empezar una partida de Euchre
- **WHEN** el jugador elige el Euchre en el menú y empieza
- **THEN** se abre su mesa con sus 5 cartas, tres rivales (uno de ellos su compañero) y la carta vuelta

### Requirement: Mesa del Euchre
La mesa del Euchre MUST usar la mesa de bazas común, y mostrar además:
- la carta vuelta mientras se elige el triunfo;
- el triunfo, quién lo eligió y si juega solo;
- las bazas de cada pareja y los puntos de la partida.

Mientras se elige el triunfo, en su turno el jugador MUST tener los botones de pedir (en la primera vuelta) o de nombrar cada palo posible (en la segunda), cada uno también para jugar solo, y el de pasar. Como repartidor, tras pedirse el triunfo, MUST descartarse tocando una carta de su mano y después la mesa.

#### Scenario: Pedir desde la mesa
- **WHEN** en la primera vuelta el jugador pulsa «Pedir»
- **THEN** el triunfo pasa a ser el palo de la carta vuelta

#### Scenario: Descartarse como repartidor
- **WHEN** el jugador reparte, alguien pide el triunfo y él toca una carta y la mesa
- **THEN** esa carta sale de su mano y vuelve a tener 5

### Requirement: Resumen de la mano y fin del Euchre
Al terminar cada mano, la mesa MUST mostrar quién eligió el triunfo, las bazas de cada pareja, los puntos que se ganan (con el aviso de *euchre* si la pareja que eligió no llegó a 3) y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de cada pareja.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra las bazas de cada pareja y los puntos que ganó cada una

### Requirement: Big Two en la suite
El menú MUST incluir el Big Two junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Big Two se juega siempre con 4. Como el resto de juegos con IA, el Big Two MUST poder jugarse en red.

#### Scenario: Empezar una partida de Big Two
- **WHEN** el jugador elige el Big Two en el menú y empieza
- **THEN** se abre su mesa con sus 13 cartas ordenadas y tres rivales

### Requirement: Mesa del Big Two
La mesa del Big Two MUST mostrar:
- los rivales, con cuántas cartas tienen, sus puntos y si han pasado en la ronda;
- la última jugada de la mesa, con quién la hizo y su tipo (por ejemplo, «Full»);
- abajo, la mano propia ordenada de menor a mayor.

En su turno, el jugador MUST marcar las cartas que quiere jugar tocándolas. Cuando las marcadas forman una jugada legal, MUST poder jugarlas con «Jugar». Si puede pasar, MUST tener el botón «Paso». La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Jugar una pareja
- **WHEN** el jugador marca dos cartas del mismo número que superan la pareja de la mesa y pulsa «Jugar»
- **THEN** su pareja pasa a ser la última jugada de la mesa

#### Scenario: Cartas que no forman jugada
- **WHEN** el jugador marca un 4 y un 9
- **THEN** «Jugar» está desactivado

### Requirement: Resumen de la mano y fin del Big Two
Al terminar cada mano, la mesa MUST mostrar quién se quedó sin cartas, las cartas que le quedaron a cada uno, los puntos que suman y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y la clasificación.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién ganó la mano y los puntos de cada jugador

### Requirement: Cribbage en la suite
El menú MUST incluir el Cribbage junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Cribbage se juega siempre con 2. Como el resto de juegos con IA, el Cribbage MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cribbage
- **WHEN** el jugador elige el Cribbage en el menú y empieza
- **THEN** se abre su mesa con sus 6 cartas, el rival y el tablero de puntos a 0

### Requirement: Mesa del Cribbage
La mesa del Cribbage MUST mostrar:
- un tablero con el avance de cada jugador hasta 121 y sus puntos;
- el rival, con cuántas cartas tiene;
- quién reparte, el crib y el starter cuando se descubre;
- la cuenta y las cartas jugadas desde que empezó;
- el aviso de lo que sumó la última jugada (por ejemplo, «15 por 2»);
- abajo, la mano propia.

Al echar al crib, el jugador MUST marcar 2 cartas tocándolas y pulsar «Al crib». Al jugar las cartas, MUST tocar una carta que quepa y después la mesa. Si no le cabe ninguna, MUST tener el botón «Go». La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Echar dos cartas al crib
- **WHEN** el jugador marca 2 cartas y pulsa «Al crib»
- **THEN** le quedan 4 cartas y el crib muestra sus cartas

#### Scenario: Decir go
- **WHEN** al jugador no le cabe ninguna carta
- **THEN** su único botón es «Go»

### Requirement: Recuento y fin del Cribbage
Al terminar cada mano, la mesa MUST mostrar, en el orden en que se cuentan, la mano del que no reparte, la del repartidor y el crib, cada una con sus cartas, el starter y el desglose (quinces, parejas, escaleras, color y nobs). También MUST mostrar los puntos del juego de las cartas y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último recuento y los puntos de cada uno.

#### Scenario: Recuento tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra las dos manos y el crib con su desglose y los totales

### Requirement: Belote en la suite
El menú MUST incluir el Belote junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Belote se juega siempre con 4 en parejas. Como el resto de juegos con IA, el Belote MUST poder jugarse en red.

#### Scenario: Empezar una partida de Belote
- **WHEN** el jugador elige el Belote en el menú y empieza
- **THEN** se abre su mesa con sus 5 cartas, tres rivales (uno de ellos su compañero) y la carta vuelta

### Requirement: Mesa del Belote
La mesa del Belote MUST usar la mesa de bazas común, y mostrar además:
- la carta vuelta mientras se elige el triunfo;
- el triunfo y quién lo eligió;
- los puntos de las bazas de cada pareja en la mano y los puntos de la partida;
- el aviso de «Belote» y «Rebelote» cuando alguien los anuncia.

Mientras se elige el triunfo, en su turno el jugador MUST tener el botón de tomar (en la primera vuelta) o de nombrar cada palo posible (en la segunda), y el de pasar. Al jugar, solo MUST poder elegir las cartas que permiten las reglas.

#### Scenario: Tomar desde la mesa
- **WHEN** en la primera vuelta el jugador pulsa «Tomo»
- **THEN** el triunfo pasa a ser el palo de la carta vuelta y el jugador tiene 8 cartas

#### Scenario: Solo las cartas permitidas
- **WHEN** se sale de un palo que el jugador tiene
- **THEN** solo puede jugar cartas de ese palo

### Requirement: Resumen de la mano y fin del Belote
Al terminar cada mano, la mesa MUST mostrar quién eligió el triunfo, los puntos de cartas, el diez de últimas y el belote de cada pareja, los puntos que se apunta cada una (con el aviso de *dentro* o de *capot*) y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de cada pareja.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra los puntos que hizo cada pareja y los que se apunta

### Requirement: Schnapsen en la suite
El menú MUST incluir el Schnapsen junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Schnapsen se juega siempre entre 2. Como el resto de juegos con IA, el Schnapsen MUST poder jugarse en red.

#### Scenario: Empezar una partida de Schnapsen
- **WHEN** el jugador elige el Schnapsen en el menú y empieza
- **THEN** se abre su mesa con sus 5 cartas, el rival, el mazo y la carta vuelta

### Requirement: Mesa del Schnapsen
La mesa del Schnapsen MUST usar la mesa de bazas común, y mostrar además:
- el mazo con la carta vuelta, o que está cerrado;
- el triunfo;
- los puntos de la mano y las bazas de cada jugador, y los puntos de partida;
- el aviso de cada cante, cambio y cierre.

En su turno de salida, el jugador MUST tener los botones de cambiar la J, cantar cada pareja que pueda y cerrar el mazo, cuando estén permitidos. Al jugar, solo MUST poder elegir las cartas que permiten las reglas.

#### Scenario: Cantar desde la mesa
- **WHEN** el jugador sale con el K y la Q de un palo y pulsa su botón de cantar
- **THEN** se anuncia el cante y solo puede jugar el K o la Q de ese palo

#### Scenario: Cerrar desde la mesa
- **WHEN** el jugador pulsa «Cerrar»
- **THEN** la mesa muestra el mazo cerrado

### Requirement: Resumen de la mano y fin del Schnapsen
Al terminar cada mano, la mesa MUST mostrar quién la ganó y por qué (66, última baza o cierre), los puntos de la mano de cada uno, los puntos de partida que se apunta el ganador y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de partida de cada uno.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién la ganó y los puntos de partida que se apunta

### Requirement: Skat en la suite
El menú MUST incluir el Skat junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de rondas (1, 2 o 3). El Skat se juega siempre con 3. Como el resto de juegos con IA, el Skat MUST poder jugarse en red.

#### Scenario: Empezar una partida de Skat
- **WHEN** el jugador elige el Skat en el menú y empieza
- **THEN** se abre su mesa con sus 10 cartas y dos rivales

### Requirement: Mesa del Skat
La mesa del Skat MUST usar la mesa de bazas común, y mostrar además:
- durante la subasta, quién puja a quién y el último valor;
- el solista, el juego declarado y sus anuncios;
- los puntos de las bazas del solista y de los defensores en la mano, y los puntos de la partida.

Cuando le toque, el jugador MUST tener los botones de:
- **subasta:** pujar el siguiente valor, aceptar o pasar;
- **el Skat:** coger el Skat o jugar de mano;
- **descarte:** descartarse de 2 cartas, una a una, tocando cada carta y después la mesa;
- **declarar:** cada juego posible y, si juega de mano, los anuncios.

Al jugar, solo MUST poder elegir las cartas que permiten las reglas. Si el solista juega ouvert, su mano MUST verse en la mesa junto a su nombre.

#### Scenario: Pujar desde la mesa
- **WHEN** al jugador le toca pujar y pulsa «18»
- **THEN** se anuncia su puja y le toca responder al otro

#### Scenario: Descartarse tras coger el Skat
- **WHEN** el jugador es el solista, coge el Skat y se descarta de 2 cartas tocando cada una y la mesa
- **THEN** vuelve a tener 10 cartas y puede declarar el juego

### Requirement: Resumen de la mano y fin del Skat
Al terminar cada mano, la mesa MUST mostrar el solista, el juego con sus anuncios, el Skat, los puntos de cartas del solista, el multiplicador y el valor, si ganó o perdió, y los puntos de la partida de cada uno, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de cada jugador.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra el juego, su valor y lo que suma o resta el solista

### Requirement: Oh Hell en la suite
El menú MUST incluir el Oh Hell junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de jugadores, de 3 a 7. Como el resto de juegos con IA, el Oh Hell MUST poder jugarse en red.

#### Scenario: Empezar una partida de Oh Hell
- **WHEN** el jugador elige el Oh Hell con 4 jugadores y empieza
- **THEN** se abre su mesa con sus 12 cartas, tres rivales y la carta del triunfo

### Requirement: Mesa del Oh Hell
La mesa del Oh Hell MUST usar la mesa de bazas común, y mostrar además:
- la carta del triunfo;
- las cartas de la mano en curso y la suma de las apuestas;
- la apuesta y las bazas de cada jugador;
- los puntos de cada uno.

En su turno de apostar, el jugador MUST tener un botón por cada apuesta permitida, y si es el repartidor, MUST ver cuál no puede hacer.

#### Scenario: Apostar desde la mesa
- **WHEN** al jugador le toca apostar y pulsa «2»
- **THEN** su apuesta se ve junto a su nombre

#### Scenario: Apuesta prohibida
- **WHEN** el jugador es el repartidor
- **THEN** no tiene el botón de la apuesta que haría cuadrar la suma, y la mesa le dice cuál es

### Requirement: Resumen de la mano y fin del Oh Hell
Al terminar cada mano, la mesa MUST mostrar, para cada jugador, su apuesta, sus bazas, si acertó, los puntos de la mano y el total, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y la clasificación por puntos.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen marca quién acertó y lo que suma cada uno

### Requirement: Spite and Malice en la suite
El menú MUST incluir el Spite and Malice junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 2. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Spite and Malice
- **WHEN** el jugador elige el Spite and Malice en el menú y empieza
- **THEN** se abre su mesa con su mano de 5 cartas, su montón y el del rival, las escaleras vacías y el mazo

### Requirement: Mesa del Spite and Malice
La mesa del Spite and Malice MUST mostrar:
- arriba, el montón del rival (con su carta de arriba y cuántas le quedan), sus descartes y cuántas cartas tiene en la mano;
- en el centro, el mazo, las 4 escaleras (con su carta de arriba y el valor por el que van) y cuántas cartas hay en las escaleras completas;
- abajo, sus descartes, su montón y su mano.

Para jugar, el jugador MUST tocar primero la carta de origen (de su mano, la de arriba de su montón o la de arriba de un descarte), que queda marcada, y después la escalera de destino o, si la carta es de la mano, uno de sus descartes. Solo MUST poder elegir orígenes y destinos permitidos. La mesa MUST avisar de las jugadas del rival y de quién gana.

#### Scenario: Jugar a una escalera
- **WHEN** el jugador toca un As de su mano y después una escalera libre
- **THEN** la escalera empieza con el As y su mano tiene una carta menos

#### Scenario: Descartar
- **WHEN** el jugador toca una carta de su mano y después uno de sus descartes
- **THEN** la carta queda en ese descarte y le toca al rival

#### Scenario: Fin de la partida
- **WHEN** un jugador vacía su montón
- **THEN** sale la pantalla de fin con el ganador y las cartas que le quedaban a cada uno

### Requirement: Bridge en la suite
El menú MUST incluir el Bridge junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y los ciclos de Chicago (1, 2 o 3); se juega siempre entre 4, el jugador con la IA de compañero. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Bridge
- **WHEN** el jugador elige el Bridge en el menú y empieza
- **THEN** se abre su mesa con su mano de 13 cartas, la vulnerabilidad de la mano y la caja de subasta

### Requirement: Mesa del Bridge
La mesa del Bridge MUST mostrar:
- la mano del jugador, los asientos de los demás con cuántas cartas tienen, y la baza en curso en el centro;
- durante la subasta, una caja con el historial de declaraciones por asiento y, en el turno del jugador, una rejilla con las pujas posibles y los botones de pasar, doblar y redoblar cuando se puedan;
- durante el carteo, el contrato con el declarante y el doblo, la vulnerabilidad, las bazas de cada pareja y el marcador;
- la mano del muerto boca arriba en su asiento, desde que se descubre.

Cuando el jugador es el declarante y le toca al muerto, MUST poder tocar las cartas del muerto para jugarlas, y solo esas; cuando el jugador es el muerto, MUST ver cómo juega su compañero sin poder jugar. Al acabar cada mano, MUST mostrarse un resumen con el contrato, si se cumplió, las bazas y los puntos de cada pareja.

#### Scenario: Pujar
- **WHEN** le toca al jugador en la subasta y toca 1 sin triunfo en la rejilla
- **THEN** la puja aparece en el historial y le toca al siguiente

#### Scenario: Jugar por el muerto
- **WHEN** el jugador es el declarante y le toca al muerto
- **THEN** las cartas jugables del muerto se resaltan y, al tocar una, se juega en la baza

#### Scenario: Fin de la partida
- **WHEN** termina el último ciclo
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada mano

### Requirement: Pesca en la suite
El menú MUST incluir la Pesca junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de jugadores (de 2 a 6, por defecto 4). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Pesca
- **WHEN** el jugador elige la Pesca con 4 jugadores y empieza
- **THEN** se abre su mesa con su mano de 5 cartas, los tres rivales y el mar

### Requirement: Mesa de la Pesca
La mesa de la Pesca MUST mostrar:
- los rivales, con su nombre, cuántas cartas tienen y sus cuartetos;
- el mar con las cartas que quedan;
- los cuartetos del jugador;
- su mano agrupada por valores.

Para pedir, el jugador MUST tocar un valor de su mano, que queda marcado, y después un rival con cartas. La mesa MUST avisar de cada petición («Rival 1 te pide sietes: le das 2», «¡A pescar!») y de cada cuarteto bajado, con una pausa para leerlo cuando juega la IA.

#### Scenario: Pedir a un rival
- **WHEN** el jugador toca sus sietes y después al Rival 1
- **THEN** pide sietes al Rival 1 y la mesa avisa de lo que le ha dado o de que tiene que pescar

#### Scenario: Fin de la partida
- **WHEN** se baja el último cuarteto
- **THEN** sale la pantalla de fin con el ganador y los cuartetos de cada jugador
