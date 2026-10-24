## 1. Texas Hold'em: reglas (engine)

- [x] 1.1 Crear `holdem-manos.ts`: valor de una mano de cinco, la mejor de siete, las categorías y sus nombres; tests de todas las categorías, el As bajo y los desempates
- [x] 1.2 Definir `ConfigHoldem` (2–6 jugadores), `EstadoHoldem`, `AccionHoldem`, `VistaHoldem`, `ResultadoManoHoldem` y `crear` con el botón, las ciegas y el reparto
- [x] 1.3 Implementar el ciclo de apuestas (pasar, igualar, subir con la subida mínima, all-in y all-in corto, retirarse), las calles, los botes secundarios, el showdown con reparto de empates, la eliminación, las ciegas crecientes, el fin, `vistaDe` y `resultado`
- [x] 1.4 Tests de todos los escenarios de `specs/juego-texas-holdem` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Texas Hold'em (engine)

- [x] 2.1 Implementar `iaHoldemBasica` (por fuerza de mano antes y después del flop, all-in con pocas fichas)
- [x] 2.2 Implementar `iaHoldemExperta` (equity por simulación, probabilidades del bote, tamaño de apuesta y farol); registrar los tres niveles en `IAS` y en la tabla de niveles
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 200 partidas entre IAs de 2 a 6, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Texas Hold'em a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Texas Hold'em

- [x] 3.1 Registrar el Texas Hold'em en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaHoldem.svelte`: rivales, cartas comunes, botes, cartas propias y los botones de retirarse, pasar, igualar, apostar y subir con el selector y sus atajos
- [x] 3.3 Crear `ResumenHoldem.svelte` entre manos, la pantalla de fin con la clasificación y la guía «¿Cómo se juega al Texas Hold'em?»

## 4. Verificación

- [x] 4.1 E2E: igualar, pasar, subir con un atajo, retirarse, ver el showdown en el resumen y una partida completa contra la IA
- [x] 4.2 E2E: 6 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Texas Hold'em en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
