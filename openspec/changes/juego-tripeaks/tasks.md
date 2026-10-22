## 1. TriPeaks: reglas (engine)

- [x] 1.1 Definir `ConfigTriPeaks`, `EstadoTriPeaks`, `AccionTriPeaks` y `VistaTriPeaks`, las tapadoras de cada posición y `crear` con el reparto
- [x] 1.2 Implementar quitar (con vuelta, cartas libres), robar, los puntos por racha y por picos, deshacer, abandonar, la victoria, `vistaDe` con las cartas ocultas y `resultado` con los puntos
- [x] 1.3 Tests de todos los escenarios de `specs/juego-tripeaks` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pistas (engine)

- [x] 2.1 Implementar `pistaTriPeaks` en `ia/pistas.ts` con la cadena más larga sobre las cartas visibles, y tests de sus escenarios, de `atascado` y de las partidas al azar

## 3. Estadísticas (cliente)

- [x] 3.1 Añadir la mejor puntuación a `EstadisticasJuego`, `PartidaTerminada` y `Novedades`, leer las estadísticas antiguas sin ella, pasar los puntos desde la sesión y mostrarla en las estadísticas y en el fin; tests

## 4. Cliente: TriPeaks

- [x] 4.1 Registrar TriPeaks en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú, opciones y textos en español
- [x] 4.2 Crear `MesaTriPeaks.svelte`: los tres picos con dorsos, mazo y descarte, quitar tocando, racha y puntos, deshacer, pista, abandonar, tiempo, movimientos y aviso de atasco
- [x] 4.3 Pantalla de fin de TriPeaks (victoria y abandono con los puntos) y la guía «¿Cómo se juega a TriPeaks?»

## 5. Verificación

- [x] 5.1 E2E: quitar tocando, una carta que no se quita, robar y cortar la racha, deshacer, abandonar, y ganar una partida jugando desde la UI con la pista
- [x] 5.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada, el récord de puntos y la guía en el recorrido de las guías
- [x] 5.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
