## Context

Núñez Elvira describe un Burro distinto del que tiene la suite: de bazas, sin triunfo y con mazo. Quien no tiene el palo roba hasta tenerlo, y pierde el último que se queda con cartas. Lo demás (la baraja de 48, las bazas sin triunfo, la mesa para 3 a 6) ya existe en la suite.

## Goals / Non-Goals

**Goals:**
- El Burro de bazas de 3 a 6 jugadores, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El «Burro gana-pierde», 7 u 8 jugadores y las partidas de 40 cartas que el libro desaconseja.

## Decisions

### 1. Estado y acciones (`juegos/burro-bazas.ts`)
- **Config:** `{ jugadores: 3 | 4 | 5 | 6; limite: 3 | 5 }`; por defecto, 4 jugadores y 3 penalizaciones.
- **Estado:**
  - `manos`, `mazo` (se roba por el principio), `turno`, `salida` (quien sale en la baza en curso), `mesa`;
  - de la baza en curso: `pasaron` y `robadas` (cuántas robó cada uno); `ultimaBaza` guarda las dos cosas con las cartas y el ganador;
  - de la mano: `jugadasPor`, `bazas`, `sinPalo` y `salieron` (el orden en que se quedaron sin cartas);
  - de la partida: `penalizaciones` y `resultadosManos` (burro, orden, cartas del burro y penalizaciones tras la mano).
- **Acciones:** `jugar` una carta, `robar` y `pasar`. Las legales:
  - al salir, cualquier carta;
  - al responder, las del palo de salida;
  - sin ellas, `robar` si queda mazo y `pasar` si no.
- **Robar** saca cartas del mazo hasta la primera del palo de salida y la juega en la misma acción. Si el mazo se acaba antes, el jugador pasa. Así, robar es una sola decisión: no hay nada que elegir entre robar una carta y la siguiente, y la que se saca del palo es la única que puede echar.
- **Turno:** pasa al siguiente que tiene cartas. La baza termina al volver a quien salió. Después:
  - si quedan cartas a uno o a ninguno, la mano acaba;
  - si no, sale quien ganó o, si se quedó sin cartas, el siguiente que tiene.
- **Lo que se sabe de los palos (`sinPalo`):** quien roba o pasa no tiene el palo de salida, y tras robar sigue sin tenerlo, porque la carta del palo que saca la echa. Lo que se sabía de sus otros palos solo sigue valiendo si no robó ninguna carta más. Es información pública, que la reconstrucción necesita.
- **Resultado:**
  - ganan los que tienen menos penalizaciones (como en el resto de juegos de uno contra todos, el ganador es el mejor);
  - pierde quien llega al límite;
  - `puntos` son las penalizaciones en negativo.

### 2. IAs
- **Normal (`ia/burro-bazas-basica.ts`):** con las cartas sin ver (las que no están en su mano, en la mesa ni entre las jugadas de la mano):
  - **Al salir:** valora cada palo que puede jugar: 4 por cada rival que se sabe que no lo tiene, menos las cartas sin ver de ese palo, menos 3 si solo le queda una carta de él y hay otras sin ver. En el mejor palo, echa la punta si la tiene; si no, la más alta.
  - **Al seguir:** echa la punta que gana; si no, la más baja que gana cuando es el último; si no, la más baja.
  - **Sin el palo:** la única acción.
- **Difícil (`ia/reconstruir/burro-bazas.ts`):** `SIMULABLE_BURRO_BAZAS`.
  - **Reconstrucción:** reparte las cartas sin ver entre las manos ajenas y el mazo con `repartirConPermitidos`. El mazo es un hueco más que admite cualquier carta, y las manos no admiten los palos de `sinPalo`.
  - **Valoración:**
    - si la mano acaba: −10 al burro y, a los demás, menos su puesto al quedarse sin cartas entre los jugadores;
    - si no: −10 × sus cartas / las cartas de todas las manos;
    - más `bonoPartida`.
  - **Ajuste:** con robos, una mano puede durar muchas jugadas, y simularla entera hacía que el difícil tardara hasta 416 ms por decisión. Con un horizonte de 24 jugadas, 20 reconstrucciones y un presupuesto de 120, tarda como mucho 85 ms.
- **Mediciones** (4 jugadores, límite 3; «ganar» es estar entre los que tienen menos penalizaciones):

  | Partidas | Resultado | Esperado si fueran iguales |
  |---|---|---|
  | Normal contra tres al azar | 302 de 400 (75 %) | 174 de 400 (43 %) |
  | Normal contra tres fáciles | 170 de 300 | — |
  | Difícil contra tres normales | 101 de 200 (50 %) | 169 de 400 (42 %) |

  En la prueba «contra el azar», el umbral es 125 de 200.

### 3. Cliente
- **`MesaBurroBazas.svelte`:** sobre `MesaBazas`, con el mazo y sin muestra.
  - **Mano:** ordenada por palos, del Rey al As.
  - **Junto a cada jugador:** reparte, sin cartas, «Robó N», «Pasa» y «Pen. N». Durante la pausa de la baza, el robo y el paso son los de esa baza.
  - **Sin el palo:** el aviso dice que no tiene el palo y el botón «Robar» o «Pasar» lleva `data-jugada`, para el modo asistido.
  - **Al quedarse sin cartas:** el aviso le dice al jugador que espere a que acabe la mano.
  - **Resumen:** al acabar cada mano, `ResumenBurroBazas.svelte` dice quién es el burro (y cuántas cartas le quedaban), el orden en que se quedaron sin cartas y las penalizaciones.
- **Pausas:** cada baza y el fin de la mano, como en el Polignac, y 900 ms cuando un rival roba o pasa, para que se vea.
- **Fin:**
  - juego sin parejas;
  - el título es «¡Eres el burro!» si el jugador llegó al límite, la victoria si tiene menos penalizaciones que nadie y «¡Te has librado!» si no;
  - debajo, el resumen de la última mano y las penalizaciones ordenadas.
- **Menú:** familia «Descarte», junto al otro Burro. Se juega para deshacerse de las cartas, no para ganar ni evitar bazas.
- **Guía:**
  - **Ejemplos:** una baza en la que gana el Rey y el As es la más baja, y un robo (`antesDespues`) hasta sacar el palo. Los dos se comprueban con el motor.
  - **Consejos de Núñez:** las puntas y salir por un palo que les falta a los demás.
  - **Historia:** prudente con el origen.
  - **Guía del Burro:** su línea «En otros sitios…» pasa a decir que el otro Burro está en el menú.
- **Modo asistido:**
  - el consejo del juego;
  - las razones de robar y pasar, porque las genéricas hablan de cambiar cartas o de no querer ir más allá.

## Risks / Trade-offs

- **Robar de una vez** → el jugador no ve las cartas salir de una en una, pero aparecen en su mano y la mesa dice cuántas robó. Robar carta a carta no le dejaría elegir nada, y alargaría la partida.
- **Partidas largas con muchos robos** → se acotan con el límite de 3 penalizaciones por defecto. La mano termina siempre: sin mazo, cada baza quita al menos una carta.
- **«Ganar» con varios empatados** → ganan todos los que tienen menos penalizaciones. Es lo que se mide en las pruebas de niveles.
