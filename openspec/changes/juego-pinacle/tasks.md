## 1. Pinacle: reglas (engine)

- [x] 1.1 Definir `CartaPinacle`, la baraja de 108, `ConfigPinacle`, `EstadoPinacle`, `Combinacion`, `AccionPinacle` y `VistaPinacle`; implementar `crear`, el reparto y la rotación del repartidor
- [x] 1.2 Implementar las combinaciones: validar grupos y escaleras (2 naturales, comodines en su puesto, del 3 al As), generar por construcción los `bajar` de 3 cartas y los `añadir`, deduplicando copias
- [x] 1.3 Implementar el turno: robar del mazo o el montón (con su condición y `debeBajar`), bajar, añadir a las del bando, cambiar comodines y descartar
- [x] 1.4 Implementar el cierre, el fin de mano por mazo agotado, el barbelé con su devolución y los −50, y el fin de partida a 1500
- [x] 1.5 Crear `pinacle-puntos.ts`: valor de cartas, premios de grupos y escaleras completas, premios por cerrar (sin comodín, de golpe) y por cambiar comodines, y el desglose por bando
- [x] 1.6 Crear `pinacle-plan.ts` con `planesParaBajar` (combinación nueva o añadir a una existente), agrupando los planes por combinación final
- [x] 1.7 Tests de todos los escenarios de `specs/juego-pinacle`, de los premios y de `planesParaBajar`, tiempo de `accionesLegales` con 50 cartas en la mano, y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Pinacle (engine)

- [x] 2.1 Implementar `iaPinacleBasica`: robar (mazo o montón), bajar con planes (menos comodines primero, añadir, cambiar, barbelé) y descartar la carta menos útil y menos peligrosa
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs de 2 y 4 jugadores, y contra el azar
- [x] 2.3 Añadir el gancho `candidatas` a `Simulable`/`porSimulacion` sin cambiar el resto de juegos, con su test
- [x] 2.4 Crear `reconstruir/pinacle.ts` (manos ajenas con sus conocidas, mazo) y su `Simulable` con horizonte; registrar el Pinacle en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 2.5 Ajustar presupuesto y horizonte hasta que el difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)

## 3. Cliente: Pinacle

- [x] 3.1 Registrar el Pinacle en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; añadirlo al menú y a las opciones (2 o 4 por parejas), con todos los textos en español
- [x] 3.2 Crear `MesaPinacle.svelte`: rivales con sus cartas y conocidas, mazo, montón con su panel, combinaciones de cada bando, puntos y barbelé
- [x] 3.3 Mano en dos filas que se ajustan al ancho, con orden por palos o por números; selección de cartas con «Bajar», añadir tocando una combinación, cambio de comodín, elección del puesto de un comodín y descarte
- [x] 3.4 Avisos de la mesa: por qué no se puede llevar el montón, bajar la carta del montón antes de descartar y el barbelé antes de descartar
- [x] 3.5 Resumen de cada mano con el desglose de los dos bandos, que pausa hasta «Siguiente mano», y los puntos de los bandos en la pantalla de fin
- [x] 3.6 Escribir la guía «¿Cómo se juega al Pinacle?»

## 4. Verificación

- [x] 4.1 E2E: partida de 2 jugadores contra la IA robando, bajando un grupo, añadiendo y descartando, hasta el resumen de la mano
- [x] 4.2 E2E: llevarse el montón y la obligación de bajar su carta; botón «Bajar» desactivado con una elección que no combina
- [x] 4.3 E2E: partida de 4 por parejas, retomar una partida guardada, mano de más de 30 cartas en 360 × 640 sin scroll horizontal, y el Pinacle en el recorrido de las guías
- [x] 4.4 Ejecutar todos los tests (motor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
