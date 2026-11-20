## 1. Motor

- [x] 1.1 `dominoElegido` en la config (normalizada), la fase `inicio`, la acción para elegir el número, `inicio` en el estado y la vista, y el encaje desde ese número
- [x] 1.2 Tests de los escenarios nuevos de `specs/juego-barbu` y la suite genérica del contrato con la opción

## 2. IA

- [x] 2.1 La IA básica elige el número, valora el dominó con el mejor número y juega desde él; la reconstrucción copia el número y el difícil deja el número a la base
- [x] 2.2 Tests de los escenarios de la IA, partidas entre IAs y contra el azar con la opción, la reconstrucción y la fuerza del difícil

## 3. Cliente

- [x] 3.1 La casilla «Dominó: elige el número» en las opciones (local y sala en red) y sus textos
- [x] 3.2 La mesa: elegir el número, las filas desde el número elegido y el contrato con el número
- [x] 3.3 La guía: la variante y su opción

## 4. Verificación

- [x] 4.1 E2E: con la opción, elegir el dominó y el número, y que solo encajen las cartas de ese número al empezar; sala en red con la opción
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
