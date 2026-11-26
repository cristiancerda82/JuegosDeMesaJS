## 1. Burro de bazas: reglas (engine)

- [x] 1.1 Definir `ConfigBurroBazas`, `EstadoBurroBazas`, `AccionBurroBazas`, `VistaBurroBazas`, la baraja, el orden y `crear` con el reparto y el mazo
- [x] 1.2 Implementar las bazas con robar y pasar, lo que se sabe de los palos, el fin de la mano con el burro, el fin por límite, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-burro-bazas` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Burro de bazas (engine)

- [x] 2.1 Implementar `iaBurroBazasBasica`
- [x] 2.2 Implementar la reconstrucción del Burro de bazas y `SIMULABLE_BURRO_BAZAS`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Burro de bazas a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Burro de bazas

- [x] 3.1 Registrar el Burro de bazas en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego`, en `partida.ts` y en las opciones (jugadores y límite); textos en español
- [x] 3.2 Añadirlo al catálogo del menú (familia «Descarte») y su consejo y sus razones al modo asistido, subiendo a 74 la cuenta de juegos con IA y a 11 la de la familia en el test del catálogo
- [x] 3.3 Crear `MesaBurroBazas.svelte`: bazas, robar y pasar, lo de cada jugador y las penalizaciones
- [x] 3.4 `ResumenBurroBazas.svelte` para el resumen de la mano y la pantalla de fin, la guía «¿Cómo se juega al Burro de bazas?» con sus ejemplos comprobados y su historia, y la línea de la guía del Burro que remite a él

## 4. Verificación

- [x] 4.1 E2E: jugar las bazas y robar sin el palo, el resumen de la mano, 6 jugadores y partidas completas contra la IA (con 4 y con 6)
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal con 6, retomar una partida guardada, la guía y la sala de Burro de bazas en red con dos navegadores
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
