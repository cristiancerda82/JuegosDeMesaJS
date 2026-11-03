## 1. Truco: reglas (engine)

- [x] 1.1 Definir `ConfigTruco`, `EstadoTruco`, `AccionTruco`, `VistaTruco` y `crear` con el reparto, reaprovechando la jerarquía, el envido y las pardas del Truc
- [x] 1.2 Implementar el envido (cadena, querido, no querido y falta), el truco, irse al mazo, el envido que está primero, la puntuación con la partida a 30, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-truco` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Truco (engine)

- [x] 2.1 Implementar `iaTrucoBasica`
- [x] 2.2 Implementar la reconstrucción del Truco y `SIMULABLE_TRUCO`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Truco a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Truco

- [x] 3.1 Registrar el Truco en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones de 2 o 4 jugadores y textos en español
- [x] 3.2 Crear `MesaTruco.svelte`: botones de las apuestas, lo que vale la mano, el envido, los avisos y los puntos en malas y buenas
- [x] 3.3 `ResumenTruco.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Truco?»

## 4. Verificación

- [x] 4.1 E2E: cantar y responder el envido y el truco, el resumen de la mano y una partida completa contra la IA con 2 y con 4
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Truco en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
