## 1. Préférence: reglas (engine)

- [x] 1.1 Definir `ConfigPreference`, `EstadoPreference`, `AccionPreference`, `VistaPreference`, la baraja, el orden y el valor de las pujas y `crear` con el reparto
- [x] 1.2 Implementar la subasta con miseria, la viuda, el descarte, el contrato, el whist, las bazas con obligación de fallar, la raspasy, la cuenta de la mano, la partida con el cierre de cuentas, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-preference` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Préférence (engine)

- [x] 2.1 Implementar `iaPreferenceBasica`
- [x] 2.2 Implementar la reconstrucción del Préférence y `SIMULABLE_PREFERENCE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Préférence a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Préférence

- [x] 3.1 Registrar el Préférence en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaPreference.svelte`: subasta, viuda, descarte, contrato, whist, triunfo y la cuenta de cada jugador
- [x] 3.3 `ResumenPreference.svelte` para el resumen de la mano y el cierre de cuentas de la pantalla de fin, y la guía «¿Cómo se juega al Préférence?»

## 4. Verificación

- [x] 4.1 E2E: pujar, descartar, declarar, el whist, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también con el panel de la subasta), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Préférence en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
