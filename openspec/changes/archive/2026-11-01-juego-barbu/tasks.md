## 1. Barbu: reglas (engine)

- [x] 1.1 Definir `ConfigBarbu`, `EstadoBarbu`, `AccionBarbu`, `VistaBarbu`, los contratos y `crear` con el reparto
- [x] 1.2 Implementar la elección del contrato y del triunfo, las bazas con las restricciones de cada contrato, su puntuación y el fin anticipado, el dominó, la partida a 7 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-barbu` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Barbu (engine)

- [x] 2.1 Implementar `iaBarbuBasica`
- [x] 2.2 Implementar la reconstrucción del Barbu y `SIMULABLE_BARBU`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Barbu a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Barbu

- [x] 3.1 Registrar el Barbu en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaBarbu.svelte` (contrato, triunfo y bazas) y `DominoBarbu.svelte` (filas, pasar y quién ha acabado)
- [x] 3.3 `ResumenBarbu.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Barbu?»

## 4. Verificación

- [x] 4.1 E2E: elegir un contrato de bazas, el triunfo, jugar una baza, el dominó, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Barbu en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
