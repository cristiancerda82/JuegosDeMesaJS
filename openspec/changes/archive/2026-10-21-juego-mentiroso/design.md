## Context

El Mentiroso es nuevo en la forma, pero no necesita piezas nuevas del motor:
- **Reparto:** la baraja francesa y el reparto ya existen.
- **Jugadores:** el Julepe y el Remigio ya manejan jugadores por su cuenta y mesas de 3 a 6.
- **Mesa:** `MesaBazas` coloca de 2 a 6 asientos con `AsientoRival`, que ya pinta los dorsos y el nombre.

Lo nuevo es:
- **Información oculta:** el montón y lo que cada uno sabe de él.
- **IA:** una que farolea y que detecta faroles llevando la cuenta de las cartas.

La simulación de la IA difícil no sirve aquí, por la misma razón que en el Mus: al repartir al azar las cartas ocultas, no ve que el rival miente justo cuando no tiene el valor.

## Goals / Non-Goals

**Goals:**
- Mentiroso completo de 3 a 6 jugadores: reparto, bajar, desconfiar, victoria.
- IA básica que farolea y desconfía con sentido, y una difícil con memoria de cartas que le gana.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Las variantes de la propuesta (valor libre, cualquiera desconfía, descartar cuatro iguales, puntos).

## Decisions

### 1. Estado
`EstadoMentiroso`:
- `config: { jugadores: 3..6 }`, `azar`;
- `manos: IdCarta[][]`;
- `monton: { asiento, cartas: IdCarta[], valor }[]`: las bajadas desde el último «¡Mentiroso!»;
- `valor` (1–13), el valor que toca declarar, y `turno`;
- `revelaciones: { bajo, desconfio, cartas, valor, mentia, seLleva, cuantas }[]`, que es público;
- `ganador: Asiento | null`.

Acciones:
- `marcar{carta}` y `desmarcar{carta}`: el jugador en turno elige, una a una, las cartas que va a bajar. Las marcadas se guardan en `marcadas` y solo las ve él;
- `bajar`: baja las marcadas, de 1 a 4;
- `desconfiar`;
- `creer`, que solo existe cuando el anterior se quedó sin cartas.

`accionesLegales`:
- si el último que bajó tiene la mano vacía, solo `creer` y `desconfiar`;
- si no:
  - `marcar` de cada carta sin marcar mientras haya menos de 4 marcadas;
  - `desmarcar` de cada marcada;
  - `bajar` si hay de 1 a 4 marcadas;
  - `desconfiar` si el montón tiene alguna bajada y aún no ha marcado nada.

Como mucho son unas 60 acciones, aunque el jugador tenga 52 cartas.

**Por qué marcar en vez de `bajar{cartas}`:** `aplicar` valida cada acción contra la lista de acciones legales. Con `bajar{cartas}`, esa lista son todas las combinaciones de 1 a 4 cartas de la mano: unas 18.000 con 26 cartas y 270.000 con 52. Agrupar las cartas por valor (`bajar{valores}`) lo recortaría, pero entonces el motor elegiría el palo y la mesa no bajaría las cartas exactas que tocó el jugador. Marcar una a una da pocas acciones y conserva las cartas exactas. El coste es que una bajada son varias acciones: las pausas de la IA solo se aplican al bajar, no al marcar.

Transiciones:
- **`marcar` / `desmarcar`:** solo cambian `marcadas`.
- **`bajar`:** saca las marcadas de la mano, añade la bajada al montón, avanza el valor y pasa el turno.
- **`desconfiar`:** descubre la última bajada y decide quién se lleva el montón entero. El turno es del que desconfió. El valor sigue en el siguiente al de la bajada descubierta (que ya avanzó al bajar). Si el que bajó se quedó sin cartas y decía la verdad, `ganador` es él.
- **`creer`:** `ganador` es el último que bajó.

### 2. Vista
- `miMano`, `cartasEnMano`, `monton` (número total), `valor` y `turno`;
- `marcadas`: solo en la vista del jugador en turno;
- `bajadas`: quién, cuántas y qué valor, sin las cartas;
- `misCartasEnMonton`: las cartas que bajó este asiento y siguen en el montón;
- `revelaciones` y `ganador`.

El contrato comprueba que la vista no muestra las cartas ocultas de las manos ajenas ni las del montón bajadas por otros.

### 3. IAs: una sola estrategia con parámetros
`iaMentiroso({ memoria, objetivo, montonMax })`:
- **Bajar:** las cartas del valor (hasta 4) o, si no tiene, una para mentir (la del valor que más tarde le toca declarar). Si el montón tiene como mucho `montonMax` cartas, rellena con falsas hasta `objetivo`, sin quedarse sin cartas (la última bajada se desconfía siempre).
- **Desconfiar:**
  - siempre si las declaradas más las que sabe fuera de la mano de quien bajó pasan de 4;
  - siempre ante la última bajada;
  - si no, con probabilidad `(1 − P(verdad)) × 0,9` (× 0,75 con más de 6 en el montón).

  `P(verdad)` es la hipergeométrica de que quien bajó tuviera al menos tantas cartas del valor entre las que este asiento no ve.
- **Memoria** (solo la difícil): además de sus cartas, cuenta como «fuera» las que dejó en el montón y las descubiertas que se llevó otro jugador que aún no ha bajado.

Parámetros elegidos midiendo partidas (4 jugadores, 200 partidas):
- **Normal** `{ memoria: false, objetivo: 3, montonMax: 6 }`: gana 283 de 500 al azar. Sin relleno solo ganaba 25 de 200: el azar suelta 4 cartas por turno y solo le puede desconfiar uno.
- **Difícil** `{ memoria: true, objetivo: 1, montonMax: 0 }`: gana unas 160 de 200 a la normal (lo justo serían 50). Rellenar con falsas, que gana al azar, pierde contra quien desconfía bien. La memoria suma poco (158 sin ella), pero sirve para las mentiras seguras.

Las dos deciden al empezar el turno si desconfían y qué bajan, y después marcan las cartas una a una (desmarcando primero las que sobren) hasta bajar.

Se registran en `IAS` como `normal` y `dificil`; la fácil es `conErrores` sobre la normal. En la tabla de niveles el Mentiroso entra en la prueba de fuerza: el campo `simula` pasa a significar «el difícil tiene que ganar a la normal».

### 5. Cliente
- **`MesaMentiroso.svelte`:**
  - arriba, los rivales (como en la mesa de bazas, con sus cartas boca abajo y su número);
  - en el centro, el montón con su cuenta, el valor que toca y la última bajada;
  - abajo, la mano ordenada por valor, para marcar de 1 a 4 cartas, con los botones «Bajar N», «¡Mentiroso!» y, cuando toca, «Me lo creo»;
  - al desconfiar, un panel de 1,5 segundos (pausa de la sesión) muestra las cartas descubiertas y quién se lleva el montón.
- **Pausas:** 700 ms tras cada bajada de la IA y 1.800 ms tras cada «¡Mentiroso!».
- **Fin:** el ganador y la cuenta de cartas de cada uno.

## Risks / Trade-offs

- **[Bajar son varias acciones]** → en red, cada marca viaja al servidor. Son mensajes pequeños, y las marcas no se enseñan a los demás.
- **[La difícil no gana a la normal]** → si la memoria no basta, se ajustan los umbrales de desconfianza y el farol mezclado hasta pasar la prueba de fuerza.
- **[Partidas largas]** → un montón que va y viene puede alargar la partida. Las partidas al azar de los tests tienen tope de pasos, y entre IAs se mide la duración media.
