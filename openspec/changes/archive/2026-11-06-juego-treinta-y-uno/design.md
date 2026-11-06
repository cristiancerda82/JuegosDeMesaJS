## Context

El Treinta y uno es un juego de robar y descartar con muy pocas cartas, como el Gin Rummy pero con 3 cartas por jugador y con vidas en lugar de puntos. Lo propio es:
- el valor de la mano (la suma de un palo, o 30,5 con tres iguales);
- plantarse, que da un último turno a los demás;
- las vidas y la eliminación, de 2 a 6 jugadores.

Se reaprovechan:
- el robo del mazo o del descarte del Gin Rummy;
- `AsientoRival` y `lado` de la mesa de bazas para colocar de 2 a 6 jugadores;
- `bonoPartida` y la reconstrucción con cartas fijas en una mano.

## Goals / Non-Goals

**Goals:**
- Treinta y uno de 2 a 6 con 3 vidas y tres iguales a 30,5, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Ganar al momento con 31, perder doble al plantarse y la baraja española.

## Decisions

### 1. Valor de la mano (`juegos/treinta-y-uno.ts`)
- **`puntosCartaTreinta(c)`:** As 11, figuras 10, el resto su número.
- **`valorManoTreinta(mano)`:** si las 3 son del mismo número, 30,5; si no, la mayor suma de un palo.

### 2. Fases y acciones
- **Fases:** `'robar' | 'descartar'`.
- **Acciones:**
  - `robar { desde: 'mazo' | 'descarte' }` y `plantarse` (en `robar`);
  - `descartar { carta }` (en `descartar`), que no admite la carta recién cogida del descarte (`cogida`).
- **Mazo vacío:** al robar del mazo sin cartas, el descarte salvo la de arriba se baraja (con el azar del estado) y forma el mazo.
- **Plantarse:** `plantado` guarda quién se plantó, y `ultimos` cuántos turnos quedan (los demás jugadores con vidas). Tras cada turno completo (al descartar), si hay alguien plantado se resta uno; con 0 se enseñan las manos.
- **Vueltas:** `turnos` cuenta los turnos de la ronda. Con `8 × jugadores con vidas` turnos sin que nadie se plante, se enseñan las manos como si se hubiera plantado quien empezó.
- **Cartas conocidas:** `conocidas` por asiento, las que cogió del descarte y aún tiene; se quitan al descartarlas.

### 3. Rondas y vidas
- **Al enseñar:** pierde una vida cada jugador con vidas cuyo valor es el menor.
- **`ResultadoRondaTreinta`:** `plantado` (o `null` si se acabaron las vueltas), `manos` (las de cada jugador con vidas, enseñadas), `valores`, `pierden`, `vidasTras`.
- **Siguiente ronda:** empieza el siguiente jugador con vidas tras quien empezó.
- **Fin:** con uno o ningún jugador con vidas. Si no queda ninguno, ganan los que perdieron la última vida en esa ronda. `Fin.puntos` son las vidas.
- **Config:** `{ jugadores: 2…6; vidas: number }`, con 4 y 3 por defecto; las pruebas usan menos vidas.

### 4. Estado y vista
- **Estado:**
  - `manos`, `mazo`, `descarte` (el último es el de arriba), `conocidas`;
  - `fase`, `turno`, `empieza`, `cogida`, `plantado`, `ultimos`, `turnos`;
  - `vidas`, `resultadosRondas`, `azar`.
- **Vista:**
  - la mano propia y su valor;
  - cuántas tiene cada uno, las conocidas;
  - el descarte, que es público porque cada carta se ha visto al descartarla, y cuántas quedan en el mazo;
  - todo lo demás.

  Las manos de la ronda solo se ven en el resumen de la ronda.

### 5. IAs
- **Normal (`ia/treinta-y-uno-basica.ts`):**
  - `mejorDescarteTreinta(mano4)`: la carta cuyo descarte deja el mayor valor; si empatan, la de menos puntos.
  - **Robar:** del descarte si el valor tras el mejor descarte supera al actual en 4 o más.
  - **Plantarse:** con 27 o más.
- **Difícil (`ia/reconstruir/treinta-y-uno.ts`):** `SIMULABLE_TREINTA`.
  - **Reconstrucción:** las manos ajenas (con sus conocidas fijas) y el mazo al azar entre las cartas que no se ven.
  - **`decideLaBase`:** nunca; se simulan plantarse, de dónde robar y el descarte.
  - **Valoración:** −1 si pierde una vida en la ronda, más 0,01 por cada punto de su mano al enseñarla (para desempatar entre jugadas parecidas), más `bonoPartida`.
  - **Valores:** `reconstrucciones` 40 y `presupuesto` 400. La difícil gana 60 de 200 partidas contra tres normales (la parte justa son 50), con 103 ms como máximo. Con 60 y 600 no mejoraba (56 de 200): el juego tiene mucho azar y la normal ya juega cerca de lo razonable.

### 6. Cliente
- **`MesaTreintaYUno.svelte`:** con la rejilla de asientos de la mesa de bazas.
  - **Rivales:** `AsientoRival` para cada rival, con sus vidas, «Plantado» o «Fuera», y sus cartas conocidas en miniatura.
  - **Centro:** el mazo y el descarte, que se tocan para robar.
  - **Mano:** el valor de la mano, el botón «Plantarse» y, al descartar, la carta tocada va al descarte.
  - **Información:** la ronda, mis vidas y los últimos turnos que quedan.
- **`ResumenTreintaYUno.svelte`:** las manos enseñadas de cada uno, su valor y quién pierde una vida, con las vidas tras la ronda.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **Una ronda sin nadie que se plante no terminaría** → el máximo de 8 vueltas la cierra.
- **Con 6 jugadores el mazo puede acabarse** → se rebaraja el descarte.
- **El descarte entero es público** → coincide con lo que ve un jugador en la mesa; la IA lo usa igual que un humano atento.
