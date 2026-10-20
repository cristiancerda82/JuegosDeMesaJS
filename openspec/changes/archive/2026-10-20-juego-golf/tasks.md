## 1. Golf: reglas (engine)

- [x] 1.1 Definir `ConfigGolf` (con o sin vuelta) con su validación, `EstadoGolf`, `AccionGolf` y `VistaGolf`; implementar `crear` con el reparto
- [x] 1.2 Implementar mover al descarte con y sin vuelta, robar, deshacer, abandonar, la victoria al vaciar las columnas, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-golf` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pistas (engine)

- [x] 2.1 Implementar `pistaGolf` en `ia/pistas.ts` con la cadena más larga, y tests de sus escenarios, de `atascado` y de las partidas al azar

## 3. Cliente: Golf

- [x] 3.1 Registrar el Golf en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú, opciones (con vuelta) y textos en español
- [x] 3.2 Crear `MesaGolf.svelte`: columnas solapadas, mazo y descarte, mover tocando, deshacer, pista, abandonar, tiempo, movimientos y aviso de atasco
- [x] 3.3 Pantalla de fin del Golf (victoria con movimientos y tiempo, abandono) y la guía «¿Cómo se juega al Golf?»

## 4. Verificación

- [x] 4.1 E2E: mover tocando, una carta que no se mueve, robar, deshacer, abandonar, y ganar una partida jugando desde la UI con la pista
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
