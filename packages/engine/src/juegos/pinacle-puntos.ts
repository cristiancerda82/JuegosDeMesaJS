import type { IdCarta } from '../baraja/cartas';
import {
  AS,
  basePinacle,
  cartasDe,
  esComodinPinacle,
  esDos,
  MAXIMO_GRUPO,
  paloPinacle,
  puntosCartaPinacle,
  type CartaPinacle,
  type Combinacion,
} from './pinacle-combinaciones';

/** Puntuación del Pinacle (spec juego-pinacle): combinaciones con premio y desglose de la mano. */

export type PremioPinacle =
  | 'pinacle-golpe'
  | 'pinacle'
  | 'ocho-limpias'
  | 'siete-limpias'
  | 'seis-limpias'
  | 'ocho-iguales'
  | 'seis-con-comodin'
  | 'escalera-limpia'
  | 'escalera-un-comodin'
  | 'escalera-dos-comodines'
  | 'escalera-sucia';

const suma = (cartas: readonly CartaPinacle[]) =>
  cartas.reduce((s, c) => s + puntosCartaPinacle(c), 0);

const ESCALERA_COMPLETA = 12;
const FIGURAS = [11, 12, 13];

/** Premios de los grupos sin comodines, por número de cartas: [6, 7, 8]. */
const LIMPIAS = { ases: [300, 400, 1000], figuras: [200, 300, 750] } as const;

/** Lo que vale una combinación al terminar la mano, y su premio si lo tiene. */
export function valorCombinacion(c: Combinacion): { valor: number; premio: PremioPinacle | null } {
  const cartas = cartasDe(c);
  const comodines = cartas.filter(esComodinPinacle).length;
  const naturales = cartas.length - comodines;
  const porCartas = { valor: suma(cartas), premio: null };

  if (c.tipo === 'grupo') {
    if (cartas.length === MAXIMO_GRUPO) {
      return c.variosTurnos
        ? { valor: 1500, premio: 'pinacle' }
        : { valor: 3000, premio: 'pinacle-golpe' };
    }
    const tabla =
      c.numero === AS ? LIMPIAS.ases : FIGURAS.includes(c.numero) ? LIMPIAS.figuras : null;
    if (comodines === 0 && naturales >= 6) {
      const premios = ['seis-limpias', 'siete-limpias', 'ocho-limpias'] as const;
      if (tabla) return { valor: tabla[naturales - 6]!, premio: premios[naturales - 6]! };
      if (naturales === 8) return { valor: 50 + suma(cartas), premio: 'ocho-iguales' };
    }
    if (tabla && cartas.length === 6 && comodines === 1) {
      return { valor: c.numero === AS ? 180 : 120, premio: 'seis-con-comodin' };
    }
    return porCartas;
  }

  if (cartas.length < ESCALERA_COMPLETA) return porCartas;
  const ajenos = cartas.filter((w) => esDos(w) && paloPinacle(w) !== c.palo).length;
  if (comodines === 0) return { valor: 1000, premio: 'escalera-limpia' };
  if (ajenos === 0 && comodines === 1) return { valor: 800, premio: 'escalera-un-comodin' };
  if (ajenos === 0 && comodines === 2) return { valor: 750, premio: 'escalera-dos-comodines' };
  return { valor: 550, premio: 'escalera-sucia' };
}

export interface CombinacionPuntuada {
  readonly tipo: Combinacion['tipo'];
  /** Las cartas sin copia, en su orden en la mesa. */
  readonly cartas: readonly IdCarta[];
  readonly valor: number;
  readonly premio: PremioPinacle | null;
}

export interface DesgloseBando {
  readonly combinaciones: readonly CombinacionPuntuada[];
  /** Suma de las combinaciones. */
  readonly enMesa: number;
  /** 20 por cerrar (0 si no cierra o si cierra de golpe). */
  readonly cerrar: number;
  /** Lo que añade cerrar sin comodín: otra vez el valor de las combinaciones nuevas del turno. */
  readonly sinComodin: number;
  /** Lo que añade cerrar de golpe (doblar o cuadruplicar). */
  readonly deGolpe: number;
  readonly cambios: number;
  /** Lo que restan las cartas en la mano (negativo o 0). */
  readonly enMano: number;
  /** Penalizaciones del barbelé en la mano (negativo o 0). */
  readonly barbele: number;
  readonly total: number;
}

export interface CierrePinacle {
  readonly bando: number;
  /** No había bajado nada antes en la mano. */
  readonly deGolpe: boolean;
  /** No bajó ni añadió ningún comodín en el turno en que cierra. */
  readonly sinComodin: boolean;
  /** Combinaciones nuevas del turno en que cierra. */
  readonly creadas: readonly number[];
}

export interface DatosMano {
  readonly bandos: number;
  readonly combinaciones: readonly Combinacion[];
  /** Cartas en la mano de cada bando (de sus jugadores juntos). */
  readonly manos: readonly (readonly CartaPinacle[])[];
  readonly cambios: readonly number[];
  readonly penalizaciones: readonly number[];
  readonly cierre: CierrePinacle | null;
}

export const PENALIZACION_BARBELE = 50;
export const PREMIO_CERRAR = 20;

/** El desglose de la mano de cada bando. */
export function puntuarManoPinacle(d: DatosMano): DesgloseBando[] {
  return Array.from({ length: d.bandos }, (_, b) => {
    const propias = d.combinaciones.filter((c) => c.bando === b);
    const combinaciones = propias.map((c) => ({
      tipo: c.tipo,
      cartas: cartasDe(c).map(basePinacle),
      ...valorCombinacion(c),
    }));
    const enMesa = combinaciones.reduce((s, c) => s + c.valor, 0);
    const cambios = d.cambios[b]!;
    const cierra = d.cierre?.bando === b ? d.cierre : null;
    let cerrar = 0;
    let sinComodin = 0;
    let deGolpe = 0;
    if (cierra?.deGolpe) {
      deGolpe = (enMesa + cambios) * (cierra.sinComodin ? 3 : 1);
    } else if (cierra) {
      cerrar = PREMIO_CERRAR;
      if (cierra.sinComodin) {
        sinComodin = combinaciones
          .filter((_, i) => cierra.creadas.includes(propias[i]!.id))
          .reduce((s, c) => s + c.valor, 0);
      }
    }
    const enMano = -suma(d.manos[b]!);
    const barbele = -PENALIZACION_BARBELE * d.penalizaciones[b]!;
    const total = enMesa + cerrar + sinComodin + deGolpe + cambios + enMano + barbele;
    return { combinaciones, enMesa, cerrar, sinComodin, deGolpe, cambios, enMano, barbele, total };
  });
}
