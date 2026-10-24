## 1. Canfield: reglas (engine)

- [x] 1.1 Definir `ConfigCanfield` (robo de 1 o 3), `EstadoCanfield`, `AccionCanfield` y `VistaCanfield`, y `crear` con la reserva, la base y las columnas
- [x] 1.2 Implementar robar y reciclar, apilar con base y vuelta, mover desde el descarte, la reserva, las columnas y las fundaciones, el llenado de huecos con la reserva, deshacer (con el relleno), autocompletar, abandonar, la victoria, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-canfield` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pista (engine)

- [x] 2.1 Implementar `pistaCanfield` en `ia/pistas.ts`, y tests de sus escenarios, de `atascado` y de partidas al azar

## 3. Cliente: Canfield

- [x] 3.1 Registrar el Canfield en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú, opciones (robo) y textos en español
- [x] 3.2 Crear `MesaCanfield.svelte`: mazo, descarte, fundaciones con la base, reserva y 4 columnas; mover arrastrando o tocando, doble toque a las fundaciones, deshacer, pista, autocompletar, abandonar, tiempo, movimientos y aviso de atasco
- [x] 3.3 Pantalla de fin del Canfield (victoria con récords y abandono) y la guía «¿Cómo se juega al Canfield?»

## 4. Verificación

- [x] 4.1 E2E: jugar la reserva y ver la siguiente, el hueco llenado con la reserva, robar, un movimiento rechazado, doble toque a la fundación, deshacer, abandonar, y ganar una partida jugando desde la UI
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada, el robo de 1 en las opciones y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
