import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Tysiącha para 3; la meta va en la config para que las pruebas sean cortas. */
export interface ConfigTysiacha {
  readonly jugadores: 3;
  readonly meta?: number;
}

export const META_TYSIACHA = 1000;
export const CONFIG_TYSIACHA_POR_DEFECTO: ConfigTysiacha = { jugadores: 3 };

export type FaseTysiacha = 'subasta' | 'dar' | 'contrato' | 'bazas';

export type AccionTysiacha =
  | { readonly tipo: 'pujar' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'dar'; readonly carta: IdCarta }
  | { readonly tipo: 'fijar'; readonly valor: number }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface MatrimonioTysiacha {
  readonly asiento: Asiento;
  readonly palo: PaloFrances;
}

export interface ResultadoManoTysiacha {
  readonly declarante: Asiento;
  readonly contrato: number;
  readonly cumplido: boolean;
  /** Puntos de las cartas de las bazas de cada uno. */
  readonly puntosCartas: readonly number[];
  /** Lo que suman los matrimonios de cada uno. */
  readonly matrimonios: readonly number[];
  /** Lo que anota cada uno en el marcador (0 para quien está en el barril y no declara). */
  readonly anotado: readonly number[];
  readonly marcadorTras: readonly number[];
  readonly barrilTras: readonly (number | null)[];
}

export interface EstadoTysiacha {
  readonly config: ConfigTysiacha;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly prikup: readonly IdCarta[];
  readonly prikupVisto: boolean;
  readonly fase: FaseTysiacha;
  readonly turno: Asiento;
  /** La última puja de cada uno (`'paso'` si pasó, `null` si aún no ha dicho). */
  readonly pujas: readonly (number | 'paso' | null)[];
  readonly puja: number;
  /** Quién tiene la puja más alta. */
  readonly pujador: Asiento;
  readonly declarante: Asiento | null;
  readonly contrato: number | null;
  /** La carta que el declarante dio a cada rival (`null` para el declarante o aún sin dar). */
  readonly dadas: readonly (IdCarta | null)[];
  readonly triunfo: PaloFrances | null;
  readonly matrimonios: readonly MatrimonioTysiacha[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos que cada uno no tiene: el de salida que no siguió y el triunfo que no echó. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly bazasGanadas: readonly number[];
  readonly puntosCartas: readonly number[];
  readonly puntosMatrimonios: readonly number[];
  readonly marcador: readonly number[];
  /** Manos que lleva cada uno en el barril, o `null` si no está. */
  readonly barril: readonly (number | null)[];
  readonly ganador: Asiento | null;
  readonly resultadosManos: readonly ResultadoManoTysiacha[];
}

export interface VistaTysiacha {
  readonly config: ConfigTysiacha;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** El prikup si ya se enseñó; si no, `null`. */
  readonly prikup: readonly IdCarta[] | null;
  /** Las cartas dadas que conoce: la suya si es rival, las dos si es el declarante. */
  readonly dadas: readonly (IdCarta | null)[];
  /** Cuántas cartas ha dado ya el declarante. */
  readonly cartasDadas: number;
  readonly repartidor: Asiento;
  readonly fase: FaseTysiacha;
  readonly turno: Asiento | null;
  readonly pujas: EstadoTysiacha['pujas'];
  readonly puja: number;
  readonly pujador: Asiento;
  readonly declarante: Asiento | null;
  readonly contrato: number | null;
  readonly triunfo: PaloFrances | null;
  readonly matrimonios: readonly MatrimonioTysiacha[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoTysiacha['ultimaBaza'];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly bazasGanadas: readonly number[];
  readonly puntosCartas: readonly number[];
  readonly puntosMatrimonios: readonly number[];
  readonly marcador: readonly number[];
  readonly barril: readonly (number | null)[];
  readonly ganador: Asiento | null;
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoTysiacha[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** 24 cartas francesas: 9, 10, J, Q, K y As de cada palo. */
export const BARAJA_TYSIACHA: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 9;
});

export const PALOS_TYSIACHA: readonly PaloFrances[] = [
  'corazones',
  'diamantes',
  'treboles',
  'picas',
];

export const paloTysiacha = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const valorDe = (c: IdCarta) => cartaDeId(c)!.valor;

const RANGOS: Readonly<Record<number, number>> = { 1: 6, 10: 5, 13: 4, 12: 3, 11: 2, 9: 1 };
const PUNTOS: Readonly<Record<number, number>> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2, 9: 0 };

/** Orden dentro del palo: As 6, 10 5, K 4, Q 3, J 2, 9 1. */
export const rangoTysiacha = (c: IdCarta) => RANGOS[valorDe(c)]!;
export const puntosCartaTysiacha = (c: IdCarta) => PUNTOS[valorDe(c)]!;

/** Lo que vale cada matrimonio. */
export const MATRIMONIO_TYSIACHA: Readonly<Record<PaloFrances, number>> = {
  corazones: 100,
  diamantes: 80,
  treboles: 60,
  picas: 40,
};

const idDe = (palo: PaloFrances, valor: number) => `${palo}-${valor}` as IdCarta;

/** Si la carta es el K o la Q de un palo y la otra está en la mano. */
export function deMatrimonioTysiacha(mano: readonly IdCarta[], c: IdCarta): boolean {
  const v = valorDe(c);
  if (v !== 12 && v !== 13) return false;
  return mano.includes(idDe(paloTysiacha(c), v === 12 ? 13 : 12));
}

/** Los palos de los matrimonios completos de la mano. */
export const matrimoniosEnManoTysiacha = (mano: readonly IdCarta[]): PaloFrances[] =>
  PALOS_TYSIACHA.filter((p) => mano.includes(idDe(p, 12)) && mano.includes(idDe(p, 13)));

/** El contrato máximo con esta mano: 120 más lo que suman sus matrimonios. */
export const topeTysiacha = (mano: readonly IdCarta[]) =>
  120 + matrimoniosEnManoTysiacha(mano).reduce((s, p) => s + MATRIMONIO_TYSIACHA[p], 0);

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraTysiacha(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): CartaJugada {
  const salida = paloTysiacha(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    paloTysiacha(c) === triunfo
      ? 100 + rangoTysiacha(c)
      : paloTysiacha(c) === salida
        ? rangoTysiacha(c)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar: el palo de salida; si no, triunfo; si no, cualquiera. */
export function cartasLegalesTysiacha(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloTysiacha(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloTysiacha(c) === salida);
  if (delPalo.length > 0) return delPalo;
  const triunfos = triunfo === null ? [] : mano.filter((c) => paloTysiacha(c) === triunfo);
  return triunfos.length > 0 ? triunfos : [...mano];
}

/** Redondeo al múltiplo de 5 más cercano (el 2,5 hacia arriba). */
export const redondear5Tysiacha = (n: number) => Math.floor((n + 2.5) / 5) * 5;

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 3;
export const CARTAS_EN_MANO_TYSIACHA = 7;
const APERTURA = 100;
const SALTO = 5;
/** Manos en el barril antes de caer. */
const MANOS_BARRIL = 3;
/** Manos tras las que la partida termina aunque nadie llegue a la meta (gana el mejor marcador). */
export const MANOS_MAXIMAS_TYSIACHA = 100;

const ceros = () => [0, 0, 0];
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
export const metaTysiacha = (config: ConfigTysiacha) => config.meta ?? META_TYSIACHA;
/** El barril: 880 con la meta de 1000. */
export const barrilTysiacha = (config: ConfigTysiacha) => metaTysiacha(config) - 120;
/** Donde se cae del barril: 760 con la meta de 1000. */
export const caidaTysiacha = (config: ConfigTysiacha) => metaTysiacha(config) - 240;

const terminada = (e: Pick<EstadoTysiacha, 'ganador' | 'resultadosManos'>) =>
  e.ganador !== null || e.resultadosManos.length >= MANOS_MAXIMAS_TYSIACHA;

/** Los dos rivales del declarante, en el orden en que reciben carta. */
export const rivalesTysiacha = (declarante: Asiento): [Asiento, Asiento] => [
  siguiente(declarante),
  siguiente(siguiente(declarante)),
];

/** Valores que puede fijar el declarante: de la puja al tope, de 5 en 5. */
export function contratosPosiblesTysiacha(puja: number, mano: readonly IdCarta[]): number[] {
  const tope = Math.max(puja, topeTysiacha(mano));
  const r: number[] = [];
  for (let v = puja; v <= tope; v += SALTO) r.push(v);
  return r;
}

function nuevaMano(
  base: Pick<EstadoTysiacha, 'config' | 'marcador' | 'barril' | 'ganador' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoTysiacha {
  const { cartas, azar: sig } = barajar(BARAJA_TYSIACHA, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO_TYSIACHA,
      (k + 1) * CARTAS_EN_MANO_TYSIACHA,
    );
  }
  const abre = siguiente(repartidor);
  const pujas: (number | null)[] = [null, null, null];
  pujas[abre] = APERTURA;
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    prikup: cartas.slice(JUGADORES * CARTAS_EN_MANO_TYSIACHA),
    prikupVisto: false,
    fase: 'subasta',
    turno: siguiente(abre),
    pujas,
    puja: APERTURA,
    pujador: abre,
    declarante: null,
    contrato: null,
    dadas: [null, null, null],
    triunfo: null,
    matrimonios: [],
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadasPor: [[], [], []],
    fallos: [[], [], []],
    bazasGanadas: ceros(),
    puntosCartas: ceros(),
    puntosMatrimonios: ceros(),
  };
}

/** Lo que anota cada uno y cómo quedan el marcador y el barril tras una mano. */
export function puntuarManoTysiacha(
  config: ConfigTysiacha,
  declarante: Asiento,
  contrato: number,
  puntos: readonly number[],
  marcador: readonly number[],
  barril: readonly (number | null)[],
): {
  cumplido: boolean;
  anotado: number[];
  marcador: number[];
  barril: (number | null)[];
  ganador: Asiento | null;
} {
  const cumplido = puntos[declarante]! >= contrato;
  const anotado = ceros();
  const marc = [...marcador];
  const barr = [...barril];
  let ganador: Asiento | null = null;
  const enBarril = barril.map((b) => b !== null);
  for (let a = 0; a < JUGADORES; a++) {
    if (a === declarante) {
      anotado[a] = cumplido ? contrato : -contrato;
      // En el barril, un contrato cumplido que no llega a la meta no cuenta.
      if (cumplido && enBarril[a] && marc[a]! + contrato < metaTysiacha(config)) anotado[a] = 0;
      marc[a] = marc[a]! + anotado[a]!;
      if (cumplido && marc[a]! >= metaTysiacha(config)) ganador = a;
      else if (!cumplido && enBarril[a]) barr[a] = null;
    } else if (!enBarril[a]) {
      anotado[a] = redondear5Tysiacha(puntos[a]!);
      marc[a] = marc[a]! + anotado[a]!;
    }
  }
  for (let a = 0; a < JUGADORES; a++) {
    if (a === ganador) continue;
    if (barr[a] !== null && enBarril[a]) {
      barr[a] = barr[a]! + 1;
      if (barr[a]! >= MANOS_BARRIL) {
        marc[a] = caidaTysiacha(config);
        barr[a] = null;
      }
    } else if (barr[a] === null && !enBarril[a] && marc[a]! >= barrilTysiacha(config)) {
      marc[a] = barrilTysiacha(config);
      barr[a] = 0;
    }
  }
  return { cumplido, anotado, marcador: marc, barril: barr, ganador };
}

function cerrarMano(e: EstadoTysiacha): EstadoTysiacha {
  const declarante = e.declarante!;
  const contrato = e.contrato!;
  const puntos = e.puntosCartas.map((p, a) => p + e.puntosMatrimonios[a]!);
  const r = puntuarManoTysiacha(e.config, declarante, contrato, puntos, e.marcador, e.barril);
  const resultado: ResultadoManoTysiacha = {
    declarante,
    contrato,
    cumplido: r.cumplido,
    puntosCartas: e.puntosCartas,
    matrimonios: e.puntosMatrimonios,
    anotado: r.anotado,
    marcadorTras: r.marcador,
    barrilTras: r.barril,
  };
  const cerrado: EstadoTysiacha = {
    ...e,
    marcador: r.marcador,
    barril: r.barril,
    ganador: r.ganador,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Tras una acción de la subasta: sigue o gana alguien. */
function seguirSubasta(e: EstadoTysiacha, asiento: Asiento): EstadoTysiacha {
  const pasados = e.pujas.filter((p) => p === 'paso').length;
  if (pasados === JUGADORES - 1) {
    const w = e.pujador;
    return {
      ...e,
      fase: 'dar',
      turno: w,
      declarante: w,
      contrato: e.puja,
      prikupVisto: true,
      manos: e.manos.map((m, a) => (a === w ? [...m, ...e.prikup] : m)),
    };
  }
  let t = siguiente(asiento);
  while (e.pujas[t] === 'paso') t = siguiente(t);
  return { ...e, turno: t };
}

function resolverBaza(e: EstadoTysiacha): EstadoTysiacha {
  const ganador = ganadoraTysiacha(e.mesa, e.triunfo).asiento;
  const puntos = e.mesa.reduce((s, j) => s + puntosCartaTysiacha(j.carta), 0);
  const resuelto: EstadoTysiacha = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasGanadas: e.bazasGanadas.map((b, a) => (a === ganador ? b + 1 : b)),
    puntosCartas: e.puntosCartas.map((p, a) => (a === ganador ? p + puntos : p)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

/** Si al salir con esta carta se canta un matrimonio. */
export function cantaTysiacha(
  e: Pick<EstadoTysiacha, 'mesa' | 'manos' | 'bazasGanadas'>,
  asiento: Asiento,
  carta: IdCarta,
): boolean {
  return (
    e.mesa.length === 0 &&
    e.bazasGanadas[asiento]! > 0 &&
    deMatrimonioTysiacha(e.manos[asiento]!, carta)
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const tysiacha: Juego<ConfigTysiacha, EstadoTysiacha, AccionTysiacha, VistaTysiacha> = {
  id: 'tysiacha',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Tysiącha se juega con 3 jugadores');
    const meta = metaTysiacha(config);
    if (!Number.isInteger(meta) || meta < 250 || meta % SALTO !== 0) {
      return error('La meta debe ser un múltiplo de 5 de al menos 250');
    }
    // Reparte el asiento 2, así abre la subasta el asiento 0.
    return ok(
      nuevaMano(
        {
          config: config.meta === undefined ? { jugadores: 3 } : { jugadores: 3, meta },
          marcador: ceros(),
          barril: [null, null, null],
          ganador: null,
          resultadosManos: [],
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
      case 'subasta': {
        const r: AccionTysiacha[] = [{ tipo: 'pasar' }];
        if (e.puja + SALTO <= Math.max(120, topeTysiacha(mano))) r.push({ tipo: 'pujar' });
        return r;
      }
      case 'dar':
        return [...mano].sort().map((carta) => ({ tipo: 'dar', carta }));
      case 'contrato':
        return contratosPosiblesTysiacha(e.contrato!, mano).map((valor) => ({
          tipo: 'fijar',
          valor,
        }));
      case 'bazas':
        return cartasLegalesTysiacha(mano, e.mesa, e.triunfo)
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
      case 'pujar': {
        const puja = e.puja + SALTO;
        return seguirSubasta(
          {
            ...e,
            pujas: e.pujas.map((p, a) => (a === asiento ? puja : p)),
            puja,
            pujador: asiento,
          },
          asiento,
        );
      }
      case 'dar': {
        const [r1, r2] = rivalesTysiacha(asiento);
        const para = e.dadas[r1] === null ? r1 : r2;
        const dado: EstadoTysiacha = {
          ...e,
          manos: e.manos.map((m, a) =>
            a === asiento
              ? m.filter((c) => c !== accion.carta)
              : a === para
                ? [...m, accion.carta]
                : m,
          ),
          dadas: e.dadas.map((d, a) => (a === para ? accion.carta : d)),
        };
        return para === r2 ? { ...dado, fase: 'contrato' } : dado;
      }
      case 'fijar':
        return { ...e, contrato: accion.valor, fase: 'bazas', turno: asiento };
      case 'jugar': {
        let r: EstadoTysiacha = e;
        if (cantaTysiacha(e, asiento, accion.carta)) {
          const palo = paloTysiacha(accion.carta);
          r = {
            ...r,
            triunfo: palo,
            matrimonios: [...r.matrimonios, { asiento, palo }],
            puntosMatrimonios: r.puntosMatrimonios.map((p, a) =>
              a === asiento ? p + MATRIMONIO_TYSIACHA[palo] : p,
            ),
          };
        }
        const manos = r.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...r.mesa, { asiento, carta: accion.carta }];
        const salida = paloTysiacha(mesa[0]!.carta);
        const palo = paloTysiacha(accion.carta);
        const nuevos: PaloFrances[] = [];
        if (palo !== salida) {
          nuevos.push(salida);
          if (r.triunfo !== null && palo !== r.triunfo) nuevos.push(r.triunfo);
        }
        const jugado: EstadoTysiacha = {
          ...r,
          manos,
          mesa,
          jugadasPor: r.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          fallos: r.fallos.map((f, a) =>
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
    const declara = asiento !== null && asiento === e.declarante;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      prikup: e.prikupVisto ? [...e.prikup] : null,
      dadas: e.dadas.map((d, a) => (declara || a === asiento ? d : null)),
      cartasDadas: e.dadas.filter((d) => d !== null).length,
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      pujas: [...e.pujas],
      puja: e.puja,
      pujador: e.pujador,
      declarante: e.declarante,
      contrato: e.contrato,
      triunfo: e.triunfo,
      matrimonios: [...e.matrimonios],
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => [...f]),
      bazasGanadas: [...e.bazasGanadas],
      puntosCartas: [...e.puntosCartas],
      puntosMatrimonios: [...e.puntosMatrimonios],
      marcador: [...e.marcador],
      barril: [...e.barril],
      ganador: e.ganador,
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = [...e.marcador];
    if (e.ganador !== null) return { ganadores: [e.ganador], empate: false, puntos };
    const maximo = Math.max(...puntos);
    const ganadores = [0, 1, 2].filter((a) => puntos[a] === maximo);
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
