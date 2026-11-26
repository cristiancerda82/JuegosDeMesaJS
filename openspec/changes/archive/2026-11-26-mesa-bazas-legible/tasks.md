## 1. Mesa de bazas para 7

- [x] 1.1 Añadir los lados `arriba-centro-derecha` y `arriba-centro-izquierda` y el reparto de 7 en `lado()`, con un test unitario de 2 a 7 jugadores
- [x] 1.2 Colocar las cartas de la baza de 7 en anillo en `Tapete.svelte`, y ajustar los laterales y los dorsos de arriba para que el centro quepa

## 2. Quién echó cada carta

- [x] 2.1 Poner el nombre en todas las cartas de la baza con 3 o más jugadores, abreviado a «R3» con 5 o más
- [x] 2.2 Añadir «Ver baza» con su panel en `MesaBazas.svelte`

## 3. Verificación

- [x] 3.1 E2E `mesa-bazas-solapes.spec.ts`: nada se pisa con el máximo de jugadores de cada juego, en mitad de una baza de 7, en 412 × 915 con las apuestas hechas, y el panel de «Ver baza»
- [x] 3.2 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
