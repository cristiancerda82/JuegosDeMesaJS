import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  BARAJA_FIVE_HUNDRED,
  COMODIN_FIVE_HUNDRED,
  esMisere,
  ganadoraFiveHundred,
  ordenPujaFiveHundred,
  paloEfectivo,
  PALOS_PUJA_FIVE_HUNDRED,
  rangoFiveHundred,
  triunfoDe,
  type AccionFiveHundred,
  type PaloPujaFiveHundred,
  type PujaFiveHundred,
  type VistaFiveHundred,
} from '../juegos/five-hundred';
import type { Agente } from './agente';

const esComodin = (c: IdCarta) => c === COMODIN_FIVE_HUNDRED;
const valorNatural = (c: IdCarta) => {
  if (esComodin(c)) return 15;
  const v = Number(c.split('-')[1]);
  return v === 1 ? 14 : v;
};

/** Bazas que estima ganar su pareja con un contrato (spec ia-jugadores). */
export function bazasEstimadasFiveHundred(
  mano: readonly IdCarta[],
  palo: PaloPujaFiveHundred,
): number {
  const compañero = 1.5;
  if (palo === 'sin') {
    return (
      mano.reduce(
        (s, c) =>
          s + (esComodin(c) ? 1 : valorNatural(c) === 14 ? 1 : valorNatural(c) === 13 ? 0.5 : 0),
        0,
      ) + compañero
    );
  }
  let bazas = compañero;
  for (const c of mano) {
    const efectivo = paloEfectivo(c, palo);
    if (efectivo === palo) {
      const r = rangoFiveHundred(c, palo);
      bazas += r >= 80 || valorNatural(c) === 14 ? 1 : 0.5;
    } else if (valorNatural(c) === 14) {
      bazas += 1;
    }
  }
  return bazas;
}

function pujaFiveHundred(vista: VistaFiveHundred): AccionFiveHundred {
  const mano = vista.miMano ?? [];
  const minimo = vista.mejor === null ? -1 : ordenPujaFiveHundred(vista.mejor.puja);
  const misere: PujaFiveHundred = { tipo: 'misere' };
  const altas = mano.filter((c) => !esComodin(c) && valorNatural(c) >= 11).length;
  if (!mano.includes(COMODIN_FIVE_HUNDRED) && altas <= 1 && ordenPujaFiveHundred(misere) > minimo) {
    return { tipo: 'pujar', puja: misere };
  }
  const estimadas = (p: PaloPujaFiveHundred) => bazasEstimadasFiveHundred(mano, p);
  const palo = [...PALOS_PUJA_FIVE_HUNDRED].sort(
    (a, b) =>
      estimadas(b) - estimadas(a) ||
      PALOS_PUJA_FIVE_HUNDRED.indexOf(b) - PALOS_PUJA_FIVE_HUNDRED.indexOf(a),
  )[0]!;
  const tope = Math.min(10, Math.floor(estimadas(palo)));
  for (let bazas = 6; bazas <= tope; bazas++) {
    const puja: PujaFiveHundred = { tipo: 'bazas', bazas, palo };
    if (ordenPujaFiveHundred(puja) > minimo) return { tipo: 'pujar', puja };
  }
  return { tipo: 'pasar' };
}

function descarteFiveHundred(vista: VistaFiveHundred): IdCarta {
  const mano = vista.miMano ?? [];
  const puja = vista.mejor!.puja;
  // En el misère se descarta de las más altas.
  if (esMisere(puja)) return [...mano].sort((a, b) => valorNatural(b) - valorNatural(a))[0]!;
  const triunfo = triunfoDe(puja);
  const noTriunfo = mano.filter((c) => !esComodin(c) && paloEfectivo(c, triunfo) !== triunfo);
  const candidatas = noTriunfo.length > 0 ? noTriunfo : mano;
  const largo = (c: IdCarta) =>
    candidatas.filter((x) => paloEfectivo(x, triunfo) === paloEfectivo(c, triunfo)).length;
  return [...candidatas].sort(
    (a, b) => largo(a) - largo(b) || valorNatural(a) - valorNatural(b) || a.localeCompare(b),
  )[0]!;
}

/** La carta (y el palo, si sale con el comodín sin triunfo) que juega en una baza. */
export function jugadaFiveHundred(
  vista: VistaFiveHundred,
  acciones: readonly AccionFiveHundred[],
): AccionFiveHundred {
  const jugadas = acciones.filter(
    (a): a is AccionFiveHundred & { tipo: 'jugar' } => a.tipo === 'jugar',
  );
  const cartas = [...new Set(jugadas.map((a) => a.carta))];
  const puja = vista.mejor!.puja;
  const triunfo = triunfoDe(puja);
  const yo = vista.asiento!;
  const mesa = vista.mesa;
  const mano = vista.miMano ?? [];
  const fuerza = (c: IdCarta) =>
    esComodin(c)
      ? 1000
      : (paloEfectivo(c, triunfo) === triunfo && triunfo !== null ? 500 : 0) +
        rangoFiveHundred(c, triunfo);
  const masBaja = (cs: readonly IdCarta[]) =>
    [...cs].sort((a, b) => fuerza(a) - fuerza(b) || a.localeCompare(b))[0]!;
  const gana = (c: IdCarta) =>
    ganadoraFiveHundred(
      [...mesa, { asiento: yo, carta: c }],
      triunfo,
      vista.paloNombrado ?? 'picas',
    ).asiento === yo;

  const accionDe = (carta: IdCarta): AccionFiveHundred => {
    const conPalo = jugadas.filter((a) => a.carta === carta);
    if (conPalo.length <= 1) return conPalo[0] ?? { tipo: 'jugar', carta };
    // Sale con el comodín sin triunfo: nombra su palo más largo.
    const largo = (p: PaloFrances) =>
      mano.filter((c) => !esComodin(c) && paloEfectivo(c, triunfo) === p).length;
    const palo = [...PALOS_FRANCESES].sort((a, b) => largo(b) - largo(a))[0]!;
    return { tipo: 'jugar', carta, palo };
  };

  if (esMisere(puja)) {
    if (yo !== vista.mejor!.asiento || mesa.length === 0) return accionDe(masBaja(cartas));
    const pierden = cartas.filter((c) => !gana(c));
    return accionDe(
      pierden.length > 0 ? [...pierden].sort((a, b) => fuerza(b) - fuerza(a))[0]! : masBaja(cartas),
    );
  }

  if (mesa.length === 0) {
    // La carta más alta que queda de su palo (efectivo), si es suya.
    const fuera = new Set(vista.jugadasPor.flat());
    const quedan = BARAJA_FIVE_HUNDRED.filter((c) => !fuera.has(c));
    const altas = cartas.filter((c) =>
      quedan.every(
        (x) => paloEfectivo(x, triunfo) !== paloEfectivo(c, triunfo) || fuerza(x) <= fuerza(c),
      ),
    );
    if (altas.length > 0) return accionDe([...altas].sort((a, b) => fuerza(b) - fuerza(a))[0]!);
    const noTriunfo = cartas.filter((c) => !esComodin(c) && paloEfectivo(c, triunfo) !== triunfo);
    if (noTriunfo.length === 0) return accionDe(masBaja(cartas));
    const largo = (c: IdCarta) =>
      noTriunfo.filter((x) => paloEfectivo(x, triunfo) === paloEfectivo(c, triunfo)).length;
    const maximo = Math.max(...noTriunfo.map(largo));
    return accionDe(masBaja(noTriunfo.filter((c) => largo(c) === maximo)));
  }

  const ganaAhora = ganadoraFiveHundred(mesa, triunfo, vista.paloNombrado).asiento;
  if (ganaAhora === (yo + 2) % 4) return accionDe(masBaja(cartas));
  const ganadoras = cartas.filter(gana);
  return accionDe(ganadoras.length > 0 ? masBaja(ganadoras) : masBaja(cartas));
}

export const iaFiveHundredBasica: Agente<VistaFiveHundred, AccionFiveHundred> = {
  id: 'five-hundred-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'subasta') return { accion: pujaFiveHundred(vista), azar };
    if (vista.fase === 'descarte') {
      return { accion: { tipo: 'descartar', carta: descarteFiveHundred(vista) }, azar };
    }
    return { accion: jugadaFiveHundred(vista, acciones), azar };
  },
};
