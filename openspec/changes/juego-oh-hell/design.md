## Context

El Oh Hell es un juego de apuestas de bazas como la Pocha, ya en la suite. Lo nuevo:
- la baraja francesa de 52 con hasta 7 jugadores y manos de hasta 17 cartas;
- la secuencia que baja del máximo a 1 y vuelve a subir;
- jugar sin obligación de fallar ni de montar.

## Goals / Non-Goals

**Goals:**
- Oh Hell clásico de 3 a 7, con la restricción del repartidor y 10 más lo apostado por acertar.
- Reutilizar la mesa de bazas común (`MesaBazas`), con su muestra para la carta del triunfo, y la forma de apostar de la Pocha.
- IA normal por reglas y difícil por simulación que le gane.

**Non-Goals:**
- Otras secuencias, otras puntuaciones y el repartidor sin restricción.

## Decisions

### 1. Cartas y secuencia (`juegos/oh-hell.ts`)
- **Configuración:** `ConfigOhHell = { jugadores: 3 | 4 | 5 | 6 | 7 }`, por defecto 4.
- **Secuencia:** `secuenciaOhHell(jugadores)` da las cartas de cada mano: `max = floor(51 / jugadores)`, de `max` a 1 y de 2 a `max`.
- **Orden y ganador:** el rango de cada carta es su número, con el As como 14. `ganadoraOhHell(mesa, triunfo)` da quién gana la baza.

### 2. Estado
- **Mano:** `indiceMano`, `repartidor`, `manos`, `mazo` (oculto), `cartaTriunfo` y `triunfo`.
- **Turno:** `fase: 'apostar' | 'jugar'`, `apuestas` (`null` hasta apostar) y `turno`.
- **Bazas:** `mesa`, `ultimaBaza`, `bazas` por asiento, `jugadasPor` (cartas que jugó cada uno en las bazas cerradas) y `fallos` (palos que cada uno no siguió).
- **Partida:** `puntos`, `resultadosManos` (`{ cartas, triunfo, apuestas, bazas, puntos, totales }`), `ultimaAccion` y `azar`.

### 3. Acciones
- **`apostar { bazas }`:** de 0 a las cartas de la mano. El repartidor no tiene la que hace cuadrar la suma; `apuestaProhibida(e)` la calcula, y la vista la muestra.
- **`jugar { carta }`:** seguir el palo si se puede.

### 4. Puntos y partida
- **Al acabar la última baza de la mano:** suma 10 más la apuesta quien acierta, y nada quien falla.
- **Siguiente mano:** reparte el siguiente.
- **Fin:** la partida termina tras la última mano de la secuencia. Ganan los que tienen más puntos; si son varios, `empate`.

### 5. Vista
- **Públicas:** la carta del triunfo, las apuestas, la apuesta prohibida, la mesa, la última baza, `jugadasPor`, las bazas, los fallos, los puntos y los resultados.
- **Ocultas:** las manos ajenas y el mazo.

### 6. IAs
- **Normal (`ia/oh-hell-basica.ts`):**
  - **Bazas esperadas:**
    - cada As que no es triunfo, 1;
    - los triunfos A, K y Q, 1;
    - el resto de triunfos, 0,5 si tiene 4 o más;
    - un K con otra carta de su palo que no es triunfo, 0,5 (si hay 4 jugadores o menos).
  - **Apuesta:** el número de bazas esperadas redondeado, sin pasar de las cartas de la mano. Si está prohibida, la más cercana permitida, hacia arriba si el redondeo bajó y hacia abajo si subió.
  - **Jugar:** como dice la spec de `ia-jugadores`, con el coste de una carta como su rango (y los triunfos por encima de los demás).
- **Difícil (`ia/reconstruir/oh-hell.ts`):** `SIMULABLE_OH_HELL`.
  - **Qué simula:** la apuesta y cada carta.
  - **Reconstrucción:** las manos ajenas y el mazo salen al azar de las cartas que no se ven, respetando los fallos.
  - **Valoración:** sus puntos de la mano menos la media de los de los demás.
  - Valores: `reconstrucciones` 20 y `presupuesto` 60. Con 120, la difícil tardaba hasta 388 ms por decisión en las manos de 12 cartas; con 60 tarda como mucho 100 ms y gana 123 de 200 partidas a tres normales. Con muchas acciones (las apuestas de una mano de 17 cartas), si no llegan a dos reconstrucciones por acción, decide como la normal.

### 7. Cliente
- **`MesaOhHell.svelte`:** sobre `MesaBazas`, como la de la Pocha.
  - **Muestra:** la carta del triunfo.
  - **Información:** las cartas de la mano y la suma de las apuestas.
  - **Junto a cada jugador:** su apuesta, sus bazas y sus puntos.
  - **Apuestas:** los botones de las permitidas, y el aviso de la prohibida.
- **`ResumenOhHell.svelte`:** la tabla de la mano: apuesta, bazas, acierto, puntos y total.
- **Opciones:** el número de jugadores.

## Risks / Trade-offs

- **[Partidas largas]** → Con 3 jugadores hay 33 manos. Es la versión clásica que eligió el usuario. Las pausas del cliente son cortas y la partida se guarda para retomarla.
- **[Simulación con manos largas]** → Una mano de 17 cartas con 3 jugadores tiene 51 jugadas. El presupuesto fijo mantiene la decisión por debajo de 500 ms; si no, se limita el horizonte.
