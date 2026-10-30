import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  ganadoraSueca,
  paloSueca,
  puntosCartaSueca,
  rangoSueca,
  type AccionSueca,
  type VistaSueca,
} from '../juegos/sueca';
import type { Agente } from './agente';

/** De menos a más valiosa: los triunfos al final; dentro, por puntos y por rango. */
const pesoEn = (triunfo: PaloFrances) => (c: IdCarta) =>
  (paloSueca(c) === triunfo ? 1000 : 0) + 10 * puntosCartaSueca(c) + rangoSueca(c);

/** La carta que juega la IA básica entre las legales (spec ia-jugadores). */
export function cartaSueca(vista: VistaSueca, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const triunfo = vista.triunfo;
  const peso = pesoEn(triunfo);
  const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
  const noTriunfo = cartas.filter((c) => paloSueca(c) !== triunfo);
  const yo = vista.asiento!;
  const mesa = vista.mesa;

  if (mesa.length === 0) {
    const as = noTriunfo.find((c) => rangoSueca(c) === 10);
    if (as) return as;
    if (noTriunfo.length === 0) return masBaja(cartas);
    const largo = (c: IdCarta) => noTriunfo.filter((x) => paloSueca(x) === paloSueca(c)).length;
    const maximo = Math.max(...noTriunfo.map(largo));
    return masBaja(noTriunfo.filter((c) => largo(c) === maximo));
  }

  const ganaAhora = ganadoraSueca(mesa, triunfo).asiento;
  if (ganaAhora === (yo + 2) % 4) {
    // Va ganando el compañero: le carga la que más puntos vale, sin gastar un triunfo.
    if (noTriunfo.length > 0) {
      return [...noTriunfo].sort(
        (a, b) => puntosCartaSueca(b) - puntosCartaSueca(a) || rangoSueca(a) - rangoSueca(b),
      )[0]!;
    }
    return masBaja(cartas);
  }
  const vale = mesa.reduce((s, j) => s + puntosCartaSueca(j.carta), 0);
  const ultimo = mesa.length === 3;
  const ganadoras = cartas.filter(
    (c) => ganadoraSueca([...mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  if ((vale >= 10 || ultimo) && ganadoras.length > 0) {
    return [...ganadoras].sort((a, b) => peso(a) - peso(b))[0]!;
  }
  return masBaja(noTriunfo.length > 0 ? noTriunfo : cartas);
}

export const iaSuecaBasica: Agente<VistaSueca, AccionSueca> = {
  id: 'sueca-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const carta = cartaSueca(
      vista,
      acciones.map((a) => a.carta),
    );
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
