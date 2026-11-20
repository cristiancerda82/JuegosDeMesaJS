## Context

En el Tute subastado de la suite (`juegos/tute-subastado.ts`):
- **Jugadores y reparto:** juegan siempre 4 (la constante `JUGADORES`) y se reparten las 40 cartas, 10 a cada uno.
- **Subasta y cantes:** la puja empieza en 60 (`PUJA_MINIMA_SUBASTADO`) y sube de 10 en 10 hasta 230. Quien gana una baza puede cantar las 20, las 40 o el tute.
- **Cobro:** el pujador cobra o paga `puja / 10` fichas a cada uno de los otros tres.

Núñez Elvira describe el de 3 como el juego normal:
- 12 cartas sin los doses y subasta desde 70;
- sin tutes («no tienen objeto»);
- los dos que quedan superados se alían contra el pujador.

## Goals / Non-Goals

**Goals:**
- El Tute subastado de 3 como opción del mismo juego, con la IA de los tres niveles, en red y en la mesa.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- Otras reglas que Núñez da para los dos:
  - el valor doble desde 130;
  - las 10 de últimas solo para el pujador;
  - pujar de 5 en 5;
  - el censor con 4.
- Que con 4 el que reparte descanse (la versión de 5 jugadores de Núñez).

## Decisions

### `jugadores` opcional en la config, 4 si falta
`ConfigTuteSubastado` gana `jugadores?: 3 | 4`, que `crear` normaliza (lo que no sea 3 queda en 4), y la config por defecto lo trae a 4.
- Las partidas guardadas, sin el campo, siguen con 4.
- El número de asientos sale de `jugadoresSubastado(config)`, que usan el motor, la IA y la reconstrucción.

### La baraja y la puja mínima, de la config
`barajaTuteSubastado(config)` da las 40 cartas, o las 36 sin doses con 3. La usan el reparto y la reconstrucción.

`pujaMinimaSubastado(config)` da 60 o 70, y `pujasSubastado` recibe la mínima como segundo argumento, con 60 por defecto.

Las bazas suman 120 con o sin doses, porque los doses no valen puntos, así que el máximo de 230 no cambia.

### Sin tute con 3
Con 3, `cantarTute` no es una acción legal. Las 20 y las 40 se cantan igual.

### El cobro con los defensores que haya
El pujador gana o pierde `(jugadores − 1) × puja / 10`, y cada defensor lo contrario de `puja / 10`. La suma de fichas sigue siendo 0.

### IA
- **Estimación:** `estimarPuntos` y `mejorTriunfo` reciben los jugadores, 4 por defecto. Los puntos ajenos que trae una baza ganada se escalan a los rivales que hay (8 con tres, 16/3 con dos).
- **Bazas:** `cartaParaResponder` recibe los jugadores de la vista, y los triunfos que quedan fuera se cuentan con las cartas de la baraja de la partida.
- **Difícil:** la reconstrucción reparte la baraja de la partida entre los que juegan, y la valoración reparte el margen entre los defensores que haya.

## Risks / Trade-offs

- **[Las 4 manos con 3 jugadores no dan una vuelta entera de repartos]** → Lo mismo pasa con 4 y 8 manos según quién empiece. Las fichas compensan el reparto, y la opción de 12 manos da 4 vueltas con 3.
- **[La IA normal puja con una estimación pensada para 10 cartas]** → Con 12 cartas estima más puntos, pero escalar los ajenos por baza a dos rivales lo compensa. La prueba de fuerza del difícil y las partidas contra el azar lo comprueban.
