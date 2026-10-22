## 1. Picas: reglas (engine)

- [x] 1.1 Definir `ConfigPicas`, `EstadoPicas`, `AccionPicas` y `VistaPicas`; implementar `crear` con el reparto y la fase de apuesta
- [x] 1.2 Implementar la apuesta (Nil y 1–13), las bazas (seguir el palo, picas de triunfo, picas rotas, fallos), el cierre de la mano (contrato, sacos, Nil, penalización de 10 sacos), la partida a 500, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-picas` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de Picas (engine)

- [x] 2.1 Implementar `iaPicasBasica`: apuesta por bazas esperadas y Nil, juego con contrato, sin sacos de más, Nil propio y Nil del compañero
- [x] 2.2 Implementar la reconstrucción con fallos conocidos y `SIMULABLE_PICAS` (solo cartas); registrar los tres niveles en `IAS`, en la tabla de niveles y en los tests de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 300 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal en 200 partidas)
- [x] 2.4 Añadir Picas a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Picas

- [x] 3.1 Registrar Picas en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones y textos en español
- [x] 3.2 Crear `MesaPicas.svelte` sobre `MesaBazas`: apuestas y bazas por jugador, contratos, puntos y sacos, picas rotas y la ventana de apuesta
- [x] 3.3 Crear `ResumenPicas.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega a Picas?»

## 4. Verificación

- [x] 4.1 E2E: apostar, jugar una baza siguiendo el palo, no poder salir de picas sin romper y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Picas en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
