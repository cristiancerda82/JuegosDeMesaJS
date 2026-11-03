import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Préférence para 3; la meta de la pulka va en la config para que las pruebas sean cortas. */
export interface ConfigPreference {
  readonly jugadores: 3;
  readonly meta: number;
}

export const CONFIG_PREFERENCE_POR_DEFECTO: ConfigPreference = { jugadores: 3, meta: 10 };

/** El palo de una puja de bazas, o sin triunfo. */
export type PaloPujaPreference = PaloFrances | 'sin';

export type PujaPreference =
  | { readonly tipo: 'bazas'; readonly bazas: number; readonly palo: PaloPujaPreference }
  | { readonly tipo: 'miseria' };

/** Los palos de las pujas, de menos a más. */
export const PALOS_PUJA_PREFERENCE: readonly PaloPujaPreference[] = [
  'picas',
  'treboles',
  'diamantes',
  'corazones',
  'sin',
];

export type FasePreference = 'subasta' | 'descarte' | 'contrato' | 'whist' | 'bazas';

/** Palo de salida que un jugador no siguió, o `'triunfo'` si tampoco echó triunfo. */
export type FalloPreference = PaloFrances | 'triunfo';

export interface ResultadoManoPreference {
  /** El contrato, o `null` en la raspasy. */
  readonly contrato: PujaPreference | null;
  readonly juega: Asiento | null;
  /** Quién hizo whist (`null` para el que juega o en la raspasy). */
  readonly whist: readonly (boolean | null)[];
  /** Si nadie hizo whist y el contrato se dio por cumplido sin jugarse. */
  readonly sinJugar: boolean;
  readonly bazas: readonly number[];
  /** Si el que juega cumplió (`null` en la raspasy). */
  readonly cumplido: boolean | null;
  /** Lo que suma cada uno en la mano. */
  readonly pulka: readonly number[];
  readonly montana: readonly number[];
  /** `whists[i][j]`: los que `i` se apunta contra `j` en la mano. */
  readonly whists: readonly (readonly number[])[];
  /** El saldo de la mano para cada uno (lo que cambia el cierre de cuentas). */
  readonly saldo: readonly number[];
  readonly pulkaTras: readonly number[];
  readonly montanaTras: readonly number[];
  readonly whistsTras: readonly (readonly number[])[];
}

export interface EstadoPreference {
  readonly config: ConfigPreference;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FasePreference;
  readonly turno: Asiento;
  /** La última puja de cada uno (`'paso'` si pasó, `null` si aún no ha dicho). */
  readonly pujas: readonly (PujaPreference | 'paso' | null)[];
  /** Si cada uno ha pujado alguna vez (para la miseria). */
  readonly pujoAntes: readonly boolean[];
  readonly mejor: { readonly asiento: Asiento; readonly puja: PujaPreference } | null;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly viuda: readonly IdCarta[];
  readonly viudaVista: boolean;
  readonly descartes: readonly IdCarta[];
  /** Quién juega (`null` en la subasta y en la raspasy). */
  readonly juega: Asiento | null;
  /** El contrato declarado (`null` hasta declararlo y en la raspasy). */
  readonly contrato: PujaPreference | null;
  readonly whist: readonly (boolean | null)[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazas: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly FalloPreference[])[];
  readonly pulka: readonly number[];
  readonly montana: readonly number[];
  readonly whists: readonly (readonly number[])[];
  readonly resultadosManos: readonly ResultadoManoPreference[];
}

export type AccionPreference =
  | { readonly tipo: 'pujar'; readonly puja: PujaPreference }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'declarar'; readonly puja: PujaPreference }
  | { readonly tipo: 'whist' }
  | { readonly tipo: 'pasarWhist' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaPreference {
  readonly config: ConfigPreference;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  /** Los descartes, solo para el que juega. */
  readonly misDescartes: readonly IdCarta[];
  readonly cartasEnMano: readonly number[];
  /** La viuda si ya se enseñó; si no, `null`. */
  readonly viuda: readonly IdCarta[] | null;
  /** Cuántas cartas hay descartadas boca abajo. */
  readonly enDescarte: number;
  readonly repartidor: Asiento;
  readonly fase: FasePreference;
  readonly turno: Asiento | null;
  readonly pujas: EstadoPreference['pujas'];
  readonly pujoAntes: readonly boolean[];
  readonly mejor: EstadoPreference['mejor'];
  readonly juega: Asiento | null;
  readonly contrato: PujaPreference | null;
  readonly whist: readonly (boolean | null)[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoPreference['ultimaBaza'];
  readonly bazas: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly FalloPreference[])[];
  readonly pulka: readonly number[];
  readonly montana: readonly number[];
  readonly whists: readonly (readonly number[])[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoPreference[];
}

// ── Cartas y pujas ───────────────────────────────────────────────────────────

/** La baraja de 32: del 7 al As de cada palo. */
export const BARAJA_PREFERENCE: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const paloPreference = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

/** Rango en su palo: A 8, K 7, Q 6, J 5, 10 4, 9 3, 8 2 y 7 1. */
export function rangoPreference(c: IdCarta): number {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 8 : v - 6;
}

/** Para comparar pujas: `10 * bazas + palo`; la miseria, entre el 8 sin triunfo y el 9 de picas. */
export function ordenPujaPreference(p: PujaPreference): number {
  if (p.tipo === 'miseria') return 85;
  return 10 * p.bazas + PALOS_PUJA_PREFERENCE.indexOf(p.palo);
}

/** Lo que vale un contrato: 2, 4, 6, 8 y 10 de 6 a 10 bazas; 10 la miseria. */
export const valorContratoPreference = (p: PujaPreference) =>
  p.tipo === 'miseria' ? 10 : 2 * (p.bazas - 5);

/** Bazas que les tocan a los que hacen whist contra un contrato de `bazas`. */
export const BAZAS_WHIST_PREFERENCE: Readonly<Record<number, number>> = {
  6: 4,
  7: 2,
  8: 1,
  9: 1,
  10: 0,
};

export const MISERIA_PREFERENCE: PujaPreference = { tipo: 'miseria' };

export const TODAS_LAS_PUJAS_PREFERENCE: readonly PujaPreference[] = [
  ...[6, 7, 8, 9, 10].flatMap((bazas) =>
    PALOS_PUJA_PREFERENCE.map((palo): PujaPreference => ({ tipo: 'bazas', bazas, palo })),
  ),
  MISERIA_PREFERENCE,
].sort((a, b) => ordenPujaPreference(a) - ordenPujaPreference(b));

/** El triunfo de un contrato, o `null` sin triunfo, en la miseria y en la raspasy. */
export function triunfoPreference(contrato: PujaPreference | null): PaloFrances | null {
  if (contrato === null || contrato.tipo === 'miseria' || contrato.palo === 'sin') return null;
  return contrato.palo;
}

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraPreference(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): CartaJugada {
  const salida = paloPreference(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    paloPreference(c) === triunfo
      ? 100 + rangoPreference(c)
      : paloPreference(c) === salida
        ? rangoPreference(c)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar: el palo de salida; si no, triunfo; si no, cualquiera. */
export function cartasLegalesPreference(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloPreference(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloPreference(c) === salida);
  if (delPalo.length > 0) return delPalo;
  const triunfos = triunfo === null ? [] : mano.filter((c) => paloPreference(c) === triunfo);
  return triunfos.length > 0 ? triunfos : [...mano];
}

// ── Cuenta ───────────────────────────────────────────────────────────────────

const JUGADORES = 3;
const CARTAS_EN_MANO = 10;
const ceros = () => [0, 0, 0];
const matriz = () => [ceros(), ceros(), ceros()];
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Lo que suma cada uno a su pulka, a su montaña y a sus whists en una mano. */
export function puntuarManoPreference(
  contrato: PujaPreference | null,
  juega: Asiento | null,
  whist: readonly (boolean | null)[],
  bazas: readonly number[],
  sinJugar: boolean,
): {
  pulka: number[];
  montana: number[];
  whists: number[][];
  cumplido: boolean | null;
} {
  const pulka = ceros();
  const montana = ceros();
  const whists = matriz();
  if (contrato === null || juega === null) {
    // Raspasy: cada baza suma 1 a la montaña.
    return { pulka, montana: [...bazas], whists, cumplido: null };
  }
  const v = valorContratoPreference(contrato);
  if (contrato.tipo === 'miseria') {
    const hechas = bazas[juega]!;
    if (hechas === 0) pulka[juega] = v;
    else montana[juega] = v * hechas;
    return { pulka, montana, whists, cumplido: hechas === 0 };
  }
  if (sinJugar) {
    pulka[juega] = v;
    return { pulka, montana, whists, cumplido: true };
  }
  const hechas = bazas[juega]!;
  const faltan = Math.max(0, contrato.bazas - hechas);
  if (faltan === 0) pulka[juega] = v;
  else montana[juega] = v * faltan;
  const delWhist = [0, 1, 2].filter((a) => whist[a] === true);
  for (const w of delWhist) whists[w]![juega] = v * bazas[w]! + v * faltan;
  const tocan = BAZAS_WHIST_PREFERENCE[contrato.bazas]!;
  const ganadas = delWhist.reduce((s, w) => s + bazas[w]!, 0);
  const corto = Math.max(0, tocan - ganadas);
  for (const w of delWhist) montana[w] = montana[w]! + (v * corto) / delWhist.length;
  return { pulka, montana, whists, cumplido: faltan === 0 };
}

/**
 * Saldos del cierre de cuentas, multiplicados por 3 para que sean enteros: 10 por la diferencia
 * entre la deuda media y la propia (deuda = montaña − pulka), más los whists netos.
 */
export function saldosTripledPreference(
  pulka: readonly number[],
  montana: readonly number[],
  whists: readonly (readonly number[])[],
): number[] {
  const deuda = [0, 1, 2].map((a) => montana[a]! - pulka[a]!);
  const total = deuda.reduce((s, d) => s + d, 0);
  return [0, 1, 2].map((a) => {
    let neto = 0;
    for (const b of [0, 1, 2]) if (b !== a) neto += whists[a]![b]! - whists[b]![a]!;
    return 10 * (total - 3 * deuda[a]!) + 3 * neto;
  });
}

/** Saldos del cierre de cuentas, con un decimal. */
export const saldosPreference = (
  pulka: readonly number[],
  montana: readonly number[],
  whists: readonly (readonly number[])[],
) => saldosTripledPreference(pulka, montana, whists).map((s) => Math.round((s / 3) * 10) / 10);

// ── Reglas ───────────────────────────────────────────────────────────────────

/** Manos tras las que la partida termina aunque las pulkas no lleguen (si nadie cumple). */
export const MANOS_MAXIMAS_PREFERENCE = 60;

/**
 * La partida termina cuando las pulkas suman la meta de los tres (lo que uno pasa de la meta
 * cubre lo que les falta a los demás y en el cierre le resta deuda), o tras 60 manos.
 */
const terminada = (e: Pick<EstadoPreference, 'config' | 'pulka' | 'resultadosManos'>) =>
  e.pulka.reduce((s, p) => s + p, 0) >= JUGADORES * e.config.meta ||
  e.resultadosManos.length >= MANOS_MAXIMAS_PREFERENCE;

function nuevaMano(
  base: Pick<
    EstadoPreference,
    'config' | 'pulka' | 'montana' | 'whists' | 'resultadosManos' | 'ultimaBaza'
  >,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoPreference {
  const { cartas, azar: sig } = barajar(BARAJA_PREFERENCE, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO,
      (k + 1) * CARTAS_EN_MANO,
    );
  }
  return {
    ...base,
    azar: sig,
    repartidor,
    fase: 'subasta',
    turno: siguiente(repartidor),
    pujas: [null, null, null],
    pujoAntes: [false, false, false],
    mejor: null,
    manos,
    viuda: cartas.slice(JUGADORES * CARTAS_EN_MANO),
    viudaVista: false,
    descartes: [],
    juega: null,
    contrato: null,
    whist: [null, null, null],
    mesa: [],
    bazas: ceros(),
    jugadasPor: [[], [], []],
    fallos: [[], [], []],
  };
}

function cerrarMano(e: EstadoPreference, sinJugar: boolean): EstadoPreference {
  const r = puntuarManoPreference(e.contrato, e.juega, e.whist, e.bazas, sinJugar);
  const pulkaTras = e.pulka.map((p, a) => p + r.pulka[a]!);
  const montanaTras = e.montana.map((m, a) => m + r.montana[a]!);
  const whistsTras = e.whists.map((fila, a) => fila.map((w, b) => w + r.whists[a]![b]!));
  const resultado: ResultadoManoPreference = {
    contrato: e.contrato,
    juega: e.juega,
    whist: e.whist,
    sinJugar,
    bazas: e.bazas,
    cumplido: r.cumplido,
    pulka: r.pulka,
    montana: r.montana,
    whists: r.whists,
    saldo: saldosPreference(r.pulka, r.montana, r.whists),
    pulkaTras,
    montanaTras,
    whistsTras,
  };
  const cerrado: EstadoPreference = {
    ...e,
    pulka: pulkaTras,
    montana: montanaTras,
    whists: whistsTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Empieza las bazas: sale el siguiente al repartidor. */
const empezarBazas = (e: EstadoPreference): EstadoPreference => ({
  ...e,
  fase: 'bazas',
  turno: siguiente(e.repartidor),
});

/** Tras una acción de la subasta: sigue, gana alguien o se juega la raspasy. */
function seguirSubasta(e: EstadoPreference, asiento: Asiento): EstadoPreference {
  const pasados = e.pujas.filter((p) => p === 'paso').length;
  if (pasados === JUGADORES) return empezarBazas(e);
  if (pasados === JUGADORES - 1 && e.mejor !== null) {
    const w = e.mejor.asiento;
    return {
      ...e,
      fase: 'descarte',
      turno: w,
      juega: w,
      viudaVista: true,
      manos: e.manos.map((m, a) => (a === w ? [...m, ...e.viuda] : m)),
    };
  }
  let t = siguiente(asiento);
  while (e.pujas[t] === 'paso') t = siguiente(t);
  return { ...e, turno: t };
}

/** Pujas permitidas a un jugador. */
export function pujasPosiblesPreference(
  mejor: PujaPreference | null,
  pujoAntes: boolean,
): PujaPreference[] {
  const minimo = mejor === null ? -1 : ordenPujaPreference(mejor);
  return TODAS_LAS_PUJAS_PREFERENCE.filter(
    (p) => ordenPujaPreference(p) > minimo && (p.tipo !== 'miseria' || !pujoAntes),
  );
}

/** Contratos que puede declarar quien ganó con `puja`. */
export function contratosPosiblesPreference(puja: PujaPreference): PujaPreference[] {
  if (puja.tipo === 'miseria') return [MISERIA_PREFERENCE];
  return TODAS_LAS_PUJAS_PREFERENCE.filter(
    (p) => p.tipo === 'bazas' && ordenPujaPreference(p) >= ordenPujaPreference(puja),
  );
}

/** Los defensores en orden de juego desde el siguiente al que juega. */
const defensores = (juega: Asiento) => [siguiente(juega), siguiente(siguiente(juega))];

function resolverBaza(e: EstadoPreference): EstadoPreference {
  const ganador = ganadoraPreference(e.mesa, triunfoPreference(e.contrato)).asiento;
  const resuelto: EstadoPreference = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto, false) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const preference: Juego<
  ConfigPreference,
  EstadoPreference,
  AccionPreference,
  VistaPreference
> = {
  id: 'preference',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Préférence se juega con 3 jugadores');
    if (!Number.isInteger(config.meta) || config.meta < 1) {
      return error('La meta de la pulka debe ser un entero positivo');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: 3, meta: config.meta },
          pulka: ceros(),
          montana: ceros(),
          whists: matriz(),
          resultadosManos: [],
          ultimaBaza: null,
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    switch (e.fase) {
      case 'subasta':
        return [
          { tipo: 'pasar' },
          ...pujasPosiblesPreference(e.mejor?.puja ?? null, e.pujoAntes[asiento]!).map((puja) => ({
            tipo: 'pujar' as const,
            puja,
          })),
        ];
      case 'descarte':
        return [...mano].sort().map((carta) => ({ tipo: 'descartar', carta }));
      case 'contrato':
        return contratosPosiblesPreference(e.mejor!.puja).map((puja) => ({
          tipo: 'declarar',
          puja,
        }));
      case 'whist':
        return [{ tipo: 'whist' }, { tipo: 'pasarWhist' }];
      case 'bazas':
        return cartasLegalesPreference(mano, e.mesa, triunfoPreference(e.contrato))
          .sort()
          .map((carta) => ({ tipo: 'jugar', carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pasar':
        return seguirSubasta(
          { ...e, pujas: e.pujas.map((p, a) => (a === asiento ? 'paso' : p)) },
          asiento,
        );
      case 'pujar':
        return seguirSubasta(
          {
            ...e,
            pujas: e.pujas.map((p, a) => (a === asiento ? accion.puja : p)),
            pujoAntes: e.pujoAntes.map((x, a) => x || a === asiento),
            mejor: { asiento, puja: accion.puja },
          },
          asiento,
        );
      case 'descartar': {
        const conDescarte: EstadoPreference = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          descartes: [...e.descartes, accion.carta],
        };
        if (conDescarte.descartes.length < 2) return conDescarte;
        // La miseria no se declara ni tiene whist.
        if (e.mejor!.puja.tipo === 'miseria') {
          return empezarBazas({ ...conDescarte, contrato: MISERIA_PREFERENCE });
        }
        return { ...conDescarte, fase: 'contrato' };
      }
      case 'declarar':
        return {
          ...e,
          contrato: accion.puja,
          fase: 'whist',
          turno: defensores(asiento)[0]!,
        };
      case 'whist':
      case 'pasarWhist': {
        const whist = e.whist.map((w, a) => (a === asiento ? accion.tipo === 'whist' : w));
        const [d1, d2] = defensores(e.juega!);
        const decidido: EstadoPreference = { ...e, whist };
        if (asiento === d1) return { ...decidido, turno: d2! };
        if (!whist.some((w) => w === true)) return cerrarMano(decidido, true);
        return empezarBazas(decidido);
      }
      case 'jugar': {
        const triunfo = triunfoPreference(e.contrato);
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = paloPreference(mesa[0]!.carta);
        const palo = paloPreference(accion.carta);
        const nuevos: FalloPreference[] = [];
        if (palo !== salida) {
          nuevos.push(salida);
          if (triunfo !== null && palo !== triunfo) nuevos.push('triunfo');
        }
        const jugado: EstadoPreference = {
          ...e,
          manos,
          mesa,
          jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          fallos: e.fallos.map((f, a) =>
            a === asiento ? [...f, ...nuevos.filter((x) => !f.includes(x))] : f,
          ),
        };
        return mesa.length < JUGADORES
          ? { ...jugado, turno: siguiente(asiento) }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      misDescartes: asiento !== null && asiento === e.juega ? [...e.descartes] : [],
      cartasEnMano: e.manos.map((m) => m.length),
      viuda: e.viudaVista ? [...e.viuda] : null,
      enDescarte: e.descartes.length,
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      pujas: [...e.pujas],
      pujoAntes: [...e.pujoAntes],
      mejor: e.mejor,
      juega: e.juega,
      contrato: e.contrato,
      whist: [...e.whist],
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => [...f]),
      pulka: [...e.pulka],
      montana: [...e.montana],
      whists: e.whists.map((f) => [...f]),
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const triples = saldosTripledPreference(e.pulka, e.montana, e.whists);
    const maximo = Math.max(...triples);
    const ganadores = [0, 1, 2].filter((a) => triples[a] === maximo);
    const puntos = saldosPreference(e.pulka, e.montana, e.whists);
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};

/** Para las pruebas y la IA: si dos pujas son la misma. */
export const mismaPujaPreference = (a: PujaPreference, b: PujaPreference) =>
  JSON.stringify(a) === JSON.stringify(b);
