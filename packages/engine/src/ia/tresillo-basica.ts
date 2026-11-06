import { cartaDeId, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  CONTRATOS_TRESILLO,
  esTriunfoTresillo,
  ganadoraTresillo,
  rangoTresillo,
  type AccionTresillo,
  type ContratoTresillo,
  type VistaTresillo,
} from '../juegos/tresillo';
import type { Agente } from './agente';

const PALOS: readonly PaloEspanol[] = ['oros', 'copas', 'espadas', 'bastos'];
const REY = 12;
/** Desde aquí, los matadores y el punto. */
const PUNTO = 197;

const valor = (c: IdCarta) => cartaDeId(c)!.valor;

/**
 * Bazas que espera hacer con ese triunfo (spec ia-jugadores): 1 por cada matador y por el punto;
 * 0,75 por el rey del triunfo y 0,5 por cada otro triunfo; 0,75 por cada rey de otro palo.
 */
export function bazasEsperadasTresillo(mano: readonly IdCarta[], triunfo: PaloEspanol): number {
  let total = 0;
  for (const c of mano) {
    if (esTriunfoTresillo(c, triunfo)) {
      total += rangoTresillo(c, triunfo) >= PUNTO ? 1 : valor(c) === REY ? 0.75 : 0.5;
    } else if (valor(c) === REY) total += 0.75;
  }
  return total;
}

/** El palo con el que más bazas espera (el primero si empatan). */
export function mejorTriunfoTresillo(mano: readonly IdCarta[]): PaloEspanol {
  return PALOS.reduce((mejor, p) =>
    bazasEsperadasTresillo(mano, p) > bazasEsperadasTresillo(mano, mejor) ? p : mejor,
  );
}

/** Los contratos que su mano permite pujar, de menor a mayor. */
export function contratosTresillo(mano: readonly IdCarta[]): ContratoTresillo[] {
  const mejor = bazasEsperadasTresillo(mano, mejorTriunfoTresillo(mano));
  const media = PALOS.reduce((s, p) => s + bazasEsperadasTresillo(mano, p), 0) / PALOS.length;
  const r: ContratoTresillo[] = [];
  if (mejor >= 3.5) r.push('entrada');
  if (media >= 3) r.push('vuelta');
  if (mejor >= 5.5) r.push('solo');
  return r;
}

/** Las cartas de las que se descarta: las que no son triunfo ni rey, de la más baja a la más alta. */
export function descartesTresillo(mano: readonly IdCarta[], triunfo: PaloEspanol): IdCarta[] {
  return mano
    .filter((c) => !esTriunfoTresillo(c, triunfo) && valor(c) !== REY)
    .sort((a, b) => rangoTresillo(a, triunfo) - rangoTresillo(b, triunfo));
}

/** La carta que juega entre las legales. */
export function cartaTresillo(vista: VistaTresillo, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const triunfo = vista.triunfo!;
  const fuerza = (c: IdCarta) => rangoTresillo(c, triunfo);
  const ordenadas = [...cartas].sort((a, b) => fuerza(a) - fuerza(b));
  const masBaja = ordenadas[0]!;
  const soyHombre = yo === vista.hombre;
  if (vista.mesa.length === 0) {
    if (soyHombre) {
      const triunfos = ordenadas.filter((c) => esTriunfoTresillo(c, triunfo));
      if (triunfos.length > 0) return triunfos.at(-1)!;
    }
    const reyes = ordenadas.filter((c) => !esTriunfoTresillo(c, triunfo) && valor(c) === REY);
    return reyes[0] ?? masBaja;
  }
  const ganando = ganadoraTresillo(vista.mesa, triunfo).asiento;
  // La baza ya es del otro defensor: no se gasta nada.
  if (!soyHombre && ganando !== vista.hombre) return masBaja;
  const ganadoras = ordenadas.filter(
    (c) => ganadoraTresillo([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  return ganadoras[0] ?? masBaja;
}

export function decisionTresillo(
  vista: VistaTresillo,
  acciones: readonly AccionTresillo[],
): AccionTresillo {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'subasta': {
      // El contrato más alto que permite su mano, si supera al último pujado.
      const alto = contratosTresillo(mano).at(-1);
      const supera =
        alto !== undefined &&
        (vista.pujaMayor === null ||
          CONTRATOS_TRESILLO.indexOf(alto) > CONTRATOS_TRESILLO.indexOf(vista.pujaMayor));
      return supera ? { tipo: 'pujar', contrato: alto } : { tipo: 'pasar' };
    }
    case 'triunfo':
      return { tipo: 'triunfo', palo: mejorTriunfoTresillo(mano) };
    case 'cambio': {
      const triunfo = vista.triunfo!;
      const descartes = descartesTresillo(mano, triunfo);
      const debe = !acciones.some((a) => a.tipo === 'robar');
      // En la vuelta tiene que descartarse de una: la más baja si no tiene nada flojo.
      const descarte =
        descartes[0] ??
        (debe
          ? [...mano].sort((a, b) => rangoTresillo(a, triunfo) - rangoTresillo(b, triunfo))[0]
          : undefined);
      const puede = acciones.some((a) => a.tipo === 'descartar' && a.carta === descarte);
      return descarte !== undefined && puede
        ? { tipo: 'descartar', carta: descarte }
        : { tipo: 'robar' };
    }
    case 'bazas': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugarCarta' ? [a.carta] : []));
      return { tipo: 'jugarCarta', carta: cartaTresillo(vista, cartas) };
    }
  }
}

export const iaTresilloBasica: Agente<VistaTresillo, AccionTresillo> = {
  id: 'tresillo-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionTresillo(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
