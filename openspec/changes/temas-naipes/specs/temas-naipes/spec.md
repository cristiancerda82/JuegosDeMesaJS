## Purpose

Permite al jugador elegir el diseño de las cartas de la baraja española y de la francesa entre varios temas de inspiración tradicional, y fija las reglas de legibilidad, accesibilidad y originalidad que todo tema debe cumplir.

## ADDED Requirements

### Requirement: Catálogo de temas
El cliente MUST ofrecer estos temas, con estos nombres visibles:
- Baraja española: «Minimal», «Castizo» y «Napolitano».
- Baraja francesa: «Minimal» y «Victoriano».

«Minimal» MUST ser el diseño que la suite usa antes de este cambio, sin alteraciones visibles, y es el tema por defecto de las dos barajas. El tema español se aplica a las cartas de oros, copas, espadas y bastos; el francés, a las de picas, corazones, diamantes y tréboles. Los comodines, los triunfos y la Excusa del Tarot y los dorsos MUST verse igual con cualquier tema.

#### Scenario: Por defecto, sin cambios
- **WHEN** un jugador que nunca ha elegido tema abre el muestrario
- **THEN** todas las cartas se ven exactamente como antes de este cambio

#### Scenario: Temas independientes
- **WHEN** el jugador elige «Napolitano» para la española y deja «Minimal» en la francesa
- **THEN** en la Escoba las cartas se ven con el tema Napolitano y en el Klondike siguen en Minimal

### Requirement: Elegir el tema
El menú MUST tener, junto al selector de dorso, un selector de diseño de naipes con dos elecciones: la de la baraja española y la de la francesa. Cada opción MUST mostrar una vista previa con al menos un as, un numeral y una figura del tema. El muestrario de cartas MUST permitir también cambiar el tema y mostrar el mazo completo con el elegido.

La elección MUST aplicarse en cuanto se hace, en todas las cartas que se ven (menú, muestrario y mesas), y MUST guardarse en el dispositivo. Si no se puede leer o guardar, se usa «Minimal» y la elección vale mientras dure la sesión. Un valor guardado que no corresponde a ningún tema MUST ignorarse, y entonces se usa «Minimal».

#### Scenario: Cambiar y recordar
- **WHEN** el jugador elige «Victoriano» para la francesa, recarga la página y empieza un Klondike
- **THEN** las cartas del Klondike se ven con el tema Victoriano

#### Scenario: Vista previa
- **WHEN** el jugador abre el selector de la baraja española
- **THEN** ve una muestra de cada tema, con un as, un numeral y una figura, antes de elegir

#### Scenario: Valor guardado inválido
- **WHEN** el almacenamiento contiene un tema que no existe
- **THEN** las cartas se ven con «Minimal» y no aparece ningún error

### Requirement: Cada tema cubre toda su baraja
Un tema español MUST dibujar todas las cartas de la baraja española de 48, del 1 al 12 de cada palo, incluidos el 8 y el 9 aunque la baraja histórica en la que se inspira no los tenga. Un tema francés MUST dibujar todas las cartas francesas del 1 al 13 de cada palo y también el caballo (valor 14) que usa el Tarot. Las figuras MUST ser ilustraciones del tema: sota, caballo y rey en la española; jota, reina, rey y caballo en la francesa. Cada figura MUST llevar el palo al que pertenece, de modo que las cuatro figuras del mismo rango se distingan por el dibujo y no solo por el índice.

#### Scenario: Baraja de 48 con el tema Napolitano
- **WHEN** el muestrario enseña la baraja española de 48 con el tema Napolitano
- **THEN** las 48 cartas se dibujan con el tema, también el 8 y el 9 de cada palo

#### Scenario: Caballo del Tarot con el tema Victoriano
- **WHEN** una partida de Tarot muestra el caballo de picas con el tema Victoriano
- **THEN** se ve una figura ilustrada de caballo de picas con el índice del caballo

### Requirement: Legibilidad en la mesa
Con cualquier tema, cada carta MUST mostrar en dos esquinas opuestas su índice (número o letra) y el símbolo de su palo, legibles al tamaño más pequeño al que la suite dibuja cartas, que son las cartas de muestra del menú. En la baraja francesa los palos rojos y negros MUST distinguirse por el color. En la española, cada palo MUST distinguirse por la forma de su símbolo además de por el color. El índice y el palo MUST quedar visibles en la parte que asoma de una carta cuando las cartas se solapan en abanico o en columna.

#### Scenario: Columna de Klondike
- **WHEN** una columna de Klondike tiene 12 cartas boca arriba solapadas, con el tema Victoriano
- **THEN** en cada carta tapada se ven su índice y su palo

#### Scenario: Mano en abanico en móvil
- **WHEN** en una pantalla de 360 × 640 la mano de la Escoba se muestra con el tema Castizo
- **THEN** se puede leer el índice y el palo de cada carta de la mano

### Requirement: Accesibilidad
El nombre accesible de cada carta MUST ser el mismo con todos los temas (por ejemplo «Caballo de copas» o «7 de picas»). Los selectores de tema MUST poder usarse con teclado y lector de pantalla, con el nombre del tema y la baraja a la que se aplica.

#### Scenario: Lector de pantalla
- **WHEN** con el tema Castizo un lector de pantalla recorre la mano de la Brisca
- **THEN** anuncia cada carta con el mismo nombre que con el tema Minimal

### Requirement: Originalidad del arte
Todas las ilustraciones de los temas MUST ser de autoría propia del proyecto. Se inspiran en estilos tradicionales (paleta, marcos, proporciones, convenciones como las pintas del naipe español) sin reproducir ni calcar ilustraciones concretas de barajas existentes. Ninguna carta MUST incluir marcas, logotipos, nombres de fabricantes, de imprentas o de lugares de edición.

#### Scenario: Revisión del arte
- **WHEN** se revisa el arte de un tema antes de darlo por terminado
- **THEN** cada ilustración es original del proyecto y ninguna carta muestra marcas, logotipos ni nombres de fabricantes

### Requirement: Disponibilidad y carga
Con la aplicación instalada, cualquier tema MUST poder elegirse y verse sin conexión. Un tema ilustrado solo MUST descargarse cuando se use, salvo lo que precargue la aplicación instalada. Mientras se carga un tema, las cartas MUST dibujarse con «Minimal» y nunca en blanco. Si el tema no se puede cargar, las cartas MUST seguir en «Minimal» y la partida continúa sin errores.

#### Scenario: Sin conexión
- **WHEN** con la aplicación instalada y sin conexión el jugador elige «Napolitano»
- **THEN** las cartas pasan a verse con el tema Napolitano

#### Scenario: Fallo al cargar
- **WHEN** la descarga del tema Castizo falla
- **THEN** las cartas se ven con «Minimal» y la partida se puede jugar con normalidad

### Requirement: Rendimiento con muchas cartas
Una mesa con muchas cartas MUST seguir siendo fluida con un tema ilustrado. Una partida de Spider de 4 palos (104 cartas) con el tema Victoriano MUST mostrarse y responder a los movimientos sin una diferencia apreciable respecto a «Minimal»: el tiempo hasta mostrar la mesa no puede pasar del doble del de «Minimal» en el mismo dispositivo.

#### Scenario: Spider con tema ilustrado
- **WHEN** se empieza una partida de Spider de 4 palos con el tema Victoriano
- **THEN** la mesa aparece en menos del doble de tiempo que con «Minimal» y arrastrar una columna sigue siendo fluido
