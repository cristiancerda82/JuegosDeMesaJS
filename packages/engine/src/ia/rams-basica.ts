import { cartaDeId, type IdCarta } from '../baraja/cartas';
import {
  ganadoraRams,
  paloRams,
  VALORES_RAMS,
  type AccionRams,
  type VistaRams,
} from '../juegos/rams';
import { fuerza } from '../motor/bazas';
import type { Agente } from './agente';

const AS = 1;
const REY = 13;
const DAMA = 12;
/** Bazas que hay que esperar para jugar la mano. */
const PARA_JUGAR = 1;
/** Con pocas fichas, basta con esperar media baza. */
const PARA_JUGAR_AL_FINAL = 0.5;
const POCAS_FICHAS = 2;
/** Con una mano que espera menos que esto, mejor la niña. */
const PARA_NINA = 0.3;

const valorDe = (c: IdCarta) => cartaDeId(c)!.valor;
const fuerzaRams = (c: IdCarta) => fuerza(c, VALORES_RAMS);

/** Las bazas que promete una mano con este triunfo. */
export function bazasEsperadasRams(mano: readonly IdCarta[], triunfo: string): number {
  let bazas = 0;
  const triunfos = mano.filter((c) => paloRams(c) === triunfo);
  for (const c of mano) {
    const v = valorDe(c);
    const delPalo = mano.filter((x) => paloRams(x) === paloRams(c)).length;
    if (v === AS) bazas += 1;
    else if (paloRams(c) === triunfo) bazas += v === REY ? 0.8 : v === DAMA ? 0.5 : 0;
    else if (v === REY && delPalo >= 2) bazas += 0.5;
  }
  return bazas + Math.max(0, triunfos.length - 2) * 0.5;
}

/** La carta más barata de una lista: la más débil, y entre iguales, la que no es triunfo. */
const masBarata = (cartas: readonly IdCarta[], triunfo: string) =>
  [...cartas].sort(
    (a, b) =>
      fuerzaRams(a) +
      (paloRams(a) === triunfo ? 10 : 0) -
      (fuerzaRams(b) + (paloRams(b) === triunfo ? 10 : 0)),
  )[0]!;

/**
 * IA básica del Rams: habla según las bazas que espera, coge la niña con una mano sin bazas,
 * descarta la carta más baja que no es triunfo y gana las bazas con la carta más barata que
 * las gane. Es determinista: no usa el azar que recibe.
 */
export const iaRamsBasica: Agente<VistaRams, AccionRams> = {
  id: 'rams-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(vista: VistaRams, acciones: readonly AccionRams[]): AccionRams {
  const mano = vista.miMano ?? [];
  const yo = vista.asiento!;
  const t = vista.triunfo;
  if (vista.fase === 'hablar') {
    const esperadas = bazasEsperadasRams(mano, t);
    const pocas = (vista.fichas[yo] ?? 0) <= POCAS_FICHAS;
    if (esperadas < PARA_NINA && acciones.some((a) => a.tipo === 'nina')) return { tipo: 'nina' };
    const umbral = pocas ? PARA_JUGAR_AL_FINAL : PARA_JUGAR;
    return { tipo: esperadas >= umbral ? 'rams' : 'paso' };
  }
  const cartas = acciones.flatMap((a) => ('carta' in a ? [a.carta] : []));
  if (vista.fase === 'descartar') {
    const noTriunfos = cartas.filter((c) => paloRams(c) !== t);
    return { tipo: 'descartar', carta: masBarata(noTriunfos.length > 0 ? noTriunfos : cartas, t) };
  }
  if (vista.mesa.length === 0) {
    // Al salir: los Ases primero, luego el triunfo más alto; si no, la carta más baja.
    const ases = cartas.filter((c) => valorDe(c) === AS && paloRams(c) !== t);
    if (ases.length > 0) return { tipo: 'jugar', carta: ases[0]! };
    const triunfos = cartas
      .filter((c) => paloRams(c) === t)
      .sort((a, b) => fuerzaRams(b) - fuerzaRams(a));
    if (triunfos.length > 0 && valorDe(triunfos[0]!) === AS) {
      return { tipo: 'jugar', carta: triunfos[0]! };
    }
    return { tipo: 'jugar', carta: masBarata(cartas, t) };
  }
  const ganadoras = cartas.filter(
    (c) => ganadoraRams([...vista.mesa, { asiento: yo, carta: c }], t).asiento === yo,
  );
  if (ganadoras.length === 0) return { tipo: 'jugar', carta: masBarata(cartas, t) };
  const enLaBaza = vista.dichos.filter((d) => d === 'rams' || d === 'nina').length;
  const ultimo = vista.mesa.length === enLaBaza - 1;
  // Siendo el último, la más barata que gana; si no, la más fuerte, para que aguante.
  if (ultimo) return { tipo: 'jugar', carta: masBarata(ganadoras, t) };
  return {
    tipo: 'jugar',
    carta: [...ganadoras].sort(
      (a, b) =>
        fuerzaRams(b) +
        (paloRams(b) === t ? 10 : 0) -
        (fuerzaRams(a) + (paloRams(a) === t ? 10 : 0)),
    )[0]!,
  };
}
