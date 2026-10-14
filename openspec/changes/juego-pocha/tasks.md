## 1. Pocha: reglas (engine)

- [x] 1.1 Definir `ConfigPocha` con valores por defecto y validación (3/4 jugadores, duración corta o completa, restricción del repartidor), `EstadoPocha`, `AccionPocha`, `ResultadoManoPocha` y `VistaPocha`, y la secuencia de manos
- [x] 1.2 Implementar `crear` y el reparto de cada mano: cartas de la secuencia, muestra o carta de triunfo del repartidor, salida del siguiente al repartidor
- [x] 1.3 Implementar la fase de apuestas (orden, rango y apuesta prohibida del repartidor) y la de juego (obligaciones, baza, ganador que sale)
- [x] 1.4 Implementar la puntuación de la mano, los totales, la siguiente mano con reparto rotatorio, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.5 Tests de todos los escenarios de `specs/juego-pocha` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Pocha (engine)

- [x] 2.1 Implementar `iaPochaBasica`: estimación de la apuesta con desvío de la prohibida, y juego para ganar mientras falten bazas o perder cuando ya se cumplió
- [x] 2.2 Tests del escenario "Ya cumplida, no gana más", de la apuesta, reproducibilidad y tiempo de decisión
- [x] 2.3 Simulación de 1.000 partidas entre IAs (3 y 4 jugadores, variantes) sin acciones ilegales y test contra el agente aleatorio

## 3. Cliente: mesa de bazas para 3 jugadores

- [x] 3.1 Ampliar `lado()` y `VistaBazas` a 3 jugadores y añadir a `MesaBazas` las props opcionales `nombre` y `detalle`, sin cambiar la Brisca, el Tute y el Guiñote

## 4. Cliente: Pocha

- [x] 4.1 Registrar la Pocha en `juegos.ts` (definición, IA y pausas), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 4.2 Añadir la Pocha al menú y sus opciones (jugadores, duración, restricción del repartidor), con todos los textos en español
- [x] 4.3 Crear `MesaPocha.svelte` sobre `MesaBazas`: botones de apuesta, apuestas y bazas por jugador, triunfo, mano N de M, avisos de las apuestas de la IA
- [x] 4.4 Mostrar el resultado de cada mano en un panel que pausa la sesión hasta «Siguiente mano», y la clasificación en la pantalla de fin
- [x] 4.5 Escribir la guía "¿Cómo se juega a la Pocha?" con un ejemplo de puntuación

## 5. Verificación

- [x] 5.1 E2E: partida completa contra la IA con 3 y con 4 jugadores (partida corta), apostando y cerrando el panel de cada mano
- [x] 5.2 E2E: la apuesta prohibida del repartidor no aparece, y la mesa en 360 × 640 sin scroll horizontal con 3 y 4 jugadores
- [x] 5.3 Añadir la Pocha al recorrido E2E de las guías y comprobar que los E2E de Brisca, Tute y Guiñote siguen pasando
- [x] 5.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
