## 1. Écarté: reglas (engine)

- [x] 1.1 Definir `ConfigEcarte`, `EstadoEcarte`, `AccionEcarte`, `VistaEcarte`, la baraja, el orden, las cartas legales y `crear` con el reparto y la vuelta
- [x] 1.2 Implementar el cambio con propuestas, el descarte, jugar de autoridad, el rey vuelto y anunciado, las bazas con la obligación de ganar y de fallar, los puntos de la mano, la partida a 5, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-ecarte` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Écarté (engine)

- [x] 2.1 Implementar `iaEcarteBasica`
- [x] 2.2 Implementar la reconstrucción del Écarté y `SIMULABLE_ECARTE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Écarté a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Écarté

- [x] 3.1 Registrar el Écarté en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaEcarte.svelte`: vuelta y montón, botones del cambio, descarte, autoridad, rey y bazas de cada uno
- [x] 3.3 `ResumenEcarte.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Écarté?»

## 4. Verificación

- [x] 4.1 E2E: proponer, aceptar y cambiar cartas, jugar de autoridad, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también con los botones del cambio), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Écarté en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
