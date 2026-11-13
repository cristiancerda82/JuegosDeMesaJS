## Context

El Rentz de la suite (`juegos/rentz.ts`) ya tiene lo que el Polignac necesita de las bazas:
- la baraja de 32 y el orden del 7 al As;
- las bazas sin triunfo, con la obligación de seguir el palo;
- el fin anticipado cuando ya no quedan cartas que resten;
- una IA de evitar bazas.

El Polignac se diferencia en:
- de 3 a 6 jugadores, con 30 cartas cuando no son 4;
- que solo hay un contrato, sin elegir;
- el general;
- el fin por límite de puntos, en lugar de un número fijo de manos.

Se escribe como juego aparte, copiando del Rentz lo que sirve: el número variable de jugadores y el general tocan el reparto, los turnos, las cuentas y el fin.

## Goals / Non-Goals

**Goals:**
- Polignac de 3 a 6 jugadores, con el general opcional, la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- 2 o 7 jugadores, y otras penalizaciones.

## Decisions

### 1. Cartas (`juegos/polignac.ts`)
- **Baraja:** `barajaPolignac(jugadores)`: la francesa del 7 al As, sin el 7 de picas ni el de tréboles si no son 4.
- **Rango:** `rangoPolignac`, del 7 (7) al As (14).
- **Puntos:** `penalizaPolignac(c)`: 2 para la J de picas, 1 para las otras J y 0 para el resto. Suman 5 por mano.
- **Ganadora y legales:** `ganadoraPolignac` y `cartasLegalesPolignac`, como en el Rentz.

### 2. Estado y fases
- **Config:** `{ jugadores: 3 | 4 | 5 | 6; limite: 10 | 20 | 30; general: boolean }`; por defecto `{ 4, 10, true }`.
- **Fases:** `'general' | 'bazas'`.
  - Con `general: false`, cada mano empieza directamente en `bazas`.
  - En `general`, deciden en orden desde el que sale. Cada uno puede `{ tipo: 'general' }` o `{ tipo: 'pasar' }`. El primero que anuncia pasa a `bazas` y sale él. Si todos pasan, sale el que estaba a la izquierda del que reparte.
- **Estado:**
  - `repartidor`, `fase`, `general: Asiento | null`, `pasados` (cuántos han pasado el general);
  - `manos`, `turno`, `mesa`, `ultimaBaza`, `bazasJugadas`, `bazas` por jugador;
  - `puntosMano`, `jugadasPor`, `fallos`;
  - `totales`, `resultadosManos`.
- **Fin de la mano:**
  - sin general: al ganarse la cuarta J;
  - con general: al perder el que lo juega una baza (él −5) o al acabar las cartas (los demás −5 cada uno).
- **Fin de la partida:** tras cerrar una mano, si algún total es ≤ −`limite`.
- **Vista:** todo lo público y la mano propia. `ultimaBaza` se vacía al repartir.
- **`ResultadoManoPolignac`:** `general`, `cumplido` (`null` sin general), `puntos`, `totalesTras`.

### 3. IAs
- **Normal (`ia/polignac-basica.ts`):**
  - **General:** lo anuncia solo si todas sus cartas son, en cada palo que tiene, una racha seguida desde el As. Así gana todas las bazas saliendo siempre.
  - **Bazas normales:** las reglas de evitar del Rentz:
    - al salir, sin gastar las J mientras tenga otras cartas;
    - al seguir con todas ganando, la más alta que no sea J;
    - sin el palo, primero la J de picas, luego otra J y luego la más alta.
  - **Con general:** el que lo juega sale con la más alta; los demás, con la más baja que gana la baza o, si no pueden, con la más baja.
- **Difícil (`ia/reconstruir/polignac.ts`):** `SIMULABLE_POLIGNAC`.
  - **Reconstrucción:** como la del Rentz, con `fallos`. Con 30 cartas, los dos sietes quitados no están en ningún sitio.
  - **`decideLaBase`:** en la fase `general`.
  - **Valoración:** los puntos de la mano del asiento menos la media de los otros, más `bonoPartida`.
  - **Ajuste:** los valores de `reconstrucciones` y `presupuesto` se ajustan con la prueba de fuerza y la de tiempo de la tabla de niveles.

### 4. Cliente
- **Opciones:**
  - jugadores (3 a 6);
  - límite (−10, −20, −30);
  - casilla del general.
- **`MesaPolignac.svelte`:** a partir de `MesaRentz.svelte`, sobre `MesaBazas` con `n` jugadores.
  - **Información:** la mano en curso, el general si lo hay y los puntos propios.
  - **General:** botones «Anunciar general» y «Pasar» (`data-accion`, `data-jugada`).
  - **Detalle de cada asiento:** quién reparte, quién juega el general y los puntos de la mano.
- **`ResumenPolignac.svelte`:** el general y si se cumplió, lo que anota cada uno y el marcador.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.
- **Guía y ejemplos:** los valores de las J (`cartas`) y una baza resuelta (`baza`), en `ayuda/ejemplos/bazas-evitar.ts`, comprobados con `penalizaPolignac` y `ganadoraPolignac`.

## Risks / Trade-offs

- **Con 5 o 6 jugadores hay pocas cartas y el reparto decide mucho** → es el juego; la prueba contra el azar y la de fuerza se hacen con 4.
- **El general casi nunca se anuncia** → es fiel al juego. Los tests lo fuerzan con manos preparadas, y el E2E usa una semilla en la que la IA o el jugador pueden anunciarlo.
- **Código repetido con el Rentz** → se acepta: el reparto, los turnos y las cuentas son distintos.
