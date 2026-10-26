## 1. Durak: reglas (engine)

- [x] 1.1 Definir `ConfigDurak` (de 2 a 6 jugadores), `EstadoDurak`, `AccionDurak`, `VistaDurak` y `crear` con la baraja de 36, el reparto, el triunfo y el primer atacante
- [x] 1.2 Implementar atacar, echar (con sus límites y saltando a quien no puede), defender, llevarse la mesa, pasar, el fin de la ronda con el robo, salir, el fin de la partida, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-durak` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Durak (engine)

- [x] 2.1 Implementar `iaDurakBasica`
- [x] 2.2 Implementar la reconstrucción del Durak y `SIMULABLE_DURAK`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs de 2 a 6, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Durak a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Durak

- [x] 3.1 Registrar el Durak en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones (jugadores) y textos en español
- [x] 3.2 Crear `MesaDurak.svelte`: rivales, mazo con triunfo, mesa de ataques y defensas, descarte, mano y los botones «Me las llevo» y «Paso»
- [x] 3.3 La pantalla de fin con el durak y el orden de salida, y la guía «¿Cómo se juega al Durak?»

## 4. Verificación

- [x] 4.1 E2E: atacar, defender, llevarse las cartas, pasar y una partida completa contra la IA
- [x] 4.2 E2E: 6 jugadores en 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Durak en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
