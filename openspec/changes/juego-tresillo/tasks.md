## 1. Tresillo: reglas (engine)

- [x] 1.1 Definir `ConfigTresillo`, `EstadoTresillo`, `AccionTresillo`, `VistaTresillo`, la baraja, los matadores, el rango según el triunfo, las cartas legales con el privilegio de los matadores y `crear` con la entrada y el reparto
- [x] 1.2 Implementar la subasta, la elección del triunfo, la vuelta, el cambio, las bazas, la sacada, la puesta y el codillo, la mano en que pasan los tres, el fin a las 12 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-tresillo` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Tresillo (engine)

- [x] 2.1 Implementar `iaTresilloBasica`
- [x] 2.2 Implementar la reconstrucción del Tresillo y `SIMULABLE_TRESILLO`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Tresillo a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Tresillo

- [x] 3.1 Registrar el Tresillo en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaTresillo.svelte`: subasta, triunfo, cambio, vuelta, hombre y contrato, bote, fichas y bazas
- [x] 3.3 `ResumenTresillo.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Tresillo?»

## 4. Verificación

- [x] 4.1 E2E: pujar, elegir el triunfo y cambiar cartas, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también en la subasta y en el cambio), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Tresillo en red con dos navegadores (el otro asiento, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
