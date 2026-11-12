## Context

El Twenty-Nine es un juego de bazas por parejas con subasta numérica, como el Tute subastado, pero con dos rasgos propios:
- el triunfo se elige en secreto y no cuenta hasta que alguien lo pide;
- se reparte en dos tandas, y entre ellas se puja, se elige el triunfo y se dobla.

Se reaprovechan:
- la mesa de bazas compartida (`MesaBazas`) para 4 por parejas, como la Sueca;
- la subasta por botones del Tute subastado;
- la reconstrucción con `repartirConPermitidos` y los fallos;
- el registro del menú por familias y del modo asistido, que funcionan con cualquier juego con IA.

## Goals / Non-Goals

**Goals:**
- Twenty-Nine para 4 por parejas a 6 puntos de juego, con la pareja, doblar y redoblar y sin triunfo, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El punto de la última baza, el «single hand» y apartar la carta del triunfo.

## Decisions

### 1. Cartas (`juegos/twenty-nine.ts`)
- **Baraja:** `crearBaraja('francesa52')` filtrada del 7 al As (32 cartas).
- **Rango:** `rangoTwentyNine(c)`: J 8, 9 7, As 6, 10 5, K 4, Q 3, 8 2, 7 1.
- **Puntos:** `puntosTwentyNine(c)`: J 3, 9 2, As 1, 10 1, el resto 0.
- **Ganadora:** `ganadoraTwentyNine(mesa, triunfo)`, donde `triunfo` es el palo solo si está descubierto (o `null`): el triunfo más alto o, si no hay, la más alta del palo de salida.

### 2. Fases y acciones
- **Fases:** `'subasta' | 'triunfo' | 'doblar' | 'redoblar' | 'bazas'`.
- **Acciones:**
  - `pujar { valor }` y `pasar` (subasta);
  - `elegirTriunfo { palo | null }` (`null` es sin triunfo);
  - `doblar`, `noDoblar`, `redoblar` y `noRedoblar`;
  - `jugarCarta { carta }`, `pedirTriunfo` y `cantarPareja` (bazas).
- **Subasta:** `pujas` por asiento (`number | 'paso' | null`) y `pujaMayor`. Termina como en el Tresillo: si pasan los cuatro, se guarda un resultado `pasada` y se reparte con el siguiente.
- **Doblar:** los dos rivales del que pujó deciden por turno (desde el siguiente al que pujó); si uno dobla, se pasa a `redoblar` con el que pujó. Después se reparten las 4 cartas que quedan (`pendientes`, por asiento) y empieza `bazas`.
- **Pedir el triunfo:** legal en `bazas` si el triunfo está oculto, no es sin triunfo, el jugador no tiene el palo de salida y la mesa no está vacía. Descubre el triunfo, guarda `debeTriunfo: asiento` y no pasa el turno; si ese jugador tiene triunfo, sus cartas legales son solo los triunfos.
- **Cantar la pareja:** legal en su turno de `bazas`, con el triunfo descubierto, si tiene el K y la Q del triunfo y nadie la ha cantado. Ajusta `puja` (±4 con los límites 16 y 28) y no pasa el turno.

### 3. Puntuación y partida
- **Puntos de la mano:** `puntosMano` por pareja (`[0/2, 1/3]`), con las cartas de cada baza ganada.
- **`ResultadoManoTwentyNine`:** `repartidor`, `pasada`, `pujador`, `pujaInicial`, `puja` (tras la pareja), `triunfo`, `sinTriunfo`, `multiplicador`, `puntos` por pareja, `cumplida`, `cambio` (puntos de juego por pareja) y `marcadorTras`.
- **Marcador:** por pareja. Si cumple, la pareja que pujó suma el multiplicador; si no, lo resta.
- **Fin:** una pareja en `≥ objetivo` gana; una en `≤ −objetivo` hace ganar a la otra; o tras 40 manos (contando las que pasan los cuatro), la de más puntos o empate. `Fin.puntos` es el marcador de cada asiento (el de su pareja).
- **Config:** `{ objetivo: number }`, 6 por defecto; las pruebas usan 1.

### 4. Estado y vista
- **Estado:**
  - `repartidor`, `manos`, `pendientes`, `fase`, `turno`;
  - `pujas`, `pujaMayor`, `pujador`, `puja`, `triunfo`, `sinTriunfo`, `descubierto`, `multiplicador`, `doblaron`;
  - `mesa`, `ultimaBaza`, `jugadasPor`, `fallos`, `puntosMano`, `debeTriunfo`, `pareja` (quién la cantó, o `null`);
  - `marcador`, `resultadosManos`, `azar`.
- **Vista:**
  - la mano propia y cuántas tiene cada uno, y cuántas faltan por repartir;
  - `triunfo` solo si se conoce: descubierto, sin triunfo, o para el que pujó; si no, `null` con `triunfoOculto: true`;
  - todo lo demás, que es público.

  `ultimaBaza` se vacía al repartir.

### 5. IAs
- **Normal (`ia/twenty-nine-basica.ts`):** las reglas de la spec, con `pujaMaximaTwentyNine(mano4)` y `triunfoTwentyNine(mano4)`. Para doblar y redoblar usa los puntos de sus 4 primeras cartas (las que tiene en esa fase).
- **Difícil (`ia/reconstruir/twenty-nine.ts`):** `SIMULABLE_TWENTY_NINE`.
  - **Reconstrucción:**
    - las manos ajenas y las pendientes con `repartirConPermitidos`, respetando los fallos;
    - si el triunfo está oculto para el jugador, un palo al azar entre los que el que pujó no ha fallado.
  - **`decideLaBase`:** fuera de las bazas (subasta, triunfo, doblar y redoblar).
  - **Valoración:** el cambio del marcador de su pareja en la mano, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 30 y `presupuesto` 300. La pareja de la difícil gana 136 de 200 partidas a una pareja de normales (la parte justa son 100), con 95 ms como máximo por jugada.

### 6. Cliente
- **`MesaTwentyNine.svelte`:** sobre `MesaBazas` con 4 jugadores por parejas, a partir de `MesaTuteSubastado`.
  - **Subasta:** botones con las pujas legales (de 16 a 28) y «Paso».
  - **Triunfo:** un botón por palo y «Sin triunfo».
  - **Doblar:** «Doblar» o «Redoblar» y «No».
  - **Bazas:** «Pedir el triunfo» y «Cantar la pareja» cuando son legales.
  - **Información:** la puja y quién pujó, el triunfo («Oculto», el palo o «Sin triunfo»), ×2 o ×4, los puntos de cada pareja en la mano y el marcador.
- **`ResumenTwentyNine.svelte`:** la puja, el triunfo, los puntos de cada pareja, «Cumplida» o «Fallada» con su cambio y el marcador; «Pasan todos» en una mano pasada.
- **Menú y modo asistido:** entrada en `CATALOGO` (familia `bazasContrato`, baraja francesa), consejo en `CONSEJOS_JUEGO` y la cuenta de juegos con IA de `contexto.test.ts` pasa de 67 a 68.
- **Fin:** juego por parejas, con su bloque en `Fin.svelte` (como la Sueca).

## Risks / Trade-offs

- **El triunfo oculto en la simulación** → la difícil, si no lo conoce, lo sortea en cada reconstrucción, así que juega como si no lo supiera.
- **Muchas acciones en la subasta (13 pujas)** → la subasta la decide la base, como en el Tute subastado.
- **Partidas que no acaban** → el límite de 40 manos.
