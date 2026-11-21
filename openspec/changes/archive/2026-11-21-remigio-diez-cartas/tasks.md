## 1. Motor

- [x] 1.1 Las cartas francesas del Remigio (`cartasRemigio` con diez cartas) y sus puntos
- [x] 1.2 `remigio-diez.ts`: las cartas sin ligar de una mano y la jugada de cierre con su multiplicador, con sus tests
- [x] 1.3 `diezCartas` en la config, el reparto de 10, la acción `cerrar`, las acciones legales y la puntuación con premios; el resultado de la mano con la jugada, el multiplicador y las sueltas
- [x] 1.4 Tests de los escenarios nuevos de `specs/juego-remigio`, la suite genérica del contrato con la opción y la reconstrucción

## 2. IA

- [x] 2.1 IA normal con diez cartas: cerrar, robar del montón y descartar según los puntos sin ligar
- [x] 2.2 Difícil: candidatas con `cerrar`, valoración por puntos sin ligar y reconstrucción con la baraja de la config
- [x] 2.3 Partidas entre IAs y contra el azar con la opción, y el tiempo de decisión

## 3. Cliente

- [x] 3.1 La casilla «Diez cartas» en las opciones (local y sala en red) y sus textos
- [x] 3.2 La mesa con diez cartas: «Cerrar», sin combinaciones, puntos sin ligar, orden francés y avisos
- [x] 3.3 El resumen con el premio y las cartas sin ligar
- [x] 3.4 El catálogo con las dos barajas y la guía con la variante

## 4. Verificación

- [x] 4.1 E2E: partida completa con diez cartas contra la IA; sala en red con la opción; el Remigio en el filtro de baraja francesa
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
