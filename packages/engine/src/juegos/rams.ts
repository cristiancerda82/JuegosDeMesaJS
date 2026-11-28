import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  type IdCarta,
  type PaloEspanol,
  type PaloFrances,
} from '../baraja/cartas';
import {
  cartaGanadora,
  cartasObligadas,
  type CartaJugada,
  type ValoresBazas,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigRams {
  readonly jugadores: 3 | 4 | 5 | 6;
}

export const CONFIG_RAMS_POR_DEFECTO: ConfigRams = { jugadores: 4 };

/** Fichas con las que empieza cada jugador, y las que toma quien queda ramsé. */
export const FICHAS_RAMS = 5;

/** As, Rey, Dama, Jota, 10, 9, 8 y 7; las cartas no valen puntos. */
export const VALORES_RAMS: ValoresBazas = { orden: [1, 13, 12, 11, 10, 9, 8, 7], puntos: {} };

/** Lo que dice cada uno: juega, pasa o juega con la niña. */
export type DichoRams = 'rams' | 'paso' | 'nina';
export type FaseRams = 'hablar' | 'descartar' | 'jugar';

export interface BazaRams {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface ResultadoManoRams {
  readonly repartidor: Asiento;
  /** Lo que dijo cada uno (el que reparte siempre juega); `null` sin cartas en la mano. */
  readonly dichos: readonly (DichoRams | null)[];
  readonly bazas: readonly number[];
  /** Quienes jugaron sin hacer ninguna baza y tomaron 5 fichas. */
  readonly ramses: readonly Asiento[];
  /** Todos pasaron y el que reparte ganó la mano sin jugarla. */
  readonly sinJugar: boolean;
  readonly fichasTras: readonly number[];
}

export interface EstadoRams {
  readonly config: ConfigRams;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseRams;
  /** Quienes tienen cartas en esta mano: los que aún tenían fichas al repartir. */
  readonly enJuego: readonly boolean[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly nina: readonly IdCarta[];
  readonly ninaDe: Asiento | null;
  /** La mano que dejó quien cogió la niña: queda fuera, boca abajo. */
  readonly dejada: readonly IdCarta[];
  readonly pinte: IdCarta;
  readonly triunfo: PaloFrances;
  /** El que reparte ya se quedó el pinte. */
  readonly pinteCogido: boolean;
  readonly descarte: IdCarta | null;
  /** Las cartas que no se repartieron. */
  readonly resto: readonly IdCarta[];
  /** Lo que ha dicho cada uno; `null` si aún no ha hablado o no tiene cartas. */
  readonly dichos: readonly (DichoRams | null)[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaRams[];
  readonly ultimaBaza: BazaRams | null;
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  /**
   * Las fichas de la canasta: 5 por jugador al empezar. El ramsé toma de ella mientras queden;
   * las que se quitan con las bazas van aparte y no vuelven.
   */
  readonly canasta: number;
  /** El número de la mano (desde 1) en que cada uno se quedó sin fichas; `null` si aún tiene. */
  readonly terminoEn: readonly (number | null)[];
  readonly resultadosManos: readonly ResultadoManoRams[];
}

export type AccionRams =
  | { readonly tipo: 'rams' }
  | { readonly tipo: 'paso' }
  | { readonly tipo: 'nina' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaRams {
  readonly config: ConfigRams;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enJuego: readonly boolean[];
  readonly mazo: 0;
  /** El pinte en la mesa, hasta que el que reparte se lo queda. */
  readonly muestra: IdCarta | null;
  readonly pinte: IdCarta;
  readonly pinteCogido: boolean;
  readonly triunfo: PaloFrances;
  readonly cartasNina: number;
  readonly ninaDe: Asiento | null;
  readonly fase: FaseRams;
  readonly dichos: readonly (DichoRams | null)[];
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaRams[];
  readonly ultimaBaza: BazaRams | null;
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly canasta: number;
  readonly terminoEn: readonly (number | null)[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoRams[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const paloRams = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
// Las funciones de bazas comparan los palos como texto: valen también para la baraja francesa.
const comoPalo = (p: PaloFrances) => p as unknown as PaloEspanol;

/** La baraja de 32 cartas: del As al 7 de cada palo. */
export const barajaRams = (): IdCarta[] =>
  crearBaraja('francesa52').filter((c) => VALORES_RAMS.orden.includes(cartaDeId(c)!.valor));

/** La carta que gana la baza. */
export const ganadoraRams = (mesa: readonly CartaJugada[], triunfo: PaloFrances) =>
  cartaGanadora(mesa, comoPalo(triunfo), VALORES_RAMS);

/** Las cartas que se pueden jugar: subir, fallar y sobrefallar, o echar triunfo igualmente. */
export const cartasLegalesRams = (
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
  asiento: Asiento,
) =>
  cartasObligadas(mano, mesa, comoPalo(triunfo), {
    asiento,
    montarSobreCompanero: true,
    valores: VALORES_RAMS,
    sobrefalloLibre: false,
  });

/** Si el jugador juega la mano: el que reparte siempre, y los que dijeron «Rams» o la niña. */
export const juegaRams = (e: Pick<EstadoRams, 'dichos'>, a: Asiento) =>
  e.dichos[a] === 'rams' || e.dichos[a] === 'nina';

const terminada = (e: Pick<EstadoRams, 'fichas'>) => e.fichas.filter((f) => f > 0).length <= 1;

/** El siguiente asiento después de `a` (sin contarlo) que cumple `cumple`. */
function siguienteQue(n: number, a: Asiento, cumple: (b: Asiento) => boolean): Asiento | null {
  for (let k = 1; k <= n; k++) {
    const b = (a + k) % n;
    if (cumple(b)) return b;
  }
  return null;
}

/** Quien habla ahora: el siguiente con cartas que aún no ha hablado (nunca el que reparte). */
const porHablar = (
  e: Pick<EstadoRams, 'config' | 'enJuego' | 'dichos' | 'repartidor'>,
  a: Asiento,
) => siguienteQue(e.config.jugadores, a, (b) => e.enJuego[b]! && e.dichos[b] === null);

function nuevaMano(
  base: Pick<EstadoRams, 'config' | 'fichas' | 'canasta' | 'terminoEn' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoRams {
  const n = base.config.jugadores;
  const enJuego = base.fichas.map((f) => f > 0);
  const porJugador = enJuego.filter(Boolean).length === 6 ? 4 : 5;
  const { cartas, azar: sig } = barajar(barajaRams(), azar);
  const manos: IdCarta[][] = Array.from({ length: n }, () => []);
  let k = 0;
  // Desde el siguiente al que reparte, solo a los que tienen fichas.
  for (let i = 1; i <= n; i++) {
    const a = (repartidor + i) % n;
    if (!enJuego[a]) continue;
    manos[a] = cartas.slice(k, k + porJugador);
    k += porJugador;
  }
  // La niña tiene tantas cartas como cada mano, para que quien la coja juegue las mismas bazas.
  const pinte = cartas[k + porJugador]!;
  const dichos: (DichoRams | null)[] = enJuego.map((_, a) => (a === repartidor ? 'rams' : null));
  const estado: EstadoRams = {
    ...base,
    azar: sig,
    repartidor,
    fase: 'hablar',
    enJuego,
    manos,
    nina: cartas.slice(k, k + porJugador),
    ninaDe: null,
    dejada: [],
    pinte,
    triunfo: paloRams(pinte),
    pinteCogido: false,
    descarte: null,
    resto: cartas.slice(k + porJugador + 1),
    dichos,
    turno: repartidor,
    mesa: [],
    bazasJugadas: [],
    ultimaBaza: null,
    bazas: new Array<number>(n).fill(0),
  };
  return { ...estado, turno: porHablar(estado, repartidor)! };
}

/** Cierra la mano: fichas por bazas, ramsés y retiradas; reparte otra o termina. */
function cerrarMano(e: EstadoRams, sinJugar: boolean): EstadoRams {
  const numero = e.resultadosManos.length + 1;
  const ramses = e.dichos.flatMap((_, a) => (juegaRams(e, a) && e.bazas[a] === 0 ? [a] : []));
  // Los ramsés toman de la canasta, por orden de asiento, mientras queden fichas.
  let canasta = e.canasta;
  const fichas = e.fichas.map((f, a) => {
    if (!juegaRams(e, a)) return f;
    if (!ramses.includes(a)) return Math.max(0, f - e.bazas[a]!);
    const toma = Math.min(FICHAS_RAMS, canasta);
    canasta -= toma;
    return f + toma;
  });
  const terminoEn = e.terminoEn.map((t, a) => t ?? (fichas[a] === 0 ? numero : null));
  const cerrado: EstadoRams = {
    ...e,
    fichas,
    canasta,
    terminoEn,
    resultadosManos: [
      ...e.resultadosManos,
      {
        repartidor: e.repartidor,
        dichos: e.dichos.map((d, a) => (e.enJuego[a] ? d : null)),
        bazas: e.bazas,
        ramses,
        sinJugar,
        fichasTras: fichas,
      },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  const n = e.config.jugadores;
  return nuevaMano(
    cerrado,
    siguienteQue(n, e.repartidor, (b) => fichas[b]! > 0)!,
    e.azar,
  );
}

/** Termina el hablar: si nadie más juega, el que reparte gana la mano; si no, descarta. */
function finHablar(e: EstadoRams): EstadoRams {
  const alguien = e.dichos.some((d, a) => a !== e.repartidor && juegaRams(e, a));
  if (!alguien) {
    const cartas = e.manos[e.repartidor]!.length;
    return cerrarMano(
      { ...e, bazas: e.bazas.map((b, a) => (a === e.repartidor ? cartas : b)) },
      true,
    );
  }
  return { ...e, fase: 'descartar', turno: e.repartidor };
}

function resolverBaza(e: EstadoRams): EstadoRams {
  const ganador = ganadoraRams(e.mesa, e.triunfo).asiento;
  const baza: BazaRams = { cartas: e.mesa, ganador };
  const resuelto: EstadoRams = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasJugadas: [...e.bazasJugadas, baza],
    ultimaBaza: baza,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  return resuelto.manos.every((m, a) => !juegaRams(e, a) || m.length === 0)
    ? cerrarMano(resuelto, false)
    : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const rams: Juego<ConfigRams, EstadoRams, AccionRams, VistaRams> = {
  id: 'rams',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Rams se juega de 3 a 6 jugadores');
    }
    const n = config.jugadores;
    // Empieza repartiendo el último asiento, así habla el asiento 0.
    return ok(
      nuevaMano(
        {
          config: { jugadores: n },
          fichas: new Array<number>(n).fill(FICHAS_RAMS),
          canasta: n * FICHAS_RAMS,
          terminoEn: new Array<number | null>(n).fill(null),
          resultadosManos: [],
        },
        n - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'hablar') {
      const acciones: AccionRams[] = [{ tipo: 'rams' }, { tipo: 'paso' }];
      if (e.ninaDe === null) acciones.push({ tipo: 'nina' });
      return acciones;
    }
    if (e.fase === 'descartar') {
      return e.manos[asiento]!.map((carta) => ({ tipo: 'descartar' as const, carta }));
    }
    return cartasLegalesRams(e.manos[asiento]!, e.mesa, e.triunfo, asiento).map((carta) => ({
      tipo: 'jugar' as const,
      carta,
    }));
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    switch (accion.tipo) {
      case 'rams':
      case 'paso':
      case 'nina': {
        const conNina = accion.tipo === 'nina';
        const hablado: EstadoRams = {
          ...e,
          dichos: e.dichos.map((d, a) => (a === asiento ? accion.tipo : d)),
          manos: conNina ? e.manos.map((m, a) => (a === asiento ? e.nina : m)) : e.manos,
          nina: conNina ? [] : e.nina,
          ninaDe: conNina ? asiento : e.ninaDe,
          dejada: conNina ? e.manos[asiento]! : e.dejada,
        };
        const siguiente = porHablar(hablado, asiento);
        return siguiente === null ? finHablar(hablado) : { ...hablado, turno: siguiente };
      }
      case 'descartar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? [...m.filter((c) => c !== accion.carta), e.pinte] : m,
        );
        // Sale el primero que juega después del que reparte.
        const sale = siguienteQue(n, e.repartidor, (b) => juegaRams(e, b))!;
        return {
          ...e,
          fase: 'jugar',
          manos,
          pinteCogido: true,
          descarte: accion.carta,
          turno: sale,
        };
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoRams = { ...e, manos, mesa };
        const enLaBaza = e.dichos.filter((_, a) => juegaRams(e, a)).length;
        return mesa.length < enLaBaza
          ? { ...jugado, turno: siguienteQue(n, asiento, (b) => juegaRams(e, b))! }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enJuego: [...e.enJuego],
      mazo: 0,
      muestra: e.pinteCogido ? null : e.pinte,
      pinte: e.pinte,
      pinteCogido: e.pinteCogido,
      triunfo: e.triunfo,
      cartasNina: e.nina.length,
      ninaDe: e.ninaDe,
      fase: e.fase,
      dichos: [...e.dichos],
      repartidor: e.repartidor,
      turno: terminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      bazasJugadas: [...e.bazasJugadas],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      fichas: [...e.fichas],
      canasta: e.canasta,
      terminoEn: [...e.terminoEn],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const terminos = e.terminoEn.filter((t): t is number => t !== null);
    const primera = Math.min(...terminos);
    const ganadores = e.terminoEn.flatMap((t, a) => (t === primera ? [a] : []));
    const manos = e.resultadosManos.length;
    // Antes se quitó las fichas, más puntos; el que pierde, aún menos por las que le quedan.
    const puntos = e.terminoEn.map((t, a) => (t === null ? -manos - e.fichas[a]! : -t));
    return { ganadores, empate: false, puntos };
  },
};
