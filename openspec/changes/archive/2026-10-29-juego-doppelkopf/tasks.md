## 1. Doppelkopf: reglas (engine)

- [x] 1.1 Definir `ConfigDoppelkopf`, `EstadoDoppelkopf`, `AccionDoppelkopf`, `VistaDoppelkopf`, la baraja de 48 cartas, la fuerza de las cartas en cada tipo de juego y `crear` con el reparto
- [x] 1.2 Implementar las reservas (boda y solos), las bazas, la pareja de la boda, los anuncios con sus plazos, los puntos de la mano con los puntos especiales, la ronda de 8 manos, `vistaDe` con los bandos conocidos y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-doppelkopf` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Doppelkopf (engine)

- [x] 2.1 Implementar `iaDoppelkopfBasica`
- [x] 2.2 Implementar la reconstrucción del Doppelkopf y `SIMULABLE_DOPPELKOPF`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Doppelkopf a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Doppelkopf

- [x] 3.1 Registrar el Doppelkopf en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaDoppelkopf.svelte`: reservas, anuncios, tipo de juego, bandos conocidos, mano de la ronda y marcador
- [x] 3.3 `ResumenDoppelkopf.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Doppelkopf?»

## 4. Verificación

- [x] 4.1 E2E: reservas, jugar una baza, anunciar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Doppelkopf en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
