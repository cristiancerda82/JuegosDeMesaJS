## 1. Five Hundred: reglas (engine)

- [x] 1.1 Definir `ConfigFiveHundred`, `EstadoFiveHundred`, `AccionFiveHundred`, `VistaFiveHundred`, la baraja de 43, las pujas con la tabla de Avondale, el palo efectivo, los rangos y `crear` con el reparto y la viuda
- [x] 1.2 Implementar la subasta, el descarte, las bazas con el comodín y las Jotas, el misère y el misère abierto, los puntos de la mano, la partida a 500 y −500, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-five-hundred` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Five Hundred (engine)

- [x] 2.1 Implementar `iaFiveHundredBasica`
- [x] 2.2 Implementar la reconstrucción del Five Hundred y `SIMULABLE_FIVE_HUNDRED`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Five Hundred a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Five Hundred

- [x] 3.1 Registrar el Five Hundred en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaFiveHundred.svelte`: subasta, descarte, palo del comodín, misère abierto, contrato, bazas y puntos de cada pareja
- [x] 3.3 `ResumenFiveHundred.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Five Hundred?»

## 4. Verificación

- [x] 4.1 E2E: pujar, descartar de la viuda, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también la tabla de pujas), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Five Hundred en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
