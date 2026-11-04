## 1. Pishti: reglas (engine)

- [x] 1.1 Definir `ConfigPishti`, `EstadoPishti`, `AccionPishti`, `VistaPishti`, los puntos de las cartas y `crear` con el montón de 3 tapadas y 1 a la vista y el reparto de 2 y de 4
- [x] 1.2 Implementar las capturas por número y con la J, el pishti, los repartos, el fin de la mano con los puntos, la partida a 151, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-pishti` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Pishti (engine)

- [x] 2.1 Implementar `iaPishtiBasica`
- [x] 2.2 Implementar la reconstrucción del Pishti y `SIMULABLE_PISHTI`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Pishti a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Pishti

- [x] 3.1 Registrar el Pishti en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones de 2 o 4 jugadores, la lista de parejas de la sala de espera y textos en español
- [x] 3.2 Crear `MesaPishti.svelte`: el montón con las tapadas y las cartas a la vista, el mazo, las recogidas, los pishtis y los puntos de cada bando
- [x] 3.3 `ResumenPishti.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Pishti?»

## 4. Verificación

- [x] 4.1 E2E: llevarse el montón, una carta que se queda arriba, el resumen de la mano y una partida completa contra la IA con 2 y con 4
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (con 2 y con 4), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Pishti en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
