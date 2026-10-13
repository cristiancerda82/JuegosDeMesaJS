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
