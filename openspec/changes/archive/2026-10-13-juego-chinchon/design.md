## Context

El motor tiene el contrato de juego, la baraja española de 40 y 48 cartas, el azar sembrado, el reparto y las utilidades de asientos (`siguiente`). La Brisca, el Tute y la Escoba se juegan por bandos fijos. El Chinchón no: cada jugador va por su cuenta, hay eliminados y el número de jugadores activos cambia entre manos. Además es el primer juego con comodines y con una búsqueda de combinaciones dentro de la mano.

El cliente tiene la sesión (con `pausar()` y `reanudar()`), la interacción con arrastre y toque, el FLIP y las piezas de mesa `AsientoRival` y `ManoPropia`. El panel de fin de mano de la Escoba ya resolvió cómo detener la partida hasta que el jugador lee un resultado. Las reglas están en specs/juego-chinchon.

## Goals / Non-Goals

**Goals:**
- Que el Chinchón cumpla el contrato del motor y pase la suite genérica de propiedades.
- Un cálculo de la mejor combinación de una mano exacto y rápido, que comparten el motor (cierre y puntos), la IA y el cliente (marcar combinaciones).
- Que los comodines no cambien nada en los juegos existentes.

**Non-Goals:**
- Colocar cartas propias en las combinaciones de quien cierra, el reenganche y el reordenado manual de la mano (ver la propuesta).
- Una IA que recuerde las cartas descartadas o que intente adivinar las manos rivales.

## Decisions

### 1. Comodines como identificadores aparte
`IdCarta` pasa a ser `` `${Palo}-${number}` | 'comodin-1' | 'comodin-2' ``. Se añaden `COMODINES`, `esComodin(id)` y la opción de crear una baraja española con comodines. `cartaDeId` sigue devolviendo `null` para un comodín, porque no tiene palo ni valor. Ningún juego existente usa comodines, así que no cambia su comportamiento, y el compilador obliga a tratar el caso allí donde se use el palo.
- *Alternativa:* un palo ficticio "comodín" con valor 0. Se descarta porque mezclaría el comodín en las cuentas de palos y valores de otros juegos.

### 2. Mejor combinación por búsqueda exacta sobre la mano
`mejorReparto(cartas, baraja)` devuelve `{ combinaciones, sueltas, puntos }`:
1. Se generan las combinaciones candidatas de la mano: escaleras de 3 o más cartas seguidas del mismo palo, grupos de 3 o 4 del mismo valor, y las variantes con un comodín ocupando un hueco o un extremo. Nunca hay dos comodines en la misma combinación.
2. Se busca el subconjunto de candidatas disjuntas que minimiza los puntos sueltos, con recursión memoizada sobre la máscara de cartas restantes: para la carta más baja de la máscara, o queda suelta o entra en una candidata que la contiene. La mano tiene como mucho 8 cartas, así que hay a lo sumo 256 máscaras.

El orden de las cartas en una escalera depende de la baraja: en la de 40, el 7 y la sota son seguidos. El cierre se comprueba con este mismo cálculo sobre las 7 cartas que quedan tras cada descarte posible.
- *Alternativa:* una heurística voraz (primero escaleras, después grupos). Se descarta porque falla en manos donde una carta podría ir en las dos, y el cierre tiene que ser exacto.

### 3. Estado, fases y acciones
JSON plano con:
- `config`, `azar`, `repartidor`.
- `mazo`, con la carta de arriba al final.
- `descarte`, con la carta de arriba al final.
- `manos` y `turno`.
- `fase: 'robar' | 'descartar'`.
- `robadaDelDescarte: IdCarta | null`, para impedir devolverla.
- `puntos` acumulados por asiento.
- `eliminados`.
- `resultadosManos`, con las manos destapadas, la mejor combinación de cada una, quién cerró, los puntos de la mano y si hubo chinchón.

Las acciones son `robar { desde: 'mazo' | 'descarte' }`, `descartar { carta }` y `cerrar { carta }`. Si el mazo está vacío al robar, la transición baraja el descarte (salvo la carta de arriba) con el `azar` del estado, así que es determinista.

Los asientos eliminados no tienen acciones y se saltan al avanzar el turno. El reparto de cada mano va solo a los activos.

### 4. Vista
`VistaChinchon` incluye la mano propia, `cartasEnMano`, la carta de arriba del descarte, cuántas cartas tienen el mazo y el descarte, el turno, la fase, los puntos, los eliminados, `ultimaAccion` (quién robó de dónde y qué descartó, sin revelar una carta robada del mazo) y `resultadosManos`. El oráculo de la suite genérica considera ocultos el mazo, las manos ajenas y las cartas del descarte que no están arriba.

### 5. IA básica
Usa `mejorReparto` sobre su vista:
- **Robar:** compara los puntos de su mejor mano tras el mejor descarte con y sin la carta del descarte, y roba de ahí solo si mejora.
- **Descartar:** elige la carta cuyo descarte deja menos puntos sueltos y, si empatan, la de más valor. Nunca descarta un comodín si tiene otra opción.
- **Cerrar:** siempre que es legal, eligiendo el cierre de menos puntos (prefiere el chinchón y el cierre con todo ligado).

### 6. Cliente: mesa del Chinchón
`MesaChinchon.svelte` reutiliza `AsientoRival` (el detalle muestra los puntos acumulados o «Eliminado») y `ManoPropia`, a la que se añade una propiedad opcional para marcar a qué combinación pertenece cada carta.
- **Mazo y descarte** son orígenes de arrastre hacia la mano. Para que un solo toque robe sin tener que elegir primero, `Interaccion` gana un gancho opcional `alTocar(origen)`. Si el gancho consume el toque, no se selecciona nada. Es un cambio pequeño y genérico.
- **Descartar:** arrastrar una carta al descarte, hacer doble toque o elegirla y pulsar "Descartar". "Cerrar" se activa solo si cerrar con la carta elegida es legal.
- **Ordenar la mano:** un selector con tres opciones. "Por combinaciones" agrupa según `mejorReparto` (combinaciones primero, sueltas al final); también se puede ordenar por palo o por valor. Bajo la mano se muestran los puntos sueltos actuales.
- **Acciones de los rivales:** se anuncian con un aviso breve ("Rival 2 roba del descarte", "Rival 2 descarta…"), con una pausa corta tras cada una.
- **Fin de mano:** igual que en la Escoba, un panel con las manos destapadas y agrupadas, quién cerró, los puntos de la mano, los acumulados y los eliminados. Pausa la sesión hasta pulsar "Siguiente mano". La pantalla de fin muestra la clasificación final.

### 7. Registro en el cliente
`IdJuego` suma `'chinchon'`, con su `DEF_CHINCHON`, la sesión en `partida.ts`, las opciones, los textos, la entrada del menú y la guía, con ejemplos de una escalera, un trío con comodín y el cierre. El componente `Carta` dibuja el comodín con un diseño propio y su nombre accesible.

## Risks / Trade-offs

- [Variantes regionales: valor de las figuras y del comodín, máximo para cerrar, 40 o 48 cartas, comodines] → La baraja, los comodines, el límite y el máximo para cerrar son configuración. El valor de las cartas y la regla de un comodín por combinación se documentan en la spec. El usuario valida las specs.
- [Manos que se alargan sin cierre (sobre todo con jugadores al azar)] → El mazo se rebaraja desde el descarte, así que no se bloquea. Las simulaciones tienen un tope de pasos que solo protege a los tests, y la suite del contrato ya limita los pasos.
- [Coste de `mejorReparto` en el cálculo de las acciones legales] → Comprobar el cierre exige hasta 8 cálculos sobre 7 cartas por turno, unas pocas centenas de máscaras cada uno. Es despreciable frente al presupuesto de 500 ms.
- [Ampliar `IdCarta` rompe algún sitio que asume un palo] → El compilador marca esos sitios, y `cartaDeId` ya devuelve `null` para identificadores desconocidos.

## Migration Plan

No hay datos que migrar. Los guardados existentes siguen siendo válidos y `VERSION_MOTOR` no cambia, porque las barajas sin comodines son idénticas.
