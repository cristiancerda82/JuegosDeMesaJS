## Context

El motor ya tiene la Brisca (`packages/engine/src/juegos/brisca.ts`) con sus tablas de orden y puntos, `cartaGanadora`, el robo tras la baza y el arrastre final. También tiene la IA básica (`ia/brisca-basica.ts`), con la interfaz `Agente` y la suite genérica de propiedades del contrato. El cliente tiene `MesaBrisca.svelte`, que mezcla en un solo componente los asientos rivales, el mazo con la muestra, el tapete y la mano propia, pensados para manos de 3 cartas. La sesión de juego, el guardado repetible, la interacción y el FLIP son genéricos y sirven tal cual.

El Tute repite casi todo el modelo de bazas de la Brisca. Le suma los cantes, el tute, el reparto completo con 4 jugadores, las obligaciones desde el principio y los 10 de últimas (ver specs/juego-tute).

## Goals / Non-Goals

**Goals:**
- Un único módulo de bazas en el motor que usen la Brisca y el Tute, sin que cambie ni una regla de la Brisca.
- Que el Tute cumpla el contrato del motor y pase la suite genérica de propiedades, como los otros juegos.
- Una mesa de bazas en el cliente con piezas compartidas, para que el Tute no copie la mesa de la Brisca.

**Non-Goals:**
- Una IA con búsqueda (Monte Carlo o similar): queda para un nivel "difícil" en otro change.
- Animaciones específicas de los cantes más allá de un aviso con las dos cartas.
- Unificar las configuraciones de la Brisca y el Tute: cada juego conserva su propio tipo de configuración.

## Decisions

### 1. Módulo común `motor/bazas.ts`
Se extrae de la Brisca todo lo que no depende del juego concreto:
- Las tablas de orden y puntos de la baraja española, y las funciones `fuerza`, `puntosDe` y `paloDe`.
- `cartaGanadora(mesa, triunfo)`.
- `cartaDeCambio(muestra)`, para el cambio del 7 (o el 2).
- `robar(manos, mazo, muestra, desde, jugadores)`: el robo en orden de turno a partir del ganador.
- `cartasObligadas(mano, mesa, triunfo, { montarSobreCompanero, bandoDe })`: las cartas que se pueden jugar cuando rigen las obligaciones. La Brisca la usa con su arrastre final (sin compañero) y el Tute con o sin la opción de montar sobre el compañero.
- `bandoDe(asiento)` y `siguiente(asiento, n)`.

La Brisca pasa a importar estas piezas y conserva sus exports públicos (`fuerza`, `puntosDe`, `cartaGanadora`…), reexportados para no romper la IA ni el cliente. Sus tests actuales son la red de seguridad del refactor: tienen que seguir pasando sin cambios.
- *Alternativa:* un "juego de bazas" genérico parametrizado (una clase base o un objeto con ganchos) del que la Brisca y el Tute fueran configuraciones. Se descarta por ahora: las diferencias (cantes, tute, reparto completo, quién puede cambiar o cantar) obligarían a muchos ganchos. Las funciones sueltas dan la misma reutilización con menos acoplamiento. Si el Tute habanero u otros juegos de bazas lo justifican, se puede subir de nivel después.

### 2. Estado y acciones del Tute
El estado sigue el estilo del de la Brisca (JSON plano) y añade:
- `cantes: { asiento, palo, puntos }[]` de la mano en curso.
- `puedeCantar: Asiento | null`: quién ganó la última baza y aún no usó su derecho a cantar. Se pone al resolver una baza y se borra al cantar o al jugar carta. Así "un cante por baza ganada" es un dato del estado y no una deducción del historial.
- `cartaTriunfo: IdCarta | null` (solo con 4 jugadores): la carta del repartidor que marcó el triunfo, visible mientras siga en su mano.
- `tute: bando | null` en el resultado de la mano, cuando se cierra por tute.

Las acciones son `jugar(carta)`, `cambiarSiete`, `cantar(palo)` y `cantarTute`. Con esto, cantar y cambiar el 7 se validan en `accionesLegales` como cualquier otra jugada.

Los puntos de la mano se calculan como bazas + cantes + 10 de últimas al cerrar la mano, en una función pura que se prueba aparte.

### 3. Turno con 4 jugadores
Igual que en la Brisca: los asientos avanzan 0→1→2→3, y el cliente los dibuja abajo, derecha, arriba e izquierda (sentido antihorario). Sale el siguiente al repartidor.

### 4. Vista
`VistaTute` incluye la mano propia, `cartasEnMano`, `triunfo`, `muestra` (con 2 jugadores), `cartaTriunfo` (con 4, mientras esté en la mano del repartidor), el número de cartas del mazo, la baza en curso, `ultimaBaza`, las bazas por asiento, los cantes, `resultadosManos` y `manosGanadas`. Los puntos de bazas en curso no se muestran, igual que en la Brisca: se conocen al final.

La propiedad "vistas sin cartas ocultas" de la suite genérica se configura con un oráculo que excluye la `cartaTriunfo` pública.

### 5. IA básica del Tute
Reutiliza las reglas de la Brisca (ganar sin triunfo cuando hay puntos, no gastar triunfos altos, soltar la carta de menor valor) y le añade prioridades:
1. Cantar el tute si puede.
2. Cantar: las 40 antes que las 20.
3. Cambiar el 7.
4. Al elegir carta, se excluyen el rey y el caballo de las parejas que aún puede cantar, mientras queden otras cartas legales.

El coste de una carta y la elección dentro de la baza se extraen de la IA de la Brisca a una utilidad compartida (`ia/bazas-heuristica.ts`), para que ambas IAs no dupliquen esas reglas.

### 6. Cliente: mesa de bazas compartida
`MesaBrisca.svelte` se divide en piezas reutilizables dentro de `mesas/bazas/`:
- `AsientoRival` (nombre, bazas, turno, dorsos).
- `Tapete` (las cartas jugadas según el lado de cada asiento, el aviso y el destino "mesa").
- `ManoPropia` (cartas jugables, selección y arrastre).
- `MazoYMuestra`.

`MesaBrisca` y la nueva `MesaTute` componen esas piezas. La Brisca no cambia de aspecto ni de comportamiento, y sus tests E2E lo comprueban.

**Mano de 10 cartas:** `ManoPropia` calcula el solape a partir del ancho disponible. Si las cartas no caben una al lado de otra, se solapan dejando a la vista al menos el ancho del índice (unos 26 % de la carta), y la carta elegida se levanta. El tamaño mínimo de carta se mantiene en 40 px para que el índice se lea.

**Cantes:** la mesa del Tute ofrece un botón por cada cante legal ("Cantar las 40 en oros", "Cantar el tute") en la zona de acciones de la mano propia. Los cantes nuevos se detectan comparando vistas, igual que la pausa de baza, y se anuncian con un aviso que muestra el rey y el caballo durante la pausa. La lista de cantes de la mano queda en la barra de información.

**Pausas:** `DefJuego.pausaTras` del Tute suma la pausa de baza y una pausa de cante, para que el aviso se pueda leer.

### 7. Guía y pausa de la IA
La guía del Tute sigue el formato de las otras (`T.ayuda.tute`), con ejemplos de cartas para los puntos y para un cante. Mientras la guía está abierta durante una partida, la sesión pausa los turnos de la IA y los reanuda al cerrarla, para que "la partida sigue en el mismo punto" se cumpla también contra la máquina. Para eso, `Sesion` gana dos métodos, `pausar()` y `reanudar()`, que no cambian el estado de juego.

### 8. Guardado
No cambia: el Tute se guarda como cualquier juego (configuración, semilla y jugadas), y `IdJuego` suma `'tute'`.

## Risks / Trade-offs

- [El refactor de bazas altera la Brisca sin querer] → Se hace primero, en tareas separadas, y solo se da por bueno si pasan sin cambios los tests de la Brisca, de su IA y los E2E de la Brisca.
- [Variantes regionales distintas a las que conoce el usuario: obligaciones con el compañero, cambio del 7, momento de cantar] → Están en la configuración o documentadas en la spec con nombre de escenario. El usuario valida las specs antes de implementar.
- [Diez cartas solapadas son difíciles de tocar en 360 px] → Se deja a la vista el índice de cada carta, la carta tocada se levanta antes de jugarse (tocar y luego la mesa), y un test E2E comprueba el caso de 360 px.
- [La IA "rompe" parejas o se queda sin poder cantar] → Hay un escenario específico ("Guarda la pareja") y simulaciones contra el azar.
- [La pausa de la IA con la guía abierta deja la sesión bloqueada si algo falla] → `reanudar()` se llama al cerrar el diálogo por cualquier vía (botón, Escape, clic fuera), y hay un test E2E.

## Migration Plan

No hay datos que migrar. Los guardados existentes de Klondike y la Brisca siguen siendo válidos porque las reglas no cambian. `VERSION_MOTOR` no sube: el refactor no altera ninguna transición, y lo comprueban los tests de repetición.

## Open Questions

- Si más adelante se quieren el capote o el "tute cabrón", con 3 jugadores, se añadirán como variantes en un change propio. No afectan a este diseño.
