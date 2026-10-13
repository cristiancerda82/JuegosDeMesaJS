## Context

El motor tiene la baraja española, el azar con semilla, el barajado, el reparto y el contrato `Juego<C,E,A,V>` con su suite de propiedades. En el cliente, la mesa de bazas aporta `ManoPropia` (cartas jugables, arrastre y doble toque) y `AsientoRival`. El Chinchón y la Siete y media aportan el patrón del panel de fin de mano, que pausa la sesión. El Cinquillo no tiene triunfo ni puntos de cartas: solo importa el orden de cada palo y quién se queda antes sin cartas.

## Goals / Non-Goals

**Goals:**
- Cinquillo completo de 2 a 4 jugadores, con partida a 1, 3 o 5 manos y penalización por cartas.
- IA sencilla que gane claramente al azar.

**Non-Goals:**
- Fichas, bote y apuestas.
- Variantes con baraja de 48 cartas.
- El juego en red.

## Decisions

### 1. Orden y mesa
Se define el orden `ORDEN = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]`. La mesa se guarda como `mesa: Record<PaloEspanol, { bajo: number; alto: number } | null>`, con los índices en `ORDEN` del extremo de abajo y del de arriba de cada palo, o `null` si su 5 aún no ha salido. Una carta es legal en estos casos:
- es el 5 de un palo con `null`;
- su índice es `bajo − 1` o `alto + 1` de su palo.

Al empezar la mano, la única acción legal del que tiene el 5 de oros es jugarlo. Como la mesa está vacía, basta con no ofrecer otros 5. Es decir, mientras la mesa esté vacía, la única carta legal es el 5 de oros.

### 2. Estado y acciones
`EstadoCinquillo` guarda:
- `config` (`jugadores: 2 | 3 | 4`, `manos: 1 | 3 | 5`), `azar`, `repartidor`, `manos` y `mesa`;
- `turno`, `ultimaAccion` (`{asiento, tipo: 'jugar', carta} | {asiento, tipo: 'pasar'}`);
- `resultadosManos: { ganador, cartasRestantes: number[], puntos: number[], totalesTras: number[] }[]` y `totales`.

Acciones: `jugar{carta}` y `pasar`.

Al quedarse un jugador sin cartas se cierra la mano. Si la partida sigue, se reparte otra con el siguiente repartidor y sale quien tenga el 5 de oros.

*Nunca se atasca:* siempre hay alguien que puede jugar. Mientras queden cartas, la carta siguiente de algún extremo, o un 5 sin salir, está en la mano de alguien, porque se reparte toda la baraja.

### 3. Vista
`VistaCinquillo` muestra `config`, `asiento`, `miMano`, `cartasEnMano`, `mesa`, `turno`, `repartidor`, `ultimaAccion`, `resultadosManos` y `totales`. Las cartas de la mesa se deducen de los extremos, así que la vista no necesita la lista de cartas jugadas.

### 4. IA básica (`ia/cinquillo-basica.ts`)
Para cada carta legal calcula `valor = propias × 2 − ajenas + extremo`:
- `propias`: cuántas cartas propias del mismo palo hay más allá, en la dirección en la que la carta alarga la escalera. Un 5 abre las dos direcciones.
- `ajenas`: si la carta siguiente en esa dirección no es suya, abre camino a un rival y cuenta 1.
- `extremo`: un As o un Rey suman 1.

Elige el mayor valor y desempata por el orden de la mano. Si solo puede pasar, pasa. Es determinista.

### 5. Cliente
`MesaCinquillo.svelte`:
- **Rivales:** una fila compacta arriba, con un dorso, el nombre, el número de cartas y los puntos totales de cada rival. No se usa `AsientoRival` a los lados porque, con 4 jugadores en 360 px, la mesa de 10 huecos por fila se quedaría sin ancho.
- **Centro:** la mesa con 4 filas (oros, copas, espadas, bastos) de 10 huecos. Las cartas salen en su hueco y los huecos jugables se marcan con un borde suave. Es el destino `'mesa'` de la interacción.
- **Mano propia:** `ManoPropia`, ordenada por palo y valor, con las cartas jugables resaltadas. Tocar y tocar la mesa, arrastrar o doble toque juegan la carta.
- **Paso:** el botón «Paso» aparece cuando es la única acción.
- **Avisos y pausas:** un aviso con la última acción de un rival y una pausa breve tras cada acción ajena (`pausaTras`).
- **Fin de mano:** el panel pausa la sesión hasta «Siguiente mano», y la pantalla de fin muestra la clasificación.

En 360 px, cada fila de la mesa tiene 10 huecos de unos 30 px. La carta se ve con su índice, y no hace falta más porque son cartas de la mesa, no de la mano.

## Risks / Trade-offs

- **Mano de 20 cartas con 2 jugadores en pantallas pequeñas** → `ManoPropia` ya solapa las cartas dejando el índice a la vista, y se comprueba con un E2E en 360 × 640.
- **Partidas aburridas con 2 jugadores**, porque hay mucho que pasar → es fiel al juego, y la pausa tras los pases de la IA es corta.
- **Variantes regionales**, como obligar a jugar 5 antes de alargar → se documentan las reglas elegidas para que las valide el usuario.
