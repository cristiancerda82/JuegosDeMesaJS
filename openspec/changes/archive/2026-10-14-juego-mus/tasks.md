## 1. Mus: jugadas (engine)

- [x] 1.1 Implementar `juegos/mus-jugadas.ts`: rango y valor de juego con ocho o cuatro reyes, pares, puntos y escala del juego, comparación por lance, ganador con empates a favor de la mano y piedras de cada jugada
- [x] 1.2 Tests de las jugadas: escenarios de Grande, Chica, Pares, Juego, Punto, ocho reyes y empates

## 2. Mus: reglas (engine)

- [x] 2.1 Definir `ConfigMus` con valores por defecto y validación, `EstadoMus`, `AccionMus`, `ResultadoManoMus` y `VistaMus`; implementar `crear` y el reparto
- [x] 2.2 Implementar la fase de mus y descartes, con el rebarajado de los descartes cuando se acaba el mazo
- [x] 2.3 Implementar las declaraciones de Pares y Juego, los lances sin apuesta y el Punto
- [x] 2.4 Implementar las apuestas de un lance: paso, envite, subida, quiero, no quiero (con el compañero) y órdago
- [x] 2.5 Implementar el conteo con parada al llegar a los puntos, el fin del juego, la partida al mejor de N, la mano siguiente, `vistaDe` y `resultado`
- [x] 2.6 Tests de todos los escenarios de `specs/juego-mus` y la suite genérica del contrato; exportar desde `index.ts`

## 3. IA del Mus (engine)

- [x] 3.1 Implementar `iaMusBasica`: fuerza por lance, corte del mus, descarte, envites, respuestas y órdagos
- [x] 3.2 Tests de los escenarios de la IA (corta con 31, no quiere con jugada floja), reproducibilidad y tiempo de decisión
- [x] 3.3 Simulación de 1.000 partidas entre IAs sin acciones ilegales y test contra una pareja al azar

## 4. Cliente: Mus

- [x] 4.1 Registrar el Mus en `juegos.ts` (definición, IA y pausas), en `IdJuego` y en `partida.ts`
- [x] 4.2 Añadir el Mus al menú y sus opciones (reyes, puntos, juegos), con todos los textos en español
- [x] 4.3 Crear `MesaMus.svelte`: asientos con lo último dicho, marcador, lista de lances, envite pendiente, botones de mus y de apuesta, y descarte con selección de cartas
- [x] 4.4 Mostrar el conteo de cada mano en un panel con las cartas de todos que pausa la sesión hasta «Siguiente mano», y los juegos en la pantalla de fin
- [x] 4.5 Escribir la guía "¿Cómo se juega al Mus?" con ejemplos de jugadas

## 5. Verificación

- [x] 5.1 E2E: partida completa contra la IA (a 1 juego de 30), pidiendo y cortando el mus, descartando, apostando y cerrando el panel de cada mano
- [x] 5.2 E2E: descartar dos cartas, contestar un envite (sin botón de pasar) y la mesa en 360 × 640 sin scroll horizontal
- [x] 5.3 Añadir el Mus al recorrido E2E de las guías
- [x] 5.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
