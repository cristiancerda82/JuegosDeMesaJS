## 1. Registro (cliente)

- [x] 1.1 Crear `src/estadisticas/estadisticas.ts`: tipos, `registrar` con rachas y récords, `resultadoDe`, y lectura, guardado y borrado tolerantes a fallos con versión
- [x] 1.2 Añadir Vitest al cliente (dependencia de desarrollo y script `test`) y tests del módulo: rachas, récords, empates, datos dañados y de otra versión
- [x] 1.3 Registrar la partida en la `Sesion` al terminar, con tiempo y movimientos en los solitarios, y exponer las novedades

## 2. Pantallas

- [x] 2.1 Crear `Estadisticas.svelte` con las tarjetas por juego, el total, borrar con confirmación y volver; enlazarla desde el menú y `App.svelte`
- [x] 2.2 Mostrar la racha y los avisos de récord en la pantalla de fin
- [x] 2.3 Textos en español de la pantalla, el botón y los avisos

## 3. Verificación

- [x] 3.1 E2E: ganar un Klondike y ver sus estadísticas con récords; que recargar no duplique el registro
- [x] 3.2 E2E: abandonar un solitario cuenta como perdida y la racha vuelve a 0; borrar las estadísticas
- [x] 3.3 E2E: aviso de récord en la pantalla de fin y la pantalla en 360 × 640 sin scroll horizontal
- [x] 3.4 Ejecutar todos los tests (motor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
