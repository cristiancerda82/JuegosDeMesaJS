# niveles-ia Specification

## Purpose
TBD - created by archiving change niveles-ia. Update Purpose after archive.

## Requirements

### Requirement: Tres niveles en cada juego contra la máquina
Cada juego con IA (Brisca, Tute, Guiñote, Escoba, Chinchón, Siete y media, Cinquillo, Pocha, Mus, Corazones, Burro, Pinacle, Butifarra, Truc, Julepe, Remigio, Tute subastado, Cuatrola, Mentiroso, Ocho loco, Picas, Blackjack, Gin Rummy, Rummy 500, Texas Hold'em, Culo, Canasta, Whist, Sevens, Casino, Durak, Euchre, Big Two, Cribbage, Belote, Schnapsen, Skat, Oh Hell, Spite and Malice, Bridge, Pesca, Kings in the Corner, Bezique, Doppelkopf, Tarot y Sueca) MUST ofrecer una IA para cada nivel: `facil`, `normal` y `dificil`. La IA `normal` MUST ser la IA básica del juego. Todos los niveles MUST cumplir las garantías generales de la IA:
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

### Requirement: Nivel fácil
La IA fácil MUST decidir como la normal salvo en una parte de sus decisiones (el 30 %, elegida con su propio azar), en las que MUST elegir una acción legal al azar. En el Burro, el error MUST afectar solo a la carta que pasa (en el 50 % de los pases), nunca a plantarse.

En cada juego, la IA normal MUST ganar claramente más partidas que la fácil cuando se enfrentan.

#### Scenario: Se equivoca a veces
- **WHEN** la IA fácil decide muchas veces en situaciones en las que la normal elige siempre la misma acción
- **THEN** a veces elige esa acción y a veces otra

#### Scenario: Normal contra fácil
- **WHEN** la IA normal juega 500 partidas contra la fácil (un bando contra otro, o un asiento contra los demás, alternando asientos)
- **THEN** gana más partidas de las que le corresponderían si las dos fueran iguales

### Requirement: Reconstrucción de las cartas ocultas
Cada juego con IA difícil (todos menos el Burro, el Mentiroso y el Texas Hold'em) MUST tener una función que, a partir de la vista de un asiento y de un azar, construya un estado completo del juego coherente con esa vista. Las cartas que el asiento no ve (las manos ajenas, el mazo y cualquier otra carta oculta) MUST repartirse al azar entre los sitios ocultos, respetando cuántas cartas hay en cada uno. Todo lo visible MUST quedar igual. La vista de ese asiento en el estado reconstruido MUST ser idéntica a la vista de partida.

Si una vista no tiene datos públicos suficientes para reconstruir el estado, se MUST añadir a la vista lo que falte, siempre que no sea información oculta y que la spec del juego no lo prohíba. Se añaden:
- las cartas ya jugadas en bazas de la mano (Brisca, Tute, Guiñote, Pocha, Corazones, Butifarra, Truc, Julepe, Tute subastado, Cuatrola, Picas y Whist);
- los puntos de las bazas de cada jugador (Brisca, Tute y Guiñote) o de cada bando (Butifarra);
- quién puede cantar todavía (Tute, Guiñote y Tute subastado);
- quién ha pasado ya en el lance y cuántas cartas hay en el montón de descartes, sin cuáles (Mus).
- cuántos jugadores han pasado seguidos sin poder robar y, de la última vez que robó cada uno, qué palo y qué número no tenía (Ocho loco).

En la Escoba, las cartas recogidas siguen sin mostrarse (spec juego-escoba): la reconstrucción las reparte al azar con el número de cartas que se ve. En el Mus, las manos ajenas MUST cuadrar con lo declarado de pares y juego. En la Butifarra, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que no falló pudiendo, sin triunfos. En el Truc, si se aceptó el envit, la mano de cada jugador cuyos puntos de envit se mostraron MUST dar esos puntos con sus cartas en mano y las que ya jugó. En el Julepe, las cartas descartadas y las del mazo son ocultas, y la carta de triunfo a la vista MUST seguir en la mano del repartidor. En el Remigio, la vista muestra todo el montón y las combinaciones de la mesa, y la reconstrucción reparte al azar entre las manos ajenas y el mazo solo las cartas que no se ven. En el Tute subastado, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que tampoco jugó triunfo, sin triunfos. En la Cuatrola, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo (contando los matadores como triunfo, salvo los que el privilegio le dejaba guardar), y mientras el compañero esté oculto la carta llamada MUST quedar en la mano de uno de los otros tres, nunca en la del jugador. En Picas, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En el Blackjack, la carta tapada de la banca y la baraja MUST repartirse al azar entre las cartas que no se ven; si la banca miró su carta tapada sin descubrirla, esa carta MUST ser una que no le dé blackjack. En el Ocho loco, quien robó por no poder jugar no tenía entonces ni ese palo, ni ese número, ni ochos: todas sus cartas menos una (la robada) MUST elegirse entre las que lo cumplen, y si las cartas ocultas no alcanzan para cumplirlo, se reparten sin esa restricción. En el Gin Rummy, el descarte entero es público, y las cartas que el rival cogió del descarte y no ha soltado MUST quedar en su mano; el resto de su mano y el mazo se reparten al azar entre las cartas que no se ven. En el Rummy 500, el descarte y las combinaciones de la mesa son públicos; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Culo, todas las cartas jugadas son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven; las cartas que el asiento dio en el intercambio y aún no se han jugado MUST quedar en la mano de quien las recibió. En la Canasta, el pozo, las combinaciones y los treses rojos son públicos, y las cartas que cada jugador se llevó del pozo y aún tiene MUST quedar en su mano; el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Whist, como en Picas, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo, y la carta del triunfo MUST seguir en la mano del repartidor mientras no la haya jugado. En el Sevens, como en el Cinquillo, las escaleras de la mesa son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven. En el Casino, la mesa y las cartas recogidas son públicas; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven, y el dueño de cada construcción ajena MUST tener en la mano una carta de su valor. En el Durak, la mesa, el descarte y la carta del triunfo son públicos; las cartas que cada jugador se llevó de la mesa y aún tiene, y la carta del triunfo si ya la robó alguien, MUST quedar en su mano, y el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Euchre, como en el Whist, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo (con el bower izquierdo como triunfo); si el repartidor recogió la carta vuelta y aún no la ha jugado, MUST seguir en su mano; las 3 cartas ocultas y el descarte del repartidor se reparten al azar con el resto de las cartas que no se ven. En el Big Two, como en el Culo, todas las cartas jugadas son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven, cada una con el número de cartas que tiene. En el Cribbage, el starter y las cartas jugadas son públicos; la mano del otro, las cartas que echó al crib y el mazo se reparten al azar entre las cartas que no se ven, y las que el propio jugador echó al crib MUST seguir en el crib. En el Belote, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que tampoco jugó triunfo cuando debía, sin triunfos; la carta vuelta MUST seguir en la mano de quien eligió el triunfo mientras no la haya jugado, y quien anunció «Belote» MUST tener la otra carta (rey o dama del triunfo) hasta que la juegue; el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Schnapsen, la mano del rival y las cartas boca abajo del mazo se reparten al azar entre las cartas que no se ven; la carta vuelta que se llevó el rival al cambiar la J, y la pareja de un cante suyo que aún no ha jugado, MUST quedar en su mano; con las reglas estrictas, la mano del rival MUST quedar sin el palo de salida que no siguió, y sin triunfos si tampoco falló. En el Skat, las manos ajenas y el Skat se reparten al azar entre las cartas que no se ven; la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo (con las J como triunfo en palo y Grand); si el solista juega ouvert, su mano es visible, y si el asiento es el solista y cogió el Skat, el Skat es su descarte. En el Oh Hell, la carta del triunfo es pública; las manos ajenas y el resto del mazo se reparten al azar entre las cartas que no se ven, y la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En el Spite and Malice, los descartes, las escaleras, las escaleras completas y la carta de arriba de cada montón son públicos; la mano del rival, las cartas boca abajo de los dos montones (también las del propio) y el mazo se reparten al azar entre las cartas que no se ven, contando las copias de las dos barajas. En el Bridge, la mano del muerto es pública desde la primera carta; las manos ajenas que no se ven se reparten al azar entre las cartas que no se ven, cada una con el número de cartas que tiene, y la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En la Pesca, los cuartetos y las cartas que se dieron o se enseñaron son públicos: las que siguen en una mano MUST quedarse en ella; cada jugador MUST tener al menos una carta de cada valor que pidió y aún no ha dado ni bajado, y ninguna de un valor que le pidieron y no tenía, mientras no haya vuelto a robar; el resto de las manos ajenas y el mar se reparten al azar entre las cartas que no se ven. En Kings in the Corner, las pilas son públicas; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Bezique, las cartas cantadas del rival son públicas y MUST quedarse en su mano; el resto de su mano y el mazo se reparten al azar entre las cartas que no se ven, contando las copias de las dos barajas, y la carta vuelta sigue en la mesa mientras nadie la haya cambiado ni robado. En el Doppelkopf, las bazas de la mano son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven, respetando lo que se sabe: la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo; en el juego normal, quien se sabe del bando Re y aún no ha jugado una Q de tréboles MUST tener una, quien se sabe del bando Contra MUST NOT tener ninguna, y las dos Q de tréboles MUST quedar en manos distintas. En el Tarot, las bazas de la mano, el perro que se enseña, los triunfos descartados y las poignées son públicos. Las manos ajenas, el perro que no se ve y el descarte (para quien no es el preneur) se reparten al azar entre las cartas que no se ven, respetando lo que se sabe: la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que no jugó triunfo sin poder seguir, sin triunfos; los triunfos enseñados en una poignée y aún no jugados MUST quedar en la mano de quien la enseñó; el descarte del preneur MUST NOT tener Reyes ni oudlers; y con 5, la carta llamada aún no jugada MUST NOT quedar en la mano del preneur. En la Sueca, como en el Whist, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo, y la carta del triunfo MUST seguir en la mano del repartidor mientras no la haya jugado.

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

#### Scenario: Carta del triunfo en el Whist
- **WHEN** en el Whist el repartidor aún no ha jugado la carta del triunfo y otro jugador reconstruye el estado
- **THEN** la mano reconstruida del repartidor tiene la carta del triunfo

#### Scenario: Construcción ajena en el Casino
- **WHEN** en el Casino el rival tiene en la mesa una construcción de 8 y el jugador reconstruye el estado
- **THEN** la mano reconstruida del rival tiene al menos un 8

#### Scenario: Cartas que se llevó un rival en el Durak
- **WHEN** en el Durak el rival se llevó de la mesa el 9 de corazones y aún no lo ha jugado, y el jugador reconstruye el estado
- **THEN** la mano reconstruida del rival tiene el 9 de corazones

#### Scenario: Carta vuelta en la mano del repartidor en el Euchre
- **WHEN** en el Euchre se pidió el triunfo, el repartidor recogió la carta vuelta y aún no la ha jugado, y otro jugador reconstruye el estado
- **THEN** la mano reconstruida del repartidor tiene la carta vuelta

#### Scenario: Belote anunciado
- **WHEN** en el Belote un rival anunció «Belote» con el rey del triunfo y aún no ha jugado la dama, y el jugador reconstruye el estado
- **THEN** la mano reconstruida de ese rival tiene la dama del triunfo

#### Scenario: Cante del rival en el Schnapsen
- **WHEN** en el Schnapsen el rival cantó 20 en picas saliendo con el K y el jugador reconstruye el estado
- **THEN** la mano reconstruida del rival tiene la Q de picas

#### Scenario: Descarte del solista en el Skat
- **WHEN** en el Skat el solista cogió el Skat, se descartó y reconstruye el estado
- **THEN** el Skat reconstruido es su descarte

#### Scenario: Fallos en el Oh Hell
- **WHEN** en el Oh Hell un rival no siguió el palo de corazones en una baza de la mano y el jugador reconstruye el estado
- **THEN** la mano reconstruida de ese rival no tiene ningún corazón

#### Scenario: Montón propio en el Spite and Malice
- **WHEN** en el Spite and Malice el jugador reconstruye el estado
- **THEN** la carta de arriba de su montón es la que ve, y las de debajo pueden cambiar con el azar

#### Scenario: El muerto en el Bridge
- **WHEN** en el Bridge un defensor reconstruye el estado después de la primera carta
- **THEN** la mano del muerto es la que ve, y solo cambian las manos del declarante y de su compañero

#### Scenario: Lo que se sabe en la Pesca
- **WHEN** en la Pesca el jugador 1 pidió reyes y se reconstruye el estado desde la vista del jugador 0
- **THEN** la mano reconstruida del jugador 1 tiene al menos un rey

#### Scenario: Las pilas en Kings in the Corner
- **WHEN** en Kings in the Corner se reconstruye el estado desde la vista de un jugador
- **THEN** las 8 pilas son las que ve, y las manos ajenas y el mazo pueden cambiar con el azar

#### Scenario: Cartas cantadas en el Bezique
- **WHEN** en el Bezique el rival tiene cantado un matrimonio y se reconstruye el estado
- **THEN** la mano reconstruida del rival tiene el K y la Q de ese matrimonio

#### Scenario: Bandos en el Doppelkopf
- **WHEN** en el Doppelkopf el jugador 2 anunció «Re» sin haber jugado una Q de tréboles y se reconstruye el estado desde la vista del jugador 0
- **THEN** la mano reconstruida del jugador 2 tiene una Q de tréboles

#### Scenario: Poignée en el Tarot
- **WHEN** en el Tarot el jugador 2 enseñó una poignée y se reconstruye el estado desde la vista del jugador 0
- **THEN** la mano reconstruida del jugador 2 tiene todos los triunfos de la poignée que aún no ha jugado

#### Scenario: Carta del triunfo en la Sueca
- **WHEN** en la Sueca el repartidor aún no ha jugado la carta del triunfo y se reconstruye el estado desde la vista de otro jugador
- **THEN** la mano reconstruida del repartidor tiene la carta del triunfo

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

En el Whist, la IA difícil MUST simular cada carta que juega, valorando las bazas de su pareja frente a las de la otra al acabar la mano, como en Picas.

En el Sevens, la IA difícil MUST simular cada carta que juega, como en el Cinquillo, valorando las cartas que le quedan a cada uno al acabar la mano.

En el Casino, la IA difícil MUST simular cada jugada (recoger, construir o dejar) hasta el final de la mano, valorando los puntos de la mano de su lado frente a los de los demás.

En el Durak, la IA difícil MUST simular cada decisión (atacar, echar, defender, llevarse las cartas o pasar) un número limitado de jugadas, valorando quedarse sin cartas antes que los demás.

En el Euchre, la IA difícil MUST simular cada carta que juega hasta el final de la mano, valorando los puntos de la mano de su pareja; la elección del triunfo, jugar solo y el descarte los MUST decidir como la normal.

En el Big Two, la IA difícil MUST simular hasta el final de la mano unas pocas jugadas candidatas (la de la normal, pasar y las más bajas de cada tipo), valorando quedarse sin cartas antes y con menos puntos que los demás.

En el Cribbage, la IA difícil MUST simular cada carta que juega hasta el final de la mano, valorando sus puntos de la mano frente a los del otro; las cartas que echa al crib las MUST decidir como la normal.

En el Belote, la IA difícil MUST simular cada carta que juega hasta el final de la mano, valorando los puntos de la mano de su pareja frente a los de la otra; la elección del triunfo la MUST decidir como la normal.

En el Schnapsen, la IA difícil MUST simular cada decisión (cambiar la J, cantar, cerrar el mazo y la carta que juega) hasta el final de la mano, valorando los puntos de partida que gana o pierde y los puntos de la mano.

En el Skat, la IA difícil MUST simular cada carta que juega hasta el final de la mano, valorando los puntos que gana o pierde el solista desde su lado; la subasta, el Skat, el descarte y la declaración del juego los MUST decidir como la normal, por la misma razón que las pujas del Tute subastado.

En el Oh Hell, la IA difícil MUST simular su apuesta y cada carta que juega hasta el final de la mano, valorando sus puntos de la mano frente a la media de los demás. Con manos largas, si hay demasiadas apuestas posibles para el presupuesto, MUST apostar como la normal.

En el Spite and Malice, la IA difícil MUST simular cada jugada candidata (las que mueven la carta de su montón, las de la cadena de la normal y los descartes) un número limitado de jugadas por delante, valorando las cartas que le quedan en el montón frente a las del rival.

En el Bridge, la IA difícil MUST subastar como la normal y simular cada carta que juega, también por el muerto, hasta el final de la mano, valorando los puntos de la mano de su pareja frente a los de la rival.

En la Pesca, la IA difícil MUST simular cada petición posible unos turnos por delante, valorando sus cuartetos y sus cartas frente a los del mejor rival.

En Kings in the Corner, la IA difícil MUST simular cada jugada posible un número limitado de jugadas por delante, valorando las cartas que le quedan frente a las del rival que menos tiene.

En el Bezique, la IA difícil MUST declarar como la normal y simular cada carta que juega hasta el final de la mano, valorando sus puntos de la mano frente a los del rival.

En el Doppelkopf, la IA difícil MUST hacer las reservas y los anuncios como la normal y simular cada carta que juega hasta el final de la mano, valorando lo que gana o pierde en la mano.

En el Tarot, la IA difícil MUST pujar, llamar, descartar y enseñar la poignée como la normal y simular cada carta que juega hasta el final de la mano, valorando lo que gana o pierde en la mano.

En la Sueca, la IA difícil MUST simular cada carta que juega hasta el final de la mano, valorando los puntos de cartas y los juegos de su pareja frente a los de la otra.

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
