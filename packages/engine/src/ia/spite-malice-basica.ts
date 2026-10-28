import type { IdCarta } from '../baraja/cartas';
import {
  destinosSpite,
  esReySpite,
  valorSpite,
  VALOR_FINAL,
  type AccionSpiteMalice,
  type OrigenSpite,
  type VistaSpiteMalice,
} from '../juegos/spite-malice';
import type { Agente } from './agente';

/** El valor que tendría una escalera de `n` cartas tras una más: la Q la vacía. */
const tras = (n: number) => (n + 1 === VALOR_FINAL ? 0 : n + 1);

/**
 * La primera jugada de la cadena más corta que deja una escalera lista para la carta de su
 * montón: cartas de la mano y de arriba de sus descartes, con los K solo si `conReyes`.
 */
export function cadenaSpite(vista: VistaSpiteMalice, conReyes: boolean): AccionSpiteMalice | null {
  const yo = vista.asiento!;
  const arriba = vista.montones[yo]!.arriba;
  if (arriba === null || esReySpite(arriba)) return null;
  const objetivo = valorSpite(arriba);
  let mejor: { largo: number; accion: AccionSpiteMalice } | null = null;
  const libre = vista.escaleras.findIndex((x) => x.length === 0);
  vista.escaleras.forEach((esc, i) => {
    if (esc.length === 0 && i !== libre) return;
    const desde = esc.length;
    if (desde >= objetivo - 1) return;
    const mano = [...(vista.miMano ?? [])];
    const pilas = vista.descartes[yo]!.map((p) => [...p]);
    let primera: OrigenSpite | null = null;
    for (let v = desde + 1; v < objetivo; v++) {
      let origen: OrigenSpite;
      const enMano = mano.findIndex((c) => valorSpite(c) === v);
      const enPila = pilas.findIndex((p) => p.length > 0 && valorSpite(p.at(-1)!) === v);
      const rey = conReyes ? mano.findIndex(esReySpite) : -1;
      if (enMano >= 0) {
        origen = { tipo: 'mano', carta: mano[enMano]! };
        mano.splice(enMano, 1);
      } else if (enPila >= 0) {
        origen = { tipo: 'descarte', pila: enPila };
        pilas[enPila]!.pop();
      } else if (rey >= 0) {
        origen = { tipo: 'mano', carta: mano[rey]! };
        mano.splice(rey, 1);
      } else {
        return;
      }
      primera ??= origen;
    }
    const largo = objetivo - 1 - desde;
    if (primera && (mejor === null || largo < mejor.largo)) {
      mejor = { largo, accion: { tipo: 'jugar', desde: primera, escalera: i } };
    }
  });
  return (mejor as { accion: AccionSpiteMalice } | null)?.accion ?? null;
}

/** La jugada desde el montón, si la carta va en alguna escalera (un K, en la más alta). */
function desdeMonton(vista: VistaSpiteMalice): AccionSpiteMalice | null {
  const arriba = vista.montones[vista.asiento!]!.arriba;
  if (arriba === null) return null;
  const destinos = destinosSpite(vista.escaleras, arriba);
  if (destinos.length === 0) return null;
  const escalera = [...destinos].sort(
    (a, b) => vista.escaleras[b]!.length - vista.escaleras[a]!.length,
  )[0]!;
  return { tipo: 'jugar', desde: { tipo: 'monton' }, escalera };
}

/**
 * Una carta de la mano, o de arriba de un descarte, que no sea K y no deje una escalera justo
 * antes de la del rival.
 */
function sinAyudar(vista: VistaSpiteMalice): AccionSpiteMalice | null {
  const yo = vista.asiento!;
  const delRival = vista.montones[1 - yo]!.arriba;
  const necesita = delRival === null || esReySpite(delRival) ? null : valorSpite(delRival);
  const cartas = [...new Set(vista.miMano ?? [])]
    .filter((c) => !esReySpite(c))
    .sort((a, b) => valorSpite(a) - valorSpite(b));
  const origenes: [OrigenSpite, IdCarta][] = [
    ...cartas.map((carta): [OrigenSpite, IdCarta] => [{ tipo: 'mano', carta }, carta]),
    // Después, lo de arriba de sus descartes, para que no se le acumulen.
    ...vista.descartes[yo]!.flatMap((p, pila): [OrigenSpite, IdCarta][] =>
      p.length > 0 && !esReySpite(p.at(-1)!) ? [[{ tipo: 'descarte', pila }, p.at(-1)!]] : [],
    ),
  ];
  for (const [desde, carta] of origenes) {
    for (const escalera of destinosSpite(vista.escaleras, carta)) {
      const queda = tras(vista.escaleras[escalera]!.length);
      if (necesita !== null && queda === necesita - 1) continue;
      return { tipo: 'jugar', desde, escalera };
    }
  }
  return null;
}

/** El descarte: la carta más alta sobre otra de un valor más o igual, o en un hueco. */
export function descarteSpite(vista: VistaSpiteMalice): AccionSpiteMalice {
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];
  const sinReyes = mano.filter((c) => !esReySpite(c));
  const cartas = [...new Set(sinReyes.length > 0 ? sinReyes : mano)].sort(
    (a, b) => valorSpite(b) - valorSpite(a),
  );
  const pilas = vista.descartes[yo]!;
  for (const carta of cartas) {
    const v = valorSpite(carta);
    const sobre = pilas.findIndex((p) => p.length > 0 && valorSpite(p.at(-1)!) === v + 1);
    if (sobre >= 0) return { tipo: 'descartar', carta, pila: sobre };
    const igual = pilas.findIndex((p) => p.length > 0 && valorSpite(p.at(-1)!) === v);
    if (igual >= 0) return { tipo: 'descartar', carta, pila: igual };
  }
  const carta = cartas[0]!;
  const hueco = pilas.findIndex((p) => p.length === 0);
  if (hueco >= 0) return { tipo: 'descartar', carta, pila: hueco };
  const alta = pilas
    .map((p, i) => [i, valorSpite(p.at(-1)!)] as const)
    .sort((a, b) => b[1] - a[1])[0]![0];
  return { tipo: 'descartar', carta, pila: alta };
}

/** Lo que haría la IA básica con esta vista. */
export function decisionSpite(vista: VistaSpiteMalice): AccionSpiteMalice | null {
  return (
    desdeMonton(vista) ??
    cadenaSpite(vista, false) ??
    cadenaSpite(vista, true) ??
    sinAyudar(vista) ??
    ((vista.miMano ?? []).length > 0 ? descarteSpite(vista) : null)
  );
}

/**
 * IA básica del Spite and Malice (spec ia-jugadores): juega su montón en cuanto puede, busca
 * cadenas hasta él, no deja escaleras al rival y descarta en escalera descendente. Es
 * determinista: no usa el azar que recibe.
 */
export const iaSpiteMaliceBasica: Agente<VistaSpiteMalice, AccionSpiteMalice> = {
  id: 'spite-malice-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionSpite(vista);
    const legal = accion && acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
