import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import {
  bandoDe,
  cartaGanadora,
  cartasObligadas,
  puntosDe,
  siguiente,
  VALORES_BUTIFARRA,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

export { VALORES_BUTIFARRA } from '../motor/bazas';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const OBJETIVOS_BUTIFARRA = [51, 101, 151] as const;

export interface ConfigButifarra {
  /** Puntos con los que un bando gana la partida. */
  readonly objetivo: (typeof OBJETIVOS_BUTIFARRA)[number];
}

export const CONFIG_BUTIFARRA_POR_DEFECTO: ConfigButifarra = { objetivo: 101 };

/** El triunfo de la mano; `triunfo: null` es la butifarra (sin triunfo, vale el doble). */
export interface EleccionButifarra {
  readonly triunfo: PaloEspanol | null;
  /** Quien eligió: el repartidor, o su compañero si le delegó. */
  readonly quien: Asiento;
  readonly delegada: boolean;
}

/** Contros dichos: 0 ninguno, 1 contro (×2), 2 recontro (×4), 3 Sant Vicenç (×8). */
export type ControsButifarra = 0 | 1 | 2 | 3;

export type FaseButifarra = 'elegir' | 'contros' | 'jugar';

export interface BazaButifarra {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface ResultadoManoButifarra {
  readonly repartidor: Asiento;
  readonly eleccion: EleccionButifarra;
  readonly contros: ControsButifarra;
  readonly multiplicador: number;
  /** Puntos de cada bando en la mano: los de las cartas de sus bazas más 1 por baza. */
  readonly puntos: readonly [number, number];
  readonly bazas: readonly [number, number];
  /** Lo que se anota cada bando: lo que pasa de 36, por el multiplicador. */
  readonly anotados: readonly [number, number];
  readonly totalesTras: readonly [number, number];
}

export interface EstadoButifarra {
  readonly config: ConfigButifarra;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: FaseButifarra;
  readonly turno: Asiento;
  readonly eleccion: EleccionButifarra | null;
  readonly contros: ControsButifarra;
  /** Jugadores del bando que decide el contro en curso que ya han pasado. */
  readonly pasados: number;
  readonly mesa: readonly CartaJugada[];
  /** Bazas ya jugadas en la mano, en orden: todos las vieron. */
  readonly bazasJugadas: readonly BazaButifarra[];
  /** La última baza jugada, aunque sea de la mano anterior: se ve mientras se recoge. */
  readonly ultimaBaza: BazaButifarra | null;
  /** Bazas ganadas por cada asiento en la mano. */
  readonly bazas: readonly number[];
  /** Puntos de cada bando en la mano (cartas y bazas). */
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoButifarra[];
  readonly totales: readonly [number, number];
}

export type AccionButifarra =
  | { readonly tipo: 'elegir'; readonly triunfo: PaloEspanol | null }
  | { readonly tipo: 'delegar' }
  | { readonly tipo: 'contro' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaButifarra {
  readonly config: ConfigButifarra & { readonly jugadores: 4 };
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** No hay mazo: se reparte toda la baraja. */
  readonly mazo: 0;
  readonly muestra: null;
  readonly repartidor: Asiento;
  readonly fase: FaseButifarra;
  readonly turno: Asiento | null;
  readonly eleccion: EleccionButifarra | null;
  readonly contros: ControsButifarra;
  /** El bando que decide el contro en curso; `null` fuera de los contros. */
  readonly decideContro: 0 | 1 | null;
  readonly pasados: number;
  readonly multiplicador: number;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaButifarra[];
  readonly bazas: readonly number[];
  readonly puntos: readonly [number, number];
  readonly ultimaBaza: BazaButifarra | null;
  readonly resultadosManos: readonly ResultadoManoButifarra[];
  readonly totales: readonly [number, number];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 12;
/** La mitad de los 72 puntos de la mano: se anota lo que pasa de aquí. */
export const MITAD_BUTIFARRA = 36;

/** Multiplicador de la mano: el de los contros, y el doble con butifarra. */
export function multiplicadorButifarra(
  eleccion: EleccionButifarra | null,
  contros: ControsButifarra,
): number {
  return 2 ** contros * (eleccion !== null && eleccion.triunfo === null ? 2 : 1);
}

/** Bando que decide el contro siguiente: los rivales el contro y Sant Vicenç; el otro, el recontro. */
export function bandoQueDecide(eleccion: EleccionButifarra, contros: ControsButifarra): 0 | 1 {
  const elige = bandoDe(eleccion.quien);
  return contros % 2 === 0 ? ((1 - elige) as 0 | 1) : elige;
}

/** Los dos jugadores de un bando en orden de juego desde el siguiente al repartidor. */
function ordenDelBando(repartidor: Asiento, bando: 0 | 1): Asiento[] {
  return [1, 2, 3, 4].map((d) => (repartidor + d) % JUGADORES).filter((a) => bandoDe(a) === bando);
}

function partidaTerminada(e: EstadoButifarra): boolean {
  return Math.max(...e.totales) >= e.config.objetivo;
}

function nuevaMano(
  config: ConfigButifarra,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoButifarra[],
  totales: readonly [number, number],
  ultimaBaza: BazaButifarra | null = null,
): EstadoButifarra {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola48'), azar);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const sale = siguiente(repartidor, JUGADORES);
  const manos = Array.from(
    { length: JUGADORES },
    (_, asiento) => reparto.valor.manos[(asiento - sale + JUGADORES) % JUGADORES]!,
  );
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    fase: 'elegir',
    turno: repartidor,
    eleccion: null,
    contros: 0,
    pasados: 0,
    mesa: [],
    bazasJugadas: [],
    ultimaBaza,
    bazas: new Array<number>(JUGADORES).fill(0),
    puntos: [0, 0],
    resultadosManos,
    totales,
  };
}

/** Pasa a la fase de juego: sale el siguiente al repartidor. */
const empezarJuego = (e: EstadoButifarra): EstadoButifarra => ({
  ...e,
  fase: 'jugar',
  turno: siguiente(e.repartidor, JUGADORES),
  pasados: 0,
});

/** Abre el paso de contro siguiente, o empieza el juego tras el Sant Vicenç. */
function siguienteContro(e: EstadoButifarra, contros: ControsButifarra): EstadoButifarra {
  if (contros === 3) return empezarJuego({ ...e, contros });
  const bando = bandoQueDecide(e.eleccion!, contros);
  return {
    ...e,
    fase: 'contros',
    contros,
    pasados: 0,
    turno: ordenDelBando(e.repartidor, bando)[0]!,
  };
}

function cerrarMano(e: EstadoButifarra): EstadoButifarra {
  const multiplicador = multiplicadorButifarra(e.eleccion, e.contros);
  const anotados = e.puntos.map((p) =>
    p > MITAD_BUTIFARRA ? (p - MITAD_BUTIFARRA) * multiplicador : 0,
  ) as [number, number];
  const totales: [number, number] = [e.totales[0] + anotados[0], e.totales[1] + anotados[1]];
  const bazas: [number, number] = [0, 0];
  e.bazas.forEach((b, a) => (bazas[bandoDe(a)] += b));
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      eleccion: e.eleccion!,
      contros: e.contros,
      multiplicador,
      puntos: e.puntos,
      bazas,
      anotados,
      totalesTras: totales,
    },
  ];
  const cerrado: EstadoButifarra = { ...e, resultadosManos, totales };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, JUGADORES),
    resultadosManos,
    totales,
    e.ultimaBaza,
  );
}

function resolverBaza(e: EstadoButifarra): EstadoButifarra {
  const triunfo = e.eleccion!.triunfo;
  const ganador = cartaGanadora(e.mesa, triunfo, VALORES_BUTIFARRA).asiento;
  const valor = 1 + e.mesa.reduce((s, j) => s + puntosDe(j.carta, VALORES_BUTIFARRA), 0);
  const puntos = [...e.puntos] as [number, number];
  puntos[bandoDe(ganador)] += valor;
  const baza = { cartas: e.mesa, ganador };
  const resuelto: EstadoButifarra = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasJugadas: [...e.bazasJugadas, baza],
    ultimaBaza: baza,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    puntos,
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

function cartasJugables(e: EstadoButifarra, asiento: Asiento): readonly IdCarta[] {
  return cartasObligadas(e.manos[asiento]!, e.mesa, e.eleccion!.triunfo, {
    asiento,
    montarSobreCompanero: false,
    valores: VALORES_BUTIFARRA,
  });
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const butifarra: Juego<ConfigButifarra, EstadoButifarra, AccionButifarra, VistaButifarra> = {
  id: 'butifarra',

  crear(config, semilla) {
    if (!(OBJETIVOS_BUTIFARRA as readonly number[]).includes(config.objetivo)) {
      return error('La partida de Butifarra se juega a 51, 101 o 151 puntos');
    }
    const limpia: ConfigButifarra = { objetivo: config.objetivo };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), JUGADORES - 1, [], [0, 0]));
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'elegir': {
        const acciones: AccionButifarra[] = [
          ...PALOS_ESPANOLES.map((triunfo) => ({ tipo: 'elegir' as const, triunfo })),
          { tipo: 'elegir', triunfo: null },
        ];
        if (asiento === e.repartidor) acciones.push({ tipo: 'delegar' });
        return acciones;
      }
      case 'contros':
        return [{ tipo: 'contro' }, { tipo: 'pasar' }];
      case 'jugar':
        return cartasJugables(e, asiento).map((carta) => ({ tipo: 'jugar' as const, carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'delegar':
        return { ...e, turno: siguiente(siguiente(asiento, JUGADORES), JUGADORES) };
      case 'elegir': {
        const eleccion = {
          triunfo: accion.triunfo,
          quien: asiento,
          delegada: asiento !== e.repartidor,
        };
        return siguienteContro({ ...e, eleccion }, 0);
      }
      case 'contro':
        return siguienteContro(e, (e.contros + 1) as ControsButifarra);
      case 'pasar': {
        const pasados = e.pasados + 1;
        if (pasados === 2) return empezarJuego(e);
        const bando = bandoQueDecide(e.eleccion!, e.contros);
        return { ...e, pasados, turno: ordenDelBando(e.repartidor, bando)[pasados]! };
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoButifarra = { ...e, manos, mesa };
        return mesa.length < JUGADORES
          ? { ...jugado, turno: siguiente(asiento, JUGADORES) }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: { ...e.config, jugadores: JUGADORES },
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: 0,
      muestra: null,
      repartidor: e.repartidor,
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      eleccion: e.eleccion,
      contros: e.contros,
      decideContro: e.fase === 'contros' ? bandoQueDecide(e.eleccion!, e.contros) : null,
      pasados: e.pasados,
      multiplicador: multiplicadorButifarra(e.eleccion, e.contros),
      mesa: [...e.mesa],
      bazasJugadas: [...e.bazasJugadas],
      bazas: [...e.bazas],
      puntos: e.puntos,
      ultimaBaza: e.ultimaBaza,
      resultadosManos: [...e.resultadosManos],
      totales: e.totales,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const bando = e.totales[0] > e.totales[1] ? 0 : 1;
    return {
      ganadores: [0, 1, 2, 3].filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: [0, 1, 2, 3].map((a) => e.totales[bandoDe(a)]),
    };
  },
};
