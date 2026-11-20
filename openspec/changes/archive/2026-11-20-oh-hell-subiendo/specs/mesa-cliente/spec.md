## ADDED Requirements

### Requirement: Oh Hell empezando con 1 carta en el cliente
Las opciones del Oh Hell MUST tener la casilla «Empezar con 1 carta», desactivada por defecto, en local y al crear una sala en red. La guía del Oh Hell MUST explicar la variante y decir que se activa con esa opción. Con la opción, la mesa MUST contar las manos de la variante.

#### Scenario: Empezar con 1 carta en la mesa
- **WHEN** el jugador empieza un Oh Hell de 4 con la opción
- **THEN** recibe 1 carta y la mesa dice «Mano 1 de 12 · 1 carta»

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Oh Hell
- **THEN** ve explicado el orden que sube desde 1 y que se activa en las opciones
