## 1. La Belle Lucie: reglas (engine)

- [x] 1.1 Definir `ConfigBelleLucie`, `EstadoBelleLucie`, `AccionBelleLucie` y `VistaBelleLucie`, y `crear` con los 18 abanicos
- [x] 1.2 Implementar subir a la fundación, mover sobre otro abanico, rebarajar, la merci, deshacer, abandonar, la victoria, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-belle-lucie` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pista (engine)

- [x] 2.1 Implementar `pistaBelleLucie` en `ia/pistas.ts`, y tests de sus escenarios, de `atascado` y de partidas al azar

## 3. Cliente: La Belle Lucie

- [x] 3.1 Registrar La Belle Lucie en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaBelleLucie.svelte`: fundaciones y 18 abanicos; mover tocando, subir con dos toques, rebarajar, merci, deshacer, pista, abandonar, tiempo, movimientos y aviso de atasco
- [x] 3.3 Pantalla de fin (victoria con récords y abandono) y la guía «¿Cómo se juega a La Belle Lucie?»

## 4. Verificación

- [x] 4.1 E2E: subir a la fundación, mover sobre otro abanico, un movimiento rechazado, rebarajar, la merci, deshacer, abandonar, y ganar una partida jugando desde la UI
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
