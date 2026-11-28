## 1. Rams: reglas (engine)

- [x] 1.1 Definir `ConfigRams`, `EstadoRams`, `AccionRams`, `VistaRams`, `VALORES_RAMS` y el reparto con la niña y el pinte entre los que tienen fichas
- [x] 1.2 Implementar el hablar (jugar, pasar, la niña), el descarte del que reparte, las bazas con sus obligaciones, las fichas, el ramsé, la retirada, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-rams` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Rams (engine)

- [x] 2.1 Implementar `iaRamsBasica` con las bazas esperadas, el hablar, la niña, el descarte y el juego de cartas
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_RAMS`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza
- [x] 2.4 Añadir el Rams a `red.ts`

## 3. Cliente: Rams

- [x] 3.1 Registrarlo en `juegos.ts`, en `IdJuego`, en `partida.ts` y en las opciones (jugadores); textos en español
- [x] 3.2 Añadirlo al catálogo (familia «Envite y apuestas», 9 juegos) y su consejo al modo asistido (80 juegos con IA)
- [x] 3.3 Crear `MesaRams.svelte` con el pinte, las fichas, el hablar y el descarte, `ResumenRams.svelte` y la pantalla de fin
- [x] 3.4 Guía «¿Cómo se juega al Rams?» con sus ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: hablar y descartar, el resumen de la mano, una partida completa, retomar, 360 px con 6, la guía y la sala en red
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
