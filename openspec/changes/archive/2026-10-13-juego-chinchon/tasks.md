## 1. Comodines (engine y cliente)

- [x] 1.1 Añadir los comodines a `baraja/cartas.ts` (`IdCarta`, `COMODINES`, `esComodin`, baraja española con comodines), con tests de composición e identidad, y comprobar que los juegos existentes no cambian
- [x] 1.2 Dibujar el comodín en el componente `Carta`, con su nombre accesible, y añadirlo al muestrario

## 2. Chinchón: reglas (engine)

- [x] 2.1 Definir `ConfigChinchon` con valores por defecto y validación, `EstadoChinchon`, `AccionChinchon`, `VistaChinchon` y el valor de cada carta
- [x] 2.2 Implementar la generación de combinaciones candidatas (escaleras según la baraja, grupos y como mucho un comodín) y `mejorReparto` con búsqueda exacta, con tests de agrupación óptima, del 7 con la sota y de los comodines
- [x] 2.3 Implementar `crear` y el reparto de cada mano entre los activos, con la primera carta del descarte y la salida del siguiente al repartidor
- [x] 2.4 Implementar las fases del turno: robar (del mazo, con rebarajado del descarte, o del descarte), descartar sin devolver la robada del descarte, y el avance del turno saltando a los eliminados
- [x] 2.5 Implementar cerrar (con el máximo configurado), el chinchón, la puntuación de la mano con las manos destapadas, la eliminación y el fin de la partida
- [x] 2.6 Implementar `vistaDe` (con `ultimaAccion` sin revelar las cartas robadas del mazo) y `resultado`
- [x] 2.7 Tests de todos los escenarios de `specs/juego-chinchon` y la suite genérica del contrato; exportar el Chinchón desde `index.ts`

## 3. IA del Chinchón (engine)

- [x] 3.1 Implementar la IA básica: robar del descarte solo si mejora, descartar lo que menos sirve y cerrar siempre que pueda
- [x] 3.2 Tests de los escenarios "Roba del descarte cuando le sirve", "Descarta lo que menos sirve" y "Cierra cuando puede", reproducibilidad y tiempo de decisión por debajo de 500 ms
- [x] 3.3 Simulación de 1.000 partidas de Chinchón entre IAs (de 2 a 4 jugadores, distintas variantes) sin acciones ilegales
- [x] 3.4 Test de la IA básica contra el agente aleatorio en 1.000 partidas de 2 jugadores (gana claramente más de la mitad)

## 4. Cliente: registro y opciones

- [x] 4.1 Registrar el Chinchón en `juegos.ts` (definición, IA y pausa tras cada acción de los rivales), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 4.2 Añadir el Chinchón al menú y sus opciones (jugadores, baraja, comodines, límite, máximo para cerrar), con todos los textos en español
- [x] 4.3 Añadir a `Interaccion` el gancho opcional `alTocar` y a `ManoPropia` la marca de combinación por carta, sin cambiar las mesas existentes

## 5. Cliente: mesa del Chinchón

- [x] 5.1 Crear `MesaChinchon.svelte` con los rivales (puntos o eliminado), el mazo, el descarte y la mano propia, indicando la fase y el turno
- [x] 5.2 Implementar robar (tocar o arrastrar desde el mazo o el descarte) y descartar o cerrar (arrastrar al descarte, doble toque, o elegir y pulsar "Descartar" o "Cerrar")
- [x] 5.3 Marcar las combinaciones de la mano y sus puntos sueltos, y el selector para ordenar por combinaciones, palo o valor
- [x] 5.4 Anunciar las acciones de los rivales (de dónde roban y qué descartan)
- [x] 5.5 Mostrar el panel de fin de mano (quién cerró, manos destapadas y agrupadas, puntos de la mano y acumulados, eliminados), pausando la sesión hasta "Siguiente mano", y la clasificación en la pantalla de fin
- [x] 5.6 Escribir la guía "¿Cómo se juega al Chinchón?" con ejemplos de una escalera, un trío con comodín y el cierre

## 6. Verificación

- [x] 6.1 E2E: partida de Chinchón completa contra la IA con 2 jugadores y con 4 (cerrando el panel de cada mano)
- [x] 6.2 E2E: robar del descarte, descartar arrastrando y cerrar desde la mesa (con una semilla en la que se pueda cerrar)
- [x] 6.3 E2E: la mesa del Chinchón en 360 × 640 sin scroll horizontal, con las 8 cartas de la mano identificables
- [x] 6.4 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
