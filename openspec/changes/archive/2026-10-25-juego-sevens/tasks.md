## 1. Sevens: reglas (engine)

- [x] 1.1 Definir `ConfigSevens` (3–6 jugadores), `EstadoSevens`, `AccionSevens`, `VistaSevens`, `ResultadoManoSevens` y `crear` con el reparto y la salida del 7 de diamantes
- [x] 1.2 Implementar las escaleras, jugar o pasar, el fin de la mano con la penalización, la partida a 50, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-sevens` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Sevens (engine)

- [x] 2.1 Implementar `iaSevensBasica`
- [x] 2.2 Implementar la reconstrucción del Sevens y `SIMULABLE_SEVENS`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs de 3 a 6, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Sevens a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Sevens

- [x] 3.1 Registrar el Sevens en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaSevens.svelte`: escaleras, rivales, mano con las cartas jugables y pasar
- [x] 3.3 Crear `ResumenSevens.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Sevens?»

## 4. Verificación

- [x] 4.1 E2E: abrir con el 7 de diamantes, alargar una escalera, pasar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 6 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Sevens en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
