## 1. Motor

- [x] 1.1 `dobleCualquiera` en la config (normalizada con el pago doble) y la liquidación que paga el doble a cualquier siete y media con la opción
- [x] 1.2 Tests de los escenarios nuevos de `specs/juego-siete-y-media`, la suite genérica del contrato y la reconstrucción con la opción

## 2. Cliente

- [x] 2.1 La casilla «Con cualquier siete y media» en las opciones (local y sala en red), desactivada sin pago doble, y sus textos
- [x] 2.2 La guía: la variante y su opción

## 3. IA

- [x] 3.1 Partidas entre IAs y contra el azar con la opción

## 4. Verificación

- [x] 4.1 E2E: la casilla se desactiva sin pago doble, y con la opción se juega una partida completa; sala en red con la opción
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
