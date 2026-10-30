## 1. Sueca: reglas (engine)

- [x] 1.1 Definir `ConfigSueca`, `EstadoSueca`, `AccionSueca`, `VistaSueca`, la baraja de 40, el rango, los puntos y `crear` con el reparto y la carta del triunfo
- [x] 1.2 Implementar las bazas, los puntos y juegos de la mano, la partida a 4 juegos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-sueca` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Sueca (engine)

- [x] 2.1 Implementar `iaSuecaBasica`
- [x] 2.2 Implementar la reconstrucción de la Sueca y `SIMULABLE_SUECA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir la Sueca a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Sueca

- [x] 3.1 Registrar la Sueca en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaSueca.svelte`: triunfo, carta del triunfo, puntos y juegos de cada pareja
- [x] 3.3 `ResumenSueca.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega a la Sueca?»

## 4. Verificación

- [x] 4.1 E2E: jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Sueca en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
