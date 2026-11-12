## 1. Hand and Foot: reglas (engine)

- [x] 1.1 Definir `ConfigHandAndFoot`, `EstadoHandAndFoot`, `AccionHandAndFoot`, `VistaHandAndFoot`, las 270 cartas, las combinaciones y libros, y `crear` con el reparto de mano y pie
- [x] 1.2 Implementar el robo de 2, coger el descarte, los treses rojos, bajar y añadir (con libros y combinaciones de comodines), la primera bajada con mínimo y deshacer, el pie, cerrar, la puntuación, las 4 rondas, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-hand-and-foot` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Hand and Foot (engine)

- [x] 2.1 Implementar `iaHandAndFootBasica`
- [x] 2.2 Implementar la reconstrucción del Hand and Foot y `SIMULABLE_HAND_AND_FOOT`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Hand and Foot a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Hand and Foot

- [x] 3.1 Registrar el Hand and Foot en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; textos en español
- [x] 3.2 Añadirlo al catálogo del menú (familia «Combinaciones») y su consejo al modo asistido, subiendo a 70 la cuenta de juegos con IA y a 9 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaHandAndFoot.svelte`: mano y pie, robo, descarte, bajar y añadir, deshacer, libros y lo que falta para cerrar, mínimo de la ronda y puntos
- [x] 3.4 `ResumenHandAndFoot.svelte` para el resumen de la ronda y la pantalla de fin, y la guía «¿Cómo se juega al Hand and Foot?»

## 4. Verificación

- [x] 4.1 E2E: robar, bajar la primera vez, coger el pie, el resumen de la ronda y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Hand and Foot en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
