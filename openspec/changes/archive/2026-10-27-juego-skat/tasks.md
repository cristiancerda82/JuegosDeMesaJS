## 1. Skat: reglas (engine)

- [x] 1.1 Definir `ConfigSkat`, `EstadoSkat`, `AccionSkat`, `VistaSkat`, el palo efectivo, el orden y el valor de las cartas, los valores de la subasta y `crear` con la baraja de 32 y el reparto
- [x] 1.2 Implementar la subasta en tres tramos, coger el Skat o jugar de mano, el descarte, la declaración con los anuncios, las bazas, el fin anticipado del Nulo, los matadores, el multiplicador, el valor, pasarse en la puja, la puntuación, la partida por rondas, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-skat` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Skat (engine)

- [x] 2.1 Implementar `iaSkatBasica`
- [x] 2.2 Implementar la reconstrucción del Skat y `SIMULABLE_SKAT`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Skat a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Skat

- [x] 3.1 Registrar el Skat en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opción de rondas y textos en español
- [x] 3.2 Crear `MesaSkat.svelte` sobre la mesa de bazas: subasta, coger el Skat o jugar de mano, descarte, declaración con anuncios, juego y puntos, y la mano ouvert
- [x] 3.3 Crear `ResumenSkat.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Skat?»

## 4. Verificación

- [x] 4.1 E2E: pujar y pasar, coger el Skat y descartarse, declarar un juego, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Skat en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
