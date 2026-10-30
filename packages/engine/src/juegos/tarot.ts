import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  BARAJA_TAROT,
  cartaDeId,
  esExcusa,
  esTriunfoTarot,
  numeroTriunfo,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { quitarUna } from './spite-malice';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigTarot {
  readonly jugadores: 3 | 4 | 5;
}

export const CONFIG_TAROT_POR_DEFECTO: ConfigTarot = { jugadores: 4 };

export const CONTRATOS_TAROT = ['petite', 'garde', 'gardeSans', 'gardeContre'] as const;
export type ContratoTarot = (typeof CONTRATOS_TAROT)[number];
export const MULTIPLICADOR_TAROT: Readonly<Record<ContratoTarot, number>> = {
  petite: 1,
  garde: 2,
  gardeSans: 4,
  gardeContre: 6,
};

/** Lo que dijo cada uno en la subasta. */
export type DichoTarot = ContratoTarot | 'pasa';
export type BandoTarot = 'ataque' | 'defensa';

export type AccionTarot =
  | { readonly tipo: 'pujar'; readonly contrato: ContratoTarot }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'llamar'; readonly carta: IdCarta }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'poignee'; readonly nivel: 1 | 2 | 3 }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface PoigneeTarot {
  readonly asiento: Asiento;
  readonly nivel: 1 | 2 | 3;
  readonly cartas: readonly IdCarta[];
}

export interface BazaTarot {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface ResultadoManoTarot {
  /** Todos pasaron: nadie suma. */
  readonly nula: boolean;
  readonly contrato: ContratoTarot | null;
  readonly preneur: Asiento | null;
  readonly pareja: Asiento | null;
  readonly oudlers: number;
  /** Puntos de cartas del ataque, en medios puntos. */
  readonly mediosAtaque: number;
  readonly necesarios: number;
  readonly gana: boolean;
  /** Diferencia con lo necesario, redondeada hacia arriba. */
  readonly diferencia: number;
  readonly petitAuBout: BandoTarot | null;
  /** Valor de las poignées enseñadas (para el bando que gana). */
  readonly poignees: number;
  /** Valor de la mano para el preneur, sin multiplicar por los defensores. */
  readonly valor: number;
  readonly cambio: readonly number[];
  readonly puntosTras: readonly number[];
}

export interface EstadoTarot {
  readonly config: ConfigTarot;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly perro: readonly IdCarta[];
  readonly descarte: readonly IdCarta[];
  readonly fase: 'subasta' | 'llamada' | 'descarte' | 'bazas';
  readonly turno: Asiento;
  readonly dichos: readonly (DichoTarot | null)[];
  readonly contrato: ContratoTarot | null;
  readonly preneur: Asiento | null;
  /** Con 5, la carta llamada. */
  readonly llamada: IdCarta | null;
  /** Con 5, quién tiene la carta llamada (`null` si está en el perro o no hay llamada). */
  readonly pareja: Asiento | null;
  readonly parejaDescubierta: boolean;
  readonly poignees: readonly PoigneeTarot[];
  readonly mesa: readonly CartaJugada[];
  readonly bazas: readonly BazaTarot[];
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoTarot[];
}

export interface VistaTarot {
  readonly config: ConfigTarot;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  readonly fase: EstadoTarot['fase'];
  readonly turno: Asiento | null;
  readonly dichos: readonly (DichoTarot | null)[];
  readonly contrato: ContratoTarot | null;
  readonly preneur: Asiento | null;
  readonly llamada: IdCarta | null;
  /** La pareja del preneur, si la sabe este asiento. */
  readonly pareja: Asiento | null;
  /** El perro, si se ha enseñado en esta mano. */
  readonly perro: readonly IdCarta[] | null;
  readonly enPerro: number;
  /** El descarte entero para el preneur; para los demás, solo los triunfos descartados. */
  readonly descarte: readonly IdCarta[];
  readonly enDescarte: number;
  readonly poignees: readonly PoigneeTarot[];
  readonly mesa: readonly CartaJugada[];
  readonly bazas: readonly BazaTarot[];
  /** El bando de cada asiento si se sabe (desde este asiento), o `null`. */
  readonly bandos: readonly (BandoTarot | null)[];
  /** El número de la mano en la ronda, desde 1, y cuántas tiene la ronda. */
  readonly manoNumero: number;
  readonly manosRonda: number;
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoTarot[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const PETIT = 'triunfo-1' as IdCarta;
export const VEINTIUNO = 'triunfo-21' as IdCarta;

export const esOudler = (c: IdCarta) => c === PETIT || c === VEINTIUNO || esExcusa(c);
/** Triunfo para las obligaciones (la Excusa no lo es). */
export const esTriunfo = (c: IdCarta) => esTriunfoTarot(c);

/** El «palo» de una carta: su palo francés, `'triunfo'` o `'excusa'`. */
export function paloTarot(c: IdCarta): PaloFrances | 'triunfo' | 'excusa' {
  if (esExcusa(c)) return 'excusa';
  if (esTriunfoTarot(c)) return 'triunfo';
  return cartaDeId(c)!.palo as PaloFrances;
}

/** Valor de una carta de palo: 1–10, Sota 11, Dama 12, Rey 13 y Caballo 14. */
const valorPalo = (c: IdCarta) => cartaDeId(c)!.valor;
const RANGO_FIGURA: Readonly<Record<number, number>> = { 11: 11, 14: 12, 12: 13, 13: 14 };

/** Fuerza: los triunfos 101–121; las cartas de palo 1–14 (Rey 14); la Excusa 0. */
export function fuerzaTarot(c: IdCarta): number {
  if (esExcusa(c)) return 0;
  if (esTriunfoTarot(c)) return 100 + numeroTriunfo(c);
  const v = valorPalo(c);
  return RANGO_FIGURA[v] ?? v;
}

/** Valor en medios puntos: oudlers y Reyes 9, Damas 7, Caballos 5, Sotas 3 y el resto 1. */
export function mediosTarot(c: IdCarta): number {
  if (esOudler(c)) return 9;
  if (esTriunfoTarot(c)) return 1;
  return ({ 13: 9, 12: 7, 14: 5, 11: 3 } as Record<number, number>)[valorPalo(c)] ?? 1;
}

export const esRey = (c: IdCarta) => !esTriunfoTarot(c) && !esExcusa(c) && valorPalo(c) === 13;

/** Cartas por mano y del perro según los jugadores. */
export const REPARTO_TAROT: Readonly<Record<3 | 4 | 5, { mano: number; perro: number }>> = {
  3: { mano: 24, perro: 6 },
  4: { mano: 18, perro: 6 },
  5: { mano: 15, perro: 3 },
};

/** Triunfos (con la Excusa) para cada poignée según los jugadores. */
export const POIGNEES_TAROT: Readonly<Record<3 | 4 | 5, readonly [number, number, number]>> = {
  3: [13, 15, 18],
  4: [10, 13, 15],
  5: [8, 10, 13],
};
export const VALOR_POIGNEE: readonly number[] = [0, 20, 30, 40];

/** Lo que necesita el preneur según los oudlers que tiene. */
export const NECESARIOS_TAROT: readonly number[] = [56, 51, 41, 36];

/** La primera carta de la baza que no es la Excusa: marca el palo. */
function salidaDe(mesa: readonly CartaJugada[]): IdCarta | null {
  return mesa.find((j) => !esExcusa(j.carta))?.carta ?? null;
}

/** La carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraTarot(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = salidaDe(mesa);
  if (salida === null) return mesa[0]!;
  const triunfos = mesa.filter((j) => esTriunfoTarot(j.carta));
  const palo = paloTarot(salida);
  const candidatas =
    triunfos.length > 0 ? triunfos : mesa.filter((j) => paloTarot(j.carta) === palo);
  return candidatas.reduce((m, j) => (fuerzaTarot(j.carta) > fuerzaTarot(m.carta) ? j : m));
}

/** Las cartas que se pueden jugar: seguir el palo, fallar y subir; la Excusa siempre. */
export function cartasLegalesTarot(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  const salida = salidaDe(mesa);
  if (salida === null) return [...mano];
  const excusa = mano.filter(esExcusa);
  const palo = paloTarot(salida);
  if (palo !== 'triunfo') {
    const delPalo = mano.filter((c) => paloTarot(c) === palo);
    if (delPalo.length > 0) return [...delPalo, ...excusa];
  }
  const triunfos = mano.filter(esTriunfoTarot);
  if (triunfos.length === 0) return [...mano];
  const maximo = Math.max(
    0,
    ...mesa.filter((j) => esTriunfoTarot(j.carta)).map((j) => fuerzaTarot(j.carta)),
  );
  const suben = triunfos.filter((c) => fuerzaTarot(c) > maximo);
  return [...(suben.length > 0 ? suben : triunfos), ...excusa];
}

/** Las cartas que puede llamar el preneur con 5: un Rey que no tenga (o Dama, o Caballo). */
export function llamablesTarot(mano: readonly IdCarta[]): IdCarta[] {
  const palos: PaloFrances[] = ['picas', 'corazones', 'diamantes', 'treboles'];
  for (const valor of [13, 12, 14]) {
    const cartas = palos.map((p) => `${p}-${valor}` as IdCarta);
    if (cartas.some((c) => !mano.includes(c))) return cartas.filter((c) => !mano.includes(c));
  }
  return [];
}

/** Las cartas que puede descartar el preneur ahora. */
export function descartablesTarot(mano: readonly IdCarta[], faltan: number): IdCarta[] {
  const normales = mano.filter((c) => !esTriunfoTarot(c) && !esExcusa(c) && !esRey(c));
  if (normales.length >= faltan) return normales;
  return [...normales, ...mano.filter((c) => esTriunfoTarot(c) && !esOudler(c))];
}

/** Los triunfos que se enseñan en una poignée: los más bajos, y la Excusa si no llegan. */
export function cartasPoignee(mano: readonly IdCarta[], cuantos: number): IdCarta[] {
  const triunfos = mano.filter(esTriunfoTarot).sort((a, b) => fuerzaTarot(a) - fuerzaTarot(b));
  if (triunfos.length >= cuantos) return triunfos.slice(0, cuantos);
  return [...triunfos, ...mano.filter(esExcusa)].slice(0, cuantos);
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const n = (e: Pick<EstadoTarot, 'config'>) => e.config.jugadores;
const siguiente = (e: Pick<EstadoTarot, 'config'>, a: Asiento) => (a + 1) % n(e);
const manosRonda = (e: Pick<EstadoTarot, 'config'>) => 2 * n(e);
const terminada = (e: Pick<EstadoTarot, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= manosRonda(e);

const petitSeco = (mano: readonly IdCarta[]) =>
  mano.includes(PETIT) && !mano.some((c) => c !== PETIT && (esTriunfoTarot(c) || esExcusa(c)));

export const ataqueTarot = (e: Pick<EstadoTarot, 'preneur' | 'pareja'>, a: Asiento): boolean =>
  a === e.preneur || a === e.pareja;

function nuevaMano(
  base: Pick<EstadoTarot, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoTarot {
  const jugadores = base.config.jugadores;
  const { mano, perro } = REPARTO_TAROT[jugadores];
  let a = azar;
  let manos: IdCarta[][];
  let resto: IdCarta[];
  // Con el Petit seco se reparte de nuevo.
  do {
    const { cartas, azar: sig } = barajar(BARAJA_TAROT, a);
    a = sig;
    manos = Array.from({ length: jugadores }, (_, i) => cartas.slice(i * mano, (i + 1) * mano));
    resto = cartas.slice(jugadores * mano);
  } while (manos.some(petitSeco));
  const primero = (repartidor + 1) % jugadores;
  return {
    ...base,
    azar: a,
    repartidor,
    manos,
    perro: resto.slice(0, perro),
    descarte: [],
    fase: 'subasta',
    turno: primero,
    dichos: Array.from({ length: jugadores }, () => null),
    contrato: null,
    preneur: null,
    llamada: null,
    pareja: null,
    parejaDescubierta: false,
    poignees: [],
    mesa: [],
    bazas: [],
  };
}

/** Cierra la mano: la puntúa y reparte la siguiente si no ha acabado la ronda. */
function cerrarMano(e: EstadoTarot, resultado: ResultadoManoTarot): EstadoTarot {
  const cerrado: EstadoTarot = {
    ...e,
    puntos: resultado.puntosTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e, e.repartidor), e.azar);
}

function manoNula(e: EstadoTarot): ResultadoManoTarot {
  return {
    nula: true,
    contrato: null,
    preneur: null,
    pareja: null,
    oudlers: 0,
    mediosAtaque: 0,
    necesarios: 0,
    gana: false,
    diferencia: 0,
    petitAuBout: null,
    poignees: 0,
    valor: 0,
    cambio: e.puntos.map(() => 0),
    puntosTras: [...e.puntos],
  };
}

export function puntuarManoTarot(e: EstadoTarot): ResultadoManoTarot {
  const contrato = e.contrato!;
  const preneur = e.preneur!;
  const esAtaque = (a: Asiento) => ataqueTarot(e, a);
  let medios = 0;
  let oudlers = 0;
  const alAtaque = (c: IdCarta) => {
    medios += mediosTarot(c);
    if (esOudler(c)) oudlers++;
  };
  for (const b of e.bazas) {
    const ganaAtaque = esAtaque(b.ganador);
    for (const j of b.cartas) {
      if (esExcusa(j.carta)) {
        const delAtaque = esAtaque(j.asiento);
        // La Excusa vuelve a su bando, que da medio punto al ganador.
        if (delAtaque) {
          medios += ganaAtaque ? 9 : 8;
          oudlers++;
        } else if (ganaAtaque) {
          medios += 1;
        }
      } else if (ganaAtaque) {
        alAtaque(j.carta);
      }
    }
  }
  if (contrato === 'petite' || contrato === 'garde') e.descarte.forEach(alAtaque);
  if (contrato === 'gardeSans') e.perro.forEach(alAtaque);
  const necesarios = NECESARIOS_TAROT[oudlers]!;
  const d = medios - 2 * necesarios;
  const gana = d >= 0;
  const diferencia = Math.ceil(Math.abs(d) / 2);
  const mult = MULTIPLICADOR_TAROT[contrato];
  const ultima = e.bazas.at(-1);
  const petitAuBout: BandoTarot | null =
    ultima && ultima.cartas.some((j) => j.carta === PETIT)
      ? esAtaque(ultima.ganador)
        ? 'ataque'
        : 'defensa'
      : null;
  const poignees = e.poignees.reduce((s, p) => s + VALOR_POIGNEE[p.nivel]!, 0);
  const signo = gana ? 1 : -1;
  const valor =
    signo * (25 + diferencia) * mult +
    (petitAuBout === null ? 0 : (petitAuBout === 'ataque' ? 1 : -1) * 10 * mult) +
    signo * poignees;
  const defensores = e.puntos.length - (e.pareja === null ? 1 : 2);
  const cambio = e.puntos.map((_, a) => {
    if (a === preneur) return e.pareja === null ? valor * defensores : 2 * valor;
    if (a === e.pareja) return valor;
    return -valor;
  });
  return {
    nula: false,
    contrato,
    preneur,
    pareja: e.pareja,
    oudlers,
    mediosAtaque: medios,
    necesarios,
    gana,
    diferencia,
    petitAuBout,
    poignees,
    valor,
    cambio,
    puntosTras: e.puntos.map((p, a) => p + cambio[a]!),
  };
}

/** Tras la subasta (y la llamada): el perro según el contrato. */
function trasLlamada(e: EstadoTarot): EstadoTarot {
  const preneur = e.preneur!;
  const llamada = e.llamada;
  const pareja =
    llamada === null
      ? null
      : (e.manos.findIndex((m, a) => a !== preneur && m.includes(llamada)) as Asiento);
  const conPareja = { ...e, pareja: pareja === -1 ? null : pareja };
  if (e.contrato === 'petite' || e.contrato === 'garde') {
    return {
      ...conPareja,
      fase: 'descarte',
      turno: preneur,
      manos: e.manos.map((m, a) => (a === preneur ? [...m, ...e.perro] : m)),
    };
  }
  return { ...conPareja, fase: 'bazas', turno: siguiente(e, e.repartidor) };
}

function cerrarSubasta(e: EstadoTarot): EstadoTarot {
  let preneur: Asiento | null = null;
  let contrato: ContratoTarot | null = null;
  e.dichos.forEach((d, a) => {
    if (d === null || d === 'pasa') return;
    if (contrato === null || CONTRATOS_TAROT.indexOf(d) > CONTRATOS_TAROT.indexOf(contrato)) {
      contrato = d;
      preneur = a;
    }
  });
  if (preneur === null) return cerrarMano(e, manoNula(e));
  const r: EstadoTarot = { ...e, preneur, contrato };
  if (n(e) === 5) return { ...r, fase: 'llamada', turno: preneur };
  return trasLlamada(r);
}

/** Ya ha jugado alguna carta en esta mano. */
const haJugado = (e: EstadoTarot, a: Asiento) =>
  e.mesa.some((j) => j.asiento === a) || e.bazas.some((b) => b.cartas.some((j) => j.asiento === a));

/** Las poignées que puede enseñar ahora (niveles). */
function poigneesPosibles(e: EstadoTarot, a: Asiento): (1 | 2 | 3)[] {
  if (e.poignees.some((p) => p.asiento === a) || haJugado(e, a)) return [];
  const mano = e.manos[a]!;
  const triunfos = mano.filter((c) => esTriunfoTarot(c) || esExcusa(c)).length;
  const umbrales = POIGNEES_TAROT[e.config.jugadores];
  return ([1, 2, 3] as const).filter((nivel) => triunfos >= umbrales[nivel - 1]!);
}

function resolverBaza(e: EstadoTarot): EstadoTarot {
  const ganador = ganadoraTarot(e.mesa).asiento;
  const bazas = [...e.bazas, { cartas: e.mesa, ganador }];
  const r: EstadoTarot = { ...e, mesa: [], bazas, turno: ganador };
  if (r.manos.every((m) => m.length === 0)) return cerrarMano(r, puntuarManoTarot(r));
  return r;
}

/** El bando de cada asiento que se sabe desde `asiento`. */
export function bandosConocidosTarot(
  e: EstadoTarot,
  asiento: Asiento | null,
): (BandoTarot | null)[] {
  const todos = Array.from({ length: n(e) }, (_, a) => a);
  if (e.preneur === null || e.fase === 'subasta' || e.fase === 'llamada')
    return todos.map(() => null);
  if (n(e) < 5) return todos.map((a) => (a === e.preneur ? 'ataque' : 'defensa'));
  const perroVisto = verPerro(e);
  const solo = perroVisto && e.llamada !== null && e.perro.includes(e.llamada);
  const sabePareja = e.parejaDescubierta || (asiento !== null && asiento === e.pareja);
  return todos.map((a) => {
    if (a === e.preneur) return 'ataque';
    if (solo) return 'defensa';
    if (sabePareja) return a === e.pareja ? 'ataque' : 'defensa';
    if (a === asiento) return 'defensa';
    return null;
  });
}

/** El perro se enseña en la Petite y la Garde, desde el descarte. */
const verPerro = (e: EstadoTarot) =>
  (e.contrato === 'petite' || e.contrato === 'garde') &&
  (e.fase === 'descarte' || e.fase === 'bazas');

// ── Juego ────────────────────────────────────────────────────────────────────

export const tarot: Juego<ConfigTarot, EstadoTarot, AccionTarot, VistaTarot> = {
  id: 'tarot',

  crear(config, semilla) {
    if (![3, 4, 5].includes(config.jugadores)) {
      return error('El Tarot se juega entre 3, 4 o 5 jugadores');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: config.jugadores },
          puntos: Array.from({ length: config.jugadores }, () => 0),
          resultadosManos: [],
        },
        config.jugadores - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => n(e),

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    switch (e.fase) {
      case 'subasta': {
        const actual = e.dichos.reduce(
          (m, d) => (d !== null && d !== 'pasa' ? Math.max(m, CONTRATOS_TAROT.indexOf(d)) : m),
          -1,
        );
        return [
          { tipo: 'pasar' },
          ...CONTRATOS_TAROT.slice(actual + 1).map((contrato): AccionTarot => ({
            tipo: 'pujar',
            contrato,
          })),
        ];
      }
      case 'llamada':
        return llamablesTarot(mano)
          .sort()
          .map((carta): AccionTarot => ({ tipo: 'llamar', carta }));
      case 'descarte': {
        const faltan = e.perro.length - e.descarte.length;
        return descartablesTarot(mano, faltan)
          .sort()
          .map((carta): AccionTarot => ({ tipo: 'descartar', carta }));
      }
      case 'bazas':
        return [
          ...poigneesPosibles(e, asiento).map((nivel): AccionTarot => ({ tipo: 'poignee', nivel })),
          ...cartasLegalesTarot(mano, e.mesa)
            .sort()
            .map((carta): AccionTarot => ({ tipo: 'jugar', carta })),
        ];
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pasar':
      case 'pujar': {
        const dichos = e.dichos.map((d, a) =>
          a === asiento ? (accion.tipo === 'pasar' ? 'pasa' : accion.contrato) : d,
        );
        const r = { ...e, dichos, turno: siguiente(e, asiento) };
        return dichos.every((d) => d !== null) ? cerrarSubasta(r) : r;
      }
      case 'llamar':
        return trasLlamada({ ...e, llamada: accion.carta });
      case 'descartar': {
        const manos = e.manos.map((m, a) => (a === asiento ? quitarUna(m, accion.carta) : m));
        const descarte = [...e.descarte, accion.carta];
        const r = { ...e, manos, descarte };
        if (descarte.length < e.perro.length) return r;
        return { ...r, fase: 'bazas', turno: siguiente(e, e.repartidor) };
      }
      case 'poignee': {
        const cuantos = POIGNEES_TAROT[e.config.jugadores][accion.nivel - 1]!;
        const cartas = cartasPoignee(e.manos[asiento]!, cuantos);
        return { ...e, poignees: [...e.poignees, { asiento, nivel: accion.nivel, cartas }] };
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) => (a === asiento ? quitarUna(m, accion.carta) : m));
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const parejaDescubierta = e.parejaDescubierta || accion.carta === e.llamada;
        const r = { ...e, manos, mesa, parejaDescubierta };
        if (mesa.length < n(e)) return { ...r, turno: siguiente(e, asiento) };
        return resolverBaza(r);
      }
    }
  },

  vistaDe(e, asiento) {
    const preneur = asiento !== null && asiento === e.preneur;
    const sabePareja = e.parejaDescubierta || (asiento !== null && asiento === e.pareja);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      dichos: [...e.dichos],
      contrato: e.contrato,
      preneur: e.preneur,
      llamada: e.llamada,
      pareja: sabePareja ? e.pareja : null,
      perro: verPerro(e) ? [...e.perro] : null,
      enPerro: e.perro.length,
      descarte: preneur ? [...e.descarte] : e.descarte.filter(esTriunfoTarot),
      enDescarte: e.descarte.length,
      poignees: [...e.poignees],
      mesa: [...e.mesa],
      bazas: [...e.bazas],
      bandos: bandosConocidosTarot(e, asiento),
      manoNumero: Math.min(e.resultadosManos.length + 1, manosRonda(e)),
      manosRonda: manosRonda(e),
      puntos: [...e.puntos],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const max = Math.max(...e.puntos);
    const ganadores = e.puntos.flatMap((p, a) => (p === max ? [a] : []));
    return { ganadores, empate: ganadores.length > 1, puntos: [...e.puntos] };
  },
};
