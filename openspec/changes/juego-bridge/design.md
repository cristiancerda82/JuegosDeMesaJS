## Context

El Bridge comparte con el Whist la baraja, las parejas y las bazas, pero añade tres cosas que no tiene ningún juego de la suite:
- una subasta con doblos y redoblos;
- un jugador (el declarante) que decide por dos asientos;
- una mano boca arriba, el muerto.

La puntuación Chicago evita arrastrar parciales entre manos: cada mano se puntúa entera con la tabla de duplicado.

## Goals / Non-Goals

**Goals:**
- Bridge Chicago para 4 en parejas, con la subasta completa (pujas, pases, doblos y redoblos) y la puntuación de duplicado.
- El declarante juega por el muerto, también cuando es el humano.
- IA normal con subasta natural sencilla y carteo por reglas; difícil que simula el carteo.

**Non-Goals:**
- Rubber, IMPs, convenciones más allá del Stayman básico y el cambio de papeles para que el humano declare siempre.

## Decisions

### 1. Estado (`juegos/bridge.ts`)
- **Config:** `{ ciclos: 1 | 2 | 3 }`, por defecto 1.
- **Fase:** `'subasta' | 'carteo'`.
- **Manos y repartidor:** `manos` (4 listas), `repartidor`, `manoDelCiclo` (0 a 3) y `manosJugadas`.
- **Subasta:** `subasta`, la lista de declaraciones `{ asiento, declaracion }` con `declaracion` de tipo `pujar { nivel, denominacion }`, `pasar`, `doblar` o `redoblar`.
- **Contrato:** `{ nivel, denominacion, declarante, doblado: 0 | 1 | 2 } | null`.
- **Carteo:** `turno`, `baza` (cartas con su asiento), `ultimaBaza`, `bazasPareja`, `jugadas` (las cartas jugadas en la mano), `jugadasPor` (por asiento, para la reconstrucción) y `fallos` (palos que cada asiento no ha seguido).
- **Marcador:** `puntos` (por pareja), `resultados` (uno por mano jugada) y `azar`.
- **Denominaciones:** `'treboles' | 'diamantes' | 'corazones' | 'picas' | 'sinTriunfo'`, en ese orden.

### 2. Acciones
- **Subasta:** `pujar { nivel, denominacion }`, `pasar`, `doblar` y `redoblar`.
- **Carteo:** `jugar { carta }`.
- **Quién actúa:** `accionesLegales(e, asiento)` da las acciones de quien tiene el turno, salvo cuando le toca al muerto. Entonces se las da al declarante, y la carta sale de la mano del muerto. La interfaz del motor ya trabaja con el asiento que actúa, así que el muerto simplemente no tiene acciones en toda la mano.
- **Pujas legales:** se generan todas las pujas por encima de la última (hasta 35), más pasar, doblar y redoblar cuando proceden.
- **Todos pasan:** con cuatro pases y ninguna puja, se reparte de nuevo con el `azar`, con el mismo repartidor y la misma `manoDelCiclo`.

### 3. Puntuación
- **`puntuarManoBridge(contrato, bazas, vulnerable)`** es una función pura que devuelve los puntos de la pareja del declarante y de la rival, según la tabla de la spec.
- **`vulnerabilidadBridge(manoDelCiclo, repartidor)`** devuelve `[boolean, boolean]` por pareja.
- **Fin:** cuando `manosJugadas` llega a `4 × ciclos`. Gana la pareja con más puntos; los `puntos` del `Fin` van por asiento, con los de su pareja.

### 4. Vista
- **Visible:** su mano; `muerto` (las cartas del muerto o `null` si aún no se ha jugado la primera carta); `cartasEnMano`; la subasta; el contrato; la vulnerabilidad; la baza y la última; `jugadas`, `jugadasPor` y `fallos`; las bazas de cada pareja, `puntos`, `resultados`, `manoDelCiclo` y `turno`.
- **`juegaPorElMuerto`:** `true` en la vista del declarante cuando le toca al muerto.

### 5. IAs
- **Normal (`ia/bridge-basica.ts`):**
  - **Subasta:** una función `pujaBridge(vista)` con las reglas de la spec. Estima los puntos del compañero por su primera puja: apertura de 1 en palo, 12–14; 1 sin triunfo, 15–17; 2 sin triunfo, 20–21; respuesta de apoyo a nivel 2, 6–9…
  - **Carteo:** como la del Whist, con las reglas de salida, segunda, tercera y cuarta mano. Como declarante, cuando le toca al muerto o a sí mismo, cuenta las cartas de las dos manos para arrastrar y jugar las ganadoras seguras.
- **Difícil (`ia/reconstruir/bridge.ts`):** `SIMULABLE_BRIDGE`.
  - **Subasta:** `decideLaBase` en la fase de subasta, que decide como la normal.
  - **Carteo:** simula cada carta hasta el final de la mano.
  - **Valoración:** los puntos de la mano de su pareja menos los de la rival, más las bazas como desempate.
  - **Reconstrucción:** se respetan el muerto descubierto y los fallos (con `repartirConPermitidos`).
  - `reconstrucciones` 12 y `presupuesto` 120: decide en unos 105 ms como máximo y gana a la normal 153 de 200 partidas.

### 6. Cliente
- **`MesaBridge.svelte`:** sobre `MesaBazas` y sus asientos.
  - El asiento del muerto se pinta con sus cartas boca arriba. Si el jugador es el declarante, esas cartas son jugables en el turno del muerto (testid `abierta-{carta}`). Para ello, la mesa de bazas común (`MesaBazas` y `AsientoRival`) admite ahora la mano entera de un asiento boca arriba y jugable.
  - **Caja de subasta:** el historial en cuatro columnas por asiento y, en su turno, la rejilla de pujas por nivel (testid `puja-{nivel}-{denominacion}`), con `pasar`, `doblar` y `redoblar`.
  - **Barra de información:** el contrato (`contrato`), la vulnerabilidad (`vulnerabilidad`), las bazas por pareja y el marcador.
- **`ResumenBridge.svelte`:** el resumen de cada mano y la tabla de la pantalla de fin.
- **Opciones:** los ciclos 1, 2 o 3.

## Risks / Trade-offs

- **[Un jugador para dos asientos]** → `accionesLegales` y la vista del declarante lo resuelven en el motor. La red y las IAs no necesitan cambios, porque siempre preguntan por el asiento que tiene acciones.
- **[Rejilla de 35 pujas en 360 px]** → La rejilla se pinta en 7 filas de 5 botones pequeños y solo muestra las pujas legales activas.
- **[Coste de la difícil]** → Son 13 bazas con 4 manos y 52 cartas. Se empieza con presupuesto 120 y se baja si la prueba de tiempo pasa de 250 ms.
- **[Subasta sencilla]** → La IA no conoce convenciones ajenas al sistema. Las pujas del humano se interpretan como naturales.
