## Why

El Tysiącha (el «Mil») es el gran juego de bazas para tres de Rusia, Polonia y Ucrania. Con solo 24 cartas, combina:
- una subasta con un prikup (talón) de 3 cartas que se enseña;
- matrimonios que valen hasta 100 puntos y cambian el triunfo a mitad de mano;
- una partida larga a 1000 con el «barril» a 880.

Ningún juego de la suite tiene un triunfo que nace y cambia con los cantes. Además, es el único para tres en el que el declarante reparte cartas a los rivales.

Se reaprovechan:
- el modelo del Préférence: tres jugadores, subasta y viuda que se enseña;
- los cantes del Schnapsen;
- la mesa de bazas compartida.

## What Changes

- Nuevo juego **Tysiącha** para 3 jugadores, jugable contra la IA y en red.
  - **Baraja:** 24 cartas francesas (9, 10, J, Q, K y As de cada palo). El orden y los puntos son As 11, 10 10, K 4, Q 3, J 2 y 9 0, con 120 puntos en total.
  - **Reparto:** 7 cartas a cada uno y 3 al prikup. El que reparte cambia en cada mano.
  - **Subasta:**
    - el que sigue al que reparte abre obligatoriamente con 100;
    - después, por turno, cada uno sube de 5 en 5 o pasa, y quien pasa ya no vuelve a pujar;
    - para pujar más de 120 hay que tener un matrimonio en la mano;
    - la subasta acaba cuando los otros dos han pasado.
  - **Prikup:**
    - el ganador de la subasta (el declarante) enseña el prikup y se lo queda;
    - da una carta boca abajo a cada rival, y así todos tienen 8;
    - puede subir el contrato, sin pasar de 120 más lo que suman los matrimonios que tiene en la mano.
  - **Bazas:**
    - sale el declarante;
    - hay que seguir el palo; sin el palo, hay que echar triunfo si hay triunfo y se tiene;
    - no hay obligación de ganar la baza;
    - al empezar no hay triunfo.
  - **Matrimonios:**
    - al salir con el K o la Q de un palo teniendo la pareja, y habiendo ganado alguna baza en la mano, se canta el matrimonio;
    - vale 100 en corazones, 80 en diamantes, 60 en tréboles y 40 en picas;
    - su palo pasa a ser el triunfo, hasta el siguiente matrimonio;
    - se canta siempre que se puede.
  - **Puntos de la mano:**
    - si el declarante suma con cartas y matrimonios al menos el contrato, gana el contrato; si no, lo pierde;
    - cada rival suma sus puntos de cartas y matrimonios redondeados a 5.
  - **Barril:**
    - quien llega a 880 se queda en 880 y sube al barril;
    - en el barril solo suma ganando un contrato como declarante;
    - si en 3 manos no llega a 1000, baja a 760.
  - **Partida:** gana el declarante que cumple el contrato y llega a 1000.
- **IA del Tysiącha en los tres niveles:**
  - **Normal:**
    - puja según los Ases, los dieces guardados y los matrimonios de su mano;
    - da a los rivales sus cartas más flojas;
    - sube el contrato si la mano lo permite;
    - juega las bazas con reglas sencillas y canta sus matrimonios cuanto antes.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** puja, da y fija el contrato como la normal, y simula cada carta hasta el final de la mano.
- El servidor de salas admite el Tysiącha como un juego más en red.
- **Cliente:**
  - el Tysiącha en el menú;
  - una mesa de bazas para 3 con:
    - la subasta (pujar o pasar);
    - el prikup enseñado;
    - dar las cartas y fijar el contrato;
    - el triunfo actual y los matrimonios cantados;
    - las bazas y el marcador con el barril;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el «bolt» (tres manos a cero);
  - los cuatro Ases y la «rospis» (rendirse sin jugar);
  - el matrimonio de Ases;
  - las variantes para 2 y para 4;
  - redondear o anunciar de otras formas.

## Capabilities

### New Capabilities
- `juego-tysiacha`: reglas del Tysiącha:
  - baraja, orden y puntos;
  - reparto;
  - subasta con apertura obligada y el límite de 120 sin matrimonio;
  - prikup, dar cartas y subir el contrato;
  - bazas con la obligación de seguir y de triunfar;
  - matrimonios y cambio de triunfo;
  - puntos de la mano y barril;
  - partida a 1000;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Tysiącha.
- `niveles-ia`: el Tysiącha entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Tysiącha con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/tysiacha.ts`, `ia/tysiacha-basica.ts` e `ia/reconstruir/tysiacha.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTysiacha.svelte` y `ResumenTysiacha.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 3 jugadores;
  - las clásicas: subasta desde 100 de 5 en 5, más de 120 solo con matrimonio, quien no cumple resta lo apostado, barril a 880 y partida a 1000.
