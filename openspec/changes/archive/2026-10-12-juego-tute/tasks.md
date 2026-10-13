## 1. Módulo común de bazas (engine)

- [x] 1.1 Crear `motor/bazas.ts` con las tablas de orden y puntos, `paloDe`, `fuerza`, `puntosDe`, `cartaGanadora`, `cartaDeCambio`, `bandoDe` y `siguiente`, con sus tests unitarios
- [x] 1.2 Añadir a `bazas.ts` el robo en orden de turno desde el ganador (incluida la muestra como última carta) y `cartasObligadas` con y sin la opción de montar sobre el compañero; tests de todos los casos
- [x] 1.3 Refactorizar `juegos/brisca.ts` para usar el módulo común, reexportando sus funciones públicas; deben pasar sin cambios los tests de la Brisca, de su IA y de la suite del contrato
- [x] 1.4 Extraer de la IA de la Brisca la heurística compartida de bazas (coste de carta, ganar sin triunfo, no gastar triunfos altos, soltar la carta de menor valor) a `ia/bazas-heuristica.ts`; los tests de la IA de la Brisca siguen pasando

## 2. Tute: reglas (engine)

- [x] 2.1 Definir `ConfigTute` con valores por defecto y validación (2/4 jugadores, cambio del 7, montar sobre el compañero, número de manos), `EstadoTute`, `AccionTute` y `VistaTute`
- [x] 2.2 Implementar `crear`: reparto de 8 cartas con muestra para 2 jugadores, y de 10 con la carta de triunfo del repartidor para 4; sale el siguiente al repartidor
- [x] 2.3 Implementar jugar carta, resolver la baza, el robo con 2 jugadores y las obligaciones (siempre con 4, al agotarse el mazo con 2)
- [x] 2.4 Implementar los cantes (20/40, un cante por baza ganada, cada palo una vez) y cantar el tute, que cierra la mano
- [x] 2.5 Implementar el cambio del 7 (o el 2) con sus variantes, solo con 2 jugadores
- [x] 2.6 Implementar el cierre de la mano (bazas + cantes + 10 de últimas, empate) y la partida al mejor de N con el reparto alternado
- [x] 2.7 Implementar `vistaDe` (con la carta de triunfo pública con 4 jugadores) y `resultado`
- [x] 2.8 Tests de todos los escenarios de `specs/juego-tute` y la suite genérica del contrato con un oráculo de cartas ocultas que excluya la carta de triunfo pública; exportar el Tute desde `index.ts`

## 3. IA del Tute (engine)

- [x] 3.1 Implementar la IA básica del Tute: tute, cantes (40 antes que 20), cambio del 7, guardar las parejas cantables y la heurística compartida de bazas
- [x] 3.2 Tests de los escenarios "Canta lo que puede" y "Guarda la pareja", reproducibilidad y tiempo de decisión por debajo de 500 ms
- [x] 3.3 Simulación de 1.000 partidas de Tute entre IAs (2 y 4 jugadores, distintas variantes) sin acciones ilegales
- [x] 3.4 Test de la IA básica contra el agente aleatorio en 1.000 manos de Tute (gana claramente más de la mitad)

## 4. Cliente: mesa de bazas compartida

- [x] 4.1 Dividir `MesaBrisca.svelte` en `mesas/bazas/` (`AsientoRival`, `Tapete`, `ManoPropia`, `MazoYMuestra`) y recomponer la mesa de la Brisca con ellas, sin cambios visibles; pasan los E2E de la Brisca
- [x] 4.2 Hacer que `ManoPropia` solape las cartas según el ancho disponible, dejando a la vista el índice de cada carta y levantando la elegida
- [x] 4.3 Añadir a `Sesion` los métodos `pausar()` y `reanudar()` de los turnos de la IA, y usarlos al abrir y cerrar la guía durante la partida

## 5. Cliente: Tute

- [x] 5.1 Registrar el Tute en `juegos.ts` (definición, IA, pausas de baza y de cante), en `IdJuego`, en el guardado y en `partida.ts`
- [x] 5.2 Añadir el Tute al menú y sus opciones (jugadores, cambio del 7, montar sobre el compañero, manos), con todos los textos en español
- [x] 5.3 Crear `MesaTute.svelte` con las piezas compartidas: carta de triunfo o muestra, mazo, baza en curso, turno, bazas y lista de cantes
- [x] 5.4 Añadir los controles para cantar, cantar el tute y cambiar el 7, y el aviso de cada cante (propio o de la IA) con el rey y el caballo
- [x] 5.5 Mostrar el resultado del Tute en la pantalla de fin: puntos por bando con los cantes y los 10 de últimas, o el tute que cerró la mano
- [x] 5.6 Escribir la guía "¿Cómo se juega al Tute?" con ejemplos de cartas para los puntos y para un cante

## 6. Verificación

- [x] 6.1 E2E: partida de Tute completa contra la IA con 2 jugadores y con 4 en parejas
- [x] 6.2 E2E: cantar desde la mesa (con una semilla en la que el jugador pueda cantar) y aviso de un cante de la IA
- [x] 6.3 E2E: 10 cartas en 360 × 640 sin scroll horizontal y con cada índice a la vista
- [x] 6.4 E2E: abrir la guía durante la partida pausa la IA y al cerrarla la partida sigue en el mismo punto
- [x] 6.5 Ejecutar todos los tests (motor y E2E), el lint, el formato y `openspec validate --strict`
