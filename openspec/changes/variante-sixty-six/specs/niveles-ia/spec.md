## MODIFIED Requirements

### Requirement: Tres niveles en cada juego contra la máquina
Cada juego con IA (Brisca, Tute, Guiñote, Escoba, Chinchón, Siete y media, Cinquillo, Pocha, Mus, Corazones, Burro, Pinacle, Butifarra, Truc, Julepe, Remigio, Tute subastado, Cuatrola, Mentiroso, Ocho loco, Picas, Blackjack, Gin Rummy, Rummy 500, Texas Hold'em, Culo, Canasta, Whist, Sevens, Casino, Durak, Euchre, Big Two, Cribbage, Belote, Schnapsen, Skat, Oh Hell, Spite and Malice, Bridge, Pesca, Kings in the Corner, Bezique, Doppelkopf, Tarot, Sueca, Piquet, Jass, Klaverjas, Barbu, Five Hundred, Scopa, Tressette, Schafkopf, Truco, Préférence, Cuarenta, Pishti, Écarté y Sixty-six) MUST ofrecer una IA para cada nivel (el Sixty-six, como variante del Schnapsen, usa las del Schnapsen): `facil`, `normal` y `dificil`. La IA `normal` MUST ser la IA básica del juego. Todos los niveles MUST cumplir las garantías generales de la IA:
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
- las cartas ya jugadas en bazas de la mano (Brisca, Tute, Guiñote, Pocha, Corazones, Butifarra, Truc, Julepe, Tute subastado, Cuatrola, Picas y Whist);
- los puntos de las bazas de cada jugador (Brisca, Tute y Guiñote) o de cada bando (Butifarra);
- quién puede cantar todavía (Tute, Guiñote y Tute subastado);
- quién ha pasado ya en el lance y cuántas cartas hay en el montón de descartes, sin cuáles (Mus).
- cuántos jugadores han pasado seguidos sin poder robar y, de la última vez que robó cada uno, qué palo y qué número no tenía (Ocho loco).

En la Escoba, las cartas recogidas siguen sin mostrarse (spec juego-escoba): la reconstrucción las reparte al azar con el número de cartas que se ve. En el Mus, las manos ajenas MUST cuadrar con lo declarado de pares y juego. En la Butifarra, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que no falló pudiendo, sin triunfos. En el Truc, si se aceptó el envit, la mano de cada jugador cuyos puntos de envit se mostraron MUST dar esos puntos con sus cartas en mano y las que ya jugó. En el Julepe, las cartas descartadas y las del mazo son ocultas, y la carta de triunfo a la vista MUST seguir en la mano del repartidor. En el Remigio, la vista muestra todo el montón y las combinaciones de la mesa, y la reconstrucción reparte al azar entre las manos ajenas y el mazo solo las cartas que no se ven. En el Tute subastado, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que tampoco jugó triunfo, sin triunfos. En la Cuatrola, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo (contando los matadores como triunfo, salvo los que el privilegio le dejaba guardar), y mientras el compañero esté oculto la carta llamada MUST quedar en la mano de uno de los otros tres, nunca en la del jugador. En Picas, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En el Blackjack, la carta tapada de la banca y la baraja MUST repartirse al azar entre las cartas que no se ven; si la banca miró su carta tapada sin descubrirla, esa carta MUST ser una que no le dé blackjack. En el Ocho loco, quien robó por no poder jugar no tenía entonces ni ese palo, ni ese número, ni ochos: todas sus cartas menos una (la robada) MUST elegirse entre las que lo cumplen, y si las cartas ocultas no alcanzan para cumplirlo, se reparten sin esa restricción. En el Gin Rummy, el descarte entero es público, y las cartas que el rival cogió del descarte y no ha soltado MUST quedar en su mano; el resto de su mano y el mazo se reparten al azar entre las cartas que no se ven. En el Rummy 500, el descarte y las combinaciones de la mesa son públicos; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Culo, todas las cartas jugadas son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven; las cartas que el asiento dio en el intercambio y aún no se han jugado MUST quedar en la mano de quien las recibió. En la Canasta, el pozo, las combinaciones y los treses rojos son públicos, y las cartas que cada jugador se llevó del pozo y aún tiene MUST quedar en su mano; el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Whist, como en Picas, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo, y la carta del triunfo MUST seguir en la mano del repartidor mientras no la haya jugado. En el Sevens, como en el Cinquillo, las escaleras de la mesa son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven. En el Casino, la mesa y las cartas recogidas son públicas; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven, y el dueño de cada construcción ajena MUST tener en la mano una carta de su valor. En el Durak, la mesa, el descarte y la carta del triunfo son públicos; las cartas que cada jugador se llevó de la mesa y aún tiene, y la carta del triunfo si ya la robó alguien, MUST quedar en su mano, y el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Euchre, como en el Whist, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo (con el bower izquierdo como triunfo); si el repartidor recogió la carta vuelta y aún no la ha jugado, MUST seguir en su mano; las 3 cartas ocultas y el descarte del repartidor se reparten al azar con el resto de las cartas que no se ven. En el Big Two, como en el Culo, todas las cartas jugadas son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven, cada una con el número de cartas que tiene. En el Cribbage, el starter y las cartas jugadas son públicos; la mano del otro, las cartas que echó al crib y el mazo se reparten al azar entre las cartas que no se ven, y las que el propio jugador echó al crib MUST seguir en el crib. En el Belote, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que tampoco jugó triunfo cuando debía, sin triunfos; la carta vuelta MUST seguir en la mano de quien eligió el triunfo mientras no la haya jugado, y quien anunció «Belote» MUST tener la otra carta (rey o dama del triunfo) hasta que la juegue; el resto de las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Schnapsen, la mano del rival y las cartas boca abajo del mazo se reparten al azar entre las cartas que no se ven; la carta vuelta que se llevó el rival al cambiar la J, y la pareja de un cante suyo que aún no ha jugado, MUST quedar en su mano; con las reglas estrictas, la mano del rival MUST quedar sin el palo de salida que no siguió, y sin triunfos si tampoco falló. En el Skat, las manos ajenas y el Skat se reparten al azar entre las cartas que no se ven; la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo (con las J como triunfo en palo y Grand); si el solista juega ouvert, su mano es visible, y si el asiento es el solista y cogió el Skat, el Skat es su descarte. En el Oh Hell, la carta del triunfo es pública; las manos ajenas y el resto del mazo se reparten al azar entre las cartas que no se ven, y la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En el Spite and Malice, los descartes, las escaleras, las escaleras completas y la carta de arriba de cada montón son públicos; la mano del rival, las cartas boca abajo de los dos montones (también las del propio) y el mazo se reparten al azar entre las cartas que no se ven, contando las copias de las dos barajas. En el Bridge, la mano del muerto es pública desde la primera carta; las manos ajenas que no se ven se reparten al azar entre las cartas que no se ven, cada una con el número de cartas que tiene, y la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo. En la Pesca, los cuartetos y las cartas que se dieron o se enseñaron son públicos: las que siguen en una mano MUST quedarse en ella; cada jugador MUST tener al menos una carta de cada valor que pidió y aún no ha dado ni bajado, y ninguna de un valor que le pidieron y no tenía, mientras no haya vuelto a robar; el resto de las manos ajenas y el mar se reparten al azar entre las cartas que no se ven. En Kings in the Corner, las pilas son públicas; las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven. En el Bezique, las cartas cantadas del rival son públicas y MUST quedarse en su mano; el resto de su mano y el mazo se reparten al azar entre las cartas que no se ven, contando las copias de las dos barajas, y la carta vuelta sigue en la mesa mientras nadie la haya cambiado ni robado. En el Doppelkopf, las bazas de la mano son públicas y las manos ajenas se reparten al azar entre las cartas que no se ven, respetando lo que se sabe: la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo; en el juego normal, quien se sabe del bando Re y aún no ha jugado una Q de tréboles MUST tener una, quien se sabe del bando Contra MUST NOT tener ninguna, y las dos Q de tréboles MUST quedar en manos distintas. En el Tarot, las bazas de la mano, el perro que se enseña, los triunfos descartados y las poignées son públicos. Las manos ajenas, el perro que no se ve y el descarte (para quien no es el preneur) se reparten al azar entre las cartas que no se ven, respetando lo que se sabe: la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo, y la de uno que no jugó triunfo sin poder seguir, sin triunfos; los triunfos enseñados en una poignée y aún no jugados MUST quedar en la mano de quien la enseñó; el descarte del preneur MUST NOT tener Reyes ni oudlers; y con 5, la carta llamada aún no jugada MUST NOT quedar en la mano del preneur. En la Sueca, como en el Whist, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo, y la carta del triunfo MUST seguir en la mano del repartidor mientras no la haya jugado. En el Piquet, la mano del rival, sus descartes y el montón se reparten al azar entre las cartas que no se ven, con el tamaño que se ve de cada uno: las cartas de las combinaciones que el rival ganó en las declaraciones y no ha jugado MUST quedar en su mano, y la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo. En el Jass, la mano de un jugador que echó una carta que no era del palo de salida ni del triunfo MUST quedar sin cartas del palo de salida; la de uno que no echó triunfo cuando salió triunfo MUST quedar sin más triunfos que la Jota del triunfo; y las cartas de las declaraciones ganadoras que no se han jugado MUST quedar en la mano de su jugador. En el Klaverjas, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo; si además no echó triunfo cuando no había triunfo en la baza, o no echó triunfo cuando salió triunfo, MUST quedar sin triunfos. En el Barbu, en los contratos de bazas, la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo y, en el triunfo, si además no falló, sin triunfos; en el dominó, la mano de un jugador que pasó MUST quedar sin cartas que encajaran en ese momento. En el Five Hundred, las manos ajenas y los descartes de la viuda (si los hizo otro) se reparten al azar entre las cartas que no se ven, con su tamaño; la mano de un jugador que no siguió el palo de salida (contando la otra Jota del color del triunfo como triunfo) MUST quedar sin cartas de ese palo, y en el misère abierto las cartas de quien juega MUST ser las que se ven. En la Scopa, como en la Escoba, las cartas recogidas no se ven: la reconstrucción reparte al azar las manos ajenas, el mazo y las recogidas de cada bando, con el número de cartas que se ve. En el Tressette, como no hay triunfo, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo; el resto de las manos ajenas se reparte al azar entre las cartas que no se ven. En el Schafkopf, la mano de un jugador que no siguió el palo de salida en una baza de la mano MUST quedar sin cartas de ese palo (contando todos los triunfos como un palo); en el Rufspiel, mientras no se haya echado el As llamado, MUST quedar en la mano de uno de los dos jugadores que no son ni el que juega ni el que reconstruye, salvo que lo tenga él, y nunca en la de quien ya no puede tenerlo por los palos que no siguió. En el Truco, como en el Truc, si se quiso el envido, la mano de cada jugador cuyos puntos de envido se mostraron MUST dar esos puntos con sus cartas en mano y las que ya jugó. En el Préférence, la viuda enseñada es pública, y las manos ajenas, la viuda sin enseñar y los descartes ajenos se reparten al azar entre las cartas que no se ven, con su tamaño: la mano de un jugador que no siguió el palo de salida MUST quedar sin cartas de ese palo y, si tampoco echó triunfo, sin triunfos. En el Cuarenta, como en la Scopa, las cartas recogidas no se ven: la reconstrucción reparte al azar las manos ajenas, el mazo y las recogidas de cada bando, con el número de cartas que se ve; la mano de quien anunció ronda en el reparto MUST tener las cartas de ese número que tenía y aún no ha jugado, y si su ronda era de tres, MUST NOT tener la cuarta. En el Pishti, las cartas recogidas y las tapadas del montón no se ven: la reconstrucción reparte al azar las manos ajenas, el mazo, las tapadas y las recogidas de cada bando, con el número de cartas que se ve; las cartas a la vista del montón se quedan donde están. En el Écarté, la mano del rival, sus descartes y el montón se reparten al azar entre las cartas que no se ven, con su tamaño: la mano del rival MUST quedar sin el palo de salida que no siguió, y sin triunfos si tampoco falló; si anunció el rey de triunfo y aún no lo ha jugado, MUST tenerlo en la mano. En el Sixty-six, la reconstrucción es la del Schnapsen con la baraja de 24 cartas y las manos de 6.

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

#### Scenario: Declaraciones en el Piquet
- **WHEN** en el Piquet el rival ganó la secuencia con una quinta de corazones que aún no ha jugado y se reconstruye el estado
- **THEN** la mano reconstruida del rival tiene esas cinco cartas

#### Scenario: Fallar en el Jass no dice nada
- **WHEN** en el Jass un jugador echa triunfo en una baza de corazones y se reconstruye el estado desde la vista de otro jugador
- **THEN** la mano reconstruida de ese jugador puede tener corazones

#### Scenario: Sin triunfos en el Klaverjas
- **WHEN** en el Klaverjas un jugador no sigue una baza de corazones sin triunfos y echa una carta de picas, que no es triunfo, y se reconstruye el estado desde la vista de otro jugador
- **THEN** la mano reconstruida de ese jugador no tiene corazones ni triunfos

#### Scenario: Pasar en el dominó del Barbu
- **WHEN** en el dominó del Barbu un jugador pasa con la fila de picas del 9 a la Dama y se reconstruye el estado desde la vista de otro jugador
- **THEN** la mano reconstruida de ese jugador no tiene el 8 ni el Rey de picas

#### Scenario: Descartes ajenos en el Five Hundred
- **WHEN** en el Five Hundred otro jugador ganó la subasta y se reconstruye el estado desde la vista del jugador 0
- **THEN** el jugador 0 conserva su mano, las manos ajenas tienen su tamaño y los descartes del otro son 3 cartas que el jugador 0 no ve

#### Scenario: Recogidas en la Scopa
- **WHEN** en la Scopa se reconstruye el estado desde la vista del jugador 0
- **THEN** el jugador 0 conserva su mano y la mesa, y las manos ajenas, el mazo y las recogidas tienen el tamaño que se ve

#### Scenario: Palos no seguidos en el Tressette
- **WHEN** en el Tressette el jugador 1 no siguió una baza de oros y se reconstruye el estado desde la vista del jugador 0
- **THEN** la mano reconstruida del jugador 1 no tiene ningún oro

#### Scenario: As llamado en el Schafkopf
- **WHEN** en un Rufspiel del jugador 1 con el As de picas aún sin echar se reconstruye el estado desde la vista del jugador 0, que no lo tiene
- **THEN** el As de picas está en la mano del jugador 2 o del 3

#### Scenario: Envido mostrado en el Truco
- **WHEN** en el Truco un rival mostró 31 puntos de envido y se reconstruye el estado
- **THEN** sus cartas en mano, junto con las que ya jugó, suman 31 puntos de envido

#### Scenario: Fallos en el Préférence
- **WHEN** en el Préférence con triunfo de corazones el jugador 1 no siguió una baza de picas y echó un diamante, y se reconstruye el estado desde la vista del jugador 0
- **THEN** la mano reconstruida del jugador 1 no tiene picas ni corazones

#### Scenario: Ronda en el Cuarenta
- **WHEN** en el Cuarenta el rival anunció ronda de cincos, aún no ha jugado ninguno y el jugador reconstruye el estado
- **THEN** la mano reconstruida del rival tiene tres cincos

#### Scenario: Tapadas del Pishti
- **WHEN** en el Pishti el jugador reconstruye el estado al empezar la mano
- **THEN** la carta de arriba del montón es la que ve, y las 3 tapadas pueden cambiar con el azar

#### Scenario: Rey anunciado en el Écarté
- **WHEN** en el Écarté el rival anunció el rey de triunfo, aún no lo ha jugado y el jugador reconstruye el estado
- **THEN** la mano reconstruida del rival tiene el rey de triunfo

#### Scenario: Baraja del Sixty-six
- **WHEN** en el Sixty-six el jugador reconstruye el estado al empezar la mano
- **THEN** la mano reconstruida del rival tiene 6 cartas de la baraja de 24, y las cartas que no ve pueden ser nueves
