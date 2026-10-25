## Context

El Sevens es el Cinquillo con la baraja francesa: escaleras desde los sietes en vez de desde los cincos, y 13 cartas por palo. Se reutiliza su estructura completa:
- estado con las escaleras por palo como extremos (`bajo`, `alto`);
- jugar o pasar;
- la penalización por cartas;
- la IA básica, que se adapta al orden de la baraja francesa;
- la reconstrucción y el `Simulable`;
- la mesa del cliente, ajustada a 13 cartas por palo y hasta 6 jugadores.

## Goals / Non-Goals

**Goals:**
- Sevens de 3 a 6, con la salida del 7 de diamantes y la partida a 50 puntos.
- IA normal como la del Cinquillo y difícil por simulación que le gane.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Fichas, 2 o 7 jugadores y otros límites.

## Decisions

### 1. Estado (`juegos/sevens.ts`)
Es el estado del Cinquillo con `ConfigSevens { jugadores: 3–6 }` y los palos franceses. Las escaleras guardan sus extremos como valores de carta (del As, 1, a la K, 13), y `SIETE` es 7. La partida termina cuando, al cerrar una mano, algún total llega a `OBJETIVO_SEVENS = 50`.

### 2. Reparto
Se reparte una a una desde la izquierda del repartidor, igual que en el Cinquillo. Los primeros en recibir tienen una carta más: con 5 jugadores, 11, 11, 10, 10 y 10.

### 3. IAs
- **Normal (`ia/sevens-basica.ts`):** la misma valoración que la del Cinquillo, con el orden y el 7 del Sevens.
- **Difícil (`ia/reconstruir/sevens.ts`):** `SIMULABLE_SEVENS`, como `SIMULABLE_CINQUILLO`. Las manos son más largas (hasta 17 cartas con 3 jugadores), así que se usan `reconstrucciones` 20 y `presupuesto` 100. Con ellos, en partidas de 4 la difícil gana 68 de 200 a la normal (el 34 %, frente al 25 % que le tocaría) y decide en menos de 50 ms; la normal gana 85 de 200 a la fácil.

### 4. Cliente
- **`MesaSevens.svelte`:** parte de `MesaCinquillo.svelte`. Cada palo es una fila de 13 huecos, que en 360 px quedan de unos 24 px de ancho; los rivales se reparten en filas, como en el Cinquillo, hasta 5.
- **`ResumenSevens.svelte`:** el panel de resultado del Cinquillo, sacado a un componente que usan la mesa y la pantalla de fin.
- **Fin y textos:** en `T.sevens`, con la guía.

## Risks / Trade-offs

- **[Seis jugadores en 360 × 640]** → Los 5 rivales caben en dos filas, con su número de cartas y sus puntos; lo comprueba un E2E en el perfil móvil.
