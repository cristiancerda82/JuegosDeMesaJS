## Context

En el Oh Hell de la suite (`juegos/oh-hell.ts`), `secuenciaOhHell(jugadores)` da las cartas de cada mano: del máximo a 1 y de 2 al máximo. Las cartas de la mano en curso y el total de manos salen de esa secuencia y del índice de la mano. Así lo usan la vista (`cartasMano`, `totalManos`), el fin de la partida y la apuesta prohibida.

## Goals / Non-Goals

**Goals:**
- Que la secuencia que sube desde 1 sea una opción del mismo juego, en local y en red.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- Otras secuencias: solo bajar, o la de la Pocha.
- Puntuaciones distintas.

## Decisions

### 1. Opción en la config
- **`ConfigOhHell`:** gana `subiendo?: boolean`. `crear` la normaliza a `config.subiendo === true`, igual que las otras opciones booleanas de la suite.
- **La secuencia:** `secuenciaOhHell(jugadores, subiendo = false)`. Con la opción devuelve `1, 2, …, max`. Todos los usos internos pasan `e.config.subiendo`.
- **El estado no guarda la secuencia:** sale de la config, que viaja con el estado y con la vista. Por eso la reconstrucción del difícil ya la recibe sin cambios.

### 2. IA
- No cambia. La IA básica decide con `cartasMano` y con las cartas que ve. La reconstrucción copia la config de la vista.
- Se añaden pruebas: partidas entre IAs con la opción, la tabla de niveles con una entrada para la variante, y la reconstrucción con la opción.

### 3. Cliente
- **Opciones:** casilla «Empezar con 1 carta» con su explicación, junto al número de jugadores. La sala en red usa las mismas opciones.
- **Mesa:** no cambia. «Mano X de N» y el resumen ya leen `totalManos` y `cartasMano` de la vista.
- **Guía:** la línea «En otros sitios…» pasa a «Variante (opción «Empezar con 1 carta»)…».

## Risks / Trade-offs

- **Partidas más cortas** → la diferencia entre niveles de IA se mide en menos manos. La prueba de fuerza del difícil se repite con la opción.
