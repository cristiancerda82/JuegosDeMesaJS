## 1. Módulo de bazas parametrizable (engine)

- [x] 1.1 Añadir `ValoresBazas`, `VALORES_BRISCA` y `VALORES_GUINOTE` a `motor/bazas.ts`, y el parámetro opcional `valores` en `fuerza`, `puntosDe`, `cartaGanadora`, `cartaDeCambio` y `cartasObligadas`
- [x] 1.2 Añadir el parámetro opcional `valores` en `ia/bazas-heuristica.ts` (`coste`, `masBarata`, `cartaParaSalir`, `SituacionBaza`)
- [x] 1.3 Tests de bazas con los valores del Guiñote (la sota gana al caballo, puntos, cambio con el 2) y comprobar que las suites de la Brisca y el Tute siguen pasando sin cambios

## 2. Guiñote: reglas (engine)

- [x] 2.1 Definir `ConfigGuinote` con valores por defecto y validación (2/4 jugadores, cambio del 7, montar sobre el compañero, meta de la partida), `EstadoGuinote`, `AccionGuinote`, `ResultadoManoGuinote` y `VistaGuinote`
- [x] 2.2 Implementar `crear` y `nuevaMano`: 6 cartas por jugador, muestra, mazo de 27 o 15 cartas y salida del siguiente al repartidor
- [x] 2.3 Implementar `accionesLegales`: juego libre con mazo, arrastre con las obligaciones, cantes con rey y sota solo con mazo y cambio del 7 tras una baza del bando
- [x] 2.4 Implementar la transición: jugar, resolver la baza con el robo, cantar y cambiar el 7
- [x] 2.5 Implementar el cierre de la mano con desglose (bazas, cantes, 10 de últimas), los totales, la partida a la meta con vueltas y el reparto rotatorio
- [x] 2.6 Implementar `vistaDe` (con el arrastre y los totales, sin manos ajenas ni mazo) y `resultado`
- [x] 2.7 Tests de todos los escenarios de `specs/juego-guinote` y la suite genérica del contrato; exportar el Guiñote desde `index.ts`

## 3. IA del Guiñote (engine)

- [x] 3.1 Implementar `iaGuinoteBasica`: cantes (40 antes que 20), cambio del 7, guardar las parejas con mazo y la heurística de bazas con `VALORES_GUINOTE`
- [x] 3.2 Tests de los escenarios "Canta lo que puede" y "Guarda la pareja", reproducibilidad y tiempo de decisión por debajo de 500 ms
- [x] 3.3 Simulación de 1.000 partidas de Guiñote entre IAs (2 y 4 jugadores, distintas variantes) sin acciones ilegales
- [x] 3.4 Test de la IA básica contra el agente aleatorio en 1.000 partidas de Guiñote (gana claramente más de la mitad)

## 4. Cliente: registro y opciones

- [x] 4.1 Registrar el Guiñote en `juegos.ts` (definición, IA y pausas), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 4.2 Añadir el Guiñote al menú y sus opciones (jugadores, cambio del 7, montar sobre el compañero, meta de la partida), con todos los textos en español

## 5. Cliente: mesa del Guiñote

- [x] 5.1 Crear `MesaGuinote.svelte` sobre `MesaBazas`: triunfo, marcador con la meta, lista de cantes, aviso de arrastre, botones de cantar y de cambiar el 7, y el aviso de cada cante con el rey y la sota
- [x] 5.2 Crear `ResumenGuinote.svelte` y mostrarlo al terminar cada mano, con el desglose, los acumulados y el aviso de vueltas, pausando la sesión hasta "Siguiente mano"
- [x] 5.3 Mostrar en la pantalla de fin el resumen de la última mano y el marcador final
- [x] 5.4 Escribir la guía "¿Cómo se juega al Guiñote?" con ejemplos de cartas para el orden, los cantes y el arrastre

## 6. Verificación

- [x] 6.1 E2E: partida de Guiñote completa contra la IA con 2 jugadores y con 4 en parejas, cerrando el resumen de cada mano
- [x] 6.2 E2E: cantar desde la mesa (con una semilla que lo permita) y la mesa del Guiñote en 360 × 640 sin scroll horizontal
- [x] 6.3 Añadir el Guiñote al recorrido E2E de las guías
- [x] 6.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
