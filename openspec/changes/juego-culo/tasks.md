## 1. Culo: reglas (engine)

- [x] 1.1 Definir `ConfigCulo` (3–6 jugadores), `EstadoCulo`, `AccionCulo`, `VistaCulo`, `ResultadoManoCulo`, `rangoCulo` y `crear` con el reparto y la salida del 3 de oros
- [x] 1.2 Implementar las rondas (jugar, pasar, limpiar, cortar con doses), la salida y los puestos, los cargos y puntos, el reparto de la mano siguiente con el intercambio, el fin a las 5 manos con el desempate, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-culo` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Culo (engine)

- [x] 2.1 Implementar `iaCuloBasica` (abrir, responder sin romper, guardar los doses, devolver lo más bajo)
- [x] 2.2 Implementar la reconstrucción del Culo y `SIMULABLE_CULO`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs de 3 a 6, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Culo a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Culo

- [x] 3.1 Registrar el Culo en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaCulo.svelte`: rivales, jugada a superar, mano con selección y marca automática, botones de jugar, pasar y devolver
- [x] 3.3 Crear `ResumenCulo.svelte` entre manos, la pantalla de fin con la clasificación y la guía «¿Cómo se juega al Culo?»

## 4. Verificación

- [x] 4.1 E2E: abrir, superar con la marca automática, pasar, el intercambio como presidente, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 6 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Culo en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
