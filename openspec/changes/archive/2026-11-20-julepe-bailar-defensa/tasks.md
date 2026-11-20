## 1. Motor

- [x] 1.1 `bailarla` y `defensa` en la config (normalizadas)
- [x] 1.2 La fase `bailar` con sus acciones, la vista a ciegas del que reparte, el cobro doble y el julepe doble
- [x] 1.3 La defensa del bote: la sexta carta, el descarte de una sin robar y el cobro sin julepe; `bailada` y `defiende` en la vista y en el resultado de la mano
- [x] 1.4 Tests de los escenarios nuevos de `specs/juego-julepe` y la suite genérica del contrato con las opciones

## 2. IA

- [x] 2.1 La IA básica baila con un As o un Tres de muestra y, al defender, suelta su peor carta; la reconstrucción con la mano a ciegas y el difícil deja bailarla a la base
- [x] 2.2 Tests de los escenarios de la IA, partidas entre IAs y contra el azar con las opciones, la reconstrucción y la fuerza del difícil

## 3. Cliente

- [x] 3.1 Las casillas «Bailarla» y «Defensa del bote» en las opciones (local y sala en red) y sus textos
- [x] 3.2 La mesa: bailarla o mirar, la mano a ciegas, los avisos, la marca en la cabecera y el descarte del defensor
- [x] 3.3 La guía: las dos variantes y sus opciones

## 4. Verificación

- [x] 4.1 E2E: bailarla desde la mesa, la defensa del bote con una sola carta en el descarte, una partida completa con las dos opciones y una sala en red con ellas
- [x] 4.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
