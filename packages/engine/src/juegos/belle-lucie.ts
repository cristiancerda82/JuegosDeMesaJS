import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_FRANCESES,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Sin opciones: dos rebarajes y una merci tras el último. */
export type ConfigBelleLucie = Record<string, never>;

export const CONFIG_BELLE_LUCIE_POR_DEFECTO: ConfigBelleLucie = {};

/** Rebarajes por partida. */
export const REBARAJES_BELLE_LUCIE = 2;

interface Tablero {
  /** La carta de arriba de cada abanico es la última. */
  readonly abanicos: readonly (readonly IdCarta[])[];
  /** El valor de arriba de cada fundación (0 si está vacía). */
  readonly fundaciones: Readonly<Record<PaloFrances, number>>;
  /** Rebarajes que quedan. */
  readonly rebarajes: number;
  readonly merci: 'pendiente' | 'disponible' | 'usada';
  readonly azar: EstadoAzar;
}

export interface EstadoBelleLucie extends Tablero {
  readonly config: ConfigBelleLucie;
  readonly movimientos: number;
  /** Tablero antes de cada acción, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionBelleLucie =
  | { readonly tipo: 'fundacion'; readonly abanico: number }
  | { readonly tipo: 'mover'; readonly desde: number; readonly hasta: number }
  | { readonly tipo: 'rebarajar' }
  | { readonly tipo: 'merci'; readonly abanico: number; readonly indice: number }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'abandonar' };

export interface VistaBelleLucie {
  readonly config: ConfigBelleLucie;
  readonly abanicos: readonly (readonly IdCarta[])[];
  readonly fundaciones: Readonly<Record<PaloFrances, number>>;
  readonly rebarajes: number;
  readonly merci: Tablero['merci'];
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const POR_ABANICO = 3;
const REY = 13;

export const valorBelleLucie = (c: IdCarta) => cartaDeId(c)!.valor;
export const paloBelleLucie = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

/** La carta sube a su fundación: es la siguiente de la que hay arriba. */
export const subeBelleLucie = (fundaciones: Tablero['fundaciones'], carta: IdCarta) =>
  valorBelleLucie(carta) === fundaciones[paloBelleLucie(carta)] + 1;

/** `carta` puede ir sobre `tope`: la siguiente más baja del mismo palo. */
export const encajaBelleLucie = (carta: IdCarta, tope: IdCarta) =>
  paloBelleLucie(carta) === paloBelleLucie(tope) &&
  valorBelleLucie(carta) === valorBelleLucie(tope) - 1;

/** Reparte las cartas en abanicos de 3; el último, con las que sobren. */
function enAbanicos(cartas: readonly IdCarta[]): IdCarta[][] {
  const r: IdCarta[][] = [];
  for (let i = 0; i < cartas.length; i += POR_ABANICO) r.push(cartas.slice(i, i + POR_ABANICO));
  return r;
}

const ganada = (t: Pick<Tablero, 'fundaciones'>) =>
  PALOS_FRANCESES.every((p) => t.fundaciones[p] === REY);

// ── Juego ────────────────────────────────────────────────────────────────────

export const belleLucie: Juego<
  ConfigBelleLucie,
  EstadoBelleLucie,
  AccionBelleLucie,
  VistaBelleLucie
> = {
  id: 'belleLucie',

  crear(config, semilla) {
    if (typeof config !== 'object' || config === null) return error('Configuración no válida');
    const { cartas, azar } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    return ok({
      config: {},
      abanicos: enAbanicos(cartas),
      fundaciones: { picas: 0, corazones: 0, diamantes: 0, treboles: 0 },
      rebarajes: REBARAJES_BELLE_LUCIE,
      merci: 'pendiente',
      azar,
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || belleLucie.resultado(e) !== null) return [];
    const acciones: AccionBelleLucie[] = [];
    e.abanicos.forEach((a, i) => {
      const carta = a.at(-1);
      if (carta === undefined) return;
      if (subeBelleLucie(e.fundaciones, carta)) acciones.push({ tipo: 'fundacion', abanico: i });
      e.abanicos.forEach((b, j) => {
        const tope = b.at(-1);
        if (j !== i && tope !== undefined && encajaBelleLucie(carta, tope)) {
          acciones.push({ tipo: 'mover', desde: i, hasta: j });
        }
      });
    });
    if (e.rebarajes > 0 && e.abanicos.some((a) => a.length > 0)) {
      acciones.push({ tipo: 'rebarajar' });
    }
    if (e.merci === 'disponible') {
      e.abanicos.forEach((a, abanico) => {
        for (let indice = 0; indice < a.length - 1; indice++) {
          acciones.push({ tipo: 'merci', abanico, indice });
        }
      });
    }
    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const tablero: Tablero = {
      abanicos: e.abanicos,
      fundaciones: e.fundaciones,
      rebarajes: e.rebarajes,
      merci: e.merci,
      azar: e.azar,
    };
    const hecho = (cambios: Partial<Tablero>): EstadoBelleLucie => ({
      ...e,
      ...cambios,
      movimientos: e.movimientos + 1,
      historial: [...e.historial, tablero],
    });
    switch (accion.tipo) {
      case 'fundacion': {
        const carta = e.abanicos[accion.abanico]!.at(-1)!;
        return hecho({
          abanicos: e.abanicos.map((a, i) => (i === accion.abanico ? a.slice(0, -1) : a)),
          fundaciones: { ...e.fundaciones, [paloBelleLucie(carta)]: valorBelleLucie(carta) },
        });
      }
      case 'mover': {
        const carta = e.abanicos[accion.desde]!.at(-1)!;
        return hecho({
          abanicos: e.abanicos.map((a, i) =>
            i === accion.desde ? a.slice(0, -1) : i === accion.hasta ? [...a, carta] : a,
          ),
        });
      }
      case 'rebarajar': {
        const { cartas, azar } = barajar(e.abanicos.flat(), e.azar);
        const rebarajes = e.rebarajes - 1;
        return hecho({
          abanicos: enAbanicos(cartas),
          rebarajes,
          merci: rebarajes === 0 && e.merci === 'pendiente' ? 'disponible' : e.merci,
          azar,
        });
      }
      case 'merci': {
        const a = [...e.abanicos[accion.abanico]!];
        const [carta] = a.splice(accion.indice, 1);
        return hecho({
          abanicos: e.abanicos.map((x, i) => (i === accion.abanico ? [...a, carta!] : x)),
          merci: 'usada',
        });
      }
      case 'deshacer':
        // Deshacer cuenta como un movimiento más: el contador nunca baja.
        return {
          ...e,
          ...e.historial.at(-1)!,
          movimientos: e.movimientos + 1,
          historial: e.historial.slice(0, -1),
        };
      case 'abandonar':
        return { ...e, abandonada: true };
    }
  },

  vistaDe(e) {
    return {
      config: e.config,
      abanicos: e.abanicos.map((a) => [...a]),
      fundaciones: { ...e.fundaciones },
      rebarajes: e.rebarajes,
      merci: e.merci,
      movimientos: e.movimientos,
      situacion: e.abandonada ? 'abandono' : ganada(e) ? 'victoria' : 'jugando',
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (ganada(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
