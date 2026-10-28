## Why

El Bridge es el gran juego de bazas por parejas y el siguiente paso natural tras el Whist: añade una subasta de contratos, el muerto a la vista y una puntuación que premia las mangas y los slams. Es el juego de cartas de competición más conocido y le faltaba a la suite.

## What Changes

- Nuevo juego **Bridge** para 4 en dos parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja y reparto:** la francesa de 52; 13 cartas a cada uno. El repartidor rota cada mano.
  - **Subasta:**
    - empieza el repartidor y sigue hacia la izquierda;
    - cada jugador puja un contrato (de 1 a 7 en tréboles, diamantes, corazones, picas o sin triunfo, siempre por encima del anterior), pasa, dobla la última puja del rival o redobla un doblo contra su pareja;
    - termina con tres pases seguidos tras una puja;
    - si los cuatro pasan, se reparte de nuevo con el mismo repartidor y la misma vulnerabilidad.
  - **Declarante y muerto:**
    - el declarante es el jugador de la pareja ganadora que nombró primero la denominación del contrato;
    - sale el jugador a su izquierda; después de esa primera carta, la mano del compañero del declarante (el *muerto*) queda boca arriba;
    - el declarante juega las cartas del muerto.
  - **Bazas:** hay que seguir el palo de salida; gana el triunfo más alto o la carta más alta del palo de salida. Sin triunfo, no hay triunfos.
  - **Puntuación por mano** (la de duplicado):
    - bazas del contrato, mangas, parciales, slams, sobrebazas, multas por bazas de menos y los dobles y redobles;
    - la vulnerabilidad de cada pareja.
  - **Chicago:** ciclos de 4 manos con la vulnerabilidad fija: nadie, la pareja del repartidor, la pareja del repartidor y todos. La partida dura 1, 2 o 3 ciclos (por defecto 1); gana la pareja con más puntos.
- **IA del Bridge en los tres niveles:**
  - la normal subasta con un sistema natural sencillo:
    - abre con 12 puntos de honores o más;
    - abre 1 sin triunfo con 15–17 y una mano equilibrada;
    - apoya a su pareja cuando tiene fallo, usa el Stayman básico y busca la manga cuando la pareja suma 25 puntos;
  - la normal juega las bazas con reglas de salida, de segunda y tercera mano y del declarante;
  - la fácil se equivoca a veces;
  - la difícil subasta como la normal y simula el carteo con las cartas ocultas repartidas al azar, respetando el muerto y los fallos.
- El servidor de salas admite el Bridge como un juego más en red.
- **Cliente:**
  - el Bridge en el menú;
  - una mesa de bazas para cuatro con el muerto boca arriba en su sitio;
  - una caja de subasta con el historial y una rejilla de pujas;
  - el contrato, el declarante, la vulnerabilidad y las bazas de cada pareja;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - la puntuación de rubber y la de duplicado con IMPs;
  - convenciones más allá del Stayman básico (Blackwood, transferencias…);
  - que el humano juegue siempre como declarante.

## Capabilities

### New Capabilities
- `juego-bridge`: reglas del Bridge:
  - reparto y subasta;
  - declarante, salida y muerto;
  - bazas;
  - puntuación de la mano;
  - Chicago y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Bridge.
- `niveles-ia`: el Bridge entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Bridge con su mesa, su subasta y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/bridge.ts`, `ia/bridge-basica.ts` y `ia/reconstruir/bridge.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBridge.svelte` y `ResumenBridge.svelte`;
  - cambian el registro de juegos, las opciones (los ciclos), los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - puntuación Chicago;
  - subasta natural sencilla para la IA;
  - el declarante juega el muerto;
  - si pasan los cuatro, se reparte de nuevo.
