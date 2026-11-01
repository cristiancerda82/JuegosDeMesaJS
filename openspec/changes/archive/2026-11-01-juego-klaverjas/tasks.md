## 1. Klaverjas: reglas (engine)

- [x] 1.1 Definir `ConfigKlaverjas`, `EstadoKlaverjas`, `AccionKlaverjas`, `VistaKlaverjas`, la baraja de 32, los rangos, los puntos y `crear` con el reparto y el palo propuesto
- [x] 1.2 Implementar la propuesta y la elección del triunfo, las bazas de Rotterdam, el roem, el pit, el nat, la partida a 8 manos, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-klaverjas` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Klaverjas (engine)

- [x] 2.1 Implementar `iaKlaverjasBasica`
- [x] 2.2 Implementar la reconstrucción del Klaverjas y `SIMULABLE_KLAVERJAS`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Klaverjas a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Klaverjas

- [x] 3.1 Registrar el Klaverjas en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaKlaverjas.svelte`: palo propuesto, jugar o pasar, elección, triunfo y quién juega, roem y puntos de cada pareja
- [x] 3.3 `ResumenKlaverjas.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Klaverjas?»

## 4. Verificación

- [x] 4.1 E2E: jugar o pasar el palo propuesto, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Klaverjas en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
