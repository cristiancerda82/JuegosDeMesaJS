## Why

Todos los juegos contra la máquina tienen hoy una sola IA, la «básica». Para quien empieza puede ser demasiado, y para quien ya domina un juego se queda corta. Elegir el nivel de la IA es lo que más alarga la vida de cada juego: el principiante aprende ganando de vez en cuando y el experto encuentra un rival que le obliga a pensar.

## What Changes

- **Tres niveles de IA** en los 11 juegos contra la máquina (Brisca, Tute, Guiñote, Escoba, Chinchón, Siete y media, Cinquillo, Pocha, Mus, Corazones y Burro):
  - **Fácil:** la IA actual, pero se equivoca a propósito: en una parte de sus decisiones elige una acción legal al azar.
  - **Normal:** la IA actual, sin cambios. Es el nivel por defecto.
  - **Difícil:** una IA por simulación.
    - Antes de cada decisión imagina varias veces las cartas que no ve: las manos ajenas y el mazo, de forma coherente con lo que sabe.
    - Para cada acción legal juega el resto de la mano con la IA normal, y elige la que mejor resultado da de media.
    - Es reproducible con su semilla y decide en menos de 500 ms.
- **El Burro**, donde lo decisivo es reaccionar, cambia de nivel sobre todo en la velocidad:
  - en fácil, la IA tarda más en plantarse y a veces pasa una carta al azar;
  - en difícil, reacciona más rápido.
- **Elegir el nivel:** en las opciones de cada juego contra la máquina hay un selector «Nivel de la IA» (Fácil, Normal o Difícil). Cada juego recuerda el último nivel elegido.
- **Guardado:** la partida guarda su nivel y, al retomarla, la IA sigue con el mismo. Las partidas guardadas antes de este cambio se retoman en Normal.
- Fuera de alcance:
  - estadísticas separadas por nivel;
  - cambiar de nivel a mitad de partida;
  - niveles en los solitarios.

## Capabilities

### New Capabilities
- `niveles-ia`: los tres niveles de la IA y sus garantías:
  - qué hace cada nivel;
  - la simulación del difícil, con la reconstrucción de las cartas ocultas coherente con la vista;
  - la fuerza relativa entre niveles.

### Modified Capabilities
- `mesa-cliente`:
  - las opciones de los juegos contra la máquina incluyen el nivel de la IA, que se recuerda por juego;
  - la partida guardada conserva el nivel;
  - en el Burro, los retrasos de reacción de la IA dependen del nivel.

## Impact

- **`packages/engine`:**
  - Nuevo `ia/niveles.ts` con:
    - el tipo `NivelIA`;
    - el envoltorio de errores del nivel fácil;
    - el agente genérico por simulación.
  - Por cada juego, una función que reconstruye un estado completo a partir de la vista de un asiento, con sus tests: el estado reconstruido MUST dar exactamente la misma vista. Algunas vistas pueden necesitar algún dato público más para que la reconstrucción sea posible.
  - Tests de fuerza (difícil contra normal) que tardan minutos: se ejecutan con una variable de entorno, no en cada ejecución.
- **`packages/client`:**
  - `DefJuego.ia` pasa de un agente a uno por nivel.
  - `Sesion` y el guardado conocen el nivel.
  - Cambian las opciones y los retrasos del Burro.
- Sin dependencias nuevas.
- **El coste es grande:** la reconstrucción de la vista es distinta en cada uno de los 11 juegos. Las tareas van juego a juego.
