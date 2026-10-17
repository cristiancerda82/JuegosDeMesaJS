## Context

El Pinacle es el primer rummy de la suite en el que se bajan combinaciones durante la mano. El Chinchón solo combina al cerrar, y su motor calcula las combinaciones él mismo. El contrato pide que `accionesLegales` dé la lista **completa** de acciones, y `aplicar` valida contra ella. Con manos que pueden pasar de 40 cartas al llevarse el montón y 12 comodines, la lista de todas las combinaciones posibles de una vez es enorme.

La baraja doble tiene dos copias de cada carta. El Spider ya resuelve eso con identificadores `carta#copia`. La carta del comodín ya se dibuja en el cliente. `crearBaraja('francesa52')` no admite comodines, así que el Pinacle monta su propia baraja.

## Goals / Non-Goals

**Goals:**
- Reglas completas con todos los premios clásicos, para 2 jugadores o 4 por parejas.
- Acciones pequeñas, que mantengan la lista de legales acotada, y una ayuda pura que traduzca «estas cartas a esta combinación» a una secuencia de acciones, para la mesa y para la IA.
- IA en los tres niveles, y una mesa usable en 360 × 640 con manos grandes.

**Non-Goals:**
- Variantes de 3 jugadores o de 4 sin parejas, el premio por cortar, el «¡Pumba!» y otros objetivos de puntos.
- Deshacer jugadas dentro del turno, salvo lo que obliga el barbelé.

## Decisions

### 1. Cartas (`juegos/pinacle.ts`)
`CartaPinacle = \`${IdCarta}#${0 | 1}\``. Los cuatro comodines son `comodin-1#0`, `comodin-1#1`, `comodin-2#0` y `comodin-2#1`.

Los doses (`<palo>-2#c`) son comodines con palo, que importa para las escaleras completas. Las dos copias de una carta son intercambiables, así que al enumerar acciones se usa siempre la primera copia que esté en la mano. Los cuatro comodines también se tratan como uno solo.

### 2. Estado
`ConfigPinacle { jugadores: 2 | 4 }`.

`EstadoPinacle` guarda:
- `config`, `azar`, `numeroMano`, `repartidor`, `turno` y `fase: 'robar' | 'bajar'`;
- `manos: CartaPinacle[][]`, `mazo`, `monton`, y `conocidas: CartaPinacle[][]` (las que cada uno se llevó del montón y siguen en su mano);
- `combinaciones: Combinacion[]`, cada una con su bando y su número de orden;
- `debeBajar: CartaPinacle | null`, la carta de arriba del montón que se llevó y aún no ha bajado;
- `puntos: number[]` por bando, y `barbele: boolean[]`, fijado al empezar la mano;
- `abierto: boolean[]`, si el bando ya ha bajado en la mano;
- `turnoActual`, con lo que hace falta para el barbelé y los premios por cerrar: las combinaciones creadas, las cartas bajadas, si se usó algún comodín y si el jugador había bajado antes en la mano;
- `cambios`, los comodines cambiados con su premio;
- `ultimaMano: ResultadoManoPinacle | null` e `historialManos`.

`Combinacion` puede ser:
- **Grupo:** `{ tipo: 'grupo', numero, cartas, cambiados, turnos }`, donde `turnos` es el número de turnos distintos en que recibió cartas, para el Pinacle de golpe.
- **Escalera:** `{ tipo: 'escalera', palo, desde, puestos }`, donde `puestos[i]` es la carta que ocupa el valor `desde + i`, y el As cuenta como 14.

### 3. Acciones pequeñas
- `robar { desde: 'mazo' }` y `robar { desde: 'monton' }`. La segunda solo es legal si la carta de arriba del montón cabe en alguna combinación de 3 que se pueda formar con la mano, o se puede añadir a una combinación del bando.
- `bajar { combinacion }` con **exactamente 3 cartas**: un grupo `{ tipo: 'grupo', cartas }` o una escalera `{ tipo: 'escalera', palo, desde, puestos }`. Las combinaciones de 3 se generan por construcción, no probando todas las ternas:
  - **Grupos:** por número, se eligen los palos de las naturales y la clase de comodín (comodín o un dos de cada palo).
  - **Escaleras:** por palo, cada ventana de 3 puestos, con cada puesto ocupado por su natural o por una clase de comodín.
  - Con la regla de las 2 naturales, la lista queda en unos cientos de acciones como mucho.
- `añadir { combinacion, carta, puesto? }`: pone una carta en una combinación del bando. En una escalera, `puesto` es el valor que ocupa: el de la carta natural, o un extremo libre si es un comodín.
- `cambiar { combinacion, carta, extremo? }`: el cambio de comodín de la spec.
- `descartar { carta }`. Solo es legal si `debeBajar` es `null`.

Una combinación de más de 3 cartas se baja como un `bajar` seguido de varios `añadir`, todo en el mismo turno. Así cuentan igual el Pinacle de golpe, el barbelé y los premios por cerrar.

**Alternativa descartada:** acciones `bajar` con cualquier número de cartas. Obligaría a enumerar todos los subconjuntos válidos de la mano, que con 40 cartas y comodines no cabe.

### 4. Ayuda para bajar (`juegos/pinacle-plan.ts`)
`planesParaBajar(vista, cartas, destino?)` busca las secuencias de acciones legales que dejan esas cartas formando una combinación nueva, o añadidas a `destino`. Es una búsqueda acotada:
- se elige un `bajar` de 3 cartas de la selección;
- se van añadiendo las demás con `añadir`;
- dos planes que dejan la misma combinación final se juntan.

La mesa la usa para activar «Bajar» y para preguntar el puesto de un comodín cuando hay varios planes. Después envía las acciones una a una. La IA la usa para bajar combinaciones largas.

### 5. Cierre, barbelé y fin de mano
- **Al bajar o añadir:** si la mano del jugador queda vacía, cierra.
- **Al descartar:**
  - si el bando está barbelé, no ha abierto y la bajada del turno no llega a 70, se deshace esa bajada: sus combinaciones (que son todas las del bando, porque no había abierto) vuelven a la mano y el bando pierde 50;
  - si la mano queda vacía, cierra; si el mazo está vacío, termina la mano sin cierre; si no, pasa el turno.
- **Al terminar la mano**, `pinacle-puntos.ts` calcula el desglose de cada bando (combinaciones, premios, resta de manos y barbelé), y se suma a `puntos`. Si algún bando llega a 1500, termina la partida; si no, se reparte de nuevo.

### 6. Puntos (`juegos/pinacle-puntos.ts`)
`valorCombinacion(c)` aplica la lista de premios en el orden de la spec. `puntuarMano(estado)` devuelve un `DesglosePinacle` por bando, que el cliente muestra tal cual en el resumen de la mano.

### 7. Vista
La vista muestra:
- `miMano` y `cartasEnMano` de todos;
- `conocidas`, `monton` entero, `cartasEnMazo` y `combinaciones`;
- `debeBajar`, si es mío;
- `puntos`, `barbele`, `abierto`, `turno`, `fase`, `ultimaMano` y la bajada del turno en curso.

Todo lo que se ve es público salvo `miMano`.

### 8. IA básica (`ia/pinacle-basica.ts`)
- **Robar:** se lleva el montón si puede bajar la carta de arriba y el montón tiene al menos dos cartas que forman o completan combinaciones con su mano o con las de su bando. Si no, roba del mazo.
- **Bajar:** busca en su mano, con `planesParaBajar`, las combinaciones posibles: primero escaleras y grupos sin comodines, luego con el mínimo de comodines. Antes de eso, añade cartas a las del bando y hace los cambios de comodín. Ejecuta el plan acción a acción, recalculándolo en cada decisión con la vista, para no guardar estado. Si está barbelé y no ha abierto, solo empieza si el plan completo llega a 70.
- **Descartar:** puntúa cada carta según cuánto le sirve (parejas, casi escaleras, comodín), cuánto le resta si se queda en la mano, y si el rival puede añadirla a sus combinaciones o llevarse el montón con ella. Descarta la de menor utilidad.

Fácil: `conErrores(iaPinacleBasica, 0.3)`.

### 9. Difícil (`ia/reconstruir/pinacle.ts`)
**Reconstrucción:** las cartas que no ve el asiento son las 108 menos su mano, las combinaciones, el montón y las conocidas de los rivales. Se reparten al azar entre las manos de los rivales, conservando sus conocidas y su número de cartas, y el mazo.

**Qué se simula:** `porSimulacion` gana un gancho opcional en `Simulable`, `candidatas(vista, acciones, accionBase)`, que dice qué acciones se simulan. Para el Pinacle:
- en la fase `robar`, las dos formas de robar;
- en la fase `bajar`, si la normal descartaría, todas las acciones de descartar (sin repetir cartas iguales);
- en el resto de casos, solo la de la normal, así que no se simula.

El cambio en `niveles.ts` es compatible: sin el gancho se simulan todas las acciones, como hasta ahora.

**Horizonte y valoración:** horizonte limitado, como en el Chinchón. Se valora la diferencia entre los dos bandos de (combinaciones bajadas − cartas en mano), más el desglose completo si la mano termina dentro del horizonte.

Valores ajustados con la prueba de fuerza y el límite de 250 ms: 6 reconstrucciones, presupuesto 18, horizonte 12, los 3 mejores descartes de la normal, y sin simular con un montón de 10 cartas o más o una mano de más de 18 (en la simulación, quien se lleva el montón acaba con muchas cartas y cada jugada cuesta varias veces más). Con eso gana a la normal en 200 partidas y su decisión más lenta queda por debajo de 250 ms.

### 10. Cliente
- **`MesaPinacle.svelte`:**
  - Rivales arriba (y a los lados en la partida de 4), con su número de cartas y sus conocidas. Mazo y montón en el centro. Combinaciones de cada bando en dos zonas con scroll vertical propio.
  - Mano abajo, en dos filas solapadas que se ajustan al ancho, con un botón para ordenarla por palos o por números.
  - El montón abre un panel con todas sus cartas.
- **Selección:** se tocan cartas de la mano, y los botones «Bajar» y «Descartar» se activan según `planesParaBajar` y las acciones legales. Tocar una combinación del bando añade la selección a ella. El puesto de un comodín se pregunta con un pequeño menú.
- **Resumen de la mano:** un panel con el desglose de `ultimaMano`, que pausa la sesión hasta «Siguiente mano», como en el Chinchón.
- **Registro:** opciones de jugadores, IA por nivel en `juegos.ts`, textos, guía y fin con los puntos de los bandos.

## Risks / Trade-offs

- **[Cada combinación larga son varias acciones]** → La IA y la mesa usan `planesParaBajar`. En la mesa, el jugador hace un gesto y las acciones salen solas, con una animación corta.
- **[`accionesLegales` caro con manos grandes]** → Generación por construcción y deduplicado de copias, con un test de tiempo con manos de 50 cartas: menos de 5 ms.
- **[Interpretaciones de reglas]** → Están listadas en la proposal y la spec para que el usuario las valide antes de aplicar.
- **[Difícil que no gane a la normal]** → La regla conservadora de `porSimulacion` lo protege de empeorar. Si aun así no gana, se ajusta qué simula o se pregunta, como se hizo con el Mus.
- **[Partidas largas a 1500]** → Los tests de partidas completas usan menos partidas y un tope de pasos alto. La pantalla guarda y retoma la partida como el resto.
