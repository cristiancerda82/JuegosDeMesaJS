## Why

El Préférence es el gran juego de cartas de Rusia y de Europa del Este. Es para 3 jugadores:
- una subasta de bazas con viuda;
- defensores que deciden si «hacen whist» (juegan a quitarle bazas al que juega);
- una cuenta en tres columnas (la pulka, la montaña y los whists) que se cierra al final.

Es el único juego de la suite para exactamente tres con una subasta de bazas al estilo del Bridge, y se juega con la baraja francesa de 32 cartas que ya usan el Skat y el Schafkopf.

## What Changes

- Nuevo juego **Préférence** (variante de Sochi) para 3 jugadores, jugable contra la IA y en red.
  - **Baraja y reparto:** 32 cartas francesas (del 7 al As), 10 a cada uno y 2 en la viuda. Los palos se ordenan picas, tréboles, diamantes y corazones.
  - **Subasta:** desde el siguiente al repartidor, cada uno puja más alto o pasa, y quien pasa ya no vuelve a pujar. Las pujas van del 6 de picas al 10 sin triunfo; la miseria va entre el 8 sin triunfo y el 9 de picas, y solo puede decirse como primera puja de un jugador.
  - **Viuda:** quien gana la subasta enseña la viuda, se la queda, descarta 2 cartas y declara su contrato: igual o más alto que su puja (la miseria sigue siendo miseria).
  - **Whist:** cada uno de los otros dos decide si hace whist o pasa. Si los dos pasan, el contrato se da por cumplido sin jugarse. En la miseria no hay whist.
  - **Bazas:**
    - hay que seguir el palo;
    - si no se tiene el palo, hay que echar triunfo;
    - si tampoco se tiene triunfo, cualquier carta.
  - **Raspasy:** si los tres pasan, se juega sin triunfo y cada uno para sí: cada baza que gana suma 1 a su montaña.
  - **Cuenta:**
    - **Contratos:** valen 2, 4, 6, 8 y 10 (de 6 a 10 bazas) y 10 la miseria.
    - **Cumplir:** suma el valor a la pulka.
    - **Fallar:** suma a la montaña el valor por cada baza que falta.
    - **Whists:** los que hacen whist se apuntan whists contra el que juega por cada baza que ganan; si hacen menos bazas de las que les toca, suman montaña.
  - **Partida:** termina cuando las pulkas de los tres suman 30 (lo que uno pasa de 10 cubre lo que les falta a los demás). Se cierran las cuentas: la montaña cuenta 10 whists por punto frente a la media, y gana quien acaba con más whists.
- **IA del Préférence en los tres niveles:**
  - **Normal:** puja según las bazas que calcula con sus cartas, descarta lo que menos vale, hace whist si espera las bazas que le tocan y juega la carta justa para ganar o, en la miseria y la raspasy, para no ganar.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** puja, descarta, declara y decide el whist como la normal, y simula las bazas hasta el final de la mano.
- El servidor de salas admite el Préférence como un juego más en red.
- **Cliente:**
  - el Préférence en el menú;
  - una mesa de bazas para tres con la subasta (nivel y palo), la viuda, el descarte, el contrato, el whist y el triunfo;
  - la pulka, la montaña y los whists de cada uno;
  - el resumen de cada mano, el fin de partida con el cierre de cuentas y la guía «¿Cómo se juega?».
- **Fuera de alcance** (simplificaciones de la variante de Sochi):
  - el «aquí» del primer jugador (igualar la puja);
  - el medio whist;
  - jugar a cartas vistas cuando solo uno hace whist;
  - la progresión de la raspasy y el uso de la viuda en ella;
  - apuntar whists por el exceso de la pulka que cubre a los demás (aquí ese exceso resta deuda en el cierre).

## Capabilities

### New Capabilities
- `juego-preference`: reglas del Préférence:
  - baraja y reparto;
  - subasta con miseria;
  - viuda, descarte y contrato;
  - whist;
  - bazas con obligación de fallar;
  - raspasy;
  - cuenta de la pulka, la montaña y los whists;
  - partida y cierre de cuentas;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Préférence.
- `niveles-ia`: el Préférence entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Préférence con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/preference.ts`, `ia/preference-basica.ts` e `ia/reconstruir/preference.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaPreference.svelte` y `ResumenPreference.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la variante de Sochi;
  - con miseria;
  - raspasy si todos pasan;
  - la partida hasta que la pulka de los tres llega a 10.
