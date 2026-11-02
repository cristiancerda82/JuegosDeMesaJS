## 1. Schafkopf: reglas (engine)

- [x] 1.1 Definir `ConfigSchafkopf`, `EstadoSchafkopf`, `AccionSchafkopf`, `VistaSchafkopf`, la baraja de 32, los puntos, los triunfos de cada contrato y `crear` con el reparto
- [x] 1.2 Implementar la ronda de contratos, las bazas con el palo efectivo y las reglas del As llamado, los puntos, Schneider, Schwarz, Laufende y las fichas, la partida de 12 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-schafkopf` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Schafkopf (engine)

- [x] 2.1 Implementar `iaSchafkopfBasica`
- [x] 2.2 Implementar la reconstrucción del Schafkopf y `SIMULABLE_SCHAFKOPF`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Schafkopf a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Schafkopf

- [x] 3.1 Registrar el Schafkopf en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaSchafkopf.svelte`: panel de anuncio, contrato, triunfo, As llamado, compañero, mano de las 12 y fichas
- [x] 3.3 `ResumenSchafkopf.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Schafkopf?»

## 4. Verificación

- [x] 4.1 E2E: anunciar un contrato, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también con el panel de anuncio), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Schafkopf en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
