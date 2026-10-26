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

Este nivel MUST terminar con menos puntos que los jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Se deshace de la Q de picas
- **WHEN** la IA no tiene el palo de salida y tiene la Q de picas
- **THEN** juega la Q de picas

#### Scenario: No gana pudiendo evitarlo
- **WHEN** la IA sigue el palo y tiene cartas más bajas y más altas que la que va ganando la baza
- **THEN** juega la más alta de las que no ganan

#### Scenario: Partidas completas de Corazones
- **WHEN** se juegan 1.000 partidas de Corazones entre IAs con semillas distintas y distintas opciones
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en los Corazones
- **WHEN** la IA básica juega 1.000 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas

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
