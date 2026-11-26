## 1. Tute gana-pierde: reglas (engine)

- [x] 1.1 Definir `ConfigTuteGanaPierde`, `EstadoTuteGanaPierde`, `AccionTuteGanaPierde`, `VistaTuteGanaPierde`, la baraja de 36, el reparto de tres en tres y las obligaciones con `cartasObligadas`
- [x] 1.2 Implementar las bazas con el nacimiento del triunfo y los cantes, los tantos, `penalizadosGanaPierde`, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-tute-gana-pierde` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Tute gana-pierde (engine)

- [x] 2.1 Implementar `iaTuteGanaPierdeBasica` con la elección del objetivo y el juego a por el mínimo o el máximo
- [x] 2.2 Hacer común la deducción de los topes (`topesPorObligaciones`) sin cambiar la de la Manilla; implementar la reconstrucción y `SIMULABLE_TUTE_GANA_PIERDE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza
- [x] 2.4 Añadir el Tute gana-pierde a `red.ts`

## 3. Cliente: Tute gana-pierde

- [x] 3.1 Registrarlo en `juegos.ts`, en `IdJuego`, en `partida.ts` y en las opciones (el límite de penalizaciones); textos en español
- [x] 3.2 Añadirlo al catálogo (familia «Bazas para evitar», 5 juegos) y su consejo al modo asistido (76 juegos con IA)
- [x] 3.3 Crear `MesaTuteGanaPierde.svelte` con los tantos, el triunfo y los cantes, `ResumenTuteGanaPierde.svelte` y la pantalla de fin
- [x] 3.4 Guía «¿Cómo se juega al Tute gana-pierde?» con sus ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: el resumen de la mano, una partida completa a 3, retomar, 360 px, la guía y la sala en red
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
