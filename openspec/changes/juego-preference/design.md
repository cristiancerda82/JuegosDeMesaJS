## Context

El Préférence combina piezas que ya tiene la suite:
- la subasta de bazas por palo con la miseria y la viuda con descarte del Five Hundred;
- la baraja de 32 cartas del Skat y del Schafkopf;
- la mesa de bazas para tres del Skat.

Lo nuevo es el whist de los defensores, la raspasy y la cuenta en tres columnas (pulka, montaña y whists) con el cierre de cuentas.

## Goals / Non-Goals

**Goals:**
- Préférence de Sochi para 3, con miseria, raspasy y pulka a 10, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El «aquí» del primer jugador, el medio whist, el juego a cartas vistas, la progresión de la raspasy y los whists por el exceso de la pulka.

## Decisions

### 1. Cartas y pujas (`juegos/preference.ts`)
- **Baraja:** `BARAJA_PREFERENCE`, la francesa con A, 7, 8, 9, 10, J, Q y K, como la del Skat.
- **Rango:** A 8, K 7, Q 6, J 5, 10 4, 9 3, 8 2 y 7 1.
- **Pujas:** `PujaPreference = { tipo: 'bazas', bazas, palo: PaloFrances | 'sin' } | { tipo: 'miseria' }`, como en el Five Hundred.
  - **Orden:** `ordenPujaPreference`: `10 * bazas + índice del palo` (picas 0 … sin triunfo 4). La miseria vale 85, entre el 84 del 8 sin triunfo y el 90 del 9 de picas.
  - **Valor:** `valorContratoPreference`: `2 * (bazas - 5)` para las de bazas y 10 para la miseria.

### 2. Estado
- **Config:** `{ jugadores: 3, meta: 10 }`. La meta va en la config para que las pruebas usen partidas cortas; el cliente juega siempre a 10.
- **Fases:** `'subasta' | 'descarte' | 'contrato' | 'whist' | 'bazas'`.
- **Subasta:** `pujas` (la última de cada uno, `'paso'` o `null`), `mejor` y `pujoAntes` (si ya pujó, para la miseria).
- **Viuda y contrato:** `viuda`, `viudaVista`, `descartes`, `juega`, `contrato` (`null` en la raspasy) y `whist` (la decisión de cada defensor, o `null`).
- **Bazas:** `manos`, `turno`, `mesa`, `ultimaBaza`, `bazas` por jugador, `jugadasPor` y `fallos` (palos de salida no seguidos, y `'triunfo'` si además no echó triunfo).
- **Cuenta:** `pulka`, `montana` (por jugador) y `whists` (matriz 3 × 3: los que cada uno se apuntó contra cada otro), y `resultadosManos`.

### 3. Acciones
- `pujar { puja }`, `pasar`, `descartar { carta }` (una carta por acción, como en el Skat; tras la segunda, el contrato, o las bazas con miseria), `declarar { puja }`, `whist`, `pasarWhist` y `jugar { carta }`.
- **Subasta:** tras cada acción, el turno va al siguiente que no ha pasado.
  - Si todos han pasado, raspasy.
  - Si solo queda uno sin pasar y ya pujó, gana la subasta y pasa a `descarte` con la viuda en su mano.
- **Contrato:** `declarar` acepta las pujas de bazas de orden mayor o igual que la ganadora; con miseria, solo la miseria.
- **Whist:** los dos defensores deciden en orden de juego; si ninguno hace whist, la mano se cierra cumplida. La miseria salta del contrato a las bazas.
- **Bazas:** `cartasLegalesPreference(mano, mesa, triunfo)` con la obligación de fallar.

### 4. Cuenta (`puntuarManoPreference`)
- Con el contrato, quién juega, quién hace whist y las bazas de cada uno, devuelve lo que suma cada uno a su pulka, a su montaña y a sus whists, con las reglas de la spec. La raspasy suma 1 de montaña por baza.
- **Bazas que tocan a los que hacen whist:** 6 → 4, 7 → 2, 8 y 9 → 1, 10 → 0.
- **Saldo (`saldosPreference`):** el cierre de la spec. Se calcula en tercios (× 3) para comparar sin decimales; los saldos que se muestran se dividen entre 3 y se redondean a un decimal.
  - Cada resultado de mano guarda el saldo de las columnas de esa mano (`saldo`), que suma al final lo mismo que el cierre (las fórmulas son lineales). La IA difícil lo usa para valorar.
- **Fin:** al cerrar una mano, si las pulkas suman tres veces la meta, la partida termina. Esperar a que cada pulka llegue a la meta podría no acabar nunca si un jugador casi no gana contratos: en el juego real, el exceso de los demás le cierra la pulka, y aquí ese exceso cuenta en la suma y resta deuda a su dueño en el cierre. Además, la partida termina tras 60 manos (`MANOS_MAXIMAS_PREFERENCE`): con jugadores que pujan alto y fallan siempre (como los que juegan al azar en las pruebas), la pulka no crece y la partida no acabaría. `resultado` da los saldos como `puntos` y gana el más alto.

### 5. Vista
- La mano propia, los descartes propios y la viuda si `viudaVista`.
- Todo lo demás que lista la spec; las cartas ajenas, nunca.

### 6. IAs
- **Normal (`ia/preference-basica.ts`):** las reglas de la spec, con `bazasEsperadasPreference(mano, triunfo)`: 1 por As; el rey, 1 con el As o con otra carta y medio si va solo; la dama, medio con el As, el rey o dos cartas más; y en triunfo, 1 por cada carta pasada de la segunda. Al pujar suma 1 por la viuda: con una estimación más prudente, casi todas las manos acababan en raspasy y la partida no avanzaba.
- **Difícil (`ia/reconstruir/preference.ts`):** `SIMULABLE_PREFERENCE`.
  - **Reconstrucción:**
    - con `repartirConPermitidos`, las manos ajenas con los palos y triunfos no seguidos;
    - la viuda sin enseñar y los descartes ajenos, al azar, como huecos más sin restricciones.
  - **Decisiones como la normal:** `decideLaBase` en todas las fases menos `bazas`.
  - **Valoración:** el saldo de la mano del asiento, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80, comprobados con la prueba de fuerza: un asiento difícil contra dos normales gana 122 de 200 partidas (la parte justa es 67), con 110 ms por decisión como mucho; la normal gana las 200 contra el azar.

### 7. Cliente
- **`MesaPreference.svelte`:** sobre `MesaBazas` con 3 jugadores, como `MesaSkat`.
  - **Subasta:** un panel en dos filas como el del Five Hundred: los números (6 a 10) y, al elegir uno, los palos y el sin triunfo; la miseria y «Pasar» aparte.
  - **Descarte:** se toca una carta y luego la mesa, dos veces, como al jugar una carta. Las cartas de la viuda enseñada se pintan con `data-viuda` y no `data-carta`, para que la animación de las cartas de `MesaBazas` no las tome por cartas de la mesa.
  - **Contrato:** el mismo panel que la subasta, sin «Pasar».
  - **Whist:** «Whist» y «Paso».
  - **Información:** el contrato, quién juega, quién hace whist, la viuda enseñada y la cuenta de cada jugador.
- **`ResumenPreference.svelte`:** el contrato y las bazas; por jugador, lo que suma a la pulka, a la montaña y a los whists, y los totales. Con `saldos`, la tabla del cierre de cuentas para la pantalla de fin.
- **Fin:** juego sin parejas: entra en la lista de juegos sin parejas de `Fin.svelte`.

## Risks / Trade-offs

- **[Raspasy larga]** → Si la IA pasa mucho, se juegan muchas raspasy sin pulka y la partida se alarga. La IA normal puja con 6 bazas esperadas, que es lo habitual; las pruebas usan una meta corta.
- **[Simplificaciones de Sochi]** → Las de la propuesta: el juego queda completo y jugable, y cada una podría añadirse después como opción.
