## Why

El póker de cinco cartas con descarte (five-card draw) es el póker de toda la vida, el de las películas y las partidas de cocina: cinco cartas tapadas, una ronda de apuestas, cambiar las que no sirven y otra ronda. Es más fácil de entender que el Texas Hold'em, porque no hay cartas comunes, y trae algo que este no tiene: leer cuántas cartas cambia cada rival.

La suite ya tiene casi todo lo que necesita, en el Texas Hold'em:
- las apuestas sin límite, con ciegas que suben y botes secundarios;
- el valor de las manos de póker;
- una IA experta que estima su probabilidad de ganar.

## What Changes

- Nuevo juego **Póker de cinco cartas** para 2 a 6 jugadores, jugable contra la IA y en red.
  - **Torneo y ciegas:** como en el Texas Hold'em:
    - 100 fichas por jugador;
    - ciegas que suben cada 10 manos;
    - el botón rota;
    - quien se queda sin fichas queda eliminado y gana el último que queda.
  - **Reparto:** cinco cartas tapadas a cada uno, de la baraja francesa de 52.
  - **Primera ronda de apuestas**, sin límite, como antes del flop en el Hold'em: habla primero el siguiente a la ciega grande.
  - **Descarte:** empezando por el siguiente al botón, cada jugador que sigue en la mano (también quien va all-in) cambia de 0 a 3 cartas, o 4 si se queda con un As y lo enseña. Todos ven cuántas cambia cada uno y el As enseñado. Si el mazo no alcanza, se barajan los descartes.
  - **Segunda ronda de apuestas**, sin límite: habla primero el siguiente al botón.
  - **Showdown:** gana la mejor mano de cinco cartas, con los botes secundarios del Hold'em.
- **IA del Póker de cinco cartas en los tres niveles:**
  - **Normal:** apuesta según su jugada y cambia las cartas que no forman parte de ella.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** como en el Hold'em, estima su probabilidad de ganar repartiendo al azar lo que no ve, contando cuántas cartas cambió cada rival, y la compara con lo que le cuesta seguir.
- El servidor de salas admite el Póker de cinco cartas como un juego más en red.
- **Cliente:**
  - el Póker de cinco cartas en el menú (familia «Envite y apuestas»), con el número de jugadores;
  - una mesa con las fichas, las apuestas, los botes y las acciones del Hold'em, y además:
    - elegir las cartas que se cambian;
    - lo que cambió cada uno;
  - el resumen de cada mano, el fin de partida, la guía «¿Cómo se juega?» con sus ejemplos y el consejo del modo asistido.
- **Fuera de alcance:**
  - límite fijo y ante;
  - abrir con pareja de J o mejor;
  - comodines.

## Capabilities

### New Capabilities
- `juego-poker-cinco`: reglas del Póker de cinco cartas:
  - torneo y ciegas;
  - las dos rondas de apuestas;
  - descarte;
  - botes y showdown;
  - eliminación;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Póker de cinco cartas.
- `niveles-ia`: el Póker de cinco cartas entra en la lista de juegos con tres niveles, y su difícil estima su probabilidad de ganar como el del Texas Hold'em, sin reconstrucción ni simulación de partidas.
- `mesa-cliente`: el menú incluye el Póker de cinco cartas con su mesa y su fin de partida.
- `menu-juegos`: el Póker de cinco cartas entra en la familia «Envite y apuestas».

## Impact

- `packages/engine`:
  - nuevos `juegos/poker-cinco.ts` e `ia/poker-cinco-basica.ts` (básica y experta), con sus tests y la suite genérica del contrato;
  - usa del Hold'em las ciegas, los botes y el valor de las manos;
  - se registra en `IAS`, en `red.ts` y en la tabla de niveles.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaPokerCinco.svelte` (el resumen de la mano es el del Hold'em);
  - cambian:
    - el registro de juegos y las opciones;
    - el catálogo del menú y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - apuestas sin límite como en el Hold'em;
  - cambiar hasta 3 cartas, o 4 con un As;
  - abrir sin mínimo.
