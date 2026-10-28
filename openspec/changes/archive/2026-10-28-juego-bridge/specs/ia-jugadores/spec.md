## ADDED Requirements

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
