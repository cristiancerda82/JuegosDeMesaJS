## Why

El Pishti es el juego de pesca más popular de Turquía. Es más rápido y sencillo que la Escoba, la Scopa o el Cuarenta:
- solo se juega sobre la carta de arriba del montón;
- la J se lo lleva todo;
- el «pishti» premia llevarse un montón de una sola carta.

Da a la suite un juego de capturas ligero para 2 o 4. Reaprovecha el modelo de la Scopa (bandos, cartas recogidas boca abajo, reconstrucción y simulación), con una mesa propia más simple.

## What Changes

- Nuevo juego **Pishti** para 2 jugadores o 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** la francesa de 52 cartas.
  - **Reparto:**
    - 4 cartas a cada uno y 4 al montón de la mesa: 3 tapadas y la de arriba a la vista;
    - cuando todos se quedan sin cartas, otras 4 a cada uno hasta acabar el mazo.
  - **Jugar:** se echa una carta sobre el montón.
    - Si es del mismo número que la de arriba, se lleva el montón entero.
    - Una J se lleva siempre el montón, si no está vacío.
    - Si no, la carta se queda arriba del montón.
  - **Pishti:** llevarse por número un montón de una sola carta vale 10 puntos; si las dos cartas son J, 20.
  - **Fin de la mano:** las cartas que quedan en el montón son para el último que se llevó un montón.
  - **Puntos de la mano:**
    - 3 por tener más cartas;
    - 1 por cada As y cada J;
    - 2 por el 2 de tréboles y 3 por el 10 de diamantes;
    - y los pishtis.
  - **Partida:** a 151 puntos. Si los dos bandos llegan en la misma mano, gana el que tiene más; con empate se juega otra.
- **IA del Pishti en los tres niveles:**
  - **Normal:** se lleva el montón cuando le conviene (el pishti antes que nada, y la J solo si el montón vale la pena) y, si no, suelta la carta con la que menos arriesga a dejar un pishti.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus jugadas hasta el final de la mano, con las cartas ocultas repartidas al azar.
- El servidor de salas admite el Pishti como un juego más en red.
- **Cliente:**
  - el Pishti en el menú, con la opción de 2 o 4 jugadores;
  - una mesa con el montón (las tapadas y las cartas que se ven), el mazo, las cartas recogidas y los pishtis de cada bando;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - los 3 o más jugadores sin parejas;
  - el reparto con el jugador mirando la primera carta del montón;
  - la variante del doble pishti con puntos dobles fuera de la J.

## Capabilities

### New Capabilities
- `juego-pishti`: reglas del Pishti:
  - baraja y repartos;
  - el montón con las tapadas;
  - capturas por número y con la J;
  - pishti;
  - fin de la mano y puntos;
  - partida a 151;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Pishti.
- `niveles-ia`: el Pishti entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Pishti con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/pishti.ts`, `ia/pishti-basica.ts` e `ia/reconstruir/pishti.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaPishti.svelte` y `ResumenPishti.svelte`;
  - cambian el registro de juegos, las opciones, los textos y la guía, la pantalla de fin, la lista de parejas de la sala de espera y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 2 jugadores o 4 en parejas;
  - 3 cartas tapadas y 1 a la vista en el montón inicial;
  - partida a 151.
