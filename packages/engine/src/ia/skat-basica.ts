import type { IdCarta } from '../baraja/cartas';
import {
  BASE_SKAT,
  BARAJA_SKAT,
  esJota,
  ganadoraSkat,
  JUEGOS_SKAT,
  matadoresSkat,
  paloSkat,
  rangoSkat,
  siguienteValorSkat,
  valorNulo,
  valorSkat,
  type AccionSkat,
  type JuegoSkat,
  type VistaSkat,
} from '../juegos/skat';
import type { Agente } from './agente';

/** Fuerza para ganar un juego de palo o un Grand. */
const PARA_PALO = 8;
const PARA_GRAND = 9;
const TRIUNFOS_PALO = 5;

const paloNatural = (c: IdCarta) => c.split('-')[0]!;
const esAs = (c: IdCarta) => c.endsWith('-1');

/** Un 10 con otra carta de su palo (sin contar las J). */
function diezGuardado(mano: readonly IdCarta[], c: IdCarta): boolean {
  return (
    c.endsWith('-10') &&
    mano.some((x) => x !== c && !esJota(x) && paloNatural(x) === paloNatural(c))
  );
}

/** Si el Nulo es jugable: sin As ni K, y con el 7 de cada palo que tiene. */
function nuloGanable(mano: readonly IdCarta[]): boolean {
  if (mano.some((c) => esAs(c) || c.endsWith('-13'))) return false;
  const palos = new Set(mano.map(paloNatural));
  return [...palos].every((p) => mano.includes(`${p}-7` as IdCarta));
}

/** Fuerza de la mano para un juego y si lo daría por ganable. */
export function fuerzaSkat(
  mano: readonly IdCarta[],
  juego: JuegoSkat,
): { fuerza: number; ganable: boolean } {
  if (juego === 'nulo') {
    const ganable = nuloGanable(mano);
    return { fuerza: ganable ? PARA_GRAND : 0, ganable };
  }
  const jotas = mano.filter(esJota).length;
  const fuera = mano.filter((c) => paloSkat(c, juego) !== 'triunfo');
  const ases = fuera.filter(esAs).length;
  const diez = fuera.filter((c) => diezGuardado(mano, c)).length;
  if (juego === 'grand') {
    const fuerza = 2 * jotas + 1.5 * ases + diez;
    return { fuerza, ganable: jotas >= 2 && fuerza >= PARA_GRAND };
  }
  const triunfos = mano.length - fuera.length;
  const fuerza = triunfos + jotas + ases + 0.5 * diez;
  return { fuerza, ganable: triunfos >= TRIUNFOS_PALO && fuerza >= PARA_PALO };
}

/** Lo que valdría un juego con esta mano, sin contar el Skat ni los anuncios. */
export function valorEstimadoSkat(mano: readonly IdCarta[], juego: JuegoSkat, deMano = false) {
  if (juego === 'nulo') return valorNulo(deMano, false);
  const m = matadoresSkat(mano, juego);
  return BASE_SKAT[juego] * (m.n + 1 + (deMano ? 1 : 0));
}

/** El mejor juego ganable de la mano y su valor; `null` si ninguno lo es. */
export function mejorJuegoSkat(
  mano: readonly IdCarta[],
): { juego: JuegoSkat; valor: number } | null {
  let mejor: { juego: JuegoSkat; valor: number } | null = null;
  for (const juego of JUEGOS_SKAT) {
    if (!fuerzaSkat(mano, juego).ganable) continue;
    const valor = valorEstimadoSkat(mano, juego);
    if (mejor === null || valor > mejor.valor) mejor = { juego, valor };
  }
  return mejor;
}

/** El juego al que apunta la mano aunque no sea ganable: el de más fuerza. */
function juegoObjetivo(mano: readonly IdCarta[]): JuegoSkat {
  const mejor = mejorJuegoSkat(mano);
  if (mejor) return mejor.juego;
  return [...JUEGOS_SKAT]
    .filter((j) => j !== 'nulo')
    .sort((a, b) => fuerzaSkat(mano, b).fuerza - fuerzaSkat(mano, a).fuerza)[0]!;
}

/** La carta de la que se descarta: dieces y K de palos cortos, nunca triunfos si puede. */
export function descarteSkat(mano: readonly IdCarta[]): IdCarta {
  const juego = juegoObjetivo(mano);
  if (juego === 'nulo') {
    return [...mano].sort((a, b) => rangoSkat(b, 'nulo') - rangoSkat(a, 'nulo'))[0]!;
  }
  const fuera = mano.filter((c) => paloSkat(c, juego) !== 'triunfo');
  if (fuera.length === 0) {
    return [...mano].sort((a, b) => rangoSkat(a, juego) - rangoSkat(b, juego))[0]!;
  }
  const largo = (c: IdCarta) => fuera.filter((x) => paloNatural(x) === paloNatural(c)).length;
  const interes = (c: IdCarta) =>
    valorSkat(c) - (esAs(c) ? 20 : 0) + (largo(c) === 1 ? 6 : largo(c) === 2 ? 2 : 0);
  return [...fuera].sort((a, b) => interes(b) - interes(a))[0]!;
}

/** Coste de soltar una carta: sus puntos y, si es triunfo, mucho más. */
const costeEn = (juego: JuegoSkat) => (c: IdCarta) =>
  (paloSkat(c, juego) === 'triunfo' ? 100 : 0) + valorSkat(c) * 3 + rangoSkat(c, juego);

/** La carta de una baza, entre las legales. */
export function cartaSkat(vista: VistaSkat, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const juego = vista.juego!;
  const yo = vista.asiento!;
  const solista = vista.solista!;
  const mesa = vista.mesa;
  const coste = costeEn(juego);
  const barata = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => coste(a) - coste(b))[0]!;
  const cara = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => coste(b) - coste(a))[0]!;
  const ganan = cartas.filter(
    (c) =>
      mesa.length > 0 && ganadoraSkat([...mesa, { asiento: yo, carta: c }], juego).asiento === yo,
  );

  if (juego === 'nulo') {
    const porRango = (cs: readonly IdCarta[]) =>
      [...cs].sort((a, b) => rangoSkat(a, 'nulo') - rangoSkat(b, 'nulo'));
    if (yo !== solista || mesa.length === 0) return porRango(cartas)[0]!;
    // El solista juega la más alta que no gana la baza.
    const noGanan = cartas.filter((c) => !ganan.includes(c));
    return noGanan.length > 0 ? porRango(noGanan).at(-1)! : porRango(cartas)[0]!;
  }

  const triunfos = cartas.filter((c) => paloSkat(c, juego) === 'triunfo');
  const fuera = cartas.filter((c) => paloSkat(c, juego) !== 'triunfo');

  if (mesa.length === 0) {
    if (yo === solista) {
      // Arrastra mientras los rivales puedan tener triunfos.
      const totales = BARAJA_SKAT.filter((c) => paloSkat(c, juego) === 'triunfo');
      const vistos = [...vista.jugadas, ...(vista.miMano ?? [])];
      const quedanFuera = totales.filter((c) => !vistos.includes(c)).length;
      if (triunfos.length > 0 && quedanFuera > 0) {
        return [...triunfos].sort((a, b) => rangoSkat(b, juego) - rangoSkat(a, juego))[0]!;
      }
    }
    const ases = fuera.filter(esAs);
    if (ases.length > 0) return ases[0]!;
    return barata(fuera.length > 0 ? fuera : cartas);
  }

  const ganaAhora = ganadoraSkat(mesa, juego).asiento;
  const companeroGana = yo !== solista && ganaAhora !== solista;
  if (companeroGana) {
    // El otro defensor va ganando: si es el último, le carga puntos.
    if (mesa.length === 2) return cara(fuera.length > 0 ? fuera : cartas);
    return barata(fuera.length > 0 ? fuera : cartas);
  }
  if (ganan.length > 0) return barata(ganan);
  return barata(fuera.length > 0 ? fuera : cartas);
}

/**
 * IA básica del Skat (spec ia-jugadores): puja hasta el valor de su mejor juego, coge el Skat,
 * se descarta de lo que menos le sirve y juega las bazas con reglas sencillas. Es determinista:
 * no usa el azar que recibe.
 */
export const iaSkatBasica: Agente<VistaSkat, AccionSkat> = {
  id: 'skat-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const elegir = (accion: AccionSkat) => ({ accion, azar });
    const mano = vista.miMano ?? [];
    const puede = (tipo: AccionSkat['tipo']) => acciones.some((a) => a.tipo === tipo);
    switch (vista.fase) {
      case 'subasta': {
        const mejor = mejorJuegoSkat(mano);
        const tope = mejor?.valor ?? 0;
        const s = vista.subasta;
        if (s.esperando === 'respuesta') {
          return elegir(s.valor <= tope ? { tipo: 'aceptar' } : { tipo: 'pasar' });
        }
        const valor = s.tramo === 3 ? 18 : siguienteValorSkat(s.valor);
        return elegir(
          puede('pujar') && valor !== null && valor <= tope ? { tipo: 'pujar' } : { tipo: 'pasar' },
        );
      }
      case 'skat':
        return elegir({ tipo: 'cogerSkat' });
      case 'descarte':
        return elegir({ tipo: 'descartar', carta: descarteSkat(mano) });
      case 'declarar': {
        const todas = [...mano, ...(vista.skat ?? [])];
        const posibles = JUEGOS_SKAT.map((juego) => ({
          juego,
          valor: valorEstimadoSkat(todas, juego),
          ...fuerzaSkat(mano, juego),
        }));
        const llegan = posibles.filter((p) => p.ganable && p.valor >= vista.puja);
        const elegido =
          [...llegan].sort((a, b) => b.fuerza - a.fuerza)[0] ??
          posibles
            .filter((p) => p.juego !== 'nulo')
            .sort((a, b) => b.valor - a.valor || b.fuerza - a.fuerza)[0]!;
        return elegir({ tipo: 'declarar', juego: elegido.juego, anuncio: 'ninguno' });
      }
      case 'bazas': {
        const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
        return elegir({ tipo: 'jugar', carta: cartaSkat(vista, cartas) });
      }
    }
  },
};
