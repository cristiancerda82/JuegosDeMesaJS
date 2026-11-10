## 1. Velocidad de las jugadas

- [x] 1.1 Preferencia `juegos-de-mesa/velocidad` (`rapida | normal | pausada`, Normal por defecto, lectura y escritura con try) y factor ×1, ×2 o ×3 multiplicado por `FACTOR_PAUSAS`, con test unitario.
- [x] 1.2 Aplicar el factor a `PAUSA_IA_MS` y a `pausaTras` en `sesion.svelte.ts` y en la cola de `sesion-red.svelte.ts`, sin tocar `simultaneo.esperaIA` (Burro). El cambio vale desde la jugada siguiente.
- [x] 1.3 Opción «Velocidad de las jugadas» en el menú, junto a dorso y diseño, con sus textos en `textos.ts`.
- [x] 1.4 Retención de la baza en Pausada: predicado `bazaTerminada` en `DefJuego` (por defecto, el de `pausaBazas`) y `seguir()` en las sesiones local y de red, que se dispara al tocar el tapete o con el botón «Seguir».
- [x] 1.5 E2e: la Brisca con Normal espera más que con Rápida (sin `?rapido`, midiendo la pausa), la baza retenida en Pausada hasta tocar, y la velocidad recordada tras recargar.

## 2. Mesa: última jugada, última baza y vuelta visible

- [x] 2.1 `Tapete`: marcar la última carta jugada de la baza con el nombre de quien la jugó, hasta la siguiente.
- [x] 2.2 `MesaBazas`: botón «Última baza» cuando la vista trae `ultimaBaza` y la baza en curso está vacía, con un diálogo que muestra cartas, autores y ganador sin cambiar el estado. Las mesas que ya la enseñan siguen igual.
- [x] 2.3 Motor: `vuelta: { asiento, cartas }[]` pública en las vistas del Culo y del Big Two, vaciada al cerrar la vuelta, con tests (se vacía al pasar todos y al limpiar, y la reconstrucción de la IA difícil sigue siendo coherente).
- [x] 2.4 Mesas del Culo y del Big Two: la vuelta en escalera con el autor de cada jugada y la última delante, legible a 360 × 640.
- [x] 2.5 E2e de legibilidad: con `elementFromPoint`, el índice de cada carta jugada no queda tapado en el Julepe con 6, en una mesa de bazas con 5, en el Culo y en el Big Two.
- [x] 2.6 Revisión a mano de las mesas que no usan `MesaBazas` (Escoba, Scopa, Casino, Cuarenta, Pishti, Durak, Ocho loco, Cinquillo, Sevens, Mentiroso, Kings in the Corner, Spite and Malice, Cribbage, Hold'em…): anotar qué cartas de la vuelta no se ven y corregirlo aquí.
  - Revisado: en el Cribbage cada carta de la serie deja a la vista el 55 % de la anterior, y en el Durak la defensa se aparta de su ataque, así que se leen todas. En la Escoba, la Scopa, el Casino, el Cuarenta, el Cinquillo, el Sevens, Kings in the Corner y Spite and Malice todas las cartas de la mesa están a la vista. En el Ocho loco y el Pishti solo cuenta la carta de arriba del montón, y en el Mentiroso las cartas van boca abajo.
  - Corregido además el tapete común de bazas: con 4 a 6 jugadores las cartas se tapaban el índice según el orden de juego (lo detectó el e2e de 2.5). Ahora no se tocan.
- [x] 2.7 Marcar la última jugada con su autor en las mesas propias revisadas en 2.6 que tienen pila de mesa (Culo, Big Two, Ocho loco, Durak, Cribbage…).
  - El Culo y el Big Two ya decían de quién es la jugada de la mesa, y el Durak y el Cribbage lo anuncian en su aviso. Faltaba en el Ocho loco, que ahora pone «De …» sobre el descarte.

## 3. Núcleo del asistente en el motor

- [x] 3.1 `engine/src/ia/asistente/`: tipos `Motivo { codigo, datos }`, `sugerir(agente, vista, legales, azar)` y extracción recursiva de las `IdCarta` de una acción, con tests (siempre legal, misma vista y mismo azar dan la misma sugerencia, y no consume el azar de los rivales).
  - Hecho en `engine/src/ia/asistente/` (`sugerir`, `asistir`, `cartasDeAccion`). La sugerencia sale del mismo análisis que la IA difícil (`analizar` en `ia/niveles.ts`), así que es idéntica a su decisión.
- [x] 3.2 Explicador de bazas y adaptador común sobre `motor/bazas.ts`: motivos gana con puntos, gana sin triunfo, entrega la de menos valor, asiste obligado, guarda el triunfo, se escapa de la baza o de la carta penalizada, y el genérico. Tests con escenarios de la Brisca, el Tute y los Corazones.
  - El explicador de bazas es común a todos los juegos de bazas: simula, con las cartas ocultas reconstruidas, solo hasta que se cierra la baza en curso, y mide si es del jugador o de su pareja, sus puntos y los que se entregan. La baza se cierra cuando la mesa vuelve a quedar vacía, y el ganador sale de `ultimaBaza` o de la última de `bazas`. El adaptador por juego se reduce al contexto del cliente (parejas fijas, y evitar bazas según la familia o, en el Barbu y el Rentz, según el contrato). Tests con escenarios de la Brisca, y del Tute y los Corazones en partidas reales.
- [x] 3.3 `comentar` para bazas: puntos regalados, baza perdida que se podía ganar y triunfo gastado sin necesidad, con umbral. Tests: el escenario de la spec (3 de oros frente a 4 de copas) y una jugada distinta sin coste que no se comenta.
- [x] 3.4 Explicador y comentario de captura (Escoba, Scopa, Casino, Cuarenta, Pishti, Pesca): escoba, 7 de oros, la captura más valiosa, no dejar escoba a tiro. Con tests.
  - Escoba, Scopa y Cuarenta (la recogida va en la acción): escoba, 7 de oros, cuántas cartas recoge, y el comentario de la escoba perdida o de recoger menos. El Casino, el Pishti y la Pesca se explican con lo que simuló la IA difícil (ver 3.5). «No dejar escoba a tiro» queda incluido en ese motivo simulado, sin un motivo propio.
- [x] 3.5 Explicador y comentario de combinaciones y descarte (Chinchón, Gin Rummy, Remigio, Canasta, Rummy 500, Conquián, Pinacle, Ocho loco, Cinquillo, Sevens, Burro, Spite and Malice, Kings in the Corner, Mentiroso): completa combinación, carta suelta de más puntos, robar del descarte, cerrar, combinación rota. Con tests.
  - Común a combinaciones, descarte y envite: el motivo `mejor-simulada` dice en cuántos de los repartos posibles de las cartas ocultas que probó la IA difícil la jugada salió mejor (o igual) que las demás, y el comentario `peor-simulada` dice en cuántos salió peor la del jugador. La frase nombra además la acción y su carta (robar del descarte, descartar, cerrar…). No hay motivos propios de cada juego, como «completa una combinación».
- [x] 3.6 Explicador de envite (Mus, Truco, Truc, Hold'em, Blackjack, Siete y media, Treinta y uno, Bourré, Culo, Big Two, Durak, Cribbage): fuerza de la mano, plantarse o pedir, envidar o retirarse. Con tests.
  - Igual que 3.5: tipo de la acción más lo que simuló la IA difícil. En el Mus, el Burro, el Mentiroso y el Hold'em, cuya IA difícil no simula partidas, solo se nombra la acción.
- [x] 3.7 Adaptador de cada uno de los 67 juegos con IA conectado a su familia, y un test de contrato que recorre todos los juegos con partidas aleatorias y comprueba que `sugerir` da una acción legal y `explicar` da un código conocido.
  - `client/src/asistente/contexto.ts` y su test de contrato, que recorre los 67 juegos.
- [x] 3.8 Medir lo que tarda la sugerencia (IA difícil) en cada juego. Si alguno pasa de 1 s en la referencia de móvil, usar la IA normal para su sugerencia y anotarlo en el design.
  - Medido con el test de contrato, con la máquina libre: la decisión más lenta es la del Gin Rummy (218 ms), seguida del Oh Hell (195 ms), el Chinchón (190 ms) y el Tarot (184 ms). Ningún juego necesita pasar a la IA normal.

## 4. Asistente en el cliente

- [x] 4.1 Preferencia por juego `juegos-de-mesa/asistido/<id>`, interruptor «Modo asistido» en `Opciones.svelte` solo para los juegos con IA, y campo `asistido` en la partida guardada (sin él se retoma desactivado).
- [x] 4.2 La sesión local calcula la sugerencia de forma asíncrona y cancelable cuando le toca al humano, con el azar `${semilla}/asistente/${jugadas.length}`, y no la calcula en red.
- [x] 4.3 Componente `Asistente.svelte` común: frase de sugerencia («Pensando una sugerencia…» mientras se calcula), resalte de cartas con `[data-carta]` y de botones con `[data-accion]`, interruptor en la mesa, comentario que se cierra solo o al tocarlo, y consejo de fase que se puede cerrar.
- [x] 4.4 Añadir `data-accion="<tipo>"` a los botones de acción de las mesas de los 67 juegos.
  - Hecho con dos pasadas automáticas: 132 botones con `data-accion` y, los que juegan una acción guardada en una variable, también con `data-jugada` (el resalte prefiere el botón exacto). Los botones que construyen la acción al pulsar (por ejemplo, «Descartar» del Chinchón) no llevan atributo; ahí se resalta la carta de la acción.
- [x] 4.5 Textos de los motivos, de los nombres de las acciones (con los nombres propios de cada juego) y de los comentarios en `T.asistente`.
  - En `client/src/asistente/textos.ts`, aparte de `textos.ts` por su tamaño.
- [x] 4.6 Consejos de fase: `faseAsistente` en `DefJuego` (por defecto, `vista.fase` o `'juego'`), fases ya aconsejadas guardadas en la partida, consejos de familia y al menos el consejo `'juego'` de cada uno de los 67 juegos, con un test que lo comprueba.
  - Sin campo `faseAsistente` en `DefJuego`: la fase es `vista.fase` o `'juego'`, y las fases no comunes cuentan como la jugada principal (design, decisión 6).
- [x] 4.7 Integrar `Asistente` en `PantallaPartida` para todas las mesas con IA y comprobar que, desactivado, las capturas de referencia de las mesas no cambian.
  - El interruptor va en la cabecera y los avisos encima de la mesa solo con el modo activo. Las mesas descuentan su altura (`--alto-asistente`, 0 sin asistente), así que, desactivado, la mesa mide lo mismo que antes (comprobado midiendo la página). El consejo y el comentario flotan bajo la cabecera, por encima de los paneles de las mesas.

## 5. Verificación

- [x] 5.1 E2e del modo asistido:
  - Brisca: sugerencia resaltada con explicación, comentario de puntos regalados y jugada libre;
  - Siete y media: botón «Plantarse» resaltado;
  - Tute subastado: consejo de subasta una sola vez;
  - opción recordada, apagado en la mesa, y sin asistente en Klondike ni en red.
- [x] 5.2 Test de «Misma partida»: misma semilla y mismas jugadas, con asistente y sin él, dan las mismas jugadas de los rivales y el mismo resultado.
- [x] 5.3 Ejecución completa: `pnpm -r test`, `pnpm --filter @juegos/client check`, `pnpm lint`, `pnpm format:check`, `pnpm --filter @juegos/client test:e2e` y `openspec validate modo-asistido --strict`.
  - 1154 e2e pasan y 85 se saltan. El único fallo («Mentiroso en red», en móvil) pasó 5 de 5 veces al repetirlo, y ya había pasado en la batería anterior. Los tests de tiempo del motor que fallaron con la máquina cargada pasan al repetirlos solos.
- [x] 5.6 Revisión del usuario, primera ronda: el arrastre se quedaba pegado con el modo asistido y faltaba explicar las jugadas de los rivales.
  - Medido con Playwright y la CPU frenada ×4: el arrastre va a 60 fps con cualquier diseño de cartas, pero con el asistente aparecían tareas largas al llegar el turno. El asistente pasa a un Web Worker (design, decisión 2), y el comentario se calcula después de aplicar la jugada.
  - Lectura de las jugadas de los rivales (spec, «Lectura de las jugadas de los rivales»; design, decisión 11), con los 67 juegos en el test de contrato y un e2e en la Brisca que comprueba también que la página no se bloquea.
  - De paso: la carta arrastrada va en su propia capa (`will-change`) y el dibujo de las cartas no recibe eventos (`pointer-events: none`), para no comprobar sus miles de trazados en cada movimiento. Las frases nombran las cartas con copia de los juegos de dos barajas, no enseñan índices internos y concuerdan en número («1 punto»).
- [x] 5.7 Revisión del usuario, segunda ronda: las sugerencias «Te conviene» no decían por qué. Motivos nuevos para las bazas dudosas y la simulación sin mayoría, y razones por tipo de acción (design, decisión 12; spec, «Toda sugerencia dice por qué»). En la muestra de los 67 juegos, las sugerencias sin un hecho concreto bajan de 240 a 5 de 804, y esas 5 también dicen por qué.
- [ ] 5.4 Revisión del usuario en la web publicada (sugerencias y frases en varios juegos, la velocidad Normal y la vuelta del Culo y del Big Two) antes de archivar.
- [ ] 5.5 Al terminar, recordarle al usuario la prueba del servidor en Railway (change `red-publica-movil`, tarea 3.2).
