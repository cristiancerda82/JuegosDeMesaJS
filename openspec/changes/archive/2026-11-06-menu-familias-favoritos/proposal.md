## Why

El menú principal muestra los ~75 juegos de la suite en una sola rejilla plana: encontrar un juego exige recorrer toda la lista, y no hay forma de llegar rápido a los que el jugador usa a menudo. Ahora que la suite ya es grande, el menú tiene que ordenarse antes de seguir añadiendo juegos.

## What Changes

- El menú agrupa los juegos por **familia** (Solitarios, Bazas por puntos, Bazas con contrato o subasta, Bazas para evitar, Combinaciones, Captura, Descarte, Envite y apuestas). La pantalla principal muestra las familias; al elegir una, se ven sus juegos.
- **Filtro por baraja** (Todas, Española, Francesa) y un **buscador** por nombre, que muestran los juegos que coinciden sin pasar por las familias.
- **Favoritos**: el jugador marca o desmarca un juego con una estrella, en su tarjeta del menú y en la pantalla de opciones. Un botón flotante abre el panel de favoritos.
- **Últimos jugados**: el cliente recuerda los 10 últimos juegos empezados, del más reciente al más antiguo, tanto en local como en red. Un segundo botón flotante abre ese panel.
- Los favoritos y los recientes se guardan en el dispositivo y el menú funciona igual si el almacenamiento no está disponible.
- La familia, la baraja y las cartas de muestra de cada juego pasan a ser datos del registro de juegos del cliente, en lugar de una lista aparte dentro del menú.

## Capabilities

### New Capabilities
- `menu-juegos`: organización del menú principal por familias, el filtro por baraja, el buscador, los favoritos y los últimos jugados, con sus paneles flotantes y su guardado en el dispositivo.

### Modified Capabilities
- `mesa-cliente`: el requisito «Menú de la suite» deja de describir una lista con todos los juegos y pasa a remitir al menú por familias.

## Impact

- Cliente: `pantallas/Menu.svelte` se reorganiza; hacen falta componentes nuevos para la vista de familia y los paneles flotantes. `sesion/juegos.ts` gana la familia, la baraja y las cartas de muestra de cada juego. `App.svelte` registra el juego reciente al empezar una partida local o al entrar en una sala, y `pantallas/Opciones.svelte` muestra la estrella de favorito. Los textos nuevos van en `textos.ts`.
- Almacenamiento: dos claves nuevas en `localStorage` (favoritos y recientes), con el mismo prefijo que el dorso.
- Tests: unitarios para los registros de favoritos y recientes, y e2e de Playwright para el nuevo flujo del menú. Los e2e que hoy pulsan `juego-<id>` directamente en el menú tendrán que pasar por la familia o el buscador.
- Sin cambios en el motor, el servidor ni el protocolo de red.
