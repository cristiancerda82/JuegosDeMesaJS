## 1. Motor

- [x] 1.1 `viuda` en la config (normalizada), el estado (`viuda`, `pasadas`) y la vista; el reparto con viuda
- [x] 1.2 Las acciones cambiar, cambiar las tres y pasar, la viuda nueva cuando pasan todos y `finTurno` compartido con descartar
- [x] 1.3 Tests de los escenarios nuevos de `specs/juego-treinta-y-uno` y la suite genérica del contrato con la viuda

## 2. IA

- [x] 2.1 La decisión de la IA básica con viuda, y la reconstrucción con la viuda a la vista
- [x] 2.2 Tests de los escenarios de la IA, partidas entre IAs y contra el azar con viuda, la reconstrucción, el tiempo y la fuerza del difícil con viuda

## 3. Cliente

- [x] 3.1 La casilla «Con viuda» en las opciones (local y sala en red) y sus textos
- [x] 3.2 La mesa con la viuda: cambiar una tocando las dos cartas, cambiar las tres, pasar y plantarse; el aviso de lo que hizo el último y de la viuda nueva; `miTurno` mira `sesion.bloqueada`
- [x] 3.3 La guía: la variante y su opción, con un ejemplo comprobado con el motor

## 4. Verificación

- [x] 4.1 E2E: con viuda, cambiar una, cambiar las tres, pasar y una partida completa; 360 × 640 sin scroll horizontal; sala en red con viuda
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
