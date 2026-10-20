## 1. Julepe: reglas (engine)

- [x] 1.1 Definir `ConfigJulepe` (3–6 jugadores, 6/12/20 manos) con su validación, `EstadoJulepe`, `AccionJulepe`, `ResultadoManoJulepe` y `VistaJulepe`; implementar `crear`, la puesta y el reparto con la carta de triunfo a la vista
- [x] 1.2 Implementar jugar o pasar (repartidor obligado, nadie juega) y el descarte con robo del mazo
- [x] 1.3 Implementar las bazas entre los que juegan, el cobro, el julepe, la eliminación, la rotación saltando eliminados y el fin de partida; `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-julepe`, de la conservación de fichas y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Julepe (engine)

- [x] 2.1 Implementar `iaJulepeBasica`: bazas esperadas para jugar o pasar, descarte y juego de cartas
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs de 3 a 6 y contra el azar
- [x] 2.3 Crear `reconstruir/julepe.ts` (carta de triunfo a la vista, fallos conocidos, mazo y descartes ocultos) y su `Simulable` (descartes por la base); registrar el Julepe en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 2.4 Ajustar la simulación hasta que el difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)
- [x] 2.5 Añadir el Julepe a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: mesa de bazas de 5 y 6

- [x] 3.1 Ampliar `lado()`, `nombreAsiento`, `MesaBazas`, `AsientoRival` y `Tapete` a 5 y 6 jugadores con los rivales de arriba en fila, sin cambiar 2 a 4

## 4. Cliente: Julepe

- [x] 4.1 Registrar el Julepe en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores, manos) y textos en español
- [x] 4.2 Crear `MesaJulepe.svelte`: jugar o pasar, marcar y cambiar cartas, carta de triunfo, bote, fichas, quién juega y avisos
- [x] 4.3 Crear `ResumenJulepe.svelte`, que pausa hasta «Siguiente mano», y la clasificación por fichas en la pantalla de fin
- [x] 4.4 Escribir la guía «¿Cómo se juega al Julepe?» con un ejemplo de cobro y julepe

## 5. Verificación

- [x] 5.1 E2E: partida de 4 contra la IA jugando, pasando y descartando hasta el resumen de la mano; partida completa de 6 manos
- [x] 5.2 E2E: 6 jugadores en 360 × 640 sin scroll horizontal, 5 jugadores, retomar una partida guardada y el Julepe en el recorrido de las guías
- [x] 5.3 E2E: sala de Julepe en red con dos navegadores jugando una mano
- [x] 5.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
