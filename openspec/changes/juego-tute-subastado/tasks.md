## 1. Tute subastado: reglas (engine)

- [x] 1.1 Exportar `palosCantables` y `tieneTute` desde `tute.ts` sin cambiarlos; definir `ConfigTuteSubastado` (4/8/12 manos) con su validación, `EstadoTuteSubastado`, `AccionTuteSubastado`, `ResultadoManoTuteSubastado` y `VistaTuteSubastado`; implementar `crear` y el reparto
- [x] 1.2 Implementar la subasta (pujas legales, pases, pujador, reparto de nuevo si todos pasan) y la elección del triunfo
- [x] 1.3 Implementar las bazas con obligaciones de superar siempre, los cantes y el tute, el cierre con el cobro en fichas, la rotación y el fin de la partida; `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-tute-subastado`, de la conservación de fichas y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Tute subastado (engine)

- [x] 2.1 Añadir a `SituacionBaza` el compañero opcional sin cambiar los demás juegos; implementar `iaTuteSubastadoBasica`: estimación por palo, puja, triunfo, cantes y juego de cartas con los compañeros de bando
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs y contra el azar
- [x] 2.3 Crear `reconstruir/tute-subastado.ts` (fallos conocidos, `repartirConFallos`) y su `Simulable` (pujas por la base); registrar el juego en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 2.4 Ajustar la simulación hasta que la difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)
- [x] 2.5 Añadir el Tute subastado a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Tute subastado

- [x] 3.1 Registrar el juego en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (manos), sala de espera y textos en español
- [x] 3.2 Crear `MesaTuteSubastado.svelte`: panel de la subasta, elección del triunfo, pujador y puja, puntos frente a la puja, cantes, fichas y avisos
- [x] 3.3 Crear `ResumenTuteSubastado.svelte`, que pausa hasta «Siguiente mano», y la clasificación por fichas en la pantalla de fin
- [x] 3.4 Escribir la guía «¿Cómo se juega al Tute subastado?» con un ejemplo de subasta y cobro

## 4. Verificación

- [x] 4.1 E2E: subasta, elección del triunfo y bazas contra la IA hasta el resumen de la mano; partida completa de 4 manos
- [x] 4.2 E2E: la subasta y la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y el juego en el recorrido de las guías
- [x] 4.3 E2E: sala de Tute subastado en red con dos navegadores jugando una mano
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
