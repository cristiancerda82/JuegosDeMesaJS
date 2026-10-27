## Context

El Schnapsen es un juego de bazas para dos con mazo, como la Brisca y el Guiñote de dos que ya están en la suite. Lo nuevo:
- la baraja francesa de 20 cartas con el orden As, 10, K, Q y J;
- el cierre del mazo, que cambia las reglas a mitad de mano y cambia cómo se puntúa;
- el fin de la mano en cuanto alguien llega a 66, con los cantes pendientes hasta ganar una baza;
- la partida por puntos de partida (*bummerl*) en lugar de por puntos de cartas.

## Goals / Non-Goals

**Goals:**
- Schnapsen clásico de 20 cartas, con cambio de la J, cantes, cierre del mazo y *bummerl* a 7.
- Reutilizar la mesa de bazas común (`MesaBazas`) con su mazo y su muestra, como la Brisca.
- IA normal por reglas y difícil por simulación de todas sus decisiones, que le gane.

**Non-Goals:**
- Decir «me bastan» a mano, y la variante de 24 cartas.

## Decisions

### 1. Cartas (`juegos/schnapsen.ts`)
- **Baraja:** `BARAJA_SCHNAPSEN`, la francesa de 52 con solo As, 10, J, Q y K.
- **Rango y valor:** `rangoSchnapsen(carta)` (As 5, 10 4, K 3, Q 2 y J 1) y `valorSchnapsen(carta)` (11, 10, 4, 3 y 2).
- **Ganador:** `ganadoraSchnapsen(mesa, triunfo)`.
- **Legales:** `cartasLegalesSchnapsen(mano, mesa, triunfo, estrictas)`: sin reglas estrictas, cualquiera; con ellas, seguir y ganar, fallar o cualquiera.

### 2. Estado
- **Reparto:** `manos`, `mazo` (boca abajo, la siguiente que se roba es la primera), `cartaVuelta` (`null` cuando ya se robó), `triunfo`, `repartidor` y `turno`.
- **Cierre:** `cerrado`: `null`, o `{ asiento, bazasRival, puntosRival }` con el estado del rival al cerrar.
- **Bazas:** `mesa`, `ultimaBaza`, `jugadas`, `puntosBazas` y `bazas` por asiento.
- **Cantes:** `cantes` (`{ asiento, palo, puntos }`, públicos) y `cantado`: el palo recién cantado, que obliga a salir con su K o su Q.
- **Lo que se sabe de la mano del rival:** `fallos` por asiento (palos que no tiene, sabidos por las reglas estrictas) y `cambiada`: el asiento que se llevó la carta vuelta al cambiar la J, y esa carta, mientras no la juegue.
- **Partida:** `puntos` (de partida) por asiento, `resultadosManos`, `ultimaAccion` y `azar`.

### 3. Acciones
- **`cambiar`:** cambia la J del triunfo por la carta vuelta.
- **`cantar { palo }`:** solo al salir, sin otro cante pendiente de jugar en esa salida.
- **`cerrar`:** solo al salir, con el mazo abierto y con cartas.
- **`jugar { carta }`.**

Las tres primeras se pueden hacer en la misma salida antes de jugar, en cualquier orden. Tras `cerrar` ya no se puede `cambiar`.

### 4. Fin de la mano
- **Puntos de la mano:** `puntosBazas` más los cantes del jugador si tiene alguna baza.
- **Comprobación:** tras cada baza y tras cada cante, si alguien llega a 66 gana la mano. Si no quedan cartas: con el mazo cerrado, gana el que no cerró; si no, quien hizo la última baza.
- **Puntos de partida:** `puntosDePartida(bazasPerdedor, puntosPerdedor)` da 3, 2 o 1. Con el mazo cerrado se usa el estado del rival al cerrar: si ganó quien cerró, sobre ese estado; si no, 2, o 3 si el otro no tenía bazas al cerrar.
- **Registro:** `resultadosManos` guarda `{ ganador, motivo: '66' | 'ultima' | 'cierre', puntosMano: [n, n], bazas: [n, n], puntosPartida, totales: [n, n] }`.
- **Siguiente mano:** reparte el otro. La partida termina cuando alguien llega a 7.

### 5. Vista
- **Públicas:**
  - las cartas en el mazo, la carta vuelta y el cierre;
  - la mesa, la última baza, las jugadas, los puntos de las bazas, las bazas, los cantes, los fallos y la carta vuelta cambiada;
  - los puntos de partida y los resultados.
- **Ocultas:** la mano del rival y las cartas boca abajo del mazo.

### 6. IAs
- **Normal (`ia/schnapsen-basica.ts`):** como dice la spec de `ia-jugadores`.
  - **Orden de preferencia al salir:** `cambiar`, luego `cantar` (el de más puntos) y luego `cerrar` si se cumple la condición.
  - **Tras cantar:** sale con la Q, y guarda el K.
- **Difícil (`ia/reconstruir/schnapsen.ts`):** `SIMULABLE_SCHNAPSEN`.
  - **Qué simula:** todas las decisiones.
  - **Reconstrucción:** la mano del rival y el mazo se reparten al azar entre las cartas que no se ven, respetando los fallos. La carta vuelta cambiada y la otra carta de un cante del rival quedan en su mano.
  - **Valoración:** los puntos de partida de la mano (a favor o en contra), más una fracción de la diferencia de puntos de la mano.
  - Valores de partida: `reconstrucciones` 20 y `presupuesto` 100.

### 7. Cliente
- **`MesaSchnapsen.svelte`:** sobre `MesaBazas` con el mazo y la carta vuelta como muestra.
  - **Mazo cerrado:** la carta vuelta se muestra tapada con el rótulo «Cerrado».
  - **Información:** el triunfo, los puntos de la mano y las bazas de cada uno, y los puntos de partida.
  - **Acciones:** los botones «Cambiar la J», «Cantar 20 ♠»… y «Cerrar».
  - **Avisos:** de cada cante, cambio y cierre.
- **`ResumenSchnapsen.svelte`:** quién ganó y por qué, los puntos de la mano, los puntos de partida y los totales.

## Risks / Trade-offs

- **[Fin automático a 66]** → Simplifica la interfaz y la IA, pero no deja equivocarse al decir «me bastan». Queda fuera de alcance.
- **[El cierre con poca información]** → La IA normal cierra solo con una mano casi segura. La difícil decide cerrar por simulación.
- **[Reglas estrictas sin mazo y reconstrucción]** → Los fallos solo se anotan con las reglas estrictas, que es cuando se sabe algo. Si no se puede repartir con ellos, se usa `repartirConPermitidos`, como en otros juegos de bazas.
