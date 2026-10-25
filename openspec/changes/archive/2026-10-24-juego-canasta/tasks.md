## 1. Canasta: reglas (engine)

- [x] 1.1 Definir `ConfigCanasta`, `EstadoCanasta`, `AccionCanasta`, `VistaCanasta`, `ResultadoManoCanasta`, los valores de las cartas, el orden de la mano y `crear` con el reparto, los treses rojos y el pozo inicial
- [x] 1.2 Implementar el turno: robar (con los treses rojos), llevarse el pozo (tapado, congelado, para la primera bajada), bajar, añadir, deshacer, descartar y acabar, con las firmas canónicas
- [x] 1.3 Implementar la primera bajada con su mínimo, el cierre con canasta, el fin por mazo vacío, la puntuación, el reparto de la mano siguiente, el fin a 5.000, `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-canasta` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Canasta (engine)

- [x] 2.1 Implementar `iaCanastaBasica` (pozo, primera bajada con plan, bajar y añadir, comodines para canasta, cerrar, descartar)
- [x] 2.2 Implementar la reconstrucción de la Canasta y `SIMULABLE_CANASTA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir la Canasta a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Canasta

- [x] 3.1 Registrar la Canasta en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones y textos en español
- [x] 3.2 Crear `MesaCanasta.svelte`: jugadores, combinaciones por pareja con canastas, treses rojos, pozo y mazo, mínimo de la primera bajada, mano con selección y botones
- [x] 3.3 Crear `ResumenCanasta.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega a la Canasta?»

## 4. Verificación

- [x] 4.1 E2E: robar y descartar, la primera bajada con deshacer, llevarse el pozo, añadir a una combinación, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Canasta en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
