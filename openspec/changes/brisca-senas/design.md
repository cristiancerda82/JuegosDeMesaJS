## Context

La Brisca de la suite (`juegos/brisca.ts`) se juega con 2 jugadores o con 4 en parejas (asientos 0 y 2 contra 1 y 3). La vista de cada jugador solo enseña su mano; la del compañero va boca abajo.

En la mesa real, las señas son gestos: torcer la boca, guiñar un ojo, encoger los hombros… Cada pareja se los enseña antes de jugar, y los rivales intentan pillarlos. En una pantalla no hay gestos, así que la suite enseña directamente lo que el compañero le diría con ellos.

## Goals / Non-Goals

**Goals:**
- Jugar la Brisca de cuatro con señas como opción del mismo juego, en local y en red.
- Que la IA difícil aproveche las señas de su compañero.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- **Elegir qué señas se hacen y cuándo.** Las señas son automáticas y verdaderas: no se puede mentir ni callar una carta.
- **Pillar las señas del rival.** Los rivales no las ven nunca.
- **Señas para las cartas sin puntos.** Los libros solo hablan de las cartas buenas de triunfo y de no tener triunfo.

## Decisions

1. **`senas?: boolean` en `ConfigBrisca`, normalizada en `crear`.** Solo se guarda si es `true` y hay 4 jugadores: `...(config.senas === true && config.jugadores === 4 && { senas: true })`. Las partidas guardadas, que no tienen el campo, siguen igual, y la config por defecto no cambia.
   - *Alternativa descartada:* dar error con 2 jugadores. Obligaría al cliente a limpiar la casilla al cambiar de 4 a 2; ignorarla es más sencillo y no cambia nada.

2. **Las señas son una función de la vista, no estado.** `VistaBrisca` gana `senas: SenasBrisca | null`, con `SenasBrisca = { cartas: readonly IdCarta[]; sinTriunfo: boolean }`. Se calculan en `vistaDe` a partir de la mano del compañero:
   - `cartas`: las de triunfo con puntos (As, Tres, Rey, Caballo, Sota), de la más fuerte a la más débil;
   - `sinTriunfo`: si no tiene ninguna carta del palo de triunfo.

   Es `null` sin la opción, para un espectador y cuando la partida ha terminado. Al no guardarse en el estado, siempre están al día: después de robar, de cambiar la muestra y al empezar cada mano.

3. **Una función pura `senasDe(mano, triunfo)`** en `brisca.ts`, exportada, que usan la vista, la reconstrucción y los tests.

4. **La IA normal no usa las señas.** Se probaron tres reglas, cada una en 12.000 manos emparejadas (cada reparto dos veces, cambiando qué pareja tiene las señas):
   - cargar la carta de más puntos al compañero cuando juega después y tiene un triunfo que nadie supera, con el remate del compañero: −1,4 puntos por mano;
   - cargar solo figuras (Rey, Caballo, Sota): −0,1;
   - echar la carta más barata en lugar de gastar triunfo: −0,25.

   Ninguna mejora a la normal: soltar un As o un Tres propios cuesta más de lo que trae la carga, y la heurística de respuesta ya gana muchas de esas bazas. Por eso la normal decide igual con o sin señas, y las señas las aprovecha el difícil.

5. **Reconstrucción del difícil.** Con señas, la mano del compañero se reparte antes que las demás:
   - primero las cartas de sus señas (`ocultas.sacar`);
   - luego el resto, entre las ocultas que admite: ninguna carta de triunfo con puntos que no esté en las señas, y ningún triunfo si `sinTriunfo`. Es el patrón de `reconstruir/cuarenta.ts`.

   Las cartas que admite siempre bastan: el estado real es una de las reconstrucciones posibles.

   Medido en 400 manos emparejadas de difícil contra difícil, la pareja con señas saca unos 3 puntos más por mano.

6. **Cliente.** La casilla «Con señas» va en un fieldset propio de las opciones de la Brisca, desactivada con 2 jugadores. En la mesa, la barra de información añade «Señas: As, Tres» o «Señas: sin triunfo» (o «Señas: ninguna» si tiene triunfos sin puntos), con `data-testid="senas"`.

## Risks / Trade-offs

- **[Las señas hacen la partida más fácil para quien las ve]** → Es lo que pasa en la mesa real, y ambas parejas las tienen. La opción está desactivada por defecto.
- **[La IA normal no saca provecho de las señas]** → Medido y aceptado (decisión 4): es la de nivel normal, y las señas las usa el difícil.
- **[El difícil ya juega bien sin señas]** → La reconstrucción con señas solo reduce las manos posibles del compañero; no cambia el presupuesto de simulaciones ni el tiempo de decisión.
