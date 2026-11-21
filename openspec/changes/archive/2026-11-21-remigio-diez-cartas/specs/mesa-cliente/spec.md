## ADDED Requirements

### Requirement: Remigio de diez cartas en el cliente
Las opciones del Remigio MUST tener la casilla «Diez cartas», desactivada por defecto, en local y al crear una sala en red.

Con la opción, la mesa del Remigio MUST:
- no mostrar la zona de combinaciones ni el botón «Bajar»;
- tener el botón «Cerrar», activo cuando el jugador ha robado y ha elegido una carta que, al soltarla, deja las otras diez ligadas;
- mostrar los puntos sin ligar de su mano;
- ordenar la mano por los palos franceses o por número, del As a la K.

El resumen de cada mano MUST decir con qué premio se cerró y por cuánto se multiplica, y mostrar las cartas sin ligar de cada jugador en lugar de toda su mano.

La guía del Remigio MUST explicar la variante (la baraja, las 10 cartas, cómo se liga, el color y los premios) y decir que se activa con la opción «Diez cartas».

#### Scenario: Cerrar con diez cartas
- **WHEN** con la opción «Diez cartas», el jugador ha robado, elige la carta que le sobra y las otras diez están ligadas
- **THEN** el botón «Cerrar» está activo y, al pulsarlo, termina la mano y ve el resumen

#### Scenario: El premio en el resumen
- **WHEN** un rival cierra con color y sin comodines
- **THEN** el resumen dice que cerró con color, que los demás pagan por cuatro, y muestra las cartas sin ligar de cada uno

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Remigio
- **THEN** lee cómo se juega con diez cartas y en qué opción se activa

## MODIFIED Requirements

### Requirement: Historia, consejos y variantes regionales en la guía
La guía de cada juego de la suite MUST terminar con un apartado «Un poco de historia», que MUST aparecer plegado al abrir la guía y MUST poder desplegarse y volver a plegarse.

El apartado MUST tener un párrafo corto sobre el origen del juego y de su nombre, en las palabras de la suite y sin copiar el texto de ningún libro. Un dato que no sea seguro MUST presentarse como tal (por ejemplo, «se cree que…»). El apartado MUST verse completo a 360 px de ancho sin desplazamiento horizontal.

La sección «Consejos» MUST incluir, además de los que ya tiene, los consejos de estrategia de los libros clásicos para estos juegos:
- **Tute:** no arrastrar contra el As de triunfo; buscar primero el cante que falta; arrastrar cuando el compañero ha enseñado el As de triunfo.
- **Brisca:** llevar la cuenta de los puntos que han salido.
- **Burro:** fijarse en lo que piden y en lo que pasan los demás.
- **Mus:** cuándo cortar el mus y qué indican los descartes de los rivales.
- **Butifarra:** cuándo delegar y cuándo cantar butifarra.

La guía MUST incluir una línea que empiece por «En otros sitios» para cada variante regional que cuentan los libros y que la suite no juega:
- la Escoba a 31 puntos;
- la Siete y media con la carta tapada o destapada;
- el Julepe en el que quien reparte «la baila»;
- la Brisca con señas entre compañeros;
- el Tute subastado de 3 jugadores con 12 cartas;
- el Polignac con el orden antiguo (el As por debajo de la J);
- el Treinta y uno con viuda;
- el Oh Hell que sube de 1 carta al máximo;
- el Barbu cuyo dominó empieza por el número que elige quien reparte;
- el Burro, que en algunas zonas es otro juego, de bazas.

La guía del Chinchón MUST incluir un ejemplo visual que coloca una carta suelta en una combinación a la vista. La guía de la Escoba MUST incluir un ejemplo con los 10 oros y los 4 sietes y su premio. Los dos ejemplos MUST cumplir las reglas tal como las aplica el motor con la variante activada.

#### Scenario: La historia empieza plegada
- **WHEN** el jugador abre la guía del Tute
- **THEN** ve al final el apartado «Un poco de historia» plegado y, al tocarlo, lee de dónde viene el juego y su nombre

#### Scenario: Todos los juegos tienen su historia
- **WHEN** se abre la guía de cualquier juego de la suite
- **THEN** termina con el apartado «Un poco de historia» y su párrafo no está vacío

#### Scenario: Un consejo de los libros
- **WHEN** el jugador abre la guía del Tute
- **THEN** los consejos le dicen que no arrastre contra el As de triunfo

#### Scenario: Una variante regional que no se juega
- **WHEN** el jugador abre la guía de la Escoba
- **THEN** lee que en otros sitios la partida se juega a 31 puntos

#### Scenario: El ejemplo de colocar una carta suelta
- **WHEN** el jugador abre la guía del Chinchón
- **THEN** ve un antes y un después en el que una carta suelta pasa a una combinación a la vista, resaltada
