## Why

El Big Two (*Dai Di*) es el gran juego de mudarse cartas del sudeste asiático. Se parece al Culo, que ya está en la suite, pero además de sueltas, parejas y tríos se sueltan jugadas de póker de 5 cartas, y el 2 es la carta más alta. Reutiliza la baraja francesa, la selección de varias cartas del Culo y las clasificaciones por puntos del Sevens.

## What Changes

- Nuevo juego **Big Two** clásico, jugable contra la IA y en red: 4 jugadores, cada uno por su cuenta, con la baraja francesa entera (13 cartas cada uno).
  - **Orden:** de menor a mayor, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A y 2. A igual número desempata el palo: ♦ < ♣ < ♥ < ♠.
  - **Jugadas:** suelta, pareja, trío y las de 5 cartas. De menor a mayor, las de 5 son:
    - escalera (5 números seguidos, sin dar la vuelta del 2 al 3);
    - color (5 del mismo palo);
    - full;
    - póker con una carta suelta;
    - escalera de color.
  - **Salida:** empieza cada mano quien tiene el 3♦, y su primera jugada tiene que llevarlo.
  - **Ronda:** cada jugador, por turno, supera la última jugada con otra del mismo número de cartas o pasa. Pasar no impide jugar más tarde en la ronda. Cuando los otros tres pasan seguidos, quien hizo la última jugada sale con lo que quiera.
  - **Fin de la mano:** cuando alguien se queda sin cartas, los demás suman tantos puntos como cartas les quedan; con 10 o más, el doble, y con 13, el triple.
  - **Partida:** cuando alguien llega a 50 puntos, gana quien menos tiene.
- **IA del Big Two en los tres niveles:**
  - la normal sale con su jugada más baja, prefiriendo deshacerse de varias cartas a la vez; supera con lo justo sin romper parejas ni jugadas de 5; guarda los 2 hasta que algún rival tiene pocas cartas;
  - la fácil se equivoca a veces;
  - la difícil simula, entre unas pocas jugadas candidatas, con las manos ajenas repartidas al azar.
- El servidor de salas admite el Big Two como un juego más en red.
- **Cliente:**
  - el Big Two en el menú;
  - una mesa con los rivales, la última jugada en la mesa y la mano propia;
  - seleccionar varias cartas y los botones «Jugar» y «Paso»;
  - el resumen de cada mano, la pantalla de fin y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - menos de 4 jugadores;
  - las bombas (póker y escalera de color que ganan a cualquier jugada);
  - las escaleras que dan la vuelta;
  - que pasar impida volver a jugar en la ronda.

## Capabilities

### New Capabilities
- `juego-big-two`: reglas del Big Two:
  - reparto y orden de las cartas;
  - jugadas y cómo se comparan;
  - salida con el 3♦;
  - rondas y pasar;
  - puntos de la mano;
  - partida a 50;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Big Two.
- `niveles-ia`: el Big Two entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Big Two con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/big-two.ts`, `ia/big-two-basica.ts` y `ia/reconstruir/big-two.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBigTwo.svelte` y `ResumenBigTwo.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - jugadas clásicas (con las de 5 cartas, sin bombas);
  - 4 jugadores;
  - varias manos con puntos, a 50.
