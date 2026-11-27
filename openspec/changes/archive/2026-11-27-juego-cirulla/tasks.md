## 1. Cirulla: reglas (engine)

- [x] 1.1 Definir `ConfigCirulla`, `EstadoCirulla`, `AccionCirulla`, `VistaCirulla`, el reparto con la mesa de dos Ases repetida y la mesa inicial
- [x] 1.2 Implementar los acuses, las capturas (`capturasCirulla`), las escobas, el recuento con la grande y la pequeña, los diez oros, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-cirulla` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Cirulla (engine)

- [x] 2.1 Implementar `iaCirullaBasica` con la valoración de la Scopa, la grande, la pequeña y el riesgo del 15 y del As
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_CIRULLA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza
- [x] 2.4 Añadir la Cirulla a `red.ts`

## 3. Cliente: Cirulla

- [x] 3.1 Sacar de `MesaScopa.svelte` la mesa común `captura/MesaCaptura.svelte` sin cambiar lo que muestra
- [x] 3.2 Registrarla en `juegos.ts`, en `IdJuego`, en `partida.ts` y en las opciones (jugadores); textos en español
- [x] 3.3 Añadirla al catálogo (familia «Captura», 8 juegos) y su consejo al modo asistido (79 juegos con IA)
- [x] 3.4 Crear `MesaCirulla.svelte` con las cartas acusadas y los avisos, `ResumenCirulla.svelte` y la pantalla de fin
- [x] 3.5 Guía «¿Cómo se juega a la Cirulla?» con sus ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: una captura a 15, el resumen con la grande y la pequeña, una partida completa, retomar, 360 px, la guía, la sala en red y los de la Scopa sin cambios
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
