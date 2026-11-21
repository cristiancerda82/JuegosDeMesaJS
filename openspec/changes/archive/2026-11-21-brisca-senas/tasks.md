## 1. Motor

- [x] 1.1 `senas` en la config, normalizada en `crear` (solo con 4 jugadores); `senasDe` y las señas en la vista
- [x] 1.2 Tests de los escenarios nuevos de `specs/juego-brisca` y la suite genérica del contrato con la opción

## 2. IA

- [x] 2.1 IA normal: medir reglas que usan las señas; no mejoran, así que decide igual con o sin señas (con su test)
- [x] 2.2 Difícil: la reconstrucción respeta las señas del compañero, con sus tests
- [x] 2.3 Partidas entre IAs con la opción y el tiempo de decisión

## 3. Cliente

- [x] 3.1 La casilla «Con señas» en las opciones (local y sala en red), desactivada con 2 jugadores, y sus textos
- [x] 3.2 Las señas del compañero en la mesa
- [x] 3.3 La guía con la variante

## 4. Verificación

- [x] 4.1 E2E: partida de 4 con señas contra la IA; la casilla desactivada con 2; sala en red con la opción; la guía
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
