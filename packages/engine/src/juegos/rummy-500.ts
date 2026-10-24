import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  anadidosRummy,
  bajadasRummy,
  combinacionRummy,
  conAnadido,
  puntosEnManoRummy,
  puntosEnMesaRummy,
  type CombinacionRummy500,
} from './rummy-500-combinaciones';

export * from './rummy-500-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigRummy500 {
  /** De 2 a 4 jugadores, cada uno por su cuenta. */
  readonly jugadores: 2 | 3 | 4;
}

export const CONFIG_RUMMY_500_POR_DEFECTO: ConfigRummy500 = { jugadores: 2 };

/** Puntos con los que termina la partida. */
export const OBJETIVO_RUMMY_500 = 500;

/** Cartas por jugador: 13 con 2 jugadores y 7 con 3 o 4. */
export const cartasPorJugadorRummy = (jugadores: number) => (jugadores === 2 ? 13 : 7);

export type FaseRummy500 = 'robar' | 'bajar';

export type AccionRummy500 =
  | { readonly tipo: 'robarMazo' }
  | { readonly tipo: 'robarDescarte'; readonly desde: number }
  | { readonly tipo: 'bajar'; readonly cartas: readonly IdCarta[] }
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly carta: IdCarta;
      readonly arriba?: boolean;
    }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta };

export interface ResultadoManoRummy500 {
  /** Quien descartó su última carta; `null` si la mano terminó por quedarse sin mazo. */
  readonly cerro: Asiento | null;
  /** Puntos que puso cada uno en la mesa. */
  readonly bajado: readonly number[];
  /** Puntos de las cartas que le quedaron en la mano. */
  readonly enMano: readonly number[];
  readonly cartasEnMano: readonly (readonly IdCarta[])[];
  readonly puntosMano: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoRummy500 {
  readonly config: ConfigRummy500;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly numeroMano: number;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Boca abajo; se roba la última. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba y abierto, de abajo arriba. */
  readonly descarte: readonly IdCarta[];
  readonly combinaciones: readonly CombinacionRummy500[];
  readonly siguienteId: number;
  readonly turno: Asiento;
  readonly fase: FaseRummy500;
  /** Carta cogida del descarte (la de más abajo de varias) que hay que usar en este turno. */
  readonly obligada: IdCarta | null;
  /** Carta cogida sola de arriba del descarte, que no se puede soltar en este turno. */
  readonly noDescartar: IdCarta | null;
  readonly puntos: readonly number[];
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly tipo: AccionRummy500['tipo'];
    readonly cartas: readonly IdCarta[];
  } | null;
  readonly resultadosManos: readonly ResultadoManoRummy500[];
}

export interface VistaRummy500 {
  readonly config: ConfigRummy500;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly descarte: readonly IdCarta[];
  readonly combinaciones: readonly CombinacionRummy500[];
  readonly siguienteId: number;
  readonly repartidor: Asiento;
  readonly numeroMano: number;
  readonly turno: Asiento | null;
  readonly fase: FaseRummy500;
  readonly obligada: IdCarta | null;
  readonly noDescartar: IdCarta | null;
  readonly puntos: readonly number[];
  readonly ultimaAccion: EstadoRummy500['ultimaAccion'];
  readonly resultadosManos: readonly ResultadoManoRummy500[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

function ganadorPartida(puntos: readonly number[]): Asiento | null {
  const maximo = Math.max(...puntos);
  if (maximo < OBJETIVO_RUMMY_500) return null;
  const arriba = puntos.flatMap((p, a) => (p === maximo ? [a] : []));
  return arriba.length === 1 ? arriba[0]! : null;
}

const terminada = (e: Pick<EstadoRummy500, 'puntos' | 'resultadosManos'>) =>
  e.resultadosManos.length > 0 && ganadorPartida(e.puntos) !== null;

function nuevaMano(
  config: ConfigRummy500,
  azar: EstadoAzar,
  repartidor: Asiento,
  numeroMano: number,
  puntos: readonly number[],
  resultadosManos: readonly ResultadoManoRummy500[],
): EstadoRummy500 {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas, new Array<number>(n).fill(cartasPorJugadorRummy(n)));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos: IdCarta[][] = new Array<IdCarta[]>(n);
  for (let k = 0; k < n; k++) manos[(sale + k) % n] = reparto.valor.manos[k]!;
  const [primera, ...mazo] = reparto.valor.mazo as [IdCarta, ...IdCarta[]];
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    numeroMano,
    manos,
    mazo,
    descarte: [primera],
    combinaciones: [],
    siguienteId: 0,
    turno: sale,
    fase: 'robar',
    obligada: null,
    noDescartar: null,
    puntos,
    ultimaAccion: null,
    resultadosManos,
  };
}

/** Puntúa la mano y reparte otra, salvo que la partida haya terminado. */
function cerrarMano(e: EstadoRummy500, cerro: Asiento | null): EstadoRummy500 {
  const n = e.config.jugadores;
  const bajado = new Array<number>(n).fill(0);
  for (const comb of e.combinaciones) {
    for (const { carta, de } of comb.cartas) bajado[de]! += puntosEnMesaRummy(carta, comb);
  }
  const enMano = e.manos.map((m) => m.reduce((s, c) => s + puntosEnManoRummy(c), 0));
  const puntosMano = bajado.map((b, a) => b - enMano[a]!);
  const puntos = e.puntos.map((p, a) => p + puntosMano[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    { cerro, bajado, enMano, cartasEnMano: e.manos, puntosMano, totalesTras: puntos },
  ];
  if (ganadorPartida(puntos) !== null) {
    return { ...e, puntos, resultadosManos };
  }
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, n),
    e.numeroMano + 1,
    puntos,
    resultadosManos,
  );
}

/** La carta se puede usar con estas cartas en la mano: en una bajada o añadida a la mesa. */
function sePuedeUsar(
  carta: IdCarta,
  mano: readonly IdCarta[],
  combinaciones: readonly CombinacionRummy500[],
): boolean {
  if (anadidosRummy([carta], combinaciones).length > 0 && mano.length >= 2) return true;
  return bajadasRummy(mano).some((b) => b.includes(carta) && mano.length - b.length >= 1);
}

/** Tras quitar estas cartas de la mano, le queda alguna que pueda descartar. */
const quedaDescarte = (e: EstadoRummy500, mano: readonly IdCarta[], quitadas: readonly IdCarta[]) =>
  mano.some((c) => !quitadas.includes(c) && c !== e.noDescartar);

// ── Juego ────────────────────────────────────────────────────────────────────

export const rummy500: Juego<ConfigRummy500, EstadoRummy500, AccionRummy500, VistaRummy500> = {
  id: 'rummy500',

  crear(config, semilla) {
    if (![2, 3, 4].includes(config.jugadores)) {
      return error('El Rummy 500 se juega de 2 a 4 jugadores');
    }
    const limpia: ConfigRummy500 = { jugadores: config.jugadores };
    const n = limpia.jugadores;
    // Reparte el último asiento, así empieza el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), n - 1, 1, new Array<number>(n).fill(0), []));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;

    if (e.fase === 'robar') {
      const acciones: AccionRummy500[] = [];
      if (e.mazo.length > 0) acciones.push({ tipo: 'robarMazo' });
      const arriba = e.descarte.length - 1;
      e.descarte.forEach((carta, i) => {
        if (i === arriba) acciones.push({ tipo: 'robarDescarte', desde: i });
        else if (sePuedeUsar(carta, [...mano, ...e.descarte.slice(i)], e.combinaciones)) {
          acciones.push({ tipo: 'robarDescarte', desde: i });
        }
      });
      return acciones;
    }

    const acciones: AccionRummy500[] = [];
    for (const cartas of bajadasRummy(mano)) {
      if (e.obligada !== null && !cartas.includes(e.obligada)) continue;
      if (quedaDescarte(e, mano, cartas)) acciones.push({ tipo: 'bajar', cartas });
    }
    for (const a of anadidosRummy(mano, e.combinaciones)) {
      if (e.obligada !== null && a.carta !== e.obligada) continue;
      if (quedaDescarte(e, mano, [a.carta])) acciones.push({ tipo: 'anadir', ...a });
    }
    if (e.obligada === null) {
      for (const carta of mano) {
        if (carta !== e.noDescartar) acciones.push({ tipo: 'descartar', carta });
      }
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    const mano = e.manos[asiento]!;
    const conMano = (nueva: readonly IdCarta[]) =>
      e.manos.map((m, a) => (a === asiento ? nueva : m));

    switch (accion.tipo) {
      case 'robarMazo': {
        const carta = e.mazo.at(-1)!;
        return {
          ...e,
          mazo: e.mazo.slice(0, -1),
          manos: conMano([...mano, carta]),
          fase: 'bajar',
          ultimaAccion: { asiento, tipo: 'robarMazo', cartas: [] },
        };
      }
      case 'robarDescarte': {
        const cogidas = e.descarte.slice(accion.desde);
        const sola = cogidas.length === 1;
        return {
          ...e,
          descarte: e.descarte.slice(0, accion.desde),
          manos: conMano([...mano, ...cogidas]),
          fase: 'bajar',
          obligada: sola ? null : cogidas[0]!,
          noDescartar: sola ? cogidas[0]! : null,
          ultimaAccion: { asiento, tipo: 'robarDescarte', cartas: cogidas },
        };
      }
      case 'bajar': {
        const comb = combinacionRummy(accion.cartas)!;
        const quitar = new Set(accion.cartas);
        return {
          ...e,
          manos: conMano(mano.filter((c) => !quitar.has(c))),
          combinaciones: [
            ...e.combinaciones,
            {
              id: e.siguienteId,
              tipo: comb.tipo,
              cartas: comb.cartas.map((carta) => ({ carta, de: asiento })),
            },
          ],
          siguienteId: e.siguienteId + 1,
          obligada: e.obligada !== null && quitar.has(e.obligada) ? null : e.obligada,
          noDescartar: e.noDescartar !== null && quitar.has(e.noDescartar) ? null : e.noDescartar,
          ultimaAccion: { asiento, tipo: 'bajar', cartas: comb.cartas },
        };
      }
      case 'anadir':
        return {
          ...e,
          manos: conMano(mano.filter((c) => c !== accion.carta)),
          combinaciones: e.combinaciones.map((c) =>
            c.id === accion.combinacion ? conAnadido(c, accion.carta, asiento, accion.arriba) : c,
          ),
          obligada: e.obligada === accion.carta ? null : e.obligada,
          noDescartar: e.noDescartar === accion.carta ? null : e.noDescartar,
          ultimaAccion: { asiento, tipo: 'anadir', cartas: [accion.carta] },
        };
      case 'descartar': {
        const restante = mano.filter((c) => c !== accion.carta);
        const tras: EstadoRummy500 = {
          ...e,
          manos: conMano(restante),
          descarte: [...e.descarte, accion.carta],
          noDescartar: null,
          ultimaAccion: { asiento, tipo: 'descartar', cartas: [accion.carta] },
        };
        if (restante.length === 0) return cerrarMano(tras, asiento);
        // Al siguiente le toca robar: sin mazo, la mano termina.
        if (tras.mazo.length === 0) return cerrarMano(tras, null);
        return { ...tras, turno: siguiente(asiento, e.config.jugadores), fase: 'robar' };
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      combinaciones: e.combinaciones,
      siguienteId: e.siguienteId,
      repartidor: e.repartidor,
      numeroMano: e.numeroMano,
      turno: terminada(e) ? null : e.turno,
      fase: e.fase,
      obligada: e.obligada,
      noDescartar: e.noDescartar,
      puntos: [...e.puntos],
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const ganador = ganadorPartida(e.puntos)!;
    return { ganadores: [ganador], empate: false, puntos: [...e.puntos] };
  },
};

/** Las cartas de una bajada forman una combinación válida (para el cliente). */
export const esBajadaRummy = (cartas: readonly IdCarta[]) => combinacionRummy(cartas) !== null;
