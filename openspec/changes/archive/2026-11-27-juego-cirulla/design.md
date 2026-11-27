## Context

«Juegos de cartas» (de la colección De Vecchi) describe la Cirulla en dos páginas, mezclada con un resumen de la Scopa:
- se juega como la Escoba (la Scopa de la suite), entre dos, tres o parejas de cuatro;
- «acuses»: si en la mesa hay dos Ases, se anula la mano; si las cuatro cartas de la mesa suman 15, el que reparte se anota un punto (una escoba), y si suman 30, dos;
- quien tiene tres cartas que no pasan de 10 las enseña y se anota tres escobas; con tres iguales, diez;
- el 7 de corazones es un comodín, que vuelve a valer 7 en la primera;
- se puede capturar lo que sume 15 con la carta jugada, y el As se lleva la mesa entera si no hay otro As;
- la cirulla grande (Jota, Reina y Rey de diamantes) vale 5 y la pequeña (As, 2 y 3 de diamantes) 3, y uno más por cada carta seguida;
- quien se lleva todos los oros gana la partida; si no, se juega a 51.

El libro habla de baraja francesa, pero la Cirulla de Liguria se juega con 40 cartas, como la Scopa, y la suite ya la tiene con la baraja española: la Scopa (`juegos/scopa.ts`) con sus capturas (`capturasScopa`, `combinaciones`), su primera, su reparto y su mesa (`MesaScopa.svelte`).

## Goals / Non-Goals

**Goals:**
- La Cirulla para 2 o para 4 en parejas, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- La Cirulla para 3.
- El 7 de copas como comodín al capturar: el libro dice que «mantiene su valor mientras permanece en la mesa», sin explicar cómo se elige; en la Cirulla de Liguria solo es comodín en los acuses, y así se hace aquí, también en la mesa inicial, que el libro trata como un acuse.

## Decisions

### 1. Baraja y equivalencias
La española de 40 cartas, como la Scopa: los diamantes son los oros, el 7 de corazones es el 7 de copas, y las figuras francesas (Jota, Reina y Rey) son la Sota, el Caballo y el Rey, que valen 8, 9 y 10. Así, la cirulla grande son la Sota, el Caballo y el Rey de oros, y la pequeña, el As, el 2 y el 3 de oros.

### 2. Estado y acciones (`juegos/cirulla.ts`)
- **Config:** `{ jugadores: 2 | 4; meta: number }`; por defecto, 2 jugadores y 51.
- **Reparto:** como la Scopa con 2: 4 a la mesa y 3 a cada uno desde el siguiente al que reparte; con 4 también, y las rondas siguientes de 3 hasta acabar el mazo (36 cartas: 6 rondas con 2, 3 con 4). Si la mesa tiene dos Ases o más, se vuelve a barajar con el azar siguiente.
- **Mesa inicial:** se suma la mesa; si está el 7 de copas, vale de 1 a 10 lo que lleve a 30 o, si no, a 15. Con 15, el que reparte se lleva las 4 cartas y se anota 1 escoba; con 30, 2. La mesa queda vacía y lo anota el estado (`mesaInicial`) para el aviso.
- **Acuses:** al dar cada ronda, para cada jugador:
  - tres del mismo valor, con el 7 de copas valiendo lo que haga falta: 10 escobas;
  - si no, suma menor que 10, con el 7 de copas valiendo 1: 3 escobas.

  Se anotan al bando y las cartas quedan a la vista (`acusadas`) hasta que se juegan. El libro dice en un sitio «no supere los 10» y en otro «inferior a 10»: se toma «menor que 10», la regla de Liguria.
- **Acción:** `{ tipo: 'jugar'; carta; captura }`, como la Scopa.
- **Capturas (`capturasCirulla`):**
  - el As, si la mesa no está vacía y no tiene ningún As: la mesa entera, con escoba;
  - si no, las de `capturasScopa` y además las combinaciones de la mesa que suman `15 − valor`, sin repetir ninguna;
  - si hay alguna captura, no se puede dejar la carta.
- **Escoba:** dejar la mesa vacía al capturar, salvo en la última jugada de la mano (también con el As).
- **Recuento (`puntuarManoCirulla`):** el de la Scopa (`puntuarManoScopa`), con todas las escobas (acuses y mesa inicial incluidos), más grande (5) y pequeña (3 + las seguidas del 4 al 6 de oros, hasta 6).
- **Fin:** a la meta, como la Scopa (si los dos pasan, gana quien tenga más; si empatan, se sigue). Si un bando se lleva los diez oros, gana en el acto (`todosLosOros`).
- **Vista:** la de la Scopa, más:
  - las cartas acusadas de cada jugador que aún tiene en la mano;
  - los acuses de la ronda y la mesa inicial, para los avisos.

### 3. IAs
- **Normal (`ia/cirulla-basica.ts`):** la valoración de la Scopa, con:
  - el valor de las cartas de la grande y la pequeña al capturarlas (y al soltarlas, en contra);
  - el riesgo de dejar una mesa que se pueda barrer: con una carta de su valor, sumando 15 o, si no queda ningún As en ella, con un As de los que aún no han salido.
- **Difícil (`ia/reconstruir/cirulla.ts`):** como la de la Scopa: las manos ajenas, el mazo y las recogidas al azar entre las cartas que no se ven, con su tamaño, y las cartas acusadas en la mano de quien las enseñó. Valora la diferencia de puntos de la mano y el bono de la partida.
- **Mediciones** (partidas de 2 a 51):

  | Duelo | Partidas ganadas |
  |---|---|
  | Normal contra el azar | 176 de 200 |
  | Difícil contra la normal | 42 de 60, con 115 ms como máximo por decisión |

### 4. Cliente
- **`captura/MesaCaptura.svelte`:** la mesa de la Scopa, generalizada sin cambiar lo que muestra:
  - la mesa, la mano, el selector de capturas y la recogida;
  - lo propio de cada juego entra por props: la suma que pide cada carta, las cartas visibles de cada rival, un aviso más y el resumen de la mano.
- **`MesaScopa.svelte`:** usa la mesa común; sus E2E no cambian.
- **`MesaCirulla.svelte`:**
  - las cartas acusadas de cada rival, boca arriba junto a su asiento;
  - el aviso de los acuses y de la mesa inicial al empezar cada ronda;
  - la suma que pide la carta elegida: su valor o lo que le falta para 15;
  - las escobas de cada bando y los puntos de la partida, a 51.
- **`ResumenCirulla.svelte`:** el resumen de la Scopa con la grande y la pequeña.
- **Menú:** familia «Captura», con 8 juegos.
- **Guía:** ejemplos comprobados con el motor (una captura a 15, el As que barre la mesa, un acuse y la cirulla pequeña) y la historia.

## Risks / Trade-offs

- **Mesa común con la Scopa** → sus E2E y sus capturas deben quedar igual.
- **El libro mezcla reglas** → donde se contradice, se sigue la Cirulla de Liguria, y se explica en la guía.
- **Acuses visibles** → la vista enseña cartas de las manos ajenas: solo las acusadas, que en el juego real se enseñan.
