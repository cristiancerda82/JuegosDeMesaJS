## 1. Bezique: reglas (engine)

- [x] 1.1 Definir `ConfigBezique`, `EstadoBezique`, `AccionBezique`, `VistaBezique`, la baraja doble de piquet, el rango y `crear` con el reparto, la vuelta y el 7
- [x] 1.2 Implementar las bazas con mazo, las declaraciones (combinaciones, reutilización y cambio del 7), el robo, las 8 últimas bazas con sus obligaciones, los puntos de la mano, la partida a 1.000, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-bezique` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Bezique (engine)

- [x] 2.1 Implementar `iaBeziqueBasica`
- [x] 2.2 Implementar la reconstrucción del Bezique y `SIMULABLE_BEZIQUE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Bezique a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Bezique

- [x] 3.1 Registrar el Bezique en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaBezique.svelte`: mazo y vuelta, cartas cantadas de los dos, botones de declarar, puntos y avisos de cantes
- [x] 3.3 `ResumenBezique.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Bezique?»

## 4. Verificación

- [x] 4.1 E2E: jugar una baza, cantar una combinación, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Bezique en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
