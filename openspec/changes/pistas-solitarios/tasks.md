## 1. Pistas (engine)

- [x] 1.1 Crear `ia/pistas.ts` con `pistaKlondike`, su puntuación y respaldo, y `atascado`; tests de los escenarios del Klondike
- [x] 1.2 Añadir `pistaFreeCell` con sus tests (fundación, celda útil, sin ida y vuelta, atasco con celdas llenas)
- [x] 1.3 Añadir `pistaSpider` con sus tests (mismo palo, descubrir, repartir de respaldo)
- [x] 1.4 Test de propiedades: en partidas al azar de los tres solitarios, la pista es siempre una acción legal o `null`, nunca deshacer, abandonar ni autocompletar, y tarda menos de 50 ms

## 2. Cliente

- [x] 2.1 `DefJuego.pista` opcional para los tres solitarios; `Sesion.pedirPista` y `pistas`, guardadas con la partida
- [x] 2.2 Botón «Pista» y resaltado temporal de origen y destino (o del mazo) en las tres mesas; aviso cuando no hay pista útil
- [x] 2.3 Aviso de atasco con Deshacer y Abandonar en las tres mesas
- [x] 2.4 «Pistas usadas» en la pantalla de fin de los solitarios, y los textos en español

## 3. Verificación

- [x] 3.1 E2E: pedir una pista en el Klondike resalta un movimiento legal sin cambiar la partida, y el fin muestra las pistas usadas
- [x] 3.2 E2E: el aviso de atasco aparece en una posición sin movimientos y deja deshacer
- [ ] 3.3 Ejecutar todos los tests (motor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
