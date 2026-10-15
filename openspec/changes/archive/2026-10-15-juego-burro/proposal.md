## Why

El Burro es el juego de cartas con el que aprenden a jugar muchos niños en España: reglas que se explican en un minuto, partidas rápidas y risas. Su gracia es distinta a la de todo lo que ya hay en la suite: no se trata de bazas ni de combinaciones, sino de **reaccionar a tiempo**. Cuando alguien junta cuatro cartas iguales se planta en silencio y los demás tienen que darse cuenta y plantarse también; el último lleva una letra de B-U-R-R-O. Para hacerlo fiel, la mesa tiene que funcionar en tiempo real, con la IA reaccionando con retrasos de persona y no por turnos.

## What Changes

- Nuevo juego **Burro** con la baraja española, de 3 a 5 jugadores (4 por defecto), jugable de principio a fin contra la IA:
  - **Reparto:** en cada mano se eligen al azar tantos números como jugadores y se usan sus 4 cartas (una por palo). Cada jugador recibe 4.
  - **Pase:** todos eligen a la vez una carta de su mano y, cuando todos han elegido, cada uno la pasa al siguiente jugador. Se repite hasta que alguien se planta.
  - **Plantarse:** quien tiene 4 cartas del mismo número puede plantarse en lugar de elegir carta. Desde ese momento todos los demás tienen que plantarse; el **último** en hacerlo pierde la mano y suma una letra.
  - **Mano nula:** si en 50 intercambios nadie se planta, la mano se anula sin letras y se reparte de nuevo.
  - **Partida:** quien completa las 5 letras (B-U-R-R-O) es el burro y pierde; los demás ganan.
- **Partidas en tiempo real en el cliente:** la sesión gana un modo «simultáneo» para los juegos en los que varios jugadores pueden actuar a la vez. En ese modo el jugador nunca espera a la IA: cada IA actúa tras su propio retraso, que elige el cliente con azar propio (rápido para pasar, de reacción humana para plantarse), y gana quien llega antes.
- IA básica del Burro: guarda el número del que más cartas tiene, pasa una del que menos, y se planta en cuanto junta 4 iguales o alguien se ha plantado.
- El cliente suma el Burro al menú, con su opción de jugadores, y una mesa propia:
  - las manos de los rivales boca abajo, que se ven tumbadas en cuanto se plantan, sin otro aviso;
  - la mano propia, en la que se toca una carta para pasarla, y la carta recibida resaltada;
  - un botón «¡Me planto!» siempre visible y con el mismo aspecto, para que no delate a nadie;
  - las letras de cada jugador;
  - el resumen de cada mano (quién se plantó primero y con qué cuatro cartas, y quién lleva letra) en un panel que espera a «Siguiente mano»;
  - su guía «¿Cómo se juega?».
- Fuera de alcance:
  - las variantes con comodín o con cucharas;
  - plantarse de farol (sin tener 4 iguales) con penalización;
  - más de 5 jugadores;
  - el modo en red.

## Capabilities

### New Capabilities
- `juego-burro`: reglas del Burro: el reparto por números, el pase simultáneo, plantarse y reaccionar, la mano nula, las letras y el fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Burro.
- `mesa-cliente`: el menú incluye el Burro con su mesa, su resumen de mano y su guía; las partidas con acciones simultáneas no esperan a la IA y la IA reacciona con retrasos de persona.

## Impact

- **`packages/engine`:** nuevos `juegos/burro.ts` e `ia/burro-basica.ts`, con sus tests y la suite genérica del contrato. Es el primer juego en el que varios asientos tienen acciones legales a la vez; el contrato ya lo permite y no cambia.
- **`packages/client`:**
  - `Sesion` gana el modo simultáneo, activado por un campo opcional de `DefJuego`; el resto de juegos no cambia de comportamiento.
  - Nueva `MesaBurro.svelte`, con su disposición para 3, 4 y 5 jugadores.
  - Cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las partidas siguen guardándose y retomándose: se guarda el orden en que llegaron las acciones. Lo que deja de ser reproducible con la semilla es quién reacciona antes, porque depende de la velocidad del jugador.
- Las reglas son las del Burro clásico y las valida el usuario, en particular:
  - pasar al siguiente jugador;
  - que el primero que se planta tenga que tener 4 iguales;
  - la mano nula a los 50 intercambios, que es una salvaguarda nuestra.
