## 1. Motor

- [x] 1.1 `jugadores` en la config (normalizado a 4 si falta), `jugadoresSubastado`, `barajaTuteSubastado` y `pujaMinimaSubastado`
- [x] 1.2 Con 3: el reparto de 12 sin doses, la puja desde 70, sin tute y el cobro de dos defensores
- [x] 1.3 Tests de los escenarios nuevos de `specs/juego-tute-subastado` y la suite genérica del contrato con 3

## 2. IA

- [x] 2.1 La IA básica estima y juega con 3; la reconstrucción con la baraja y los jugadores de la partida
- [x] 2.2 Tests de la IA, partidas entre IAs y contra el azar con 3, la reconstrucción y la fuerza del difícil

## 3. Cliente

- [x] 3.1 La opción de jugadores del Tute subastado (local y sala en red) y sus textos
- [x] 3.2 La mesa, la subasta y el resumen de la mano con 3
- [x] 3.3 La guía: la variante de 3 y su opción; la Escoba a 31 en las opciones

## 4. Verificación

- [x] 4.1 E2E: una partida de 3 desde la mesa, a 360 px, y una sala en red con 3
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
