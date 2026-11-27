## 1. Cuarenta y tres: reglas (engine)

- [x] 1.1 Definir `ConfigCuarentaYTres`, `EstadoCuarentaYTres`, `AccionCuarentaYTres`, `VistaCuarentaYTres`, el reparto de una en una con la muestra y las obligaciones con `cartasObligadas`
- [x] 1.2 Implementar el cambio de la muestra, las bazas, los tantos con las 9 de últimas, la liquidación, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-cuarenta-y-tres` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Cuarenta y tres (engine)

- [x] 2.1 Implementar `iaCuarentaYTresBasica` con el cambio de la muestra, el arrastre y la heurística de bazas
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_CUARENTA_Y_TRES`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza
- [x] 2.4 Añadir el Cuarenta y tres a `red.ts`

## 3. Cliente: Cuarenta y tres

- [x] 3.1 Registrarlo en `juegos.ts`, en `IdJuego`, en `partida.ts` y en las opciones (el número de manos); textos en español
- [x] 3.2 Añadirlo al catálogo (familia «Bazas por puntos», 21 juegos) y su consejo al modo asistido (77 juegos con IA)
- [x] 3.3 Crear `MesaCuarentaYTres.svelte` con la muestra y su cambio, los tantos y los saldos, `ResumenCuarentaYTres.svelte` y la pantalla de fin
- [x] 3.4 Guía «¿Cómo se juega al Cuarenta y tres?» con sus ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: el cambio de la muestra, el resumen de la mano, una partida completa a 3, retomar, 360 px, la guía y la sala en red
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
