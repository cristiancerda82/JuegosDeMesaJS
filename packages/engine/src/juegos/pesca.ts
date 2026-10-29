import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Pesca (Go Fish) de 2 a 6 jugadores, cada uno por su cuenta. */
export interface ConfigPesca {
  readonly jugadores: number;
}

export const CONFIG_PESCA_POR_DEFECTO: ConfigPesca = { jugadores: 4 };

/** Valores de la baraja: As 1… K 13. Hay un cuarteto por valor. */
export const VALORES_PESCA = 13;

/** Una petición del registro público. */
export interface PeticionPesca {
  readonly tipo: 'pedir';
  readonly asiento: Asiento;
  readonly a: Asiento;
  readonly valor: number;
  /** Las cartas que dio el rival (quizá ninguna). */
  readonly dadas: readonly IdCarta[];
  /**
   * Si hubo que pescar: `null` si el rival dio cartas, `'nada'` con el mar vacío, `'otra'` si
   * pescó otro valor, o la carta pescada si era del valor pedido (se enseña).
   */
  readonly pesco: IdCarta | 'otra' | 'nada' | null;
  /** El valor del cuarteto que bajó tras la petición, o `null`. */
  readonly cuarteto: number | null;
}

/** Un jugador sin cartas roba una del mar para poder pedir. */
export interface RoboPesca {
  readonly tipo: 'robar';
  readonly asiento: Asiento;
}

export type RegistroPesca = PeticionPesca | RoboPesca;

export interface EstadoPesca {
  readonly config: ConfigPesca;
  readonly azar: EstadoAzar;
  readonly manos: readonly (readonly IdCarta[])[];
  /** La siguiente que se roba es la última. */
  readonly mar: readonly IdCarta[];
  /** Valores de los cuartetos que ha bajado cada jugador. */
  readonly cuartetos: readonly (readonly number[])[];
  readonly turno: Asiento;
  readonly registro: readonly RegistroPesca[];
}

export type AccionPesca = {
  readonly tipo: 'pedir';
  readonly a: Asiento;
  readonly valor: number;
};

export interface VistaPesca {
  readonly config: ConfigPesca;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enMar: number;
  readonly cuartetos: readonly (readonly number[])[];
  readonly turno: Asiento | null;
  readonly registro: readonly RegistroPesca[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const valorPesca = (c: IdCarta) => cartaDeId(c)!.valor;

/** Cartas del reparto: 7 con 2 o 3 jugadores y 5 con 4 a 6. */
export const cartasRepartoPesca = (jugadores: number) => (jugadores <= 3 ? 7 : 5);

const totalCuartetos = (e: Pick<EstadoPesca, 'cuartetos'>) =>
  e.cuartetos.reduce((s, c) => s + c.length, 0);
const terminada = (e: Pick<EstadoPesca, 'cuartetos'>) => totalCuartetos(e) >= VALORES_PESCA;

/** Baja los cuartetos completos de una mano: la mano sin ellos y sus valores. */
function bajarCuartetos(mano: readonly IdCarta[]): { mano: IdCarta[]; valores: number[] } {
  const cuenta = new Map<number, number>();
  for (const c of mano) cuenta.set(valorPesca(c), (cuenta.get(valorPesca(c)) ?? 0) + 1);
  const valores = [...cuenta].filter(([, n]) => n === 4).map(([v]) => v);
  return { mano: mano.filter((c) => !valores.includes(valorPesca(c))), valores };
}

/** Los valores distintos de una mano, de menor a mayor. */
export const valoresDe = (mano: readonly IdCarta[]) =>
  [...new Set(mano.map(valorPesca))].sort((a, b) => a - b);

/** Rivales a los que `asiento` puede pedir: los que tienen cartas. */
const rivalesConCartas = (e: EstadoPesca, asiento: Asiento) =>
  e.manos.map((_, a) => a).filter((a) => a !== asiento && e.manos[a]!.length > 0);

/**
 * Deja el turno en un jugador que pueda pedir: quien no tiene cartas roba una del mar; quien no
 * puede robar, o no tiene a quién pedir, pasa el turno.
 */
function aQuienLeToca(e: EstadoPesca): EstadoPesca {
  const n = e.config.jugadores;
  let estado = e;
  for (let vueltas = 0; vueltas < 3 * n && !terminada(estado); vueltas++) {
    const t = estado.turno;
    if (estado.manos[t]!.length === 0) {
      if (estado.mar.length === 0) {
        estado = { ...estado, turno: (t + 1) % n };
        continue;
      }
      const carta = estado.mar.at(-1)!;
      estado = {
        ...estado,
        mar: estado.mar.slice(0, -1),
        manos: estado.manos.map((m, a) => (a === t ? [carta] : m)),
        registro: [...estado.registro, { tipo: 'robar', asiento: t }],
      };
    }
    if (rivalesConCartas(estado, t).length > 0) return estado;
    estado = { ...estado, turno: (t + 1) % n };
  }
  return estado;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const pesca: Juego<ConfigPesca, EstadoPesca, AccionPesca, VistaPesca> = {
  id: 'pesca',

  crear(config, semilla) {
    const n = config.jugadores;
    if (!Number.isInteger(n) || n < 2 || n > 6) {
      return error('La Pesca se juega de 2 a 6 jugadores');
    }
    const { cartas, azar } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const k = cartasRepartoPesca(n);
    const repartidas = Array.from({ length: n }, (_, a) =>
      bajarCuartetos(cartas.slice(a * k, (a + 1) * k)),
    );
    return ok(
      aQuienLeToca({
        config: { jugadores: n },
        azar,
        manos: repartidas.map((r) => r.mano),
        mar: cartas.slice(n * k),
        cuartetos: repartidas.map((r) => r.valores),
        turno: 0,
        registro: [],
      }),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const valores = valoresDe(e.manos[asiento]!);
    return rivalesConCartas(e, asiento).flatMap((a) =>
      valores.map((valor): AccionPesca => ({ tipo: 'pedir', a, valor })),
    );
  },

  transicion(e, asiento, accion) {
    const { a, valor } = accion;
    const dadas = e.manos[a]!.filter((c) => valorPesca(c) === valor);
    let mano = [...e.manos[asiento]!, ...dadas];
    let mar = e.mar;
    let pesco: PeticionPesca['pesco'] = null;
    let sigue = dadas.length > 0;
    if (!sigue) {
      if (mar.length === 0) {
        pesco = 'nada';
      } else {
        const carta = mar.at(-1)!;
        mar = mar.slice(0, -1);
        mano = [...mano, carta];
        sigue = valorPesca(carta) === valor;
        pesco = sigue ? carta : 'otra';
      }
    }
    const bajado = bajarCuartetos(mano);
    const peticion: PeticionPesca = {
      tipo: 'pedir',
      asiento,
      a,
      valor,
      dadas,
      pesco,
      cuarteto: bajado.valores[0] ?? null,
    };
    return aQuienLeToca({
      ...e,
      mar,
      manos: e.manos.map((m, j) =>
        j === asiento ? bajado.mano : j === a ? m.filter((c) => valorPesca(c) !== valor) : m,
      ),
      cuartetos: e.cuartetos.map((c, j) => (j === asiento ? [...c, ...bajado.valores] : c)),
      turno: sigue ? asiento : (asiento + 1) % e.config.jugadores,
      registro: [...e.registro, peticion],
    });
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enMar: e.mar.length,
      cuartetos: e.cuartetos.map((c) => [...c]),
      turno: terminada(e) ? null : e.turno,
      registro: [...e.registro],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = e.cuartetos.map((c) => c.length);
    const max = Math.max(...puntos);
    const ganadores = puntos.flatMap((p, a) => (p === max ? [a] : []));
    return { ganadores, empate: ganadores.length > 1, puntos };
  },
};
