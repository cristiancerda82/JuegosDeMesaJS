## 1. Siete y media: reglas (engine)

- [x] 1.1 Definir `ConfigSieteYMedia` con valores por defecto y validación (2–4 jugadores, manos, fichas iniciales, apuesta máxima, pago doble, cambio de banca), `EstadoSieteYMedia`, `AccionSieteYMedia`, `ResultadoManoSieteYMedia` y `VistaSieteYMedia`
- [x] 1.2 Implementar `valorCarta`, `valorJugada` (en medios puntos) y `esSieteYMediaNatural`, con tests
- [x] 1.3 Implementar `crear` y la fase de apuestas: orden desde el siguiente a la banca, límites por apuesta máxima y fichas, y el reparto con barajado al apostar el último
- [x] 1.4 Implementar la fase de juego: pedir (pasarse con cobro inmediato, plantarse solo en 7,5), plantarse, turno de la banca y fin de la mano si todos se pasan
- [x] 1.5 Implementar la liquidación (empates para la banca, banca pasada, pago doble, pago hasta donde alcance), el registro de la mano, el cambio de banca (rotar o por siete y media) y el fin de la partida
- [x] 1.6 Implementar `vistaDe` (tapadas ajenas ocultas, valores visibles) y `resultado`
- [x] 1.7 Tests de todos los escenarios de `specs/juego-siete-y-media` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de la Siete y media (engine)

- [x] 2.1 Implementar `iaSieteYMediaBasica`: apuesta según sus fichas, umbral de 5 como punto y la regla de la banca frente a las jugadas visibles
- [x] 2.2 Tests de los escenarios "El punto se planta con 5" y "El punto pide con poco", de la banca, de la reproducibilidad y del tiempo de decisión
- [x] 2.3 Simulación de 1.000 partidas entre IAs (2 a 4 jugadores, distintas variantes) sin acciones ilegales
- [x] 2.4 Test de la IA básica contra el agente aleatorio en 1.000 partidas (termina con más fichas en claramente más de la mitad)

## 3. Cliente: registro y opciones

- [x] 3.1 Registrar la Siete y media en `juegos.ts` (definición, IA y pausas tras cada acción de un rival), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 3.2 Añadir la Siete y media al menú y sus opciones (jugadores, manos, fichas iniciales, apuesta máxima, pago doble, cambio de banca), con todos los textos en español

## 4. Cliente: mesa de la Siete y media

- [x] 4.1 Crear `MesaSieteYMedia.svelte`: rivales con fichas, apuesta y marca de banca, sus jugadas (tapada y destapadas), el mazo, la jugada propia con su valor y el aviso de cada acción
- [x] 4.2 Implementar los controles: selector de apuesta con «Apostar», «Pedir carta» y «Plantarse»
- [x] 4.3 Crear `ResultadoSieteYMedia.svelte` y mostrarlo al terminar cada mano en un panel que pausa la sesión hasta "Siguiente mano"; usarlo también en la pantalla de fin con las fichas finales
- [x] 4.4 Escribir la guía "¿Cómo se juega a la Siete y media?" con ejemplos de cartas para los valores y la siete y media

## 5. Verificación

- [x] 5.1 E2E: partida completa contra la IA con 2 y con 4 jugadores, cerrando el panel de cada mano
- [x] 5.2 E2E: apostar, pedir y plantarse desde la mesa, y la mesa en 360 × 640 sin scroll horizontal
- [x] 5.3 Añadir la Siete y media al recorrido E2E de las guías
- [x] 5.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
