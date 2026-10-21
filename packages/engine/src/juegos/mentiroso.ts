import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigMentiroso {
  /** De 3 a 6 jugadores, cada uno por su cuenta. */
  readonly jugadores: 3 | 4 | 5 | 6;
}

export const CONFIG_MENTIROSO_POR_DEFECTO: ConfigMentiroso = { jugadores: 4 };

/** Cartas que se pueden bajar de una vez. */
export const MAXIMO_BAJADA_MENTIROSO = 4;
const REY = 13;

/** Una bajada al montón: quién, qué cartas (ocultas) y qué valor dijo. */
export interface BajadaMentiroso {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
  readonly valor: number;
}

/** Lo que se descubre en cada «¡Mentiroso!». */
export interface RevelacionMentiroso {
  readonly bajo: Asiento;
  readonly desconfio: Asiento;
  readonly cartas: readonly IdCarta[];
  readonly valor: number;
  readonly mentia: boolean;
  /** Quién se llevó el montón, y cuántas cartas tenía. */
  readonly seLleva: Asiento;
  readonly cuantas: number;
}

export interface EstadoMentiroso {
  readonly config: ConfigMentiroso;
  readonly azar: EstadoAzar;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Las bajadas desde el último «¡Mentiroso!». */
  readonly monton: readonly BajadaMentiroso[];
  /** Valor que toca declarar: 1 (As) a 13 (K). */
  readonly valor: number;
  readonly turno: Asiento;
  /** Cartas que el jugador en turno ha marcado para bajar. */
  readonly marcadas: readonly IdCarta[];
  readonly revelaciones: readonly RevelacionMentiroso[];
  readonly ganador: Asiento | null;
}

export type AccionMentiroso =
  | { readonly tipo: 'marcar'; readonly carta: IdCarta }
  | { readonly tipo: 'desmarcar'; readonly carta: IdCarta }
  | { readonly tipo: 'bajar' }
  | { readonly tipo: 'desconfiar' }
  | { readonly tipo: 'creer' };

export interface VistaMentiroso {
  readonly config: ConfigMentiroso;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas en el montón. */
  readonly monton: number;
  /** Las bajadas del montón: quién, cuántas cartas y qué valor dijo, sin las cartas. */
  readonly bajadas: readonly {
    readonly asiento: Asiento;
    readonly cuantas: number;
    readonly valor: number;
  }[];
  /** Las cartas que este asiento ha bajado y siguen en el montón: las recuerda. */
  readonly misCartasEnMonton: readonly IdCarta[];
  readonly valor: number;
  readonly turno: Asiento | null;
  /** Las marcadas, solo para el jugador en turno. */
  readonly marcadas: readonly IdCarta[];
  readonly revelaciones: readonly RevelacionMentiroso[];
  readonly ganador: Asiento | null;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const valorMentiroso = (carta: IdCarta) => cartaDeId(carta)!.valor;

/** El valor que viene después de `v`: tras la K, el As. */
export const siguienteValorMentiroso = (v: number) => (v % REY) + 1;

const siguienteAsiento = (a: Asiento, n: number) => (a + 1) % n;

const cartasDelMonton = (e: EstadoMentiroso) => e.monton.flatMap((b) => b.cartas);

/** Con la última bajada se quedó sin cartas: el siguiente solo puede creer o desconfiar. */
function pendienteDeVictoria(e: EstadoMentiroso): boolean {
  const ultima = e.monton.at(-1);
  return ultima !== undefined && e.manos[ultima.asiento]!.length === 0;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const mentiroso: Juego<ConfigMentiroso, EstadoMentiroso, AccionMentiroso, VistaMentiroso> = {
  id: 'mentiroso',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Mentiroso se juega de 3 a 6 jugadores');
    }
    const n = config.jugadores;
    const { cartas, azar } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    // Una a una desde el asiento 0: los primeros pueden tener una carta más.
    const manos = Array.from({ length: n }, (_, a) => cartas.filter((_, i) => i % n === a));
    return ok({
      config: { jugadores: n },
      azar,
      manos,
      monton: [],
      valor: 1,
      turno: 0,
      marcadas: [],
      revelaciones: [],
      ganador: null,
    });
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (e.ganador !== null || asiento !== e.turno) return [];
    if (pendienteDeVictoria(e)) return [{ tipo: 'creer' }, { tipo: 'desconfiar' }];
    const acciones: AccionMentiroso[] = [];
    if (e.monton.length > 0 && e.marcadas.length === 0) acciones.push({ tipo: 'desconfiar' });
    if (e.marcadas.length > 0) acciones.push({ tipo: 'bajar' });
    for (const carta of e.marcadas) acciones.push({ tipo: 'desmarcar', carta });
    if (e.marcadas.length < MAXIMO_BAJADA_MENTIROSO) {
      for (const carta of e.manos[asiento]!) {
        if (!e.marcadas.includes(carta)) acciones.push({ tipo: 'marcar', carta });
      }
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    switch (accion.tipo) {
      case 'marcar':
        return { ...e, marcadas: [...e.marcadas, accion.carta] };
      case 'desmarcar':
        return { ...e, marcadas: e.marcadas.filter((c) => c !== accion.carta) };
      case 'bajar':
        return {
          ...e,
          manos: e.manos.map((m, a) =>
            a === asiento ? m.filter((c) => !e.marcadas.includes(c)) : m,
          ),
          monton: [...e.monton, { asiento, cartas: e.marcadas, valor: e.valor }],
          valor: siguienteValorMentiroso(e.valor),
          turno: siguienteAsiento(asiento, n),
          marcadas: [],
        };
      case 'creer':
        return { ...e, ganador: e.monton.at(-1)!.asiento };
      case 'desconfiar': {
        const ultima = e.monton.at(-1)!;
        const mentia = ultima.cartas.some((c) => valorMentiroso(c) !== ultima.valor);
        const seLleva = mentia ? ultima.asiento : asiento;
        const todas = cartasDelMonton(e);
        const gana = !mentia && e.manos[ultima.asiento]!.length === 0;
        return {
          ...e,
          manos: e.manos.map((m, a) => (a === seLleva ? [...m, ...todas] : m)),
          monton: [],
          turno: asiento,
          revelaciones: [
            ...e.revelaciones,
            {
              bajo: ultima.asiento,
              desconfio: asiento,
              cartas: ultima.cartas,
              valor: ultima.valor,
              mentia,
              seLleva,
              cuantas: todas.length,
            },
          ],
          ganador: gana ? ultima.asiento : null,
        };
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      monton: cartasDelMonton(e).length,
      bajadas: e.monton.map((b) => ({
        asiento: b.asiento,
        cuantas: b.cartas.length,
        valor: b.valor,
      })),
      misCartasEnMonton:
        asiento === null
          ? []
          : e.monton.filter((b) => b.asiento === asiento).flatMap((b) => b.cartas),
      valor: e.valor,
      turno: e.ganador === null ? e.turno : null,
      marcadas: asiento === e.turno ? [...e.marcadas] : [],
      revelaciones: [...e.revelaciones],
      ganador: e.ganador,
    };
  },

  resultado(e): Fin | null {
    if (e.ganador === null) return null;
    // La puntuación: las cartas que le quedan a cada uno, en negativo.
    return { ganadores: [e.ganador], empate: false, puntos: e.manos.map((m) => -m.length) };
  },
};
