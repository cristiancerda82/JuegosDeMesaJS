## Why

Con 7 jugadores en el Oh Hell, la mesa de bazas se rompe en el móvil (capturas del usuario):
- **Rivales sin sitio:** la mesa común solo tenía sitios para 6, así que los rivales 4, 5 y 6 iban a parar debajo de la mano del jugador y se pisaban entre sí.
- **Cartas amontonadas:** sus cartas de la baza se amontonaban en el centro, sin saber quién había echado cada una.
- **Rivales de los lados:** con 5 o más, el centro no cabía y los rivales de los lados tapaban la mesa y el mazo.
- **Autores:** solo la última carta llevaba el nombre de quien la echó.
- **Ninguna prueba lo vio:** las pruebas solo comprobaban que no hubiera scroll horizontal.

## What Changes

- **Mesa de bazas para 7:**
  - derecha, cuatro rivales arriba e izquierda;
  - con 7, las cartas de la baza van en anillo y en tres filas, cada una hacia su jugador;
  - con 5 o más, los rivales de los lados son más estrechos y, con 7, los dorsos de arriba más pequeños.
- **Autor en todas las cartas:** con 3 o más jugadores, cada carta de la baza lleva el nombre de quien la echó; la última sigue resaltada. Con 5 o más, «Rival 3» se abrevia «R3» en la carta para que se lea.
- **«Ver baza»:** mientras haya cartas en la mesa, un botón abre un panel con la baza en curso, en orden y en grande, con el nombre de quien echó cada carta. «Última baza» sigue igual una vez recogida.
- **Pruebas:**
  - un E2E mide las cajas de la mesa con el máximo de jugadores de cada juego de bazas, a 360 px, en escritorio y en un móvil de 412 × 915 con las apuestas hechas, y falla si algo se pisa o si un rival queda debajo del jugador;
  - un test unitario comprueba que cada asiento tiene su lado, de 2 a 7 jugadores.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mesa-cliente`: la mesa de bazas sin solapes con hasta 7 jugadores, el autor en cada carta de la baza y «Ver baza».

## Impact

- `packages/client`:
  - en `mesas/bazas/`: `asientos.ts` (los lados con 7), `Tapete.svelte` (el anillo de 7 y los nombres), `AsientoRival.svelte` y `MesaBazas.svelte` (los tamaños, «Ver baza» y su panel);
  - los textos;
  - un test unitario y un E2E nuevos.
- Afecta a todos los juegos que usan la mesa de bazas común (más de 40), sin cambiar sus reglas ni sus vistas.
