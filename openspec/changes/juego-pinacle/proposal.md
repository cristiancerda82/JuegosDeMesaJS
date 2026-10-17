## Why

El Pinacle (o Pináculo) es el gran rummy de las mesas españolas: dos barajas con comodines, robar del mazo o llevarse el montón de descartes, y bajar escaleras y grupos buscando las combinaciones con premio. La suite tiene un rummy corto, el Chinchón, pero no uno largo de puntos acumulados y por parejas, que es como más se juega el Pinacle.

## What Changes

- Nuevo juego **Pinacle**, para 2 jugadores o 4 por parejas (los compañeros, enfrente), jugable de principio a fin contra la IA:
  - **Cartas:** dos barajas francesas con 4 comodines (108 cartas). Los comodines y los doses son comodines. Valores: comodín 30, dos 20, As 15, del 8 al K 10, del 3 al 7 5.
  - **Reparto:** 11 cartas a cada jugador y una boca arriba que empieza el montón de descartes.
  - **Turno:** robar del mazo o llevarse **todo** el montón de descartes, bajar combinaciones y descartar una carta. Quien se lleva el montón MUST bajar su carta de arriba en ese turno.
  - **Combinaciones:**
    - grupos de 3 o más cartas del mismo número;
    - escaleras de 3 o más cartas seguidas del mismo palo, del 3 al As;
    - cada combinación lleva al menos 2 cartas naturales, y se pueden añadir cartas a las propias (o a las de la pareja);
    - se puede cambiar un comodín de la mesa por la carta natural que representa.
  - **Barbelé:** quien empieza la mano con 750 puntos o más tiene que abrir con al menos 70 puntos. Si no llega, las combinaciones vuelven a su mano y pierde 50.
  - **Fin de la mano:** cuando alguien se queda sin cartas (cierra) o se acaba el mazo.
  - **Puntuación de la mano:**
    - cada uno suma sus combinaciones (por cartas, o por su premio fijo si son especiales);
    - más los premios: 20 por cerrar, el doble al cerrar sin comodín, el doble o el cuádruple al bajar las 11 de golpe, y premios por cambiar comodines;
    - menos lo que le queda en la mano.
  - **Combinaciones con premio** (todas las clásicas):
    - Pinacle: 11 cartas iguales, 3000 de golpe y 1500 poco a poco;
    - escalera completa del 3 al As: 1000 limpia, 800 o 750 con uno o dos comodines del palo, 550 sucia;
    - 8, 7 y 6 Ases o figuras naturales, y 6 con un comodín;
    - 8 cartas naturales iguales de cualquier otro número.
  - **Partida:** termina al acabar la mano en la que alguien llega a 1500; gana quien más tiene.
- IA en los tres niveles:
  - **Normal:** una IA básica que baja lo que puede, decide cuándo llevarse el montón y no descarta lo que sirve al rival.
  - **Fácil:** la normal con errores.
  - **Difícil:** simula el robo y el descarte.
- El cliente suma el Pinacle al menú, con su opción de jugadores, y una mesa propia:
  - la mano ordenable, que puede crecer mucho al llevarse el montón;
  - las combinaciones de cada bando en la mesa;
  - el montón de descartes, que se puede ver entero;
  - elegir cartas y bajarlas o añadirlas a una combinación;
  - el resumen de cada mano con su desglose de puntos;
  - su guía «¿Cómo se juega?».
- Fuera de alcance:
  - 3 jugadores, o 4 cada uno por su cuenta;
  - el premio por cortar exacto;
  - el «¡Pumba!» al quedarse con una carta;
  - un objetivo distinto de 1500;
  - el modo en red.

## Capabilities

### New Capabilities
- `juego-pinacle`: reglas del Pinacle:
  - la baraja doble con comodines, el reparto y el turno (robar o llevarse el montón, bajar, descartar);
  - las combinaciones, añadir a las de la pareja y cambiar comodines;
  - el barbelé, el cierre, el fin de la mano y la puntuación con todos los premios clásicos;
  - el fin de la partida a 1500.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Pinacle.
- `niveles-ia`: el Pinacle se suma a los juegos con tres niveles; su difícil simula solo las decisiones de robar y de descartar.
- `mesa-cliente`: el menú incluye el Pinacle, con su mesa, su resumen de mano y su guía.

## Impact

- **`packages/engine`:**
  - Nuevos `juegos/pinacle.ts` (con un módulo de combinaciones y puntuación) e `ia/pinacle-basica.ts`, con sus tests y la suite genérica del contrato.
  - La reconstrucción para el difícil y su lugar en `IAS`.
  - Las cartas llevan número de copia, como en el Spider, porque hay dos de cada.
- **`packages/client`:** nueva `MesaPinacle.svelte`; cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E. La carta del comodín ya se dibuja.
- Sin dependencias nuevas.
- Las reglas son las del Pinacle clásico y las valida el usuario. Son interpretación nuestra en lo que las fuentes no precisan:
  - cómo se colocan los comodines;
  - el cambio de comodín en los grupos;
  - qué premio vale cuando un grupo cumple varios;
  - el barbelé por bando en la partida de parejas;
  - qué cuenta como cerrar sin comodín y cerrar de golpe.
