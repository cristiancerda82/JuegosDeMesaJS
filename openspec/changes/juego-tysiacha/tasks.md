## 1. Tysiącha: reglas (engine)

- [x] 1.1 Definir `ConfigTysiacha`, `EstadoTysiacha`, `AccionTysiacha`, `VistaTysiacha`, la baraja, el orden, los puntos, los matrimonios, las cartas legales y `crear` con el reparto y la apertura obligada
- [x] 1.2 Implementar la subasta, el prikup, dar cartas, fijar el contrato, las bazas con los matrimonios y el cambio de triunfo, la puntuación con el redondeo, el barril, el fin a 1000, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-tysiacha` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Tysiącha (engine)

- [x] 2.1 Implementar `iaTysiachaBasica`
- [x] 2.2 Implementar la reconstrucción del Tysiącha y `SIMULABLE_TYSIACHA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Tysiącha a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Tysiącha

- [x] 3.1 Registrar el Tysiącha en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaTysiacha.svelte`: subasta, prikup, dar cartas, fijar el contrato, triunfo y matrimonios, puntos de la mano y marcador con el barril
- [x] 3.3 `ResumenTysiacha.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Tysiącha?»

## 4. Verificación

- [x] 4.1 E2E: pujar y ganar la subasta, dar y fijar el contrato, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también en la subasta y al fijar el contrato), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Tysiącha en red con dos navegadores (el tercer asiento, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
