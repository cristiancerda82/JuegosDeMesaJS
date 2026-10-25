## Why

El Sevens (también llamado Fan Tan o dominó de cartas) es el primo francés del Cinquillo: se juega con la baraja de 52 cartas y las escaleras de cada palo salen de los sietes. Es rápido, fácil de aprender y de 3 a 6 jugadores, así que da a la suite un juego familiar con baraja francesa para muchos jugadores. Reutiliza casi entero el Cinquillo: las escaleras por palo, jugar obligatorio, la penalización por cartas y su IA.

## What Changes

- Nuevo juego **Sevens**, jugable contra la IA y en red, de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta, con la baraja francesa de 52 cartas:
  - **Reparto:** se reparte toda la baraja, una a una, empezando por el de la izquierda del repartidor; con 5 o 6 jugadores, algunos tienen una carta más.
  - **Salida:** abre la mano quien tiene el 7 de diamantes, y tiene que jugarlo.
  - **Escaleras:** cada palo forma en la mesa una escalera que empieza por su 7. Se puede poner un 7 de un palo que aún no está, o alargar una escalera con la carta siguiente por arriba (8, 9… hasta la K) o por abajo (6, 5… hasta el As).
  - **Jugar es obligatorio:** quien puede jugar tiene que hacerlo; si no puede, pasa.
  - **Fin de la mano:** termina cuando alguien se queda sin cartas. Los demás suman 1 punto por cada carta que les queda.
  - **Partida:** se juegan manos hasta que alguien llega a 50 puntos; gana quien menos tiene. El repartidor rota cada mano.
- **IA del Sevens en los tres niveles:**
  - la normal juega como la del Cinquillo: prefiere las cartas que le acercan otras suyas y abren menos camino a los rivales;
  - la fácil se equivoca a veces;
  - la difícil simula, como en el Cinquillo, la carta que juega con las manos ocultas repartidas al azar.
- El servidor de salas admite el Sevens como un juego más en red, de 3 a 6 asientos.
- **Cliente:**
  - el Sevens en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa con las cuatro escaleras, los rivales y su número de cartas, y la mano propia con las cartas jugables;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - pagar fichas al pasar (el Fan Tan con bote);
  - 2 o 7 jugadores;
  - otros límites de puntos.

## Capabilities

### New Capabilities
- `juego-sevens`: reglas del Sevens:
  - reparto y salida;
  - escaleras por palo;
  - jugar es obligatorio;
  - fin de la mano y puntos;
  - partida a 50;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Sevens.
- `niveles-ia`: el Sevens entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Sevens con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/sevens.ts`, `ia/sevens-basica.ts` y `ia/reconstruir/sevens.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaSevens.svelte` y `ResumenSevens.svelte`, a partir de las del Cinquillo;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - pasar sin más;
  - varias manos con puntos hasta 50;
  - de 3 a 6 jugadores.
