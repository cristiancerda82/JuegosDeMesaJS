## 1. Remigio: reglas (engine)

- [x] 1.1 Crear `remigio-combinaciones.ts`: cartas con copia, posición en la escalera, puntos, `Combinacion`, y la generación de `bajar`, `anadir` y `cambiar` con su aplicación
- [x] 1.2 Crear `remigio-plan.ts` con `planesParaBajar` (combinación nueva o añadir a cualquier combinación de la mesa)
- [x] 1.3 Definir `ConfigRemigio` (2–5 jugadores), `EstadoRemigio`, `AccionRemigio`, `ResultadoManoRemigio` y `VistaRemigio`; implementar `crear`, el reparto, robar (con el mazo rehecho del montón), bajar, añadir, cambiar y descartar
- [x] 1.4 Implementar el cierre, el remigio, la puntuación, la eliminación a 100, la mano siguiente y el fin de partida; `vistaDe` y `resultado`
- [x] 1.5 Tests de todos los escenarios de `specs/juego-remigio`, de las jugadas y de los planes, y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Remigio (engine)

- [x] 2.1 Implementar `iaRemigioBasica`: robar del montón si sirve, bajar con planes (o esperar el remigio, acotado), añadir, cambiar comodines y descartar la menos útil
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs de 2 a 5 y contra el azar
- [x] 2.3 Crear `reconstruir/remigio.ts` y su `Simulable` (robar y descartar, con horizonte); registrar el Remigio en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 2.4 Ajustar la simulación hasta que el difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)
- [x] 2.5 Añadir el Remigio a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Remigio

- [x] 3.1 Registrar el Remigio en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaRemigio.svelte`: mazo y montón, rivales, combinaciones de todos, mano en dos filas con orden, «Bajar», añadir, cambiar comodín, elegir el puesto del comodín y descartar
- [x] 3.3 Crear `ResumenRemigio.svelte`, que pausa hasta «Siguiente mano», y la clasificación en la pantalla de fin
- [x] 3.4 Escribir la guía «¿Cómo se juega al Remigio?» con ejemplos de escalera, grupo y comodín

## 4. Verificación

- [x] 4.1 E2E: partida de 2 jugadores robando, bajando una combinación, añadiendo y descartando hasta el resumen de la mano; botón «Bajar» desactivado con una elección que no combina
- [x] 4.2 E2E: partida de 4, retomar una partida guardada, mesa en 360 × 640 sin scroll horizontal y el Remigio en el recorrido de las guías
- [x] 4.3 E2E: sala de Remigio en red con dos navegadores jugando unos turnos
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
