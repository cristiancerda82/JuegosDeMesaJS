## Context

El Casino se parece a la Escoba: mesa abierta, recoger por suma, barridas, nuevo reparto al vaciar las manos y la mesa para el último que recogió. Lo nuevo es:
- las **construcciones**, montones con valor y dueño que se pueden subir o hacer múltiples;
- la regla de no poder dejar carta con una construcción propia;
- la puntuación inglesa (cartas, picas, Big y Little Casino, Ases y barridas).

## Goals / Non-Goals

**Goals:**
- Casino clásico de 2 a 4, con parejas a 4, construcciones y partida a 21.
- Un número manejable de acciones legales, para la IA y para la suite del contrato.
- IA normal por reglas y difícil por simulación que le gane.

**Non-Goals:**
- Royal Casino, Draw Casino y elegir qué combinaciones recoger.

## Decisions

### 1. Estado (`juegos/casino.ts`)
- **Mesa:** `mesa: ElementoMesa[]`, donde cada elemento es:
  - `{ tipo: 'carta', carta }`;
  - o `{ tipo: 'construccion', id, valor, cartas, duenio, multiple }`.
- **Manos:** `manos`, `mazo`, `turno`, `repartidor`, `siguienteId`.
- **Por bando:** `recogidas: IdCarta[][]` y `barridas: number[]`. Un bando es un jugador, o una pareja con 4 en parejas.
- **Recogidas:** `ultimoEnRecoger: Asiento | null`.
- **Partida:** `puntos`, `resultadosManos`, `ultimaAccion`.

### 2. Acciones
- **`recoger { carta }`:** una por carta de la mano, si recoge algo. Lo que se lleva lo calcula el motor:
  - las iguales en número;
  - las construcciones de su valor;
  - y, con una numérica, el conjunto de combinaciones disjuntas de cartas sueltas que suman su valor con más cartas. Se busca por fuerza bruta sobre las cartas sueltas restantes, que son pocas.
- **`construir { carta, cartas, construccion }`:**
  - `cartas` son las cartas sueltas que se usan;
  - `construccion` es el id de la construcción que se sube o se hace múltiple, o `null` para una nueva;
  - se enumeran todos los subconjuntos de cartas sueltas, que son como mucho unos pocos centenares;
  - requisito: tener en la mano otra carta del valor resultante.
- **`dejar { carta }`:** prohibida con una construcción propia en la mesa.

### 3. Barridas y fin de mano
- Una recogida que deja la mesa vacía suma una barrida, salvo si es la última jugada de la mano: mazo vacío y todas las manos vacías tras ella.
- Al cerrar la mano, la mesa va a `ultimoEnRecoger` (o se pierde si nadie recogió), se puntúa y se reparte la siguiente con el repartidor rotado.
- La partida termina cuando alguien llega a 21 y no hay empate arriba.

### 4. Vista
- La mesa, las recogidas y las barridas son públicas.
- Las manos ajenas y el mazo, ocultos.

### 5. IAs
- **Normal (`ia/casino-basica.ts`):** valora cada acción:
  - **recoger:** las cartas que se lleva más los extras: picas +1, As +3, Big Casino +6, Little Casino +3 y barrida +5;
  - **construir:** la mitad de lo que valdría recogerla después;
  - **dejar:** un coste según el valor de la carta.
- **Difícil (`ia/reconstruir/casino.ts`):** `SIMULABLE_CASINO`.
  - **Reconstrucción:** el mazo y las manos ajenas salen al azar de las cartas que no se ven. A cada dueño ajeno de una construcción se le da antes una carta del valor de la construcción.
  - **Valoración:** los puntos de la mano propios (o del bando) menos la media de los demás. Si la mano no se ha cerrado, se cuentan las cartas recogidas y los extras.
  - Valores de partida: `reconstrucciones` 20 y `presupuesto` 100.

### 6. Cliente
- **`MesaCasino.svelte`:**
  - la mesa en rejilla, con las construcciones como montones con su valor y una etiqueta del dueño;
  - al tocar una carta propia sale un panel con sus jugadas, y cada opción resalta las cartas de la mesa que usa;
  - si la carta solo tiene una jugada, se hace al tocar la mesa.
- **`ResumenCasino.svelte`:** la tabla del desglose por jugador o pareja.

## Risks / Trade-offs

- **[Muchas construcciones posibles con mesas grandes]** → Con 8 o más cartas sueltas, la enumeración se limita a subconjuntos de hasta 4 cartas. Una construcción de más cartas casi nunca hace falta.
- **[Recoger siempre lo máximo]** → Simplifica la interfaz y la IA. Elegir combinaciones queda fuera de alcance.
