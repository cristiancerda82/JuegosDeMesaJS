## Why

El Rentz es el gran juego de compromisos alemán para cuatro. Con 32 cartas, cada jugador elige en su turno de repartir uno de sus siete contratos (seis de evitar y uno positivo), hasta que todos los han jugado todos. Es una partida larga y variada en la que cada mano pide una estrategia distinta.

La suite ya tiene el Barbu, del que se reaprovechan:
- el modelo de contratos;
- el dominó;
- las IA de evitar y de ganar bazas;
- su mesa.

El Rentz se diferencia en:
- la baraja de 32;
- que cada jugador tiene su propia lista de siete contratos, y la partida dura 28 manos;
- el contrato positivo de bazas;
- sus propias cuentas.

## What Changes

- Nuevo juego **Rentz** para 4 jugadores, jugable contra la IA y en red.
  - **Baraja:** 32 cartas francesas, con el orden As, K, Q, J, 10, 9, 8, 7.
  - **Reparto:** 8 cartas a cada uno.
  - **Elegir:**
    - en cada mano, el que reparte elige uno de los contratos que aún no ha jugado;
    - el que reparte pasa al siguiente en cada mano;
    - en 28 manos, cada jugador elige sus 7 contratos.
  - **Bazas:** sale el que eligió; hay que seguir el palo y, si no se tiene, se puede echar cualquier carta. No hay triunfo.
  - **Contratos:**

    | Contrato | Puntos |
    |---|---|
    | Sin bazas | −5 por baza |
    | Sin corazones | −5 por corazón |
    | Sin damas | −10 por dama |
    | Sin el K de corazones | −40 a quien se lo lleva |
    | Sin la última baza | −40 a quien se la lleva |
    | Dominó (el Rentz) | +40, +20, +10 y 0, por orden de acabar |
    | Bazas | +5 por baza |

    Los de evitar cartas se acaban en cuanto se han ganado todas las que restan.
  - **Dominó:**
    - abre el que eligió;
    - cada palo empieza por su J y crece hacia arriba y hacia abajo;
    - quien no puede poner, pasa.
  - **Partida:** gana quien suma más puntos tras las 28 manos; puede haber varios ganadores empatados.
- **IA del Rentz en los tres niveles:**
  - **Normal:** elige el contrato con la mejor estimación para su mano; en los de evitar, se escapa de las bazas; en el de bazas, las gana; en el dominó, juega la carta que más le abre.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** elige como la normal y simula cada carta hasta el final de la mano.
- El servidor de salas admite el Rentz como un juego más en red.
- **Cliente:**
  - el Rentz en el menú;
  - una mesa de bazas para 4 con:
    - la elección del contrato entre los que le quedan;
    - el contrato de la mano;
    - las filas del dominó;
    - los puntos de la mano y el marcador;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - 3, 5 o 6 jugadores;
  - doblar;
  - el contrato que suma todos los negativos.

## Capabilities

### New Capabilities
- `juego-rentz`: reglas del Rentz:
  - baraja, orden y reparto;
  - elegir contrato por turnos;
  - bazas;
  - los siete contratos y sus puntos;
  - dominó;
  - fin a las 28 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Rentz.
- `niveles-ia`: el Rentz entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Rentz con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/rentz.ts`, `ia/rentz-basica.ts` e `ia/reconstruir/rentz.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaRentz.svelte` y `ResumenRentz.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 4 jugadores con 32 cartas;
  - los 7 contratos clásicos.
