## 1. Base

- [x] 1.1 Tipos de ejemplo (`ayuda/ejemplos/tipos.ts`) y componentes `Ejemplo`, `EjemploCartas`, `EjemploJugadas`, `EjemploBaza` y `EjemploAntesDespues`, accesibles y que quepan a 360 px
- [x] 1.2 `ComoSeJuega.svelte` pinta `ejemplo`/`ejemplos` de cada sección a través de `EJEMPLOS`, sin la cadena de `{#if}` ni las constantes
- [x] 1.3 Pasar los ejemplos de las 19 guías actuales al formato nuevo, con `data-testid="ejemplo-<clave>"`
- [x] 1.4 Test de comprobación (`ejemplos.test.ts`): claves usadas y existentes, cartas de la baraja del juego, al menos un ejemplo por juego, y los comprobadores por tipo (jugadas, baza, valores y antes y después), con la lista de los ejemplos sin comprobador

## 2. Ejemplos por familia

- [x] 2.1 Solitarios (11): Klondike, FreeCell, Spider, Belle Lucie, Scorpion, Cuarenta ladrones, Canfield, Yukon, TriPeaks, Golf y Pirámide
- [x] 2.2 Bazas por puntos (19): Brisca, Tute, Guiñote, Tressette, Schnapsen, Sixty-Six, Belote, Klaverjas, Jass, Sueca, Bezique, Skat, Doppelkopf, Schafkopf, Sheepshead, Tysiacha, Piquet, Écarté y Butifarra
- [x] 2.3 Bazas con contrato (16): Bridge, Whist, Picas, Oh Hell, Pocha, 500, Tresillo, Twenty-Nine, Briscola Chiamata, Preference, Tute subastado, Cuatrola, Julepe, Euchre, Bourré y Tarot
- [x] 2.4 Bazas para evitar (3): Corazones, Barbu y Rentz
- [x] 2.5 Combinaciones (9): Chinchón, Remigio, Gin Rummy, Canasta, Hand and Foot, Conquián, Pinacle, Cribbage y las que falten del catálogo
- [x] 2.6 Captura (6): Escoba, Scopa, Casino, Cuarenta, Pishti y Pesca
- [x] 2.7 Descarte (10): Ocho loco, Culo, Big Two, Durak, Cinquillo, Sevens, Mentiroso, Burro, Kings Corner y Spite & Malice
- [x] 2.8 Envite (7): Mus, Truco, Truc, Texas Hold'em, Blackjack, Siete y media y Treinta y uno
- [x] 2.9 Ajustar los textos de las secciones que repiten lo que ya enseña el ejemplo

## 3. Verificación

- [x] 3.1 E2E de la guía para todos los juegos del catálogo: al menos un ejemplo visible y sin desplazamiento horizontal a 360 px
- [ ] 3.2 Revisar a mano las capturas de las guías de cada familia, en escritorio y a 360 px
- [ ] 3.3 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
