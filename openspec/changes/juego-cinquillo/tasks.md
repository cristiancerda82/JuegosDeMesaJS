## 1. Cinquillo: reglas (engine)

- [x] 1.1 Definir `ConfigCinquillo` con valores por defecto y validación (2–4 jugadores, 1/3/5 manos), `EstadoCinquillo`, `AccionCinquillo`, `ResultadoManoCinquillo` y `VistaCinquillo`
- [x] 1.2 Implementar el reparto completo, la salida con el 5 de oros y la mesa por extremos de cada palo
- [x] 1.3 Implementar `accionesLegales` (5 de oros al empezar, abrir con 5, alargar por los extremos, pasar solo sin jugada) y la transición de jugar y pasar
- [x] 1.4 Implementar el fin de la mano con penalización, los totales, la partida a N manos con reparto rotatorio, `vistaDe` y `resultado`
- [x] 1.5 Tests de todos los escenarios de `specs/juego-cinquillo` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Cinquillo (engine)

- [x] 2.1 Implementar `iaCinquilloBasica` con la valoración de cartas propias, caminos ajenos y extremos
- [x] 2.2 Tests del escenario "Se abre camino a sí misma", reproducibilidad y tiempo de decisión
- [x] 2.3 Simulación de 1.000 partidas entre IAs (2 a 4 jugadores) sin acciones ilegales y test contra el agente aleatorio (gana claramente más de la mitad)

## 3. Cliente: registro y opciones

- [x] 3.1 Registrar el Cinquillo en `juegos.ts` (definición, IA y pausa tras cada acción de un rival), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 3.2 Añadir el Cinquillo al menú y sus opciones (jugadores y manos), con todos los textos en español

## 4. Cliente: mesa del Cinquillo

- [x] 4.1 Crear `MesaCinquillo.svelte`: rivales, filas por palo con los huecos jugables, mano propia con cartas jugables, botón «Paso» y aviso de la última acción
- [x] 4.2 Mostrar el resultado de cada mano en un panel que pausa la sesión hasta «Siguiente mano», y la clasificación en la pantalla de fin
- [x] 4.3 Escribir la guía "¿Cómo se juega al Cinquillo?" con un ejemplo de escalera

## 5. Verificación

- [x] 5.1 E2E: partida completa contra la IA con 2 y con 4 jugadores, cerrando el panel de cada mano
- [x] 5.2 E2E: jugar una carta tocando y pasar con «Paso», y la mesa en 360 × 640 sin scroll horizontal con 20 cartas en la mano
- [x] 5.3 Añadir el Cinquillo al recorrido E2E de las guías
- [x] 5.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
