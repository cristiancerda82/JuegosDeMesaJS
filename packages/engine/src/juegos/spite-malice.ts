import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** El Spite and Malice clásico no tiene opciones: 2 jugadores, montones de 20 y 4 descartes. */
export interface ConfigSpiteMalice {
  readonly jugadores: 2;
}

export const CONFIG_SPITE_MALICE_POR_DEFECTO: ConfigSpiteMalice = { jugadores: 2 };

const JUGADORES = 2;
export const CARTAS_MONTON = 20;
export const CARTAS_MANO_SPITE = 5;
export const PILAS_DESCARTE = 4;
export const ESCALERAS = 4;
/** La Q completa la escalera. */
export const VALOR_FINAL = 12;
const REY = 13;

export type OrigenSpite =
  | { readonly tipo: 'monton' }
  | { readonly tipo: 'mano'; readonly carta: IdCarta }
  | { readonly tipo: 'descarte'; readonly pila: number };

export type AccionSpiteMalice =
  | { readonly tipo: 'jugar'; readonly desde: OrigenSpite; readonly escalera: number }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta; readonly pila: number }
  | { readonly tipo: 'pasar' };

export interface AccionSpiteHecha {
  readonly asiento: Asiento;
  readonly accion: AccionSpiteMalice;
  /** La carta que se jugó, para verla aunque venga del montón o de un descarte. */
  readonly carta?: IdCarta;
}

export interface EstadoSpiteMalice {
  readonly config: ConfigSpiteMalice;
  readonly azar: EstadoAzar;
  /** El montón de cada jugador; la última carta es la de arriba, boca arriba. */
  readonly montones: readonly (readonly IdCarta[])[];
  readonly manos: readonly (readonly IdCarta[])[];
  /** Los 4 descartes de cada jugador; la última carta de cada uno es la de arriba. */
  readonly descartes: readonly (readonly (readonly IdCarta[])[])[];
  /** Las 4 escaleras del centro; vacía si el sitio está libre. */
  readonly escaleras: readonly (readonly IdCarta[])[];
  /** Las cartas de las escaleras terminadas, que rehacen el mazo. */
  readonly completas: readonly IdCarta[];
  /** El siguiente que se roba es el último. */
  readonly mazo: readonly IdCarta[];
  readonly turno: Asiento;
  readonly pasesSeguidos: number;
  readonly ganador: Asiento | 'empate' | null;
  readonly ultimaAccion: AccionSpiteHecha | null;
}

export interface MontonVisible {
  readonly cartas: number;
  readonly arriba: IdCarta | null;
}

export interface VistaSpiteMalice {
  readonly config: ConfigSpiteMalice;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly montones: readonly MontonVisible[];
  readonly descartes: readonly (readonly (readonly IdCarta[])[])[];
  readonly escaleras: readonly (readonly IdCarta[])[];
  readonly completas: readonly IdCarta[];
  readonly enMazo: number;
  readonly turno: Asiento | null;
  readonly pasesSeguidos: number;
  readonly ganador: Asiento | 'empate' | null;
  readonly ultimaAccion: AccionSpiteHecha | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** Dos barajas francesas: cada carta está dos veces, con el mismo identificador. */
export const BARAJA_SPITE_MALICE: readonly IdCarta[] = [
  ...crearBaraja('francesa52'),
  ...crearBaraja('francesa52'),
];

export const valorSpite = (c: IdCarta) => cartaDeId(c)!.valor;
export const esReySpite = (c: IdCarta) => valorSpite(c) === REY;

/** La carta va en la escalera si es un K o el valor siguiente (una escalera libre va por 0). */
export const puedeIr = (c: IdCarta, escalera: readonly IdCarta[]) =>
  esReySpite(c) || valorSpite(c) === escalera.length + 1;

/** Quita una sola copia de la carta. */
export function quitarUna(cartas: readonly IdCarta[], carta: IdCarta): IdCarta[] {
  const i = cartas.indexOf(carta);
  return i < 0 ? [...cartas] : [...cartas.slice(0, i), ...cartas.slice(i + 1)];
}

/** Quita una copia de cada carta de `quitar` (multiconjuntos). */
export function restarCartas(cartas: readonly IdCarta[], quitar: readonly IdCarta[]): IdCarta[] {
  let resto = [...cartas];
  for (const c of quitar) resto = quitarUna(resto, c);
  return resto;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const otro = (a: Asiento): Asiento => (a === 0 ? 1 : 0);

/** Roba hasta tener 5 cartas, rehaciendo el mazo con las completas si se acaba. */
function robar(e: EstadoSpiteMalice, asiento: Asiento): EstadoSpiteMalice {
  let mazo = [...e.mazo];
  let completas = e.completas;
  let azar = e.azar;
  const mano = [...e.manos[asiento]!];
  while (mano.length < CARTAS_MANO_SPITE) {
    if (mazo.length === 0) {
      if (completas.length === 0) break;
      const b = barajar(completas, azar);
      mazo = [...b.cartas];
      azar = b.azar;
      completas = [];
    }
    mano.push(mazo.pop()!);
  }
  return {
    ...e,
    azar,
    mazo,
    completas,
    manos: e.manos.map((m, a) => (a === asiento ? mano : m)),
  };
}

/** Las cartas de arriba que el jugador puede mover, con su origen. */
function origenes(e: EstadoSpiteMalice, asiento: Asiento): [OrigenSpite, IdCarta][] {
  const lista: [OrigenSpite, IdCarta][] = [];
  const monton = e.montones[asiento]!;
  if (monton.length > 0) lista.push([{ tipo: 'monton' }, monton.at(-1)!]);
  for (const carta of new Set(e.manos[asiento]!)) lista.push([{ tipo: 'mano', carta }, carta]);
  e.descartes[asiento]!.forEach((pila, i) => {
    if (pila.length > 0) lista.push([{ tipo: 'descarte', pila: i }, pila.at(-1)!]);
  });
  return lista;
}

/** Las escaleras donde va la carta: las empezadas, y el primer sitio libre. */
export function destinosSpite(
  escaleras: readonly (readonly IdCarta[])[],
  carta: IdCarta,
): number[] {
  const destinos: number[] = [];
  const libre = escaleras.findIndex((x) => x.length === 0);
  escaleras.forEach((esc, i) => {
    if (esc.length > 0 && puedeIr(carta, esc)) destinos.push(i);
  });
  if (libre >= 0 && puedeIr(carta, [])) destinos.push(libre);
  return destinos.sort((a, b) => a - b);
}

function jugadas(e: EstadoSpiteMalice, asiento: Asiento): AccionSpiteMalice[] {
  return origenes(e, asiento).flatMap(([desde, carta]) =>
    destinosSpite(e.escaleras, carta).map((escalera): AccionSpiteMalice => ({
      tipo: 'jugar',
      desde,
      escalera,
    })),
  );
}

function cartaDe(e: EstadoSpiteMalice, asiento: Asiento, desde: OrigenSpite): IdCarta {
  if (desde.tipo === 'monton') return e.montones[asiento]!.at(-1)!;
  if (desde.tipo === 'mano') return desde.carta;
  return e.descartes[asiento]![desde.pila]!.at(-1)!;
}

/** Pasa el turno al rival, que roba hasta 5. */
const pasarTurno = (e: EstadoSpiteMalice, asiento: Asiento): EstadoSpiteMalice =>
  robar({ ...e, turno: otro(asiento) }, otro(asiento));

// ── Juego ────────────────────────────────────────────────────────────────────

export const spiteMalice: Juego<
  ConfigSpiteMalice,
  EstadoSpiteMalice,
  AccionSpiteMalice,
  VistaSpiteMalice
> = {
  id: 'spiteMalice',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Spite and Malice se juega entre 2');
    const { cartas, azar } = barajar(BARAJA_SPITE_MALICE, crearAzar(semilla));
    const m = CARTAS_MONTON;
    const h = CARTAS_MANO_SPITE;
    return ok({
      config: { jugadores: 2 },
      azar,
      montones: [cartas.slice(0, m), cartas.slice(m, 2 * m)],
      manos: [cartas.slice(2 * m, 2 * m + h), cartas.slice(2 * m + h, 2 * m + 2 * h)],
      descartes: [
        Array.from({ length: PILAS_DESCARTE }, () => []),
        Array.from({ length: PILAS_DESCARTE }, () => []),
      ],
      escaleras: Array.from({ length: ESCALERAS }, () => []),
      completas: [],
      mazo: cartas.slice(2 * m + 2 * h),
      turno: 0,
      pasesSeguidos: 0,
      ganador: null,
      ultimaAccion: null,
    });
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (e.ganador !== null || asiento !== e.turno) return [];
    const juego = jugadas(e, asiento);
    const descartes = [...new Set(e.manos[asiento]!)].flatMap((carta) =>
      Array.from({ length: PILAS_DESCARTE }, (_, pila): AccionSpiteMalice => ({
        tipo: 'descartar',
        carta,
        pila,
      })),
    );
    if (juego.length === 0 && descartes.length === 0) return [{ tipo: 'pasar' }];
    return [...juego, ...descartes];
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pasar': {
        const pasesSeguidos = e.pasesSeguidos + 1;
        const hecho: EstadoSpiteMalice = {
          ...e,
          pasesSeguidos,
          ultimaAccion: { asiento, accion },
        };
        if (pasesSeguidos >= JUGADORES) return { ...hecho, ganador: 'empate' };
        return pasarTurno(hecho, asiento);
      }
      case 'descartar': {
        const hecho: EstadoSpiteMalice = {
          ...e,
          pasesSeguidos: 0,
          ultimaAccion: { asiento, accion },
          manos: e.manos.map((m, a) => (a === asiento ? quitarUna(m, accion.carta) : m)),
          descartes: e.descartes.map((ds, a) =>
            a === asiento ? ds.map((p, i) => (i === accion.pila ? [...p, accion.carta] : p)) : ds,
          ),
        };
        return pasarTurno(hecho, asiento);
      }
      case 'jugar': {
        const { desde } = accion;
        const carta = cartaDe(e, asiento, desde);
        let montones = e.montones;
        let manos = e.manos;
        let descartes = e.descartes;
        if (desde.tipo === 'monton') {
          montones = montones.map((m, a) => (a === asiento ? m.slice(0, -1) : m));
        } else if (desde.tipo === 'mano') {
          manos = manos.map((m, a) => (a === asiento ? quitarUna(m, carta) : m));
        } else {
          descartes = descartes.map((ds, a) =>
            a === asiento ? ds.map((p, i) => (i === desde.pila ? p.slice(0, -1) : p)) : ds,
          );
        }
        const escalera = [...e.escaleras[accion.escalera]!, carta];
        const completa = escalera.length === VALOR_FINAL;
        let jugado: EstadoSpiteMalice = {
          ...e,
          pasesSeguidos: 0,
          ultimaAccion: { asiento, accion, carta },
          montones,
          manos,
          descartes,
          escaleras: e.escaleras.map((x, i) =>
            i === accion.escalera ? (completa ? [] : escalera) : x,
          ),
          completas: completa ? [...e.completas, ...escalera] : e.completas,
        };
        if (jugado.montones[asiento]!.length === 0) return { ...jugado, ganador: asiento };
        if (jugado.manos[asiento]!.length === 0) jugado = robar(jugado, asiento);
        return jugado;
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      montones: e.montones.map((m) => ({ cartas: m.length, arriba: m.at(-1) ?? null })),
      descartes: e.descartes.map((ds) => ds.map((p) => [...p])),
      escaleras: e.escaleras.map((x) => [...x]),
      completas: [...e.completas],
      enMazo: e.mazo.length,
      turno: e.ganador !== null ? null : e.turno,
      pasesSeguidos: e.pasesSeguidos,
      ganador: e.ganador,
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (e.ganador === null) return null;
    const puntos = e.montones.map((m) => m.length);
    if (e.ganador === 'empate') return { ganadores: [], empate: true, puntos };
    return { ganadores: [e.ganador], empate: false, puntos };
  },
};
