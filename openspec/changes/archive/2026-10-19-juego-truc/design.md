## Context

El Truc se juega con bazas, pero no tiene triunfo ni obligaciones. Su interés está en dos apuestas que se cruzan, el envit y el truc, y en que la mano puede acabar antes de tiempo (dos bazas, un «no vull» o un «me'n vaig»). De lo que ya existe reutiliza:
- `bandoDe` y `siguiente` de `motor/bazas.ts`, y el tipo `CartaJugada`;
- `MesaBazas` en el cliente (2 o 4 jugadores, parejas, snippets `info` y `acciones`, `nombre`/`detalle` por asiento);
- `conErrores`/`porSimulacion` con `decideLaBase` para las apuestas, como en el Mus y la Butifarra.

La jerarquía no es la de la Brisca, así que el Truc define su propia función de rango.

## Goals / Non-Goals

**Goals:**
- Truc valenciano completo sin flor, con 2 o 4 jugadores:
  - pardas;
  - envit con torne y falta, y envit primero;
  - truc hasta joc fora;
  - me'n vaig;
  - partida a una o dos cames de 12.
- IA en los tres niveles. La difícil gana a la normal en la prueba de fuerza.
- Jugable en local y en red, con su mesa, el resumen de cada mano y la guía.

**Non-Goals:**
- La flor, las señas y 6 jugadores.
- Una IA de apuestas por simulación (ver Decisión 4).

## Decisions

### 1. Rango y envit
- **`rangoTruc(carta)`:** devuelve 14 para el As de espadas, 13 para el As de bastos, y así hasta 1 para los cuatros. Las cartas del mismo puesto tienen el mismo rango.
- **`puntosEnvit(cartas)`:** recibe todas las cartas del jugador en la mano, las que tiene y las que ya jugó, porque el envit se apuesta con las tres.
  - Agrupa por palo y, si algún palo tiene 2 o más, vale 20 + las dos mayores (figuras a 0).
  - Si no, vale la mayor.

### 2. Estado
`EstadoTruc` guarda:
- **Partida:** `config` (`jugadores: 2 | 4`, `cames: 1 | 2`), `azar`, `repartidor` y `manos`.
- **Bazas:** `bazas: BazaTruc[]`, donde cada una es `{ cartas: CartaJugada[]; ganador: 0 | 1 | null }`, con el bando ganador o `null` si fue parda. También `mesa` (la baza en curso) y `turno` (el jugador al que le toca jugar carta).
- **Envit:** `envit: { nivel: 0 | 1 | 2 | 3; quien: Asiento | null; estado: 'nada' | 'pendiente' | 'querido' | 'noQuerido'; puntos: [number, number] | null; mostrado: (number | null)[]; ganador: 0 | 1 | null }`.
  - El nivel 1 es envit, el 2 torne y el 3 falta.
  - `mostrado[asiento]` es el valor del mejor de cada bando una vez querido.
- **Truc:** `truc: { nivel: 0 | 1 | 2 | 3 | 4; pendiente: boolean; quien: Asiento | null; puedeSubir: 0 | 1 | null }`.
  - El nivel 1 es truc, el 2 retruc, el 3 quatre val y el 4 joc fora.
  - `pendiente` marca que espera respuesta.
- **Respuesta:** `responde: Asiento | null` indica quién tiene que contestar ahora y `apuestaPendiente: 'envit' | 'truc' | null` sobre qué. Con `responde`, el turno de acción es ese asiento; si no, es `turno`.
- **Marcador:** `piedras: [number, number]` de la came en curso, `cames: [number, number]`, `resultadosManos` y `ultimaBaza`.

Acciones: `jugar{carta}`, `envidar`, `trucar`, `vull`, `noVull`, `torne`, `falta`, `subir` (retruc, quatre val o joc fora, según el nivel) y `meVoy`.

Transiciones:
- **Apuestas:**
  - `envidar` y `trucar` ponen `responde` en el primer rival tras el asiento.
  - Cuando se truca en la primera baza, el que responde puede envidar si se puede (envit primero). El truc queda pendiente con su `responde` y se apila el envit: cuando el envit se resuelve, `responde` vuelve al que tenía que contestar al truc.
  - `vull` al envit compara los puntos y rellena `mostrado`/`ganador`. `vull` al truc sube `nivel` y pone `puedeSubir` en el bando que aceptó.
  - `noVull` cierra el envit con el valor anterior, o cierra la mano por truc: gana el bando que apostó y cobra el nivel anterior.
- **Bazas:** al completar una baza se calcula `ganador`. `manoDecidida(bazas, mano)` aplica las reglas de las pardas y, si hay ganador, se cierra la mano.
- **Cierre de la mano:**
  1. se suma el envit (querido: valor del nivel, la falta calculada al quererla; no querido: el anterior);
  2. si con eso no cierra la came, se suma el truc (`[1, 2, 3, 4][nivel]`, o la came entera con joc fora);
  3. se registra el resultado y, si un bando gana la came, se reinician las piedras;
  4. si la partida no ha terminado, se reparte la mano siguiente.

### 3. IA básica (`ia/truc-basica.ts`)
- **Fuerza de la mano:** media del rango de sus cartas que quedan, más un bono por bazas ganadas. Por parejas, cuenta también lo que ya mostró el compañero.
- **Envit:**
  - envida con ≥ 30;
  - acepta con ≥ 27 (o ≥ 25 siendo mano);
  - torna con ≥ 31 y va a falta con 33.
- **Truc:** truca o sube si la fuerza supera un umbral que depende de la baza (más alto en la primera). Acepta si la fuerza supera el umbral de aceptar. Farolea con probabilidad 0,1 si va por detrás en bazas y le quedan cartas, usando su `Generador`.
- **Jugar:**
  - si sale, juega la carta media en la primera baza y la mejor si ya ganó una;
  - si responde, juega la carta más baja que gana y, si no puede ganar o la baza es de su compañero, la más baja.
- **Me'n vaig:** solo si no hay ninguna otra acción razonable. En la práctica no lo usa, porque «no vull» siempre está disponible al responder.

### 4. IA difícil (`ia/reconstruir/truc.ts`)
- **Reconstrucción:** reparte las cartas no vistas entre las manos ajenas. Si un jugador mostró su envit, se rechaza la muestra y se repite (hasta 200 intentos) hasta que sus cartas, junto con las que ya jugó, den ese valor. Con 3 cartas por mano se encuentra enseguida. Si no se encuentra, se busca por enumeración de las combinaciones de su tamaño, que siempre tienen solución porque el estado real la cumple.
- **`decideLaBase`:** cierto salvo cuando las acciones legales son solo cartas, o cartas y apuestas en su turno. En ese caso se simulan solo las acciones `jugar`, con `candidatas`, y la apuesta la decide la base.
- **`valorar`:** las piedras de la mano para su bando menos las del rival, más `bonoPartida`. Como cerrar una came pesa mucho, se suma también un bono si la mano la cierra.
- **Presupuesto:** con 3 cartas las simulaciones son baratas. Se empieza con 40 reconstrucciones y un presupuesto de 120, y se ajusta en la prueba de fuerza.

### 5. Cliente
- **`MesaTruc.svelte`** sobre `MesaBazas`:
  - **`info`:** «La mano vale N», el envit (pendiente, querido con sus puntos, o no querido), las bazas «Ganadas · Pardas» y el marcador de piedras y cames.
  - **`acciones`:** los botones según las acciones legales.
  - **`detalle` de cada asiento:** lo que mostró en el envit.
  - **Avisos** de lo que dicen los demás, calculados al comparar la vista anterior con la nueva, como en la Butifarra.
- **`ResumenTruc.svelte`:** el panel de fin de mano, que pausa la sesión hasta «Siguiente mano». La pantalla de fin muestra las cames.
- **Registro:**
  - `DEF_TRUC` con una pausa tras cada apuesta o respuesta de la IA y las de bazas;
  - `IdJuego`, `partida.ts`, opciones, textos, guía, `Fin.svelte`;
  - `SalaEspera` (parejas con 4);
  - `red.ts`.
- **Textos:** los términos del juego se dejan en valenciano, como se dicen en la mesa: envit, torne, falta, truc, retruc, quatre val, joc fora, vull, no vull, me'n vaig.

## Risks / Trade-offs

- **Pardas y fin anticipado de la mano:** es donde es más fácil equivocarse → tabla de tests con todas las combinaciones de ganador/parda en 3 bazas.
- **Envit primero con un truc pendiente:** el estado se complica → se guarda solo qué apuesta espera respuesta y quién respondía al truc, con tests del orden de respuesta.
- **La difícil puede ganar poco a la normal**, porque solo simula 3 cartas y lo que más pesa son las apuestas → si no supera la prueba de fuerza, se ajusta la valoración o se simula también la respuesta al truc cuando las manos ajenas están acotadas, y se actualiza la spec.
- **Variantes regionales** (valor de las figuras en el envit, pardas, cálculo de la falta) → se documentan para que las valide el usuario.
