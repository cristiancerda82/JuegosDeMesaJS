## 1. Sobrefallo libre (Tute, Guiñote y Butifarra)

- [x] 1.1 Añadir `sobrefalloLibre?: boolean` a `OpcionesObligadas` y su rama a `cartasObligadas` en `motor/bazas.ts`. Tests en `bazas.test.ts`: con la opción y sin ella, la ganadora es triunfo o no, y es del compañero o no.
- [x] 1.2 Añadir el campo opcional a `ConfigTute`, `ConfigGuinote` y `ConfigButifarra`: validación en `crear`, configuración limpia y paso a `cartasObligadas`. Tests de cada juego con los escenarios de la spec.

## 2. Premios de la Escoba

- [x] 2.1 Añadir `premios?: boolean` a `ConfigEscoba`, el parámetro de premios en `puntuarMano` y los tipos `number` en `PuntosBando`. Tests con los 10 oros, con los 4 sietes y sin la opción.

## 3. Chinchón ampliado

- [x] 3.1 Escribir `combinacionChinchon(cartas, baraja)` en `chinchon-combinaciones.ts`, con tests de grupos, escaleras y comodines.
- [x] 3.2 Colocar las sueltas: añadir `colocarSueltas?: boolean` a la configuración, colocar en `cerrarMano` en orden de turno y añadir `colocadas` en `ManoDestapada`. Tests con los escenarios de la spec, el cierre con todo ligado y la opción desactivada.
- [x] 3.3 Reenganche: añadir `reenganche?: boolean` a la configuración, `reenganchados` al estado y `reenganchesTras` al resultado. Tests: reengancharse, la segunda vez, todos pasan del límite y la opción desactivada.

## 4. Cartas especiales del Ocho loco

- [x] 4.1 Añadir `cartasEspeciales?: boolean` a la configuración y `sentido`, `castigo` y `trasNueve` al estado y a la vista. Hacer el siguiente asiento con sentido, y las acciones y transiciones del 10, el As, el 6, el 7 y el 9. Tests con los escenarios de la spec, el mazo agotado al robar por castigo y la carta inicial sin efecto.
- [x] 4.2 Revisar la IA básica y la experta, y la simulación de la difícil (`SIMULABLE_OCHO_LOCO`), con la opción activa. Test de partidas completas con cada nivel, que siempre tengan acción legal.

## 5. Cliente

- [x] 5.1 Opciones: las casillas nuevas en `Opciones.svelte` (Tute, Guiñote, Butifarra, Escoba, Chinchón y Ocho loco) y sus textos en `textos.ts`.
- [x] 5.2 Guía: una línea de variante en las guías de los seis juegos, que diga en qué opción se activa.
- [x] 5.3 Mesa del Ocho loco: el sentido del juego y el aviso de la obligación pendiente; «roba 2» en lo último de cada jugador.
- [x] 5.4 Resultado del Chinchón: las cartas colocadas y quién se reengancha. Desglose de la Escoba con los premios.
- [x] 5.5 Modo asistido: la frase sobre las cartas especiales en el consejo del Ocho loco cuando están activas.
- [x] 5.6 E2E: activar las cartas especiales del Ocho loco y ver la obligación en la mesa, y activar las opciones del Chinchón y ver la línea de la guía.

## 6. Verificación

- [x] 6.1 `pnpm -r test`, `pnpm --filter @juegos/client check`, `pnpm lint`, `pnpm format:check`, el E2E de los juegos tocados y `openspec validate reglas-variantes-libros --strict`.
