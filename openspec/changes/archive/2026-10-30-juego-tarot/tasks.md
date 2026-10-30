## 1. Baraja de Tarot

- [x] 1.1 Añadir la baraja de Tarot al motor: identificadores de triunfos y Excusa, el Caballo francés (valor 14), `BARAJA_TAROT` y sus funciones; tests de la spec `baraja`
- [x] 1.2 Dibujar en el cliente los triunfos, la Excusa y el Caballo, con sus nombres accesibles

## 2. Tarot: reglas (engine)

- [x] 2.1 Definir `ConfigTarot`, `EstadoTarot`, `AccionTarot`, `VistaTarot`, la fuerza y los valores de las cartas, y `crear` con el reparto (y el Petit seco)
- [x] 2.2 Implementar la subasta, la llamada al Rey con 5, el perro y el descarte, las bazas con la Excusa, la *poignée*, los puntos de la mano con el *petit au bout*, la ronda, `vistaDe` con los bandos conocidos y `resultado`
- [x] 2.3 Tests de todos los escenarios de `specs/juego-tarot` y la suite genérica del contrato; exportar desde `index.ts`

## 3. IA del Tarot (engine)

- [x] 3.1 Implementar `iaTarotBasica`
- [x] 3.2 Implementar la reconstrucción del Tarot y `SIMULABLE_TAROT`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 3.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 3.4 Añadir el Tarot a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 4. Cliente: Tarot

- [x] 4.1 Registrar el Tarot en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 4.2 Crear `MesaTarot.svelte`: subasta, llamada, perro, descarte, *poignée*, contrato, bandos conocidos, mano de la ronda y marcador
- [x] 4.3 `ResumenTarot.svelte` para el resumen de la mano y la pantalla de fin, y la guía «¿Cómo se juega al Tarot?»

## 5. Verificación

- [x] 5.1 E2E: subasta, descarte, jugar una baza, el resumen de la mano y una partida completa contra la IA (con 4 y con 5)
- [x] 5.2 E2E: 360 × 640 sin scroll horizontal (también con 3 jugadores y 24 cartas), retomar una partida guardada y la guía en el recorrido de las guías
- [x] 5.3 E2E: sala de Tarot en red con dos navegadores
- [x] 5.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
