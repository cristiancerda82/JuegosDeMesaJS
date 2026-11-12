## 1. Twenty-Nine: reglas (engine)

- [x] 1.1 Definir `ConfigTwentyNine`, `EstadoTwentyNine`, `AccionTwentyNine`, `VistaTwentyNine`, la baraja de 32, el orden, los puntos, la ganadora y `crear` con el primer reparto
- [x] 1.2 Implementar la subasta (y la mano pasada), el triunfo oculto o sin triunfo, doblar y redoblar, el segundo reparto, las bazas con pedir el triunfo, la pareja, la puntuación, el fin a ±6 o a las 40 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-twenty-nine` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Twenty-Nine (engine)

- [x] 2.1 Implementar `iaTwentyNineBasica`
- [x] 2.2 Implementar la reconstrucción del Twenty-Nine (con el triunfo oculto) y `SIMULABLE_TWENTY_NINE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Twenty-Nine a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Twenty-Nine

- [x] 3.1 Registrar el Twenty-Nine en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; textos en español
- [x] 3.2 Añadirlo al catálogo del menú (familia «Bazas con contrato o subasta») y su consejo al modo asistido, subiendo a 68 la cuenta de juegos con IA y a 15 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaTwentyNine.svelte`: subasta, triunfo, doblar y redoblar, pedir el triunfo, la pareja, la puja, el triunfo y los marcadores
- [x] 3.4 `ResumenTwentyNine.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Twenty-Nine?»

## 4. Verificación

- [x] 4.1 E2E: pujar y elegir el triunfo (oculto para los demás), el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también en la subasta), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Twenty-Nine en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
