# ia-jugadores Specification

## Purpose
Define los jugadores controlados por la IA: qué información usan, qué garantías dan y con qué nivel de juego se ofrece la primera IA, la de la Brisca.

## Requirements

### Requirement: Decide solo con la vista del jugador
Un jugador IA MUST decidir usando solo la vista de su asiento, la misma que recibiría un humano. MUST NOT tener acceso a las manos ajenas, al orden del mazo ni a la semilla.

#### Scenario: Sin información oculta
- **WHEN** la IA decide su jugada
- **THEN** su decisión depende solo de la vista de su asiento; dos estados con la misma vista para ese asiento producen la misma decisión

### Requirement: Siempre juega una acción legal
Cuando tiene acciones legales, la IA MUST elegir siempre una de ellas.

#### Scenario: Partidas completas
- **WHEN** se juegan 1.000 partidas de Brisca entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

### Requirement: Reproducible
Si la IA usa azar, MUST tomarlo de una semilla propia, de modo que la misma vista y la misma semilla den la misma decisión.

#### Scenario: Misma decisión
- **WHEN** se le pide a la IA una decisión dos veces con la misma vista y la misma semilla
- **THEN** elige la misma acción

### Requirement: Tiempo de respuesta
La IA MUST decidir en menos de 500 ms en un móvil de gama media. El tiempo de espera visible antes de que juegue la IA es una decisión del cliente, no de la IA.

#### Scenario: Decisión rápida
- **WHEN** la IA decide una jugada de Brisca en cualquier momento de la partida
- **THEN** responde en menos de 500 ms

### Requirement: Asientos intercambiables
Cualquier asiento de una partida MUST poder ocuparlo un humano o una IA, sin que las reglas del juego cambien.

#### Scenario: Partida solo de IAs
- **WHEN** se crea una partida de Brisca con todos los asientos ocupados por IAs
- **THEN** la partida se juega completa hasta su resultado

### Requirement: IA de Brisca nivel básico
La Brisca MUST ofrecer al menos un nivel de IA que juegue de forma razonable:
- Si puede ganar una baza con puntos sin gastar triunfo, la gana.
- No gasta triunfos altos en bazas sin puntos.
- Cuando no puede ganar, entrega la carta de menor valor.
- Cambia la muestra cuando le conviene.

Este nivel MUST ganar a un jugador que elige cartas al azar en la mayoría de las partidas.

#### Scenario: Contra el azar
- **WHEN** la IA básica juega 1.000 manos contra un jugador que elige cartas legales al azar
- **THEN** gana claramente más de la mitad de las manos

#### Scenario: No regala puntos
- **WHEN** la IA responde a una baza que no puede ganar
- **THEN** juega una carta de 0 puntos si tiene alguna

### Requirement: IA de Tute nivel básico
El Tute MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Canta el tute cuando puede y, si no, canta siempre que puede, las 40 antes que las 20.
- Cambia el 7 de triunfo cuando puede.
- No juega el rey ni el caballo de una pareja que aún puede cantar, si tiene otra carta legal.
- Si puede ganar una baza con puntos sin gastar triunfo, la gana, y cuando no puede ganar entrega la carta de menor valor.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las manos.

#### Scenario: Canta lo que puede
- **WHEN** la IA ganó la última baza y tiene el rey y el caballo de triunfo sin cantar
- **THEN** canta las 40 antes de salir

#### Scenario: Guarda la pareja
- **WHEN** la IA sale, tiene el rey y el caballo de un palo sin cantar y tiene otras cartas legales
- **THEN** no juega ni ese rey ni ese caballo

#### Scenario: Partidas completas de Tute
- **WHEN** se juegan 1.000 partidas de Tute entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tute
- **WHEN** la IA básica juega 1.000 manos de Tute contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las manos

### Requirement: IA de Escoba nivel básico
La Escoba MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Hace escoba siempre que puede.
- Si puede recoger, elige la captura más valiosa: la que lleva el 7 de oros, luego más sietes, más oros y más cartas.
- Si no recoge, evita dejar en la mesa una suma que permita al rival hacer escoba, y evita soltar sietes y oros cuando tiene otra opción.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las manos.

#### Scenario: Hace escoba
- **WHEN** la IA tiene una jugada que deja la mesa vacía
- **THEN** la elige

#### Scenario: Se lleva el 7 de oros
- **WHEN** la IA puede recoger de dos formas y solo una incluye el 7 de oros
- **THEN** elige la que incluye el 7 de oros

#### Scenario: No da escoba
- **WHEN** la IA no puede recoger y una de sus cartas dejaría en la mesa una suma entre 5 y 14 mientras otra no
- **THEN** juega la que no deja la mesa a tiro de escoba

#### Scenario: Partidas completas de Escoba
- **WHEN** se juegan 1.000 partidas de Escoba entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Escoba
- **WHEN** la IA básica juega 1.000 manos de Escoba contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las manos

### Requirement: IA de Chinchón nivel básico
El Chinchón MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Roba del descarte solo si esa carta le baja los puntos sin ligar de su mejor mano posible tras descartar. Si no, roba del mazo.
- Descarta la carta con la que su mano queda con menos puntos sin ligar y, a igualdad, la de más valor.
- Cierra siempre que puede.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: Roba del descarte cuando le sirve
- **WHEN** la carta del descarte completa una combinación en la mano de la IA
- **THEN** la IA roba del descarte

#### Scenario: Descarta lo que menos sirve
- **WHEN** la IA tiene que descartar y una carta suelta de mucho valor no forma parte de ninguna combinación
- **THEN** descarta esa carta

#### Scenario: Cierra cuando puede
- **WHEN** cerrar está entre las acciones legales de la IA
- **THEN** cierra

#### Scenario: Partidas completas de Chinchón
- **WHEN** se juegan 1.000 partidas de Chinchón entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Chinchón
- **WHEN** la IA básica juega 1.000 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA de Guiñote nivel básico
El Guiñote MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Canta siempre que puede, las 40 antes que las 20.
- Cambia el 7 de triunfo cuando puede.
- No juega el rey ni la sota de una pareja que aún puede cantar, si tiene otra carta legal y queda mazo.
- Si puede ganar una baza con puntos sin gastar triunfo, la gana. Cuando no puede ganar, entrega la carta de menor valor.

Este nivel MUST ganar la mayoría de las partidas contra un jugador que elige acciones legales al azar.

#### Scenario: Canta lo que puede
- **WHEN** la IA ganó la última baza, queda mazo y tiene el rey y la sota de triunfo sin cantar
- **THEN** canta las 40 antes de salir

#### Scenario: Guarda la pareja
- **WHEN** la IA sale con mazo, tiene el rey y la sota de un palo sin cantar y tiene otras cartas legales
- **THEN** no juega ni ese rey ni esa sota

#### Scenario: Partidas completas de Guiñote
- **WHEN** se juegan 1.000 partidas de Guiñote entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Guiñote
- **WHEN** la IA básica juega 1.000 partidas de Guiñote contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA de Siete y media nivel básico
La Siete y media MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Como punto, pide carta mientras su jugada vale menos de 5 y se planta a partir de 5. Apuesta más cuando tiene más fichas, sin pasar nunca de la apuesta máxima.
- Como banca, no se planta mientras pierda contra alguna jugada visible de un punto que siga en juego (contando su carta tapada como medio punto como mínimo), salvo que su jugada ya valga 6 o más. Si no hay nada que superar, se planta a partir de 5.

Este nivel MUST terminar con más fichas que un jugador que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: El punto se planta con 5
- **WHEN** la IA es punto y su jugada vale 5,5
- **THEN** se planta

#### Scenario: El punto pide con poco
- **WHEN** la IA es punto y su jugada vale 3
- **THEN** pide carta

#### Scenario: Partidas completas de Siete y media
- **WHEN** se juegan 1.000 partidas de Siete y media entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Siete y media
- **WHEN** la IA básica juega 1.000 partidas de Siete y media contra un jugador que elige acciones legales al azar
- **THEN** termina con más fichas que él en claramente más de la mitad de las partidas

### Requirement: IA de Cinquillo nivel básico
El Cinquillo MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Entre sus jugadas legales, prefiere la que le deja más cartas propias por jugar en esa dirección, porque le abre camino a sí misma.
- Penaliza las jugadas que abren camino a cartas que no tiene, porque las tendrán los rivales.
- Si no le cuesta nada, juega antes las cartas de los extremos (el As y el Rey), que nadie más puede ayudarle a soltar.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Se abre camino a sí misma
- **WHEN** la IA puede jugar el 6 o el 4 de bastos, tiene también el 7 y la Sota de bastos y ninguna carta por debajo del 4
- **THEN** juega el 6 de bastos

#### Scenario: Partidas completas de Cinquillo
- **WHEN** se juegan 1.000 partidas de Cinquillo entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cinquillo
- **WHEN** la IA básica juega 1.000 partidas de Cinquillo contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA de Pocha nivel básico
La Pocha MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Al apostar, estima sus bazas: los triunfos altos y los Ases cuentan como bazas probables. Si la estimación es la apuesta prohibida, se desvía la mínima cantidad posible.
- Mientras le faltan bazas para cumplir su apuesta, intenta ganar cada baza con la carta más barata que la gane.
- Cuando ya tiene las bazas que apostó, intenta perder: juega la carta más alta que no gane la baza, para deshacerse de las que podrían ganar más adelante.

Este nivel MUST sumar más puntos que jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Ya cumplida, no gana más
- **WHEN** la IA ya hizo las bazas que apostó y puede jugar una carta que pierde la baza
- **THEN** juega una carta que no gana la baza

#### Scenario: Partidas completas de Pocha
- **WHEN** se juegan 1.000 partidas de Pocha entre IAs con semillas distintas, con 3 y 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Pocha
- **WHEN** la IA básica juega 1.000 partidas de Pocha contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA de Mus nivel básico
El Mus MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Corta el mus con una mano buena (31 de juego, duples, medias o tres reyes) y, si pide mus, descarta las cartas que no forman pares ni son reyes.
- En cada lance valora la fuerza de su jugada, teniendo en cuenta si es mano. Envida o sube con jugadas fuertes, quiere los envites con jugadas suficientes y no quiere con jugadas flojas.
- Solo echa un órdago con jugadas casi imbatibles, y quiere el de los rivales con jugadas fuertes (para no regalar una piedra a cada órdago de farol).

Este nivel MUST ganar más juegos que una pareja que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: Corta con 31
- **WHEN** a la IA le toca hablar en el mus y tiene 31 de juego
- **THEN** corta el mus

#### Scenario: No quiere con una jugada floja
- **WHEN** la IA recibe un envite a Grande sin ningún rey ni caballo
- **THEN** no lo quiere

#### Scenario: Partidas completas de Mus
- **WHEN** se juegan 1.000 partidas de Mus entre IAs con semillas distintas y distintas opciones
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Mus
- **WHEN** la IA básica juega 1.000 partidas de Mus en pareja contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA de Corazones nivel básico
Los Corazones MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Al pasar:** elige sus cartas más peligrosas: la Q, el K y el A de picas, y los corazones y las cartas más altas.
- **Al seguir el palo:** juega la carta más alta que no gana la baza. Si todas ganan, siendo el último juega la más alta (la baza ya es suya) y si no, la más baja.
- **Si no tiene el palo:** se deshace primero de la Q de picas, luego de su corazón más alto y luego de su carta más alta.
- **Al salir:** sale con su carta más baja de un palo que no sea corazones mientras pueda.

La IA MUST jugar con cualquier número de jugadores de los Corazones (de 3 a 6), con las mismas reglas.

Este nivel MUST terminar con menos puntos que los jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Se deshace de la Q de picas
- **WHEN** la IA no tiene el palo de salida y tiene la Q de picas
- **THEN** juega la Q de picas

#### Scenario: No gana pudiendo evitarlo
- **WHEN** la IA sigue el palo y tiene cartas más bajas y más altas que la que va ganando la baza
- **THEN** juega la más alta de las que no ganan

#### Scenario: Partidas completas de Corazones
- **WHEN** se juegan 1.000 partidas de Corazones entre IAs con semillas distintas y distintas opciones, también de 3, 5 y 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en los Corazones
- **WHEN** la IA básica juega 1.000 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

#### Scenario: Contra el azar con 3 jugadores
- **WHEN** la IA básica juega 300 partidas de Corazones de 3 contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la tercera parte

### Requirement: IA del Burro nivel básico
El Burro MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Al pasar:** guarda las cartas del número del que más tiene y pasa una del número del que menos tiene; si hay empate, elige al azar entre los empatados.
- **Al plantarse:** se planta siempre que puede, tanto si tiene 4 iguales como si ya se ha plantado otro.

El retraso con el que la IA actúa en la mesa lo decide el cliente, no la IA.

Contra jugadores al azar, este nivel MUST perder claramente menos partidas que ellos, aunque el orden en que se reacciona a una plantada sea al azar.

#### Scenario: Pasa del número que menos tiene
- **WHEN** la IA tiene tres reyes y un as
- **THEN** pasa el as

#### Scenario: Se planta con cuatro iguales
- **WHEN** la IA tiene los cuatro caballos y nadie se ha plantado
- **THEN** se planta

#### Scenario: Partidas completas de Burro
- **WHEN** se juegan 1.000 partidas de Burro entre IAs con semillas distintas, con 3, 4 y 5 jugadores, y el asiento que actúa en cada momento se elige al azar entre los que pueden
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Burro
- **WHEN** la IA básica juega 1.000 partidas de 4 jugadores contra tres jugadores que eligen acciones legales al azar, con el asiento que actúa elegido al azar
- **THEN** es el burro en menos del 15 % de las partidas

### Requirement: IA del Pinacle nivel básico
El Pinacle MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Al robar:** se lleva el montón cuando puede bajar su carta de arriba y el montón le aporta cartas que encajan con su mano o con las combinaciones de su bando; si no, roba del mazo.
- **Al bajar:**
  - baja las combinaciones que puede formar, prefiriendo las que usan menos comodines;
  - añade cartas a las combinaciones de su bando;
  - cambia comodines cuando puede;
  - si está barbelé, solo empieza a bajar si llega a 70.
- **Al descartar:** descarta la carta que menos le sirve, y evita las que el rival puede añadir a sus combinaciones o que se llevaría con el montón; nunca descarta un comodín si tiene otra opción.

Contra jugadores al azar, este nivel MUST ganar claramente.

#### Scenario: Bajar lo que tiene
- **WHEN** tras robar, la IA tiene en la mano 9♣, 9♦ y 9♠
- **THEN** baja el grupo de nueves antes de descartar

#### Scenario: No regalar cartas
- **WHEN** el rival tiene bajada una escalera de picas del 5 al 8, y la IA tiene que elegir entre descartar el 9♠ o un 4♦ que no le sirve
- **THEN** descarta el 4♦

#### Scenario: Partidas completas de Pinacle
- **WHEN** se juegan 200 partidas de Pinacle entre IAs, de 2 y de 4 jugadores, con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Pinacle
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana más del 90 %

### Requirement: IA de la Butifarra nivel básico
La Butifarra MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Elegir el triunfo:** valora cada palo por sus cartas altas y su largo. Elige el mejor palo y elige butifarra con una mano muy fuerte. Como repartidor, delega si ningún palo es bueno.
- **Contros:** dice contro, recontro o Sant Vicenç solo con una mano fuerte para el triunfo elegido.
- **Al jugar:**
  - gana la baza con la carta más barata que la gane cuando merece la pena;
  - si la baza ya es de su compañero, le carga puntos;
  - si no puede ganar, juega la carta que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Delegar sin juego
- **WHEN** la IA reparte con una mano sin manillas ni ases y sin ningún palo de más de 3 cartas
- **THEN** delega en su compañero

#### Scenario: Cargar al compañero
- **WHEN** la baza la va ganando el compañero con una carta que nadie después puede superar, y la IA no tiene del palo
- **THEN** juega una carta con puntos en lugar de una de 0

#### Scenario: Partidas completas de Butifarra
- **WHEN** se juegan 500 partidas de Butifarra entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Butifarra
- **WHEN** una pareja de IAs básicas juega 500 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA del Truc nivel básico
El Truc MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Envit:** envida con 30 o más puntos. Acepta según sus puntos y sube la apuesta solo con muchos.
- **Truc:** valora su mano por sus cartas y las bazas ya ganadas. Truca o sube con una mano fuerte y acepta solo si su mano lo justifica. Con una probabilidad baja y fija farolea: truca con una mano floja. Esa decisión sale del azar del agente, así que es reproducible.
- **Retirarse:** se va de la mano solo cuando no querer no es posible y su mano no tiene opciones.
- **Al jugar:** gana la baza con la carta más baja que la gane cuando le conviene. Si no puede ganarla o ya la gana su compañero, juega la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Envida con mucho envit
- **WHEN** a la IA le toca en la primera baza con 33 puntos de envit y nadie ha envidado
- **THEN** envida

#### Scenario: No quiere con mano mala
- **WHEN** a la IA le truca el rival y tiene un 4, un 5 y un 6 sin bazas ganadas
- **THEN** no quiere

#### Scenario: Partidas completas de Truc
- **WHEN** se juegan 500 partidas de Truc entre IAs con semillas distintas, de 2 y de 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Truc
- **WHEN** la IA básica (o una pareja de IAs) juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA del Julepe nivel básico
El Julepe MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Jugar o pasar:** estima las bazas que hará con sus triunfos y sus cartas altas antes de descartar, y juega si espera al menos 1, porque el descarte cambia sus cartas malas y le acerca a 2. Con más jugadores en la mesa pide más.
- **Descartar:** se queda con los triunfos, los Ases y los Treses, y descarta el resto mientras haya mazo.
- **Al jugar:**
  - gana la baza con la carta más barata que la gane;
  - si no puede, juega la que menos vale;
  - con dos bazas ya hechas sigue intentando ganar, porque cada baza cobra.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pasa sin juego
- **WHEN** la IA tiene cinco cartas bajas sin triunfos y no está obligada
- **THEN** pasa

#### Scenario: Juega con triunfos altos
- **WHEN** la IA tiene el As y el 3 de triunfo y un As de otro palo
- **THEN** juega la mano

#### Scenario: Partidas completas de Julepe
- **WHEN** se juegan 500 partidas de Julepe entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Julepe
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Remigio nivel básico
El Remigio MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Robar:** roba del montón cuando su carta de arriba forma o amplía una combinación con su mano. Si no, roba del mazo.
- **Bajar:**
  - baja las combinaciones que puede formar, gastando antes las cartas naturales que los comodines;
  - si con lo que tiene está cerca de cerrar con remigio y aún no ha bajado, guarda las combinaciones para bajarlas de golpe;
  - tras haber bajado, añade cartas a las combinaciones de la mesa y cambia comodines cuando puede.
- **Descartar:** descarta la carta que menos combina con su mano y, entre las que combinan igual, la que más puntos vale. No descarta comodines mientras tenga otra opción.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Roba del montón si le sirve
- **WHEN** la IA tiene el 4 y el 5 de copas y en el montón está el 6 de copas
- **THEN** roba del montón

#### Scenario: No descarta comodines
- **WHEN** la IA tiene que descartar y tiene un comodín y cartas sueltas
- **THEN** descarta una carta suelta

#### Scenario: Partidas completas de Remigio
- **WHEN** se juegan 200 partidas de Remigio entre IAs con semillas distintas, de 2 a 5 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Remigio
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Tute subastado nivel básico
El Tute subastado MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Pujar:** estima, para cada palo como triunfo, los puntos que haría con sus cartas: los Ases y Treses, los triunfos según cuántos y cuáles tenga, y los cantes que lleva. Con la mejor estimación puja lo mínimo posible si no pasa de ella; si no, pasa.
- **Elegir triunfo:** elige el palo con la mejor estimación.
- **Cantar:** canta siempre que puede, el tute antes que nada y las 40 antes que las 20.
- **Al jugar:**
  - como defensor, ayuda a los otros defensores: si uno va ganando la baza contra el pujador, le carga puntos cuando puede;
  - gana la baza con la carta más barata que la gane cuando lleva puntos;
  - si no puede ganarla, juega la que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pasa con mano floja
- **WHEN** la IA tiene solo cartas bajas, sin Ases, Treses ni cantes
- **THEN** pasa en la subasta

#### Scenario: Puja con buena mano
- **WHEN** la IA tiene As, 3, Rey y Caballo de un palo y otros dos Ases, y nadie ha pujado
- **THEN** puja 60 o más

#### Scenario: Elige el palo de su fuerza
- **WHEN** la IA gana la subasta con cinco espadas, entre ellas el As y el 3
- **THEN** elige espadas como triunfo

#### Scenario: Partidas completas de Tute subastado
- **WHEN** se juegan 500 partidas de Tute subastado entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tute subastado
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA de la Cuatrola nivel básico
La Cuatrola MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Pujar:** estima, para cada palo como triunfo, las bazas que haría con sus matadores, sus triunfos y sus reyes. Puja solo si espera 6 bazas o más, con rey si espera al menos 3,5 (el compañero pone el resto), y pasa si no.
- **Elegir triunfo y rey:** elige el palo con la mejor estimación y llama el rey del palo, que no sea el triunfo, en el que tiene menos cartas.
- **Al jugar:**
  - sabe quién es su compañero si es el jugador y el compañero ya se descubrió, o si él mismo tiene la carta llamada;
  - si la baza la va ganando su compañero, juega su carta más baja;
  - si no, la gana con la carta más baja que la gane, y si no puede, juega la más baja;
  - el jugador que tiene muchos triunfos sale de triunfo para quitárselos a los defensores.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pasa sin juego en la Cuatrola
- **WHEN** la IA no tiene matadores, ni reyes, ni más de tres cartas de ningún palo
- **THEN** pasa en la subasta

#### Scenario: Solo con mano fuerte
- **WHEN** la IA tiene la espadilla, el basto y seis oros con la malilla y el punto, y nadie ha pujado
- **THEN** puja solo

#### Scenario: Llama el rey del palo corto
- **WHEN** la IA gana la subasta con rey, elige oros de triunfo, no tiene ninguna copa y tiene espadas y bastos
- **THEN** llama el Rey de copas

#### Scenario: Partidas completas de Cuatrola
- **WHEN** se juegan 500 partidas de Cuatrola entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Cuatrola
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Mentiroso nivel básico
El Mentiroso MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Bajar:** si tiene cartas del valor que toca, las baja todas (hasta 4). Si no tiene ninguna, miente con una carta: la de un valor que le tocará declarar más tarde. Además, mientras el montón tenga como mucho 6 cartas, rellena con cartas falsas hasta bajar 3, salvo que se fuera a quedar sin cartas: perder un montón pequeño cuesta poco y la mano se vacía antes.
- **Desconfiar:** dice «¡Mentiroso!»:
  - siempre que sea imposible que digan la verdad, porque las cartas declaradas más las que tiene él de ese valor pasan de 4;
  - siempre que quien bajó se haya quedado sin cartas;
  - y, si no, con una probabilidad que crece cuanto menos probable es que quien bajó tuviera tantas cartas de ese valor, por las que quedan sin ver, y algo menor con un montón grande. Usa su azar.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Dice la verdad cuando puede
- **WHEN** toca declarar sietes, la IA tiene dos sietes y el montón tiene 8 cartas
- **THEN** baja solo los dos sietes

#### Scenario: Miente con una carta
- **WHEN** toca declarar sietes, la IA no tiene ninguno y el montón tiene 8 cartas
- **THEN** baja una sola carta

#### Scenario: Rellena con el montón pequeño
- **WHEN** toca declarar sietes, la IA tiene un siete y muchas cartas, y el montón está vacío
- **THEN** baja tres cartas, entre ellas el siete

#### Scenario: Mentira imposible
- **WHEN** el rival declara 3 reyes y la IA tiene 2 reyes
- **THEN** dice «¡Mentiroso!»

#### Scenario: Partidas completas de Mentiroso
- **WHEN** se juegan 500 partidas de Mentiroso entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Mentiroso
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Ocho loco nivel básico
El Ocho loco MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable, pero sin guardar los ochos (eso lo hace la experta en la que se apoya el nivel difícil):
- **Elegir carta:** entre las que casan, ochos incluidos, prefiere la que le deja más cartas del palo que tocará después, y a igualdad, la de más puntos.
- **Elegir palo:** al jugar un 8, elige el palo del que más cartas le quedan (sin contar los ochos).
- **Carta robada:** si la carta robada se puede jugar, la juega.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Elige la carta por el palo que le queda
- **WHEN** toca corazones y la IA puede jugar el 4 de corazones o el 9 de picas, y le quedan dos picas más
- **THEN** juega el 9 de picas

#### Scenario: Palo del 8
- **WHEN** la IA solo puede jugar el 8 de picas y le quedan tres diamantes y un trébol
- **THEN** juega el 8 eligiendo diamantes

#### Scenario: Juega la robada
- **WHEN** la IA roba una carta que casa con el descarte
- **THEN** la juega

#### Scenario: Partidas completas de Ocho loco
- **WHEN** se juegan 500 partidas de Ocho loco entre IAs con semillas distintas, de 2 a 5 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Ocho loco
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA de Picas nivel básico
Picas MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Apostar:** cuenta las bazas que espera hacer: cada As, cada Rey con otra carta de su palo, cada Dama con dos más de su palo, las picas altas y una por cada pica a partir de la cuarta. Apuesta ese número, como mínimo 1. Si espera menos de media baza y no tiene ninguna pica más alta que el 9, dice Nil, salvo que su compañero ya haya dicho Nil.
- **Jugar con contrato:** mientras su pareja no haya cumplido el contrato, intenta ganar las bazas con la carta más baja que gane; si no puede, o si la baza ya es de su compañero, echa la más baja. Cuando la pareja ya lo ha cumplido, evita ganar bazas para no sumar sacos.
- **Nil propio:** si dijo Nil, juega la carta más alta que no gane la baza, y si tiene que ganarla, la más baja.
- **Nil del compañero:** si su compañero dijo Nil, intenta ganar las bazas que el compañero podría llevarse.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Apuesta con ases
- **WHEN** la IA tiene el As de corazones, el As de tréboles, el Rey y el 3 de diamantes, y ninguna pica alta ni más de tres picas
- **THEN** apuesta 3

#### Scenario: Nil con mano baja
- **WHEN** la IA tiene solo cartas del 2 al 8, con dos picas, y su compañero no ha dicho Nil
- **THEN** dice Nil

#### Scenario: Ganar barato
- **WHEN** la pareja no ha cumplido el contrato, en la mesa hay el 10 de corazones y la IA tiene el Rey y la Dama de corazones
- **THEN** juega la Dama

#### Scenario: Nil propio
- **WHEN** la IA dijo Nil, en la mesa hay la Dama de tréboles y tiene el Rey, el 9 y el 4 de tréboles
- **THEN** juega el 9

#### Scenario: Partidas completas de Picas
- **WHEN** se juegan 300 partidas de Picas entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en Picas
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Blackjack nivel básico
El Blackjack MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable, pero sin la estrategia básica completa (eso lo hace la experta en la que se apoya el nivel difícil):
- **Apostar:** apuesta 10 fichas, o la mayor apuesta legal si tiene menos.
- **Jugar como la banca:** pide con 16 o menos y se planta con 17 o más.
- **Doblar:** dobla con 10 u 11 si puede.
- **Separar:** separa los ases y los ochos si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pide con 16
- **WHEN** la IA tiene 16 y la banca muestra un 6
- **THEN** pide carta

#### Scenario: Dobla con 11
- **WHEN** la IA tiene un 5 y un 6 y puede doblar
- **THEN** dobla

#### Scenario: Separa ases
- **WHEN** la IA tiene dos ases y puede separar
- **THEN** separa

#### Scenario: Partidas completas de Blackjack
- **WHEN** se juegan 500 partidas de Blackjack entre IAs con semillas distintas, de 1 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Blackjack
- **WHEN** la IA básica juega 500 partidas de 2 jugadores contra uno que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Gin Rummy nivel básico
El Gin Rummy MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Primera carta y robo:** coge la carta del descarte si con ella baja sus puntos sueltos (después de descartar la peor) o le deja una pareja o dos cartas seguidas del mismo palo que antes no tenía; si no, pasa o roba del mazo.
- **Descartar:** suelta la carta suelta que menos le sirve: la de más puntos que no esté en una pareja ni junto a otra del mismo palo; si todas le sirven, la de más puntos.
- **Cerrar:** cierra en cuanto puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Coger el descarte que liga
- **WHEN** la IA tiene el 5 y el 6 de corazones y en el descarte está el 7 de corazones
- **THEN** coge el descarte

#### Scenario: Soltar la carta más cara que no sirve
- **WHEN** la IA tiene sueltas una K sin pareja ni vecinas y un 3 junto al 4 del mismo palo
- **THEN** descarta la K

#### Scenario: Cerrar en cuanto puede
- **WHEN** la IA puede cerrar dejando 9 puntos sueltos
- **THEN** cierra

#### Scenario: Partidas completas de Gin Rummy
- **WHEN** se juegan 500 partidas de Gin Rummy entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Gin Rummy
- **WHEN** la IA básica juega 500 partidas contra uno que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Rummy 500 nivel básico
El Rummy 500 MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Robar:** coge del descarte desde la carta que más le compensa (los puntos que puede bajar o añadir enseguida con lo que coge, menos la mitad de los puntos de las cartas que se lleva y no puede usar), si compensa algo; si no, roba del mazo.
- **Bajar y añadir:** baja todas las combinaciones que puede formar, eligiendo la agrupación de su mano que más puntos baja, y añade a la mesa todas las cartas que puede, dejando siempre una carta para descartar.
- **Descartar:** suelta la carta que menos le sirve: entre las que no forman pareja ni van junto a otra del mismo palo, la de más puntos; si todas le sirven, la de más puntos.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Coger del descarte para bajar
- **WHEN** la IA tiene el 8 y el 9 de picas y en el descarte está el 7 de picas con una carta encima
- **THEN** coge desde el 7 de picas y baja la escalera

#### Scenario: Baja lo que puede
- **WHEN** tras robar, la IA tiene en la mano tres reinas y otras cartas
- **THEN** baja el grupo de reinas

#### Scenario: Añade a la mesa
- **WHEN** en la mesa hay una escalera 4-5-6 de corazones y la IA tiene el 7 de corazones y otras cartas
- **THEN** añade el 7 de corazones

#### Scenario: Partidas completas de Rummy 500
- **WHEN** se juegan 200 partidas de Rummy 500 entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Rummy 500
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Texas Hold'em nivel básico
El Texas Hold'em MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar por la fuerza de su mano:
- **Antes del flop:** puntúa sus dos cartas (parejas, cartas altas, del mismo palo, seguidas). Con las mejores sube unas tres ciegas grandes (o resube); con el resto, iguala si lo que cuesta frente al bote lo compensa según esa puntuación y los rivales que quedan, y si no pasa o se retira.
- **Después del flop:** según la jugada que forma con las comunes. De pareja alta para arriba apuesta o sube unos tres cuartos del bote. Con pareja baja o un proyecto de color o escalera, iguala si el precio frente al bote lo compensa. Sin nada, pasa si puede y si no se retira.
- **Pocas fichas:** si le quedan menos de 10 ciegas grandes, con una mano buena va all-in.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Pareja de ases antes del flop
- **WHEN** la IA tiene dos ases antes del flop y nadie ha subido
- **THEN** sube

#### Scenario: Mano mala ante una subida
- **WHEN** la IA tiene un 7 y un 2 de distinto palo y alguien ha subido antes del flop
- **THEN** se retira

#### Scenario: Pasa sin nada
- **WHEN** en el flop la IA no tiene ninguna jugada ni proyecto y nadie ha apostado
- **THEN** pasa

#### Scenario: Partidas completas de Texas Hold'em
- **WHEN** se juegan 200 partidas de Texas Hold'em entre IAs con semillas distintas, de 2 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Texas Hold'em
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Culo nivel básico
El Culo MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Abrir:** juega todas las cartas de su valor más bajo que no sea el 2. Si solo le quedan doses, los juega.
- **Responder:** juega el valor más bajo que supera la jugada, prefiriendo un valor del que tenga justo las cartas que hacen falta para no romper un grupo. Solo rompe un grupo si no tiene otro modo de superar. Guarda los doses: solo corta con ellos si después le quedan, como mucho, dos valores distintos en la mano. Si no juega, pasa.
- **Intercambio:** devuelve sus cartas más bajas, empezando por las de los valores de los que tenga menos cartas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Abrir con lo más bajo
- **WHEN** la IA abre con dos treses, un 7 y un 2
- **THEN** juega los dos treses

#### Scenario: Responder sin romper
- **WHEN** la última jugada es un 5 y la IA tiene un 6 suelto, dos sotas y un rey
- **THEN** juega el 6

#### Scenario: Guardar los doses
- **WHEN** la última jugada es un As, la IA solo puede superarla con un 2 y le quedan cuatro valores distintos más
- **THEN** pasa

#### Scenario: Partidas completas de Culo
- **WHEN** se juegan 200 partidas de Culo entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Culo
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA de la Canasta nivel básico
La Canasta MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Robar:** se lleva el pozo siempre que puede; si no, roba del mazo.
- **Primera bajada:** si con su mano llega al mínimo, baja lo necesario para llegar: primero las combinaciones de naturales y después las que necesitan comodín.
- **Bajar y añadir:** ya bajada la pareja, baja todos los valores de los que tenga tres naturales o más y añade los naturales que casan con las combinaciones de la pareja. Pone comodines solo para completar una canasta, o para cerrar.
- **Cerrar:** si la pareja tiene canasta y puede quedarse sin cartas, cierra.
- **Descartar:** primero un 3 negro; si no, la carta que menos sirve a los rivales: la de un valor del que no tienen combinación, de las que tenga menos y de menos valor. Nunca descarta un comodín si tiene otra carta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que les corresponderían si todos fueran iguales.

#### Scenario: Se lleva el pozo
- **WHEN** arriba del pozo hay un 9, la IA tiene dos nueves y su pareja ya ha bajado
- **THEN** se lleva el pozo

#### Scenario: Descarta el 3 negro
- **WHEN** la IA tiene que descartar y tiene un 3 negro
- **THEN** descarta el 3 negro

#### Scenario: Cierra cuando puede
- **WHEN** la pareja de la IA tiene una canasta y la IA tiene tres cuatros y un 9
- **THEN** baja los cuatros y cierra descartando el 9

#### Scenario: Partidas completas de Canasta
- **WHEN** se juegan 100 partidas de Canasta entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Canasta
- **WHEN** una pareja de IAs básicas juega 100 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Whist nivel básico
El Whist MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Salir:** con el As de un palo que no es el triunfo, lo juega; si no, sale de su palo más largo que no sea el triunfo, con la carta más alta si tiene la siguiente (rey con reina, por ejemplo) y si no con la más baja.
- **Seguir el palo:** si su compañero ya gana la baza, juega la carta más baja; si no, la carta más baja que gana la baza, o la más baja si no puede ganarla.
- **Sin el palo:** si su compañero ya gana la baza, descarta su carta más baja que no sea triunfo; si no, falla con el triunfo más bajo que gana la baza, o descarta la más baja si no puede.

Este nivel MUST ganar claramente más partidas que una pareja que elige cartas legales al azar.

#### Scenario: Gana con la carta justa
- **WHEN** salen corazones con el 9, y la IA tiene el 10, la J y la K de corazones
- **THEN** juega el 10

#### Scenario: No le quita la baza al compañero
- **WHEN** el compañero de la IA va ganando la baza con el As de picas, y la IA tiene picas
- **THEN** juega su pica más baja

#### Scenario: Falla con el triunfo más bajo
- **WHEN** la IA no tiene el palo de salida, el rival va ganando y la IA tiene el 3 y la Q de triunfo
- **THEN** juega el 3 de triunfo

#### Scenario: Partidas completas de Whist
- **WHEN** se juegan 100 partidas de Whist entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Whist
- **WHEN** una pareja de IAs básicas juega 100 partidas contra una pareja que elige cartas legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Sevens nivel básico
El Sevens MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar como el del Cinquillo: entre sus cartas jugables, prefiere la que le deja más cartas propias por jugar en esa dirección de la escalera y abre menos camino a los rivales, y suelta pronto el As y la K.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Prefiere la carta que le acerca otras
- **WHEN** la escalera de picas va del 6 al 8, y la IA puede jugar el 9 de picas (y tiene el 10 y la J de picas) o el 5 de picas (sin más picas bajas)
- **THEN** juega el 9 de picas

#### Scenario: Partidas completas de Sevens
- **WHEN** se juegan 200 partidas de Sevens entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Sevens
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales

### Requirement: IA del Casino nivel básico
El Casino MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Recoger:** si puede recoger, elige la recogida que más vale: cada carta cuenta, y más las picas, los Ases, el 10 de diamantes, el 2 de picas y la barrida.
- **Construir:** si no recoge, construye cuando la construcción le asegura cartas para la siguiente vez (tiene la carta del valor), prefiriendo la que junta más cartas.
- **Dejar:** si no, deja la carta que menos vale: ni Ases, ni el 10 de diamantes, ni el 2 de picas, ni picas si puede evitarlo.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Recoge el Big Casino
- **WHEN** la IA puede recoger con un 10 el 10 de diamantes, o con un 4 un 4 de tréboles
- **THEN** recoge el 10 de diamantes

#### Scenario: Construye cuando puede recoger después
- **WHEN** la IA no puede recoger, tiene un 3 y un 8, y en la mesa hay un 5
- **THEN** construye un 8

#### Scenario: Partidas completas de Casino
- **WHEN** se juegan 100 partidas de Casino entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Casino
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Durak nivel básico
El Durak MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Atacar:** con su carta más baja que no sea triunfo y, si puede, con la de un número del que tenga varias.
- **Echar:** cartas bajas que no sean triunfo; triunfos o cartas altas solo cuando el mazo se ha acabado.
- **Defender:** con la carta más barata que gana, prefiriendo las que no son triunfo.
- **Llevarse las cartas:** cuando para ganar tendría que gastar un triunfo alto (Q, K o A) quedando mucho mazo, o cuando no puede ganar.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Ataca con la más baja
- **WHEN** la IA ataca con el 6 de corazones, el 10 de tréboles y el 7 de triunfo en la mano
- **THEN** ataca con el 6 de corazones

#### Scenario: Defiende con lo justo
- **WHEN** la IA defiende un 8 de diamantes con el 9 y el K de diamantes y un triunfo en la mano
- **THEN** lo gana con el 9 de diamantes

#### Scenario: Partidas completas de Durak
- **WHEN** se juegan 100 partidas de Durak entre IAs con semillas distintas, de 2 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Durak
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Euchre nivel básico
El Euchre MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Elegir el triunfo:** valora su mano en cada palo posible (bower derecho, bower izquierdo, As, demás triunfos y Ases de otros palos). Pide o nombra el palo que mejor valora si pasa de un umbral. En la primera vuelta cuenta también la carta vuelta: a su favor si reparte él o su compañero, y en contra si reparte un rival.
- **Jugar solo:** solo con una mano muy fuerte, como los dos bowers y otro triunfo alto.
- **Descartarse (como repartidor):** de su carta más baja que no sea triunfo, prefiriendo quedarse sin un palo.
- **Bazas:** como el resto de juegos de bazas, gana la baza con la carta más barata que la gane si no es ya de su compañero, y si no, se descarta de la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Pide con los dos bowers
- **WHEN** la carta vuelta es de corazones y la IA tiene las J de corazones y de diamantes y el As de corazones
- **THEN** pide el triunfo

#### Scenario: Pasa con una mano floja
- **WHEN** la IA no tiene ningún triunfo del palo de la carta vuelta ni Ases
- **THEN** pasa

#### Scenario: Partidas completas de Euchre
- **WHEN** se juegan 100 partidas de Euchre entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Euchre
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Big Two nivel básico
El Big Two MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Salir:** con la jugada que se deshace de su carta más baja, prefiriendo la que suelta más cartas (una de 5, un trío o una pareja antes que una suelta).
- **Superar:** con la jugada más baja que supera a la de la mesa, prefiriendo las que no rompen sus parejas, tríos ni jugadas de 5.
- **Guardar los 2:** no juega un 2 (ni una jugada con un 2) para superar, mientras ningún rival tenga 4 cartas o menos; entonces pasa.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Supera con lo justo
- **WHEN** en la mesa hay un 7 suelto y la IA tiene un 8, un 9 suelto, una pareja de 10 y un 2
- **THEN** juega el 8

#### Scenario: Guarda el 2
- **WHEN** en la mesa hay un As suelto, la IA solo puede superarlo con un 2 y a todos los rivales les quedan más de 4 cartas
- **THEN** pasa

#### Scenario: Partidas completas de Big Two
- **WHEN** se juegan 100 partidas de Big Two entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Big Two
- **WHEN** la IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte

### Requirement: IA del Cribbage nivel básico
El Cribbage MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Echar al crib:** las 2 cartas cuya ausencia deja la mano con más puntos esperados, contando la media sobre los starters posibles. Lo que echa suma si el crib es suyo y resta si es del otro (por ejemplo, un 5 o una pareja).
- **Jugar las cartas:** la carta que más puntos le da enseguida. A igualdad, evita dejar la cuenta en 5 o en 21 (un 10 del otro haría 15 o 31) y prefiere soltar las cartas más altas.
- **Go:** solo cuando no le cabe ninguna carta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Se queda los cincos
- **WHEN** la IA tiene 5, 5, 10, J, 2 y 9, y el crib es del otro
- **THEN** no echa ningún 5

#### Scenario: Busca el quince
- **WHEN** la cuenta es 10 y la IA tiene un 5 y un 8
- **THEN** juega el 5

#### Scenario: Partidas completas de Cribbage
- **WHEN** se juegan 100 partidas de Cribbage entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cribbage
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Belote nivel básico
El Belote MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Elegir el triunfo:** valora su mano en cada palo posible (la J, el 9, el As, los demás triunfos y los Ases de otros palos). Toma o nombra el palo que mejor valora si pasa de un umbral. En la primera vuelta cuenta la carta vuelta como suya, porque se la lleva quien toma.
- **Bazas:** como el resto de juegos de bazas, gana la baza con la carta más barata que la gane si no es ya de su compañero, y si no, se descarta de la que menos vale, dentro de lo que le obligan las reglas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Toma con la J y el 9
- **WHEN** la carta vuelta es de corazones y la IA tiene la J y el 9 de corazones y otro corazón
- **THEN** toma el triunfo

#### Scenario: Pasa con una mano floja
- **WHEN** la IA no tiene ningún triunfo del palo de la carta vuelta salvo ella, ni Ases
- **THEN** pasa

#### Scenario: Partidas completas de Belote
- **WHEN** se juegan 100 partidas de Belote entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Belote
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Schnapsen nivel básico
El Schnapsen MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Cambiar la J:** siempre que puede.
- **Cantar:** en cuanto puede, el cante de más puntos.
- **Cerrar el mazo:** cuando sus puntos, sus cantes y los Ases y dieces del triunfo que tiene suman al menos 66.
- **Con el mazo abierto:** sale con la carta que menos vale y no es triunfo ni de una pareja que pueda cantar. Al responder, gana con una carta del mismo palo si puede, o con un triunfo si la carta de salida vale 10 o más; si no, echa la que menos vale.
- **Con las reglas estrictas:** gana la baza con la carta más barata que la gane si puede, y sale con su carta más alta.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Cambia la J del triunfo
- **WHEN** la IA sale, el mazo está abierto y tiene la J del triunfo
- **THEN** la cambia por la carta vuelta

#### Scenario: Canta en cuanto puede
- **WHEN** la IA sale y tiene el K y la Q de un palo sin cantar
- **THEN** los canta

#### Scenario: Partidas completas de Schnapsen
- **WHEN** se juegan 100 partidas de Schnapsen entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Schnapsen
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Skat nivel básico
El Skat MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Valorar la mano:** para cada juego posible (cada palo, Grand y Nulo) estima si lo ganaría, contando las J, los triunfos, los Ases y los dieces acompañados. En el Nulo, que no tenga cartas altas sin las bajas de su palo.
- **Subasta:** puja o acepta mientras el valor no pase del de su mejor juego, contando el Skat como desconocido.
- **El Skat:** lo coge siempre, se descarta de las 2 cartas que menos le sirven para su mejor juego (prefiriendo dejar dieces y reyes sueltos en el Skat) y declara el juego mejor valorado que llegue a lo pujado.
- **Bazas como solista:** en palo y Grand, sale con sus triunfos más altos mientras los rivales tengan triunfos, y después con sus Ases. En Nulo, juega siempre la carta más alta que no gane la baza.
- **Bazas como defensor:** gana la baza con la carta más barata que la gane si no la va ganando el otro defensor. Si la va ganando el otro defensor y juega el último, le echa su carta de más puntos. Si no, echa la que menos vale. En Nulo, intenta que el solista gane alguna baza saliendo con cartas bajas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Puja con una mano fuerte
- **WHEN** la IA tiene las cuatro J y dos Ases, y le toca pujar 18
- **THEN** puja

#### Scenario: Pasa con una mano floja
- **WHEN** la IA no tiene ninguna J, ni Ases, ni una mano de Nulo
- **THEN** pasa en la subasta

#### Scenario: Partidas completas de Skat
- **WHEN** se juegan 100 partidas de Skat entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Skat
- **WHEN** una IA básica juega 200 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de un tercio

### Requirement: IA del Oh Hell nivel básico
El Oh Hell MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Apostar:** cuenta sus cartas ganadoras: los Ases, los triunfos altos (A, K y Q, y los demás triunfos si tiene muchos) y los reyes con otra carta de su palo. Si su apuesta está prohibida, apuesta la más cercana permitida.
- **Jugar:** mientras le falten bazas para su apuesta, gana la baza con la carta más barata que la gane, y al salir juega su carta más alta. Si ya tiene las bazas que apostó, juega la carta más alta que no gana la baza, o al salir la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Apuesta sus Ases
- **WHEN** la IA tiene en una mano de 3 cartas el As de picas, el As de corazones y un 2 de tréboles, y el triunfo es diamantes
- **THEN** apuesta 2

#### Scenario: Evita ganar cuando ya tiene sus bazas
- **WHEN** la IA ya hizo las bazas que apostó y puede seguir el palo con el K o el 3
- **THEN** juega la carta más alta que no gana la baza

#### Scenario: Partidas completas de Oh Hell
- **WHEN** se juegan 100 partidas de Oh Hell entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Oh Hell
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de una de cada cuatro

### Requirement: IA del Spite and Malice nivel básico
El Spite and Malice MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **El montón primero:** si puede jugar la carta de arriba de su montón, la juega.
- **Cadenas:** busca, con un número limitado de jugadas, una cadena de cartas de su mano y de sus descartes que deje una escalera en el valor que necesita la carta de su montón, y juega la primera.
- **No ayudar al rival:** si no hay cadena, juega cartas de la mano y de arriba de sus descartes que no sean K, mientras no dejen una escalera justo antes de la carta de arriba del montón del rival.
- **Descartar:** guarda los K. Descarta la carta más alta que pueda poner sobre otra de un valor más (para formar escaleras descendentes) o sobre una igual; si no, en un descarte vacío; y si no, sobre el descarte con la carta más alta.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega su montón
- **WHEN** la carta de arriba del montón de la IA es un 4 y hay una escalera que va por el 3
- **THEN** la IA juega el 4 de su montón

#### Scenario: Cadena hasta el montón
- **WHEN** la carta de su montón es un 5, una escalera va por el 2 y la IA tiene un 3 y un 4 en la mano
- **THEN** juega el 3 de la mano

#### Scenario: Partidas completas de Spite and Malice
- **WHEN** se juegan 100 partidas de Spite and Malice entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Spite and Malice
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Bridge nivel básico
El Bridge MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal (también por el muerto, si es el declarante), es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST subastar con un sistema natural sencillo, contando los puntos de honores (As 4, K 3, Q 2, J 1):
- **Apertura:**
  - con 15–17 y una mano equilibrada, abre 1 sin triunfo; con 20–21 y equilibrada, 2 sin triunfo;
  - con 12 o más en otro caso, abre 1 en su palo de 5 o más cartas (el más largo; con dos de 5, el más alto) o, si no tiene ninguno, en su menor más largo;
  - con menos, pasa.
- **Respuesta:**
  - con 6 o más y 3 cartas del mayor de su compañero, lo apoya: a nivel 2 con 6–9, a nivel 3 con 10–12 y a manga con 13 o más;
  - si no, responde un palo nuevo de 4 cartas a nivel 1, o 1 sin triunfo con 6–9;
  - sobre 1 sin triunfo, con 8 o más y un mayor de 4 cartas, 2 tréboles (Stayman), a lo que el que abrió responde 2 corazones, 2 picas o 2 diamantes si no tiene mayor de 4; sin mayor de 4, 2 sin triunfo con 8–9 y 3 sin triunfo con 10–15.
- **Después:** estima los puntos de la pareja con lo que ha pujado su compañero y busca la manga (4 en un mayor con 8 cartas entre los dos, 3 sin triunfo si no) cuando suman 25 o más, el pequeño slam con 33 o más y el grande con 37 o más; si no, pasa en cuanto la pareja tiene un contrato que le vale.
- **Contra la subasta rival:** interviene a nivel 1 o 2 con un palo de 5 cartas y 8–16 puntos; si no, pasa. Dobla cuando el rival juega una manga o más y, contando sus puntos y los estimados de su compañero, a la pareja rival le quedan menos de 20; nunca redobla.

En el carteo, MUST jugar así:
- **Salida:** la carta más alta de una secuencia de honores; si no, contra sin triunfo, la cuarta más alta de su palo más largo; contra un palo, el palo de su compañero si lo pujó, o una carta de un palo sin triunfos.
- **Segunda mano:** juega baja, salvo que pueda ganar con una carta segura.
- **Tercera mano:** juega lo más bajo que gane la baza si la pareja no la lleva ya.
- **Cuarta mano:** gana con lo más bajo que pueda o se descarta la más baja.
- **Declarante:** con triunfos, arrastra mientras los rivales puedan tenerlos; después juega primero los palos con cartas ganadoras seguras, contando las del muerto.

Este nivel MUST ganar, en pareja, a una pareja que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Apertura de 1 sin triunfo
- **WHEN** la IA abre con 16 puntos y una mano 4-3-3-3
- **THEN** puja 1 sin triunfo

#### Scenario: Apoyo al mayor del compañero
- **WHEN** el compañero abrió 1 picas y la IA tiene 8 puntos y 3 picas
- **THEN** puja 2 picas

#### Scenario: Stayman
- **WHEN** el compañero abrió 1 sin triunfo y la IA tiene 10 puntos y 4 corazones
- **THEN** puja 2 tréboles

#### Scenario: Partidas completas de Bridge
- **WHEN** se juegan 100 partidas de Bridge entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Bridge
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA de la Pesca nivel básico
La Pesca MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST recordar el registro público para saber qué valores tiene seguro cada rival (los que pidió o recibió y aún no ha dado ni bajado) y cuáles no tiene (los que le pidieron y no tenía, hasta que vuelva a robar del mar). Con eso MUST pedir así:
- **Lo que sabe:** si un rival tiene seguro un valor que la IA tiene en la mano, se lo pide (el valor del que la IA tenga más cartas y, a igualdad, el más alto).
- **Si no:** pide el valor del que tiene más cartas (a igualdad, el más alto) que algún rival pueda tener, al rival con más cartas de los que no se sabe que no lo tienen; si ningún valor sirve, el primero al rival con más cartas.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Pide lo que sabe
- **WHEN** el jugador 1 pidió reyes hace un momento, no los ha dado ni bajado, y la IA tiene un rey
- **THEN** la IA le pide reyes al jugador 1

#### Scenario: Valor del que tiene más
- **WHEN** la IA no sabe nada de los rivales y tiene dos cincos y un 9
- **THEN** pide cincos al rival con más cartas

#### Scenario: Partidas completas de Pesca
- **WHEN** se juegan 100 partidas de Pesca entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Pesca
- **WHEN** la IA básica juega 200 partidas a cuatro contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte (a dos, la Pesca depende casi solo de la suerte)

### Requirement: IA de Kings in the Corner nivel básico
Kings in the Corner MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar, en cada decisión, lo primero que pueda de esta lista:
1. **Mover pilas:** mueve una pila lateral que encaje sobre otra, para abrir un hueco.
2. **Reyes:** pone un K en una esquina vacía.
3. **Jugar cartas:** pone una carta sobre una pila, empezando por la más alta.
4. **Llenar huecos:** pone en un hueco lateral la carta de su mano desde la que puede encadenar más cartas suyas (a igualdad, la más alta).
5. **Pasar.**

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: El K a la esquina
- **WHEN** la IA tiene un K y hay una esquina vacía, y no puede mover ninguna pila
- **THEN** pone el K en la esquina

#### Scenario: Mueve una pila para abrir hueco
- **WHEN** una pila lateral empieza por el 9 de corazones y otra tiene arriba el 10 de tréboles
- **THEN** la IA mueve la pila del 9 sobre la del 10

#### Scenario: Partidas completas de Kings in the Corner
- **WHEN** se juegan 100 partidas de Kings in the Corner entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en Kings in the Corner
- **WHEN** la IA básica juega 200 partidas a dos contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Bezique nivel básico
El Bezique MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Declarar:** si gana una baza, hace la declaración que más puntos da (cantar o cambiar el 7); si no puede, no declara.
- **Mientras hay mazo, al salir:** juega la carta más baja que no sea triunfo, ni As ni 10, ni forme parte de una combinación que aún pueda cantar; si no hay, la más baja.
- **Mientras hay mazo, al responder:** si la carta de salida es un As o un 10, la gana con la carta más baja que pueda (sin gastar un As ni un 10 si no hace falta); si no, juega su carta más baja que no sea triunfo ni de una combinación posible.
- **En las 8 últimas bazas:** gana con la carta más baja que pueda; si no puede ganar, juega la más baja permitida.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Canta lo que más vale
- **WHEN** la IA gana una baza y puede cantar un matrimonio de 20 o cuatro K
- **THEN** canta los cuatro K

#### Scenario: Gana un As
- **WHEN** el rival sale con el As de tréboles, que no es triunfo, y la IA tiene el 7 de triunfo y el As de corazones de triunfo
- **THEN** juega el 7 de triunfo

#### Scenario: Partidas completas de Bezique
- **WHEN** se juegan 100 partidas de Bezique entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Bezique
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Doppelkopf nivel básico
El Doppelkopf MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Reservas:**
  - pide solo de Damas con 5 Damas o más, solo de Jotas con 5 Jotas o más, y solo de triunfo con 10 triunfos o más que incluyan los dos 10 de corazones;
  - si no, pide boda si tiene las dos Q de tréboles, y dice «sano» en otro caso.
- **Anuncios:** anuncia «Re» o «Contra» en su primer turno si tiene 7 triunfos o más, de los que al menos 3 son el 10 de corazones o una Dama. No anuncia bajadas.
- **Al salir:** juega un As de un palo normal que aún no se haya jugado en la mano; si no tiene, su triunfo más bajo; si no tiene triunfos, su carta más baja.
- **Al responder:**
  - si la baza va ganándola alguien que sabe de su bando, le carga la carta que más vale de las que puede jugar sin gastar un triunfo de Dama o más alto;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Carga a su pareja
- **WHEN** la IA sabe que su pareja va ganando la baza con el 10 de corazones, no tiene triunfos y tiene el As de picas y el 9 de picas
- **THEN** juega el As de picas

#### Scenario: Gana con lo justo
- **WHEN** la baza vale 21 puntos, la va ganando un rival con la J de diamantes y la IA tiene la J de corazones y la Q de tréboles
- **THEN** juega la J de corazones

#### Scenario: Partidas completas de Doppelkopf
- **WHEN** se juegan 100 partidas de Doppelkopf entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Doppelkopf
- **WHEN** la IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte

### Requirement: IA del Tarot nivel básico
El Tarot MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Subasta:** valora su mano (cada *oudler*, cada triunfo, cada Rey y cada Dama suman) y pide el contrato más alto cuyo umbral alcanza, si es más alto que el último pedido; si no, pasa. Los umbrales se ajustan al número de jugadores.
- **Llamada al Rey (con 5):** llama al Rey del palo del que tiene más cartas.
- **Descarte:** descarta las cartas permitidas de sus palos más cortos, primero las que más valen.
- **Poignée:** la enseña si es el preneur y puede; si no, no la enseña.
- **Al salir:** juega un Rey de un palo que aún no haya salido; si no tiene, la carta más baja de su palo más largo.
- **Al responder:**
  - si la baza la va ganando alguien que sabe de su bando, le carga la carta permitida que más vale, sin gastar el Petit ni el 21;
  - si no, y la baza vale 2 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar el Petit si tiene otro triunfo.
- **Excusa:** la juega cuando la carta que tendría que jugar vale 2,5 o más y no gana la baza, o cuando le quedan 2 cartas o menos.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Gana con lo justo
- **WHEN** salen picas con la Dama de picas, el que va ganando es un rival y la IA tiene el Rey de picas y el 3 de picas
- **THEN** juega el Rey de picas

#### Scenario: Carga a su bando
- **WHEN** la IA es defensora, otro defensor va ganando la baza y la IA no tiene el palo ni triunfos, pero tiene el Rey de tréboles y el 2 de tréboles
- **THEN** juega el Rey de tréboles

#### Scenario: Partidas completas de Tarot
- **WHEN** se juegan 100 partidas de Tarot entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tarot
- **WHEN** la IA básica juega 200 partidas de 4 contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte

### Requirement: IA de la Sueca nivel básico
La Sueca MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al salir:** juega un As que no sea triunfo; si no tiene, la carta que menos vale de su palo más largo que no sea triunfo; si solo tiene triunfos, el más bajo.
- **Al responder:**
  - si la baza la va ganando su compañero, le carga la carta permitida que más puntos vale, sin gastar un triunfo;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar un triunfo si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Carga a su compañero
- **WHEN** el compañero de la IA va ganando la baza de picas y la IA tiene el As y el 2 de picas
- **THEN** juega el As de picas

#### Scenario: Gana con lo justo
- **WHEN** un rival sale con el As de corazones, el triunfo es picas, la IA no tiene corazones y tiene el 2 y el As de picas
- **THEN** juega el 2 de picas

#### Scenario: Partidas completas de Sueca
- **WHEN** se juegan 100 partidas de Sueca entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Sueca
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Piquet nivel básico
El Piquet MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Cambio:** valora cada carta de su mano: suman su rango, estar en su palo más largo y estar en una posible secuencia o conjunto. Descarta las que menos valen:
  - el mayor, al menos 1 y como mucho 5, y siempre todas las que valen poco hasta ese máximo;
  - el menor, como mucho las que quedan en el montón.
- **Al salir:** juega la carta más alta de su palo más largo.
- **Al responder:** si puede ganar la baza, la gana con la carta más baja que gana; si no, juega la carta más baja permitida.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Gana con lo justo
- **WHEN** el rival sale con la Q de picas y la IA tiene el K, el As y el 7 de picas
- **THEN** juega el K de picas

#### Scenario: Sin poder ganar
- **WHEN** el rival sale con el As de corazones y la IA tiene el 8 y el K de corazones
- **THEN** juega el 8 de corazones

#### Scenario: Partidas completas de Piquet
- **WHEN** se juegan 100 partidas de Piquet entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Piquet
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Jass nivel básico
El Jass MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al elegir el modo:** valora cada modo con su mano:
  - **Un palo de triunfo:** por cada carta de ese palo, J 6, 9 5, A 4, K 3, Q 3 y las demás 2, más 2 por cada As de los otros palos.
  - **Obenabe:** A 5, K 3 y Q 1.
  - **Undenufe:** 6 5, 7 3 y 8 1.

  Elige el modo de más valor si llega a 18 o si su compañero le ha pasado la elección; si no, pasa.
- **Al salir:** juega la carta más alta que queda de un palo, en el orden del modo, si tiene alguna, prefiriendo los palos que no son triunfo; si no, la carta que menos vale de su palo más largo que no sea triunfo; si solo tiene triunfos, el más bajo.
- **Al responder:**
  - si la baza la va ganando su compañero, le carga la carta permitida que más puntos vale, sin gastar un triunfo;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar un triunfo si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Elige el triunfo
- **WHEN** la IA tiene la elección con la Jota, el 9, el As y el Rey de corazones y el As de picas
- **THEN** elige corazones

#### Scenario: Pasa con mano floja
- **WHEN** la IA tiene la elección con una mano sin Jotas, nueves, Ases ni seises
- **THEN** pasa la elección a su compañero

#### Scenario: Elige si le pasan
- **WHEN** el compañero de la IA le ha pasado la elección
- **THEN** elige el modo de más valor, aunque no llegue a 18

#### Scenario: Carga a su compañero
- **WHEN** el modo es Obenabe, el compañero de la IA va ganando la baza de picas con el As y la IA tiene el 10 y el 6 de picas
- **THEN** juega el 10 de picas

#### Scenario: Partidas completas de Jass
- **WHEN** se juegan 100 partidas de Jass entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Jass
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Klaverjas nivel básico
El Klaverjas MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al decidir el triunfo:** valora cada palo con su mano. Por cada carta de ese palo cuenta J 6, 9 5, A 4, 10 3, K 2, Q 2 y las demás 1, y suma 2 por cada As de los otros palos.
  - **Palo propuesto:** juega con él si vale 16 o más; si no, pasa.
  - **Si pasan todos:** elige el palo que más vale.
- **Al salir:** juega la carta más alta que queda de un palo, si tiene alguna, prefiriendo los palos que no son triunfo; si no, la carta que menos vale de su palo más largo que no sea triunfo; si solo tiene triunfos, el más bajo.
- **Al responder:**
  - si la baza la va ganando su compañero, le carga la carta permitida que más puntos vale;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega con un triunfo fuerte
- **WHEN** el palo propuesto es corazones y la IA tiene la Jota, el 9, el As y el 10 de corazones
- **THEN** juega con corazones

#### Scenario: Pasa con un triunfo flojo
- **WHEN** el palo propuesto es corazones y la IA solo tiene el 7 de corazones y ningún As
- **THEN** pasa

#### Scenario: Carga a su compañero
- **WHEN** el triunfo es tréboles, el compañero de la IA va ganando la baza de picas con el As y la IA tiene el 10 y el 7 de picas
- **THEN** juega el 10 de picas

#### Scenario: Partidas completas de Klaverjas
- **WHEN** se juegan 100 partidas de Klaverjas entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Klaverjas
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Barbu nivel básico
El Barbu MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al elegir el contrato:** estima lo que anotaría con su mano en cada contrato que queda y elige el de más valor:
  - **Sin bazas:** −2 por cada carta de la Jota al As.
  - **Sin corazones:** −2 por cada corazón de la Jota al As, y −6 más con el As de corazones.
  - **Sin damas:** −6 por cada dama con menos de 3 cartas más de su palo.
  - **Sin el Rey de corazones:** −20 si tiene el Rey de corazones con menos de 3 corazones más; si no, 0.
  - **Sin las dos últimas:** −3 por cada As y Rey.
  - **Triunfo:** 5 × (largo de su palo más largo + sus Ases − 4), con ese palo de triunfo.
  - **Dominó:** 5 × (sus Jotas + las cartas que encajan seguidas a ellas) − 10.
- **En los contratos de evitar:**
  - al salir, juega la carta más baja de su palo más corto entre las que puede;
  - al seguir el palo, la más alta que no gana la baza o, si todas ganan, la más alta;
  - sin el palo, se descarta de la carta que penaliza en el contrato y, si no tiene, de la más alta.
- **En el triunfo:** sale con sus Ases y, si no, con la más baja; si puede ganar la baza, la gana con lo justo; si no, juega la más baja.
- **En el dominó:** juega la carta que encaja que le deja más cartas suyas por jugar en esa fila; a igualdad, la más alejada de la Jota.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Elige el triunfo con un palo largo
- **WHEN** quedan todos los contratos y la IA tiene siete picas con el As y otros dos Ases
- **THEN** elige el triunfo de picas

#### Scenario: Se descarta del Rey de corazones
- **WHEN** el contrato es sin el Rey de corazones y salen picas, que la IA no tiene
- **THEN** juega el Rey de corazones si lo tiene

#### Scenario: No gana la baza
- **WHEN** el contrato es sin bazas, la baza de diamantes la va ganando el 10 y la IA tiene el 9 y la Dama de diamantes
- **THEN** juega el 9 de diamantes

#### Scenario: Partidas completas de Barbu
- **WHEN** se juegan 100 partidas de Barbu entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Barbu
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte

### Requirement: IA del Five Hundred nivel básico
El Five Hundred MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al pujar:** estima las bazas que gana su pareja con cada palo de triunfo y sin triunfo:
  - **Con triunfo:** 1 por el comodín, por cada Jota del triunfo o de su color y por el As del triunfo; 0,5 por cada otro triunfo; 1 por cada As de otro palo; y 1,5 por su compañero.
  - **Sin triunfo:** 1 por el comodín y por cada As, 0,5 por cada Rey, y 1,5 por su compañero.
  - **Puja:** la más baja que supere la puja más alta y no pase de las bazas estimadas (redondeadas hacia abajo), en el contrato de más bazas estimadas. Si no puede, pasa.
  - **Misère:** si no tiene el comodín ni más de una carta de la Jota al As, y nadie ha pujado más de 8 picas, puja misère.
- **Al descartarse:** se descarta de las 3 cartas que no son triunfo de menos rango, empezando por sus palos más cortos.
- **En las bazas:**
  - al salir, juega la carta más alta que queda de un palo si es suya, y si no, la más baja de su palo más largo que no sea triunfo;
  - si la baza la va ganando su compañero, juega la carta más baja;
  - si no, la gana con la carta más baja que pueda o, si no puede, juega la más baja.
- **En el misère:** quien juega echa la carta más alta que no gana la baza; si todas ganan, la más baja. Los rivales juegan la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con un triunfo fuerte
- **WHEN** la puja más alta es 6 sin triunfo y la IA tiene el comodín, las dos Jotas rojas, el As y el Rey de corazones y dos Ases más
- **THEN** puja 7 corazones

#### Scenario: Pasa con mano floja
- **WHEN** la puja más alta es 9 sin triunfo y la IA tiene una mano sin comodín, sin Jotas y sin Ases
- **THEN** pasa

#### Scenario: Juega con lo justo
- **WHEN** el triunfo es picas, un rival sale con el Rey de corazones y la IA tiene el As y el 5 de corazones
- **THEN** juega el As de corazones

#### Scenario: Partidas completas de Five Hundred
- **WHEN** se juegan 100 partidas de Five Hundred entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Five Hundred
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA de la Scopa nivel básico
La Scopa MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST puntuar cada jugada legal y elegir la de más valor:
- **Al capturar:**
  - una scopa vale 1000;
  - cada carta capturada (la jugada incluida) vale 3, más 100 si es el siete de oros, 30 si es un siete y 10 si es un oro.
- **Al dejar una carta en la mesa:** resta lo que valdría capturarla.
- **Riesgo:** resta 80 si la mesa que queda suma 10 o menos y no está vacía, porque el rival podría llevársela entera de una vez.

Con 4 jugadores, el riesgo se valora igual. Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Prefiere la scopa
- **WHEN** en la mesa solo hay un 3 y un 4 y la IA tiene un 7 de copas y un 3 de bastos
- **THEN** juega el 7 y se lleva las dos cartas

#### Scenario: Se lleva el settebello
- **WHEN** en la mesa hay un 7 de oros y un 7 de copas y la IA juega un 7
- **THEN** se lleva el 7 de oros

#### Scenario: Partidas completas de Scopa
- **WHEN** se juegan 100 partidas de Scopa entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Scopa
- **WHEN** una IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Tressette nivel básico
El Tressette MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Una carta es «la más alta que queda» de su palo si ninguna carta más alta de ese palo sigue sin jugar fuera de la mano de la IA. Este nivel MUST jugar así:
- **Al salir:** juega la carta más alta que queda de algún palo, la que más puntos vale si hay varias; si no tiene ninguna, la carta más baja de su palo más largo.
- **Al responder:**
  - si la baza la va ganando su compañero y es segura (la IA es la última en jugar, o la carta del compañero es la más alta que queda de su palo), le carga la carta permitida que más puntos vale;
  - si no, y la baza vale algún punto o es la última en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale y, entre las que valen lo mismo, la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Sale con la más alta que queda
- **WHEN** la IA sale, tiene el 3 de oros, el As de oros y el 5 de copas, y no se ha jugado ninguna carta
- **THEN** juega el 3 de oros

#### Scenario: Carga a su compañero
- **WHEN** el compañero de la IA va ganando la baza de copas con el 3 de copas y la IA tiene el As y el 4 de copas
- **THEN** juega el As de copas

#### Scenario: Gana con lo justo
- **WHEN** la IA es la última en jugar en una baza de oros que gana un rival con el rey, y tiene el 2 y el 3 de oros
- **THEN** juega el 2 de oros

#### Scenario: Partidas completas de Tressette
- **WHEN** se juegan 100 partidas de Tressette entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tressette
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Schafkopf nivel básico
El Schafkopf MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST anunciar así, eligiendo el contrato más alto que cumpla y que esté permitido:
- **Solo:** si con algún palo de triunfo tiene 6 triunfos o más y al menos 3 son damas o jotas; elige el palo con el que más triunfos tiene.
- **Wenz:** si tiene 3 jotas o más y 2 Ases o más.
- **Rufspiel:** si tiene 4 triunfos o más (con los corazones) y al menos 2 son damas o jotas, y puede llamar a algún As; llama al del palo del que menos cartas tiene.
- Si no, pasa.

Y jugar así:
- **Al salir:** si juega solo o es del lado del que juega, sale con su triunfo más alto si tiene una dama o una jota que sea triunfo; si no, con un As que no sea triunfo; si no, con la carta que menos vale.
- **Al responder:**
  - si la baza la va ganando un compañero conocido, le carga la carta permitida que más puntos vale, sin gastar un triunfo si puede;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar un triunfo si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Anuncia un Solo
- **WHEN** la IA tiene las damas de tréboles y picas, la jota de tréboles y el As, el 10 y el 9 de tréboles: 6 triunfos si el triunfo es tréboles
- **THEN** anuncia un Solo de tréboles

#### Scenario: Pasa con mano floja
- **WHEN** la IA no tiene damas ni jotas y tiene un solo corazón
- **THEN** pasa

#### Scenario: Gana con lo justo
- **WHEN** en un Rufspiel la IA es la última en jugar en una baza de picas en la que un rival gana con el As y hay también un 10, no tiene picas y solo tiene la jota de diamantes y la dama de tréboles
- **THEN** echa la jota de diamantes

#### Scenario: Partidas completas de Schafkopf
- **WHEN** se juegan 100 partidas de Schafkopf entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Schafkopf
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de una de cada cuatro

### Requirement: IA del Truco nivel básico
El Truco MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar como la IA básica del Truc, con las apuestas del Truco:
- **Envido:** canta envido con 30 puntos o más. Al responder, sube a real envido con 31 o más y a falta envido con 33 o más si puede; si no, quiere según sus puntos, con más exigencia cuanto más alto es lo cantado.
- **Truco:** valora su mano por sus cartas y las bazas ya ganadas. Canta truco o sube con una mano fuerte y acepta solo si su mano lo justifica. Con una probabilidad baja y fija farolea; esa decisión sale del azar del agente, así que es reproducible.
- **Al jugar:** gana la baza con la carta más baja que la gane cuando le conviene. Si no puede ganarla o ya la gana su compañero, juega la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Canta envido con muchos puntos
- **WHEN** a la IA le toca en la primera baza con 33 puntos de envido y nadie ha cantado
- **THEN** canta envido

#### Scenario: No quiere con mano mala
- **WHEN** el rival le canta truco a la IA y ella tiene un 4, un 5 y un 6 sin bazas ganadas
- **THEN** no quiere

#### Scenario: Partidas completas de Truco
- **WHEN** se juegan 200 partidas de Truco entre IAs con semillas distintas, de 2 y de 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Truco
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

### Requirement: IA del Préférence nivel básico
El Préférence MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Bazas que espera:** cuenta 1 por cada As; 1 por cada rey con el As de su palo o con otra carta, y medio si va solo; medio por cada dama con el As o el rey de su palo o con dos cartas más; y, en el palo de triunfo, 1 por cada carta pasada de la segunda.
- **Subasta:** a las bazas que espera suma 1 por lo que mejorará con la viuda y el descarte. Puja en el palo (o sin triunfo) con el que más bazas espera, si llegan a 6: la puja más baja permitida en ese palo, si no pasa de ese número de bazas. Puja miseria, si puede, cuando no tiene ninguna carta más alta que el 9. Si no, pasa.
- **Descarte:** descarta las 2 cartas que menos valen fuera del palo de triunfo, de sus palos más cortos (en la miseria, las 2 más altas).
- **Contrato:** declara lo que pujó.
- **Whist:** hace whist si, con el triunfo del contrato, espera ganar al menos la mitad (redondeando hacia arriba) de las bazas que les tocan a los que hacen whist: 2 en un 6 y 1 en un 7, un 8 o un 9; en un 10 hace whist siempre.
- **Al jugar:**
  - si quiere ganar, sale con su carta más alta de su palo más largo y responde ganando la baza con la carta más baja que pueda;
  - en la miseria del que juega y en la raspasy, echa la carta más alta que no gane la baza, o la más baja si todas ganan.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con mano fuerte
- **WHEN** a la IA le toca pujar sin pujas antes y tiene As, rey, dama, jota, 10 y 9 de corazones y los Ases de picas y tréboles
- **THEN** puja 6 de corazones

#### Scenario: Pasa con mano floja
- **WHEN** a la IA le toca pujar con una mano sin Ases ni reyes y con alguna carta más alta que el 9
- **THEN** pasa

#### Scenario: No gana en la raspasy
- **WHEN** en la raspasy salen picas con el 10 y la IA tiene el 9 y la dama de picas
- **THEN** echa el 9 de picas

#### Scenario: Partidas completas de Préférence
- **WHEN** se juegan 100 partidas de Préférence entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Préférence
- **WHEN** una IA básica juega 200 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de una de cada tres

### Requirement: IA del Cuarenta nivel básico
El Cuarenta MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST puntuar cada jugada legal y elegir la de más valor:
- **Al capturar:**
  - una caída vale 100;
  - una limpia vale 80;
  - cada carta capturada (la jugada incluida) vale 5.
- **Al dejar una carta en la mesa:**
  - resta lo que valdría capturar con ella;
  - resta 40 si quedan cartas de ese número que no ha visto, porque el siguiente podría hacer caída;
  - resta 30 si la mesa que queda tiene una sola carta o suma 7 o menos con todas sus cartas del As al 7, porque el siguiente podría hacer limpia.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Prefiere la caída
- **WHEN** el rival acaba de echar un 4, en la mesa están ese 4 y una K, y la IA tiene un 4 y una K
- **THEN** juega el 4 y se lleva el 4 del rival

#### Scenario: Suelta la carta más segura
- **WHEN** la IA no puede capturar, la mesa está vacía y tiene un 3 del que ya han salido los otros tres y un 6 del que no ha salido ninguno
- **THEN** suelta el 3

#### Scenario: Partidas completas de Cuarenta
- **WHEN** se juegan 100 partidas de Cuarenta entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cuarenta
- **WHEN** una IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Pishti nivel básico
El Pishti MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST puntuar cada carta que puede echar y elegir la de más valor. Cuentan como puntos de carta: 1 por cada As y cada J, 2 por el 2 de tréboles y 3 por el 10 de diamantes.
- **Al llevarse el montón:**
  - un pishti vale 1000 (2000 si es de J);
  - cada carta que se lleva (la jugada incluida) vale 5, y cada punto de carta, 30;
  - llevárselo con una J sin hacer pishti resta 60, para guardar la J si el montón vale poco.
- **Al echar una carta sin llevarse nada:**
  - resta 30 por cada punto de su carta;
  - si el montón estaba vacío y quedan cartas de su número que no ha visto, resta 300 (600 si es una J), porque el siguiente podría hacer pishti;
  - si no, resta la mitad de lo que vale el montón que queda, porque el siguiente podría llevárselo.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Prefiere el pishti
- **WHEN** el montón tiene solo un 8 y la IA tiene un 8 y una J
- **THEN** echa el 8

#### Scenario: Guarda la J
- **WHEN** el montón tiene un 4 y un 9 a la vista, sin tapadas, y la IA tiene una J y un 6
- **THEN** echa el 6

#### Scenario: Partidas completas de Pishti
- **WHEN** se juegan 100 partidas de Pishti entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Pishti
- **WHEN** una IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Écarté nivel básico
El Écarté MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar con estas reglas:
- **Bazas que espera:**
  - cada triunfo cuenta 1 si es K, Q o J, o si tiene 3 triunfos o más, y medio si no;
  - cada rey de otro palo cuenta 1 y cada dama de otro palo, medio.
- **Cambio:**
  - el mano juega si espera 3 bazas o más, y si no, propone;
  - el que reparte rehúsa si espera 3 bazas o más, y si no, acepta.
- **Descarte:**
  - se descarta de todas las cartas que no son triunfo ni rey, empezando por las más bajas y sin pasar de las que quedan en el montón;
  - si quiere quedarse con todas, el mano se descarta de su carta más baja que no sea triunfo y el que reparte no se descarta de ninguna.
- **Salir:** con un rey que no es triunfo si tiene; si no, con su triunfo más alto si tiene dos o más; si no, con la carta más baja de su palo más largo.
- **Responder:** con la carta legal más baja que gane la baza; si no puede ganarla, con la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega de autoridad con buena mano
- **WHEN** el mano tiene la K, la Q y la J de triunfo y otras dos cartas bajas
- **THEN** juega sin proponer

#### Scenario: Propone con mala mano
- **WHEN** el mano no tiene triunfos ni reyes
- **THEN** propone el cambio

#### Scenario: Se descarta de las cartas flojas
- **WHEN** la IA cambia con dos triunfos, un rey de otro palo, un 8 y un 7
- **THEN** se descarta del 8 y del 7

#### Scenario: Partidas completas de Écarté
- **WHEN** se juegan 100 partidas de Écarté entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Écarté
- **WHEN** una IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad

### Requirement: IA del Tysiącha nivel básico
El Tysiącha MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar con estas reglas:
- **Valor de la mano:**
  - 11 por cada As;
  - 10 por cada 10 que tenga el As de su palo o al menos dos cartas más de su palo;
  - lo que valen los matrimonios que tiene;
  - 20 más, por lo que espera del prikup.
- **Subasta:** sube 5 si la nueva puja no pasa del valor de la mano (y puede pujar más de 120); si no, pasa.
- **Dar cartas:** da a cada rival una de sus cartas más bajas que no sea de un matrimonio ni un As, empezando por los 9.
- **Contrato:** fija el mayor entre su puja y el valor de la mano sin el bono del prikup, redondeado a 5 hacia abajo y dentro del tope.
- **Salir:**
  - si puede cantar, sale con la Q del matrimonio que más vale;
  - si no, con un As;
  - si no, con un 10 cuyo As ya ha salido;
  - si no, con la carta más baja de su palo más largo que no sea de un matrimonio.
- **Responder:** con la carta legal más baja que gane la baza. Si no puede ganarla, con la más baja que no sea de un matrimonio.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con buena mano
- **WHEN** la IA tiene el matrimonio de corazones y dos Ases, y la puja está en 100
- **THEN** sube a 105

#### Scenario: Pasa con mala mano
- **WHEN** la IA no tiene Ases ni matrimonios y la puja está en 100
- **THEN** pasa

#### Scenario: Canta en cuanto puede
- **WHEN** la IA sale, ya ganó una baza y tiene el K y la Q de diamantes
- **THEN** sale con la Q de diamantes y canta 80

#### Scenario: Da las cartas flojas
- **WHEN** la IA es declarante con dos 9 que no son de ningún matrimonio
- **THEN** da un 9 a cada rival

#### Scenario: Partidas completas de Tysiącha
- **WHEN** se juegan 100 partidas de Tysiącha entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tysiącha
- **WHEN** una IA básica juega 200 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la tercera parte

### Requirement: IA del Sheepshead nivel básico
El Sheepshead MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar con estas reglas:
- **Coger:** coge el blind si tiene al menos 3 triunfos que sean Q o J, o al menos 4 triunfos de los que uno sea Q; si no, pasa.
- **Enterrar:** entierra primero las cartas de otro palo que tiene solas en su palo, empezando por las que más puntos valen (y nunca la J de diamantes); si no, las de menos rango.
- **Salir:**
  - el picker y su compañero conocido, con su triunfo más alto;
  - los demás, con el As de un palo sin triunfo si lo tienen; si no, con su carta más baja de otro palo.
- **Responder:**
  - si la baza la gana alguien de su bando conocido, echa la carta que más puntos vale de las que no ganan;
  - si no, la carta legal más baja que gana la baza;
  - si no puede ganarla, la que menos puntos vale.
- **Leaster:** intenta no ganar bazas: echa la carta más alta que no gana y, si todas ganan, la más alta; al salir, su carta más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Coge con buena mano
- **WHEN** la IA tiene la Q de tréboles, la Q de picas y la J de corazones
- **THEN** coge el blind

#### Scenario: Pasa con mala mano
- **WHEN** la IA tiene un solo triunfo
- **THEN** pasa

#### Scenario: Entierra un As suelto
- **WHEN** el picker tiene el As de picas como única pica
- **THEN** lo entierra

#### Scenario: Partidas completas de Sheepshead
- **WHEN** se juegan 100 partidas de Sheepshead entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Sheepshead
- **WHEN** una IA básica juega 200 partidas contra cuatro jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la quinta parte

### Requirement: IA del Rentz nivel básico
El Rentz MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Al elegir el contrato:** estima lo que anotaría con su mano en cada contrato que le queda y elige el de más valor:

  | Contrato | Estimación |
  |---|---|
  | Sin bazas | −5 por cada carta de la J al As |
  | Sin corazones | −5 por cada corazón de la J al As |
  | Sin damas | −10 por cada dama con menos de 3 cartas más de su palo |
  | Sin el K de corazones | −40 si tiene el K de corazones con menos de 3 corazones más; si no, 0 |
  | Sin la última baza | −10 por cada As |
  | Bazas | 5 × (sus Ases y K − 2) |
  | Dominó | 5 × (sus J y las cartas que encajan seguidas a ellas − 1) |

- **En los contratos de evitar:**
  - al salir, juega la carta más baja de su palo más corto;
  - al seguir el palo, la más alta que no gana la baza o, si todas ganan, la más alta;
  - sin el palo, se descarta de la carta que resta en el contrato y, si no tiene, de la más alta.
- **En el contrato de bazas:**
  - al salir, con un As si tiene; si no, con la más baja;
  - al responder, con la más baja que gana la baza o, si no puede ganar, con la más baja.
- **En el dominó:** pone la carta que le deja más cartas suyas por poner en esa fila; a igualdad, la más alejada de la J.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Elige bazas con cartas altas
- **WHEN** la IA elige con los cuatro Ases, dos K y dos cartas bajas, y le quedan todos los contratos
- **THEN** elige el contrato de bazas

#### Scenario: Sale bajo en un contrato de evitar
- **WHEN** en sin bazas la IA sale con un 7 de picas solo y varios corazones
- **THEN** sale con el 7 de picas

#### Scenario: Se descarta de una dama
- **WHEN** en sin damas la IA no tiene el palo de salida y tiene una dama
- **THEN** echa la dama

#### Scenario: Partidas completas de Rentz
- **WHEN** se juegan 100 partidas de Rentz entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Rentz
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte

### Requirement: IA del Bourré nivel básico
El Bourré MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Bazas esperadas:** 1 por cada triunfo de la J al As y por cada As de otro palo; 0,5 por cada otro triunfo y por cada K de otro palo.
- **Jugar o pasar:** juega si espera al menos 1,5 bazas o tiene al menos 2 triunfos; si no, pasa.
- **Cambio:** se descarta de todas las cartas que no son triunfo, ni As, ni K (nunca de la vuelta), empezando por las más bajas.
- **Salir:** con el As de otro palo si tiene; si no, con su triunfo más alto; si no, con su carta más baja.
- **Responder:** con la carta legal más baja que gana la baza; si no puede ganarla, con la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega con dos triunfos
- **WHEN** la IA tiene dos triunfos bajos y tres cartas bajas de otros palos
- **THEN** juega la mano

#### Scenario: Pasa con mala mano
- **WHEN** la IA no tiene triunfos, ni Ases, ni K
- **THEN** pasa

#### Scenario: Se descarta de lo flojo
- **WHEN** la IA cambia con el As de picas, dos triunfos, el 4 de tréboles y el 6 de corazones (que no son triunfo)
- **THEN** se descarta del 4 de tréboles y del 6 de corazones

#### Scenario: Partidas completas de Bourré
- **WHEN** se juegan 100 partidas de Bourré entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Bourré
- **WHEN** una IA básica juega 200 partidas contra cuatro jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la quinta parte

### Requirement: IA del Tresillo nivel básico
El Tresillo MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Bazas esperadas con un palo de triunfo:** 1 por cada matador y por el punto; 0,75 por el rey del triunfo y 0,5 por cada otro triunfo; 0,75 por cada rey de otro palo.
- **Subasta:** con el palo que más bazas espera, puja solo si espera al menos 5,5, entrada si espera al menos 3,5, y vuelta si de media con los cuatro palos espera al menos 3; puja el más alto de esos contratos si supera al último pujado, y si no, pasa.
- **Triunfo:** el palo con el que más bazas espera.
- **Cambio:** se descarta de todas las cartas que no son triunfo ni rey, empezando por las más bajas y sin pasar de las que quedan en el monte (en la vuelta, al menos una).
- **Salir:** el hombre, con su triunfo más alto mientras tenga triunfos; un defensor, con un rey de otro palo si tiene, y si no, con su carta más baja.
- **Responder:** si la baza ya la gana el otro defensor, un defensor echa su carta legal más baja; si no, la carta legal más baja que gana la baza, o la más baja si no puede ganarla.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja el solo con una gran mano
- **WHEN** la IA tiene los tres matadores, el punto y el rey de oros, y dos reyes de otros palos
- **THEN** puja solo

#### Scenario: Pasa con mala mano
- **WHEN** la IA no tiene matadores, ni reyes, y como mucho dos cartas de cada palo
- **THEN** pasa

#### Scenario: No gasta en la baza del compañero
- **WHEN** la IA defiende y el otro defensor va ganando la baza con un rey
- **THEN** echa su carta legal más baja

#### Scenario: Partidas completas de Tresillo
- **WHEN** se juegan 100 partidas de Tresillo entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tresillo
- **WHEN** una IA básica juega 300 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la tercera parte

### Requirement: IA del Conquián nivel básico
El Conquián MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Carta descubierta:** la usa siempre que puede, con la jugada que baja más cartas de su mano (si empatan, la que añade a una combinación propia).
- **Descarte:** descarta la carta que menos le sirve:
  - primero evita las que el rival podría añadir a sus combinaciones;
  - entre las demás, la que tiene menos relación con el resto de su mano (otras del mismo número y del mismo palo a una o dos posiciones);
  - si empatan, la más alta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Usa la carta para bajar
- **WHEN** se descubre el 5 de bastos y la IA tiene el 5 de oros y el 5 de copas
- **THEN** baja el grupo de cincos

#### Scenario: Descarta la carta suelta
- **WHEN** la IA tiene que descartar con el 3 y el 4 de copas, el 6 y el 6 de otros palos y el rey de oros solo
- **THEN** descarta el rey de oros

#### Scenario: No da cartas al rival
- **WHEN** el rival tiene bajada la escalera del 3 al 5 de espadas y la IA podría descartar el 6 de espadas u otra carta suelta
- **THEN** no descarta el 6 de espadas

#### Scenario: Partidas completas de Conquián
- **WHEN** se juegan 100 partidas de Conquián entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Conquián
- **WHEN** una IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
