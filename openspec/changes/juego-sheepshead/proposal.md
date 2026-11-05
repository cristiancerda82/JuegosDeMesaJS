## Why

El Sheepshead es el gran juego de bazas del Medio Oeste de Estados Unidos (Wisconsin), heredero del Schafkopf. Se juega con 5 jugadores, y tiene dos rasgos que lo distinguen:
- un «picker» que coge el blind y juega con un compañero secreto, el que tiene la J de diamantes;
- el «leaster», que se juega si nadie coge: cada uno para sí, y gana quien hace menos puntos.

Es el primer juego de bazas de la suite para 5 con bandos que se descubren a mitad de mano. Se reaprovechan:
- del Schafkopf: el orden de triunfos (damas, jotas y diamantes), los puntos de las cartas y el compañero oculto;
- del Tarot: la mesa de bazas con 5 jugadores.

## What Changes

- Nuevo juego **Sheepshead** para 5 jugadores, jugable contra la IA y en red.
  - **Baraja:** 32 cartas francesas (del 7 al As). Puntos: As 11, 10 10, K 4, Q 3, J 2; el resto, 0. Suman 120.
  - **Triunfos:** 14, de mayor a menor:
    - las 4 Q (tréboles, picas, corazones, diamantes);
    - las 4 J (en el mismo orden);
    - los diamantes: As, 10, K, 9, 8 y 7.
  - **Palos sin triunfo:** tréboles, picas y corazones, con el orden As, 10, K, 9, 8, 7.
  - **Reparto:** 6 cartas a cada uno y 2 al blind.
  - **Coger:**
    - empezando por el que sigue al que reparte, cada uno coge el blind o pasa;
    - el primero que lo coge es el picker: se queda las 2 cartas y entierra 2, que cuentan como suyas;
    - no puede enterrar la J de diamantes.
  - **Compañero:**
    - es quien tiene la J de diamantes, y no se sabe hasta que la juega;
    - si la tiene el picker, juega solo contra los cuatro.
  - **Bazas:**
    - sale el que sigue al que reparte;
    - hay que seguir el palo de salida, y los triunfos cuentan como un palo;
    - sin el palo, cualquier carta;
    - no hay obligación de ganar ni de fallar.
  - **Puntos de la mano con picker:** el bando del picker gana con 61 o más.

    | Resultado del bando del picker | Picker | Compañero | Cada rival |
    |---|---|---|---|
    | Gana (61 a 90) | +2 | +1 | −1 |
    | Gana con schneider (91 o más) | +4 | +2 | −2 |
    | Gana con schwarz (todas las bazas) | +6 | +3 | −3 |
    | Pierde (31 a 60) | −4 | −2 | +2 |
    | Pierde con schneider (30 o menos) | −8 | −4 | +4 |
    | Pierde con schwarz (ninguna baza) | −12 | −6 | +6 |

    Si el picker juega solo, se lleva lo suyo y lo del compañero.
  - **Leaster:**
    - si todos pasan, cada uno juega para sí y el blind es para quien gana la última baza;
    - gana quien hace menos puntos con al menos una baza;
    - si empatan, gana el que hizo menos bazas; si sigue el empate, el primero desde el que sigue al que reparte;
    - el ganador anota +4 y cada uno de los otros, −1.
  - **Partida:** 10 manos (dos vueltas de reparto). Gana quien tiene más puntos; puede haber varios ganadores empatados.
- **IA del Sheepshead en los tres niveles:**
  - **Normal:**
    - coge con 3 triunfos altos o más;
    - entierra sus cartas sueltas de otros palos, mejor las que valen puntos;
    - juega las bazas con reglas sencillas;
    - en el leaster, intenta perder las bazas.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** coge y entierra como la normal, y simula cada carta hasta el final de la mano.
- El servidor de salas admite el Sheepshead como un juego más en red.
- **Cliente:**
  - el Sheepshead en el menú;
  - una mesa de bazas para 5 con:
    - los botones de coger o pasar;
    - el blind y el entierro;
    - quién es el picker y el compañero en cuanto se descubre;
    - las bazas, los puntos de la mano y el marcador;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - llamar un As;
  - jugar solo por elección;
  - el «crack» (doblar) y las variantes para 3, 4, 6 y 7 jugadores;
  - los «doublers» tras un leaster.

## Capabilities

### New Capabilities
- `juego-sheepshead`: reglas del Sheepshead:
  - baraja, triunfos y puntos;
  - reparto;
  - coger y enterrar;
  - compañero con la J de diamantes;
  - bazas;
  - puntos con picker y leaster;
  - partida a 10 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Sheepshead.
- `niveles-ia`: el Sheepshead entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Sheepshead con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/sheepshead.ts`, `ia/sheepshead-basica.ts` e `ia/reconstruir/sheepshead.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaSheepshead.svelte` y `ResumenSheepshead.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - compañero con la J de diamantes, y si la tiene el picker, juega solo;
  - leaster si nadie coge;
  - partida a 10 manos.
