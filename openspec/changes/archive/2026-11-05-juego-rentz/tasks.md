## 1. Rentz: reglas (engine)

- [x] 1.1 Definir `ConfigRentz`, `EstadoRentz`, `AccionRentz`, `VistaRentz`, la baraja, el orden, los contratos, las penalizaciones, las cartas legales, el dominó y `crear` con el reparto
- [x] 1.2 Implementar la elección del contrato por jugador, las bazas con sus puntos y el fin anticipado, el dominó, el fin a las 28 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-rentz` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Rentz (engine)

- [x] 2.1 Implementar `iaRentzBasica`
- [x] 2.2 Implementar la reconstrucción del Rentz y `SIMULABLE_RENTZ`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Rentz a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Rentz

- [x] 3.1 Registrar el Rentz en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaRentz.svelte`: elegir contrato, contrato de la mano, filas del dominó, pasar, puntos y marcador
- [x] 3.3 `ResumenRentz.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Rentz?»

## 4. Verificación

- [x] 4.1 E2E: elegir un contrato y jugar una baza, el dominó con pasar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también al elegir contrato), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Rentz en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
