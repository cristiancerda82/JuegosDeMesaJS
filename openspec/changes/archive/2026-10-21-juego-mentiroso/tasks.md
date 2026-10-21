## 1. Mentiroso: reglas (engine)

- [x] 1.1 Definir `ConfigMentiroso` (3–6 jugadores) con su validación, `EstadoMentiroso`, `AccionMentiroso` y `VistaMentiroso`; implementar `crear` con el reparto
- [x] 1.2 Implementar bajar (1 a 4 cartas, valor en orden), desconfiar (descubrir, quién se lleva el montón, turno), creer, la victoria, `vistaDe` con lo descubierto y las cartas propias en el montón, y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-mentiroso` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Mentiroso (engine)

- [x] 2.1 Implementar `iaMentirosoBasica`: decir la verdad, mentir con una carta, rellenar con falsas con el montón pequeño y desconfiar (imposible, última bajada, probabilidad)
- [x] 2.2 Implementar la IA difícil con memoria de cartas y bajadas prudentes; registrar los tres niveles en `IAS` y en la tabla de niveles
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 500 partidas entre IAs de 3 a 6, contra el azar y la prueba de fuerza (la difícil gana a la normal en 200 partidas)
- [x] 2.4 Añadir el Mentiroso a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Mentiroso

- [x] 3.1 Registrar el Mentiroso en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaMentiroso.svelte`: rivales, montón y valor, última bajada, mano para marcar, «Bajar N», «¡Mentiroso!», «Me lo creo» y el panel de las cartas descubiertas
- [x] 3.3 Pantalla de fin del Mentiroso y la guía «¿Cómo se juega al Mentiroso?»

## 4. Verificación

- [x] 4.1 E2E: bajar, desconfiar con el panel descubierto, creer la última bajada y una partida completa contra la IA
- [x] 4.2 E2E: 6 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Mentiroso en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
