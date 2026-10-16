## Why

En los solitarios (Klondike, FreeCell y Spider) es fácil quedarse mirando la mesa sin ver la jugada, sobre todo al aprender. Hoy se puede deshacer, pero no hay ninguna ayuda para encontrar un movimiento útil. Tampoco hay forma de saber que la partida se ha quedado sin salida: el jugador sigue buscando una jugada que no existe. Una pista a mano y un aviso claro de atasco hacen los solitarios más amables sin quitarles el reto.

## What Changes

- **Pista** en los tres solitarios: un botón «Pista» resalta durante unos segundos un movimiento útil, con las cartas de origen y el destino. Si lo mejor es robar del mazo o repartir, resalta el mazo.
  - Las pistas son heurísticas e instantáneas, sin resolutor.
  - Prefieren:
    - subir cartas a las fundaciones;
    - descubrir cartas boca abajo;
    - vaciar columnas con sentido;
    - en el Spider, alargar escaleras del mismo palo.
  - Nunca sugieren movimientos de ida y vuelta que no cambian nada.
  - Si no hay ningún movimiento útil pero aún se puede hacer algo, la pista lo dice: «No veo ningún movimiento útil: prueba a deshacer».
- **Aviso de atasco:** cuando no queda ninguna jugada posible salvo deshacer o abandonar, la mesa muestra «No quedan movimientos», con los botones Deshacer y Abandonar.
- **Pistas usadas:** la pantalla de fin de los solitarios muestra cuántas pistas se usaron. El número se guarda con la partida, así que al retomarla se conserva.
- Fuera de alcance:
  - resolutores que garanticen el camino a la victoria;
  - pistas en los juegos contra la IA;
  - rehacer;
  - que las pistas afecten a los récords de las estadísticas.

## Capabilities

### New Capabilities
- `pistas-solitarios`: qué movimiento sugiere la pista en cada solitario, cuándo no hay pista útil y cuándo la partida está atascada.

### Modified Capabilities
- `mesa-cliente`: botón «Pista» con el resaltado, aviso de atasco y pistas usadas en la pantalla de fin de los solitarios.

## Impact

- **`packages/engine`:** nuevo `ia/pistas.ts` con `pistaKlondike`, `pistaFreeCell` y `pistaSpider`. Son funciones puras que deciden con la vista y las acciones legales, y tienen sus tests.
- **`packages/client`:**
  - Las tres mesas ganan el botón y el resaltado (con los `data-testid` de las pilas que ya existen) y el aviso de atasco.
  - `Sesion` y el guardado llevan la cuenta de las pistas.
  - Cambian la pantalla de fin y los textos.
- Sin dependencias nuevas.
