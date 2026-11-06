## 1. Corazones de 3 a 6 (engine)

- [x] 1.1 Añadir `jugadores` a `ConfigCorazones`, la baraja y las cartas por jugador según el número, el pase solo con 4 y el resto del motor con el número de la partida, sin cambiar los Corazones de 4 (también con un estado sin `jugadores`)
- [x] 1.2 Tests de los escenarios nuevos y modificados, y la suite genérica del contrato con 3, 4, 5 y 6 jugadores
- [x] 1.3 La reconstrucción con la baraja de la partida; la tabla de niveles y las pruebas de reconstrucción con 3 y 6; comprobar la IA (partidas, azar, tiempo y fuerza) con 3, 5 y 6

## 2. Cliente

- [x] 2.1 Opción de jugadores en las opciones de los Corazones, con el pase solo con 4; la mesa, el resumen y la pantalla de fin con el número de jugadores
- [x] 2.2 Textos y la sección del Black Lady en la guía de los Corazones

## 3. Verificación

- [x] 3.1 E2E: Corazones de 3 (17 cartas y sin pase), de 6, una partida completa de 3 contra la IA y 360 × 640 con 6 jugadores
- [x] 3.2 E2E: sala de Corazones de 3 en red con dos navegadores
- [x] 3.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
