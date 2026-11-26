## 1. Manilla: reglas (engine)

- [x] 1.1 Definir `ConfigManilla`, `EstadoManilla`, `AccionManilla`, `VistaManilla`, el reparto de cuatro en cuatro con el pinte y las obligaciones con `cartasObligadas`
- [x] 1.2 Implementar las bazas con sus puntos, `anotarManilla` con el pinte decisivo, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-manilla` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Manilla (engine)

- [x] 2.1 Exportar el juego de cartas de la Butifarra como `cartaEnPareja` e implementar `iaManillaBasica`
- [x] 2.2 Implementar `topesManilla`, la reconstrucción y `SIMULABLE_MANILLA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza
- [x] 2.4 Añadir la Manilla a `red.ts`

## 3. Cliente: Manilla

- [x] 3.1 Registrar la Manilla en `juegos.ts`, en `IdJuego`, en `partida.ts` y en las opciones (los puntos de la partida); textos en español
- [x] 3.2 Añadirla al catálogo (familia «Bazas por puntos», 20 juegos) y su consejo al modo asistido (75 juegos con IA)
- [x] 3.3 Crear `MesaManilla.svelte` con el pinte a la vista y `ResumenManilla.svelte`, y la pantalla de fin
- [x] 3.4 Guía «¿Cómo se juega a la Manilla?» con sus tres ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: el pinte y el resumen de la mano, una partida completa a 20, retomar, 360 px, la guía y la sala en red
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
