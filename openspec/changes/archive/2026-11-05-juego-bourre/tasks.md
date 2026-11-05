## 1. Bourré: reglas (engine)

- [x] 1.1 Definir `ConfigBourre`, `EstadoBourre`, `AccionBourre`, `VistaBourre`, la baraja, el orden, las cartas legales con sus obligaciones y `crear` con la entrada, el reparto y la vuelta
- [x] 1.2 Implementar jugar o pasar, el cambio, las bazas, el bote con el bourré y el empate, la eliminación, el fin a las 15 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-bourre` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Bourré (engine)

- [x] 2.1 Implementar `iaBourreBasica`
- [x] 2.2 Implementar la reconstrucción del Bourré y `SIMULABLE_BOURRE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Bourré a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Bourré

- [x] 3.1 Registrar el Bourré en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaBourre.svelte`: jugar o pasar, cambio, vuelta y triunfo, bote, fichas y bazas
- [x] 3.3 `ResumenBourre.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Bourré?»

## 4. Verificación

- [x] 4.1 E2E: jugar y cambiar cartas, pasar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también al decidir y en el cambio), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Bourré en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
