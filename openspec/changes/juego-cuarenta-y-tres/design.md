## Context

Núñez Elvira describe el Cuarenta y tres como el Tute de 3 jugadores sin cantes:
- se reparten 13 cartas a cada uno, de una en una, y la carta 40 es la muestra, que queda descubierta en la mesa;
- la muestra se cambia como en el Tute individual (por el 7 si es mayor que él; por el 2 si es menor que la Sota), pero sin tener que ganar antes una baza;
- las bazas se juegan «exactamente igual que en el Tute por parejas»: asistir y montar, fallar y montar el fallo;
- las 9 de últimas, en lugar de las 10, dejan la mano en 129 tantos; cada uno cobra o paga lo que pasa o le falta de 43.

La suite ya tiene:
- el orden y los puntos del Tute (`VALORES_BRISCA`) y la carta de cambio de la muestra (`cartaDeCambio`);
- las obligaciones con el sobrefallo libre (`cartasObligadas`);
- la heurística de bazas de las IAs básicas del Tute y la Brisca (`bazas-heuristica`);
- la deducción común de lo que se sabe por las obligaciones (`topesPorObligaciones`);
- la mesa de bazas para 3 del Tute gana-pierde, con su resumen de cada mano.

## Goals / Non-Goals

**Goals:**
- El Cuarenta y tres de Núñez para 3, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- La partida de 4 en la que el que reparte descansa: con un asiento sin jugar en cada mano, pide una mesa y un turno distintos para una variante que no cambia el juego.
- La partida «a tiempo»: se sustituye por un número fijo de manos.

## Decisions

### 1. Estado y acciones (`juegos/cuarenta-y-tres.ts`)
- **Config:** `{ manos: 3 | 6 }`; por defecto, 6. Con un múltiplo de 3, todos reparten las mismas veces.
- **Reparto:** se baraja la de 40 y se da de una en una desde el siguiente al que reparte, que es quien sale; la carta 40 es la muestra. Empieza repartiendo el asiento 2, así sale el 0.
- **Acciones:**
  - `{ tipo: 'jugar'; carta }`;
  - `{ tipo: 'cambiarSiete' }`, con el mismo nombre que en el Tute y el Guiñote para que el modo asistido la reconozca.
- **Cambio de la muestra:**
  - la carta de cambio es la de `cartaDeCambio(muestra)`: el 7 si la muestra es mayor, el 2 si es el 7 o menor;
  - se puede en el turno propio, antes de jugar, una sola vez por mano. Si la muestra es el 2, nadie puede;
  - el estado guarda quién la cambió y qué carta se llevó (`cambio`). La muestra pasa a ser la carta entregada, que no se juega;
  - no es obligatorio: una muestra sin cambiar no se juega y sus tantos no los gana nadie.
- **Obligaciones:** `cartasObligadas` con `montarSobreCompanero: true` (no hay compañeros: `bandoDe` emparejaría a los asientos 0 y 2) y `sobrefalloLibre: true`, como en el Tute gana-pierde.
- **Tantos:** cartas y 9 de últimas, por jugador.
- **Liquidación:** al cerrar la mano, cada saldo suma `tantos − 43`. Con la muestra cambiada (o sin puntos) la suma de los tres es 0; si se queda en la mesa una muestra con puntos, es negativa, como en la cuenta del libro.
- **Fin:** al acabar la última mano. Ganan los de más saldo (pueden ser varios); `puntos` es el saldo.
- **Vista:**
  - la `muestra`, el `triunfo` y el `cambio`;
  - los `tantos` y las bazas de cada uno en la mano, que todos han visto ganar;
  - las bazas jugadas en la mano;
  - los saldos, el número de la mano y los resultados de las manos.

### 2. IAs
- **Normal (`ia/cuarenta-y-tres-basica.ts`):**
  - cambia siempre la muestra: la que recibe vale lo mismo o más que la que entrega;
  - al salir con 5 triunfos o más, arrastra, como aconseja el libro: con el triunfo más alto que queda, si lo tiene; si no, con el más bajo;
  - si no arrastra, sale con una carta de puntos de otro palo que nadie puede superar sin fallar (el As, o el Tres cuando ya salió el As): el libro dice que un As «sirve para arañar tantos»;
  - jugando segundo, si una de esas cartas del palo de salida gana la baza, la gana con ella, en lugar de con una más barata que el tercero podría superar;
  - en lo demás, la heurística de bazas del Tute con 3 jugadores, sin compañero.
- **Difícil (`ia/reconstruir/cuarenta-y-tres.ts`):**
  - **Reconstrucción:**
    - las manos ajenas al azar entre las cartas que no se ven, con `repartirConPermitidos` y los topes de `topesPorObligaciones`;
    - la muestra cambiada sigue en la mano de quien la cogió mientras no la juegue.
  - **Valoración:** el saldo propio al acabar la mano menos el del mejor de los otros dos. Es continua, sin el salto de `bonoPartida`, y en la última mano decide igual quién gana la partida.
- **Mediciones** (partidas de 3 manos, la IA medida en un asiento contra las otras dos):

  | Duelo | Tantos de la IA | Por cada rival | Partidas ganadas |
  |---|---|---|---|
  | Azar contra el azar | 25 135 | 25 954 | 60 de 200 |
  | Normal contra el azar | 30 709 | 23 237 | 121 de 200 |
  | Difícil contra la normal | 26 532 | 25 430 | 82 de 200, con 117 ms como máximo por decisión |

  La ventaja de la difícil es pequeña: con 13 cartas cada uno y las obligaciones del Tute, muchas jugadas son forzadas y la mano que toca pesa mucho. Con más simulaciones (presupuesto de 360) no mejora. Tampoco cambia valorando solo los tantos propios con `bonoPartida`; se queda la ventaja de saldo, que además cuenta quitarle tantos al que va primero.

### 3. Cliente
- **`MesaCuarentaYTres.svelte`:**
  - sobre `MesaBazas`, para 3, con los rivales numerados como en el Tute gana-pierde;
  - la muestra a la vista junto a la mesa, con el botón «Cambiar la muestra por tu 7» cuando se puede;
  - la mano ordenada por palos y por fuerza;
  - junto a cada jugador, sus tantos, si reparte y su saldo;
  - en la barra, el triunfo, el número de la mano de cuántas y tu saldo;
  - un aviso cuando alguien cambia la muestra.
- **`ResumenCuarentaYTres.svelte`:** una tabla con los tantos, las últimas, lo que cobra o paga cada uno y su saldo.
- **Fin:** la clasificación por saldo y el resumen de la última mano.
- **Menú:** familia «Bazas por puntos», con 21 juegos.
- **Guía:**
  - ejemplos comprobados con el motor:
    - el cambio de la muestra;
    - la liquidación, con los dos ejemplos del libro;
  - los consejos de Núñez;
  - la historia, como variante del Tute.

## Risks / Trade-offs

- **Cambio en cualquier turno** → el libro solo dice que no hace falta ganar una baza; dejarlo en cualquier turno propio, antes de jugar, es lo más sencillo y no da ventaja a nadie.
- **Muestra sin cambiar** → el libro cuenta siempre 129; la IA cambia siempre y una persona puede no hacerlo, perdiendo esos tantos para todos.
- **Número de manos** → no está en el libro, que juega a tiempo; no cambia ninguna regla.
