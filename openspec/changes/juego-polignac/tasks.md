## 1. Polignac: reglas (engine)

- [x] 1.1 Definir `ConfigPolignac`, `EstadoPolignac`, `AccionPolignac`, `VistaPolignac`, la baraja según los jugadores, el orden, las penalizaciones, las cartas legales y `crear` con el reparto
- [x] 1.2 Implementar el general, las bazas con sus puntos y el fin anticipado, el fin por límite, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-polignac` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Polignac (engine)

- [x] 2.1 Implementar `iaPolignacBasica`
- [x] 2.2 Implementar la reconstrucción del Polignac y `SIMULABLE_POLIGNAC`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Polignac a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Polignac

- [x] 3.1 Registrar el Polignac en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego`, en `partida.ts` y en las opciones (jugadores, límite y general); textos en español
- [x] 3.2 Añadirlo al catálogo del menú (familia «Bazas para evitar») y su consejo al modo asistido, subiendo a 71 la cuenta de juegos con IA y a 4 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaPolignac.svelte`: anunciar o pasar el general, bazas, puntos de la mano y marcador
- [x] 3.4 `ResumenPolignac.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Polignac?» con sus ejemplos comprobados

## 4. Verificación

- [x] 4.1 E2E: pasar el general y jugar una baza, el resumen de la mano y una partida completa contra la IA (con 4 y con 6 jugadores)
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también con 6 jugadores), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Polignac en red con dos navegadores (el resto de asientos, la IA)
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
