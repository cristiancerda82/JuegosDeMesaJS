## Context

La Brisca y el Tute ya comparten `motor/bazas.ts`, con quién gana la baza, el robo, las obligaciones y el cambio del 7, y `ia/bazas-heuristica.ts`, con la elección de carta al salir y al responder. En el cliente comparten `MesaBazas.svelte`, que tiene la mano propia, los rivales, el mazo con la muestra, la baza en curso y los snippets `info`, `acciones` y `detalleAviso`. El Guiñote es casi un Tute de 6 cartas, pero tiene dos diferencias que tocan el código compartido:

- **Orden y puntos:** la sota (3 puntos) va por encima del caballo (2). `fuerza` y `puntosDe` llevan hoy fijo el orden de la Brisca.
- **Partida:** se juega a puntos acumulados hasta 101, no a manos ganadas.

## Goals / Non-Goals

**Goals:**
- Guiñote completo para 2 jugadores y para 4 en parejas, reutilizando el motor de bazas, la heurística y `MesaBazas`.
- Generalizar el orden y el valor de las cartas en el módulo de bazas sin cambiar el comportamiento de la Brisca ni del Tute.

**Non-Goals:**
- Contar los puntos a mitad de una mano de vueltas.
- El Guiñote de 3 jugadores.
- Los cantes en el arrastre y el «tute» de algunas variantes.
- El juego en red.

## Decisions

### 1. Valores de las cartas como parámetro del módulo de bazas
Se crea `interface ValoresBazas { orden: readonly number[]; puntos: Record<number, number> }` con dos constantes: `VALORES_BRISCA` (la actual) y `VALORES_GUINOTE` (`[1, 3, 12, 10, 11, 7, 6, 5, 4, 2]`; as 11, tres 10, rey 4, sota 3, caballo 2). Reciben `valores = VALORES_BRISCA` como último parámetro opcional `fuerza`, `puntosDe`, `cartaGanadora`, `cartaDeCambio` y `cartasObligadas` (este último, dentro de sus opciones). En la heurística, `SituacionBaza` gana un campo opcional `valores` y `coste`, `masBarata` y `cartaParaSalir` reciben el mismo parámetro opcional.

- *Alternativa descartada:* copiar el módulo de bazas en un `guinote-bazas.ts` duplicaría el código, y el proyecto pide que las variantes sean configuración, no código duplicado.
- *Alternativa descartada:* meter los valores en el `IdCarta` o en la baraja. Mezclaría las reglas de un juego con el modelo de cartas.

### 2. `juegos/guinote.ts` propio, no una variante del Tute
El Tute tiene tute, 8 o 10 cartas, reparto completo con 4 jugadores y partida a manos ganadas. El Guiñote tiene 6 cartas, muestra también con 4, cantes con sota, sin cantes en el arrastre, y partida a puntos con vueltas. Un juego aparte de unas 300 líneas, que copia la forma de `tute.ts` y usa el módulo de bazas, se lee mejor que llenar `tute.ts` de condiciones.

Estado (`EstadoGuinote`): `config`, `azar`, `repartidor`, `mazo`, `muestra`, `triunfo`, `manos`, `mesa`, `turno`, `puntos` (de la mano, por asiento), `bazas`, `ultimaBaza`, `cantes`, `puedeCantar`, `resultadosManos: ResultadoManoGuinote[]` y `totales: [number, number]`.

`ResultadoManoGuinote = { bazas: [n, n], cantes: [n, n], ultimas: 0 | 1, puntos: [n, n], totalesTras: [n, n] }`. Así la mesa puede mostrar el desglose sin recalcularlo.

Acciones: `jugar{carta}`, `cambiarSiete`, `cantar{palo}`.

### 3. Reglas concretas
- **Reparto:** 6 cartas a cada jugador, desde el siguiente al repartidor. La carta siguiente es la muestra (boca arriba, al fondo del mazo), y el mazo queda con 27 cartas con 2 jugadores o con 15 con 4. Se usa el mismo `robar` del módulo de bazas, que entrega la muestra en el último robo.
- **Arrastre** (`mazo.length === 0 && muestra === null`): `cartasObligadas(mano, mesa, triunfo, { asiento, montarSobreCompanero, valores: VALORES_GUINOTE })`. Antes, cualquier carta.
- **Cantes:** con `puedeCantar === asiento && mesa.length === 0 && !arrastre`, por cada palo con rey (12) y sota (10) que no se haya cantado. Valen 40 si son del palo de triunfo y 20 si no.
- **Cambio del 7:** `cartaDeCambio(muestra, VALORES_GUINOTE)` (el 7, o el 2 si la muestra es un 7 o menor), con `mazo.length > 0`. Con `'trasGanarBaza'` basta con que su **bando** haya ganado una baza; en parejas eso permite que cambie cualquiera de los dos.
- **Fin de la mano:** sumar los totales. Si `max(totales) >= meta` y `totales[0] !== totales[1]`, la partida termina. Si no, se reparte una mano nueva con el repartidor siguiente.
- `resultado`: el bando con más puntos gana, y la puntuación de cada asiento es el total de su bando.

### 4. IA básica (`ia/guinote-basica.ts`)
Sigue el patrón de `iaTuteBasica`. Canta las 40 antes que las 20 y cambia el 7. Mientras queda mazo, guarda el rey y la sota de las parejas que todavía puede cantar. Después elige con `cartaParaSalir` o `cartaParaResponder` usando `VALORES_GUINOTE`. Es determinista.

### 5. Cliente
- `MesaGuinote.svelte` sobre `MesaBazas`, como `MesaTute`:
  - En `info`: el triunfo, el marcador con la meta («Nosotros 70 · Ellos 60 / 101»), la lista de cantes y el aviso «Arrastre».
  - En `acciones`: los botones de cantar y de cambiar el 7.
  - En `detalleAviso`: el rey y la sota del cante.
- `ResumenGuinote.svelte` muestra el desglose por bando (bazas, cantes, últimas, mano y total) y el aviso «Se juega de vueltas». La mesa lo enseña al terminar una mano y pausa la sesión (`pausar`/`reanudar`) hasta «Siguiente mano», como en el Chinchón. En la pantalla de fin se muestra el resumen de la última mano y el marcador final.
- `DEF_GUINOTE` en `juegos.ts`, `IdJuego` con `'guinote'`, `partida.ts`, el guardado, el menú, las opciones, los textos y la guía.

## Risks / Trade-offs

- **Cambiar las firmas de bazas podría romper la Brisca o el Tute** → los parámetros nuevos son opcionales y por defecto valen `VALORES_BRISCA`. Las suites de la Brisca y el Tute se ejecutan sin cambios como regresión.
- **Variantes regionales** (cantes con caballo, cantar en el arrastre, cambio solo con el 7) → se documentan las reglas elegidas y las valida el usuario. Si hace falta, se añaden como opciones de configuración.
- **Partidas largas si se empata en la meta** → solo se reparte otra mano. En la práctica empatar es muy raro, y las simulaciones comprueban que todas las partidas terminan.
