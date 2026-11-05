import { cartaDeId, type IdCarta } from '../baraja/cartas';
import {
  deMatrimonioTysiacha,
  ganadoraTysiacha,
  MATRIMONIO_TYSIACHA,
  matrimoniosEnManoTysiacha,
  PALOS_TYSIACHA,
  paloTysiacha,
  rangoTysiacha,
  type AccionTysiacha,
  type VistaTysiacha,
} from '../juegos/tysiacha';
import type { Agente } from './agente';

const AS = 1;
const DIEZ = 10;
/** Lo que se espera ganar con el prikup, al pujar. */
export const BONO_PRIKUP_TYSIACHA = 20;

const valor = (c: IdCarta) => cartaDeId(c)!.valor;

/**
 * Valor de la mano (spec ia-jugadores): 11 por As; 10 por cada 10 con el As de su palo o con dos
 * cartas más de su palo; lo que valen sus matrimonios. Sin el bono del prikup.
 */
export function valorManoTysiacha(mano: readonly IdCarta[]): number {
  let total = 0;
  for (const palo of PALOS_TYSIACHA) {
    const cartas = mano.filter((c) => paloTysiacha(c) === palo);
    const as = cartas.some((c) => valor(c) === AS);
    if (as) total += 11;
    if (cartas.some((c) => valor(c) === DIEZ) && (as || cartas.length >= 3)) total += 10;
  }
  for (const palo of matrimoniosEnManoTysiacha(mano)) total += MATRIMONIO_TYSIACHA[palo];
  return total;
}

const masBajaPrimero = (a: IdCarta, b: IdCarta) => rangoTysiacha(a) - rangoTysiacha(b);

/** La carta que da a un rival: la más baja que no sea de un matrimonio ni un As. */
function cartaQueDa(mano: readonly IdCarta[]): IdCarta {
  const flojas = mano.filter((c) => valor(c) !== AS && !deMatrimonioTysiacha(mano, c));
  return [...(flojas.length > 0 ? flojas : mano)].sort(masBajaPrimero)[0]!;
}

/** La carta que juega entre las legales. */
export function cartaTysiacha(vista: VistaTysiacha, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];
  const triunfo = vista.triunfo;
  const fuerza = (c: IdCarta) => (paloTysiacha(c) === triunfo ? 100 : 0) + rangoTysiacha(c);
  const porFuerza = (a: IdCarta, b: IdCarta) => fuerza(a) - fuerza(b);
  const sueltas = cartas.filter((c) => !deMatrimonioTysiacha(mano, c));
  const masBaja = [...(sueltas.length > 0 ? sueltas : cartas)].sort(porFuerza)[0]!;

  if (vista.mesa.length === 0) {
    // Cantar el matrimonio que más vale, saliendo con la Q.
    const cantables = cartas
      .filter(
        (c) => valor(c) === 12 && vista.bazasGanadas[yo]! > 0 && deMatrimonioTysiacha(mano, c),
      )
      .sort((a, b) => MATRIMONIO_TYSIACHA[paloTysiacha(b)] - MATRIMONIO_TYSIACHA[paloTysiacha(a)]);
    if (cantables.length > 0) return cantables[0]!;
    const ases = cartas.filter((c) => valor(c) === AS);
    if (ases.length > 0) return ases[0]!;
    const jugadas = new Set(vista.jugadasPor.flat());
    const dieces = cartas.filter(
      (c) => valor(c) === DIEZ && jugadas.has(`${paloTysiacha(c)}-1` as IdCarta),
    );
    if (dieces.length > 0) return dieces[0]!;
    const largo = (c: IdCarta) => mano.filter((x) => paloTysiacha(x) === paloTysiacha(c)).length;
    const candidatas = sueltas.length > 0 ? sueltas : cartas;
    return [...candidatas].sort((a, b) => largo(b) - largo(a) || porFuerza(a, b))[0]!;
  }
  const gana = (c: IdCarta) =>
    ganadoraTysiacha([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo;
  const ganadoras = cartas.filter(gana).sort(porFuerza);
  return ganadoras[0] ?? masBaja;
}

export function decisionTysiacha(
  vista: VistaTysiacha,
  acciones: readonly AccionTysiacha[],
): AccionTysiacha {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'subasta': {
      const puede = acciones.some((a) => a.tipo === 'pujar');
      const espera = valorManoTysiacha(mano) + BONO_PRIKUP_TYSIACHA;
      return puede && vista.puja + 5 <= espera ? { tipo: 'pujar' } : { tipo: 'pasar' };
    }
    case 'dar':
      return { tipo: 'dar', carta: cartaQueDa(mano) };
    case 'contrato': {
      const valores = acciones.flatMap((a) => (a.tipo === 'fijar' ? [a.valor] : []));
      const objetivo = Math.floor(valorManoTysiacha(mano) / 5) * 5;
      const elegido = valores.filter((v) => v <= Math.max(objetivo, valores[0]!)).at(-1)!;
      return { tipo: 'fijar', valor: elegido };
    }
    case 'bazas': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
      return { tipo: 'jugar', carta: cartaTysiacha(vista, cartas) };
    }
  }
}

export const iaTysiachaBasica: Agente<VistaTysiacha, AccionTysiacha> = {
  id: 'tysiacha-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionTysiacha(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
