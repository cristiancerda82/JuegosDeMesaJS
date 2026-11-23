## 1. Protocolo y servidor

- [x] 1.1 `protocolo.ts`: `asistido?: boolean` en `crear` (si falta, `false`; si no es booleano, el mensaje es inválido) y `asistido: boolean` en `sala`; tests de `leerMensajeCliente`
- [x] 1.2 `sala.ts` y `servidor.ts`: guardar el permiso en la sala, enviarlo en cada mensaje `sala` y conservarlo en la revancha y al volver; tests del servidor (crear con y sin el campo)

## 2. Asistente común

- [x] 2.1 Extraer de `Sesion` la sugerencia, el comentario y los consejos de fase a `sesion/asistencia.svelte.ts` (`AsistenteSesion`), sin cambiar el comportamiento local; pasan los tests de la sesión y del asistente
- [x] 2.2 `SesionRed`: `puedeAsistir` según `sala.asistido`, `asistido` inicial según `leerAsistido(juego)`, `alternarAsistido`, sugerencia y comentario con `AsistenteSesion`, sin lecturas de los rivales; tests con un `ClienteRed` simulado (con permiso, sin permiso y apagarlo)

## 3. Cliente

- [x] 3.1 `Opciones.svelte`: casilla «Permitir el modo asistido» en las opciones de sala; campo «Tu nombre en red» y botón «Empezar en red» cuando hay `empezarEnRed`, con el aviso de falta de nombre
- [x] 3.2 `App.svelte`: pasar `empezarEnRed` en las opciones de los juegos en red y `crearSala` con el permiso; textos nuevos en `textos.ts`
- [x] 3.3 `SalaEspera.svelte`: línea «Modo asistido permitido» o «Sin modo asistido»
- [x] 3.4 `PantallaRed.svelte`: elección por familias (sin solitarios), familia abierta con «Volver», buscador y capa para el botón atrás
- [x] 3.5 Guía de la red en `ComoSeJuega`: «Empezar en red» y el permiso del modo asistido

## 4. Pruebas

- [x] 4.1 E2E en `e2e/red.spec.ts`: «Empezar en red» desde las opciones (con y sin nombre, y que el Klondike no lo ofrece), elección por familias y buscador, y adaptar los E2E que eligen el juego en la rejilla plana
- [x] 4.2 E2E del asistente en red: sala con permiso, dos jugadores; el que lo tiene activo ve la sugerencia, el otro no; sin permiso no aparece el interruptor
- [x] 4.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
