## Context

Ya hay casi todas las piezas:
- **Bazas del Julepe:** son las de la Pocha, sin parejas y con triunfo. `cartasObligadas(..., { montarSobreCompanero: true })` y `cartaGanadora` con `VALORES_BRISCA`.
- **Carta de triunfo a la vista en la mano del repartidor:** como la `cartaTriunfo` de la Pocha.
- **Jugadores que no juegan una ronda:** el Burro ya maneja eliminados. Las bazas, en cambio, se juegan solo entre un subconjunto de asientos, y eso es nuevo.

La mesa de bazas del cliente solo coloca 2, 3 y 4 jugadores, en los lados `abajo`, `derecha`, `arriba` e `izquierda`.

## Goals / Non-Goals

**Goals:**
- Julepe completo de 3 a 6 jugadores:
  - puesta y bote;
  - jugar o pasar con el repartidor obligado;
  - descarte;
  - bazas entre los que juegan;
  - cobro, julepe y eliminación;
  - fin por manos.
- IA en los tres niveles. La difícil gana a la normal en la prueba de fuerza.
- Mesa de bazas para 5 y 6 jugadores sin cambiar la de 2 a 4.

**Non-Goals:**
- Las variantes de arrastre, el julepe doble y los cantes.

## Decisions

### 1. Estado
`EstadoJulepe` guarda:
- **Partida:** `config` (`jugadores: 3..6`, `manos: 6 | 12 | 20`), `azar`, `numeroMano`, `repartidor` y `manos`.
- **Mazo y descartes:** `mazo` (oculto) y `descartadas` (oculta, solo para conservar la baraja).
- **Triunfo:** `cartaTriunfo: IdCarta | null` (la del repartidor mientras siga en su mano) y `triunfo`.
- **Fase:** `fase: 'decidir' | 'descartar' | 'jugar'` y `turno`.
- **Decisiones:** `juega: (boolean | null)[]` (`null` es que no decidió todavía o está eliminado) y `cambios: (number | null)[]` (cartas cambiadas por cada uno).
- **Bazas:** `mesa`, `bazasJugadas` y `bazas: number[]`.
- **Fichas:** `bote`, `boteMano` (lo que valía el bote al repartir, para el julepe y para el valor de la baza), `fichas: number[]` y `eliminados: boolean[]`.
- **Historial:** `resultadosManos` y `ultimaBaza`, que persiste entre manos como en la Butifarra.

Acciones:
- `jugar` (decidir que se juega) y `pasar`;
- `descartar{cartas: IdCarta[]}`;
- `carta{carta}`, para no confundir jugar la mano con jugar una carta.

Flujo:
- **Orden de los jugadores activos:** «siguiente activo» salta a los eliminados y, en la fase de juego, a los que pasan.
- **Decidir:**
  - el repartidor no tiene `pasar` si antes de él juega exactamente uno;
  - si nadie juega antes de él, `pasar` no existe y su única acción es `jugar`, que en ese caso cierra la mano dándole el bote. Así no hace falta una acción especial y el «se lleva el bote» queda en la transición.
- **Descartar:** las acciones legales son todos los subconjuntos de la mano de tamaño ≤ `mazo.length` (como mucho 32). Se roba de arriba del mazo. Si el repartidor descarta la `cartaTriunfo`, deja de estar a la vista.
- **Jugar:** sale el primer activo que juega desde la mano. La baza se completa cuando han jugado todos los que juegan.

Al cerrar la mano:
- `valorBaza = ⌊boteMano / 5⌋`; cada uno cobra `bazas × valorBaza` y lo cobrado sale del bote.
- Cada jugador con menos de 2 bazas paga `min(boteMano, fichas)` al bote siguiente.
- Se eliminan los que se quedan a 0.
- Se registra el resultado y se reparte la mano siguiente con la puesta del nuevo repartidor, o termina la partida.

### 2. IA básica (`ia/julepe-basica.ts`)
- **`bazasEsperadas(mano, triunfo, activos)`:**
  - triunfos: As y 3 valen 0,95, Rey 0,75, Caballo y Sota 0,55 y los demás 0,35;
  - de otros palos: As 0,6 y 3 0,35;
  - se resta un 10 % por cada rival por encima de 2.
- **Jugar:** si las bazas esperadas antes de descartar son ≥ 1, u obligado. El descarte mejora la mano, y con 1,8 la IA pasaba casi todas las manos y no ganaba más partidas que el azar.
- **Descartar:** el subconjunto de cartas que no son triunfo, ni As, ni 3, recortado al tamaño del mazo empezando por las más bajas.
- **Jugar carta:**
  - al salir, con el triunfo más alto si tiene 3 o más triunfos y, si no, con su As o 3 de otro palo, o la carta más baja;
  - al responder, con `cartaParaResponder`, que gana con la más barata y si no entrega la de menor coste. Se adapta a «sin compañero» y valora la baza por ganar, no por puntos: gana siempre que puede.

### 3. IA difícil (`ia/reconstruir/julepe.ts`)
- **Reconstrucción:** reparte las cartas no vistas entre las manos ajenas, el mazo y los descartes. Respeta:
  - la carta de triunfo a la vista, que se queda en la mano del repartidor;
  - los fallos conocidos de las bazas ya jugadas: quien no siguió el palo no lo tiene y quien no falló pudiendo no tiene triunfos. Se reutiliza la idea de la Butifarra con reparto que garantiza solución por la condición de Hall.
- **`decideLaBase`:** en la fase de descarte.
- **`valorar`:** la diferencia de fichas de su asiento en la mano (cobrado − julepe), más `bonoPartida`.
- **Presupuesto:** 24 reconstrucciones y 160 de presupuesto, que se ajustan con la prueba de fuerza.

### 4. Mesa de bazas para 5 y 6 jugadores (cliente)
- **`Lado`** gana `arriba-izquierda` y `arriba-derecha`. `lado()` coloca así, en sentido antihorario desde el jugador:

  | Jugadores | Rivales |
  |---|---|
  | 5 | derecha, arriba-derecha, arriba-izquierda, izquierda |
  | 6 | derecha, arriba-derecha, arriba, arriba-izquierda, izquierda |

  Con 2 a 4 jugadores no cambia.
- **`MesaBazas`:** los rivales de arriba van juntos en una fila flexible, en la zona `arriba` de la rejilla, en orden visual izquierda → derecha. Con 5 o más la carta del rival se reduce.
- **`Tapete`:** posiciones para `arriba-izquierda` y `arriba-derecha`.
- **`nombreAsiento`:** con 5 y 6 numera a los rivales («Rival 1»…).

### 5. Cliente del Julepe
- **`MesaJulepe.svelte`** sobre `MesaBazas`:
  - **`info`:** el triunfo, el bote, «Mano N de M» y la ayuda de la fase.
  - **`detalle` de cada asiento:** «juega · 2 bazas · 47 fichas», «pasa», «cambió 3» o «eliminado».
  - **`cartaVisible`:** la carta de triunfo del repartidor.
  - **Descarte:** se marcan cartas tocándolas (estado local, con `jugable` como «se puede marcar») y se confirma con un botón.
  - **Avisos** de lo que decide cada uno.
- **`ResumenJulepe.svelte`:** el panel de fin de mano; la pantalla de fin muestra la clasificación por fichas.
- **Registro:**
  - `DEF_JULEPE` con pausa tras cada decisión o descarte de la IA y las de bazas;
  - `IdJuego`, `partida.ts`, opciones, textos, guía;
  - `red.ts`, sin parejas en la sala de espera.

## Risks / Trade-offs

- **Cambiar `lado()` y `MesaBazas`** podría afectar a la Brisca, el Tute, el Guiñote, la Pocha, los Corazones, la Butifarra y el Truc → la colocación de 2 a 4 no cambia, y sus E2E sirven de regresión.
- **Descartes con hasta 32 acciones legales** → es asumible para el motor y la IA, y el difícil no los simula.
- **Fichas que no cuadran** por el redondeo del valor de la baza → el resto se queda en el bote, y un test comprueba que la suma de fichas más el bote se conserva en cada mano.
