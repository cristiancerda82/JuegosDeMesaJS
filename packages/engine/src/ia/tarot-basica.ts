import { esExcusa, esTriunfoTarot, numeroTriunfo, type IdCarta } from '../baraja/cartas';
import {
  CONTRATOS_TAROT,
  fuerzaTarot,
  ganadoraTarot,
  mediosTarot,
  paloTarot,
  PETIT,
  VEINTIUNO,
  type AccionTarot,
  type ContratoTarot,
  type VistaTarot,
} from '../juegos/tarot';
import type { Agente } from './agente';

/** Umbrales de cada contrato con 4 jugadores. */
const UMBRALES: Readonly<Record<ContratoTarot, number>> = {
  petite: 40,
  garde: 56,
  gardeSans: 71,
  gardeContre: 81,
};
const FACTOR: Readonly<Record<number, number>> = { 3: 1.25, 4: 1, 5: 0.85 };

/** Lo que vale una mano para pujar. */
export function valorManoTarot(mano: readonly IdCarta[]): number {
  const triunfos = mano.filter(esTriunfoTarot);
  let v = 0;
  for (const c of mano) {
    if (c === VEINTIUNO) v += 10;
    else if (esExcusa(c)) v += 8;
    else if (c === PETIT) v += triunfos.length >= 5 ? 8 : 5;
    else if (esTriunfoTarot(c)) v += numeroTriunfo(c) >= 16 ? 3 : 2;
    else v += ({ 13: 6, 12: 3, 14: 2 } as Record<number, number>)[Number(c.split('-')[1])] ?? 0;
  }
  return v;
}

/** Cuántas cartas tiene de cada palo francés. */
const largoPalo = (mano: readonly IdCarta[], c: IdCarta) =>
  mano.filter((x) => paloTarot(x) === paloTarot(c)).length;

const porValor = (a: IdCarta, b: IdCarta) =>
  mediosTarot(a) - mediosTarot(b) || fuerzaTarot(a) - fuerzaTarot(b);

function pujaTarot(vista: VistaTarot, acciones: readonly AccionTarot[]): AccionTarot {
  const valor = valorManoTarot(vista.miMano ?? []);
  const factor = FACTOR[vista.config.jugadores]!;
  const posibles = acciones.flatMap((a) => (a.tipo === 'pujar' ? [a.contrato] : []));
  const quiere = [...CONTRATOS_TAROT]
    .reverse()
    .find((c) => posibles.includes(c) && valor >= UMBRALES[c] * factor);
  return quiere ? { tipo: 'pujar', contrato: quiere } : { tipo: 'pasar' };
}

function llamadaTarot(mano: readonly IdCarta[], cartas: readonly IdCarta[]): IdCarta {
  const largo = (c: IdCarta) => mano.filter((x) => paloTarot(x) === paloTarot(c)).length;
  return [...cartas].sort((a, b) => largo(b) - largo(a) || a.localeCompare(b))[0]!;
}

function descarteTarot(mano: readonly IdCarta[], cartas: readonly IdCarta[]): IdCarta {
  const normales = cartas.filter((c) => !esTriunfoTarot(c));
  if (normales.length === 0) return [...cartas].sort((a, b) => fuerzaTarot(a) - fuerzaTarot(b))[0]!;
  return normales.sort((a, b) => largoPalo(mano, a) - largoPalo(mano, b) || porValor(b, a))[0]!;
}

/** La carta que juega entre las legales. */
export function cartaTarot(vista: VistaTarot, cartas: readonly IdCarta[]): IdCarta {
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];
  const excusa = cartas.find(esExcusa);
  const sinExcusa = cartas.filter((c) => !esExcusa(c));
  if (excusa && (mano.length <= 2 || sinExcusa.length === 0)) return excusa;

  /** La más baja, guardando el Petit si hay otro triunfo. */
  const masBaja = (cs: readonly IdCarta[]) => {
    const sinPetit = cs.filter((c) => c !== PETIT);
    return [...(sinPetit.length > 0 ? sinPetit : cs)].sort(porValor)[0]!;
  };

  if (vista.mesa.length === 0) {
    const salidos = new Set(
      vista.bazas.map((b) =>
        paloTarot(b.cartas.find((j) => !esExcusa(j.carta))?.carta ?? b.cartas[0]!.carta),
      ),
    );
    const rey = sinExcusa.find(
      (c) => !esTriunfoTarot(c) && c.endsWith('-13') && !salidos.has(paloTarot(c)),
    );
    if (rey) return rey;
    const palos = sinExcusa.filter((c) => !esTriunfoTarot(c));
    if (palos.length > 0) {
      const largo = Math.max(...palos.map((c) => largoPalo(mano, c)));
      return masBaja(palos.filter((c) => largoPalo(mano, c) === largo));
    }
    return masBaja(sinExcusa.length > 0 ? sinExcusa : cartas);
  }

  const gana = ganadoraTarot(vista.mesa);
  const mio = vista.bandos[yo];
  if (
    mio !== null &&
    mio !== undefined &&
    gana.asiento !== yo &&
    vista.bandos[gana.asiento] === mio
  ) {
    // Va ganando su bando: le carga la que más vale, sin gastar el Petit ni el 21.
    const cargables = sinExcusa.filter((c) => c !== PETIT && c !== VEINTIUNO);
    if (cargables.length > 0) return [...cargables].sort((a, b) => porValor(b, a))[0]!;
  }
  const vale = vista.mesa.reduce((s, j) => s + mediosTarot(j.carta), 0);
  const ultimo = vista.mesa.length === vista.config.jugadores - 1;
  const ganadoras = sinExcusa.filter(
    (c) => ganadoraTarot([...vista.mesa, { asiento: yo, carta: c }]).asiento === yo,
  );
  if ((vale >= 4 || ultimo) && ganadoras.length > 0) {
    return [...ganadoras].sort((a, b) => fuerzaTarot(a) - fuerzaTarot(b))[0]!;
  }
  if (sinExcusa.length === 0) return excusa!;
  const baja = masBaja(sinExcusa);
  // La Excusa salva una carta que vale si se va a perder.
  if (excusa && mediosTarot(baja) >= 5) return excusa;
  return baja;
}

export function decisionTarot(vista: VistaTarot, acciones: readonly AccionTarot[]): AccionTarot {
  const mano = vista.miMano ?? [];
  const de = <T extends AccionTarot['tipo']>(tipo: T) =>
    acciones.filter((a): a is Extract<AccionTarot, { tipo: T }> => a.tipo === tipo);
  switch (vista.fase) {
    case 'subasta':
      return pujaTarot(vista, acciones);
    case 'llamada':
      return {
        tipo: 'llamar',
        carta: llamadaTarot(
          mano,
          de('llamar').map((a) => a.carta),
        ),
      };
    case 'descarte':
      return {
        tipo: 'descartar',
        carta: descarteTarot(
          mano,
          de('descartar').map((a) => a.carta),
        ),
      };
    case 'bazas': {
      const poignees = de('poignee');
      if (poignees.length > 0 && vista.preneur === vista.asiento) return poignees.at(-1)!;
      return {
        tipo: 'jugar',
        carta: cartaTarot(
          vista,
          de('jugar').map((a) => a.carta),
        ),
      };
    }
  }
}

export const iaTarotBasica: Agente<VistaTarot, AccionTarot> = {
  id: 'tarot-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionTarot(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
