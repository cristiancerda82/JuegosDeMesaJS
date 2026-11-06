import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Tresillo para 3; las manos y las fichas van en la config para que las pruebas sean cortas. */
export interface ConfigTresillo {
  readonly manos: number;
  readonly fichas: number;
}

export const CONFIG_TRESILLO_POR_DEFECTO: ConfigTresillo = { manos: 12, fichas: 100 };

export type FaseTresillo = 'subasta' | 'triunfo' | 'cambio' | 'bazas';

/** Los contratos, de menor a mayor. */
export const CONTRATOS_TRESILLO = ['entrada', 'vuelta', 'solo'] as const;
export type ContratoTresillo = (typeof CONTRATOS_TRESILLO)[number];

/** Lo que pagan los defensores al hombre (o él a cada uno) según el contrato. */
export const VALOR_CONTRATO_TRESILLO: Readonly<Record<ContratoTresillo, number>> = {
  entrada: 2,
  vuelta: 4,
  solo: 6,
};

export type AccionTresillo =
  | { readonly tipo: 'pujar'; readonly contrato: ContratoTresillo }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'triunfo'; readonly palo: PaloEspanol }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'jugarCarta'; readonly carta: IdCarta };

export type DesenlaceTresillo = 'sacada' | 'puesta' | 'codillo';

export interface ResultadoManoTresillo {
  readonly repartidor: Asiento;
  /** `true` si pasaron los tres y no se jugó. */
  readonly pasada: boolean;
  readonly hombre: Asiento | null;
  readonly contrato: ContratoTresillo | null;
  readonly triunfo: PaloEspanol | null;
  readonly bazas: readonly number[];
  readonly desenlace: DesenlaceTresillo | null;
  /** El defensor que hizo codillo. */
  readonly codillo: Asiento | null;
  /** El bote que se jugó. */
  readonly bote: number;
  readonly cambioFichas: readonly number[];
  readonly fichasTras: readonly number[];
  readonly boteTras: number;
}

/** Lo que se sabe de lo que no tiene cada uno. */
export interface FallosTresillo {
  /** Palos (que no son triunfo) que no siguió. */
  readonly palos: readonly PaloEspanol[];
  /** El rango de la salida de triunfo más alta a la que no echó triunfo (0 si ninguna). */
  readonly triunfo: number;
}

export interface EstadoTresillo {
  readonly config: ConfigTresillo;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** El siguiente que se roba es el primero. */
  readonly monte: readonly IdCarta[];
  readonly descartes: readonly IdCarta[];
  readonly fase: FaseTresillo;
  readonly turno: Asiento;
  /** Lo último que pujó cada uno, `'paso'` si pasó, `null` si aún nada. */
  readonly pujas: readonly (ContratoTresillo | 'paso' | null)[];
  readonly pujaMayor: ContratoTresillo | null;
  readonly hombre: Asiento | null;
  readonly contrato: ContratoTresillo | null;
  readonly triunfo: PaloEspanol | null;
  /** La carta vuelta en la vuelta. */
  readonly vuelta: IdCarta | null;
  /** Cuántas cartas cambió cada uno (`null` si aún no). */
  readonly cambiadas: readonly (number | null)[];
  /** Cuántas se ha descartado el que tiene el turno en el cambio. */
  readonly descartando: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly FallosTresillo[];
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly bote: number;
  readonly resultadosManos: readonly ResultadoManoTresillo[];
}

export interface VistaTresillo {
  readonly config: ConfigTresillo;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enMonte: number;
  readonly repartidor: Asiento;
  readonly fase: FaseTresillo;
  readonly turno: Asiento | null;
  readonly pujas: EstadoTresillo['pujas'];
  readonly pujaMayor: ContratoTresillo | null;
  readonly hombre: Asiento | null;
  readonly contrato: ContratoTresillo | null;
  readonly triunfo: PaloEspanol | null;
  readonly vuelta: IdCarta | null;
  readonly cambiadas: readonly (number | null)[];
  readonly descartando: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoTresillo['ultimaBaza'];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly FallosTresillo[];
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly bote: number;
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoTresillo[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_TRESILLO: readonly IdCarta[] = crearBaraja('espanola40');

export const ESPADILLA = 'espadas-1';
export const BASTO = 'bastos-1';

export const paloTresillo = (c: IdCarta) => cartaDeId(c)!.palo as PaloEspanol;
const valorTresillo = (c: IdCarta) => cartaDeId(c)!.valor;
const esNegro = (p: PaloEspanol) => p === 'espadas' || p === 'bastos';

/** La malilla: el 2 del triunfo si es negro, el 7 si es rojo. */
export const malillaTresillo = (triunfo: PaloEspanol): IdCarta =>
  `${triunfo}-${esNegro(triunfo) ? 2 : 7}`;

export const esTriunfoTresillo = (c: IdCarta, triunfo: PaloEspanol) =>
  c === ESPADILLA || c === BASTO || paloTresillo(c) === triunfo;

export const esMatadorTresillo = (c: IdCarta, triunfo: PaloEspanol) =>
  c === ESPADILLA || c === BASTO || c === malillaTresillo(triunfo);

/** El palo al que cuenta la carta: la espadilla y el basto son del triunfo. */
export const paloEfectivoTresillo = (c: IdCarta, triunfo: PaloEspanol) =>
  esTriunfoTresillo(c, triunfo) ? triunfo : paloTresillo(c);

/**
 * Rango de la carta con ese triunfo (spec juego-tresillo): los triunfos por encima de 180, con
 * los matadores y el punto arriba; las demás por debajo de 51, según el orden de su color.
 */
export function rangoTresillo(c: IdCarta, triunfo: PaloEspanol): number {
  if (c === ESPADILLA) return 200;
  if (c === malillaTresillo(triunfo)) return 199;
  if (c === BASTO) return 198;
  const palo = paloTresillo(c);
  const v = valorTresillo(c);
  const negro = esNegro(palo);
  if (palo === triunfo) {
    if (v === 1) return 197; // El punto, solo con triunfo rojo.
    if (v >= 10) return 178 + v; // Rey 190, caballo 189, sota 188.
    return negro ? 180 + v : 189 - v; // Negro: 7 187 … 3 183; rojo: 2 187 … 6 183.
  }
  if (v >= 10) return 38 + v; // Rey 50, caballo 49, sota 48.
  return negro ? 40 + v : 48 - v; // Negro: 7 47 … 2 42; rojo: As 47, 2 46 … 7 41.
}

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraTresillo(mesa: readonly CartaJugada[], triunfo: PaloEspanol): CartaJugada {
  const salida = paloEfectivoTresillo(mesa[0]!.carta, triunfo);
  const valor = (c: IdCarta) =>
    esTriunfoTresillo(c, triunfo) || paloTresillo(c) === salida ? rangoTresillo(c, triunfo) : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Los triunfos que obligan a echar triunfo cuando sale triunfo con esa carta. */
export const obliganTresillo = (c: IdCarta, salida: IdCarta, triunfo: PaloEspanol) =>
  esTriunfoTresillo(c, triunfo) &&
  (!esMatadorTresillo(c, triunfo) ||
    (esMatadorTresillo(salida, triunfo) &&
      rangoTresillo(c, triunfo) < rangoTresillo(salida, triunfo)));

/**
 * Cartas que se pueden jugar (spec juego-tresillo): hay que seguir el palo; si sale triunfo, los
 * matadores no obligan, salvo que la salida sea un matador más alto.
 */
export function cartasLegalesTresillo(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = mesa[0]!.carta;
  const palo = paloEfectivoTresillo(salida, triunfo);
  if (palo !== triunfo) {
    const delPalo = mano.filter((c) => paloEfectivoTresillo(c, triunfo) === palo);
    return delPalo.length > 0 ? delPalo : [...mano];
  }
  if (!mano.some((c) => obliganTresillo(c, salida, triunfo))) return [...mano];
  return mano.filter((c) => esTriunfoTresillo(c, triunfo));
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 3;
export const CARTAS_EN_MANO_TRESILLO = 9;
const ASIENTOS = [0, 1, 2];

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
const ceros = () => [0, 0, 0];
const sinFallos = (): FallosTresillo[] => ASIENTOS.map(() => ({ palos: [], triunfo: 0 }));

/** Los asientos que cumplen `vale`, en orden desde el siguiente a `a`. */
function desde(a: Asiento, vale: (x: Asiento) => boolean): Asiento[] {
  return [1, 2, 3].map((k) => (a + k) % JUGADORES).filter(vale);
}

const terminada = (e: Pick<EstadoTresillo, 'config' | 'resultadosManos' | 'fichas'>) =>
  e.resultadosManos.length >= e.config.manos ||
  (e.resultadosManos.length > 0 && e.fichas.some((f) => f <= 0));

function nuevaMano(
  base: Pick<EstadoTresillo, 'config' | 'fichas' | 'bote' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoTresillo {
  const { cartas, azar: sig } = barajar(BARAJA_TRESILLO, azar);
  const orden = desde(repartidor, () => true);
  const manos: IdCarta[][] = [[], [], []];
  orden.forEach((a, k) => {
    manos[a] = cartas.slice(k * CARTAS_EN_MANO_TRESILLO, (k + 1) * CARTAS_EN_MANO_TRESILLO);
  });
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    monte: cartas.slice(JUGADORES * CARTAS_EN_MANO_TRESILLO),
    descartes: [],
    fase: 'subasta',
    turno: siguiente(repartidor),
    pujas: [null, null, null],
    pujaMayor: null,
    hombre: null,
    contrato: null,
    triunfo: null,
    vuelta: null,
    cambiadas: [null, null, null],
    descartando: 0,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadasPor: [[], [], []],
    fallos: sinFallos(),
    bazas: ceros(),
    fichas: base.fichas.map((f) => (f > 0 ? f - 1 : f)),
    bote: base.bote + base.fichas.filter((f) => f > 0).length,
  };
}

/** Sacada, puesta o codillo (y quién hace codillo) con esas bazas. */
export function desenlaceTresillo(
  bazas: readonly number[],
  hombre: Asiento,
): { desenlace: DesenlaceTresillo; codillo: Asiento | null } {
  const defensores = desde(hombre, (a) => a !== hombre);
  const maximo = Math.max(...defensores.map((a) => bazas[a]!));
  const h = bazas[hombre]!;
  if (h > maximo) return { desenlace: 'sacada', codillo: null };
  if (h === maximo) return { desenlace: 'puesta', codillo: null };
  return { desenlace: 'codillo', codillo: defensores.find((a) => bazas[a] === maximo)! };
}

function cerrarMano(e: EstadoTresillo): EstadoTresillo {
  const fichas = [...e.fichas];
  let bote = e.bote;
  const pagar = (de: Asiento | 'bote', a: Asiento | 'bote', n: number) => {
    const paga = Math.min(de === 'bote' ? bote : fichas[de]!, n);
    if (de === 'bote') bote -= paga;
    else fichas[de] = fichas[de]! - paga;
    if (a === 'bote') bote += paga;
    else fichas[a] = fichas[a]! + paga;
  };
  const pasada = e.hombre === null;
  let desenlace: DesenlaceTresillo | null = null;
  let codillo: Asiento | null = null;
  if (!pasada) {
    const hombre = e.hombre!;
    const valor = VALOR_CONTRATO_TRESILLO[e.contrato!];
    const defensores = desde(hombre, (a) => a !== hombre);
    ({ desenlace, codillo } = desenlaceTresillo(e.bazas, hombre));
    if (desenlace === 'sacada') {
      pagar('bote', hombre, bote);
      for (const d of defensores) pagar(d, hombre, valor);
    } else {
      if (desenlace === 'puesta') pagar(hombre, 'bote', e.bote);
      else pagar(hombre, codillo!, e.bote);
      for (const d of defensores) pagar(hombre, d, valor);
    }
  }
  const resultado: ResultadoManoTresillo = {
    repartidor: e.repartidor,
    pasada,
    hombre: e.hombre,
    contrato: e.contrato,
    triunfo: e.triunfo,
    bazas: e.bazas,
    desenlace,
    codillo,
    bote: e.bote,
    cambioFichas: fichas.map((f, a) => f - e.fichas[a]!),
    fichasTras: fichas,
    boteTras: bote,
  };
  const cerrado: EstadoTresillo = {
    ...e,
    fichas,
    bote,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Tras la subasta: el hombre elige el triunfo, o en la vuelta se descubre y empieza el cambio. */
function trasSubasta(e: EstadoTresillo, hombre: Asiento): EstadoTresillo {
  const contrato = e.pujaMayor!;
  const r: EstadoTresillo = { ...e, hombre, contrato, turno: hombre };
  if (contrato !== 'vuelta') return { ...r, fase: 'triunfo' };
  const vuelta = e.monte[0]!;
  return { ...r, fase: 'cambio', vuelta, triunfo: paloTresillo(vuelta), descartando: 0 };
}

function resolverBaza(e: EstadoTresillo): EstadoTresillo {
  const ganador = ganadoraTresillo(e.mesa, e.triunfo!).asiento;
  const r: EstadoTresillo = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  return r.manos.every((m) => m.length === 0) ? cerrarMano(r) : r;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const tresillo: Juego<ConfigTresillo, EstadoTresillo, AccionTresillo, VistaTresillo> = {
  id: 'tresillo',

  crear(config, semilla) {
    if (!Number.isInteger(config.manos) || config.manos < 1) {
      return error('El número de manos debe ser un entero positivo');
    }
    if (!Number.isInteger(config.fichas) || config.fichas < 1) {
      return error('Las fichas deben ser un entero positivo');
    }
    // Reparte el asiento 2, así el asiento 0 es el mano.
    return ok(
      nuevaMano(
        {
          config: { manos: config.manos, fichas: config.fichas },
          fichas: ceros().map(() => config.fichas),
          bote: 0,
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
        const desdeIndice = e.pujaMayor === null ? 0 : CONTRATOS_TRESILLO.indexOf(e.pujaMayor) + 1;
        return [
          { tipo: 'pasar' },
          ...CONTRATOS_TRESILLO.slice(desdeIndice).map((contrato): AccionTresillo => ({
            tipo: 'pujar',
            contrato,
          })),
        ];
      }
      case 'triunfo':
        return (['oros', 'copas', 'espadas', 'bastos'] as const).map((palo) => ({
          tipo: 'triunfo',
          palo,
        }));
      case 'cambio': {
        const r: AccionTresillo[] = [];
        // En la vuelta, el hombre tiene que llevarse la carta vuelta.
        const debe = e.contrato === 'vuelta' && asiento === e.hombre && e.descartando === 0;
        if (!debe) r.push({ tipo: 'robar' });
        if (e.descartando < e.monte.length) {
          for (const carta of [...mano].sort()) r.push({ tipo: 'descartar', carta });
        }
        return r;
      }
      case 'bazas':
        return cartasLegalesTresillo(mano, e.mesa, e.triunfo!)
          .sort()
          .map((carta) => ({ tipo: 'jugarCarta', carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pujar':
      case 'pasar': {
        const puja = accion.tipo === 'pujar' ? accion.contrato : 'paso';
        const r: EstadoTresillo = {
          ...e,
          pujas: e.pujas.map((p, a) => (a === asiento ? puja : p)),
          pujaMayor: accion.tipo === 'pujar' ? accion.contrato : e.pujaMayor,
        };
        const quedan = ASIENTOS.filter((a) => r.pujas[a] !== 'paso');
        if (quedan.length === 0) return cerrarMano(r);
        if (r.pujaMayor !== null && quedan.length === 1) return trasSubasta(r, quedan[0]!);
        return { ...r, turno: desde(asiento, (a) => r.pujas[a] !== 'paso')[0]! };
      }
      case 'triunfo': {
        const r: EstadoTresillo = { ...e, triunfo: accion.palo, fase: 'cambio', descartando: 0 };
        if (e.contrato !== 'solo') return r;
        // En el solo el hombre no cambia: empiezan los defensores.
        return {
          ...r,
          cambiadas: e.cambiadas.map((c, a) => (a === asiento ? 0 : c)),
          turno: siguiente(asiento),
        };
      }
      case 'descartar':
        return {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          descartes: [...e.descartes, accion.carta],
          descartando: e.descartando + 1,
        };
      case 'robar': {
        const k = e.descartando;
        const r: EstadoTresillo = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.monte.slice(0, k)] : m)),
          monte: e.monte.slice(k),
          cambiadas: e.cambiadas.map((c, a) => (a === asiento ? k : c)),
          descartando: 0,
        };
        const falta = desde(asiento, (a) => r.cambiadas[a] === null)[0];
        if (falta !== undefined) return { ...r, turno: falta };
        return { ...r, fase: 'bazas', turno: siguiente(r.repartidor) };
      }
      case 'jugarCarta': {
        const triunfo = e.triunfo!;
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = mesa[0]!.carta;
        const paloSalida = paloEfectivoTresillo(salida, triunfo);
        const palo = paloEfectivoTresillo(accion.carta, triunfo);
        const f = e.fallos[asiento]!;
        let fallo = f;
        if (palo !== paloSalida) {
          fallo =
            paloSalida === triunfo
              ? { ...f, triunfo: Math.max(f.triunfo, rangoTresillo(salida, triunfo)) }
              : f.palos.includes(paloSalida)
                ? f
                : { ...f, palos: [...f.palos, paloSalida] };
        }
        const jugado: EstadoTresillo = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          mesa,
          jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          fallos: e.fallos.map((x, a) => (a === asiento ? fallo : x)),
        };
        if (mesa.length < JUGADORES) return { ...jugado, turno: siguiente(asiento) };
        return resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enMonte: e.monte.length,
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      pujas: [...e.pujas],
      pujaMayor: e.pujaMayor,
      hombre: e.hombre,
      contrato: e.contrato,
      triunfo: e.triunfo,
      vuelta: e.vuelta,
      cambiadas: [...e.cambiadas],
      descartando: e.descartando,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => ({ palos: [...f.palos], triunfo: f.triunfo })),
      bazas: [...e.bazas],
      fichas: [...e.fichas],
      bote: e.bote,
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = [...e.fichas];
    const maximo = Math.max(...puntos);
    const ganadores = puntos.flatMap((p, a) => (p === maximo ? [a] : []));
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
