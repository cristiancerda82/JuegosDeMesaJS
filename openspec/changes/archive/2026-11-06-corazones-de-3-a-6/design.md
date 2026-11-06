## Context

`juegos/corazones.ts` fija `JUGADORES = 4` y `CARTAS_EN_MANO = 13`. Las usan:
- el reparto;
- el pase;
- el turno;
- el fin de la baza;
- el empate.

Las IA (`ia/corazones-basica.ts` y la reconstrucción) no dependen del número de jugadores más que a través de la vista. La mesa del cliente fija también `JUGADORES = 4`.

## Goals / Non-Goals

**Goals:**
- Los Corazones de 3 a 6 jugadores, con los tres niveles de IA, en red y en el cliente.
- Las partidas guardadas siguen funcionando.

**Non-Goals:**
- El pase con 3, 5 o 6.
- Una entrada propia en el menú.

## Decisions

### 1. Configuración
- `ConfigCorazones` gana `jugadores?: 3 | 4 | 5 | 6`. Sin el campo es 4, así que el estado guardado de antes sigue igual.
- `jugadoresCorazones(config)` devuelve el número.
- `crear` valida el número.
- Si no son 4, `crear` guarda `pase: false`: el pase solo existe con 4, y así la config del estado dice lo que se juega.

### 2. Baraja y reparto
- `QUITADAS_CORAZONES: Record<3|4|5|6, IdCarta[]>`:
  - 3: `diamantes-2`;
  - 4: ninguna;
  - 5: `diamantes-2` y `picas-2`;
  - 6: además, `diamantes-3` y `picas-3`.
- `barajaCorazones(config)` es la baraja de 52 sin esas cartas.
- `cartasEnManoCorazones(config)` es el tamaño de la baraja entre los jugadores.
- **Cambios en el motor:** todo lo que usaba `JUGADORES` o `CARTAS_EN_MANO` pasa a usar `n = jugadoresCorazones(e.config)`:
  - el reparto;
  - las listas por asiento;
  - el turno;
  - el fin de la baza (`mesa.length < n`);
  - el fin de la mano (sin cartas en las manos);
  - `asientos`;
  - el empate.
- **Pase:** la dirección del pase usa `n`, aunque solo hay pase con 4.
- **Luna:** suma 26 a cada uno de los demás.

### 3. IA
- **Normal:** no cambia.
- **Reconstrucción:** usa `barajaCorazones(vista.config)` en vez de la baraja de 52. El número de manos sale de la vista.
- **Pruebas:**
  - la tabla de niveles añade «Corazones de 3» y «Corazones de 6», con su parte justa;
  - las pruebas de reconstrucción usan también las configs de 3 y 6;
  - la suite del contrato prueba 3, 4, 5 y 6.

### 4. Cliente
- **Opciones:** un selector de jugadores (3 a 6). La casilla del pase solo se ve con 4.
- **`MesaCorazones`:** usa `jugadoresCorazones(vista.config)` en vez de `JUGADORES = 4`, para:
  - la mesa de bazas;
  - los nombres;
  - el destinatario del pase.
- **Resumen y fin:** recorren los asientos de la partida.
- **Red:** la sala ya toma los asientos de `juego.asientos(estado)`. Con 3, 5 o 6 jugadores se crea con la config elegida en las opciones.
- **Guía:** una sección «Con 3, 5 o 6 jugadores (Black Lady)».

## Risks / Trade-offs

- **La parte justa en las pruebas de fuerza cambia con el número de jugadores** → cada entrada de la tabla de niveles tiene la suya.
