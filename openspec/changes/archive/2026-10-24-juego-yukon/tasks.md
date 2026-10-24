## 1. Yukon: reglas (engine)

- [x] 1.1 Definir `ConfigYukon` (colores o palo), `EstadoYukon`, `AccionYukon` y `VistaYukon`, y `crear` con el reparto
- [x] 1.2 Implementar mover grupos sin ordenar (rey en columna vacía), subir y bajar de las fundaciones, el volteo, deshacer, autocompletar, abandonar, la victoria, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-yukon` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pista (engine)

- [x] 2.1 Implementar `pistaYukon` en `ia/pistas.ts`, y tests de sus escenarios, de `atascado` y de partidas al azar

## 3. Cliente: Yukon

- [x] 3.1 Registrar el Yukon en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú, opciones (construcción) y textos en español
- [x] 3.2 Crear `MesaYukon.svelte`: fundaciones y 7 columnas, mover grupos arrastrando o tocando, doble toque a las fundaciones, deshacer, pista, autocompletar, abandonar, tiempo, movimientos y aviso de atasco
- [x] 3.3 Pantalla de fin del Yukon (victoria con récords y abandono) y la guía «¿Cómo se juega al Yukon?»

## 4. Verificación

- [x] 4.1 E2E: mover un grupo desordenado, un movimiento rechazado, doble toque a la fundación, deshacer, abandonar, y ganar una partida jugando desde la UI
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada, el Solitario ruso en las opciones y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
