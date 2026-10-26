## 1. Euchre: reglas (engine)

- [x] 1.1 Definir `ConfigEuchre`, `EstadoEuchre`, `AccionEuchre`, `VistaEuchre`, el palo y el rango efectivos con los bowers, y `crear` con la baraja de 24 y el reparto
- [x] 1.2 Implementar las dos vueltas para elegir el triunfo, jugar solo, el descarte del repartidor, la mano anulada, las bazas (seguir el palo efectivo y saltar al que deja la mano), los puntos, la partida a 10, `vistaDe` y `resultado`
- [x] 1.3 Tests de todos los escenarios de `specs/juego-euchre` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA del Euchre (engine)

- [x] 2.1 Implementar `iaEuchreBasica`
- [x] 2.2 Implementar la reconstrucción del Euchre y `SIMULABLE_EUCHRE`; registrar los tres niveles en `IAS`, en la tabla de niveles y en las pruebas de reconstrucción
- [x] 2.3 Tests de los escenarios de la IA, reproducibilidad, tiempo, 100 partidas entre IAs, contra el azar y la prueba de fuerza (la difícil gana a la normal)
- [x] 2.4 Añadir el Euchre a `red.ts` y comprobar que el servidor lo acepta en sus tests

## 3. Cliente: Euchre

- [x] 3.1 Registrar el Euchre en `juegos.ts` (definición, IA por nivel, pausas), en `IdJuego` y en `partida.ts`; menú y textos en español
- [x] 3.2 Crear `MesaEuchre.svelte` sobre la mesa de bazas: carta vuelta, botones para pedir, nombrar, jugar solo y pasar, descarte del repartidor, triunfo, bazas y puntos
- [x] 3.3 Crear `ResumenEuchre.svelte` entre manos, la pantalla de fin y la guía «¿Cómo se juega al Euchre?»

## 4. Verificación

- [x] 4.1 E2E: pedir el triunfo, nombrar en la segunda vuelta, descartarse como repartidor, jugar una baza, el resumen de la mano y una partida completa contra la IA
- [x] 4.2 E2E: 360 × 640 sin scroll horizontal, retomar una partida guardada y la guía en el recorrido de las guías
- [x] 4.3 E2E: sala de Euchre en red con dos navegadores
- [x] 4.4 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
