## 1. Póker de cinco cartas: reglas (engine)

- [x] 1.1 Definir `ConfigPokerCinco`, `EstadoPokerCinco`, `AccionPokerCinco`, `VistaPokerCinco`, `ResultadoManoPokerCinco` y `crear` con las ciegas y el reparto de cinco cartas
- [x] 1.2 Implementar las dos rondas de apuestas, el descarte (con el As enseñado y el mazo que se rehace con los descartes), el showdown con botes, la eliminación, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-poker-cinco` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Póker de cinco cartas (engine)

- [x] 2.1 Implementar `iaPokerCincoBasica` (apuestas y descarte)
- [x] 2.2 Implementar la experta con `equityPokerCinco`; registrar los tres niveles en `IAS` y en la tabla de niveles
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Póker de cinco cartas a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Póker de cinco cartas

- [x] 3.1 Registrar el juego en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego`, en `partida.ts` y en las opciones (jugadores); textos en español
- [x] 3.2 Añadirlo al catálogo del menú (familia «Envite y apuestas») y su consejo al modo asistido, subiendo a 72 la cuenta de juegos con IA y a 8 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaPokerCinco.svelte`: fichas, apuestas, botes y acciones; marcar y cambiar cartas en el descarte; lo que cambió cada uno y el As enseñado
- [x] 3.4 El resumen de la mano (el del Hold'em), la pantalla de fin, y la guía «¿Cómo se juega al Póker de cinco cartas?» con sus ejemplos comprobados

## 4. Verificación

- [x] 4.1 E2E: apostar, cambiar cartas, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también con 6 jugadores y en el descarte), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Póker de cinco cartas en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
