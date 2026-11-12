## MODIFIED Requirements

### Requirement: Familias de juegos
Cada juego de la suite MUST pertenecer a una sola familia, y el menú principal MUST mostrar las familias, no la lista completa de juegos. Cada familia MUST mostrar su nombre y cuántos juegos contiene. Las familias y sus juegos son:

| Familia | Juegos |
|---|---|
| Solitarios | Klondike, FreeCell, Spider, Belle Lucie, Scorpion, Cuarenta ladrones, Canfield, Yukon, TriPeaks, Golf, Pirámide |
| Bazas por puntos | Brisca, Tute, Guiñote, Tressette, Schnapsen, Sixty-Six, Belote, Klaverjas, Jass, Sueca, Bezique, Skat, Doppelkopf, Schafkopf, Sheepshead, Tysiacha, Piquet, Écarté, Butifarra |
| Bazas con contrato o subasta | Bridge, Whist, Picas, Oh Hell, Pocha, 500, Tresillo, Preference, Tute subastado, Cuatrola, Julepe, Euchre, Bourré, Tarot, Twenty-Nine, Briscola Chiamata |
| Bazas para evitar | Corazones, Barbu, Rentz |
| Combinaciones | Chinchón, Remigio, Gin Rummy, Rummy 500, Canasta, Conquián, Pinacle, Cribbage |
| Captura | Escoba, Scopa, Casino, Cuarenta, Pishti, Pesca |
| Descarte | Ocho loco, Culo, Big Two, Durak, Cinquillo, Sevens, Mentiroso, Burro, Kings Corner, Spite & Malice |
| Envite y apuestas | Mus, Truco, Truc, Texas Hold'em, Blackjack, Siete y media, Treinta y uno |

Al elegir una familia, el menú MUST mostrar sus juegos, cada uno con su nombre, su descripción y sus cartas de muestra, como hasta ahora. Desde ahí el jugador MUST poder abrir las opciones de un juego o volver a las familias. Al volver desde las opciones de un juego, el jugador MUST regresar a la vista de la que vino.

#### Scenario: Elegir un solitario
- **WHEN** el jugador abre la aplicación y elige la familia «Solitarios»
- **THEN** ve los 11 solitarios y, al elegir Spider, se abren las opciones de Spider

#### Scenario: Volver desde las opciones
- **WHEN** el jugador entra en «Captura», abre las opciones de la Escoba y pulsa «Volver»
- **THEN** vuelve a la lista de juegos de «Captura», no a la pantalla de familias

#### Scenario: Todos los juegos están en una familia
- **WHEN** se recorren todas las familias
- **THEN** cada juego de la suite aparece exactamente una vez
