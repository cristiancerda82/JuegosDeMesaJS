## 1. Blackjack: reglas (engine)

- [x] 1.1 Definir `ConfigBlackjack` (1–4 jugadores, 5/10/20 manos) con su validación, `EstadoBlackjack`, `AccionBlackjack` y `VistaBlackjack`, los valores (blanda, blackjack) y `crear`
- [x] 1.2 Implementar la apuesta, el reparto con el blackjack de la banca, pedir, plantarse, doblar, separar (ases incluidos), el juego de la banca, la liquidación, el fin de partida, `vistaDe` con la tapada oculta y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-blackjack` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Blackjack (engine)

- [x] 2.1 Implementar `iaBlackjackBasica` (como la banca, dobla 10–11, separa ases y ochos) e `iaBlackjackExperta` (estrategia básica)
- [x] 2.2 Implementar la reconstrucción (con lo que se sabe al mirar la banca) y `SIMULABLE_BLACKJACK`; registrar los tres niveles en `IAS`, en la tabla de niveles y en los tests de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs de 1 a 4, contra el azar y la prueba de fuerza por fichas (la difícil pierde por mano claramente menos que la normal)
- [x] 2.4 Añadir el Blackjack a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Blackjack

- [x] 3.1 Registrar el Blackjack en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores y manos) y textos en español
- [x] 3.2 Crear `MesaBlackjack.svelte`: la banca, los jugadores con sus manos, apuestas y fichas, y los botones de apostar, pedir, plantarse, doblar y separar
- [x] 3.3 Crear `ResumenBlackjack.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Blackjack?»

## 4. Verificación

- [x] 4.1 E2E: apostar, pedir, plantarse, doblar, separar y una partida completa contra la IA
- [x] 4.2 E2E: 4 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Blackjack en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
