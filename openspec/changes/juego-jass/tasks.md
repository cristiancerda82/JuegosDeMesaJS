## 1. Jass: reglas (engine)

- [x] 1.1 Definir `ConfigJass`, `EstadoJass`, `AccionJass`, `VistaJass`, la baraja de 36, los modos con sus multiplicadores, los rangos, los puntos y `crear` con el reparto
- [x] 1.2 Implementar la elección con schieben, las bazas, las declaraciones, el Stöck, la anotación al momento con el Match y la partida a 1.000, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-jass` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Jass (engine)

- [x] 2.1 Implementar `iaJassBasica`
- [x] 2.2 Implementar la reconstrucción del Jass y `SIMULABLE_JASS`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Jass a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Jass

- [x] 3.1 Registrar el Jass en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaJass.svelte`: elección del modo, modo con su multiplicador, declaraciones, Stöck y puntos de cada pareja
- [x] 3.3 `ResumenJass.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Jass?»

## 4. Verificación

- [x] 4.1 E2E: elegir el modo, pasar, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Jass en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
