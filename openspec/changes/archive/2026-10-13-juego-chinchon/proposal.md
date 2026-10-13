## Why

El Chinchón es el último gran clásico de la baraja española que falta en la suite. Es de otra familia que los juegos que ya hay (bazas y capturas): un juego de robar, descartar y formar combinaciones, con información oculta y partidas largas por eliminación. Añadirlo completa la oferta española y obliga a resolver dos cosas que la suite aún no tiene: los comodines y la búsqueda de la mejor combinación de una mano.

## What Changes

- Nuevo juego **Chinchón**, jugable de principio a fin contra la IA, de 2 a 4 jugadores (cada uno por su cuenta):
  - Reparto de 7 cartas, una carta boca arriba que empieza el descarte y el resto como mazo.
  - En cada turno se roba del mazo o del descarte y luego se descarta una carta, o se cierra.
  - Combinaciones: escaleras de 3 o más cartas seguidas del mismo palo, y tríos o cuartetos del mismo valor. Los comodines sustituyen a cualquier carta.
  - Cerrar: se puede cuando, tras el descarte, todas las cartas quedan ligadas salvo como mucho una de poco valor.
  - Puntuación: cerrar con todo ligado da −10, el chinchón (escalera de 7 del mismo palo sin comodines) gana la partida, y el resto de jugadores suma los puntos de sus cartas sin ligar, calculados con su mejor combinación posible.
  - Eliminación al pasar el límite (100 por defecto). Gana el último que queda.
  - Variantes configurables: baraja de 40 o 48 cartas, con o sin comodines, límite de 50 o 100 y valor máximo de la carta suelta al cerrar.
- Comodines en el modelo de barajas: identificadores propios, que se pueden añadir a una baraja.
- IA básica del Chinchón: decide si robar del descarte, qué descartar y cuándo cerrar, a partir de su mejor combinación.
- El cliente suma el Chinchón al menú, sus opciones, una mesa con mazo y descarte, la mano ordenable (por combinaciones, palo o valor) con las combinaciones marcadas, los botones para descartar y cerrar, el resultado de cada mano con las manos destapadas y su guía "¿Cómo se juega?".
- Fuera de alcance: colocar cartas propias en las combinaciones del que cierra, el «reenganche» de eliminados, reordenar la mano a mano arrastrando y el modo en red.

## Capabilities

### New Capabilities
- `juego-chinchon`: reglas del Chinchón de 2 a 4 jugadores: reparto, robo y descarte, combinaciones con comodines, cierre, chinchón, puntuación, eliminación y variantes configurables.

### Modified Capabilities
- `baraja`: se agregan los comodines, que pueden añadirse a una baraja española.
- `ia-jugadores`: se agrega la IA básica del Chinchón, con su nivel mínimo de juego y sus escenarios.
- `mesa-cliente`: el menú incluye el Chinchón, y la mesa permite robar, descartar y cerrar, ordenar la mano viendo sus combinaciones, y ver al final de cada mano las manos destapadas y la puntuación.

## Impact

- `packages/engine`:
  - Comodines en `baraja/cartas.ts`. El tipo `IdCarta` suma los identificadores de comodín y el resto de juegos no cambia.
  - Nuevos `juegos/chinchon.ts` (con el cálculo de la mejor combinación de una mano) e `ia/chinchon-basica.ts`, con sus tests y la suite genérica del contrato.
- `packages/client`:
  - El componente `Carta` dibuja el comodín.
  - Nueva mesa del Chinchón, que reutiliza los asientos rivales y la mano propia.
  - Cambian las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas tienen muchas variantes regionales. Se redactan a partir del juego clásico, las más importantes son configurables y las valida el usuario.
