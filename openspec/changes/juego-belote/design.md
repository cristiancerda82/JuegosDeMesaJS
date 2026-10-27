## Context

El Belote es un juego de bazas por parejas como el Euchre, el Whist y Picas, ya en la suite. Lo nuevo:
- la elección del triunfo en dos vueltas con la carta vuelta, seguida del reparto del resto del mazo;
- el orden y el valor distintos de las cartas en el triunfo (J y 9 arriba);
- las obligaciones de montar y de fallar, que dependen de quién va ganando la baza;
- el belote-rebelote y la puntuación por puntos de cartas, con *dentro* y *capot*.

## Goals / Non-Goals

**Goals:**
- Belote clásico a 501, con tomar, nombrar, montar, fallar y belote-rebelote.
- Reutilizar la mesa de bazas común (`MesaBazas`) y la muestra de la carta vuelta del Euchre.
- IA normal por reglas y difícil por simulación de las bazas que le gane.

**Non-Goals:**
- Los anuncios de tercera, cincuenta, cien y cuadrados, el litigio, el Coinche y partidas a otros puntos.

## Decisions

### 1. Orden y valor (`juegos/belote.ts`)
- **Baraja:** `BARAJA_BELOTE`, la francesa de 52 sin las cartas del 2 al 6.
- **Rango:** `rangoBelote(carta, triunfo)` da el orden dentro de su palo: en el triunfo J 8, 9 7, A 6, 10 5, K 4, Q 3, 8 2 y 7 1; en los demás A 8, 10 7, K 6, Q 5, J 4, 9 3, 8 2 y 7 1.
- **Valor:** `valorBelote(carta, triunfo)` con los puntos de la carta.
- **Ganador:** `ganaBelote(mesa, triunfo)` da quién va ganando la baza.

### 2. Fases y estado
- **Fases:** `fase: 'primera' | 'segunda' | 'bazas'`.
- **Reparto y triunfo:** `manos`, `cartaVuelta`, `mazo` (las 11 que quedan), `repartidor`, `turno`, `pasaron` (número de pases en la vuelta), `triunfo` (`null` hasta elegirlo) y `elige` (asiento).
- **Bazas:** `mesa`, `ultimaBaza`, `jugadas` (cartas jugadas en la mano), `puntosBazas` por pareja, `bazas` por pareja y `fallos`: por asiento, los palos que ya no tiene (el de salida que no siguió y el triunfo si no falló cuando debía).
- **Belote:** `belote`: el asiento que tiene el rey y la dama del triunfo (calculado al elegirlo, oculto en la vista), y `anuncios`: los anuncios ya hechos (`{ asiento, tipo: 'belote' | 'rebelote' }`), públicos.
- **Partida:** `puntos` por pareja, `resultadosManos`, `manosAnuladas`, `ultimaAccion` y `azar`.

### 3. Acciones
- **`tomar`:** primera vuelta.
- **`nombrar { palo }`:** segunda vuelta, palo distinto del de la carta vuelta.
- **`pasar`:** en cualquiera de las dos vueltas.
- **`jugar { carta }`:** en las bazas. `accionesLegales` aplica seguir el palo, montar y fallar. El anuncio de belote o rebelote es automático al jugar el rey o la dama de quien tiene los dos.

### 4. Puntos
- **Al acabar las 8 bazas:** cada pareja suma el valor de sus cartas y la última baza 10 más; el belote suma 20 a su pareja.
- **Cumple:** si la pareja que eligió tiene al menos tantos puntos como la otra (contando el belote), cada pareja se apunta los suyos.
- **Dentro:** si no, la otra pareja se apunta 162 más su belote, y la que eligió solo su belote.
- **Capot:** la pareja que hace las 8 bazas se apunta 252 más su belote (si es la que eligió, la otra se apunta solo su belote).
- **Registro:** `resultadosManos` guarda `{ elige, triunfo, cartas: [n, n], ultimas: pareja, belote: pareja | null, bazas: [n, n], puntosMano: [n, n], totales: [n, n], dentro, capot }`.
- **Fin:** al acabar una mano con alguna pareja en 501 o más y sin empate; gana la que más tiene.

### 5. Vista
- **Públicas:**
  - la carta vuelta mientras se elige el triunfo, y quién la tomó después;
  - el triunfo y quién lo eligió;
  - la mesa, la última baza, las jugadas, los puntos de las bazas, los fallos y los anuncios;
  - los puntos de la partida y los resultados de las manos.
- **Ocultas:** las manos ajenas, el mazo y quién tiene el belote antes de anunciarlo.

### 6. IAs
- **Normal (`ia/belote-basica.ts`):**
  - **Fuerza de la mano en un palo:** J del triunfo 4, 9 del triunfo 3, As del triunfo 2, otros triunfos 1 y Ases de otros palos 1,5. En la primera vuelta la carta vuelta cuenta como suya.
  - **Tomar:** con 7 o más y al menos 3 triunfos.
  - **Nombrar:** el mejor palo si llega a 8.
  - **Bazas:** si la baza va para su compañero, echa la carta legal que más vale sin ser triunfo (cargar); si puede ganarla, la gana con la carta legal más barata que la gane; si no, juega la carta legal que menos vale. Al salir, juega el As de un palo que no es triunfo, o la J del triunfo si la tiene, y si no la carta que menos vale.
- **Difícil (`ia/reconstruir/belote.ts`):** `SIMULABLE_BELOTE`.
  - **Qué simula:** solo las bazas (`decideLaBase` en las fases de elegir el triunfo).
  - **Reconstrucción:** las manos ajenas salen al azar de las cartas que no se ven, respetando los `fallos`. La carta vuelta sigue en la mano de quien eligió mientras no la juegue, y quien anunció «Belote» guarda la otra carta. Durante las bazas el mazo está vacío.
  - **Valoración:** los puntos de la mano de su pareja menos los de la otra.
  - Valores de partida: `reconstrucciones` 20 y `presupuesto` 100.

### 7. Cliente
- **`MesaBelote.svelte`:** sobre `MesaBazas`, como la del Euchre.
  - **Muestra:** la carta vuelta mientras se elige.
  - **Información:** el triunfo, quién lo eligió, los puntos de las bazas de cada pareja en la mano y los puntos de la partida.
  - **Acciones:** los botones «Tomo», «Picas», «Corazones»… y «Paso».
  - **Aviso:** «Belote» o «Rebelote» junto a quien lo anuncia.
- **`ResumenBelote.svelte`:** quién eligió, los puntos de cartas, el diez de últimas, el belote, los puntos que se apunta cada pareja (con *dentro* o *capot*) y los totales.

## Risks / Trade-offs

- **[Las reglas de montar y fallar dejan pocas cartas legales]** → La simulación tiene menos ramas y la difícil gana poco a la normal. Si no le gana, se suben las reconstrucciones como en el Cribbage.
- **[Manos anuladas]** → Si los cuatro pasan dos veces, la mano no cuenta. La IA toma con manos medianas y es raro que pase muchas veces.
- **[Reconstrucción con fallos de triunfo]** → Si las restricciones no dejan repartir (muy raro), se usa `repartirConPermitidos` como en otros juegos de bazas, que ya contempla el caso.
