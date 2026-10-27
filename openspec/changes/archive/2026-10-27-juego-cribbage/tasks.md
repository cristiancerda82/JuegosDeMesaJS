## 1. Cribbage: reglas (engine)

- [x] 1.1 Definir `ConfigCribbage`, `EstadoCribbage`, `AccionCribbage`, `VistaCribbage`, los valores de las cartas, `puntosRecuento`, `puntosJugada` y `crear` con el reparto
- [x] 1.2 Implementar echar al crib, el corte con la J, el juego de las cartas con sus puntos y el go, el recuento en orden, el fin a 121 en cualquier momento, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-cribbage` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Cribbage (engine)

- [x] 2.1 Implementar `iaCribbageBasica`
- [x] 2.2 Implementar la reconstrucción del Cribbage y `SIMULABLE_CRIBBAGE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Cribbage a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Cribbage

- [x] 3.1 Registrar el Cribbage en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaCribbage.svelte`: tablero a 121, rival, starter, crib, cuenta y cartas jugadas, aviso de puntos, mano, «Al crib» y «Go»
- [x] 3.3 Crear `ResumenCribbage.svelte` con los tres recuentos desglosados, la pantalla de fin y la guía «¿Cómo se juega al Cribbage?»

## 4. Verificación

- [x] 4.1 E2E: echar al crib, jugar una carta con su aviso de puntos, decir go, el recuento de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Cribbage en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
