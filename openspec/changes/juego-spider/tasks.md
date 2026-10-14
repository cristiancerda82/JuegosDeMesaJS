## 1. Spider: reglas (engine)

- [x] 1.1 Definir `ConfigSpider`, `CartaSpider` con `baseSpider`, `EstadoSpider`, `AccionSpider` y `VistaSpider`; implementar `crear` con el reparto por palos y copias numeradas
- [x] 1.2 Implementar los movimientos de cartas y escaleras del mismo palo, el volteo, el reparto del mazo (con la opción de columnas vacías) y la retirada de escaleras completas
- [x] 1.3 Implementar deshacer con instantáneas, abandonar, `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-spider`, la victoria con un tablero armado y la suite genérica del contrato; exportar desde `index.ts`

## 2. Cliente: Spider

- [x] 2.1 Registrar el Spider en `juegos.ts`, en `IdJuego` y en `partida.ts`
- [x] 2.2 Añadir el Spider al menú y sus opciones (palos y reparto con columnas vacías), con todos los textos en español
- [x] 2.3 Crear `MesaSpider.svelte`: 10 columnas con solape variable, mazo para repartir, escaleras completadas, interacción con arrastre, toque y doble toque, animaciones, deshacer y abandonar
- [x] 2.4 Mostrar el resultado en la pantalla de fin (ganada o abandonada, movimientos y tiempo)
- [x] 2.5 Escribir la guía "¿Cómo se juega al Spider?"

## 3. Verificación

- [x] 3.1 E2E: mover una carta y una escalera, repartir del mazo, deshacer, y abandonar
- [x] 3.2 E2E: completar una escalera en una partida buscada con el motor y ver que se retira
- [x] 3.3 E2E: la mesa en 360 × 640 sin scroll horizontal, y añadir el Spider al recorrido de las guías
- [ ] 3.4 Ejecutar todos los tests (motor y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
