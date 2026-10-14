## 1. Corazones: reglas (engine)

- [x] 1.1 Definir `ConfigCorazones`, `EstadoCorazones`, `AccionCorazones`, `ResultadoManoCorazones` y `VistaCorazones`; implementar `crear` y el reparto
- [x] 1.2 Implementar el pase de 3 cartas con su dirección por mano y la entrega simultánea
- [x] 1.3 Implementar la salida con el 2 de tréboles, las bazas con seguir el palo, la primera baza sin puntos y los corazones rotos
- [x] 1.4 Implementar la puntuación con la luna, los totales, el fin de la partida, la mano siguiente, `vistaDe` y `resultado`
- [x] 1.5 Tests de todos los escenarios de `specs/juego-corazones` y la suite genérica del contrato; exportar desde `index.ts`

## 2. IA de los Corazones (engine)

- [x] 2.1 Implementar `iaCorazonesBasica`: pase por peligro, seguir el palo sin ganar, descartes sin el palo y salida
- [x] 2.2 Tests de los escenarios de la IA, reproducibilidad, tiempo, 1.000 partidas entre IAs y contra el azar

## 3. Cliente: Corazones

- [x] 3.1 Registrar los Corazones en `juegos.ts` (definición, IA y pausas), en `IdJuego` y en `partida.ts`
- [x] 3.2 Añadir los Corazones al menú y sus opciones (pase y puntos), con todos los textos en español
- [x] 3.3 Crear `MesaCorazones.svelte` sobre `MesaBazas`: puntos por jugador, corazones rotos, panel de pase y aviso de las cartas recibidas
- [x] 3.4 Mostrar el resumen de cada mano en un panel que pausa la sesión hasta «Siguiente mano», y la clasificación en la pantalla de fin
- [x] 3.5 Escribir la guía "¿Cómo se juega a los Corazones?"

## 4. Verificación

- [x] 4.1 E2E: partida completa contra la IA (a 50), pasando cartas y cerrando el panel de cada mano
- [x] 4.2 E2E: pasar tres cartas y ver las recibidas, la salida obligada con el 2 de tréboles, y la mesa en 360 × 640 sin scroll horizontal
- [x] 4.3 Añadir los Corazones al recorrido E2E de las guías y comprobar que los E2E de Brisca, Tute, Guiñote y Pocha siguen pasando
- [x] 4.4 Ejecutar todos los tests (motor y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
