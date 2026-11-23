## Why

Crear una sala en red cuesta hoy cuatro pasos (menú → «Jugar en red» → «Crear sala» → elegir el juego en una lista plana de 72 nombres → opciones), aunque el jugador ya esté en las opciones del juego que quiere. Además, el modo asistido, pensado para aprender, no se puede usar en red, que es justo donde se juega con amigos que están aprendiendo.

## What Changes

- Las opciones de cada juego con IA tienen, además de «Empezar partida», un botón **«Empezar en red»** que crea la sala con esas opciones y ese nivel y lleva directamente a la sala de espera. Debajo hay un campo **«Tu nombre en red»**, relleno con el último nombre usado; si está vacío, «Empezar en red» lo pide antes de crear la sala.
- En «Jugar en red → Crear sala», la elección del juego deja de ser una lista plana: se muestran las **familias** del menú principal (sin los solitarios), con su número de juegos; al elegir una se ven sus juegos y se puede volver a las familias. Hay también un buscador.
- El **modo asistido llega a las salas en red, si el anfitrión lo permite**: las opciones de la sala incluyen «Permitir el modo asistido» (desactivado por defecto). La sala de espera dice si está permitido. Con él permitido, cada jugador humano puede encender o apagar su asistente desde la mesa, con la sugerencia, el comentario de su jugada y los consejos de fase; sin él, nadie lo tiene. Las lecturas de las jugadas de los rivales no se dan en red, porque se calculan con la vista del rival, que el cliente no tiene.
- **BREAKING (protocolo, compatible hacia atrás)**: el mensaje `crear` admite `asistido` (si falta, `false`) y el mensaje `sala` lo incluye. Un cliente antiguo crea salas sin asistente.

## Capabilities

### New Capabilities

### Modified Capabilities
- `partidas-en-red`: crear una sala desde las opciones del juego, la elección del juego agrupada por las familias del menú principal y la opción de sala «Permitir el modo asistido».
- `modo-asistido`: deja de estar prohibido en red; se ofrece en las salas cuyo anfitrión lo permite, sin lecturas de los rivales.

## Impact

- `packages/server/src/protocolo.ts` y `servidor` (sala): campo `asistido` en `crear` y en `sala`, validado y guardado con la sala.
- `packages/client/src/pantallas/Opciones.svelte` (botón «Empezar en red», campo de nombre, casilla «Permitir el modo asistido» en las opciones de sala), `PantallaRed.svelte` (familias y buscador), `SalaEspera.svelte` (aviso del asistente), `App.svelte` (crear la sala desde las opciones).
- `packages/client/src/sesion/sesion-red.svelte.ts`: sugerencia, comentario y consejos con el worker del asistente, igual que la sesión local.
- `textos.ts`, la guía de la red (`ComoSeJuega`), y E2E nuevos y adaptados en `e2e/red.spec.ts`.
