## 1. Casino: reglas (engine)

- [x] 1.1 Definir `ConfigCasino` (2–4 jugadores y parejas), `EstadoCasino`, `AccionCasino`, `VistaCasino`, `ResultadoManoCasino` y `crear` con el reparto
- [x] 1.2 Implementar recoger (por número, suma y construcciones), construir (nueva, subir y múltiple), dejar, las barridas, los nuevos repartos, el fin de la mano con la puntuación, la partida a 21, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-casino` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Casino (engine)

- [x] 2.1 Implementar `iaCasinoBasica`
- [x] 2.2 Implementar la reconstrucción del Casino y `SIMULABLE_CASINO`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs de 2 a 4, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Casino a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Casino

- [x] 3.1 Registrar el Casino en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores y parejas) y textos en español
- [x] 3.2 Crear `MesaCasino.svelte`: rivales, mesa con construcciones, mazo, mano, panel de jugadas de una carta
- [x] 3.3 Crear `ResumenCasino.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Casino?»

## 4. Verificación

- [x] 4.1 E2E: recoger, construir, no poder dejar con construcción propia, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 4 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Casino en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
