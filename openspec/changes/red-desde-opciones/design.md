## Context

- **Crear una sala.** Hoy se crea desde `PantallaRed`: el jugador escribe el nombre, pulsa «Crear sala», elige el juego en una rejilla plana con los 72 juegos de `IDS_JUEGOS_EN_RED` y llega a `Opciones` con `red`, que solo muestra «Crear sala». Después, `App.crearSala(juego, config, nivel)` conecta con `servidorGuardado()` y envía `crear` con `nombreGuardado()`.
- **El menú principal.** Ya agrupa los juegos por familias con `FAMILIAS`, `juegosDeFamilia`, `normalizar`, `TarjetaFamilia` y `TarjetaJuego` de `menu/catalogo.ts`. Todos los juegos con IA se pueden jugar en red, así que las familias con juegos en red son todas menos los solitarios.
- **El modo asistido.** Vive en `Sesion` (local). Pide al worker del asistente (`asistente/motor.ts`, con `pedir`) tres cosas: `asistir`, que da la sugerencia con la vista y las jugadas legales del jugador; `comentar`, que comenta su jugada; y `leer`, que da la lectura de un rival a partir de la vista de ese rival. `SesionRed` declara `puedeAsistir = false` y deja vacío todo lo demás. Las mesas ya leen esos campos de `SesionMesa`, así que pintan igual cualquier sesión.

## Goals / Non-Goals

**Goals:**
- Crear una sala con un solo botón desde las opciones del juego.
- Elegir el juego de la sala por familias, con buscador.
- Ofrecer el modo asistido en red cuando el anfitrión lo permite, con la sugerencia, el comentario y los consejos de fase.

**Non-Goals:**
- Lecturas de los rivales en red, porque necesitan la vista del rival.
- Cambiar el permiso con la sala ya creada.
- Que los demás jugadores vean quién lleva el asistente activo.
- Filtro por baraja en la elección de la sala. El buscador basta, y el filtro del menú es una preferencia del menú.

## Decisions

### 1. «Empezar en red» en `Opciones`, con el nombre en la misma pantalla
`Opciones` recibe una prop nueva y opcional, `empezarEnRed(config, nivel, asistido, nombre)`. `App` solo la pasa en las opciones locales de un juego en red (`esJuegoEnRed`).

Cuando la prop está, las opciones muestran tres cosas más:
- la casilla «Permitir el modo asistido», bajo la del modo asistido;
- el campo «Tu nombre en red» (`nombreGuardado()`, como máximo `NOMBRE_MAXIMO`);
- el botón «Empezar en red», junto a «Empezar partida».

Cómo responde el botón:
- Si el nombre no es válido, enseña `T.red.faltaNombre` en un aviso con `role="alert"` y no llama a nada.
- Si es válido, llama a `guardarNombre` y después a `empezarEnRed`.

`App.crearSala` pasa a aceptar el permiso y vuelve a la pantalla de red si falla la conexión, como hasta ahora. Volver desde la sala de espera lleva al menú.

En las opciones abiertas con `red`, que llegan desde la pantalla de red, se mantiene un único botón, «Crear sala». También aparece la casilla «Permitir el modo asistido», y no aparece la del modo asistido local.

- **Alternativa descartada:** abrir la pantalla de red con el juego ya elegido. Es un paso más, y el usuario pidió crear la sala directamente.

### 2. El permiso viaja en `crear` y en `sala`
En el protocolo:
- `crear` gana el campo `asistido?: boolean`. `leerMensajeCliente` acepta que falte o que sea booleano, y si falta usa `false`. Cualquier otro tipo invalida el mensaje.
- `sala` gana el campo `asistido: boolean`.

`Sala` guarda el permiso como `readonly`, y como tal se conserva en las revanchas y al volver a la sala. El servidor no hace nada más con él: la ayuda se calcula en cada dispositivo. Un cliente nuevo que recibe un `sala` de un servidor antiguo, sin el campo, lo trata como `false`.

- **Alternativa descartada:** calcular las sugerencias en el servidor. Gasta CPU de un servidor gratuito, y no hace falta porque el cliente ya tiene la vista y las jugadas legales de su asiento.

### 3. El asistente de `SesionRed` reutiliza el worker
`SesionRed` deja de tener campos fijos y pasa a tener:
- `puedeAsistir`, que vale `sala.asistido && def.ia !== null`;
- `asistido = $state(leerAsistido(def.id) && puedeAsistir)`;
- `asistencia`, `pensandoSugerencia`, `comentario` y `consejo` como `$state`.

La lógica sale de `Sesion` a un módulo común, `sesion/asistencia.svelte.ts`. Es un `AsistenteSesion` que recibe estas funciones: obtener la vista, las jugadas legales, la clave de azar, si la sesión está cerrada y si el jugador puede decidir. Expone `actualizar()`, `alJugar(vistaAntes, accion)`, `alternar()`, `cerrarConsejo()` y `cerrarComentario()`.

- `Sesion` lo usa sin cambiar su comportamiento: los tests actuales del asistente siguen valiendo. La lectura de los rivales (`#leer`) se queda en `Sesion`.
- `SesionRed` llama a `actualizar()` cada vez que muestra una vista nueva (`#mostrar`) o cambia el bloqueo, y llama a `alJugar` en `jugar()`.
- El azar de la sugerencia se genera con la sala, el número de partida y las jugadas mostradas: `${codigo}/${partida}/asistente/${n}`. Así es estable, pero propio de cada jugador, porque cada uno tiene su vista.
- Las fases ya aconsejadas en red se guardan solo en memoria, porque en red no hay partida guardada. Al reconectar, puede repetirse el consejo de una fase.
- `lecturas` sigue siendo `[]` en red.
- Activar o desactivar el asistente en red no se guarda en el dispositivo, igual que en local, donde lo que se recuerda es la casilla de las opciones.

- **Alternativa descartada:** copiar la lógica en `SesionRed`. Sale más rápido, pero duplica unas 120 líneas delicadas, con peticiones vigentes y descartes.

### 4. Elegir el juego de la sala por familias
`PantallaRed` sustituye la rejilla plana por tres vistas:

| Vista | Qué muestra |
|---|---|
| Familias | `TarjetaFamilia` de cada familia de `FAMILIAS`, salvo `solitarios`, con `juegosDeFamilia(f).filter(esJuegoEnRed)` |
| Familia abierta | Cabecera con «Volver» y botones con los juegos de la familia |
| Búsqueda | Con texto en el buscador, los juegos de todas las familias cuyo nombre coincide (con `normalizar`) |

- Los botones de juego mantienen `data-testid="red-juego-<id>"`, que ya usan los E2E.
- `TarjetaFamilia` lleva `data-testid="familia-<id>"`, igual que en el menú principal; las dos pantallas nunca están a la vez en la página.
- Los botones de juego no son `TarjetaJuego`, para no meter la estrella de favoritos en la elección de una sala. Son botones con el nombre y las cartas de muestra.
- La pila de capas del botón atrás se encarga de volver: de la familia a las familias, y de las familias a la pantalla de red.
- La familia abierta y la búsqueda son estado local de la pantalla. No se recuerdan.

## Risks / Trade-offs

- **El asistente en red tarda un poco en salir.** El worker necesita unos cientos de milisegundos y la vista puede cambiar antes. → Cada petición se descarta si la vista ya no es la misma; es el mismo mecanismo `vigente` que en local.
- **Mover la lógica del asistente puede romper el modo local.** → La extracción va primero, en una tarea propia, y los tests de `Sesion` y los E2E del asistente tienen que seguir pasando antes de tocar la red.
- **Un cliente antiguo con un servidor nuevo, o al revés.** → El campo es opcional en los dos sentidos y vale `false` por defecto. En el peor caso, el asistente no aparece.
- **El asistente da ventaja.** → Solo si el anfitrión lo permite, y la sala de espera lo dice a todos antes de empezar.
