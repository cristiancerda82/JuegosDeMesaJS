## 1. Piquet: reglas (engine)

- [x] 1.1 Definir `ConfigPiquet`, `EstadoPiquet`, `AccionPiquet`, `VistaPiquet`, la baraja de 32, el rango y `crear` con el reparto y el montón
- [x] 1.2 Implementar el cambio, las declaraciones con el repique, las bazas con sus puntos, el pique, las cartas y el capote, el *rubber* de 6 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-piquet` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Piquet (engine)

- [x] 2.1 Implementar `iaPiquetBasica`
- [x] 2.2 Implementar la reconstrucción del Piquet y `SIMULABLE_PIQUET`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Piquet a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Piquet

- [x] 3.1 Registrar el Piquet en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaPiquet.svelte`: montón, cambio, declaraciones, puntos y mano de la partida
- [x] 3.3 `ResumenPiquet.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Piquet?»

## 4. Verificación

- [x] 4.1 E2E: cambiar, ver las declaraciones, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Piquet en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
