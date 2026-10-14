## Context

La Pocha dejó la mesa de bazas (`MesaBazas`) preparada para juegos sin parejas:
- props `nombre` y `detalle` por asiento;
- `lado()` para 3 y 4 jugadores;
- la última baza de la mano anterior conservada en el motor, para verla antes del resumen.

El panel de fin de mano que pausa la sesión es el mismo patrón en la Pocha, el Guiñote y el Mus. `Carta` ya dibuja la baraja francesa.

## Goals / Non-Goals

**Goals:**
- Corazones completos con pase, restricciones de la primera baza y de los corazones rotos, luna y partida a 100 o 50.
- La IA básica y la mesa con el pase de 3 cartas.

**Non-Goals:**
- La J de diamantes, restar 26 al tirar la luna, otro número de jugadores y el juego en red.

## Decisions

### 1. Estado (`juegos/corazones.ts`)
`EstadoCorazones` guarda:
- `config` (`pase: boolean`, `fin: 100 | 50`), `azar`, `numeroMano` y `manos`;
- `fase: 'pase' | 'juego'` y `pases: (IdCarta[] | null)[]`, ocultos para los demás;
- `recibidas: IdCarta[][]` (lo que recibió cada uno, que solo ve él) y `turno`;
- `mesa: CartaJugada[]`, `ultimaBaza`, `bazasJugadas` y `rotos: boolean`;
- `puntosMano: number[]`, `resultadosManos: ResultadoManoCorazones[]` y `totales: number[]`.

Acciones: `pasar {cartas: [3]}` y `jugar {carta}`.

**Pase:**
- La dirección es `[1, 3, 2, 0][numeroMano % 4]`: desplazamiento de asiento al siguiente, al anterior, al de enfrente o sin pase. Sin la opción de pase, siempre 0.
- Se elige en orden desde el asiento 0. Al elegir el cuarto, se entregan todas a la vez.
- `accionesLegales` ofrece las 286 combinaciones de 3 cartas, en el orden de la mano.

**Juego:**
- Tras el pase (o si no hay), sale quien tiene `treboles-2` y su única carta legal es esa.
- **Legales:**
  1. con baza empezada, las del palo de salida si tiene;
  2. en la primera baza, sin puntos si tiene otras;
  3. al salir, sin corazones si no están rotos y tiene otras.
- **Rango:** As 14, Rey 13…2. Gana la más alta del palo de salida.
- **Rotos:** pasa a `true` al jugarse un corazón.

**Al acabar las 13 bazas:**
1. Se calculan los puntos de la mano; si alguien tiene 26, luna.
2. Se registra el resultado y se suman los totales.
3. Si alguien llega a `fin`, termina la partida. Si no, se reparte la mano siguiente conservando `ultimaBaza`.

### 2. Vista
Muestra:
- `miMano`, `cartasEnMano`, `fase`, `direccionPase` y `miPase` (las cartas que eligió, mientras dura el pase);
- `recibidas` (solo las suyas, durante la primera baza);
- `pasaron` (quién ya eligió), `mesa`, `ultimaBaza`, `rotos`, `turno`;
- `puntosMano`, `numeroMano`, `resultadosManos` y `totales`.

El oráculo de la suite del contrato:
- excluye las cartas que pasó el propio asiento, porque sabe dónde están;
- excluye las de `ultimaBaza`, porque ya se vieron.

### 3. IA básica (`ia/corazones-basica.ts`)
- **Peligro de una carta** (para pasar y para descartarse):
  - la Q de picas, 100;
  - el A y el K de picas, 60 y 50;
  - los corazones, 20 más su rango;
  - el resto, su rango.

  Pasa las 3 de más peligro.
- **Seguir el palo:** la más alta por debajo de la ganadora actual. Si no hay, siendo el último la más alta y si no la más baja.
- **Sin el palo:** la Q de picas, luego el corazón más alto y luego la de más peligro.
- **Salir:** la más baja de un palo que no sea corazones; si solo hay corazones (o no se puede), la más baja legal.

Es determinista.

### 4. Cliente (`MesaCorazones.svelte`)
- **Mesa:** `MesaBazas` con `nombre` («Tú», «Rival 1…3») y `detalle` («N pts · total T»).
- **`info`:** «Mano N · Pasas a X» o «Sin pase», y «Corazones rotos» cuando lo están.
- **Pase:** un panel sobre la mesa con la mano propia en botones de carta para marcar 3 y el botón «Pasar a X».
  - Tras pasar, el panel muestra «Esperando a los demás» mientras pasan las IAs.
  - Con las cartas entregadas, un aviso breve en la mesa: «Recibes: …», con las 3 cartas.
- **Pausas (`DEF_CORAZONES`):** las de bazas, y la de la última baza al cerrar la mano. El resumen lo pausa el panel.
- **Panel de fin de mano:** la tabla de puntos de la mano y los totales, con la luna marcada.
- **Fin:** la clasificación por puntos, de menos a más.

## Risks / Trade-offs

- **286 acciones de pase por jugador** → no supone problema de rendimiento. La IA elige por peligro, y el agente aleatorio de los tests elige una combinación al azar.
- **El pase cambia lo que sabe cada uno** → el oráculo excluye las cartas propias pasadas. Hay un test de que las elegidas por los demás no aparecen en la vista.
- **Mesa de 4 sin parejas con `nombreAsiento`** → se pasa `nombre` propio para no llamar «Compañero» al de enfrente.
