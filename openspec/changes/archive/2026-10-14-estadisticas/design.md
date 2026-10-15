## Context

**Cuándo termina una partida:** la `Sesion` del cliente detecta en un único punto (`#aplicar`) el paso a una partida terminada. Es donde ya borra el guardado. Ahí se puede registrar la partida exactamente una vez. Una sesión retomada desde un guardado nunca está terminada (`desdeGuardado` lo rechaza), así que no hay doble registro al recargar.

**Guardado:** `guardado.ts` ya resuelve guardar en `localStorage` con tolerancia a fallos: el acceso dentro de `try/catch` y la validación de forma y versión.

**Navegación:** `App.svelte` cambia de pantalla con un estado simple, sin router.

## Goals / Non-Goals

**Goals:**
- Estadísticas por juego, fiables (un registro por partida terminada) y sin romper nada si el almacenamiento falla.
- Una pantalla clara y un toque de motivación en la pantalla de fin.

**Non-Goals:**
- Estadísticas por variante, historial, sincronización y logros.

## Decisions

### 1. Módulo puro (`src/estadisticas/estadisticas.ts`)
**Tipos:**
- `EstadisticasJuego { jugadas, ganadas, empatadas, perdidas, racha, mejorRacha, mejorTiempoMs: number | null, menosMovimientos: number | null }`
- `Estadisticas = Partial<Record<IdJuego, EstadisticasJuego>>`

**Funciones:**
- **`registrar(est, juego, partida)`:** es pura. Recibe `partida = { resultado: 'ganada' | 'empatada' | 'perdida', tiempoMs, movimientos: number | null }` y devuelve `{ estadisticas, novedades }`, con `novedades = { racha, mejorRacha: boolean, mejorTiempo: boolean, menosMovimientos: boolean }`.
  - La racha solo sube al ganar y vuelve a 0 con un empate o una derrota.
  - Los récords solo se guardan al ganar.
  - Una «mejor racha» solo cuenta como novedad si supera a una anterior de al menos 1. La primera victoria no es un récord.
  - Los récords de tiempo y movimientos solo se anuncian si ya había uno guardado.
- **`resultadoDe(fin, humano)`:** convierte el `Fin` del motor en `'ganada' | 'empatada' | 'perdida'`.
- **`leerEstadisticas()`, `guardarEstadisticas(est)` y `borrarEstadisticas()`:**
  - usan la clave `juegos-de-mesa/estadisticas` y el formato `{ version: 1, juegos }`;
  - la lectura valida la versión y que cada entrada sea un juego conocido con números enteros no negativos, y descarta lo que no lo cumpla;
  - todo va en `try/catch`, como en `guardado.ts`.

### 2. Registro desde la sesión
Al detectar el fin en `#aplicar`, la sesión llama a `registrarFin()`:
- **Qué hace:** lee las estadísticas, aplica `registrar` y las guarda.
- **Movimientos:** solo en los solitarios, los de su vista (`movimientos`).
- **Tiempo:** el `tiempoMs()` de la sesión.
- **Resultado:** expone `sesion.novedades`, el resultado de `registrar`, en un `$state` para la pantalla de fin.

Los solitarios se reconocen por `def.ia === null`. Así cualquier solitario futuro entra solo.

### 3. Pantallas
- **`Estadisticas.svelte`:**
  - una lista de tarjetas en el orden del menú (solo los juegos con partidas jugadas) y un total;
  - «Borrar estadísticas» con `confirm`;
  - «Volver»;
  - los tiempos con `formatoTiempo` y el porcentaje redondeado.
- **`Menu.svelte`:** un botón «Estadísticas» junto a «Ver todas las cartas».
- **`App.svelte`:** una pantalla nueva, `{ tipo: 'estadisticas' }`.
- **`Fin.svelte`:** si `sesion.novedades` existe, muestra una línea con la racha (si es ≥ 2) y los avisos de récord.

### 4. Tests
- **Vitest en el cliente** para el módulo puro: `registrar`, `resultadoDe` y la lectura de datos válidos, dañados o de otra versión, con un `localStorage` simulado. El cliente aún no tenía tests unitarios: se añade `vitest` como dependencia de desarrollo del cliente y el script `test`.
- **E2E:**
  - ganar un Klondike con el resolvedor existente y ver la tarjeta con los récords;
  - perder o abandonar y ver la racha a 0;
  - borrar;
  - el aviso de récord en el fin;
  - que recargar la página no duplique el registro.

## Risks / Trade-offs

- **Doble registro** → solo se registra en la transición a terminada dentro de `#aplicar`, que ocurre una vez por partida. El E2E recarga la página para comprobarlo.
- **Añadir Vitest al cliente** → `vitest` ya se usa en el motor, así que no es una dependencia nueva para el repositorio; solo amplía su uso al cliente.
- **Relojes y pausas** → el tiempo es el de la sesión, que ya descuenta las pausas por abandonar la página.
