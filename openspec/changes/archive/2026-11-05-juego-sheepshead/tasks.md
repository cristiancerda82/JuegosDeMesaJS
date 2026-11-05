## 1. Sheepshead: reglas (engine)

- [x] 1.1 Definir `ConfigSheepshead`, `EstadoSheepshead`, `AccionSheepshead`, `VistaSheepshead`, la baraja, los triunfos, el orden, los puntos, las cartas legales y `crear` con el reparto
- [x] 1.2 Implementar coger o pasar, enterrar, el compañero con la J de diamantes, las bazas, la puntuación con picker y del leaster, el fin a 10 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-sheepshead` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Sheepshead (engine)

- [x] 2.1 Implementar `iaSheepsheadBasica`
- [x] 2.2 Implementar la reconstrucción del Sheepshead y `SIMULABLE_SHEEPSHEAD`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Sheepshead a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Sheepshead

- [x] 3.1 Registrar el Sheepshead en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaSheepshead.svelte`: coger o pasar, enterrar, blind, picker, compañero o solo, leaster, puntos y marcador
- [x] 3.3 `ResumenSheepshead.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Sheepshead?»

## 4. Verificación

- [x] 4.1 E2E: coger y enterrar, un leaster, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también al coger), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Sheepshead en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
