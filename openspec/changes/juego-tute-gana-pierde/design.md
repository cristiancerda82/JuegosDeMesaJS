## Context

Núñez Elvira describe el Tute gana-pierde como el Tute de 3 jugadores al revés:
- las bazas se hacen igual que en el Tute: asistir, montar y fallar, «sin obligación de echar triunfo si no podemos montar sobre un fallo»;
- no hay pinte: el triunfo nace con las primeras cuarenta.

La suite ya tiene:
- el orden y los puntos del Tute (`VALORES_BRISCA`);
- las obligaciones con el sobrefallo libre (`cartasObligadas`);
- en la Manilla, los topes de lo que se sabe por las obligaciones (`topesManilla`);
- en el Burro de bazas, la partida por penalizaciones y su mesa para 3 o más.

## Goals / Non-Goals

**Goals:**
- El Tute gana-pierde de Núñez para 3, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El Burro gana-pierde y otros números de jugadores.

## Decisions

### 1. Estado y acciones (`juegos/tute-gana-pierde.ts`)
- **Config:** `{ limite: 3 | 6 }`; por defecto, 6, el del libro. El de 3 da partidas más cortas.
- **Baraja:** la de 40 sin los doses (`crearBaraja('espanola40')` sin el valor 2).
- **Reparto:** se da de tres en tres desde el siguiente al que reparte, que es quien sale. Empieza repartiendo el asiento 2, así sale el 0.
- **Acción:** `{ tipo: 'jugar'; carta }`. No hay acción de cantar: los cantes son obligatorios y los hace el motor al cerrar la baza.
- **Obligaciones:** `cartasObligadas` con el triunfo del momento (`null` mientras no ha nacido), `montarSobreCompanero: true` (no hay compañeros: `bandoDe` emparejaría a los asientos 0 y 2) y `sobrefalloLibre: true`.
- **Cantes:** al cerrar una baza, si tiene el Rey y el Caballo de un palo (con 3 cartas solo cabe una pareja):
  - sin triunfo, ese palo pasa a ser triunfo y quien gana la baza suma 40. La baza en la que nace se ha jugado sin triunfo;
  - con triunfo, quien la gana suma 20 en ese palo. No puede ser el del triunfo, porque su Rey y su Caballo ya cayeron juntos.
- **Tantos:** cartas, cantes y 10 de últimas, por jugador.
- **Penalización (`penalizadosGanaPierde`):**
  - sin empates, el del medio;
  - con empates, los que no tienen el mínimo. Es la regla de los dos casos del libro: con 15, 15 y 100 pierde el de 100; con 10, 60 y 60, los dos de 60;
  - si los tres empatan, nadie: el libro no lo dice y nadie se queda «en medio».
- **Fin:** al acabar la mano en que alguien llega al límite. Ganan los que tienen menos penalizaciones; `puntos` es la penalización en negativo, como en el Burro de bazas.
- **Vista:**
  - el `triunfo` (`null` sin triunfo) y los `cantes`;
  - los `tantos` de cada uno en la mano, que todos han visto ganar;
  - las bazas jugadas en la mano, cada una con el triunfo que regía al jugarla;
  - las penalizaciones y los resultados de las manos.

### 2. IAs
- **Normal (`ia/tute-gana-pierde-basica.ts`):**
  - **Objetivo:** antes de cada jugada elige ir a por el máximo si ya tiene más tantos que cada uno de los otros con ventaja (o si su mano promete muchos tantos al principio: Ases y Treses en palos largos), y a por el mínimo en los demás casos, que es lo que el libro llama decidir «si vamos a intentar ganar o a intentar perder» y cambiar sobre la marcha.
  - **A por el mínimo:**
    - si puede no ganar la baza, echa la carta que más vale entre las que no la ganan, y nunca completa una pareja de Rey y Caballo en una baza que se va a llevar;
    - si tiene que ganarla, la gana con la que menos vale;
    - al salir, la carta más baja de su palo más corto, y nunca un Rey: «alguien se encargará de endosarnos un Caballo».
  - **A por el máximo:** sale con sus cartas altas de palo largo y gana las bazas con puntos; si no puede ganar, echa la que menos vale.
- **Difícil (`ia/reconstruir/tute-gana-pierde.ts`):**
  - **Reconstrucción:** las manos ajenas al azar entre las cartas que no se ven, con `repartirConPermitidos` y un tope de fuerza por palo para cada jugador, deducido de lo que jugó. La deducción de la Manilla pasa a ser común (`topesPorObligaciones`) con dos parámetros: el triunfo que regía en cada baza y quién es rival de quién (en el gana-pierde, todos lo son siempre).
  - **Valoración:** −10 si la mano acaba con penalización propia y, además, la distancia relativa a quedar en medio, para distinguir manos sin penalización; más `bonoPartida`.
- **Mediciones** (partidas a 3 penalizaciones, la IA medida en un asiento contra las otras dos):

  | Duelo | Penalizaciones de la IA | Por cada rival | Partidas ganadas |
  |---|---|---|---|
  | Azar contra el azar | 322 | 334 | 94 de 200 |
  | Normal contra el azar | 262 | 366 | 123 de 200 |
  | Difícil contra la normal | 53 | 116 | 45 de 60, con 84 ms como máximo por decisión |

  Con otros umbrales de mano fuerte y otras reglas para cambiar de objetivo, la normal no mejora: la diferencia la da la simulación de la difícil.

### 3. Cliente
- **`MesaTuteGanaPierde.svelte`:**
  - sobre `MesaBazas`, para 3, con los rivales numerados como en el Burro de bazas;
  - la mano ordenada por palos y por fuerza;
  - junto a cada jugador, sus tantos y sus penalizaciones;
  - en la barra, el triunfo («Sin triunfo» mientras no nace), el número de la mano y tus penalizaciones;
  - un aviso cuando alguien canta, con quién y cuánto.
- **`ResumenTuteGanaPierde.svelte`:** una tabla con los tantos (cartas, cantes y últimas) y las penalizaciones de cada uno, y una frase con quién se lleva la penalización.
- **Fin:** la clasificación por penalizaciones y el resumen de la última mano.
- **Menú:** familia «Bazas para evitar», con 5 juegos.
- **Guía:**
  - ejemplos comprobados con el motor:
    - una baza en la que nace el triunfo con las cuarenta;
    - la tabla de quién se lleva la penalización, con los tres ejemplos del libro;
  - los consejos de Núñez;
  - la historia, como variante del Tute.

## Risks / Trade-offs

- **Topes comunes** → la Manilla deduce exactamente lo mismo: sus pruebas de reconstrucción pasan sin cambios.
- **Empate a tres** → el libro no lo trata; sin penalización es lo más fiel a «nunca quedarse en medio».
- **Límite de 3** → no está en el libro, pero no cambia ninguna regla.
