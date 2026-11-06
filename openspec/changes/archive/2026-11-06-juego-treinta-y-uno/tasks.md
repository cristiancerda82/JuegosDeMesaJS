## 1. Treinta y uno: reglas (engine)

- [x] 1.1 Definir `ConfigTreintaYUno`, `EstadoTreintaYUno`, `AccionTreintaYUno`, `VistaTreintaYUno`, el valor de la mano y `crear` con las vidas y el reparto
- [x] 1.2 Implementar robar y descartar, plantarse con el último turno de los demás, el máximo de vueltas, rebarajar el descarte, enseñar las manos, las vidas, la eliminación, el fin, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-treinta-y-uno` y la suite genérica del contrato con 2, 4 y 6 jugadores; exportar desde `index.ts`

## 2. IA del Treinta y uno (engine)

- [x] 2.1 Implementar `iaTreintaYUnoBasica`
- [x] 2.2 Implementar la reconstrucción del Treinta y uno y `SIMULABLE_TREINTA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Treinta y uno a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Treinta y uno

- [x] 3.1 Registrar el Treinta y uno en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; opción de jugadores; menú y textos en español
- [x] 3.2 Crear `MesaTreintaYUno.svelte`: la mano y su valor, los rivales con sus vidas y conocidas, el mazo y el descarte, robar, plantarse y descartar
- [x] 3.3 `ResumenTreintaYUno.svelte` para el resumen de la ronda y la pantalla de fin, y la guía «¿Cómo se juega al Treinta y uno?»

## 4. Verificación

- [x] 4.1 E2E: robar y descartar, plantarse, el resumen de la ronda y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal con 6 jugadores, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Treinta y uno en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
