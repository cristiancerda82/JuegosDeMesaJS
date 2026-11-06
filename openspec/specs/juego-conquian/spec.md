# juego-conquian Specification

## Purpose
TBD - created by archiving change juego-conquian. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Conquián
El Conquián MUST jugarse entre 2 jugadores con la baraja española de 40 cartas. El orden de cada palo MUST ser As, 2, 3, 4, 5, 6, 7, sota, caballo y rey: el 7 y la sota van seguidos, y el As solo va antes del 2.

En cada mano MUST repartirse 10 cartas a cada jugador; las 20 restantes forman el mazo, boca abajo. En la primera mano empieza el asiento 0, y en cada mano siguiente empieza el otro.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 10 cartas y quedan 20 en el mazo, y se descubre la primera para quien empieza

### Requirement: Combinaciones del Conquián
Una combinación MUST ser:
- **grupo:** 3 o 4 cartas del mismo número;
- **escalera:** 3 o más cartas seguidas del mismo palo, en el orden del Conquián y sin dar la vuelta.

#### Scenario: Escalera con el 7 y la sota
- **WHEN** un jugador baja el 6, el 7 y la sota de copas
- **THEN** es una escalera válida

#### Scenario: Sin dar la vuelta
- **WHEN** un jugador intenta bajar el rey, el As y el 2 de oros
- **THEN** no es una combinación

### Requirement: La carta descubierta del Conquián
En cada momento hay como mucho una carta descubierta, que se ofrece a un jugador. Ese jugador MUST elegir entre:
- **usarla:** bajarla en una combinación nueva con al menos 2 cartas de su mano, o añadirla a una de sus combinaciones, sola o con cartas de su mano, de forma que la combinación siga siendo válida;
- **pasar.**

Ninguna carta se MUST meter en la mano: la carta descubierta solo se usa bajándola.

El orden en que se ofrece MUST ser:
- **la que se descubre del mazo:** primero a quien la descubre y, si pasa, a su rival;
- **la que se descarta:** solo al rival de quien la descarta.

Si nadie la usa, la carta queda muerta (boca arriba, a la vista) y quien no descubrió ni descartó esa carta MUST descubrir la siguiente del mazo.

#### Scenario: Pasa el que la descubre
- **WHEN** el jugador descubre una carta y pasa
- **THEN** se ofrece la misma carta a su rival

#### Scenario: Pasan los dos
- **WHEN** el jugador descubre una carta y los dos pasan
- **THEN** la carta queda muerta y su rival descubre la siguiente

#### Scenario: Usarla en una combinación nueva
- **WHEN** se descubre el 5 de bastos y el jugador tiene el 5 de oros y el 5 de copas
- **THEN** puede bajar el grupo de cincos con las tres cartas

#### Scenario: Añadirla a una combinación propia
- **WHEN** el jugador tiene bajada la escalera del 3 al 5 de espadas y se descubre el 6 de espadas
- **THEN** puede añadirlo a su escalera

### Requirement: Descarte del Conquián
Tras usar la carta descubierta, el jugador MUST descartar una carta de su mano (salvo que con esa jugada gane la mano). La carta descartada se ofrece solo a su rival.

#### Scenario: Descartar tras bajar
- **WHEN** el jugador baja un grupo con la carta descubierta y 2 de su mano
- **THEN** le quedan 8 cartas, descarta una y se ofrece a su rival

### Requirement: Fin de la mano del Conquián
Un jugador MUST ganar la mano en cuanto tiene 11 cartas bajadas: las 10 que le quedan sin descartar más la última que usa, sin quedarle ninguna en la mano. Si hay que descubrir una carta y el mazo está vacío, la mano MUST terminar en tablas.

#### Scenario: Ganar la mano
- **WHEN** al jugador le queda una sola carta en la mano y la baja con la carta descubierta
- **THEN** tiene 11 cartas bajadas y gana la mano

#### Scenario: Tablas
- **WHEN** nadie usa la última carta del mazo
- **THEN** la mano termina en tablas

### Requirement: Partida al mejor de 5 del Conquián
La partida MUST ganarla quien gana 3 manos; las tablas no cuentan. Si tras 9 manos nadie ha ganado 3, gana quien más manos ha ganado, o es empate si han ganado las mismas.

#### Scenario: Tres manos ganadas
- **WHEN** un jugador gana su tercera mano
- **THEN** gana la partida

### Requirement: Vista del jugador en el Conquián
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tiene el rival;
- las combinaciones bajadas de cada uno;
- la carta descubierta, a quién se ofrece y de dónde viene (del mazo o del descarte);
- las cartas muertas y cuántas quedan en el mazo;
- las manos ganadas por cada uno y el resumen de las manos anteriores.

La vista MUST NOT mostrar la mano del rival ni el orden del mazo.

#### Scenario: Mano del rival oculta
- **WHEN** el jugador mira la mesa
- **THEN** ve cuántas cartas tiene el rival, pero no cuáles
