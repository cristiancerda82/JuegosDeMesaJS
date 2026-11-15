## 1. Casita robada: reglas (engine)

- [x] 1.1 Definir `ConfigCasitaRobada`, `EstadoCasitaRobada`, `AccionCasitaRobada`, `VistaCasitaRobada` y `crear` con el reparto
- [x] 1.2 Implementar jugar, capturar de la mesa, robar casitas, los repartos sucesivos, el final con las cartas de la mesa para el último que se llevó, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-casita-robada` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Casita robada (engine)

- [x] 2.1 Implementar `iaCasitaRobadaBasica`
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_CASITA_ROBADA`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir la Casita robada a `red.ts` y comprobar que el servidor la acepta en sus tests

## 3. Cliente: Casita robada

- [x] 3.1 Registrar el juego en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego`, en `partida.ts` y en las opciones (jugadores); textos en español
- [x] 3.2 Añadirlo al catálogo del menú (familia «Captura») y su consejo al modo asistido, subiendo a 73 la cuenta de juegos con IA y a 7 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaCasitaRobada.svelte`: mesa, mazo, casitas con su carta de arriba y su cuenta, jugar y elegir a quién robar, y lo que hizo el último
- [x] 3.4 La pantalla de fin y la guía «¿Cómo se juega a la Casita robada?» con sus ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: llevarse cartas de la mesa, robar una casita (o no robar), y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal (también con 4 jugadores), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Casita robada en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
