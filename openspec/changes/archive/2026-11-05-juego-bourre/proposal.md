## Why

El Bourré es el juego de bazas y apuestas de Luisiana (de origen francés):
- se juega con manos de 5 cartas;
- cada jugador decide si entra en la mano;
- quien hace más bazas se lleva el bote;
- quien entra y no hace ninguna baza («bourré») paga al bote tanto como había.

Es rápido, tenso y muy distinto a los demás juegos de bazas de la suite, porque añade la decisión de entrar o no y el bote que crece. Se reaprovechan:
- las fichas del Hold'em y el Blackjack;
- la mesa de bazas compartida, como la del Sheepshead para 5.

## What Changes

- Nuevo juego **Bourré** para 5 jugadores, jugable contra la IA y en red.
  - **Baraja:** la francesa de 52, con el orden As, K, Q, J, 10…2.
  - **Fichas:** cada jugador empieza con 100. Al empezar cada mano, cada jugador con fichas pone 1 en el bote.
  - **Reparto:** 5 cartas a cada jugador con fichas. La última carta del que reparte se enseña y su palo es el triunfo. Esa carta es suya, y no puede descartarla.
  - **Entrar o pasar:** desde el siguiente al que reparte, cada uno decide si juega la mano o pasa; quien pasa deja sus cartas.
  - **Cambio:** por turno, cada jugador que juega puede descartarse de 0 a 5 cartas y robar otras tantas del mazo.
  - **Bazas:**
    - **Salida:** sale el primero que juega después del que reparte; quien sale con el As de triunfo en la mano MUST salir con él.
    - **Palo:** hay que seguir el palo y ganar la baza si se puede.
    - **Sin el palo:** hay que echar triunfo, y superar el triunfo más alto si se puede.
  - **Bote:**
    - quien hace más bazas se lo lleva;
    - si hay empate, se queda para la mano siguiente;
    - cada jugador que jugó y no hizo ninguna baza paga al bote tanto como había (o todas sus fichas, si tiene menos);
    - si solo juega uno, se lleva el bote sin jugar;
    - si no juega nadie, el bote se queda.
  - **Partida:** termina tras 15 manos o cuando solo queda un jugador con fichas. Gana quien tiene más fichas.
- **IA del Bourré en los tres niveles:**
  - **Normal:**
    - juega si espera al menos 1,5 bazas o tiene 2 triunfos;
    - se descarta de lo que no es triunfo ni As ni K;
    - juega las bazas con la carta más baja que gana.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** cambia como la normal, y simula la decisión de jugar o pasar y cada carta hasta el final de la mano.
- El servidor de salas admite el Bourré como un juego más en red.
- **Cliente:**
  - el Bourré en el menú;
  - una mesa de bazas para 5 con:
    - los botones de jugar o pasar;
    - el cambio de cartas;
    - la carta vuelta y el triunfo;
    - el bote, las fichas y las bazas de cada uno;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - otros números de jugadores;
  - apostar más de la entrada;
  - la obligación de jugar con el As de triunfo o con el bote grande.

## Capabilities

### New Capabilities
- `juego-bourre`: reglas del Bourré:
  - baraja, fichas y entrada;
  - reparto y triunfo;
  - jugar o pasar;
  - cambio;
  - bazas con sus obligaciones;
  - bote y bourré;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Bourré.
- `niveles-ia`: el Bourré entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Bourré con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/bourre.ts`, `ia/bourre-basica.ts` e `ia/reconstruir/bourre.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBourre.svelte` y `ResumenBourre.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 5 jugadores;
  - 100 fichas, entrada de 1 y partida a 15 manos o hasta que quede uno.
