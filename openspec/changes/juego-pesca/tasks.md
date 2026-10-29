## 1. Pesca: reglas (engine)

- [x] 1.1 Definir `ConfigPesca`, `EstadoPesca`, `AccionPesca`, `VistaPesca`, el registro de peticiones y `crear` con el reparto de 7 o 5 cartas
- [x] 1.2 Implementar pedir, dar, pescar, seguir pidiendo, los cuartetos automáticos, el robo sin cartas, saltar a quien queda fuera, el fin y el empate, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-pesca` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Pesca (engine)

- [x] 2.1 Implementar `conocimientoPesca` e `iaPescaBasica`
- [x] 2.2 Implementar la reconstrucción de la Pesca y `SIMULABLE_PESCA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir la Pesca a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Pesca

- [x] 3.1 Registrar la Pesca en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opción de jugadores y textos en español
- [x] 3.2 Crear `MesaPesca.svelte`: rivales con sus cartas y cuartetos, el mar, la mano agrupada por valores, pedir con valor y rival, y avisos
- [x] 3.3 La pantalla de fin con los cuartetos y la guía «¿Cómo se juega a la Pesca?»

## 4. Verificación

- [x] 4.1 E2E: pedir a un rival, el aviso de «¡A pescar!» o de lo que se recibe, y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (con 6 jugadores), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Pesca en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
