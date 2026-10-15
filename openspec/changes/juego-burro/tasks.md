## 1. Burro: reglas (engine)

- [x] 1.1 Definir `ConfigBurro`, `EstadoBurro`, `AccionBurro`, `ResultadoManoBurro` y `VistaBurro`; implementar `crear` y el reparto por números
- [x] 1.2 Implementar el pase simultáneo con el intercambio al siguiente y la mano nula a los 50 intercambios
- [x] 1.3 Implementar plantarse, la letra del último, la mano siguiente, el fin a las 5 letras, `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-burro` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Burro (engine)

- [x] 2.1 Implementar `iaBurroBasica`: plantarse siempre que pueda y pasar una carta del número que menos tiene
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 1.000 partidas entre IAs y contra el azar, con el asiento que actúa elegido al azar

## 3. Cliente: sesión simultánea

- [x] 3.1 Añadir `simultaneo` a `DefJuego` y el modo simultáneo de la `Sesion`: temporizadores por asiento, mantenidos si la acción prevista no cambia, humano nunca bloqueado por la IA, pausar y reanudar
- [ ] 3.2 Comprobar que el resto de juegos no cambia (E2E de las partidas por turnos)

## 4. Cliente: Burro

- [x] 4.1 Registrar el Burro en `juegos.ts` (definición, IA, pausas y retrasos de la IA), en `IdJuego` y en `partida.ts`
- [x] 4.2 Añadir el Burro al menú y sus opciones (3, 4 o 5 jugadores), con todos los textos en español
- [x] 4.3 Crear `MesaBurro.svelte`: rivales en arco con su mano y sus letras, manos tumbadas al plantarse, elegir la carta a pasar, la carta recibida resaltada y el botón «¡Me planto!» siempre igual
- [x] 4.4 Mostrar el resumen de cada mano en un panel que pausa la sesión hasta «Siguiente mano», y el burro y las letras en la pantalla de fin
- [x] 4.5 Escribir la guía «¿Cómo se juega al Burro?»

## 5. Verificación

- [x] 5.1 E2E: partida completa contra la IA pasando cartas, plantándose y cerrando el panel de cada mano
- [x] 5.2 E2E: con una semilla en la que el jugador recibe 4 iguales, plantarse el primero y no llevar letra; pulsar «¡Me planto!» sin poder no cambia nada
- [x] 5.3 E2E: retomar una partida de Burro guardada, la mesa de 5 jugadores en 360 × 640 sin scroll horizontal, y el Burro en el recorrido de las guías
- [ ] 5.4 Ejecutar todos los tests (motor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
