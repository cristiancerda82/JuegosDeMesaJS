## 1. Cuarenta ladrones: reglas (engine)

- [x] 1.1 Definir `ConfigCuarentaLadrones`, `EstadoCuarentaLadrones`, `AccionCuarentaLadrones` y `VistaCuarentaLadrones`, y `crear` con las 10 columnas y el mazo
- [x] 1.2 Implementar robar, mover cartas y tramos (con la capacidad por huecos) a columnas y fundaciones, deshacer, autocompletar, abandonar, la victoria, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-cuarenta-ladrones` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pista (engine)

- [x] 2.1 Implementar `pistaCuarentaLadrones` en `ia/pistas.ts`, y tests de sus escenarios, de `atascado` y de partidas al azar

## 3. Cliente: Cuarenta ladrones

- [x] 3.1 Registrar Cuarenta ladrones en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaCuarentaLadrones.svelte`: mazo, descarte, 8 fundaciones y 10 columnas; mover arrastrando o tocando, doble toque a las fundaciones, deshacer, pista, autocompletar, abandonar, tiempo, movimientos y aviso de atasco
- [x] 3.3 Pantalla de fin (victoria con récords y abandono) y la guía «¿Cómo se juega a Cuarenta ladrones?»

## 4. Verificación

- [x] 4.1 E2E: robar, mover una carta, un movimiento rechazado, mover un tramo con un hueco, doble toque a la fundación, deshacer, abandonar, y ganar una partida jugando desde la UI
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
