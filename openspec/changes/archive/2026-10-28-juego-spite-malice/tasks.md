## 1. Spite and Malice: reglas (engine)

- [x] 1.1 Definir `ConfigSpiteMalice`, `EstadoSpiteMalice`, `AccionSpiteMalice`, `VistaSpiteMalice`, la baraja doble, los valores con el K como comodín y `crear` con los montones, las manos y el mazo
- [x] 1.2 Implementar jugar desde el montón, la mano y los descartes, las escaleras con las completas, robar al empezar y al vaciar la mano, rehacer el mazo, descartar, pasar, el fin y el empate, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-spite-malice` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Spite and Malice (engine)

- [x] 2.1 Implementar `iaSpiteMaliceBasica`
- [x] 2.2 Implementar la reconstrucción del Spite and Malice y `SIMULABLE_SPITE_MALICE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Spite and Malice a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Spite and Malice

- [x] 3.1 Registrar el Spite and Malice en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaSpiteMalice.svelte`: montones, descartes y manos, escaleras y mazo, selección de origen y destino, y avisos
- [x] 3.3 La pantalla de fin y la guía «¿Cómo se juega al Spite and Malice?»

## 4. Verificación

- [x] 4.1 E2E: jugar a una escalera desde la mano, jugar desde el montón, descartar y que juegue el rival, y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Spite and Malice en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
