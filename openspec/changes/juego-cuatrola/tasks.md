## 1. Cuatrola: reglas (engine)

- [x] 1.1 Implementar el orden del Tresillo: `esMatador`, `paloCuatrola`, `rangoCuatrola`, `ganadoraCuatrola` y `jugablesCuatrola` con el privilegio de los matadores, con sus tests
- [x] 1.2 Definir `ConfigCuatrola` (4/8/12 manos) con su validación, `EstadoCuatrola`, `AccionCuatrola`, `ResultadoManoCuatrola` y `VistaCuatrola`; implementar `crear`, el reparto, la subasta con rey o solo y la elección del triunfo y la carta llamada
- [x] 1.3 Implementar las bazas, el cierre con el cobro y la bola, la rotación y el fin de la partida; `vistaDe` con el compañero oculto y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-cuatrola`, de la conservación de fichas, del compañero oculto y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Cuatrola (engine)

- [x] 2.1 Implementar `iaCuatrolaBasica`: bazas esperadas por palo, puja, triunfo y rey llamado, y juego de cartas con los compañeros conocidos
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs y contra el azar
- [x] 2.3 Crear `reconstruir/cuatrola.ts` (fallos con el privilegio, carta llamada fuera de la mano del jugador, `repartirConFallos`) y su `Simulable` (pujas por la base); registrar el juego en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 2.4 Ajustar la simulación hasta que la difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)
- [x] 2.5 Añadir la Cuatrola a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Cuatrola

- [x] 3.1 Registrar el juego en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (manos) y textos en español
- [x] 3.2 Crear `MesaCuatrola.svelte`: panel de la subasta, elección del triunfo y de la carta llamada, marcador con el jugador, la modalidad, la llamada, el compañero y las bazas por bando, fichas y avisos
- [x] 3.3 Crear `ResumenCuatrola.svelte`, que pausa hasta «Siguiente mano», y la clasificación por fichas en la pantalla de fin
- [x] 3.4 Escribir la guía «¿Cómo se juega a la Cuatrola?» con el ejemplo de los matadores y un ejemplo de cobro

## 4. Verificación

- [x] 4.1 E2E: subasta, elección del triunfo y del rey y bazas contra la IA hasta el resumen de la mano; partida completa de 4 manos
- [x] 4.2 E2E: la subasta y la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y el juego en el recorrido de las guías
- [x] 4.3 E2E: sala de Cuatrola en red con dos navegadores jugando una mano
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
