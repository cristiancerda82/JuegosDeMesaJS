## 1. Schnapsen: reglas (engine)

- [x] 1.1 Definir `ConfigSchnapsen`, `EstadoSchnapsen`, `AccionSchnapsen`, `VistaSchnapsen`, el orden y el valor de las cartas, y `crear` con la baraja de 20 y el reparto
- [x] 1.2 Implementar las bazas con el mazo abierto y el robo, cambiar la J, los cantes con los pendientes, cerrar el mazo y las reglas estrictas, el fin de la mano a 66, los puntos de partida, la partida a 7, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-schnapsen` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Schnapsen (engine)

- [x] 2.1 Implementar `iaSchnapsenBasica`
- [x] 2.2 Implementar la reconstrucción del Schnapsen y `SIMULABLE_SCHNAPSEN`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Schnapsen a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Schnapsen

- [x] 3.1 Registrar el Schnapsen en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaSchnapsen.svelte` sobre la mesa de bazas: mazo y carta vuelta, triunfo, puntos de la mano y de partida, botones para cambiar la J, cantar y cerrar, y avisos
- [x] 3.3 Crear `ResumenSchnapsen.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Schnapsen?»

## 4. Verificación

- [x] 4.1 E2E: jugar una baza y robar, cantar, cambiar la J, cerrar el mazo, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Schnapsen en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
