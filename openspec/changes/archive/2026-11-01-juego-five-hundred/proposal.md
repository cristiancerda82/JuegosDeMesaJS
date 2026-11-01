## Why

El Five Hundred es el juego de cartas nacional de Australia y un clásico en Estados Unidos: cuatro en parejas, una subasta de contratos con la tabla de Avondale, una viuda de tres cartas y un comodín que es el triunfo más alto. Junta la subasta del Bridge con los «bowers» del Euchre, y añade a la suite un juego de subasta por parejas más ágil que el Bridge.

## What Changes

- Nuevo juego **Five Hundred** para 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** 43 cartas: del 5 al As de cada palo, los cuatros rojos y un comodín. 10 cartas a cada uno y 3 a la viuda.
  - **Subasta:**
    - por turnos desde el siguiente al repartidor, cada uno puja más alto o pasa, y quien pasa no vuelve a pujar;
    - las pujas son de 6 a 10 bazas en picas, tréboles, diamantes, corazones o sin triunfo, con los valores de la tabla de Avondale (6 picas 40 … 10 sin triunfo 520);
    - el misère (250) y el misère abierto (500) son contratos de no ganar ninguna baza;
    - acaba cuando pasan tres tras una puja; si pasan los cuatro, se reparte otra vez.
  - **Viuda:** quien gana la subasta se queda las 3 cartas de la viuda y se descarta de 3.
  - **Triunfo:**
    - el comodín es el triunfo más alto, seguido de la Jota del triunfo y de la otra Jota del mismo color, que cuenta como triunfo;
    - sin triunfo y en el misère, el comodín solo gana bazas: se juega cuando no se puede seguir el palo y, si sale, quien sale nombra el palo.
  - **Bazas:** hay que seguir el palo; sale quien ganó la subasta. En el misère su compañero no juega.
  - **Puntos:**
    - quien juega el contrato y lo cumple suma su valor, o resta su valor si no lo cumple;
    - con las 10 bazas en un contrato que vale menos de 250, suma 250;
    - en los contratos de bazas, los rivales suman 10 por cada baza que ganan.
  - **Partida:**
    - gana la pareja que llega a 500 cumpliendo su contrato;
    - los rivales no pasan de 490 con sus bazas;
    - la pareja que baja a −500 pierde.
- **IA del Five Hundred en los tres niveles:**
  - **Normal:** puja según las bazas que estima con su mano; se descarta de las cartas que menos valen; gana con lo justo las bazas o juega la más baja; en el misère suelta sus cartas más altas que no ganan.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** se descarta como la normal; en la subasta compara unas pocas pujas y en las bazas cada carta, simulando hasta el final de la mano con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Five Hundred como un juego más en red.
- **Cliente:**
  - el Five Hundred en el menú;
  - una mesa de bazas para cuatro con la subasta, el descarte de la viuda, la elección del palo al salir con el comodín, las cartas del misère abierto, el contrato y los puntos;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:** las variantes para 3, 5 o 6 jugadores y otras tablas de puntos.

## Capabilities

### New Capabilities
- `juego-five-hundred`: reglas del Five Hundred:
  - baraja y reparto;
  - subasta con la tabla de Avondale y el misère;
  - viuda y descarte;
  - triunfos con el comodín y las Jotas;
  - bazas;
  - puntos de la mano;
  - partida a 500 y −500;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Five Hundred.
- `niveles-ia`: el Five Hundred entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Five Hundred con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/five-hundred.ts`, `ia/five-hundred-basica.ts` e `ia/reconstruir/five-hundred.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaFiveHundred.svelte` y `ResumenFiveHundred.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la subasta hasta que pasan tres;
  - el misère y el misère abierto;
  - la partida a 500 o −500.
