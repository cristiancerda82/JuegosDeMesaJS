## 1. Motor

- [x] 1.1 `tapadas` en la config (normalizada) y en el estado; la acción `pedirTapada`; la vista con las tapadas ajenas ocultas, `visibles` sin ellas y la última acción sin la carta tapada
- [x] 1.2 Tests de los escenarios nuevos de `specs/juego-siete-y-media` y la suite genérica del contrato con la opción

## 2. IA

- [x] 2.1 La IA básica con la opción (el punto pide tapada; la banca cuenta medio punto por tapada) y la reconstrucción con las tapadas
- [x] 2.2 Tests de los escenarios de la IA, partidas entre IAs y contra el azar con la opción, la reconstrucción, el tiempo y la fuerza del difícil

## 3. Cliente

- [x] 3.1 La casilla «Pedir tapada» en las opciones (local y sala en red) y sus textos
- [x] 3.2 La mesa: «Pedir destapada» y «Pedir tapada», la marca de las tapadas propias, las ajenas boca abajo y el aviso
- [x] 3.3 La guía: la variante y su opción

## 4. Verificación

- [x] 4.1 E2E: con la opción, pedir tapada (el rival no la ve), pedir destapada y una partida completa; 360 × 640 sin scroll horizontal; sala en red con la opción
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
