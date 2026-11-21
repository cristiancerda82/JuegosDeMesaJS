## Context

El Remigio de la suite (`juegos/remigio.ts` y `juegos/remigio-combinaciones.ts`) es el de 7 cartas:
- dos barajas españolas de 40 y 4 comodines;
- combinaciones bajadas a la vista, a las que se puede añadir y en las que se pueden cambiar comodines;
- remigio doble si se baja todo de golpe.

Las cartas son `CartaRemigio`, un `IdCarta` con su copia (`"oros-12#1"`). Así las dos copias de una carta son distintas en la mano.

El Remigio de Núñez Elvira es otro reparto del mismo juego:
- dos barajas de 52 con dos comodines cada una;
- 10 cartas por jugador;
- nadie baja durante la mano y se cierra con las diez cartas ligadas;
- los cierres difíciles multiplican lo que pagan los demás.

## Goals / Non-Goals

**Goals:**
- Jugar el Remigio de diez cartas como opción del mismo juego, en local y en red.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- **De 6 a 10 jugadores con tres barajas.** La suite sigue de 2 a 5.
- **El premio «Remigio», diez cartas iguales sin comodines (×15).** Con dos barajas solo hay 8 cartas de cada número, así que es imposible. Diez iguales con comodines son un cierre normal.
- **La variante propia de Núñez:** no poder descartar la carta que se acaba de robar.
- **El pago en fichas.** Se mantienen la suma de puntos y la eliminación al pasar de 100.
- **El final de la segunda vuelta del mazo.** Núñez da la mano a quien tiene menos puntos sin ligar. La suite mantiene la mano anulada, como en el Remigio de 7.
- **La baraja española con diez cartas.** El libro la permite, pero la variante se ofrece con la francesa, que es lo que dice la guía.

## Decisions

### 1. Una opción del mismo juego
- **`ConfigRemigio`:** gana `diezCartas?: boolean`, que `crear` normaliza a `config.diezCartas === true`.
- **Alternativa descartada: un juego aparte.** Comparte el turno, el montón, el mazo rehecho, la eliminación y la mesa. Un juego nuevo duplicaría todo eso.

### 2. Las cartas
- `cartasRemigio(diez)` devuelve las 108 cartas, en el mismo formato `IdCarta#copia`:
  - por cada copia, los cuatro palos franceses del 1 al 13;
  - `comodin-1#c` y `comodin-2#c`.
- `numeroRemigio` ya lee el valor de la carta francesa: del 1 al 13.
- `puntosCartaRemigio` distingue la baraja por el palo de la carta:
  - francesa: J 10, Q 11, K 12;
  - española: igual que ahora.
- El resto de funciones de combinaciones solo se usan con 7 cartas.

### 3. Ligar las diez cartas (`remigio-diez.ts`)
Con diez cartas el palo no cuenta ni en los grupos ni en las escaleras. Por eso una mano se reduce a cuántas cartas tiene de cada número y cuántos comodines.

**`sueltasRemigioDiez(mano)`** busca la forma de ligar que deja menos puntos sin ligar:
- **Búsqueda:** en profundidad, con memoria por la cuenta de números y comodines. Toma el número más bajo que queda y prueba tres cosas:
  - dejar una carta suya sin ligar;
  - formar con ella un grupo de 3 o más cartas, con al menos 2 naturales y comodines si hacen falta;
  - empezar con ella una escalera, que puede llevar comodines por debajo. En cada puesto pone una carta natural o un comodín.
- **El As:** antes de buscar, se prueba cuántos Ases van como 14 (detrás de la K). Así se cubren las dos puntas sin dar la vuelta.
- **Resultado:** devuelve las cartas sin ligar (las de los números que quedan y los comodines sobrantes) y sus puntos.
- **Tamaño:** como mucho 11 cartas, así que la búsqueda es corta.

**`jugadaCierreRemigioDiez(mano)`** decide si diez cartas están ligadas y con qué premio:
- **Color:** todas las naturales del mismo palo, o del mismo color rojo o negro.
- **Escalera de diez:** los diez números seguidos (con el As abajo o arriba), con los comodines rellenando huecos o alargando.
- **Escalera de color:** la de diez, y además de color.
- **Ligadas:** cero puntos sin ligar.
- **Multiplicador:** el mayor de los que cumple. Cada premio tiene dos valores según la mano tenga comodines o no:

  | Cierre | Con comodines | Sin comodines |
  |---|---|---|
  | Normal | ×1 | ×2 |
  | Color | ×3 | ×4 |
  | Escalera de diez | ×5 | ×6 |
  | Escalera de color | ×8 | ×10 |

  Devuelve `null` si las diez cartas no están ligadas y no son de color.

### 4. El motor con diez cartas
- **Reparto:** 10 cartas a cada uno.
- **Fase de bajar:** las acciones legales son:
  - `descartar` una carta de cada clase;
  - `cerrar` con una carta de cada clase cuya salida deja las otras diez con jugada de cierre.

  `bajar`, `anadir` y `cambiar` no son legales con diez cartas.
- **`AccionRemigio`:** gana `{ tipo: 'cerrar'; carta }`. La carta va al montón y la mano se cierra.
- **`cerrarMano`:**
  - **Con diez cartas:** quien cierra suma 0. Los demás suman los puntos de `sueltasRemigioDiez` por el multiplicador.
  - **Sin la opción:** igual que ahora.
- **`ResultadoManoRemigio`** gana cuatro campos, solo con diez cartas:
  - `jugada`: `'normal' | 'color' | 'escalera' | 'escaleraColor'`;
  - `conComodines`;
  - `multiplicador`;
  - `sueltas`: las cartas sin ligar de cada uno.

  `remigio` queda en `false`.
- **Lo que no cambia:** la vista y el resto de reglas (robar, mazo rehecho, mano anulada, eliminación). `combinaciones` queda vacío y `bajado` en `false`.

### 5. IA
**Normal, con diez cartas:**
- cierra si `cerrar` es legal, con la carta que da el mayor multiplicador;
- roba del montón si con esa carta algún descarte le deja menos puntos sin ligar que ahora; si no, roba del mazo;
- descarta la carta que deja menos puntos sin ligar. Entre las que dejan lo mismo, la que tiene menos vecinas (mismo número o a uno o dos puestos) y después la que más vale. No descarta comodines mientras tenga otra opción.

**Difícil:**
- simula robar y los mejores descartes de la base, y cierra como la normal;
- la valoración de una mano sin cerrar usa los puntos sin ligar;
- la reconstrucción reparte las cartas ocultas de la baraja de la config.

### 6. Cliente
- **Opciones:** casilla «Diez cartas» (`data-testid="remigio-diez"`). Sirve igual en local y en la sala en red.
- **Mesa, con diez cartas:**
  - sin la zona de combinaciones ni el botón «Bajar»;
  - el botón «Cerrar» (`data-testid="cerrar"`) se activa con una carta elegida que permite cerrar;
  - la información muestra los puntos sin ligar de la mano;
  - la mano se ordena por los palos franceses y por número del 1 al 13;
  - los avisos de los rivales incluyen «cierra».
- **Resumen:**
  - cómo cerró quien cerró y el multiplicador;
  - las cartas sin ligar de cada uno en lugar de toda su mano.
- **Catálogo:** el Remigio pasa a tener las dos barajas. Con el filtro francesa también aparece.
- **Guía:** la línea «En otros sitios…» se sustituye por una sección de la variante que dice que se activa con la opción.

## Risks / Trade-offs

- **Escaleras de cualquier palo.** Ligar es más fácil que en otros rummys, pero es lo que dice el libro: si no, la escalera de diez y la de color serían el mismo premio. La guía lo explica.
- **Rendimiento.** `accionesLegales` resuelve hasta 11 manos de 10 cartas en cada turno de descarte, y el difícil lo hace en cada simulación. Para mantenerlo bajo control:
  - la búsqueda trabaja con la cuenta de números, no con las cartas;
  - la memoria es por llamada;
  - hay una prueba de tiempo.
- **Premios grandes con la eliminación a 100.** Un ×10 elimina casi seguro. Es el riesgo que el libro quiere premiar.
