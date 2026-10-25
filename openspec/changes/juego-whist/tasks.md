## 1. Whist: reglas (engine)

- [x] 1.1 Definir `ConfigWhist`, `EstadoWhist`, `AccionWhist`, `VistaWhist`, `ResultadoManoWhist` y `crear` con el reparto y la carta del triunfo
- [x] 1.2 Implementar las bazas (seguir el palo, fallar, ganar), el cierre de la mano con los puntos, los juegos y la partida, el reparto de la mano siguiente, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-whist` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Whist (engine)

- [x] 2.1 Implementar `iaWhistBasica` (salir, seguir, fallar y descartar)
- [x] 2.2 Implementar la reconstrucción del Whist y `SIMULABLE_WHIST`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Whist a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Whist

- [x] 3.1 Registrar el Whist en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú, opciones y textos en español
- [x] 3.2 Crear `MesaWhist.svelte`: jugadores, baza en curso, triunfo, bazas, puntos y juegos, mano con las cartas legales
- [x] 3.3 Crear `ResumenWhist.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Whist?»

## 4. Verificación

- [x] 4.1 E2E: jugar una carta, seguir el palo (las ilegales apagadas), el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Whist en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
