## 1. Briscola Chiamata: reglas (engine)

- [x] 1.1 Definir `ConfigBriscolaChiamata`, `EstadoBriscolaChiamata`, `AccionBriscolaChiamata`, `VistaBriscolaChiamata`, los niveles de puja, la ganadora y `crear` con el reparto
- [x] 1.2 Implementar la subasta (con la obligación del que reparte), la llamada y el compañero oculto, jugar solo, las bazas, la puntuación, el fin a las 5 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-briscola-chiamata` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Briscola Chiamata (engine)

- [x] 2.1 Implementar `iaBriscolaChiamataBasica`
- [x] 2.2 Implementar la reconstrucción de la Briscola Chiamata y `SIMULABLE_BRISCOLA_CHIAMATA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir la Briscola Chiamata a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Briscola Chiamata

- [x] 3.1 Registrar la Briscola Chiamata en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; textos en español
- [x] 3.2 Añadirla al catálogo del menú (familia «Bazas con contrato o subasta») y su consejo al modo asistido, subiendo a 69 la cuenta de juegos con IA y a 16 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaBriscolaChiamata.svelte`: subasta de cartas y de puntos, llamada, la puja, la carta llamada, el compañero y los marcadores
- [x] 3.4 `ResumenBriscolaChiamata.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega a la Briscola Chiamata?»

## 4. Verificación

- [x] 4.1 E2E: pujar y llamar, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también en la subasta), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Briscola Chiamata en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
