## Context

Ver proposal.md. Lo relevante del código actual:

- **Motor:** cumple ya lo que pide la red. Es puro y determinista, el estado es JSON, `vistaDe` filtra por asiento y la suite del contrato comprueba que ninguna vista muestra cartas ocultas. `aplicar` valida contra `accionesLegales`, y las IAs (`IAS`, por nivel) deciden con la vista.
- **Cliente:**
  - Cada mesa recibe una `Sesion` local, que tiene el estado, hace jugar a la IA con pausas (`pausaTras`, `PAUSA_IA_MS`) y guarda la partida.
  - Las mesas leen `vista`, `legales`, `fin`, `pensando` y `bloqueada`, y llaman a `jugar`, `pausar` y `reanudar`.
  - Todas usan la constante `HUMANO = 0`: unas 80 referencias en 16 archivos, más `lado()` y `nombreAsiento()`.
- **Burro:** su sesión local tiene un modo simultáneo, con temporizadores por asiento y los retrasos `REACCION_BURRO`, que viven en `juegos.ts` del cliente.

## Goals / Non-Goals

**Goals:**
- Un servidor genérico, que vale para cualquier `Juego` del motor sin código por juego, salvo el registro.
- Una `SesionRed` intercambiable con la `Sesion` local, para que las mesas no sepan si la partida es local o en red.
- Las mesas dibujadas desde cualquier asiento, sin cambios visibles en local.

**Non-Goals:**
- Persistencia de salas, escalado a varios procesos, cuentas, chat y espectadores.
- Desplegar en un proveedor concreto. Se deja preparado un Dockerfile y las variables de entorno.

## Decisions

### 1. Paquetes
- **`packages/server`**, con tres partes:
  - `src/protocolo.ts`: tipos y validación de los mensajes, sin dependencias de Node. El cliente lo importa como `@juegos/server/protocolo`.
  - `src/sala.ts`: la lógica de una sala. Es pura: recibe eventos y la hora como parámetros y devuelve los mensajes que hay que enviar y los temporizadores que hay que programar. Así se testea sin sockets ni reloj.
  - `src/servidor.ts`: la capa de WebSockets con `ws`. Lleva el registro de salas, los temporizadores reales, los límites de seguridad y los orígenes.
- **Alternativa descartada:** un paquete aparte para el protocolo. Añade uno más al monorepo sin ganar nada mientras solo lo usen el cliente y el servidor.

### 2. Registro de juegos en el motor
`engine/src/red.ts` exporta `JUEGOS_EN_RED: Record<IdJuegoRed, { juego, ias, configPorDefecto, simultaneo }>` con los 12 juegos con IA, con los mismos ids que el cliente (`sieteYMedia`, etc.).

Los retrasos del Burro (`REACCION_BURRO` y el retraso al pasar) se mueven del cliente a `engine/src/ia/reaccion.ts` como `retrasoIA(id, vista, accion, nivel, g)`. Los usan la sesión simultánea local y el servidor. Para los juegos por turnos, el servidor usa una pausa fija de 900 ms, la misma que la pausa de la IA local.

### 3. Protocolo
Mensajes JSON con un campo `tipo`.

**Del cliente al servidor:**
- `crear {juego, config, nivel, nombre}` y `unirse {codigo, nombre}`;
- `volver {codigo, testigo}`;
- `asiento {asiento}`, `empezar` y `revancha`;
- `jugar {accion, n}`, donde `n` es el número de jugadas que ha visto el cliente;
- `pausa {activa}`, `salir` y `ping`.

**Del servidor al cliente:**
- `entrada {codigo, asiento, testigo}`, al crear, unirse o volver;
- `sala {juego, config, nivel, anfitrion, asientos: {nombre, conectado, ia}[], empezada}`;
- `partida {n, vista, legales, fin}`: se envía a cada jugador tras cada jugada, con su vista;
- `error {mensaje, codigo}` y `pong`.

El servidor rechaza un `jugar` si `n` no coincide con las jugadas aplicadas. Así una acción pensada sobre una vista vieja no se aplica en otra situación. En el Burro, simultáneo, la acción se valida solo contra las acciones legales actuales del asiento, que es lo que hace la sesión local.

### 4. La sala
`Sala` guarda:
- `codigo`, `juego`, `config` y `nivel`;
- `asientos: ({nombre, testigo, conectado, desconectadoDesde} | null)[]` y `anfitrion`;
- `estado`, `jugadas`, `semilla`, el azar de cada IA y las pausas activas por asiento.

**Tras cada evento**, la sala calcula qué asiento juega la IA. Es un asiento libre, o el de un jugador desconectado hace más de 10 s, que tenga acciones legales. Si lo hay, devuelve un temporizador `{asiento, enMs}`. Al vencer, el servidor llama a `sala.alVencer(asiento, ahora)`, que vuelve a comprobar que sigue tocándole y juega con `ias[nivel]`.

**Simultaneidad:** en el Burro hay un temporizador por asiento de la IA, igual que en la sesión simultánea local.

**Pausas:**
- Si algún jugador conectado tiene una pausa activa, el temporizador de la IA se aplaza.
- Cada pausa dura como mucho 60 s desde que se activó.

### 5. `SesionRed` en el cliente
Se extrae la interfaz que usan las mesas, `SesionMesa<C, E, A, V>`, con:
- `asiento`, `vista`, `legales`, `fin`, `pensando` y `bloqueada`;
- `jugar`, `pausar` y `reanudar`;
- `def`, `nivel` y `pistas`.

La `Sesion` local la implementa sin cambios, con `asiento = 0`.

`SesionRed` también la implementa:
- **Vistas:** mantiene una cola de los mensajes `partida` y los muestra uno a uno, esperando entre ellos lo que diga `def.pausaTras`. Las pausas se ven igual que en local.
- **`jugar`:** envía la acción con el `n` de la última vista mostrada y bloquea hasta la siguiente vista.
- **Reconexión:** si el socket se cierra, reconecta con espera creciente (1, 2, 4… hasta 10 s), usando el `codigo` y el `testigo` guardados en `localStorage`.
- **`pausar` y `reanudar`:** envían `pausa`.
- **`pensando`:** es el asiento de la IA que va a jugar, que el servidor indica con un campo `piensa` en `partida`.

Las partidas en red no se guardan como partidas locales ni cuentan en las estadísticas.

### 6. Mesas desde cualquier asiento
- **Asiento propio:** se elimina `HUMANO` de las mesas. Cada una usa `sesion.asiento`.
- **Helpers relativos:**
  - `lado(asiento, n, yo)` rota con `(asiento - yo + n) % n`;
  - `nombreAsiento(asiento, n, yo)`;
  - `bandoPropio = bando(yo)`.
- **Tablas por bando** (resúmenes y fin): se ordenan con el bando propio primero.
- **Nombres:** en red, los nombres de los rivales se toman de la sala cuando existan (`sesion.nombre(asiento)`), y en local siguen siendo «Rival 1», «Compañero»…
- **Verificación:** los E2E locales siguen pasando sin cambios. Los de red juegan desde el asiento 1 y el 2.

### 7. Pantallas de red
`App.svelte` gana tres pantallas:
- **`red`:** crear o unirse, el nombre y la dirección del servidor;
- **`espera`:** la sala de espera;
- **`partida`:** con una `Partida` cuya sesión es una `SesionRed`.

Crear sala reutiliza `Opciones.svelte` con una prop `red`, que oculta lo que no aplica y termina en «Crear sala». La dirección del servidor sale de `localStorage`, si no de `import.meta.env.VITE_SERVIDOR_RED`, y si no de `ws://<host de la página>:8787`.

**Al recargar:** si hay `codigo` y `testigo` guardados, el menú ofrece «Volver a la sala» y entra solo en la partida en marcha.

### 8. Seguridad y límites
Dentro de `servidor.ts`, con su test:
- **Mensajes:** tamaño máximo 16 KB y validación de forma en `protocolo.ts`.
- **Ritmo:** contador por conexión, con más de 30 mensajes por segundo se cierra la conexión.
- **Orígenes:** lista `ORIGENES`, o `*` en desarrollo.
- **Azar:** códigos con `crypto.randomInt` sobre 22 letras y testigos de 128 bits con `randomBytes`.
- **Capacidad:** como mucho 500 salas.
- **Limpieza:** cada minuto se borran las salas sin conectados desde hace 30 minutos.

### 9. Tests
- **Sala:** tests puros de crear, unirse, cambiar de asiento, empezar con IA, rechazo de acciones ilegales o con `n` viejo, desconexión y relevo de la IA, reconexión, pausas, revancha y limpieza. Una propiedad: en partidas jugadas por IAs a través de la sala, ningún mensaje enviado a un asiento contiene cartas ocultas para él, con el mismo oráculo que la suite del contrato.
- **Integración:** se arranca el servidor en un puerto libre y se juega una Brisca completa con dos clientes WebSocket de Node.
- **E2E:** Playwright arranca también el servidor. Dos contextos de navegador crean una sala y se unen.
  - Una Brisca de 2 humanos, con una recarga a mitad de partida.
  - Un Mus de 2 humanos y 2 IAs, desde los asientos 0 y 2.
  - Un aviso sin servidor.

## Risks / Trade-offs

- **[Refactor de 16 mesas]** → Mecánico. Lo protegen los E2E locales existentes, que deben pasar sin tocarlos, y lo hacen visible los E2E de red desde asientos distintos de 0.
- **[Burro en red con latencia]** → El orden de llegada al servidor decide. Es justo entre humanos con latencias parecidas. Queda documentado.
- **[Un solo proceso, salas en memoria]** → Suficiente para jugar entre amigos. La persistencia y el escalado quedan para otro cambio.
- **[Páginas HTTPS y `ws://`]** → Un cliente servido por HTTPS (GitHub Pages) necesita `wss://`, que llegará con el despliegue. En local se usa `vite preview` sobre HTTP.

## Migration Plan

Sin migración de datos: las partidas locales y su guardado no cambian. Para probar en red hay que arrancar `pnpm servidor` y el cliente, y desde otro dispositivo de la misma red local abrir la dirección del equipo.

## Open Questions

- El proveedor de despliegue (y su `wss://`) se decide en otro cambio.
