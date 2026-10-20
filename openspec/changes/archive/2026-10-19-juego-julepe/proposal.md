## Why

El Julepe es el gran juego de bazas «de bote» de la baraja española. Cada jugador decide en cada mano si se arriesga a jugar, y quien juega y no hace al menos dos bazas paga el «julepe». Añade a la suite dos cosas que no tiene:
- la decisión de entrar o no en la mano;
- partidas con fichas en las que se pueden perder jugadores.

Además es el primer juego de bazas de 5 y 6 jugadores. Reutiliza el motor de bazas (obligaciones con triunfo) y la mesa de bazas, que pasa a admitir más rivales.

## What Changes

- Nuevo juego **Julepe**, jugable contra la IA y en red, con 3 a 6 jugadores (4 por defecto), cada uno por su cuenta:
  - **Reparto:** baraja española de 40 cartas y 5 cartas a cada jugador. La última carta del repartidor se enseña y marca el triunfo, y se queda en su mano. Lo que sobra es el mazo para los descartes. El reparto rota y es mano el siguiente al repartidor.
  - **Bote:** cada mano, el repartidor pone 10 fichas en el bote, que se suman a los julepes de la mano anterior.
  - **Jugar o pasar:** cada jugador, desde la mano hasta el repartidor, dice si juega la mano o pasa. Si al llegar al repartidor solo ha querido jugar uno, el repartidor está obligado a jugar. Si no ha querido nadie, el repartidor se lleva el bote sin jugar.
  - **Descarte:** cada jugador que juega, en el mismo orden, puede descartar las cartas que quiera y robar otras tantas del mazo mientras queden.
  - **Bazas:** se juegan 5 bazas solo entre los que juegan, con el orden de la Brisca (As, 3, Rey, Caballo, Sota, 7…2) y las obligaciones clásicas:
    - seguir el palo y superar si se puede;
    - sin el palo, fallar con triunfo y superar el triunfo más alto si se puede.
  - **Cobro:** cada baza vale la quinta parte del bote. Quien juega y hace menos de 2 bazas paga **julepe**, lo que valía el bote, al bote de la mano siguiente. Quien se queda sin fichas queda eliminado.
  - **Partida:** todos empiezan con 50 fichas. Se juegan 12 manos (6 o 20 en Opciones), o hasta que solo uno tiene fichas. Gana quien más fichas tiene.
- **IA del Julepe en los tres niveles:**
  - la básica juega la mano según las bazas que espera hacer, descarta las cartas que no ganan y gana bazas con la carta más barata;
  - la fácil se equivoca a veces;
  - la difícil simula si juega o pasa y cada carta, y los descartes los decide como la básica.
- El servidor de salas admite el Julepe como un juego más en red, con 3 a 6 asientos.
- **Cliente:**
  - el Julepe en el menú y sus opciones (jugadores, manos, nivel de la IA);
  - la mesa de bazas admite 5 y 6 jugadores;
  - una mesa propia con «Juego» y «Paso», la elección de descartes, quién juega, el bote, las fichas y la carta de triunfo;
  - el resumen de cada mano y la guía «¿Cómo se juega?».
- **Fuera de alcance:** las variantes con «arrastre» del repartidor, el «julepe doble», los puntos por cantes y la partida sin límite de manos.

## Capabilities

### New Capabilities
- `juego-julepe`: reglas del Julepe:
  - reparto y triunfo;
  - bote y puesta;
  - jugar o pasar con el repartidor obligado;
  - descarte;
  - bazas con obligaciones;
  - cobro por bazas y julepe;
  - eliminación y fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Julepe (jugar o pasar, descarte y juego de cartas).
- `niveles-ia`: el Julepe entra en la lista de juegos con tres niveles y en la reconstrucción de las cartas ocultas. Su difícil simula jugar o pasar y las cartas, no los descartes.
- `mesa-cliente`: el menú incluye el Julepe con su mesa y su resumen, y la mesa de bazas admite 5 y 6 jugadores.

## Impact

- `packages/engine`:
  - nuevos `juegos/julepe.ts`, `ia/julepe-basica.ts` e `ia/reconstruir/julepe.ts`, con sus tests y la suite genérica del contrato;
  - usa `cartasObligadas`/`cartaGanadora` de `motor/bazas.ts` sin cambiarlos;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código, porque el número de asientos sale de la configuración.
- `packages/client`:
  - `asientos.ts`, `MesaBazas`, `AsientoRival` y `Tapete` admiten 5 y 6 jugadores, poniendo varios rivales arriba;
  - nueva `MesaJulepe.svelte` y `ResumenJulepe.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del Julepe clásico y las valida el usuario:
  - la puesta de 10 del repartidor;
  - el valor de la baza (un quinto del bote);
  - el julepe por el valor del bote;
  - el repartidor obligado;
  - las 50 fichas y las 12 manos.
