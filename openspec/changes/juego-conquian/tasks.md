## 1. Conquián: reglas (engine)

- [x] 1.1 Definir `ConfigConquian`, `EstadoConquian`, `AccionConquian`, `VistaConquian`, el orden, `esCombinacionConquian` y `crear` con el reparto y la primera carta descubierta
- [x] 1.2 Implementar las acciones de bajar, añadir, pasar y descartar con su orden de ofrecimiento, las cartas muertas, ganar la mano con 11 cartas, las tablas, la partida al mejor de 5, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-conquian` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Conquián (engine)

- [x] 2.1 Implementar `iaConquianBasica`
- [x] 2.2 Implementar la reconstrucción del Conquián y `SIMULABLE_CONQUIAN`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Conquián a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Conquián

- [x] 3.1 Registrar el Conquián en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaConquian.svelte`: la mano que se ordena, las combinaciones de cada uno, la carta descubierta con su origen, el mazo y las muertas, bajar, añadir, pasar y descartar
- [x] 3.3 `ResumenConquian.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Conquián?»

## 4. Verificación

- [x] 4.1 E2E: bajar con la carta descubierta y descartar, pasar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Conquián en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
