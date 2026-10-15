## 1. Mecanismos genéricos (engine)

- [x] 1.1 Crear `ia/niveles.ts`: `NivelIA`, `NIVELES_IA`, `conErrores` y `porSimulacion` con `Simulable`; tests con el juego de juguete (errores al azar, empates a favor de la normal, una sola acción legal, reproducibilidad)
- [x] 1.2 Crear el test genérico `verificarReconstruccion` (misma vista, mismas acciones legales y estado jugable hasta el final)

## 2. Reconstrucción y nivel difícil por juego (engine)

- [x] 2.1 Brisca: `reconstruirBrisca`, valoración, difícil y tests
- [x] 2.2 Tute: `reconstruirTute`, valoración, difícil y tests
- [x] 2.3 Guiñote: `reconstruirGuinote`, valoración, difícil y tests
- [x] 2.4 Escoba: `reconstruirEscoba`, valoración, difícil y tests
- [x] 2.5 Chinchón: `reconstruirChinchon`, valoración, difícil y tests
- [x] 2.6 Siete y media: `reconstruirSieteYMedia`, valoración, difícil y tests
- [x] 2.7 Cinquillo: `reconstruirCinquillo`, valoración, difícil y tests
- [x] 2.8 Pocha: `reconstruirPocha`, valoración, difícil y tests
- [x] 2.9 Mus: `reconstruirMus`, valoración, difícil y tests
- [x] 2.10 Corazones: `reconstruirCorazones`, valoración, difícil y tests

## 3. Registro y garantías (engine)

- [x] 3.1 Crear `ia/ias.ts` con los tres niveles de los 11 juegos (Burro: fácil con errores al pasar; difícil igual que la normal) y exportarlo
- [x] 3.2 Tests de todos los niveles: partidas completas mezclando niveles, reproducibilidad y tiempo por debajo de 250 ms en escritorio; normal contra fácil en los 11 juegos
- [ ] 3.3 Tests de fuerza difícil contra normal (`FUERZA=1`) en los 10 juegos con simulación; ajustar valoraciones o reconstrucciones hasta que se cumplan

## 4. Cliente

- [x] 4.1 `DefJuego.ia` por nivel, `Sesion` con nivel (nueva, guardado y revancha), `Guardado` con `nivel` opcional y retrasos del Burro por nivel
- [x] 4.2 Selector «Nivel de la IA» en las opciones de los juegos contra la máquina, recordado por juego, con sus textos en español

## 5. Verificación

- [x] 5.1 E2E: elegir Difícil en la Brisca y jugar una partida completa; el nivel se recuerda en las opciones; los solitarios no muestran el selector
- [x] 5.2 E2E: retomar una partida guardada en Difícil mantiene el nivel
- [ ] 5.3 Ejecutar todos los tests (motor con `FUERZA=1`, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
