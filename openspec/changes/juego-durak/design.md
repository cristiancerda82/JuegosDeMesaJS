## Context

El contrato del motor pide que en cada momento actúe un solo asiento, y el Durak de mesa es simultáneo: todos echan cartas a la vez. Hay que convertirlo en turnos sin cambiar las reglas que importan. También es el primer juego de la suite en que se sale de la partida a mitad y en que pierde uno solo.

## Goals / Non-Goals

**Goals:**
- Durak clásico (*podkidnoy*) de 2 a 6, con ataques, defensas, echar cartas, llevarse la mesa, robar y salir.
- Acciones legales pocas y canónicas, para la IA y para la suite del contrato.
- IA normal por reglas y difícil por simulación que le gane.

**Non-Goals:**
- *Perevodnoy*, parejas, partida de varias manos, el límite de 5 en el primer ataque y echar tras llevarse las cartas.

## Decisions

### 1. Turnos: un ataque cada vez
- La mesa tiene como mucho **una carta de ataque sin ganar**: cada carta echada es un ataque y el defensor responde antes de que se eche otra.
- Mientras hay un ataque sin ganar, le toca al defensor. Si no hay ninguno, le toca al siguiente atacante que puede echar, en orden desde el atacante principal y saltando al defensor. Es lo que se ve en una mesa real, y evita acciones de varias cartas.
- **Echar:** el motor salta a quien no tiene ninguna carta que pueda echar. Tras cada carta echada, todos vuelven a poder echar. Cuando todos los que pueden han pasado seguidos, o nadie puede echar, la ronda termina.
- **Límite:** se puede echar si hay menos de 6 ataques y el defensor tiene alguna carta. Así nunca hay más ataques que cartas para cubrirlos.

### 2. Estado (`juegos/durak.ts`)
- **Cartas:** `manos`, `mazo` (se roba del principio; la última es la del triunfo), `cartaTriunfo` y `triunfo`.
- **Mesa:** `mesa: { ataque, defensa | null }[]` y `descarte`.
- **Turno:** `atacante`, `defensor`, `turno` y `pasaron` (los que pasaron desde la última carta echada).
- **Conocidas:** `conocidas: IdCarta[][]`, las cartas que cada uno se llevó de la mesa o la del triunfo que robó, mientras las tenga.
- **Partida:** `salidos` (en orden), `ultimaAccion` y `azar`.

### 3. Acciones
- **`atacar { carta }`:** primera carta de la ronda (solo el atacante, cualquier carta y no puede pasar) o echar (un número que ya está en la mesa).
- **`defender { carta }`:** gana el ataque sin ganar.
- **`tomar`:** el defensor se lleva toda la mesa.
- **`pasar`:** un atacante que podía echar no lo hace.

### 4. Fin de ronda, robar y salir
- **Al cerrar la ronda:**
  - la mesa va al descarte, o a la mano del defensor (y a sus `conocidas`) si se la lleva;
  - roban hasta 6 el atacante, los demás desde él en orden y el defensor al final.
- **Salir:** con el mazo vacío, quien no tiene cartas sale y entra en `salidos`.
- **Siguiente ronda:**
  - el nuevo atacante es el defensor si ganó, o el siguiente a él si se llevó las cartas, saltando a los que han salido;
  - el defensor es el siguiente con cartas después del atacante.
- **Fin:** con un jugador o ninguno con cartas, la partida termina. `resultado` da como ganadores a todos menos el durak, o empate sin ganadores.
- **Salir a mitad de ronda:** un atacante que echa su última carta con el mazo vacío sale al cerrar la ronda, no antes. Si el defensor gana su última carta, nadie puede echarle más y la ronda termina.

### 5. Vista
- **Públicas:** la mesa, el descarte, la carta del triunfo, las `conocidas`, `salidos`, atacante, defensor y turno.
- **Ocultas:** las manos ajenas (salvo las conocidas) y el mazo.

### 6. IAs
- **Normal (`ia/durak-basica.ts`):**
  - cada carta tiene un coste: su rango, más 10 si es triunfo;
  - **ataca** con la más barata, prefiriendo números repetidos;
  - **echa** las de coste bajo; con el mazo vacío, cualquiera;
  - **defiende** con la más barata que gana;
  - **se lleva** las cartas si la más barata es un triunfo Q, K o A con más de 6 cartas en el mazo.
- **Difícil (`ia/reconstruir/durak.ts`):** `SIMULABLE_DURAK`.
  - **Reconstrucción:** las manos ajenas empiezan por sus `conocidas`, y el resto de la mano y el mazo salen al azar de las cartas que no se ven. La carta del triunfo sigue al final del mazo mientras quede mazo.
  - **Simulación:** con horizonte, porque una partida entera es larga.
  - **Valoración:** si la partida terminó, ±1000 según sea o no el durak. Si no, menos las cartas en mano propias más la media de las de los demás que siguen, más un poco por los triunfos propios; salir vale mucho.
  - Valores de partida: `reconstrucciones` 20, `presupuesto` 100 y `horizonte` 30.

### 7. Cliente
- **`MesaDurak.svelte`:**
  - los rivales arriba con su número de cartas y las marcas de atacante y defensor;
  - el mazo con la carta del triunfo girada debajo;
  - la mesa con los pares ataque y defensa;
  - el descarte;
  - la mano propia ordenada por palo, con el triunfo al final.
- **Jugar:** se toca una carta jugable y después la mesa. Los botones «Me las llevo» y «Paso» aparecen cuando son legales.
- **Pantalla de fin:** el durak y el orden de salida.

## Risks / Trade-offs

- **[Echar por turnos y no a la vez]** → Cambia algo el ritmo frente a la mesa real, pero el conjunto de jugadas posibles es el mismo, salvo echar varias cartas de golpe.
- **[Simulaciones largas]** → El horizonte de 30 jugadas acota el tiempo. Si la difícil se queda corta, se ajustan el horizonte y el presupuesto.
