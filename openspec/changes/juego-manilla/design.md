## Context

Núñez Elvira describe la Manilla como el Tute por parejas con la norma de la Butifarra: las obligaciones solo rigen si la baza la gana un rival. La suite ya tiene:
- en la Butifarra, el orden y los puntos (`VALORES_BUTIFARRA`) y las obligaciones con el sobrefallo libre (`cartasObligadas`);
- la IA de bazas en pareja;
- la mesa de bazas para 4 con una carta visible en la mano de un rival (`cartaVisible`, la del Tute de 4).

## Goals / Non-Goals

**Goals:**
- La Manilla de Núñez para 4 en parejas, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Otros números de jugadores y variantes regionales.

## Decisions

### 1. Estado y acciones (`juegos/manilla.ts`)
- **Config:** `{ objetivo: 20 | 40 }`; por defecto, 40, la del libro. La de 20 da partidas más cortas.
- **Estado:** el de la Butifarra sin la elección del triunfo ni los contros, más el `pinte`.
  - **Reparto:** se da de cuatro en cuatro desde el siguiente al que reparte; la carta 48, el pinte, es la última del que reparte.
  - **Inicio:** empieza repartiendo el asiento 3, así sale el 0.
- **Acción:** `{ tipo: 'jugar'; carta }`. Las legales son `cartasObligadas` con `montarSobreCompanero: false` y `sobrefalloLibre: true`. La regla del libro es esa: «si no se puede [superar el fallo], el jugador tiene el derecho de descartarse del naipe que desee».
- **Puntuación (`anotarManilla`):**
  - cada pareja se anota lo que pasa de 36, y la del que reparte, el valor del pinte;
  - el pinte es «decisivo» si sin él la pareja no llega al objetivo y con él sí; entonces solo se anota si la pareja ha hecho al menos 36;
  - como solo una pareja puede pasar de 36, y el pinte decisivo exige que la que reparte haga 36, no puede haber dos parejas que lleguen a la vez.
- **Vista:**
  - el `pinte` y el `triunfo`;
  - `pinteEnMano`, que indica si el pinte sigue en la mano del que reparte: es información pública, porque el pinte se vuelve a la vista de todos.

### 2. IAs
- **Normal (`ia/manilla-basica.ts`):**
  - el juego de cartas de la Butifarra pasa a ser una función exportada, `cartaEnPareja`, que recibe solo lo que necesita: asiento, triunfo, mano, mesa y bazas jugadas;
  - la Butifarra la sigue usando igual, y la Manilla le pasa el triunfo del pinte;
  - Núñez no da otra estrategia que la del Tute por parejas, salvo cuando gana el compañero: cargarle puntos, como ya hace esa función.
- **Difícil (`ia/reconstruir/manilla.ts`):**
  - **Reconstrucción:** si el pinte sigue en la mano de un rival, se le pone ahí y no se reparte. El resto se reparte con `repartirConPermitidos`, con un tope de fuerza por palo para cada jugador (`topesManilla`), deducido de lo que jugó cuando la baza la ganaba un rival:
    - no siguió el palo → 0 en ese palo;
    - siguió sin superar la carta que ganaba de ese palo → no tiene una mayor;
    - no siguió ni echó triunfo → no tiene triunfos, o ninguno mayor que el triunfo que ganaba, por el sobrefallo libre;
    - echó un triunfo menor que el que ganaba → no tiene uno mayor.

    No se usan los fallos de la Butifarra, que con el sobrefallo libre darían por hecho que no tiene triunfos quien solo tenía triunfos menores.
  - **Valoración:** la diferencia de puntos entre parejas en la mano, dividida entre 2, más `bonoPartida`; con 24 reconstrucciones y un presupuesto de 160.
- **Mediciones** (a 40, partidas por parejas):

  | Duelo | Partidas ganadas |
  |---|---|
  | Normal contra el azar | 179 de 200 |
  | Normal contra la fácil | 135 de 200 |
  | Difícil contra la normal | 72 de 100, con 95 ms como máximo por decisión |

### 3. Cliente
- **`MesaManilla.svelte`:**
  - sobre `MesaBazas`, con `cartaVisible` para el pinte en la mano del que reparte;
  - la mano ordenada por palos y por fuerza, como la Butifarra;
  - en la barra, el triunfo con el pinte («Triunfo: Bastos (pinte: 9 de bastos)»), los puntos de la mano por pareja, el marcador y quién reparte.
- **`ResumenManilla.svelte`:**
  - la tabla de la Butifarra (cartas, bazas, total, se anota y total de la partida), con una fila más para el pinte;
  - una frase que dice cuánto vale el pinte y para quién, o por qué no se anota.
- **Fin:** el resumen de la última mano y las manos jugadas, como la Butifarra.
- **Menú:** familia «Bazas por puntos», con 20 juegos.
- **Guía:**
  - tres ejemplos comprobados con el motor:
    - los valores, con el orden y los puntos;
    - una baza en la que un 2 de triunfo gana al 9 de otro palo;
    - la tabla del ejemplo del libro, que suma 9;
  - el pinte decisivo;
  - los consejos de Núñez;
  - la historia, prudente con el origen, del que el propio libro dice que se discute.

## Risks / Trade-offs

- **La función común de cartas** → la Butifarra decide exactamente igual (sus tests pasan sin cambios); solo cambia la firma.
- **Partida a 20** → no está en el libro, pero el pinte decisivo funciona igual con cualquier objetivo.
