## Context

En la Siete y media de la suite (`juegos/siete-y-media.ts`), `liquidar` paga el doble a un punto ganador si `config.pagoDoble` está activado y su jugada es una siete y media natural (`esSieteYMediaNatural`: exactamente un 7 y una figura). Núñez Elvira paga el doble a cualquier siete y media que gana a la banca.

## Goals / Non-Goals

**Goals:**
- Cobrar el doble con cualquier siete y media como opción del mismo juego, en local y en red.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- La otra propuesta de Núñez: la banca obligada a pedir con 5 y a plantarse con 6, con todas las cartas a la vista. Es una idea suya, no una regla que se juegue.

## Decisions

### 1. Una opción aparte, ligada al pago doble
- **`ConfigSieteYMedia`:** gana `dobleCualquiera?: boolean`. `crear` la normaliza a `pagoDoble && config.dobleCualquiera === true`: sin pago doble no significa nada.
- **Alternativa descartada:** cambiar `pagoDoble` a `false | 'natural' | 'cualquiera'`. Rompería el tipo de las partidas guardadas y de las salas, que hoy guardan un booleano.

### 2. Liquidación
- Un punto que gana cobra el doble si hay pago doble y su jugada vale siete y media con la opción, o es natural sin ella.
- Lo demás no cambia: la banca gana los empates, también a siete y media, y paga en orden mientras le alcance.

### 3. IA
- **Normal:** se planta sola con siete y media, porque `transicion` la planta; no hay decisión que cambie.
- **Difícil:** simula con el motor, así que ya juega con el pago de la config.
- **Reconstrucción:** no depende del pago.

### 4. Cliente
- **Opciones:** dentro del grupo del pago doble, una segunda casilla «Con cualquier siete y media», con su `data-testid` y desactivada mientras el pago doble está apagado. Sirve igual en local y en la sala en red, que usan las mismas opciones.
- **Guía:** en «Quién gana», una línea de variante con la opción.

## Risks / Trade-offs

- **La opción marcada con el pago doble apagado:** `crear` la normaliza a `false`, así que la partida es la de sin pago doble.
