## Context

En el Polignac de la suite (`juegos/polignac.ts`):
- `rangoPolignac` da el orden del 7 (7) al As (14);
- `ganadoraPolignac` y `cartasLegalesPolignac` deciden la baza y las cartas que se pueden jugar;
- `penalizaPolignac` reconoce las Jotas por su valor;
- la IA básica, la reconstrucción y la mesa usan esas funciones.

## Goals / Non-Goals

**Goals:**
- El orden antiguo y la obligación de soltar Jotas como opción del mismo juego, con la IA de los tres niveles, en red y en la mesa.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- Otras reglas caseras del Polignac, como contar también las Damas.

## Decisions

### 1. Opción en la config
- **`ConfigPolignac`:** gana `ordenAntiguo?: boolean`. `crear` la normaliza a `config.ordenAntiguo === true`.
- **Orden:** `rangoPolignac(carta, antiguo = false)`. Con el orden antiguo el Rey vale 14, la Dama 13, la Jota 12, el As 11, y del 10 al 7 lo mismo que su número. El Rey sigue siendo lo más alto, así que la IA del general (cartas seguidas desde 14) no cambia de forma.
- **Funciones con el orden:** `ganadoraPolignac(mesa, antiguo = false)` y `cartasLegalesPolignac(mano, mesa, antiguo = false)`. Sin el palo y con el orden antiguo, las legales son la Jota de picas si se tiene; si no, las Jotas que se tengan; y si no hay Jotas, todas.
- **`penalizaPolignac`** sigue reconociendo las Jotas por su valor, sin el orden.

### 2. Lo que se sabe de las Jotas
- **Estado:** `sinJotas?: readonly ('todas' | 'picas' | null)[]`, solo con la opción.
  - Quien no sigue el palo y echa una carta que no es Jota queda en `'todas'`: no tenía ninguna Jota y no puede recibir más.
  - Quien no sigue el palo y echa una Jota que no es la de picas queda en `'picas'`, si no estaba ya en `'todas'`.
  - Se vacía en cada mano nueva.
- **Vista:** es información pública, así que la vista la enseña igual a todos.
- **Por qué es opcional:** las partidas guardadas sin la opción no lo tienen y siguen igual.

### 3. IA
- **Normal (`polignac-basica.ts`):** el orden de la variante sale de `vista.config.ordenAntiguo`, y la IA lo pasa a `rangoPolignac` y a `ganadoraPolignac`. Sin el palo ya soltaba primero la Jota de picas y luego otra Jota; con la opción, las legales la obligan igual.
- **Reconstrucción:** al repartir, una carta solo va a una mano si cumple los palos que no siguió y lo que se sabe de sus Jotas. Se copia `sinJotas`.
- **Difícil:** el mismo `SIMULABLE_POLIGNAC`.

### 4. Cliente
- **Opciones:** casilla «Orden antiguo» con su explicación.
- **Mesa:** ordena la mano con el orden de la variante. Las cartas jugables ya salen de las acciones legales.
- **Guía:** la línea «En otros sitios…» pasa a «Variante (opción «Orden antiguo»)…».

## Risks / Trade-offs

- **Las Jotas ganan más bazas** → la partida resta más puntos y acaba antes. Es lo que pasa con el orden tradicional. La fuerza del difícil se vuelve a medir con la opción.
