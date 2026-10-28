import { cartasFuera, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  companeroBridge,
  ganadoraBridge,
  ordenPujaBridge,
  paloBridge,
  parejaBridge,
  rangoBridge,
  triunfoBridge,
  ultimaPujaBridge,
  type AccionBridge,
  type DeclaracionBridge,
  type DeclaracionHecha,
  type DenominacionBridge,
  type VistaBridge,
} from '../juegos/bridge';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

// ── Valoración de la mano ────────────────────────────────────────────────────

const PALOS: readonly PaloFrances[] = ['treboles', 'diamantes', 'corazones', 'picas'];
const esMayor = (d: DenominacionBridge) => d === 'corazones' || d === 'picas';

/** Puntos de honores: As 4, K 3, Q 2 y J 1. */
export function puntosHonoresBridge(mano: readonly IdCarta[]): number {
  return mano.reduce((s, c) => s + Math.max(0, rangoBridge(c) - 10), 0);
}

const largo = (mano: readonly IdCarta[], palo: PaloFrances) =>
  mano.filter((c) => paloBridge(c) === palo).length;

/** Mano equilibrada: 4-3-3-3, 4-4-3-2 o 5-3-3-2. */
export function equilibradaBridge(mano: readonly IdCarta[]): boolean {
  const ls = PALOS.map((p) => largo(mano, p)).sort((a, b) => b - a);
  return ls[3]! >= 2 && ls[2]! >= 3 - (ls[0] === 4 ? 1 : 0) && ls[0]! <= 5;
}

/** El palo de la apertura: el de 5 o más (el más largo y, a igualdad, el más alto) o el menor más largo. */
function paloDeApertura(mano: readonly IdCarta[]): PaloFrances {
  const cinco = [...PALOS]
    .reverse()
    .filter((p) => largo(mano, p) >= 5)
    .sort((a, b) => largo(mano, b) - largo(mano, a));
  if (cinco.length > 0) return cinco[0]!;
  return largo(mano, 'diamantes') > largo(mano, 'treboles') ? 'diamantes' : 'treboles';
}

// ── Subasta ──────────────────────────────────────────────────────────────────

const pujar = (nivel: number, denominacion: DenominacionBridge): DeclaracionBridge => ({
  tipo: 'pujar',
  nivel,
  denominacion,
});
const PASAR: DeclaracionBridge = { tipo: 'pasar' };

type Puja = DeclaracionHecha & { readonly declaracion: { readonly tipo: 'pujar' } };
const pujasDe = (subasta: readonly DeclaracionHecha[], asiento: Asiento) =>
  subasta.filter((d): d is Puja => d.asiento === asiento && d.declaracion.tipo === 'pujar');

/** Pujas artificiales de la pareja: el Stayman y la respuesta de 2 diamantes. */
function artificial(subasta: readonly DeclaracionHecha[], i: number): boolean {
  const d = subasta[i]!;
  if (d.declaracion.tipo !== 'pujar' || d.declaracion.nivel !== 2) return false;
  const anteriores = subasta.slice(0, i).filter((x) => x.declaracion.tipo === 'pujar');
  const previa = anteriores.at(-1);
  if (d.declaracion.denominacion === 'treboles') {
    // Stayman: 2 tréboles justo sobre el 1 sin triunfo del compañero.
    return (
      previa !== undefined &&
      previa.asiento === companeroBridge(d.asiento) &&
      previa.declaracion.tipo === 'pujar' &&
      previa.declaracion.nivel === 1 &&
      previa.declaracion.denominacion === 'sinTriunfo'
    );
  }
  if (d.declaracion.denominacion === 'diamantes') {
    return previa !== undefined && artificial(subasta, subasta.indexOf(previa));
  }
  return false;
}

/** Puntos que se le suponen al compañero por su primera puja. */
function puntosDelCompanero(subasta: readonly DeclaracionHecha[], yo: Asiento): number {
  const comp = companeroBridge(yo);
  const i = subasta.findIndex((d) => d.asiento === comp && d.declaracion.tipo === 'pujar');
  if (i < 0) return 0;
  const d = subasta[i]!.declaracion as Extract<DeclaracionBridge, { tipo: 'pujar' }>;
  const antes = subasta.slice(0, i);
  const abrioYo = antes.some((x) => x.asiento === yo && x.declaracion.tipo === 'pujar');
  const rivalAntes = antes.some(
    (x) => parejaBridge(x.asiento) !== parejaBridge(yo) && x.declaracion.tipo === 'pujar',
  );
  if (!abrioYo) {
    if (rivalAntes) return 11;
    if (d.denominacion === 'sinTriunfo') return d.nivel === 1 ? 16 : 20.5;
    return 13;
  }
  // Responde a mi apertura.
  if (artificial(subasta, i)) return 10;
  if (d.denominacion === 'sinTriunfo') return d.nivel === 1 ? 7.5 : d.nivel === 2 ? 8.5 : 12;
  const misPujas = pujasDe(antes, yo);
  const apoya = misPujas.some((m) => m.declaracion.denominacion === d.denominacion);
  if (apoya) return d.nivel <= 2 ? 7.5 : d.nivel === 3 ? 11 : 13;
  return 9;
}

/** Cartas que se le suponen al compañero en cada palo que ha pujado de forma natural. */
function largoDelCompanero(subasta: readonly DeclaracionHecha[], yo: Asiento, palo: PaloFrances) {
  const comp = companeroBridge(yo);
  let r = 0;
  subasta.forEach((d, i) => {
    if (d.asiento !== comp || d.declaracion.tipo !== 'pujar') return;
    if (d.declaracion.denominacion !== palo || artificial(subasta, i)) return;
    const misPujas = pujasDe(subasta.slice(0, i), yo);
    const apoyo = misPujas.some((m) => m.declaracion.denominacion === palo);
    // Abrir un mayor promete 5; un menor o un palo nuevo, 4; apoyar, 3.
    const abre = !subasta.slice(0, i).some((x) => x.declaracion.tipo === 'pujar');
    r = Math.max(r, apoyo ? 3 : abre && esMayor(palo) ? 5 : 4);
  });
  return r;
}

/** La manga de una denominación: 3 sin triunfo, 4 en mayor y 5 en menor. */
const nivelManga = (d: DenominacionBridge) => (d === 'sinTriunfo' ? 3 : esMayor(d) ? 4 : 5);

/** La declaración que haría la IA básica en la subasta. */
export function declaracionBridge(vista: VistaBridge): DeclaracionBridge {
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];
  const s = vista.subasta;
  const hcp = puntosHonoresBridge(mano);
  const bal = equilibradaBridge(mano);
  const ultima = ultimaPujaBridge(s);
  const puede = (nivel: number, d: DenominacionBridge) =>
    nivel <= 7 &&
    (ultima === null ||
      ordenPujaBridge(nivel, d) > ordenPujaBridge(ultima.nivel, ultima.denominacion));
  const intenta = (nivel: number, d: DenominacionBridge) =>
    puede(nivel, d) ? pujar(nivel, d) : null;
  const comp = companeroBridge(yo);
  const mias = pujasDe(s, yo);
  const suyas = pujasDe(s, comp);
  const rivales = s.filter(
    (d) => parejaBridge(d.asiento) !== parejaBridge(yo) && d.declaracion.tipo === 'pujar',
  );

  // Apertura o intervención.
  if (mias.length === 0 && suyas.length === 0) {
    if (rivales.length === 0) {
      if (bal && hcp >= 15 && hcp <= 17) return pujar(1, 'sinTriunfo');
      if (bal && hcp >= 20 && hcp <= 21) return pujar(2, 'sinTriunfo');
      if (hcp >= 12) return pujar(1, paloDeApertura(mano));
      return PASAR;
    }
    if (hcp >= 8 && hcp <= 16) {
      const palo = [...PALOS]
        .reverse()
        .filter((p) => largo(mano, p) >= 5)
        .sort((a, b) => largo(mano, b) - largo(mano, a))[0];
      if (palo) return intenta(1, palo) ?? intenta(2, palo) ?? PASAR;
    }
    return dobloPosible(vista, hcp) ?? PASAR;
  }

  // Respuesta a la apertura del compañero.
  if (mias.length === 0) {
    const abre = suyas[0]!.declaracion;
    const respuesta = (() => {
      if (abre.denominacion === 'sinTriunfo' && abre.nivel === 1) {
        const mayor4 = largo(mano, 'corazones') >= 4 || largo(mano, 'picas') >= 4;
        if (hcp >= 8 && mayor4) return intenta(2, 'treboles');
        if (hcp >= 8 && hcp <= 9) return intenta(2, 'sinTriunfo');
        if (hcp >= 10 && hcp <= 15) return intenta(3, 'sinTriunfo');
        if (hcp > 15) return intenta(6, 'sinTriunfo');
        return null;
      }
      if (abre.denominacion === 'sinTriunfo') {
        return hcp >= 4 && hcp <= 10
          ? intenta(3, 'sinTriunfo')
          : hcp > 10
            ? intenta(6, 'sinTriunfo')
            : null;
      }
      if (hcp < 6) return null;
      if (esMayor(abre.denominacion) && largo(mano, abre.denominacion) >= 3) {
        return intenta(hcp <= 9 ? 2 : hcp <= 12 ? 3 : 4, abre.denominacion);
      }
      const nuevo = [...PALOS]
        .reverse()
        .filter((p) => p !== abre.denominacion && largo(mano, p) >= 4 && puede(1, p))
        .sort((a, b) => largo(mano, b) - largo(mano, a))[0];
      if (nuevo) return pujar(1, nuevo);
      if (hcp <= 9) return intenta(1, 'sinTriunfo');
      return hcp <= 12 ? intenta(2, 'sinTriunfo') : intenta(3, 'sinTriunfo');
    })();
    return respuesta ?? dobloPosible(vista, hcp) ?? PASAR;
  }

  // El que abrió 1 sin triunfo contesta al Stayman.
  const ultimaDelComp = suyas.at(-1);
  if (
    ultimaDelComp &&
    artificial(s, s.indexOf(ultimaDelComp)) &&
    ultimaDelComp.declaracion.denominacion === 'treboles'
  ) {
    const contestacion =
      largo(mano, 'corazones') >= 4
        ? intenta(2, 'corazones')
        : largo(mano, 'picas') >= 4
          ? intenta(2, 'picas')
          : intenta(2, 'diamantes');
    if (contestacion && !mias.some((m) => s.indexOf(m) > s.indexOf(ultimaDelComp))) {
      return contestacion;
    }
  }

  // Después: hasta dónde llega la pareja.
  const total = hcp + puntosDelCompanero(s, yo);
  const fit = [...PALOS]
    .reverse()
    .map((p) => ({ p, n: largo(mano, p) + largoDelCompanero(s, yo, p) }))
    .filter((x) => x.n >= 8)
    .sort((a, b) => Number(esMayor(b.p)) - Number(esMayor(a.p)) || b.n - a.n)[0];
  const den: DenominacionBridge = fit && esMayor(fit.p) ? fit.p : 'sinTriunfo';
  const nivel = total >= 37 ? 7 : total >= 33 ? 6 : total >= 25 ? nivelManga(den) : 0;
  const nuestra = ultima !== null && parejaBridge(ultima.asiento) === parejaBridge(yo);
  if (nivel === 0) {
    // Parcial: si la última es nuestra y no es artificial, vale; tras un 2 diamantes de
    // contestación al Stayman, 2 sin triunfo.
    const ultimaHecha = s.findLast((d) => d.declaracion.tipo === 'pujar');
    if (nuestra && ultimaHecha && artificial(s, s.indexOf(ultimaHecha))) {
      return intenta(2, 'sinTriunfo') ?? PASAR;
    }
    return dobloPosible(vista, hcp) ?? PASAR;
  }
  if (
    nuestra &&
    ordenPujaBridge(ultima.nivel, ultima.denominacion) >= ordenPujaBridge(nivel, den)
  ) {
    return PASAR;
  }
  return intenta(nivel, den) ?? dobloPosible(vista, hcp) ?? PASAR;
}

/** Dobla una manga rival si a la pareja rival le quedan menos de 20 puntos. */
function dobloPosible(vista: VistaBridge, hcp: number): DeclaracionBridge | null {
  const yo = vista.asiento!;
  const ultima = ultimaPujaBridge(vista.subasta);
  if (!ultima || ultima.doblado !== 0 || parejaBridge(ultima.asiento) === parejaBridge(yo)) {
    return null;
  }
  if (ultima.nivel < nivelManga(ultima.denominacion)) return null;
  const nuestros = hcp + puntosDelCompanero(vista.subasta, yo);
  return 40 - nuestros < 20 ? { tipo: 'doblar' } : null;
}

// ── Carteo ───────────────────────────────────────────────────────────────────

/** El asiento cuyas cartas se juegan ahora: el muerto si el declarante juega por él. */
const quienJuega = (vista: VistaBridge): Asiento =>
  vista.juegaPorElMuerto ? vista.muerto! : vista.asiento!;

/** Las cartas que pueden tener los rivales del que juega: las que no ve, y el muerto si es rival. */
function cartasRivales(vista: VistaBridge, juega: Asiento): IdCarta[] {
  const muertoVisto = vista.manoMuerto ?? [];
  const noVistas = cartasFuera(
    crearBaraja('francesa52'),
    vista.miMano ?? [],
    muertoVisto,
    vista.jugadas,
  );
  const muertoRival =
    vista.muerto !== null && parejaBridge(vista.muerto) !== parejaBridge(juega) ? muertoVisto : [];
  return [...noVistas, ...muertoRival];
}

/** La carta es la más alta que queda de su palo entre las de los rivales. */
const segura = (c: IdCarta, rivales: readonly IdCarta[]) =>
  !rivales.some((r) => paloBridge(r) === paloBridge(c) && rangoBridge(r) > rangoBridge(c));

export function cartaBridge(vista: VistaBridge, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const triunfo = triunfoBridge(vista.contrato!.denominacion);
  const peso = (c: IdCarta) => (paloBridge(c) === triunfo ? 100 : 0) + rangoBridge(c);
  const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
  const juega = quienJuega(vista);
  const companero = companeroBridge(juega);
  const mesa = vista.mesa;
  const rivales = cartasRivales(vista, juega);

  if (mesa.length === 0) return salidaBridge(vista, cartas, juega, rivales);

  const gana = (c: IdCarta) =>
    ganadoraBridge([...mesa, { asiento: juega, carta: c }], triunfo).asiento === juega;
  const ganadoras = cartas.filter(gana);
  const ganaAhora = ganadoraBridge(mesa, triunfo).asiento;
  const sinTriunfo = cartas.filter((c) => paloBridge(c) !== triunfo);
  const descarte = () => masBaja(sinTriunfo.length > 0 ? sinTriunfo : cartas);

  if (mesa.length === 1) {
    // Segunda mano: baja, salvo una ganadora segura.
    const seguras = ganadoras.filter((c) => paloBridge(c) === triunfo || segura(c, rivales));
    return seguras.length > 0 ? masBaja(seguras) : descarte();
  }
  if (ganaAhora === companero) return descarte();
  return ganadoras.length > 0 ? masBaja(ganadoras) : descarte();
}

function salidaBridge(
  vista: VistaBridge,
  cartas: readonly IdCarta[],
  juega: Asiento,
  rivales: readonly IdCarta[],
): IdCarta {
  const contrato = vista.contrato!;
  const triunfo = triunfoBridge(contrato.denominacion);
  const delPalo = (p: PaloFrances) =>
    cartas.filter((c) => paloBridge(c) === p).sort((a, b) => rangoBridge(b) - rangoBridge(a));
  const declarante = parejaBridge(juega) === parejaBridge(contrato.declarante);

  if (declarante) {
    // Arrastrar mientras los rivales puedan tener triunfos.
    if (triunfo && rivales.some((c) => paloBridge(c) === triunfo)) {
      const mios = delPalo(triunfo);
      if (mios.length > 0) return segura(mios[0]!, rivales) ? mios[0]! : mios.at(-1)!;
    }
    const seguras = cartas.filter((c) => paloBridge(c) !== triunfo && segura(c, rivales));
    if (seguras.length > 0) return seguras[0]!;
    const resto = cartas.filter((c) => paloBridge(c) !== triunfo);
    return (resto.length > 0 ? resto : cartas).reduce((a, b) =>
      rangoBridge(b) < rangoBridge(a) ? b : a,
    );
  }

  // Defensa: la más alta de una secuencia de honores.
  for (const p of PALOS) {
    if (p === triunfo) continue;
    const cs = delPalo(p);
    if (
      cs.length >= 2 &&
      rangoBridge(cs[0]!) >= 11 &&
      rangoBridge(cs[1]!) === rangoBridge(cs[0]!) - 1
    ) {
      return cs[0]!;
    }
  }
  const noTriunfo = PALOS.filter((p) => p !== triunfo && delPalo(p).length > 0);
  if (noTriunfo.length === 0) return cartas[0]!;
  const largoMas = [...noTriunfo].sort((a, b) => delPalo(b).length - delPalo(a).length)[0]!;
  if (triunfo === null) {
    const cs = delPalo(largoMas);
    return cs[Math.min(3, cs.length - 1)]!;
  }
  // El palo que pujó el compañero.
  const comp = companeroBridge(juega);
  const suyo = pujasDe(vista.subasta, comp)
    .map((d) => d.declaracion.denominacion)
    .find((d): d is PaloFrances => d !== 'sinTriunfo' && d !== triunfo && delPalo(d).length > 0);
  if (suyo) {
    const cs = delPalo(suyo);
    return segura(cs[0]!, rivales) ? cs[0]! : cs.at(-1)!;
  }
  const cs = delPalo(largoMas);
  return segura(cs[0]!, rivales) ? cs[0]! : cs.at(-1)!;
}

/** Lo que haría la IA básica con esta vista. */
export function decisionBridge(
  vista: VistaBridge,
  acciones: readonly AccionBridge[],
): AccionBridge {
  if (vista.fase === 'subasta') return declaracionBridge(vista);
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: cartaBridge(vista, cartas) };
}

/**
 * IA básica del Bridge (spec ia-jugadores): subasta natural sencilla con Stayman y carteo por
 * reglas, también por el muerto. Es determinista: no usa el azar que recibe.
 */
export const iaBridgeBasica: Agente<VistaBridge, AccionBridge> = {
  id: 'bridge-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionBridge(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones.find((a) => a.tipo === 'pasar') ?? acciones[0]!, azar };
  },
};
