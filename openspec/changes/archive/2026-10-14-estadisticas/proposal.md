## Why

La suite ya tiene 16 juegos, pero cada partida se olvida en cuanto termina. Unas estadísticas sencillas dan motivos para volver: cuántas partidas has ganado de cada juego, tu racha de victorias y tus mejores tiempos en los solitarios. Además, no necesitan servidor: se guardan en el propio dispositivo, como la partida en curso.

## What Changes

- **Registro automático:** cada partida que termina se registra en el dispositivo, por juego.
  - **Qué se cuenta:** partidas jugadas, ganadas, empatadas y perdidas, la racha actual y la mejor racha de victorias.
  - **Solitarios** (Klondike, FreeCell, Spider): además, el mejor tiempo y el menor número de movimientos de las partidas ganadas. En un solitario, abandonar cuenta como partida perdida.
  - **Qué no se cuenta:** las partidas que se dejan a medias (las que se retoman o se descartan desde el menú), hasta que terminan.
- **Pantalla de estadísticas**, accesible desde el menú:
  - una tarjeta por juego jugado, con sus números y el porcentaje de victorias;
  - un resumen total;
  - un botón para borrar las estadísticas, con confirmación.
- **Pantalla de fin:** muestra la racha de victorias en curso y avisa de un nuevo récord (mejor tiempo o menos movimientos) o de una nueva mejor racha.
- **Robustez:** si no se puede guardar (modo privado, cuota) o los datos guardados no son válidos, la aplicación sigue funcionando y empieza las estadísticas de cero.
- **Fuera de alcance:**
  - estadísticas por variante de cada juego (por ejemplo, el Klondike robando 1 o 3);
  - historial de partidas;
  - sincronizar entre dispositivos;
  - logros o medallas.

## Capabilities

### New Capabilities
- `estadisticas`: registro de las partidas terminadas por juego (resultados, rachas y récords de los solitarios), su guardado en el dispositivo y su borrado.

### Modified Capabilities
- `mesa-cliente`: el menú tiene una pantalla de estadísticas y la pantalla de fin muestra la racha y los récords.

## Impact

- **`packages/client`:**
  - nuevo `src/estadisticas/estadisticas.ts`, el módulo puro de registro con su lectura y escritura en `localStorage`;
  - nueva pantalla `Estadisticas.svelte`;
  - la sesión registra la partida al terminar;
  - cambian `App.svelte` (pantalla nueva), `Menu.svelte` (botón), `Fin.svelte` (racha y récords) y los textos.
- **`packages/engine`:** sin cambios. Las estadísticas son cosa del cliente; el motor no lee la hora ni guarda nada.
- **Tests:** unitarios del módulo de registro con Vitest en el cliente y E2E del flujo completo.
- Sin dependencias nuevas.
