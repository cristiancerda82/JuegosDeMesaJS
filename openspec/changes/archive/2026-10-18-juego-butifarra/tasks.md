## 1. Motor de bazas

- [x] 1.1 Añadir `VALORES_BUTIFARRA` y aceptar `triunfo: null` (sin triunfo) en `cartaGanadora`, `cartasObligadas` y la heurística de bazas, con tests y sin cambiar los demás juegos

## 2. Butifarra: reglas (engine)

- [x] 2.1 Definir `ConfigButifarra` (objetivo 51/101/151) con su validación, `EstadoButifarra`, `AccionButifarra`, `ResultadoManoButifarra` y `VistaButifarra`; implementar `crear` y el reparto de 12 cartas con rotación del repartidor
- [x] 2.2 Implementar la elección del triunfo (palo, butifarra, delegar) y los contros (contro, recontro, Sant Vicenç) con su orden de turno
- [x] 2.3 Implementar las bazas con obligaciones, la puntuación de la mano con multiplicador, el fin de partida, `vistaDe` (con las bazas jugadas) y `resultado`
- [x] 2.4 Tests de todos los escenarios de `specs/juego-butifarra` y la suite genérica del contrato; exportar desde `index.ts`

## 3. IA de la Butifarra (engine)

- [x] 3.1 Implementar `iaButifarraBasica`: valor de cada palo y de butifarra, delegar, contros por fuerza estimada y juego en pareja (cargar al compañero cuando su carta es la más alta que queda)
- [x] 3.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs y contra el azar
- [x] 3.3 Crear `reconstruir/butifarra.ts` con el reparto que respeta fallos y triunfos conocidos, y su `Simulable` (contros por la base); registrar la Butifarra en `IAS` y en las tablas de tests de niveles y reconstrucción
- [x] 3.4 Ajustar reconstrucciones y presupuesto hasta que el difícil gane a la normal en 200 partidas y decida en menos de 250 ms (prueba de fuerza)
- [x] 3.5 Añadir la Butifarra a `red.ts` y comprobar en los tests del servidor que se puede crear una sala de Butifarra

## 4. Cliente: Butifarra

- [x] 4.1 Registrar la Butifarra en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; añadirla al menú y a las opciones (objetivo), con todos los textos en español
- [x] 4.2 Crear `MesaButifarra.svelte` sobre `MesaBazas`: botones de elegir triunfo y delegar, de contros y paso, triunfo, quién eligió y multiplicador, avisos de las decisiones de los demás
- [x] 4.3 Crear `ResumenButifarra.svelte` con los puntos de cada bando, lo anotado y los totales, que pausa hasta «Siguiente mano», relativo al asiento propio; los puntos de los bandos en la pantalla de fin
- [x] 4.4 Escribir la guía «¿Cómo se juega a la Butifarra?» con un ejemplo de puntuación

## 5. Verificación

- [x] 5.1 E2E: partida contra la IA eligiendo triunfo, delegando y diciendo contro, hasta el resumen de la mano y la siguiente mano
- [x] 5.2 E2E: mesa en 360 × 640 sin scroll horizontal, retomar una partida guardada y la Butifarra en el recorrido de las guías
- [x] 5.3 E2E: crear una sala de Butifarra en red con dos navegadores y jugar una baza
- [x] 5.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
