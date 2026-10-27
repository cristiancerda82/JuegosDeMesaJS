## 1. Big Two: reglas (engine)

- [x] 1.1 Definir `ConfigBigTwo`, `EstadoBigTwo`, `AccionBigTwo`, `VistaBigTwo`, el orden de las cartas, la clasificación de jugadas y `crear` con el reparto y la salida del 3♦
- [x] 1.2 Implementar la enumeración de jugadas legales (salida con el 3♦, superar con el mismo tamaño), pasar, el fin de la ronda, el fin de la mano con los puntos, la partida a 50, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-big-two` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Big Two (engine)

- [x] 2.1 Implementar `iaBigTwoBasica`
- [x] 2.2 Implementar la reconstrucción del Big Two y `SIMULABLE_BIG_TWO` con sus candidatas; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Big Two a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Big Two

- [x] 3.1 Registrar el Big Two en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaBigTwo.svelte`: rivales, última jugada con su tipo, mano ordenada, marcar cartas y los botones «Jugar» y «Paso»
- [x] 3.3 Crear `ResumenBigTwo.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Big Two?»

## 4. Verificación

- [x] 4.1 E2E: salir con el 3♦, superar una jugada, pasar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Big Two en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
