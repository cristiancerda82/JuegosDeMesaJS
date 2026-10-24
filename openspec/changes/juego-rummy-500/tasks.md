## 1. Rummy 500: reglas (engine)

- [x] 1.1 Crear `rummy-500-combinaciones.ts`: puntos en mesa y en mano, bajadas posibles (As alto o bajo, sin vuelta), añadidos posibles y la mejor bajada por búsqueda exacta; tests
- [x] 1.2 Definir `ConfigRummy500`, `EstadoRummy500`, `AccionRummy500`, `VistaRummy500`, `ResultadoManoRummy500` y `crear` con el reparto (13 o 7 cartas)
- [x] 1.3 Implementar robar del mazo y del descarte (con la obligada y la carta que no se puede soltar), bajar, añadir, descartar dejando siempre una carta, el fin de la mano (cierre o mazo agotado), la puntuación, la partida a 500 con empate, `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-rummy-500` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Rummy 500 (engine)

- [x] 2.1 Implementar `iaRummy500Basica` (coger del descarte si compensa, bajar y añadir todo, soltar lo que menos sirve)
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_RUMMY_500`; registrar los tres niveles en `IAS`, en la tabla de niveles y en los tests de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs de 2 a 4, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Rummy 500 a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Rummy 500

- [x] 3.1 Registrar el Rummy 500 en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaRummy500.svelte`: descarte abierto en abanico, coger desde una carta, la obligada, combinaciones con quién puso cada carta, bajar, añadir y descartar
- [x] 3.3 Crear `ResumenRummy500.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Rummy 500?»

## 4. Verificación

- [x] 4.1 E2E: robar del mazo, coger varias del descarte y usar la obligada, bajar, añadir a una combinación ajena, descartar y una partida completa contra la IA
- [x] 4.2 E2E: 4 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Rummy 500 en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
