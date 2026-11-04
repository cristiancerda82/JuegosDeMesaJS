## 1. Cuarenta: reglas (engine)

- [x] 1.1 Definir `ConfigCuarenta`, `EstadoCuarenta`, `AccionCuarenta`, `VistaCuarenta`, la baraja, el rango, el valor, las capturas con la escalera y `crear` con el reparto de 2 y de 4
- [x] 1.2 Implementar la ronda, las capturas opcionales con la escalera, la caída, la limpia, los repartos, el fin de la mano con los cartones, la partida a 40 en cuanto se llega, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-cuarenta` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Cuarenta (engine)

- [x] 2.1 Implementar `iaCuarentaBasica`
- [x] 2.2 Implementar la reconstrucción del Cuarenta y `SIMULABLE_CUARENTA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Cuarenta a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Cuarenta

- [x] 3.1 Registrar el Cuarenta en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones de 2 o 4 jugadores, la lista de parejas de la sala de espera y textos en español
- [x] 3.2 Crear `MesaCuarenta.svelte`: mesa, mazo, elección de la captura o dejar la carta, la carta que da caída, las rondas, las recogidas y los puntos de cada bando
- [x] 3.3 `ResumenCuarenta.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Cuarenta?»

## 4. Verificación

- [x] 4.1 E2E: capturar eligiendo las cartas, dejar una carta, el resumen de la mano y una partida completa contra la IA con 2 y con 4
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (con 2 y con 4), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Cuarenta en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
