import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigSkat {
  readonly jugadores: 3;
  /** Rondas de 3 manos, una por repartidor. */
  readonly rondas: 1 | 2 | 3;
}

export const CONFIG_SKAT_POR_DEFECTO: ConfigSkat = { jugadores: 3, rondas: 2 };

const JUGADORES = 3;
const CARTAS_MANO = 10;
const PUNTOS_PARA_GANAR = 61;
const PUNTOS_SCHNEIDER = 90;
const PUNTOS_TOTALES = 120;

export type JuegoSkat = PaloFrances | 'grand' | 'nulo';
export type AnuncioSkat = 'ninguno' | 'schneider' | 'schwarz' | 'ouvert';
export type FaseSkat = 'subasta' | 'skat' | 'descarte' | 'declarar' | 'bazas';
type DeBandos<T> = readonly [T, T];

export const JUEGOS_SKAT: readonly JuegoSkat[] = [
  'treboles',
  'picas',
  'corazones',
  'diamantes',
  'grand',
  'nulo',
];

export type AccionSkat =
  | { readonly tipo: 'pujar' }
  | { readonly tipo: 'aceptar' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'cogerSkat' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'declarar'; readonly juego: JuegoSkat; readonly anuncio: AnuncioSkat }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface AccionSkatHecha {
  readonly asiento: Asiento;
  /** El descarte del solista se ve sin la carta, salvo para él. */
  readonly accion: AccionSkat | { readonly tipo: 'descartar' };
  /** El valor pujado, en una puja. */
  readonly valor?: number;
}

export interface SubastaSkat {
  readonly pujador: Asiento;
  readonly escucha: Asiento;
  /** Último valor pujado; 0 si nadie ha pujado. */
  readonly valor: number;
  readonly esperando: 'puja' | 'respuesta';
  /** 1: Mittelhand contra Vorhand; 2: Hinterhand contra el que queda; 3: jugar con 18 o pasar. */
  readonly tramo: 1 | 2 | 3;
}

export interface MatadoresSkat {
  readonly con: boolean;
  readonly n: number;
}

export interface ResultadoManoSkat {
  readonly solista: Asiento;
  readonly juego: JuegoSkat;
  readonly anuncio: AnuncioSkat;
  readonly mano: boolean;
  readonly skat: readonly IdCarta[];
  readonly puja: number;
  /** Puntos de cartas del solista, con el Skat. */
  readonly puntosSolista: number;
  readonly bazasSolista: number;
  readonly matadores: MatadoresSkat | null;
  readonly multiplicador: number | null;
  readonly valor: number;
  readonly gana: boolean;
  /** Se pasó en la puja. */
  readonly pasado: boolean;
  /** Lo que suma o resta el solista. */
  readonly delta: number;
  readonly totales: readonly number[];
}

export interface EstadoSkat {
  readonly config: ConfigSkat;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseSkat;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Las 2 cartas apartadas: el Skat del reparto o el descarte del solista. */
  readonly skat: readonly IdCarta[];
  readonly turno: Asiento;
  readonly subasta: SubastaSkat;
  readonly solista: Asiento | null;
  readonly puja: number;
  readonly cogioSkat: boolean;
  readonly juego: JuegoSkat | null;
  readonly anuncio: AnuncioSkat;
  readonly matadores: MatadoresSkat | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadas: readonly IdCarta[];
  /** Las cartas que jugó cada uno en las bazas cerradas: todos las vieron. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Puntos de cartas de las bazas: solista y defensores. */
  readonly puntosBazas: DeBandos<number>;
  readonly bazas: DeBandos<number>;
  /** Palos efectivos de salida que cada uno no siguió: ya no tiene. */
  readonly fallos: readonly (readonly string[])[];
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoSkat[];
  readonly manosAnuladas: number;
  readonly ultimaAccion: AccionSkatHecha | null;
}

export interface VistaSkat {
  readonly config: ConfigSkat;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  readonly fase: FaseSkat;
  readonly turno: Asiento | null;
  readonly subasta: SubastaSkat;
  readonly solista: Asiento | null;
  readonly puja: number;
  readonly cogioSkat: boolean;
  readonly juego: JuegoSkat | null;
  readonly anuncio: AnuncioSkat;
  /** El Skat, solo para el solista desde que lo coge (después, su descarte). */
  readonly skat: readonly IdCarta[] | null;
  /** La mano del solista, si juega ouvert. */
  readonly manoOuvert: readonly IdCarta[] | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoSkat['ultimaBaza'];
  readonly jugadas: readonly IdCarta[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly puntosBazas: DeBandos<number>;
  readonly bazas: DeBandos<number>;
  readonly fallos: readonly (readonly string[])[];
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoSkat[];
  readonly manosAnuladas: number;
  readonly ultimaAccion: AccionSkatHecha | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La baraja de 32: del 7 al As de cada palo. */
export const BARAJA_SKAT: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

const JOTA = 11;
const ORDEN_JOTAS: readonly PaloFrances[] = ['treboles', 'picas', 'corazones', 'diamantes'];
const RANGO_NORMAL: Record<number, number> = { 1: 7, 10: 6, 13: 5, 12: 4, 9: 3, 8: 2, 7: 1 };
const RANGO_NULO: Record<number, number> = { 1: 8, 13: 7, 12: 6, 11: 5, 10: 4, 9: 3, 8: 2, 7: 1 };
const VALOR: Record<number, number> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2 };

const palo = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const numero = (c: IdCarta) => cartaDeId(c)!.valor;
export const esJota = (c: IdCarta) => numero(c) === JOTA;

export const BASE_SKAT: Record<Exclude<JuegoSkat, 'nulo'>, number> = {
  diamantes: 9,
  corazones: 10,
  picas: 11,
  treboles: 12,
  grand: 24,
};

/** El palo a efectos del juego: en palo y Grand, las J (y en palo, su palo) son 'triunfo'. */
export function paloSkat(c: IdCarta, juego: JuegoSkat | null): string {
  if (juego === null || juego === 'nulo') return palo(c);
  if (esJota(c)) return 'triunfo';
  return juego !== 'grand' && palo(c) === juego ? 'triunfo' : palo(c);
}

/** El orden dentro del palo efectivo: mayor es mejor. */
export function rangoSkat(c: IdCarta, juego: JuegoSkat | null): number {
  if (juego === 'nulo') return RANGO_NULO[numero(c)]!;
  if (esJota(c)) return 14 - ORDEN_JOTAS.indexOf(palo(c));
  return RANGO_NORMAL[numero(c)]!;
}

export const valorSkat = (c: IdCarta) => VALOR[numero(c)] ?? 0;

/** La carta que va ganando la baza. */
export function ganadoraSkat(mesa: readonly CartaJugada[], juego: JuegoSkat): CartaJugada {
  const salida = paloSkat(mesa[0]!.carta, juego);
  const fuerza = (c: IdCarta) => {
    const p = paloSkat(c, juego);
    if (p === 'triunfo') return 100 + rangoSkat(c, juego);
    return p === salida ? rangoSkat(c, juego) : 0;
  };
  return mesa.reduce((mejor, j) => (fuerza(j.carta) > fuerza(mejor.carta) ? j : mejor));
}

/** Las cartas que se pueden jugar: las del palo efectivo de salida, si se tienen. */
export function cartasLegalesSkat(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  juego: JuegoSkat,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloSkat(mesa[0]!.carta, juego);
  const delPalo = mano.filter((c) => paloSkat(c, juego) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

/** Los triunfos de un juego de palo o Grand, de mayor a menor. */
export function triunfosSkat(juego: Exclude<JuegoSkat, 'nulo'>): IdCarta[] {
  const jotas = ORDEN_JOTAS.map((p) => `${p}-${JOTA}` as IdCarta);
  if (juego === 'grand') return jotas;
  return [...jotas, ...[1, 10, 13, 12, 9, 8, 7].map((v) => `${juego}-${v}` as IdCarta)];
}

/** Los matadores: triunfos seguidos desde el más alto que se tienen (con) o que faltan (sin). */
export function matadoresSkat(
  cartas: readonly IdCarta[],
  juego: Exclude<JuegoSkat, 'nulo'>,
): MatadoresSkat {
  const tiene = triunfosSkat(juego).map((c) => cartas.includes(c));
  const con = tiene[0]!;
  let n = 0;
  while (n < tiene.length && tiene[n] === con) n++;
  return { con, n };
}

export const VALOR_NULO = { normal: 23, mano: 35, ouvert: 46, ouvertMano: 59 } as const;

export function valorNulo(mano: boolean, ouvert: boolean): number {
  if (ouvert) return mano ? VALOR_NULO.ouvertMano : VALOR_NULO.ouvert;
  return mano ? VALOR_NULO.mano : VALOR_NULO.normal;
}

/** Los valores de la subasta: todos los valores posibles de un juego desde 18. */
export const VALORES_SUBASTA: readonly number[] = (() => {
  const v = new Set<number>(Object.values(VALOR_NULO));
  for (const base of [9, 10, 11, 12]) for (let m = 2; m <= 18; m++) v.add(base * m);
  for (let m = 2; m <= 11; m++) v.add(24 * m);
  return [...v].filter((x) => x >= 18).sort((a, b) => a - b);
})();

export const siguienteValorSkat = (valor: number): number | null =>
  VALORES_SUBASTA.find((v) => v > valor) ?? null;

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
export const vorhandDe = (repartidor: Asiento) => siguiente(repartidor);
export const mittelhandDe = (repartidor: Asiento) => siguiente(siguiente(repartidor));

const manosDePartida = (e: Pick<EstadoSkat, 'config'>) => JUGADORES * e.config.rondas;
const partidaTerminada = (e: Pick<EstadoSkat, 'config' | 'resultadosManos'>) =>
  e.resultadosManos.length >= manosDePartida(e);

const nivel: Record<AnuncioSkat, number> = { ninguno: 0, schneider: 1, schwarz: 2, ouvert: 3 };

function nuevaMano(
  config: ConfigSkat,
  azar: EstadoAzar,
  repartidor: Asiento,
  previo: Pick<
    EstadoSkat,
    'puntos' | 'resultadosManos' | 'manosAnuladas' | 'ultimaBaza' | 'ultimaAccion'
  >,
): EstadoSkat {
  const { cartas, azar: azarSiguiente } = barajar(BARAJA_SKAT, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(k * CARTAS_MANO, (k + 1) * CARTAS_MANO);
  }
  const mittel = mittelhandDe(repartidor);
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    fase: 'subasta',
    manos,
    skat: cartas.slice(JUGADORES * CARTAS_MANO),
    turno: mittel,
    subasta: {
      pujador: mittel,
      escucha: vorhandDe(repartidor),
      valor: 0,
      esperando: 'puja',
      tramo: 1,
    },
    solista: null,
    puja: 0,
    cogioSkat: false,
    juego: null,
    anuncio: 'ninguno',
    matadores: null,
    mesa: [],
    jugadas: [],
    jugadasPor: [[], [], []],
    puntosBazas: [0, 0],
    bazas: [0, 0],
    fallos: [[], [], []],
    puntos: previo.puntos,
    resultadosManos: previo.resultadosManos,
    manosAnuladas: previo.manosAnuladas,
    ultimaBaza: previo.ultimaBaza,
    ultimaAccion: previo.ultimaAccion,
  };
}

/** Termina un tramo de la subasta con `queda` como el que sigue en ella. */
function finTramo(e: EstadoSkat, queda: Asiento): EstadoSkat {
  const s = e.subasta;
  if (s.tramo === 1) {
    const hinter = e.repartidor;
    return {
      ...e,
      turno: hinter,
      subasta: { ...s, pujador: hinter, escucha: queda, esperando: 'puja', tramo: 2 },
    };
  }
  if (s.valor > 0) return elegirSolista(e, queda, s.valor);
  // Nadie ha pujado: el que queda puede jugar con 18 o pasar.
  return {
    ...e,
    turno: queda,
    subasta: { ...s, pujador: queda, escucha: queda, esperando: 'puja', tramo: 3 },
  };
}

function elegirSolista(e: EstadoSkat, solista: Asiento, puja: number): EstadoSkat {
  return { ...e, fase: 'skat', solista, puja, turno: solista };
}

/** Las acciones de declarar: en mano con todos los anuncios; si no, solo el Nulo ouvert. */
function declaraciones(mano: boolean): AccionSkat[] {
  return JUEGOS_SKAT.flatMap((juego): AccionSkat[] => {
    const anuncios: AnuncioSkat[] =
      juego === 'nulo'
        ? ['ninguno', 'ouvert']
        : mano
          ? ['ninguno', 'schneider', 'schwarz', 'ouvert']
          : ['ninguno'];
    return anuncios.map((anuncio) => ({ tipo: 'declarar', juego, anuncio }));
  });
}

function declarar(e: EstadoSkat, juego: JuegoSkat, anuncio: AnuncioSkat): EstadoSkat {
  const solista = e.solista!;
  return {
    ...e,
    fase: 'bazas',
    juego,
    anuncio,
    matadores: juego === 'nulo' ? null : matadoresSkat([...e.manos[solista]!, ...e.skat], juego),
    turno: vorhandDe(e.repartidor),
  };
}

/** El resultado de la mano jugada. */
export function puntuarManoSkat(e: EstadoSkat): Omit<ResultadoManoSkat, 'totales'> {
  const juego = e.juego!;
  const mano = !e.cogioSkat;
  const ouvert = e.anuncio === 'ouvert';
  const comun = {
    solista: e.solista!,
    juego,
    anuncio: e.anuncio,
    mano,
    skat: e.skat,
    puja: e.puja,
    bazasSolista: e.bazas[0],
  };
  if (juego === 'nulo') {
    const valor = valorNulo(mano, ouvert);
    const pasado = valor < e.puja;
    const gana = e.bazas[0] === 0 && !pasado;
    return {
      ...comun,
      puntosSolista: e.puntosBazas[0],
      matadores: null,
      multiplicador: null,
      valor,
      gana,
      pasado,
      delta: gana ? valor : -2 * valor,
    };
  }
  const puntosSolista = e.puntosBazas[0] + e.skat.reduce((s, c) => s + valorSkat(c), 0);
  const perdedor = Math.min(puntosSolista, PUNTOS_TOTALES - puntosSolista);
  const schneider = perdedor <= PUNTOS_TOTALES - PUNTOS_SCHNEIDER;
  const schwarz = e.bazas[0] === 0 || e.bazas[1] === 0;
  const anunciado = nivel[e.anuncio];
  const matadores = e.matadores!;
  const multiplicador =
    matadores.n +
    1 +
    (mano ? 1 : 0) +
    (schneider ? 1 : 0) +
    (anunciado >= 1 ? 1 : 0) +
    (schwarz ? 1 : 0) +
    (anunciado >= 2 ? 1 : 0) +
    (ouvert ? 1 : 0);
  const base = BASE_SKAT[juego];
  let valor = base * multiplicador;
  let gana =
    puntosSolista >= PUNTOS_PARA_GANAR &&
    (anunciado < 1 || puntosSolista >= PUNTOS_SCHNEIDER) &&
    (anunciado < 2 || e.bazas[1] === 0);
  const pasado = valor < e.puja;
  if (pasado) {
    gana = false;
    valor = base * Math.ceil(e.puja / base);
  }
  return {
    ...comun,
    puntosSolista,
    matadores,
    multiplicador,
    valor,
    gana,
    pasado,
    delta: gana ? valor : -2 * valor,
  };
}

function cerrarMano(e: EstadoSkat): EstadoSkat {
  const r = puntuarManoSkat(e);
  const totales = e.puntos.map((p, a) => (a === r.solista ? p + r.delta : p));
  const cerrado: EstadoSkat = {
    ...e,
    puntos: totales,
    resultadosManos: [...e.resultadosManos, { ...r, totales }],
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e.repartidor), cerrado);
}

function resolverBaza(e: EstadoSkat): EstadoSkat {
  const juego = e.juego!;
  const ganador = ganadoraSkat(e.mesa, juego).asiento;
  const bando = ganador === e.solista ? 0 : 1;
  const valor = e.mesa.reduce((s, j) => s + valorSkat(j.carta), 0);
  const suma = (par: DeBandos<number>, n: number): DeBandos<number> =>
    bando === 0 ? [par[0] + n, par[1]] : [par[0], par[1] + n];
  const resuelto: EstadoSkat = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    jugadas: [...e.jugadas, ...e.mesa.map((j) => j.carta)],
    jugadasPor: e.jugadasPor.map((js, a) => [
      ...js,
      ...e.mesa.filter((j) => j.asiento === a).map((j) => j.carta),
    ]),
    puntosBazas: suma(e.puntosBazas, valor),
    bazas: suma(e.bazas, 1),
  };
  const terminada =
    resuelto.bazas[0] + resuelto.bazas[1] === CARTAS_MANO || (juego === 'nulo' && bando === 0);
  return terminada ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const skat: Juego<ConfigSkat, EstadoSkat, AccionSkat, VistaSkat> = {
  id: 'skat',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Skat se juega con 3');
    if (![1, 2, 3].includes(config.rondas)) return error('Las rondas son 1, 2 o 3');
    return ok(
      nuevaMano({ ...config }, crearAzar(semilla), JUGADORES - 1, {
        puntos: [0, 0, 0],
        resultadosManos: [],
        manosAnuladas: 0,
        ultimaBaza: null,
        ultimaAccion: null,
      }),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'subasta': {
        const s = e.subasta;
        if (s.esperando === 'respuesta') return [{ tipo: 'aceptar' }, { tipo: 'pasar' }];
        const puede = s.tramo === 3 || siguienteValorSkat(s.valor) !== null;
        return puede ? [{ tipo: 'pujar' }, { tipo: 'pasar' }] : [{ tipo: 'pasar' }];
      }
      case 'skat':
        return [{ tipo: 'cogerSkat' }, ...declaraciones(true)];
      case 'descarte':
        return e.manos[asiento]!.map((carta) => ({ tipo: 'descartar', carta }));
      case 'declarar':
        return declaraciones(false);
      case 'bazas':
        return cartasLegalesSkat(e.manos[asiento]!, e.mesa, e.juego!).map((carta) => ({
          tipo: 'jugar',
          carta,
        }));
    }
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoSkat = { ...e, ultimaAccion: { asiento, accion } };
    const s = e.subasta;
    switch (accion.tipo) {
      case 'pujar': {
        if (s.tramo === 3) return elegirSolista(hecha, asiento, VALORES_SUBASTA[0]!);
        const valor = siguienteValorSkat(s.valor)!;
        return {
          ...hecha,
          ultimaAccion: { asiento, accion, valor },
          turno: s.escucha,
          subasta: { ...s, valor, esperando: 'respuesta' },
        };
      }
      case 'aceptar':
        return {
          ...hecha,
          ultimaAccion: { asiento, accion, valor: s.valor },
          turno: s.pujador,
          subasta: { ...s, esperando: 'puja' },
        };
      case 'pasar': {
        if (s.tramo === 3) {
          // Nadie juega: mano anulada y reparte el siguiente.
          return nuevaMano(e.config, e.azar, siguiente(e.repartidor), {
            ...hecha,
            manosAnuladas: e.manosAnuladas + 1,
          });
        }
        return finTramo(hecha, asiento === s.pujador ? s.escucha : s.pujador);
      }
      case 'cogerSkat':
        return {
          ...hecha,
          fase: 'descarte',
          cogioSkat: true,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.skat] : m)),
          skat: [],
        };
      case 'descartar': {
        const skatNuevo = [...e.skat, accion.carta];
        return {
          ...hecha,
          fase: skatNuevo.length === 2 ? 'declarar' : 'descarte',
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          skat: skatNuevo,
        };
      }
      case 'declarar':
        return declarar(hecha, accion.juego, accion.anuncio);
      case 'jugar': {
        const juego = e.juego!;
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = paloSkat(mesa[0]!.carta, juego);
        const falla = paloSkat(accion.carta, juego) !== salida;
        const jugado: EstadoSkat = {
          ...hecha,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          mesa,
          fallos:
            falla && !e.fallos[asiento]!.includes(salida)
              ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f))
              : e.fallos,
        };
        return mesa.length < JUGADORES
          ? { ...jugado, turno: siguiente(asiento) }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const accion = e.ultimaAccion;
    const ultimaAccion =
      accion && accion.accion.tipo === 'descartar' && accion.asiento !== asiento
        ? { asiento: accion.asiento, accion: { tipo: 'descartar' as const } }
        : accion;
    const veSkat = asiento !== null && asiento === e.solista && e.cogioSkat;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      subasta: e.subasta,
      solista: e.solista,
      puja: e.puja,
      cogioSkat: e.cogioSkat,
      juego: e.juego,
      anuncio: e.anuncio,
      skat: veSkat ? [...e.skat] : null,
      manoOuvert: e.fase === 'bazas' && e.anuncio === 'ouvert' ? [...e.manos[e.solista!]!] : null,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadas: [...e.jugadas],
      jugadasPor: e.jugadasPor.map((js) => [...js]),
      puntosBazas: e.puntosBazas,
      bazas: e.bazas,
      fallos: e.fallos.map((f) => [...f]),
      puntos: [...e.puntos],
      resultadosManos: [...e.resultadosManos],
      manosAnuladas: e.manosAnuladas,
      ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const max = Math.max(...e.puntos);
    const ganadores = e.puntos.flatMap((p, a) => (p === max ? [a] : []));
    return { ganadores, empate: ganadores.length > 1, puntos: [...e.puntos] };
  },
};
