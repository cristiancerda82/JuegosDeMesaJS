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
