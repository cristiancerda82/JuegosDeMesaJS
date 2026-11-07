## Purpose

Organiza el menú principal de la suite para que el jugador encuentre rápido un juego entre decenas: familias de juegos, filtro por baraja, buscador, favoritos y últimos jugados.

## ADDED Requirements

### Requirement: Familias de juegos
Cada juego de la suite MUST pertenecer a una sola familia, y el menú principal MUST mostrar las familias, no la lista completa de juegos. Cada familia MUST mostrar su nombre y cuántos juegos contiene. Las familias y sus juegos son:

| Familia | Juegos |
|---|---|
| Solitarios | Klondike, FreeCell, Spider, Belle Lucie, Scorpion, Cuarenta ladrones, Canfield, Yukon, TriPeaks, Golf, Pirámide |
| Bazas por puntos | Brisca, Tute, Guiñote, Tressette, Schnapsen, Sixty-Six, Belote, Klaverjas, Jass, Sueca, Bezique, Skat, Doppelkopf, Schafkopf, Sheepshead, Tysiacha, Piquet, Écarté, Butifarra |
| Bazas con contrato o subasta | Bridge, Whist, Picas, Oh Hell, Pocha, 500, Tresillo, Preference, Tute subastado, Cuatrola, Julepe, Euchre, Bourré, Tarot |
| Bazas para evitar | Corazones, Barbu, Rentz |
| Combinaciones | Chinchón, Remigio, Gin Rummy, Rummy 500, Canasta, Conquián, Pinacle, Cribbage |
| Captura | Escoba, Scopa, Casino, Cuarenta, Pishti, Pesca |
| Descarte | Ocho loco, Culo, Big Two, Durak, Cinquillo, Sevens, Mentiroso, Burro, Kings Corner, Spite & Malice |
| Envite y apuestas | Mus, Truco, Truc, Texas Hold'em, Blackjack, Siete y media, Treinta y uno |

Al elegir una familia, el menú MUST mostrar sus juegos, cada uno con su nombre, su descripción y sus cartas de muestra, como hasta ahora. Desde ahí el jugador MUST poder abrir las opciones de un juego o volver a las familias. Al volver desde las opciones de un juego, el jugador MUST regresar a la vista de la que vino.

#### Scenario: Elegir un solitario
- **WHEN** el jugador abre la aplicación y elige la familia «Solitarios»
- **THEN** ve los 11 solitarios y, al elegir Spider, se abren las opciones de Spider

#### Scenario: Volver desde las opciones
- **WHEN** el jugador entra en «Captura», abre las opciones de la Escoba y pulsa «Volver»
- **THEN** vuelve a la lista de juegos de «Captura», no a la pantalla de familias

#### Scenario: Todos los juegos están en una familia
- **WHEN** se recorren todas las familias
- **THEN** cada juego de la suite aparece exactamente una vez

### Requirement: Filtro por baraja
El menú MUST ofrecer un filtro por baraja con tres valores: Todas (por defecto), Española y Francesa. Con Española o Francesa, el menú MUST mostrar solo los juegos que se juegan con esa baraja: el número de cada familia se recalcula y las familias que se quedan sin juegos no se muestran. Un juego que admite las dos barajas MUST aparecer con ambos filtros. El Tarot cuenta como francesa. El filtro elegido MUST recordarse en el dispositivo.

#### Scenario: Solo baraja española
- **WHEN** el jugador elige el filtro «Española»
- **THEN** la familia «Solitarios» no se muestra, y en «Bazas por puntos» aparecen la Brisca, el Tute y el Guiñote pero no el Skat

#### Scenario: El filtro se recuerda
- **WHEN** el jugador elige «Francesa», cierra la aplicación y la vuelve a abrir
- **THEN** el filtro sigue en «Francesa»

### Requirement: Buscador de juegos
El menú MUST tener un campo de búsqueda. Mientras tenga texto, el menú MUST mostrar, en lugar de las familias, una lista con los juegos cuyo nombre contiene ese texto, de cualquier familia y respetando el filtro por baraja. La búsqueda MUST ignorar mayúsculas y tildes. Si ningún juego coincide, el menú MUST decirlo. Al borrar el texto, el menú vuelve a mostrar las familias.

#### Scenario: Búsqueda sin tildes
- **WHEN** el jugador escribe «guinote»
- **THEN** aparece el Guiñote y puede abrir sus opciones

#### Scenario: Sin resultados
- **WHEN** el jugador escribe un texto que no coincide con ningún juego
- **THEN** el menú muestra un aviso de que no hay juegos con ese nombre

### Requirement: Favoritos
El jugador MUST poder marcar y desmarcar un juego como favorito con un botón de estrella, tanto en la tarjeta del juego en el menú como en la pantalla de opciones de ese juego. La estrella MUST indicar si el juego es favorito, y su nombre accesible MUST decir qué hace («Añadir a favoritos» o «Quitar de favoritos»).

El menú MUST tener un botón flotante de favoritos, visible en las familias, en la lista de una familia y en los resultados de búsqueda. Al pulsarlo se abre un panel con los favoritos, el último marcado primero. Elegir un juego del panel abre sus opciones. Sin favoritos, el panel MUST explicar cómo añadirlos. Los favoritos MUST guardarse en el dispositivo.

#### Scenario: Marcar un favorito
- **WHEN** el jugador pulsa la estrella de la Brisca en el menú y abre el panel de favoritos
- **THEN** la Brisca aparece en el panel, y al elegirla se abren sus opciones

#### Scenario: Quitar desde las opciones
- **WHEN** el jugador abre las opciones del Mus, que es favorito, y pulsa la estrella
- **THEN** el Mus deja de ser favorito y ya no aparece en el panel

#### Scenario: Los favoritos se conservan
- **WHEN** el jugador marca tres favoritos y recarga la página
- **THEN** los tres siguen marcados y en el mismo orden

### Requirement: Últimos jugados
El cliente MUST recordar los 10 últimos juegos jugados, sin repetir, del más reciente al más antiguo. Un juego cuenta como jugado cuando:
- empieza una partida local, incluida la revancha;
- retoma una partida guardada;
- crea una sala en red o entra en una.

Si el juego ya estaba en la lista, pasa al primer puesto. Al entrar el undécimo juego distinto, sale el más antiguo.

El menú MUST tener un botón flotante de últimos jugados, junto al de favoritos, que abre un panel con esa lista. Elegir un juego del panel abre sus opciones. Sin juegos recientes, el panel MUST decirlo. La lista MUST guardarse en el dispositivo.

#### Scenario: El último jugado, primero
- **WHEN** el jugador empieza una partida de Klondike, después una de Mus y después otra de Klondike
- **THEN** el panel muestra Klondike primero y Mus segundo, sin repetir Klondike

#### Scenario: Como mucho diez
- **WHEN** el jugador ha empezado partidas de 11 juegos distintos
- **THEN** el panel muestra los 10 últimos y no el primero que jugó

#### Scenario: Partida en red
- **WHEN** el jugador se une con un código a una sala de Tute
- **THEN** el Tute pasa al primer puesto de los últimos jugados

### Requirement: Paneles flotantes accesibles y adaptables
Los botones flotantes MUST quedar fijos en una esquina de la pantalla sin tapar la última fila de juegos, en escritorio y en móvil. Solo puede estar abierto un panel a la vez. Un panel MUST cerrarse con su botón de cerrar, con la tecla Escape o pulsando fuera de él, y al cerrarse el foco MUST volver al botón que lo abrió. Los botones flotantes MUST NOT mostrarse durante una partida.

#### Scenario: Cerrar con Escape
- **WHEN** el jugador abre el panel de últimos jugados con el teclado y pulsa Escape
- **THEN** el panel se cierra y el foco vuelve al botón de últimos jugados

#### Scenario: Pantalla de móvil
- **WHEN** el menú de una familia se ve en una pantalla de 360 px de ancho y se baja hasta el final
- **THEN** la última tarjeta de juego se puede pulsar entera, sin que la tapen los botones flotantes

### Requirement: Almacenamiento no disponible
Si el dispositivo no permite leer o guardar los favoritos, los recientes o el filtro (navegación privada, almacenamiento lleno o bloqueado), el menú MUST seguir funcionando: los favoritos y los recientes empiezan vacíos, el filtro empieza en «Todas» y los cambios valen mientras dure la sesión. Datos guardados con un formato no válido o con juegos que ya no existen MUST ignorarse sin error.

#### Scenario: Navegación privada
- **WHEN** el almacenamiento del dispositivo lanza un error al guardar
- **THEN** el jugador puede marcar un favorito y verlo en el panel durante la sesión, sin ningún error visible
