## 1. Bridge: reglas (engine)

- [x] 1.1 Definir `ConfigBridge`, `EstadoBridge`, `AccionBridge`, `VistaBridge`, las denominaciones y `crear` con el reparto y la vulnerabilidad del Chicago
- [x] 1.2 Implementar la subasta (pujas, pases, doblos, redoblos, fin y reparto de nuevo si pasan todos), el declarante, la salida, el muerto, el carteo con el declarante por el muerto, `puntuarManoBridge`, los ciclos, el fin, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-bridge` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Bridge (engine)

- [x] 2.1 Implementar `iaBridgeBasica`, con la subasta natural sencilla y el carteo por reglas
- [x] 2.2 Implementar la reconstrucción del Bridge y `SIMULABLE_BRIDGE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Bridge a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Bridge

- [x] 3.1 Registrar el Bridge en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones de ciclos y textos en español
- [x] 3.2 Crear `MesaBridge.svelte`: la caja de subasta con la rejilla de pujas, el muerto boca arriba y jugable por el declarante, el contrato, la vulnerabilidad y las bazas
- [x] 3.3 `ResumenBridge.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Bridge?»

## 4. Verificación

- [x] 4.1 E2E: pujar en la subasta, jugar por el muerto como declarante, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Bridge en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
