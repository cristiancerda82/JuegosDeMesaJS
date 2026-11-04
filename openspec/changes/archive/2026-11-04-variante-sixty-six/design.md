## Context

El Schnapsen (`juegos/schnapsen.ts`) ya implementa todo el Sixty-six salvo tres reglas:
- la baraja de 24;
- la mano de 6;
- el cambio con el 9 y las 10 de últimas.

Su configuración es `{ jugadores: 2 }` y su IA, su reconstrucción y su mesa no dependen del tamaño de la baraja más que a través de `BARAJA_SCHNAPSEN`.

## Goals / Non-Goals

**Goals:**
- El Sixty-six como variante del Schnapsen, con entrada propia en el menú, sus tres niveles de IA y en red.
- Las partidas guardadas del Schnapsen siguen funcionando.

**Non-Goals:**
- Anunciar el 66 a mano y la partida a 11.

## Decisions

### 1. Configuración
- `ConfigSchnapsen` gana `variante?: 'schnapsen' | 'sixtySix'`. Sin ella, es el Schnapsen: el estado guardado de una partida anterior no tiene el campo y sigue igual.
- `CONFIG_SIXTY_SIX: ConfigSchnapsen = { jugadores: 2, variante: 'sixtySix' }`.
- `crear` conserva la variante en la config del estado (hoy la reescribe a `{ jugadores: 2 }`).

### 2. Reglas que dependen de la variante
- **Baraja:** `barajaSchnapsen(config)`: la de 20 o la de 24 (`BARAJA_SIXTY_SIX`, con los 9). `BARAJA_SCHNAPSEN` se mantiene.
- **Orden y valor:** el 9 entra en las tablas con rango 0 y valor 0. En la baraja de 20 no aparece, así que el Schnapsen no cambia.
- **Mano:** `cartasManoSchnapsen(config)`: 5 o 6.
- **Cambio:** `cartaDeCambio(config, triunfo)`: la J o el 9 del triunfo. `jotaDe` se mantiene para quien la use.
- **Diez de últimas:** `DIEZ_DE_ULTIMAS_SIXTY_SIX` (con el nombre de la variante, porque el Belote ya exporta un `DIEZ_DE_ULTIMAS`). En `resolverBaza`, si tras robar las manos quedan vacías, el mazo no se cerró y es Sixty-six, se suman 10 a `puntosBazas` del ganador antes de mirar los 66. Con 66 o más, el motivo es `'66'`; si no, `'ultima'`, como en el Schnapsen.

### 3. IA y reconstrucción
- **Reconstrucción:** usa `barajaSchnapsen(vista.config)`. El resto (manos ajenas por tamaño, cartas conocidas, fallos) no cambia.
- **IA normal:** usa la carta de cambio de la variante si mira la J. La acción `cambiar` es la misma.
- **Niveles:** `IAS.schnapsen` sirve para las dos variantes.
- **Red:** `red.ts` registra `sixtySix: entrada(schnapsen, IAS.schnapsen, CONFIG_SIXTY_SIX)`.
- **Pruebas:** la tabla de niveles añade la entrada «Sixty-six» con su config, y las pruebas de reconstrucción, `describirReconstruccion` con la config del Sixty-six.

### 4. Cliente
- **`juegos.ts`:** `DEF_SIXTY_SIX`, con `id: 'sixtySix'`, el mismo `juego` (`schnapsen`), `configPorDefecto: CONFIG_SIXTY_SIX`, `IAS.schnapsen` y la misma pausa.
- **`partida.ts`:** el tipo de sesión es `SesionSchnapsen`.
- **`PantallaPartida`:** usa `MesaSchnapsen`.
- **`Fin.svelte`:** usa el bloque del Schnapsen para los dos ids.
- **`MesaSchnapsen`:** el botón y el aviso del cambio dicen «el 9» o «la J» según `vista.config.variante`.
- **Textos:** el menú y la guía propia del Sixty-six.

## Risks / Trade-offs

- **Dos ids en el cliente para un mismo motor** → la sesión guardada lleva el id del menú (`sixtySix`), así que al retomarla se abre con su definición. El motor solo ve la config.
