## 1. Belote: reglas (engine)

- [x] 1.1 Definir `ConfigBelote`, `EstadoBelote`, `AccionBelote`, `VistaBelote`, el orden y el valor de las cartas, y `crear` con la baraja de 32 y el reparto
- [x] 1.2 Implementar las dos vueltas para elegir el triunfo, el reparto del resto, la mano anulada, las bazas (seguir, montar y fallar), el belote-rebelote, los puntos con dentro y capot, la partida a 501, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-belote` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Belote (engine)

- [x] 2.1 Implementar `iaBeloteBasica`
- [x] 2.2 Implementar la reconstrucción del Belote y `SIMULABLE_BELOTE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Belote a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Belote

- [x] 3.1 Registrar el Belote en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaBelote.svelte` sobre la mesa de bazas: carta vuelta, botones para tomar, nombrar y pasar, triunfo, puntos de las bazas, aviso de belote y rebelote, y puntos de la partida
- [x] 3.3 Crear `ResumenBelote.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Belote?»

## 4. Verificación

- [x] 4.1 E2E: tomar el triunfo, nombrar en la segunda vuelta, jugar una baza con las cartas permitidas, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Belote en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
