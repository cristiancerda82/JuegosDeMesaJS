## Why

Los libros, Núñez Elvira sobre todo, llaman Burro a otro juego, distinto del de juntar cuatro iguales que ya tiene la suite. La guía del Burro solo lo menciona con una línea «En otros sitios…», y es lo último que quedaba de la lista de variantes de los libros.

Es un juego de bazas sin triunfo para 4 a 8 jugadores (de 3 a 6 en la suite), muy extendido por varias regiones españolas y muy sencillo:
- hay que seguir el palo y, si no se tiene, robar del mazo hasta tenerlo;
- pierde el último que se queda con cartas.

La suite ya tiene casi todo lo que necesita:
- la baraja española de 48 cartas;
- las bazas sin triunfo del Polignac;
- la mesa de bazas para 3 a 6 jugadores, con el mazo a la vista.

## What Changes

- Nuevo juego **Burro de bazas** para 3 a 6 jugadores, jugable contra la IA y en red.
  - **Baraja:** la española de 48 cartas, con el orden Rey, Caballo, Sota, 9… 2 y As (el As es la más baja).
  - **Reparto:** 4 cartas a cada uno, y el resto queda boca abajo en el mazo. El que reparte pasa al siguiente en cada mano.
  - **Bazas:** sale el siguiente al que reparte, y después quien gana la baza. Hay que seguir el palo, sin obligación de montar. Sin el palo, se roba del mazo hasta sacar una carta de ese palo y se echa; sin mazo, se pasa. Gana la carta más alta del palo de salida.
  - **Fin de la mano:** quien se queda sin cartas deja de jugar; el último que se queda con cartas es el burro y suma una penalización. Si los últimos se quedan sin cartas en la misma baza, no hay burro.
  - **Partida:** termina cuando alguien llega al límite (3 o 5 penalizaciones; 3 por defecto). Ganan los que tienen menos.
- **IA del Burro de bazas en los tres niveles:**
  - **Normal:** sale por el palo que menos tienen los rivales (sobre todo si alguno se sabe que no lo tiene), con la punta si la tiene, y sin quedarse sin un palo del que quedan cartas. Al seguir, gana con la punta o, si es el último, con la carta justa; si no, echa la más baja.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada carta unas jugadas por delante.
- El servidor de salas admite el Burro de bazas como un juego más en red.
- **Cliente:**
  - el Burro de bazas en el menú (familia «Descarte», junto al otro Burro), con sus opciones: jugadores y límite;
  - una mesa de bazas con:
    - el mazo;
    - los botones «Robar» y «Pasar»;
    - quién roba, pasa o se queda sin cartas;
    - las penalizaciones;
  - el resumen de cada mano, el fin de partida, la guía «¿Cómo se juega?» con sus ejemplos e historia, y el consejo del modo asistido;
  - la guía del Burro cambia su línea «En otros sitios…»: el otro Burro ya está en el menú.
- **Fuera de alcance:**
  - 2, 7 u 8 jugadores;
  - el «Burro gana-pierde», en el que pierde quien se queda antes sin cartas.

## Capabilities

### New Capabilities
- `juego-burro-bazas`: reglas del Burro de bazas:
  - baraja, orden y reparto;
  - bazas, robar y pasar;
  - fin de la mano y penalizaciones;
  - fin por límite;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Burro de bazas.
- `niveles-ia`: el Burro de bazas entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas (las manos ajenas y el mazo, sin los palos que se sabe que no tienen) y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Burro de bazas con su mesa y su fin de partida; la guía del Burro remite a él.
- `menu-juegos`: el Burro de bazas entra en la familia «Descarte».

## Impact

- `packages/engine`:
  - nuevos `juegos/burro-bazas.ts`, `ia/burro-bazas-basica.ts` e `ia/reconstruir/burro-bazas.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBurroBazas.svelte` y `ResumenBurroBazas.svelte`;
  - cambian:
    - el registro de juegos y las opciones;
    - el catálogo del menú y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas son las de Núñez Elvira. Decisiones de la suite:
  - de 3 a 6 jugadores, como el resto de mesas de bazas;
  - el límite de 3 o 5 penalizaciones;
  - robar de una vez hasta sacar el palo, y echar esa carta.
