## 1. Pirámide: reglas (engine)

- [x] 1.1 Definir `ConfigPiramide` (pasadas 1/3/sin límite) con su validación, `EstadoPiramide`, `AccionPiramide` y `VistaPiramide`; implementar `crear` con el reparto, las posiciones y `libre`
- [x] 1.2 Implementar quitar parejas y reyes, robar, reciclar con el límite de pasadas, deshacer, abandonar, la victoria al vaciar la pirámide, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-piramide` y la suite genérica del contrato; exportar desde `index.ts`

## 2. Pistas (engine)

- [x] 2.1 Implementar `pistaPiramide` en `ia/pistas.ts` y tests de sus escenarios y de `atascado` con la Pirámide

## 3. Cliente: Pirámide

- [x] 3.1 Registrar la Pirámide en `juegos.ts` (con su pista), en `IdJuego` y en `partida.ts`; menú, opciones (pasadas), textos en español y récords en las estadísticas
- [x] 3.2 Crear `MesaPiramide.svelte`: pirámide solapada, mazo y descarte, selección de parejas y reyes, deshacer, pista, abandonar, tiempo, movimientos, vueltas y aviso de atasco
- [x] 3.3 Pantalla de fin de la Pirámide (victoria con movimientos y tiempo, abandono) y la guía «¿Cómo se juega a la Pirámide?»

## 4. Verificación

- [x] 4.1 E2E: quitar una pareja y una K, robar y reciclar, deshacer, pista, abandonar, y ganar una partida jugando desde la UI con la pista
- [x] 4.2 E2E: la mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada, el récord en las estadísticas y la guía en el recorrido de las guías
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
