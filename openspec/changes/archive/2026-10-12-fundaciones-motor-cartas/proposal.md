## Why

JuegosDeMesaJS será una suite de juegos de naipes jugable en local contra la IA y en red, en todas las plataformas. Antes de sumar juegos hace falta una base común: un motor de reglas puro, barajas y una mesa 2D. Esa base se valida con dos juegos muy distintos, Klondike (un solitario) y Brisca (bazas con información oculta), para que el resto de la suite y el modo en red se construyan encima sin rehacerla.

## What Changes

- Nuevo modelo de cartas y barajas: española (40 y 48) y francesa (52), con barajado determinista a partir de una semilla.
- Nuevo motor de reglas genérico. Es puro: recibe un estado y una acción y devuelve el estado siguiente. Además expone las acciones legales de cada jugador y la vista de cada jugador, sin las manos ajenas ni el orden del mazo. No depende de UI ni de red.
- Klondike jugable de principio a fin: robar de 1 o de 3 cartas, deshacer, detección de victoria y autocompletar.
- Brisca española jugable de principio a fin, en su variante base: 2 jugadores con 3 cartas en mano. Incluye triunfo, bazas, robo tras cada baza, puntuación y fin de partida. Las variantes (cambio del 7/2 de triunfo, 4 jugadores en parejas, etc.) se modelan como configuración.
- Primera IA para la Brisca. Juega con la misma vista que un humano y tiene al menos un nivel de dificultad básico.
- Cliente web 2D con menú de la suite, mesa, cartas, arrastrar y tocar, y diseño adaptable a escritorio y móvil. Funciona offline en modo local.
- Fuera de alcance, para changes posteriores: multijugador en red, Tute, PWA y empaquetado nativo, cuentas y estadísticas persistentes.

## Capabilities

### New Capabilities
- `baraja`: cartas, palos y valores de la baraja española (40/48) y francesa (52); creación, barajado con semilla y reparto.
- `motor-reglas`: contrato genérico de un juego (estado, acciones, acciones legales, transición, vista por jugador, fin de partida) y su ejecución determinista.
- `juego-klondike`: reglas del solitario Klondike, opciones (robar 1 o 3), deshacer, victoria y autocompletar.
- `juego-brisca`: reglas de la Brisca española base (2 jugadores, 3 cartas), puntuación y variantes configurables.
- `ia-jugadores`: jugadores controlados por la IA que deciden a partir de la vista de jugador; primera IA para la Brisca.
- `mesa-cliente`: cliente 2D con menú de la suite, mesa de juego e interacción por ratón y por toque, adaptable y usable offline.

### Modified Capabilities
<!-- Ninguna: el proyecto no tiene specs previas. -->

## Impact

- Proyecto nuevo, sin código existente. Se crea un monorepo TypeScript con los paquetes `engine` (barajas, motor, juegos, IA) y `client` (UI 2D). El paquete `server` queda reservado para el change de red.
- Dependencias nuevas: toolchain de TypeScript, bundler y servidor de desarrollo, y framework de tests. La librería de render (DOM/CSS o PixiJS) se decide en el design.
- Hace falta arte de cartas con licencia libre o de diseño propio, sobre todo para la baraja española.
- Las reglas se redactan a partir del conocimiento de los juegos clásicos y las valida el usuario, porque la documentación de referencia está incompleta.
