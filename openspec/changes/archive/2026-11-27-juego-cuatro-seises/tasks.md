## 1. Cuatro seises: reglas (engine)

- [x] 1.1 Hacer común la regla de encajar en las escaleras (`encajaEnEscaleras`) sin cambiar el Cinquillo
- [x] 1.2 Definir `ConfigCuatroSeises`, `EstadoCuatroSeises`, `AccionCuatroSeises`, `VistaCuatroSeises`, el orden de cada baraja y el reparto
- [x] 1.3 Implementar las jugadas, los pases y lo que se sabe de quien pasa, el fondo, el fin de la mano y de la partida, `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-cuatro-seises` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Cuatro seises (engine)

- [x] 2.1 Hacer común la valoración de la IA del Cinquillo (`valorarEnEscalera`) sin cambiar lo que decide, e implementar `iaCuatroSeisesBasica`
- [x] 2.2 Implementar la reconstrucción y `SIMULABLE_CUATRO_SEISES`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de la IA, reproducibilidad, tiempo, partidas entre IAs, contra el azar y la prueba de fuerza
- [x] 2.4 Añadir el Cuatro seises a `red.ts`

## 3. Cliente: Cuatro seises

- [x] 3.1 Sacar de `MesaCinquillo.svelte` la mesa común `MesaEscaleras.svelte` sin cambiar lo que muestra
- [x] 3.2 Registrarlo en `juegos.ts`, en `IdJuego`, en `partida.ts` y en las opciones (baraja, jugadores y manos); textos en español
- [x] 3.3 Añadirlo al catálogo (familia «Descarte», 12 juegos) y su consejo al modo asistido (78 juegos con IA)
- [x] 3.4 Crear `MesaCuatroSeises.svelte` con el fondo, las fichas y el resumen de cada mano, y la pantalla de fin
- [x] 3.5 Guía «¿Cómo se juega al Cuatro seises?» con sus ejemplos comprobados y su historia

## 4. Verificación

- [x] 4.1 E2E: el 6 de oros abre, pasar y pagar, el resumen de la mano, una partida completa, retomar, 360 px con 8 jugadores, la guía, la sala en red y los del Cinquillo sin cambios
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
