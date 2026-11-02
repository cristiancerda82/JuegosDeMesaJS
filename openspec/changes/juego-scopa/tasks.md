## 1. Scopa: reglas (engine)

- [x] 1.1 Definir `ConfigScopa`, `EstadoScopa`, `AccionScopa`, `VistaScopa`, las capturas, la primiera y `crear` con el reparto de 2 y de 4
- [x] 1.2 Implementar la captura obligatoria por valor igual o por suma, las scopas (sin la última jugada), el fin de la mano, los puntos, la partida a 11, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-scopa` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Scopa (engine)

- [x] 2.1 Implementar `iaScopaBasica`
- [x] 2.2 Implementar la reconstrucción de la Scopa y `SIMULABLE_SCOPA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir la Scopa a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Scopa

- [x] 3.1 Registrar la Scopa en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones de 2 o 4 jugadores y textos en español
- [x] 3.2 Crear `MesaScopa.svelte`: mesa, mazo, elección de la captura, recogidas, scopas y puntos de cada bando
- [x] 3.3 `ResumenScopa.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega a la Scopa?»

## 4. Verificación

- [x] 4.1 E2E: capturar eligiendo las cartas, una scopa o el resumen de la mano, y una partida completa contra la IA con 2 y con 4
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (con 2 y con 4), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Scopa en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
