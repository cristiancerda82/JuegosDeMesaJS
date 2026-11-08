## Context

La motivación está en proposal.md y los requisitos en `specs/modo-asistido` y `specs/mesa-cliente`. Lo que ya existe y condiciona el diseño:

- **IAs:** cada juego con IA tiene tres agentes (`Agente<V, A>`, uno por nivel). Todos deciden con la vista de un asiento y su propio azar (`engine/src/ia/niveles.ts`). La IA difícil simula y tarda hasta 500 ms.
- **Pausas:**
  - `DefJuego.pausaTras(antes, despues)` (`client/src/sesion/juegos.ts`) fija la pausa de cada juego tras un cambio (por ejemplo, `PAUSA_BAZA_MS = 1100`);
  - `PAUSA_IA_MS = 750` (`sesion.svelte.ts`) es la espera antes de cada jugada de la IA;
  - `FACTOR_PAUSAS` (`?rapido`, 0,05) acorta todo en los e2e;
  - la sesión en red (`sesion-red.svelte.ts`) reproduce la cola de vistas con el mismo `pausaTras`.
- **Mesas:** 37 mesas usan `MesaBazas` y `Tapete`. El tapete dibuja la baza en curso desde `CartaJugada[]`. 71 vistas del motor ya publican `ultimaBaza`, aunque solo unas pocas mesas la enseñan.
- **Culo y Big Two:** pintan solo la jugada que hay que superar (`vista.mesa`). El Culo ya publica todas las jugadas de la mano (`jugadas`). El Big Two solo publica las cartas sueltas, sin autor.
- **Pistas de los solitarios:** el botón `BotonPista` resalta cartas con `[data-carta]` y pilas con `[data-testid]` mediante una clase temporal.
- **Familias del menú:** `menu/catalogo.ts` clasifica los juegos en bazas de puntos, bazas de contrato, bazas a evitar, combinaciones, captura, descarte y envite.

## Goals / Non-Goals

**Goals:**
- Una sola pieza común (sugerencia, comentario y consejo) que sirva a los 67 juegos sin tocar sus reglas.
- Que las explicaciones sean verificables con tests unitarios en el motor, sin DOM.
- Que el ritmo dependa de un único factor, que se suma al de `?rapido` sin romper los e2e.

**Non-Goals:**
- Un tutorial guiado con partidas preparadas o pasos obligatorios.
- Una IA nueva que «enseñe» mejor: se usa la difícil de cada juego.
- Modo asistido en red.
- Cambiar las pausas propias del motor o del servidor.

## Decisions

### 1. La sugerencia es la decisión de la IA difícil sobre la vista del jugador
`asistir(dificil, ctx, vista, legales, azar)` (`engine/src/ia/asistente`) da la sugerencia, su explicación y lo que se simuló para elegirla. La sugerencia sale de `analizar`, en `ia/niveles.ts`: es el mismo código con el que decide la IA difícil (`porSimulacion` decide llamándolo y lo registra para su agente), así que con el mismo azar da exactamente su decisión. Para las IAs difíciles que no simulan (Mus, Burro, Mentiroso y Hold'em), `analizar` solo pide la decisión. Garantiza por construcción que la acción es legal, que no usa información oculta y que no hay que escribir una IA nueva en cada juego.

El azar sale de un generador propio del asistente, `crearAzar(`${semilla}/asistente/${jugadas.length}`)`, para no consumir el de los rivales. Así se cumple «Misma partida» y la sugerencia es reproducible.

*Alternativa descartada:* la IA normal. Es más rápida, pero en muchos juegos la difícil decide mejor, y eso es lo que se quiere enseñar.

### 2. La sugerencia se calcula fuera del render y se puede cancelar
La sesión calcula la sugerencia con un `setTimeout(0)` cuando el turno pasa al humano, y la descarta si la partida cambia antes de terminar. Hasta tenerla, la mesa muestra «Pensando una sugerencia…». El test de contrato mide en los 67 juegos la sugerencia, la explicación y el comentario juntos, y exige menos de 1 s. Como en los tests de la IA, el tiempo medido en el ordenador hace de referencia del móvil medio (tarea 3.8).

*Alternativa descartada:* un Web Worker. Habría que serializar agentes y vistas en los 67 juegos, y no compensa con ese margen. Si las medidas muestran que no cabe, el plan B es usar la IA normal para la sugerencia de ese juego.

### 3. Las explicaciones son motivos con código, calculados en el motor
`explicar` y `comentar` devuelven `{ codigo, datos }`, por ejemplo `{ codigo: 'gana-baza-puntos', datos: { carta: 'copas-1', puntos: 14, sinTriunfo: 1 } }`. El cliente lo convierte en una frase (`client/src/asistente/textos.ts`). Así el motor sigue sin textos, y los tests comprueban el código y los datos, no frases.

Los motivos los calculan **explicadores comunes**, sin un adaptador grande por juego:

| Situación | Cómo se mide | Motivos |
|---|---|---|
| Jugar una carta en una baza (todos los juegos de bazas) | Con las cartas ocultas reconstruidas 8 veces, se juega la carta y el resto de la baza con la IA normal hasta que la mesa vuelve a quedar vacía. El ganador sale de `ultimaBaza` o de la última de `bazas`, y los puntos, del campo de puntos que tenga la vista (`puntosBazas`, `puntosCartas`, `puntosMano` o `puntos`) | gana la baza con sus puntos, sin gastar triunfo si podía; no puede ganarla y entrega la que menos da; guarda la carta buena; en los juegos a evitar, se escapa de la baza o la gana sin castigo |
| Recoger cartas (Escoba, Scopa, Cuarenta: la recogida va en la acción) | Lo que nombra la acción frente a la mesa | escoba; 7 de oros; cuántas recoge; no recoge |
| Todo lo demás (combinaciones, descarte, envite, subastas…) | Lo que simuló la IA difícil al decidir: en cuántos de los repartos probados la jugada sale mejor o igual que las demás | «la he probado en N repartos de las cartas que no ves y sale mejor en K» (solo si K llega al 60 %), más el nombre de la acción y su detalle (carta, puja, palo…) |
| Única acción posible | — | «es tu única jugada posible» |

El único dato por juego es el contexto del cliente (`client/src/asistente/contexto.ts`): si las bazas se juegan por parejas fijas y si se quieren evitar (familia «bazas a evitar», o según el contrato en el Barbu y el Rentz).

Cuando no hay nada concreto que contar, el motivo es el genérico (`jugada` o `accion`: «Te conviene: …»). Ese fallo seguro cumple «no inventar un motivo».

*Alternativas descartadas:*
- Que cada agente devuelva su razón: habría que reescribir 67 × 3 agentes, y la difícil decide por simulación, sin una «razón» legible.
- Explicadores propios de cada juego de combinaciones y de envite («completa una escalera», «envida con 31»): cuestan una lógica por juego, y lo que simuló la IA difícil da un motivo cierto en todos.

### 4. El comentario solo compara costes concretos
`comentar` mide, con la misma vista de antes de jugar, lo que cuesta la acción hecha frente a la sugerida:
- en las bazas, con la misma medida de la baza: puntos regalados (2 o más), baza perdida que se ganaba, triunfo gastado cuando otra carta ganaba igual y, en los juegos a evitar, castigo que se podía evitar;
- al recoger: la escoba perdida o recoger 2 cartas menos o más;
- en lo demás, con lo que simuló la IA difícil: solo si la jugada hecha sale peor de media y en al menos el 70 % de los repartos.

Si no se cumple, devuelve `null`. Es intencionado que comente poco: el requisito prohíbe regañar.

### 5. El resalte se saca de la acción, sin mapeo por mesa
Del objeto de la acción se extraen, de forma recursiva, todos los valores que sean id de carta (`cartasDeAccion`). Se resaltan con `[data-carta]` o `[data-testid="mano-<carta>"]`, con la misma clase que la pista de los solitarios. Para el botón de la acción:
- los botones que juegan una acción guardada en una variable llevan `data-jugada={JSON.stringify(accion)}`, y se resalta el que coincide exactamente (por ejemplo, la puja de 2 entre varias pujas);
- si no lo hay, se resalta el botón con `data-accion="<tipo>"`.

Los dos atributos se añadieron a los botones de las mesas, que es el único cambio en cada una.

El nombre de la jugada en la frase sale de una tabla de tipos de acción, con una forma legible por defecto para los demás tipos («noQuiero» → «no quiero»), más su detalle.

### 6. Consejos de fase: clave de fase y textos por juego
La fase es `vista.fase` si existe y, si no, `'juego'`. Las fases que comparten muchos juegos (subasta, apuesta, triunfo, contrato, descarte, cambio, pase, robo, bajar…) tienen su consejo común. Cualquier otra fase cuenta como la jugada principal del juego (`'juego'`), que tiene un consejo propio en cada uno de los 67 juegos; un test lo comprueba. La sesión guarda en la partida las fases ya aconsejadas, y un consejo se marca como dado al enseñarlo, aunque no se cierre.

### 7. Velocidad: un único factor multiplicado por el de `?rapido`
La preferencia `juegos-de-mesa/velocidad` (`rapida | normal | pausada`) se traduce en un factor de ×1, ×2 o ×3. El factor efectivo es `factorVelocidad × FACTOR_PAUSAS`, y se aplica a `PAUSA_IA_MS` y al resultado de `pausaTras`, tanto en la sesión local como en la de red. Con `?rapido` los e2e siguen a 0,05 de la Rápida, más 0,1 o 0,15 de Normal y Pausada, que no se notan. `simultaneo.esperaIA` (Burro) no usa este factor.

La retención de la baza en Pausada usa un predicado opcional de `DefJuego`, `bazaTerminada(antes, despues)`. Por defecto es `bazaCerrada`, que reconoce las tres formas de las vistas: bazas contadas por asiento que suben, la lista de bazas que crece (Tarot, Doppelkopf), o la mesa que se vacía y deja una `ultimaBaza` (Corazones, Barbu…). Cuando se cumple, en lugar de programar el temporizador, la sesión espera a que se llame a `seguir()`. Lo disparan tocar el tapete o el botón «Seguir» del aviso del tapete, y en las mesas sin tapete un botón «Seguir» general.

### 8. Tapete: cartas sin solaparse, marca de la última jugada y última baza
Las cartas de la baza se colocan de forma que ninguna se toque, en filas o en rombo según el número de jugadores, y de 4 jugadores en adelante son al 75 %. Antes se solapaban, y según el orden de juego unas tapaban el índice de otras (lo encontró el e2e de la decisión 10). `Tapete` marca la última carta de un rival (borde y su nombre dentro de la parte de abajo de la carta, sin tapar ningún índice). `MesaBazas` añade el botón «Última baza» cuando la vista trae `ultimaBaza` y la baza en curso está vacía. Al pulsarlo, el tapete vuelve a enseñar esa baza con el nombre en cada carta y quién la ganó.

### 9. Vuelta visible en el Culo y el Big Two
El motor añade a las dos vistas una lista pública `vuelta: { asiento, cartas }[]`, con las jugadas desde la apertura de la vuelta, que se vacía al cerrarla. Es información pública que ya ha estado sobre la mesa, así que no rompe «no revelar información oculta». La mesa dibuja las jugadas anteriores encima de la que hay que superar, pequeñas, cada una con su autor y con cada carta dejando a la vista la mitad izquierda de la anterior (índice y palo).

### 10. Auditoría de las mesas
Hay un e2e de legibilidad que, en el Julepe de 5 y de 6 (con la baza retenida en Pausada) y en el Culo y el Big Two, comprueba que la esquina del índice de cada carta jugada no queda tapada por otra (con `elementFromPoint`). El resto de mesas se revisó a mano (tarea 2.6).

## Risks / Trade-offs

- [La IA difícil tarda demasiado en un móvil lento y la sugerencia llega tarde] → El cálculo es asíncrono y cancelable, y la mesa muestra «Pensando…». Si un juego pasa de 1 s en las medidas, se usa la IA normal para su sugerencia.
- [Una explicación dice algo falso en un caso raro] → Los motivos se calculan sobre hechos de la vista, no sobre intenciones. Hay tests con escenarios por familia, y el motivo genérico es la salida por defecto.
- [El volumen: 67 juegos con adaptador, consejos y `data-accion`] → Las tareas van por familias, con un adaptador mínimo que ya da el motivo genérico y los consejos de la familia. Un juego sin adaptador funciona igual, solo que con explicaciones genéricas.
- [La velocidad Normal hace las partidas más lentas para los jugadores rápidos] → Rápida mantiene el ritmo actual y se cambia desde el menú.
- [La retención de la baza en Pausada podría bloquear una partida en red si el jugador no toca] → En red cada cliente retiene solo su pantalla. Su cola de vistas se acumula, y el servidor no espera. Al tocar, la cola se reproduce con normalidad.

## Migration Plan

Sin migración de datos. Las partidas guardadas sin el campo `asistido` se retoman sin modo asistido. La preferencia de velocidad ausente vale Normal. Para volver atrás basta con revertir: las preferencias nuevas se ignoran.
