## Why

La suite tiene 67 juegos con IA, y muchos de ellos (Skat, Tarot, Bridge, Mus, Cribbage…) son desconocidos para la mayoría de los jugadores. La guía «Cómo se juega» explica las reglas, pero no ayuda en el momento de decidir, y aprender cuesta. Además, la IA juega tan rápido que no da tiempo a ver qué carta ha tirado. En los juegos en los que gana la carta más alta, la mesa tampoco enseña todas las cartas de la vuelta en curso, así que el jugador no puede analizar su jugada.

## What Changes

- **Modo asistido**:
  - **Dónde se activa:** es una opción de cada juego contra la IA (no en los solitarios, que ya tienen su botón «Pista»). Se activa en las opciones de cada juego y se recuerda por juego.
  - **Sugerencia:** en el turno del jugador, la mesa resalta la jugada que haría la IA en su lugar y explica en una frase por qué (por ejemplo, «Ganas la baza y te llevas 11 puntos sin gastar triunfo»).
  - **Comentario de la jugada:** cuando el jugador juega otra cosa, se le comenta su jugada sin impedirla (por ejemplo, «Has dado 10 puntos al rival: con el 4 de copas no perdías nada»).
  - **Consejos de fase:** la primera vez que aparece cada fase del juego (subasta, cante, descarte…) se muestra un consejo breve.
  - **Sin coste:** no cuenta para las estadísticas como trampa ni cambia las reglas.
- **Ritmo de las jugadas**:
  - Nueva opción general «Velocidad de las jugadas»: Rápida (la actual), Normal y Pausada. La nueva Normal, que es la de por defecto, es más lenta que la actual.
  - La última carta que tira cada rival se queda marcada en la mesa con el nombre de quien la jugó hasta que juega el siguiente.
  - Se aplica a las partidas contra la IA y a las partidas en red, con humanos y con IAs.
- **Vuelta visible**:
  - En los juegos en los que se juega por encima de la carta anterior (Culo, Big Two), la mesa muestra todas las jugadas de la vuelta en curso, apiladas en escalera y con el autor de cada una, no solo la última.
  - En los juegos de bazas, la baza terminada sigue a la vista hasta que el jugador la ve: con la velocidad Pausada se queda hasta que toca la mesa. Además, se puede volver a ver la última baza.
  - Se revisan las 67 mesas para encontrar otros casos en los que no se ven todas las cartas de la vuelta.
- Recordatorio que no es parte de este change: después de terminarlo, probar el servidor en Railway (change `red-publica-movil`, tarea 3.2).

## Capabilities

### New Capabilities
- `modo-asistido`: sugerencia de jugada con explicación, comentario de la jugada del jugador y consejos de fase en los juegos contra la IA; qué juegos lo tienen, cómo se activa y qué garantías da.

### Modified Capabilities
- `mesa-cliente`:
  - «Turnos de la IA» pasa a depender de la velocidad elegida y marca la última carta de cada rival;
  - «Información visible en la mesa» exige ver todas las cartas de la vuelta en curso;
  - se añaden los requisitos «Velocidad de las jugadas» y «Ver la última baza».

## Impact

- `packages/engine`:
  - nuevo módulo `ia/asistente.ts`, con la sugerencia (el agente del juego aplicado a la vista del jugador) y los explicadores por familia (bazas, captura, combinaciones y descarte, envite) que devuelven un motivo con código y datos;
  - la vista del Big Two añade las jugadas de la vuelta con su autor (información pública).
- `packages/client`:
  - componente común `Asistente.svelte` (sugerencia, comentario y consejo);
  - resalte genérico de las cartas de una acción;
  - opción «Modo asistido» en `Opciones.svelte` y preferencias guardadas;
  - `FACTOR_PAUSAS` combinado con la velocidad elegida en `sesion.svelte.ts` y `sesion-red.svelte.ts`;
  - `Tapete.svelte` con la marca de la última carta y la última baza;
  - las mesas del Culo y del Big Two con la vuelta en escalera;
  - textos de los motivos y de los consejos en `textos.ts`.
- Tests: unitarios de los explicadores y de la sugerencia, y e2e del modo asistido, de la velocidad y de la vuelta visible. Los e2e existentes usan `?rapido`, así que la nueva velocidad Normal no los ralentiza.
- Sin cambios en el servidor ni en el protocolo de red.
