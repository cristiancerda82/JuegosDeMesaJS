## 1. Variante Sixty-six (engine)

- [x] 1.1 Añadir `variante` a `ConfigSchnapsen` y `CONFIG_SIXTY_SIX`; la baraja de 24, la mano de 6, el cambio con el 9 y las 10 de últimas según la variante, sin cambiar el Schnapsen
- [x] 1.2 Tests de los escenarios de la variante, de que el Schnapsen sigue igual (también con un estado sin `variante`) y la suite genérica del contrato con la config del Sixty-six
- [x] 1.3 La reconstrucción con la baraja de la variante; registrar el Sixty-six en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción; comprobar la IA (partidas, azar, tiempo y fuerza) con la variante

## 2. Cliente: Sixty-six

- [x] 2.1 Registrar el Sixty-six en `juegos.ts`, `IdJuego` y `partida.ts`, con la mesa, el resumen y el fin del Schnapsen; menú y textos en español
- [x] 2.2 «Cambiar el 9» en la mesa del Sixty-six, y la guía «¿Cómo se juega al Sixty-six?»

## 3. Verificación

- [x] 3.1 E2E: empezar con 6 cartas, cambiar el 9, una partida completa contra la IA, retomar, 360 × 640 y la guía en el recorrido de las guías
- [x] 3.2 E2E: sala de Sixty-six en red con dos navegadores
- [x] 3.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
