## 1. Gin Rummy: reglas (engine)

- [x] 1.1 Generalizar las combinaciones del Chinchón a la baraja francesa (As bajo) y crear `colocar` con su búsqueda exacta
- [x] 1.2 Definir `ConfigGinRummy`, `EstadoGinRummy`, `AccionGinRummy`, `VistaGinRummy`, `ResultadoManoGinRummy`, `marcadorFinal` y `crear`
- [x] 1.3 Implementar la primera carta, robar, descartar, cerrar con Gin y undercut, la mano nula, la partida a 100 con bonos, `vistaDe` con las cartas cogidas y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-gin-rummy` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Gin Rummy (engine)

- [x] 2.1 Implementar `iaGinRummyBasica` (coger el descarte que sirve, soltar la carta que menos sirve, cerrar en cuanto puede)
- [x] 2.2 Implementar la reconstrucción (con las cartas cogidas del descarte) y `SIMULABLE_GIN_RUMMY`; registrar los tres niveles en `IAS`, en la tabla de niveles y en los tests de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Gin Rummy a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Gin Rummy

- [x] 3.1 Registrar el Gin Rummy en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones y textos en español
- [x] 3.2 Crear `MesaGinRummy.svelte`: el rival con sus cartas cogidas, el mazo, el descarte, la mano ordenada en combinaciones, coger o pasar la primera carta, robar, descartar y cerrar
- [x] 3.3 Crear `ResumenGinRummy.svelte` entre manos, la pantalla de fin con el marcador desglosado y la guía «¿Cómo se juega al Gin Rummy?»

## 4. Verificación

- [x] 4.1 E2E: pasar o coger la primera carta, robar, descartar, cerrar y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal con 11 cartas, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Gin Rummy en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
