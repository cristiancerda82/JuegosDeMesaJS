## Why

El Spider es, con el Klondike y el FreeCell, el solitario más jugado. Completa la colección de solitarios de la suite con un reto distinto: dos barajas, escaleras de un mismo palo que se retiran solas y un mazo que reparte una carta en cada columna. Además, la dificultad se elige con el número de palos (1, 2 o 4), así que sirve tanto para empezar como para quien busca un reto.

## What Changes

- Nuevo solitario **Spider** con dos barajas francesas (104 cartas), jugable de principio a fin:
  - **Reparto:** 10 columnas, las 4 primeras con 6 cartas y las demás con 5, solo la última boca arriba. Las 50 restantes forman el mazo, que reparte 5 veces una carta en cada columna.
  - **Dificultad:** con 1 palo (por defecto) son todas picas; con 2 palos, picas y corazones; con 4, los cuatro palos. Siempre 104 cartas.
  - **Movimientos:**
    - Una carta se puede poner sobre otra de un valor más alto, sea del palo que sea, o en una columna vacía.
    - Varias cartas solo se mueven juntas si forman una escalera descendente del mismo palo.
    - Al quedar a la vista, la carta boca abajo de una columna se da la vuelta sola.
  - **Mazo:** repartir pone una carta boca arriba en cada columna. Por defecto no se puede repartir con alguna columna vacía (opción: permitirlo).
  - **Escaleras completas:** cuando al final de una columna se forma una escalera del Rey al As del mismo palo, se retira sola. Se gana al retirar las 8.
  - **Deshacer** cualquier movimiento o reparto, sin límite.
  - **Abandonar.**
  - **Contadores:** movimientos y tiempo, y escaleras completadas.
- El cliente suma el Spider al menú:
  - opciones de palos y del reparto con columnas vacías;
  - una mesa de 10 columnas que cabe en el móvil, con arrastre o toque de cartas y escaleras;
  - el mazo con los repartos que quedan y las escaleras completadas;
  - deshacer y abandonar;
  - pantalla de fin con movimientos y tiempo;
  - su guía «¿Cómo se juega?».
- Fuera de alcance: las pistas, la puntuación de Windows (500 − movimientos + 100 por escalera), las variantes Spiderette y Scorpion y las partidas numeradas.

## Capabilities

### New Capabilities
- `juego-spider`: reglas del Spider:
  - reparto por palos;
  - movimientos de cartas y escaleras del mismo palo;
  - reparto desde el mazo, con o sin columnas vacías;
  - retirada automática de escaleras completas;
  - deshacer, abandono y victoria.

### Modified Capabilities
- `mesa-cliente`: el menú incluye el Spider, con sus opciones, su mesa de 10 columnas y su guía.

## Impact

- **`packages/engine`:** nuevo `juegos/spider.ts`, con sus tests y la suite genérica del contrato.
  - Como hay cartas repetidas, el Spider identifica cada carta con su copia (`picas-12#3`).
  - Exporta una función para obtener la carta de la baraja (`picas-12`) que dibuja el cliente.
- **`packages/client`:**
  - Nueva `MesaSpider.svelte`, con el patrón de interacción de `MesaFreeCell`: origen, destinos, arrastre y toque, y FLIP.
  - Cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas son las del Spider clásico de Windows; las valida el usuario, en particular:
  - que por defecto no se pueda repartir con columnas vacías;
  - que deshacer no tenga límite.
