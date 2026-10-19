## 1. Truc: reglas (engine)

- [x] 1.1 Definir `ConfigTruc` (2/4 jugadores, 1 o 2 cames) con su validación, `EstadoTruc`, `AccionTruc`, `ResultadoManoTruc` y `VistaTruc`; `rangoTruc` y `puntosEnvit`; implementar `crear` y el reparto con rotación
- [x] 1.2 Implementar las bazas sin obligaciones, las pardas y el fin anticipado de la mano
- [x] 1.3 Implementar el envit (envit, torne, falta, vull, no vull, empate por cercanía a la mano) y el truc (truc a joc fora, quién puede subir, no vull), con el envit primero ante un truc
- [x] 1.4 Implementar me'n vaig, el cierre de la mano (envit antes que truc), las cames, el fin de partida, `vistaDe` y `resultado`
- [x] 1.5 Tests de todos los escenarios de `specs/juego-truc` (incluida la tabla de pardas) y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Truc (engine)

- [x] 2.1 Implementar `iaTrucBasica`: envit por puntos, truc y respuestas por fuerza de la mano, faroles con su azar, y juego de cartas
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs de 2 y 4, y contra el azar
- [x] 2.3 Crear `reconstruir/truc.ts` (manos ajenas que cuadran con el envit mostrado) y su `Simulable` (solo cartas; las apuestas, la base); registrar el Truc en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 2.4 Ajustar la simulación hasta que el difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)
- [x] 2.5 Añadir el Truc a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Truc

- [x] 3.1 Registrar el Truc en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores, cames), sala de espera y textos en español
- [x] 3.2 Crear `MesaTruc.svelte` sobre `MesaBazas`: botones de apuestas y respuestas, me'n vaig, lo que vale la mano, el envit, las bazas y pardas, el marcador y los avisos
- [x] 3.3 Crear `ResumenTruc.svelte` relativo al asiento propio, que pausa hasta «Siguiente mano», y las cames en la pantalla de fin
- [x] 3.4 Escribir la guía «¿Cómo se juega al Truc?» con la jerarquía de cartas y un ejemplo de envit

## 4. Verificación

- [x] 4.1 E2E: partida de 2 jugadores contra la IA envidando, trucando y respondiendo, hasta el resumen de la mano; partida completa a una came
- [x] 4.2 E2E: partida de 4 por parejas, retomar una partida guardada, mesa en 360 × 640 sin scroll horizontal y el Truc en el recorrido de las guías
- [x] 4.3 E2E: sala de Truc en red con dos navegadores jugando una mano
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
