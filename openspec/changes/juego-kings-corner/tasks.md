## 1. Kings in the Corner: reglas (engine)

- [x] 1.1 Definir `ConfigKingsCorner`, `EstadoKingsCorner`, `AccionKingsCorner`, `VistaKingsCorner`, las pilas y `crear` con el reparto, la cruz y el robo del primer turno
- [x] 1.2 Implementar jugar, mover pilas, pasar con el robo del siguiente, el fin al quedarse sin cartas y por bloqueo con el empate, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-kings-corner` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de Kings in the Corner (engine)

- [x] 2.1 Implementar `iaKingsCornerBasica`
- [x] 2.2 Implementar la reconstrucción de Kings in the Corner y `SIMULABLE_KINGS_CORNER`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir Kings in the Corner a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Kings in the Corner

- [x] 3.1 Registrar Kings in the Corner en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opción de jugadores y textos en español
- [x] 3.2 Crear `MesaKingsCorner.svelte`: la cruz con las esquinas y el mazo, los rivales, la mano, la selección de origen y destino, pasar y los avisos
- [x] 3.3 La pantalla de fin con las cartas que quedan y la guía «¿Cómo se juega a Kings in the Corner?»

## 4. Verificación

- [x] 4.1 E2E: jugar una carta sobre una pila, poner un K en una esquina o mover una pila, pasar, y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (con 4 jugadores), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Kings in the Corner en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
