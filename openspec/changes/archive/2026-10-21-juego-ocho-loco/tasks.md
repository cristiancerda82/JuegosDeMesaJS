## 1. Ocho loco: reglas (engine)

- [x] 1.1 Definir `ConfigOchoLoco` (2–5 jugadores) con su validación, `EstadoOchoLoco`, `AccionOchoLoco` y `VistaOchoLoco`; implementar `crear` con el reparto y la carta inicial (el 8 al fondo)
- [x] 1.2 Implementar jugar (palo o número, el 8 con palo), robar (rehacer el mazo con el descarte), pasar, el cierre de la mano (sin cartas o bloqueada) con los puntos, la partida a 100, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-ocho-loco` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Ocho loco (engine)

- [x] 2.1 Implementar `iaOchoLocoBasica` (elegir carta y palo, jugar la robada) y `iaOchoLocoExperta`, que además guarda los ochos
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_OCHO_LOCO`; registrar los tres niveles en `IAS`, en la tabla de niveles y en los tests de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs de 2 a 5, contra el azar y la prueba de fuerza (la difícil gana a la normal en 200 partidas)
- [x] 2.4 Añadir el Ocho loco a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Ocho loco

- [x] 3.1 Registrar el Ocho loco en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaOchoLoco.svelte`: rivales, mazo, descarte con el palo que toca, mano con las jugables, elección de palo del 8, «Robar» y «Pasar», y los puntos
- [x] 3.3 Crear `ResumenOchoLoco.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Ocho loco?»

## 4. Verificación

- [x] 4.1 E2E: jugar una carta, jugar un 8 eligiendo palo, robar y pasar, y una partida completa contra la IA
- [x] 4.2 E2E: 5 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Ocho loco en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
