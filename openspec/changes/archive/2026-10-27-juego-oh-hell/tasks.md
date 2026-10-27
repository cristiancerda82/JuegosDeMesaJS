## 1. Oh Hell: reglas (engine)

- [x] 1.1 Definir `ConfigOhHell`, `EstadoOhHell`, `AccionOhHell`, `VistaOhHell`, la secuencia de manos, el orden de las cartas y `crear` con la baraja de 52, el reparto y la carta del triunfo
- [x] 1.2 Implementar las apuestas con la restricción del repartidor, las bazas, los puntos, el paso a la siguiente mano, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-oh-hell` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Oh Hell (engine)

- [x] 2.1 Implementar `iaOhHellBasica`
- [x] 2.2 Implementar la reconstrucción del Oh Hell y `SIMULABLE_OH_HELL`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Oh Hell a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Oh Hell

- [x] 3.1 Registrar el Oh Hell en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opción de jugadores y textos en español
- [x] 3.2 Crear `MesaOhHell.svelte` sobre la mesa de bazas: carta del triunfo, apuestas con la prohibida, apuesta, bazas y puntos de cada uno
- [x] 3.3 Crear `ResumenOhHell.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Oh Hell?»

## 4. Verificación

- [x] 4.1 E2E: apostar, la apuesta prohibida del repartidor, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (con 7 jugadores), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Oh Hell en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
