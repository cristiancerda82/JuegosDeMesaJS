## 1. Scorpion: reglas (engine)

- [x] 1.1 Definir `ConfigScorpion`, `EstadoScorpion`, `AccionScorpion` y `VistaScorpion`, y `crear` con las 7 columnas y la reserva
- [x] 1.2 Implementar mover (con las cartas de encima y la K en los huecos), descubrir las tapadas, repartir la reserva, deshacer, abandonar, la victoria, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-scorpion` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pista (engine)

- [x] 2.1 Implementar `pistaScorpion` en `ia/pistas.ts`, y tests de sus escenarios, de `atascado` y de partidas al azar

## 3. Cliente: Scorpion

- [x] 3.1 Registrar el Scorpion en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaScorpion.svelte`: 7 columnas y la reserva; mover arrastrando o tocando, repartir, deshacer, pista, abandonar, tiempo, movimientos y aviso de atasco
- [x] 3.3 Pantalla de fin (victoria con récords y abandono) y la guía «¿Cómo se juega al Scorpion?»

## 4. Verificación

- [x] 4.1 E2E: mover una carta con las de encima, un movimiento rechazado, la K a una columna vacía, repartir la reserva, deshacer, abandonar, y ganar una partida jugando desde la UI
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
