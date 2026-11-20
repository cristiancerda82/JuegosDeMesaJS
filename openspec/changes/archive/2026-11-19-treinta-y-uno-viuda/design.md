## Context

El Treinta y uno (`juegos/treinta-y-uno.ts`) tiene un turno de dos pasos: robar (del mazo o del descarte) y descartar, o plantarse. Lleva la cuenta de las cartas que cada uno cogió del descarte (`conocidas`), para la vista y la reconstrucción. Con la viuda no hay robo ni descarte: el turno es una sola acción y todo lo que se cambia está a la vista.

## Goals / Non-Goals

**Goals:**
- La viuda como opción del mismo juego, con la IA de los tres niveles, en red y con su mesa.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- Otras reglas del Schwimmen:
  - el que reparte mira su mano y elige quedársela o cambiarla por la viuda antes de empezar;
  - el 31 que se enseña al momento;
  - nadar con la última vida.

## Decisions

### 1. Opción en la config
- **`ConfigTreintaYUno`:** gana `viuda?: boolean`. `crear` la normaliza a `viuda: config.viuda === true`, así que una config vieja sigue valiendo.
- **Vista:** enseña la config, y la mesa decide con ella qué pintar.

### 2. Estado y acciones
- **Estado:** `viuda: IdCarta[]` (vacía sin la opción) y `pasadas: number` (pases seguidos).
- **Reparto con viuda:** las 3 cartas de cada uno, la viuda con las 3 siguientes, el resto al mazo y el descarte vacío. El descarte guarda las viudas apartadas.
- **Acciones nuevas:**
  - `{ tipo: 'cambiar'; mia: IdCarta; mesa: IdCarta }` (9 combinaciones);
  - `{ tipo: 'cambiarTodas' }`;
  - `{ tipo: 'pasar' }`.
  - Con viuda, la fase es siempre `robar` y no hay `robar` ni `descartar`.
- **Fin del turno:** el de antes se saca a `finTurno`, compartido con `descartar`: el siguiente con vidas, los últimos turnos tras plantarse y las 8 vueltas.
- **Pasar:**
  - `pasadas + 1`;
  - si llega al número de jugadores con vidas, la viuda va al descarte y se ponen 3 del mazo (si no alcanzan, se barajan las del descarte debajo);
  - cualquier otra acción pone `pasadas` a 0.
- **`conocidas`:** sirve también aquí.
  - Al coger una carta de la viuda, pasa a ser conocida de quien la coge, y la que deja deja de serlo.
  - Con «cambiar las tres», sus conocidas son las tres cogidas.
  - Así la vista y la reconstrucción no necesitan nada nuevo para saber qué cartas ajenas se conocen.

### 3. IA
- **Normal:** `decisionTreintaYUno` mira primero si hay viuda.
  - Con 27 o más, se planta si puede.
  - Si no, compara su valor con el del mejor cambio de una carta y con el de la viuda entera. Hace el mejor si sube; si empatan, el de una carta.
  - Si ninguno sube, pasa.
- **Reconstrucción:** reparte al azar solo entre las cartas que no se ven: fuera su mano, la viuda, el descarte y las conocidas. La viuda y `pasadas` se copian de la vista.
- **Difícil:** el mismo `SIMULABLE_TREINTA`, que ya simula todo.

### 4. Cliente
- **Opciones:** casilla «Con viuda» con su explicación.
- **`MesaTreintaYUno.svelte`:**
  - **Pilas:** con viuda, en lugar del mazo y el descarte, la viuda con sus 3 cartas (`viuda-<carta>`) y la cuenta del mazo.
  - **Cambiar una:** tocar una carta propia la marca y tocar después una de la viuda hace el cambio (o al revés).
  - **Botones:** «Cambiar las tres», «Pasar» y «Plantarse», con `data-jugada` para el modo asistido.
- **Aviso:** lo que hizo el último («Rival 1 cambia el 7 de picas por el As de corazones», «Rival 2 pasa») y «Viuda nueva» cuando se renueva.
- **Guía:** la línea «En otros sitios…» pasa a ser «Variante (opción «Con viuda»)…», como las de los libros, con un ejemplo `antesDespues` comprobado con el motor.

## Risks / Trade-offs

- **`miTurno` de la mesa no mira `sesion.bloqueada`** (el mismo fallo que se arregló en el Mentiroso). Los controles nuevos lo miran, y se corrige también en `miTurno` para el modo de siempre.
- **Con 6 jugadores, el mazo tiene 31 cartas** → da para 10 renovaciones de la viuda, y si se acaba se barajan las apartadas.
