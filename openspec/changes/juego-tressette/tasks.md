## 1. Tressette: reglas (engine)

- [x] 1.1 Definir `ConfigTressette`, `EstadoTressette`, `AccionTressette`, `VistaTressette`, el rango, los tercios y `crear` con el reparto
- [x] 1.2 Implementar las bazas sin triunfo, los puntos de la mano con la última baza, la partida a 21, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-tressette` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Tressette (engine)

- [x] 2.1 Implementar `iaTressetteBasica`
- [x] 2.2 Implementar la reconstrucción del Tressette y `SIMULABLE_TRESSETTE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Tressette a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Tressette

- [x] 3.1 Registrar el Tressette en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaTressette.svelte`: baza en curso, puntos de cada pareja en la mano con los tercios y en la partida
- [x] 3.3 `ResumenTressette.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Tressette?»

## 4. Verificación

- [x] 4.1 E2E: jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Tressette en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
