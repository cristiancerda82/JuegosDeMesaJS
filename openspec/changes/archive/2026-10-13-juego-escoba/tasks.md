## 1. Escoba: reglas (engine)

- [x] 1.1 Definir `ConfigEscoba` con valores por defecto y validación (2/4 jugadores, puntos de la partida 15/21/31, captura obligatoria, escoba de la mesa inicial), `EstadoEscoba`, `AccionEscoba`, `VistaEscoba` y el valor de cada carta para sumar
- [x] 1.2 Implementar la búsqueda de capturas que suman 15 (con poda y en el orden de la mesa), con tests de capturas simples, múltiples y sin captura
- [x] 1.3 Implementar `crear` y `nuevaMano`: reparto de 3 cartas y 4 a la mesa, salida del siguiente al repartidor y la mesa inicial que suma 15 o 30
- [x] 1.4 Implementar `accionesLegales` y la transición de jugar: captura, escoba, `ultimaJugada`, `ultimoEnRecoger` y el nuevo reparto al vaciarse las manos
- [x] 1.5 Implementar `puntuarMano` (escobas, cartas, oros, 7 de oros, sietes y empates), con tests propios
- [x] 1.6 Implementar el cierre de la mano (las cartas de la mesa para el último que recogió), la partida a N puntos con empate en la meta y el reparto alternado
- [x] 1.7 Implementar `vistaDe` sin las cartas recogidas y `resultado`
- [x] 1.8 Tests de todos los escenarios de `specs/juego-escoba` y la suite genérica del contrato; exportar la Escoba desde `index.ts`

## 2. IA de la Escoba (engine)

- [x] 2.1 Implementar la IA básica por evaluación de jugadas (escoba, valor de la captura, coste de soltar y riesgo de escoba rival)
- [x] 2.2 Tests de los escenarios "Hace escoba", "Se lleva el 7 de oros" y "No da escoba", reproducibilidad y tiempo de decisión por debajo de 500 ms
- [x] 2.3 Simulación de 1.000 partidas de Escoba entre IAs (2 y 4 jugadores, distintas variantes) sin acciones ilegales
- [x] 2.4 Test de la IA básica contra el agente aleatorio en 1.000 manos de Escoba (gana claramente más de la mitad)

## 3. Cliente: registro y opciones

- [x] 3.1 Registrar la Escoba en `juegos.ts` (definición, IA, pausa tras cada jugada y al cerrar la mano), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 3.2 Añadir la Escoba al menú y sus opciones (jugadores, puntos de la partida, captura obligatoria, escoba de la mesa inicial), con todos los textos en español

## 4. Cliente: mesa de la Escoba

- [x] 4.1 Crear `MesaEscoba.svelte` con los asientos rivales y la mano propia compartidos, el mazo, la mesa en rejilla y los montones de cada bando (cartas y escobas)
- [x] 4.2 Implementar la captura tocando: resaltar las cartas capturables de la carta elegida, alternar la selección en la mesa, el panel con la suma, "Recoger" (solo con una captura legal) y "Dejar en la mesa"
- [x] 4.3 Implementar el soltar en la mesa (arrastre o doble toque): aplicar la única jugada o abrir el selector con todas las opciones
- [x] 4.4 Mostrar la jugada reciente durante la pausa (carta jugada y cartas recogidas destacadas) y anunciar las escobas propias y de la IA
- [x] 4.5 Mostrar el panel de desglose al terminar cada mano, pausando la sesión hasta pulsar "Siguiente mano"
- [x] 4.6 Mostrar en la pantalla de fin el desglose de la última mano y los totales de la partida
- [x] 4.7 Escribir la guía "¿Cómo se juega a la Escoba?" con ejemplos de cartas para los valores y para una captura de 15

## 5. Verificación

- [x] 5.1 E2E: partida de Escoba completa contra la IA con 2 jugadores y con 4 en parejas (cerrando el panel de desglose de cada mano)
- [x] 5.2 E2E: elegir entre dos capturas desde el selector y armar una captura tocando cartas de la mesa (con semillas que lo permitan)
- [x] 5.3 E2E: la mesa de la Escoba en 360 × 640 sin scroll horizontal y con las cartas identificables
- [x] 5.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
