## MODIFIED Requirements

### Requirement: Tres niveles en cada juego contra la máquina
Cada juego con IA (Brisca, Tute, Guiñote, Escoba, Chinchón, Siete y media, Cinquillo, Pocha, Mus, Corazones, Burro, Pinacle, Butifarra, Truc, Julepe, Remigio, Tute subastado, Cuatrola, Mentiroso, Ocho loco, Picas, Blackjack, Gin Rummy, Rummy 500, Texas Hold'em, Culo y Canasta) MUST ofrecer una IA para cada nivel: `facil`, `normal` y `dificil`. La IA `normal` MUST ser la IA básica del juego. Todos los niveles MUST cumplir las garantías generales de la IA:
- deciden solo con la vista de su asiento;
- eligen siempre una acción legal;
- son reproducibles con su semilla;
- deciden en menos de 500 ms.

#### Scenario: Partidas completas con todos los niveles
- **WHEN** se juegan partidas de cada juego mezclando asientos de los tres niveles, con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Misma decisión en todos los niveles
- **WHEN** se pide dos veces una decisión a la IA de cualquier nivel con la misma vista y la misma semilla
- **THEN** elige la misma acción

### Requirement: Reconstrucción de las cartas ocultas
Cada juego con IA difícil (todos menos el Burro, el Mentiroso y el Texas Hold'em) MUST tener una función que, a partir de la vista de un asiento y de un azar, construya un estado completo del juego coherente con esa vista. Las cartas que el asiento no ve (las manos ajenas, el mazo y cualquier otra carta oculta) MUST repartirse al azar entre los sitios ocultos, respetando cuántas cartas hay en cada uno. Todo lo visible MUST quedar igual. La vista de ese asiento en el estado reconstruido MUST ser idéntica a la vista de partida.

Si una vista no tiene datos públicos suficientes para reconstruir el estado, se MUST añadir a la vista lo que falte, siempre que no sea información oculta y que la spec del juego no lo prohíba. Se añaden:
- las cartas ya jugadas en bazas de la mano (Brisca, Tute, Guiñote, Pocha, Corazones, Butifarra, Truc, Julepe, Tute subastado, Cuatrola y Picas);
- los puntos de las bazas de cada jugador (Brisca, Tute y Guiñote) o de cada bando (Butifarra);
- quién puede cantar todavía (Tute, Guiñote y Tute subastado);
- quién ha pasado ya en el lance y cuántas cartas hay en el montón de descartes, sin cuáles (Mus).
- cuántos jugadores han pasado seguidos sin poder robar y, de la última vez que robó cada uno, qué palo y qué número no tenía (Ocho loco).

En la Escoba, las cartas recogidas siguen sin mostrarse (spec juego-escoba): la reconstrucción las reparte al azar con el número de cartas que se ve. En el Mus, las manos ajenas MUST cuadrar con lo declarado de pares y juego. En la Butifarra, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que no falló pudiendo, sin triunfos. En el Truc, si se aceptó el envit, la mano de cada jugador cuyos puntos de envit se mostraron MUST dar esos puntos con sus cartas en mano y las que ya jugó. En el Julepe, las cartas descartadas y las del mazo son ocultas, y la carta de triunfo a la vista MUST seguir en la mano del repartidor. En el Remigio, la vista muestra todo el montón y las combinaciones de la mesa, y la reconstrucción reparte al azar entre las manos ajenas y el mazo solo las cartas que no se ven. En el Tute subastado, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que tampoco jugó triunfo, sin triunfos. En la Cuatrola, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo (contando los matadores como triunfo, salvo los que el privilegio le dejaba guardar), y mientras el compañero esté oculto la carta llamada MUST quedar en la mano de uno de los otros tres, nunca en la del jugador. En Picas, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En el Blackjack, la carta tapada de la banca y la baraja MUST repartirse al azar entre las cartas que no se ven; si la banca miró su carta tapada sin descubrirla, esa carta MUST ser una que no le dé blackjack. En el Ocho loco, quien robó por no poder jugar no tenía entonces ni ese palo, ni ese número, ni ochos: todas sus cartas menos una (la robada) MUST elegirse entre las que lo cumplen, y si las cartas ocultas no alcanzan para cumplirlo, se reparten sin esa restricción. En el Gin Rummy, el descarte entero es público, y las cartas que el rival cogió del descarte y no ha soltado MUST quedar en su mano; el resto de su mano y el mazo se reparten al azar entre las cartas que no se ven. En el Rummy 500, el descarte y las combinaciones de la mesa son públicos; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Culo, todas las cartas jugadas son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven; las cartas que el asiento dio en el intercambio y aún no se han jugado MUST quedar en la mano de quien las recibió. En la Canasta, el pozo, las combinaciones y los treses rojos son públicos, y las cartas que cada jugador se llevó del pozo y aún tiene MUST quedar en su mano; el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven.

#### Scenario: La reconstrucción da la misma vista
- **WHEN** en cualquier estado alcanzado en partidas al azar se reconstruye un estado desde la vista de un asiento
- **THEN** la vista de ese asiento en el estado reconstruido es igual a la original, y el estado es válido para seguir jugando

#### Scenario: Las cartas ocultas cambian con el azar
- **WHEN** se reconstruye dos veces desde la misma vista con azares distintos
- **THEN** las cartas ocultas pueden estar en sitios distintos, pero las propias y las visibles son las mismas

#### Scenario: Fallos conocidos en la Butifarra
- **WHEN** en la Butifarra un rival no siguió el palo de copas en una baza anterior y se reconstruye el estado
- **THEN** la mano reconstruida de ese rival no tiene ninguna copa

#### Scenario: Envit mostrado en el Truc
- **WHEN** en el Truc un rival mostró 33 puntos de envit y se reconstruye el estado
- **THEN** sus cartas en mano, junto con las que ya jugó, suman 33 puntos de envit

#### Scenario: Cartas dadas en el intercambio del Culo
- **WHEN** en el Culo el presidente devolvió un 3 y un 4 al culo, el culo no los ha jugado y el presidente reconstruye el estado
- **THEN** la mano reconstruida del culo tiene el 3 y el 4

### Requirement: Nivel difícil por simulación
La IA difícil MUST decidir así:
1. Si solo hay una acción legal, la elige.
2. Si hay varias, reconstruye varias veces el estado a partir de su vista.
3. En cada reconstrucción, prueba cada acción legal y juega el resto de la mano con la IA normal en todos los asientos.
4. Valora el resultado de cada partida simulada desde su punto de vista (los puntos, bazas, fichas o piedras de la mano para su bando, menos los de los rivales).
5. Elige la acción que elegiría la IA normal, salvo que otra le gane claramente: su ventaja media, medida reconstrucción a reconstrucción, MUST superar 1,5 veces su error típico. Si varias le ganan claramente, elige la de mayor ventaja media. Con pocas simulaciones y mucho azar, elegir sin más la de mejor media escoge a menudo una acción que solo tuvo suerte.

El número de simulaciones MUST ser fijo para cada juego, no depender del reloj, para que la decisión sea reproducible y siga por debajo de 500 ms. Cada juego MUST tener un presupuesto de simulaciones por decisión. Con muchas acciones legales se hacen menos reconstrucciones, y si no llegan a dos por acción, la IA difícil MUST decidir como la normal (por ejemplo, al elegir las 3 cartas del pase en los Corazones). Un juego MAY limitar cuántas jugadas se simulan tras la acción y valorar lo que queda en ese punto (el Chinchón y el Pinacle, de manos largas).

En el Burro no hay simulación: la IA difícil pasa cartas como la normal y su ventaja está en reaccionar más rápido en la mesa.

En el Mus, la IA difícil MUST jugar como la normal mientras no haya una IA experta del Mus. La simulación no le gana a la normal porque, al repartir las manos ocultas al azar, no ve que el rival envida o acepta justo cuando lleva buena mano. La reconstrucción del Mus se conserva para esa IA futura.

En el Pinacle, la IA difícil MUST simular solo dos decisiones: si roba del mazo o se lleva el montón, y qué carta descarta cuando la normal descartaría. Lo que baja, añade o cambia lo decide como la normal. Con un montón de 10 cartas o más, o con alguna mano de más de 18, MUST decidir como la normal: quien se lleva el montón en la simulación acaba con muchas cartas y cada jugada simulada cuesta tanto que no cabría en el tiempo. La vista del Pinacle ya muestra todo lo público, incluidas las cartas que cada rival se llevó del montón, y la reconstrucción MUST mantenerlas en su mano.

En la Butifarra, la IA difícil MUST simular la elección del triunfo y cada carta que juega. Los contros MUST decidirse como la normal, por la misma razón que las apuestas del Mus: al repartir al azar las manos ocultas, la simulación no ve que el rival dice contro justo cuando lleva buena mano.

En el Truc, la IA difícil MUST simular solo la carta que juega. El envit, el truc, las respuestas y retirarse MUST decidirse como la normal, por la misma razón que en el Mus: la simulación no ve el farol ni que el rival apuesta justo cuando lleva buena mano.

En el Julepe, la IA difícil MUST simular si juega o pasa y cada carta que juega. Los descartes MUST decidirse como la normal: hay hasta 32 formas de descartar y no caben en el presupuesto.

En el Remigio, como en el Pinacle, la IA difícil MUST simular solo si roba del mazo o del montón y qué carta descarta cuando la normal descartaría. Lo que baja, añade o cambia lo MUST decidir como la normal.

En el Tute subastado, la IA difícil MUST simular la elección del triunfo, los cantes y cada carta que juega. Las pujas MUST decidirse como la normal, por la misma razón que en el Mus: la simulación no ve que el rival puja alto justo cuando lleva buena mano.

En la Cuatrola, la IA difícil MUST simular la elección del triunfo y de la carta llamada, y cada carta que juega. Las pujas MUST decidirse como la normal, por la misma razón que en el Tute subastado.

En el Mentiroso no hay simulación ni reconstrucción. La IA difícil MUST llevar la cuenta de las cartas que ha visto: las suyas que bajó, las descubiertas en cada «¡Mentiroso!» y quién se las llevó. Con esa cuenta MUST desconfiar cuando sabe que es imposible que digan la verdad, y calcula mejor que la normal lo probable que es una bajada. Al bajar MUST ser prudente: la verdad, o una sola carta si no tiene el valor, sin rellenar con falsas. Como en el resto de juegos, MUST ganar más partidas que la normal cuando se enfrentan.

En Picas, la IA difícil MUST simular solo la carta que juega, valorando los puntos de la mano de su pareja frente a los de la otra. La apuesta MUST decidirla como la normal, por la misma razón que en el Tute subastado: la simulación no ve que el rival apuesta alto justo cuando lleva buena mano.

En el Ocho loco, la IA difícil MUST simular sobre una IA experta que guarda los ochos mientras tenga otra carta que case, en lugar de sobre la normal, que los suelta como cualquier otra carta: guardar los ochos es lo que más pesa en el juego, y entre estrategias que los guardan la simulación apenas encuentra ventaja. Elige lo que elegiría la experta salvo que otra acción le gane claramente.

En el Blackjack, la IA difícil MUST simular sobre una IA experta que sigue la estrategia básica completa (pedir, plantarse, doblar o separar según su mano y la carta visible de la banca), en lugar de sobre la normal, que juega como la banca. Elige lo que elegiría la experta salvo que otra acción le gane claramente. La apuesta la MUST decidir como la experta, sin simular. En el Blackjack la suerte pesa tanto en una partida que ganar más partidas no mide el nivel: su prueba de fuerza MUST comparar, con las mismas cartas, las fichas que gana por mano cada nivel jugando solo, y la difícil MUST perder claramente menos por mano que la normal.

En el Gin Rummy, como en el Remigio, la IA difícil MUST simular solo qué carta roba (o si se queda la primera carta) y qué carta descarta cuando la normal descartaría. Si la normal cierra, MUST cerrar como ella. Como las manos son largas, MAY limitar cuántas jugadas se simulan y valorar los puntos sueltos que quedan en ese punto.

En el Rummy 500, como en el Remigio, la IA difícil MUST simular solo desde dónde roba (el mazo o una carta del descarte) y qué carta descarta cuando la normal descartaría. Lo que baja y añade lo MUST decidir como la normal. Como las manos son largas, MAY limitar cuántas jugadas se simulan y valorar lo que queda en ese punto.

En el Texas Hold'em no hay simulación de partidas ni reconstrucción: jugar el resto de la mano con la IA normal no dice nada de lo que harían los rivales con sus cartas. La IA difícil MUST estimar su probabilidad de ganar (su equity) repartiendo al azar, un número fijo de veces, las cartas tapadas de los rivales que siguen en la mano (a quien ha apostado o subido en la ronda, entre las manos jugables, como haría un jugador) y las comunes que faltan, y comparando su mejor mano con las de ellos. Con esa probabilidad:
- se retira si es menor que lo que le cuesta igualar frente al bote que quedaría (las probabilidades del bote);
- iguala o pasa si llega;
- apuesta o sube, entre medio bote y el bote, si es claramente mayor que la que le correspondería con todos iguales;
- y a veces, con poca probabilidad y cuando nadie ha apostado, apuesta de farol.

El azar de esas simulaciones y del farol sale de la semilla de la IA, así que la decisión es reproducible. Como en el resto de juegos, MUST ganar más partidas que la normal cuando se enfrentan.

En el Culo, la IA difícil MUST simular solo las cartas que juega o si pasa, valorando el puesto en que acaba la mano. Como los palos no cuentan, MUST probar una sola jugada por cada valor y número de cartas. Las cartas que devuelve en el intercambio las MUST decidir como la normal.

En la Canasta, como en el Pinacle, la IA difícil MUST simular solo si roba del mazo o se lleva el pozo, y qué carta descarta cuando la normal descartaría. Lo que baja, añade o deshace lo MUST decidir como la normal. Como las manos son largas, MAY limitar cuántas jugadas se simulan y valorar lo que queda en ese punto.

En cada juego con simulación, la IA difícil MUST ganar más partidas que la normal cuando se enfrentan.

#### Scenario: Una sola acción legal
- **WHEN** la IA difícil tiene una sola acción legal
- **THEN** la elige sin simular

#### Scenario: Demasiadas acciones para el presupuesto
- **WHEN** la IA difícil de los Corazones elige las 3 cartas del pase entre 286 combinaciones
- **THEN** decide como la normal, sin simular

#### Scenario: Difícil contra normal
- **WHEN** la IA difícil juega 200 partidas contra la normal (un bando contra otro, o un asiento contra los demás, alternando asientos)
- **THEN** gana más partidas de las que le corresponderían si las dos fueran iguales: más de la mitad con dos bandos, o más de una de cada N con N jugadores por su cuenta

#### Scenario: Qué simula el difícil del Pinacle
- **WHEN** la IA difícil del Pinacle puede bajar una combinación
- **THEN** la baja como la normal, sin simular

#### Scenario: Contros del difícil en la Butifarra
- **WHEN** la IA difícil de la Butifarra decide si dice contro
- **THEN** decide como la normal, sin simular

#### Scenario: Apuestas del difícil en el Truc
- **WHEN** la IA difícil del Truc decide si truca o responde a un envit
- **THEN** decide como la normal, sin simular

#### Scenario: Descartes del difícil en el Julepe
- **WHEN** la IA difícil del Julepe elige qué cartas descartar
- **THEN** decide como la normal, sin simular

#### Scenario: Qué simula el difícil del Remigio
- **WHEN** la IA difícil del Remigio puede bajar una combinación
- **THEN** la baja como la normal, sin simular

#### Scenario: Pujas del difícil en el Tute subastado
- **WHEN** la IA difícil del Tute subastado decide si puja o pasa
- **THEN** decide como la normal, sin simular

#### Scenario: Pujas del difícil en la Cuatrola
- **WHEN** la IA difícil de la Cuatrola decide si pasa, puja con rey o puja solo
- **THEN** decide como la normal, sin simular

#### Scenario: Apuesta del difícil en Picas
- **WHEN** la IA difícil de Picas decide cuántas bazas apuesta
- **THEN** decide como la normal, sin simular

#### Scenario: Cierre del difícil en el Gin Rummy
- **WHEN** la IA difícil del Gin Rummy puede cerrar
- **THEN** cierra como la normal, sin simular

#### Scenario: Qué simula el difícil del Rummy 500
- **WHEN** la IA difícil del Rummy 500 puede bajar una combinación
- **THEN** la baja como la normal, sin simular

#### Scenario: Probabilidades del bote en el Texas Hold'em
- **WHEN** la IA difícil del Texas Hold'em tiene que igualar 50 a un bote de 50 y estima que gana el 20 % de las veces
- **THEN** se retira, porque necesitaría ganar al menos un tercio

#### Scenario: Fuerza del difícil en el Blackjack
- **WHEN** la IA difícil y la normal juegan solas 300 partidas de 20 manos con las mismas semillas
- **THEN** la difícil pierde de media claramente menos fichas por mano que la normal

#### Scenario: Estrategia básica del difícil en el Blackjack
- **WHEN** la IA difícil del Blackjack tiene 12 y la banca muestra un 4
- **THEN** se planta, aunque la normal pediría

#### Scenario: El difícil del Ocho loco guarda los ochos
- **WHEN** la IA difícil del Ocho loco puede jugar el 4 de corazones o el 8 de picas, y las simulaciones no dan una ventaja clara a ninguna
- **THEN** juega el 4 de corazones y guarda el 8

#### Scenario: El difícil del Mentiroso recuerda las cartas
- **WHEN** en el Mentiroso se descubrieron 2 reinas que se llevó el asiento 1, la IA difícil tiene otra reina y el asiento 2 declara 2 reinas
- **THEN** la IA difícil dice «¡Mentiroso!», porque solo puede quedar una reina fuera de su mano y de la del asiento 1

#### Scenario: Intercambio del difícil en el Culo
- **WHEN** la IA difícil del Culo es presidente y elige qué cartas devolver
- **THEN** decide como la normal, sin simular

#### Scenario: Qué simula el difícil de la Canasta
- **WHEN** la IA difícil de la Canasta puede bajar una combinación
- **THEN** la baja como la normal, sin simular
