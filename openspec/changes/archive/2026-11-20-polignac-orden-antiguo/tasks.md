## 1. Motor

- [x] 1.1 `ordenAntiguo` en la config (normalizada), el orden, las cartas legales con la obligación de soltar Jotas y `sinJotas` en el estado y la vista
- [x] 1.2 Tests de los escenarios nuevos de `specs/juego-polignac` y la suite genérica del contrato con la opción

## 2. IA

- [x] 2.1 La IA básica con el orden de la variante y la reconstrucción con lo que se sabe de las Jotas
- [x] 2.2 Tests de los escenarios de la IA, partidas entre IAs y contra el azar con la opción, la reconstrucción y la fuerza del difícil

## 3. Cliente

- [x] 3.1 La casilla «Orden antiguo» en las opciones (local y sala en red) y sus textos
- [x] 3.2 La mesa ordena la mano con el orden de la variante
- [x] 3.3 La guía: la variante y su opción

## 4. Verificación

- [x] 4.1 E2E: con la opción, una partida completa contra la IA y sala en red con la opción
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
