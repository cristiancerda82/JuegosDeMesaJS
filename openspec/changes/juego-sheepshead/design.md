## Context

El Sheepshead se parece al Schafkopf:
- 32 cartas francesas con los mismos puntos (120 en total);
- Q y J siempre de triunfo, más un palo de triunfo;
- seguir el palo contando los triunfos como uno;
- un compañero oculto.

Se diferencia en:
- 5 jugadores con 6 cartas y un blind de 2;
- el triunfo fijo en diamantes;
- que el compañero lo da la J de diamantes, no un As llamado;
- la ronda de coger en lugar de la subasta de contratos;
- el leaster;
- la tabla de puntos de suma cero y la partida a 10 manos.

Se reaprovechan:
- del Schafkopf: la estructura de las bazas, el compañero que se descubre y la reconstrucción con `repartirConPermitidos` y los fallos;
- la mesa de bazas compartida (`MesaBazas`) con 5 jugadores, como el Tarot;
- el esquema de niveles con `decideLaBase` fuera de las bazas.

## Goals / Non-Goals

**Goals:**
- Sheepshead para 5 a 10 manos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Llamar un As, jugar solo por elección, el crack, los doublers y otras cantidades de jugadores.

## Decisions

### 1. Cartas (`juegos/sheepshead.ts`)
- **Baraja:** `BARAJA_SHEEPSHEAD`, la francesa del 7 al As.
- **Puntos:** `puntosCartaSheepshead`.
- **Triunfos:** `esTriunfoSheepshead(c)`: las Q, las J y los diamantes.
- **Orden:** `fuerzaSheepshead(c)`.
  - Triunfos de 100 a 113: Q♣ 113, Q♠ 112, Q♥ 111, Q♦ 110, J♣ 109, J♠ 108, J♥ 107, J♦ 106, y después As♦, 10♦, K♦, 9♦, 8♦ y 7♦ de 105 a 100.
  - En los otros palos, As 6, 10 5, K 4, 9 3, 8 2, 7 1.
- **Palo efectivo:** `paloEfectivoSheepshead(c)`: `'triunfo'` o el palo.
- **Cartas legales:** las del palo efectivo de salida si tiene; si no, todas.
- **Constante:** `J_DIAMANTES = 'diamantes-11'`.

### 2. Fases y acciones
- **Fases:** `'coger' | 'enterrar' | 'bazas'`.
- **Acciones:**
  - `coger` y `pasar` (en `coger`);
  - `enterrar { carta }`: una por acción, dos veces, sin la J de diamantes;
  - `jugar { carta }`: en `bazas`.
- **Turnos:** en `coger`, desde el siguiente al que reparte.
  - Si alguien coge: el blind va a su mano y pasa a `enterrar`.
  - Si pasan los 5: `leaster: true` y pasa a `bazas`.
  - Tras enterrar 2, pasa a `bazas`. Sale siempre el siguiente al que reparte.
- **Compañero:** `companero: Asiento | null` es el dueño de la J de diamantes, fijado al empezar las bazas. `companeroVisto` pasa a `true` cuando se juega la J de diamantes. Si el dueño es el picker, juega solo.
- **Leaster:** el blind sigue aparte; al cerrar la mano, sus puntos van a quien ganó la última baza.

### 3. Puntuación
- **`puntuarManoSheepshead`:** recibe `picker`, `companero`, los puntos de cartas de cada uno (con el blind enterrado, o con el blind del leaster ya sumado) y las bazas. Devuelve lo que anota cada uno.
  - **Con picker:**
    - el bando suma sus puntos;
    - `base` es 1, 2 o 3 si gana (61 a 90, 91 o más, todas las bazas) y −2, −4 o −6 si pierde (31 a 60, 30 o menos, ninguna baza);
    - el picker anota `2·base`, el compañero `base` y cada rival `−base`;
    - si juega solo, el picker anota `4·base`.
  - **Leaster:** los que ganaron alguna baza, ordenados por puntos, luego por bazas y luego por el orden desde el siguiente al que reparte. El primero anota +4 y los demás −1.
- **Partida:** `config.manos` (10 por defecto; menos en las pruebas). Termina al cerrar esa mano.

### 4. Estado y vista
- **Config:** `{ jugadores: 5; manos: number }`.
- **Estado:**
  - `repartidor`, `manos`, `blind`, `enterradas`, `fase`, `turno`;
  - `pasados` (por asiento), `picker`, `leaster`, `companero`, `companeroVisto`;
  - `mesa`, `ultimaBaza`, `jugadasPor`, `fallos` (palos efectivos que cada uno no tiene), `bazas`, `puntosMano`;
  - `marcador`, `resultadosManos`, `azar`.
- **Vista:**
  - su mano;
  - cuántas cartas tiene cada uno;
  - `misEnterradas` si es el picker;
  - `companero` solo si `companeroVisto` o si el asiento es el compañero;
  - todo lo público.

  `ultimaBaza` se vacía al repartir.
- **`ResultadoManoSheepshead`:**
  - `picker`, `companero`, `solo`, `leaster`;
  - `puntosBando` y `bazasBando` (con picker), o `ganadorLeaster`;
  - `puntos` (de cartas, por jugador);
  - `anotado`, `marcadorTras`.

### 5. IAs
- **Normal (`ia/sheepshead-basica.ts`):** las reglas de la spec. Su bando conocido:
  - el picker conoce a su compañero solo al verlo;
  - el compañero conoce al picker;
  - los demás saben que son rivales del picker, y del compañero una vez visto.
- **Difícil (`ia/reconstruir/sheepshead.ts`):** `SIMULABLE_SHEEPSHEAD`.
  - **Reconstrucción:** con `repartirConPermitidos`, entre las manos ajenas, el blind (si nadie lo ha cogido o en el leaster) y las enterradas (si el jugador no es el picker), con los fallos. La J de diamantes, si no se ve, no puede quedar enterrada. El compañero del estado reconstruido sale de quién tiene la J de diamantes.
  - **`decideLaBase`:** fuera de la fase `bazas`.
  - **Valoración:** lo que anota el asiento en la mano, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 30 y `presupuesto` 300. La difícil gana 62 de 200 partidas contra cuatro normales (la parte justa son 40), con 81 ms como máximo.

### 6. Cliente
- **`MesaSheepshead.svelte`:** sobre `MesaBazas` con 5 jugadores, a partir de `MesaSchafkopf` y `MesaTarot`.
  - **Coger:** botones «Coger» y «Pasar».
  - **Enterrar:** el aviso «Toca 2 cartas para enterrar» y la carta tocada se entierra.
  - **Información:** el blind boca abajo, el picker y el compañero (o «solo»), «Leaster», la mano de las 10 y mis puntos.
  - **Detalle de cada asiento:** «Pasa», «Picker», «Compañero», los puntos de cartas y el marcador.
- **`ResumenSheepshead.svelte`:** la línea del resultado y la tabla de puntos, lo anotado y el marcador.
- **Fin:** juego sin parejas fijas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **Mesa para 5 en 360 px** → la de `MesaBazas` ya funciona con el Tarot para 5.
- **Que el picker juegue solo sin decirlo** → se ve al jugar la J de diamantes, como en el juego real.
