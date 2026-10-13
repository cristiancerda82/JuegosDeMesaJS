## 1. FreeCell: reglas (engine)

- [x] 1.1 Definir `ConfigFreeCell` con valores por defecto y validación (partida 1–32.000 o `null`, celdas 1–4, movimiento automático), `EstadoFreeCell`, `AccionFreeCell` y `VistaFreeCell`
- [x] 1.2 Implementar el reparto de Microsoft y el número de partida derivado de la semilla, con el test de la partida 1
- [x] 1.3 Implementar `accionesLegales`: celdas, fundaciones, columnas, secuencias con el límite del supermovimiento, un solo destino vacío equivalente, deshacer, autocompletar y abandonar
- [x] 1.4 Implementar la transición de `mover` con el movimiento automático seguro y el historial de instantáneas, `deshacer`, `autocompletar` y `abandonar`
- [x] 1.5 Implementar `vistaDe` y `resultado` (victoria y abandono)
- [x] 1.6 Tests de todos los escenarios de `specs/juego-freecell` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Cliente: registro y opciones

- [x] 2.1 Registrar el FreeCell en `juegos.ts` (sin IA), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 2.2 Añadir el FreeCell al menú y sus opciones (al azar o por número, celdas, movimiento automático), con todos los textos en español

## 3. Cliente: mesa del FreeCell

- [x] 3.1 Crear `MesaFreeCell.svelte`: celdas, fundaciones y columnas con solape adaptable, barra con número de partida, movimientos, tiempo, máximo de cartas movibles y botones
- [x] 3.2 Implementar la interacción: arrastrar y tocar cartas y secuencias, destinos resaltados y doble toque a la fundación o a una celda
- [x] 3.3 Mostrar en la pantalla de fin el número de partida, los movimientos y el tiempo
- [x] 3.4 Escribir la guía "¿Cómo se juega al FreeCell?" con ejemplos de cartas para las columnas y el supermovimiento

## 4. Verificación

- [x] 4.1 Escribir el resolvedor de pruebas `e2e/freecell-solucion.ts` y un E2E que gane la partida 1 desde la UI
- [x] 4.2 E2E: mover una secuencia arrastrando, deshacer, y la mesa en 360 × 640 sin scroll horizontal
- [x] 4.3 Añadir el FreeCell al recorrido E2E de las guías
- [x] 4.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
