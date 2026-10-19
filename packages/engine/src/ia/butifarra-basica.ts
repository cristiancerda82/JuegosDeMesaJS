import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import type { AccionButifarra, VistaButifarra } from '../juegos/butifarra';
import {
  bandoDe,
  cartaGanadora,
  fuerza,
  paloDe,
  puntosDe,
  valorDe,
  VALORES_BUTIFARRA,
} from '../motor/bazas';
import type { Agente } from './agente';
import { cartaParaResponder, cartaParaSalir } from './bazas-heuristica';

/**
 * IA básica de la Butifarra: elige el triunfo por la fuerza de su mano, delega sin juego,
 * dice contro solo con mano fuerte y juega en pareja con la heurística de bazas. Es
 * determinista: no usa el azar que recibe.
 */
export const iaButifarraBasica: Agente<VistaButifarra, AccionButifarra> = {
  id: 'butifarra-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const V = VALORES_BUTIFARRA;
const MANILLA = 9;
const AS = 1;
const REY = 12;

/** Por debajo de este valor del mejor palo, el repartidor delega. */
export const UMBRAL_DELEGAR = 14;
/** Desde este valor, la mano juega butifarra. */
export const UMBRAL_BUTIFARRA = 30;
/** Valor de la mano para el triunfo elegido desde el que se dice cada contro. */
export const UMBRALES_CONTRO: readonly number[] = [22, 26, 30];

const tiene = (mano: readonly IdCarta[], palo: PaloEspanol, valor: number) =>
  mano.includes(`${palo}-${valor}`);

/**
 * Valor de la mano con `palo` de triunfo: cada triunfo vale una baza probable más sus puntos,
 * cada manilla de otro palo es casi una baza, y el As que la acompaña también.
 */
export function valorConTriunfo(mano: readonly IdCarta[], palo: PaloEspanol): number {
  let valor = 0;
  for (const c of mano) {
    const p = paloDe(c);
    if (p === palo) valor += 2 + puntosDe(c, V);
    else if (valorDe(c) === MANILLA) valor += 4;
    else if (valorDe(c) === AS && tiene(mano, p, MANILLA)) valor += 3;
  }
  const largo = mano.filter((c) => paloDe(c) === palo).length;
  return (
    valor +
    1.5 * Math.max(0, largo - 3) +
    (tiene(mano, palo, MANILLA) && tiene(mano, palo, AS) ? 3 : 0)
  );
}

/**
 * Valor de la mano sin triunfo: solo cuentan las cartas que ganan bazas seguras (manilla, y el
 * As y el Rey detrás de ella) y los palos largos que las acompañan. Un palo sin manilla resta:
 * por ahí los rivales corren sus cartas.
 */
export function valorSinTriunfo(mano: readonly IdCarta[]): number {
  let valor = 0;
  for (const palo of PALOS_ESPANOLES) {
    const largo = mano.filter((c) => paloDe(c) === palo).length;
    if (!tiene(mano, palo, MANILLA)) {
      valor -= largo === 0 ? 3 : 2;
      continue;
    }
    valor += 6;
    if (tiene(mano, palo, AS)) {
      valor += 5;
      if (tiene(mano, palo, REY)) valor += 3;
      valor += 1.5 * Math.max(0, largo - 3);
    }
  }
  return valor;
}

const valorPara = (mano: readonly IdCarta[], triunfo: PaloEspanol | null) =>
  triunfo === null ? valorSinTriunfo(mano) : valorConTriunfo(mano, triunfo);

function elegir(vista: VistaButifarra, acciones: readonly AccionButifarra[]): AccionButifarra {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'elegir': {
      if (valorSinTriunfo(mano) >= UMBRAL_BUTIFARRA) return { tipo: 'elegir', triunfo: null };
      const mejor = [...PALOS_ESPANOLES].sort(
        (a, b) => valorConTriunfo(mano, b) - valorConTriunfo(mano, a),
      )[0]!;
      const puedeDelegar = acciones.some((a) => a.tipo === 'delegar');
      if (puedeDelegar && valorConTriunfo(mano, mejor) < UMBRAL_DELEGAR) return { tipo: 'delegar' };
      return { tipo: 'elegir', triunfo: mejor };
    }
    case 'contros': {
      const valor = valorPara(mano, vista.eleccion!.triunfo);
      return valor >= UMBRALES_CONTRO[vista.contros]! ? { tipo: 'contro' } : { tipo: 'pasar' };
    }
    case 'jugar': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
      return { tipo: 'jugar', carta: cartaParaJugar(vista, cartas) };
    }
  }
}

const BARAJA = crearBaraja('espanola48');

/**
 * Lo que queda por salir en manos de los demás: la fuerza de la carta más alta de cada palo
 * (0 si no queda ninguna).
 */
function masAltasPorSalir(vista: VistaButifarra): Map<PaloEspanol, number> {
  const vistas = new Set<IdCarta>(vista.miMano ?? []);
  for (const j of vista.mesa) vistas.add(j.carta);
  for (const b of vista.bazasJugadas) for (const j of b.cartas) vistas.add(j.carta);
  const altas = new Map<PaloEspanol, number>(PALOS_ESPANOLES.map((p) => [p, 0]));
  for (const c of BARAJA) {
    if (vistas.has(c)) continue;
    const palo = paloDe(c);
    altas.set(palo, Math.max(altas.get(palo)!, fuerza(c, V)));
  }
  return altas;
}

/** La carta es la más alta de su palo de las que quedan por salir. */
const esLaMasAlta = (carta: IdCarta, altas: Map<PaloEspanol, number>) =>
  fuerza(carta, V) > altas.get(paloDe(carta))!;

function cartaParaJugar(vista: VistaButifarra, cartas: readonly IdCarta[]): IdCarta {
  const triunfo = vista.eleccion!.triunfo;
  const asiento = vista.asiento!;

  if (vista.mesa.length === 0) {
    const porSalir = masAltasPorSalir(vista);
    // Salir con una carta que gana seguro su palo (la manilla, o el As si ya salió).
    const seguras = cartas.filter((c) => paloDe(c) !== triunfo && esLaMasAlta(c, porSalir));
    if (seguras.length > 0) {
      return [...seguras].sort((a, b) => puntosDe(b, V) - puntosDe(a, V))[0]!;
    }
    return cartaParaSalir(triunfo, cartas, V);
  }

  // Si la baza es del compañero y nadie de los que faltan puede quitársela, se le cargan puntos.
  const gana = cartaGanadora(vista.mesa, triunfo, V);
  const delCompanero = gana.asiento !== asiento && bandoDe(gana.asiento) === bandoDe(asiento);
  const ultimo = vista.mesa.length === 3;
  const ganaSeguro = (porSalir: Map<PaloEspanol, number>) =>
    esLaMasAlta(gana.carta, porSalir) &&
    // Sin triunfo, o ya es triunfo, o no queda triunfo fuera con el que fallar.
    (triunfo === null || paloDe(gana.carta) === triunfo || porSalir.get(triunfo) === 0);
  if (delCompanero && (ultimo || ganaSeguro(masAltasPorSalir(vista)))) {
    const sinTriunfo = cartas.filter((c) => paloDe(c) !== triunfo);
    const cargas = sinTriunfo.length > 0 ? sinTriunfo : cartas;
    return [...cargas].sort(
      (a, b) => puntosDe(b, V) - puntosDe(a, V) || fuerza(a, V) - fuerza(b, V),
    )[0]!;
  }
  return cartaParaResponder(
    { asiento, jugadores: 4, triunfo, mesa: vista.mesa, valores: V },
    cartas,
  );
}
