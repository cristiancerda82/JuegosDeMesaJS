## Context

TriPeaks es casi el Golf con otra forma de tablero:
- **Encajar:** `encajaGolf(carta, arriba, true)` ya decide si una carta va sobre el descarte con vuelta.
- **Solitario:** el patrón de la Pirámide y el Golf (tablero + `movimientos` + `historial` + `abandonada`, deshacer que cuenta como movimiento, récords automáticos para los juegos sin IA) sirve tal cual.
- **Pirámide:** la mesa de la Pirámide ya dibuja cartas solapadas en filas que se tapan unas a otras.
- **Pista:** `cadenaGolf` busca la cadena más larga en el Golf; en TriPeaks hay que tener en cuenta que quitar una carta libera otras.

Lo nuevo son las cartas boca abajo, los puntos por racha y el récord de puntuación en las estadísticas.

## Goals / Non-Goals

**Goals:**
- TriPeaks completo con puntos por racha y por picos, deshacer, abandonar, pista y atasco.
- Un récord de mejor puntuación compatible con las estadísticas ya guardadas.

**Non-Goals:**
- Jugar sin vuelta, varias partidas encadenadas o reciclar el mazo.

## Decisions

### 1. Tablero
Las 28 cartas de los picos van en un array `picos: (IdCarta | null)[]` de 28 posiciones, con `null` para las quitadas, por filas: 0–2 (cimas), 3–8, 9–17 y 18–27.

Qué cartas tapan a cada una (`tapadorasTriPeaks(i)`):
- **fila 2 (posición k, 0–8)** → las de la fila 3 en `k` y `k + 1`;
- **fila 1 (posición i, 0–5)**, del pico `p = ⌊i / 2⌋` → las de la fila 2 en `i + p` y `i + p + 1`;
- **fila 0 (pico p)** → las de la fila 1 en `2p` y `2p + 1`;
- **fila 3** → ninguna.

Una carta está **libre** si no es `null` y todas sus tapadoras son `null`; está **boca arriba** si está libre o es de la fila de abajo. Como una carta tapada nunca se destapa sin quitar sus tapadoras, «boca arriba» es lo mismo que «libre».

### 2. Estado y acciones
`EstadoTriPeaks`: `picos`, `mazo` (se roba el último), `descarte` (la de arriba es la última), `puntos`, `racha`, `movimientos`, `historial` (tableros anteriores con `picos`, `mazo`, `descarte`, `puntos` y `racha`) y `abandonada`. No hay configuración: `ConfigTriPeaks = {}`.

Acciones: `quitar{posicion}`, `robar`, `deshacer` y `abandonar`.

Transiciones:
- **`quitar`:** la carta pasa al descarte, `racha + 1`, y suma la nueva racha. Si es una cima (posición 0–2), suma 15; si con ella quedan quitadas las tres cimas, suma 30 más.
- **`robar`:** la carta de arriba del mazo pasa al descarte y la racha vuelve a 0.
- **`deshacer`** y **`abandonar`**, como en el Golf.

`resultado`: abandonada → sin ganadores; todas las posiciones a `null` → gana el asiento 0. En los dos casos, `puntos: [puntos]`.

### 3. Vista
- `picos: (IdCarta | 'oculta' | null)[]`: la carta si está libre, `'oculta'` si está tapada y `null` si ya no está;
- `descarte`, `mazo` (número), `movimientos`, `puntos`, `racha`, `situacion`.

El contrato comprueba que las cartas tapadas y las del mazo no aparecen en la vista.

### 4. Pista
`pistaTriPeaks(vista, acciones)`: para cada `quitar` posible, una búsqueda en profundidad de la cadena más larga quitando cartas libres que encajen. En cada paso solo se usan las cartas boca arriba que se ven; una carta que queda libre al quitar sus tapadoras no se sabe cuál es y no se sigue. Gana la cadena más larga; si empatan, la carta que tapa a más cartas (libera más). Si no hay ningún `quitar`, robar. Tope de nodos como en el Golf (5.000) para que sea instantánea.

### 5. Estadísticas
- `EstadisticasJuego.mejorPuntuacion: number | null`, `PartidaTerminada.puntos: number | null` y `Novedades.mejorPuntuacion: boolean`.
- La sesión pasa `puntos` cuando el juego no tiene IA y su vista tiene `puntos` numérico (hoy solo TriPeaks).
- Se actualiza en cualquier partida terminada con puntos, ganada o no.
- `esValida` acepta que falte el campo y lo lee como `null`; el formato sigue en la versión 1.
- Las estadísticas muestran «Mejor puntuación» y la pantalla de fin, «¡Récord de puntos!».

### 6. Cliente
- **`MesaTriPeaks.svelte`**, como la de la Pirámide: cuatro filas en una cuadrícula que coloca los tres picos. La fila de abajo ocupa 10 medias columnas (20 en total) y cada fila de arriba se desplaza media carta. Las cartas libres que encajan se resaltan, y las tapadas muestran el dorso.
- Debajo: el mazo (tocar para robar) y el descarte, la racha («Racha ×3») y los puntos, y los botones de deshacer, pista y abandonar con el aviso de atasco compartido.
- **Fin:** los puntos junto a los movimientos y el tiempo, también al abandonar.

## Risks / Trade-offs

- **[Ancho en 360 px]** → 10 cartas en la fila de abajo, solapadas a la mitad como en la Pirámide; la anchura de carta se calcula con `min(vw)` para que quepa.
- **[Récord nuevo en estadísticas antiguas]** → el campo es opcional al leer; los tests cubren unas estadísticas guardadas sin él.
