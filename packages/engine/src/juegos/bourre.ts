import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Bourré para 5; las manos y las fichas van en la config para que las pruebas sean cortas. */
export interface ConfigBourre {
  readonly jugadores: 5;
  readonly manos: number;
  readonly fichas: number;
}

export const CONFIG_BOURRE_POR_DEFECTO: ConfigBourre = { jugadores: 5, manos: 15, fichas: 100 };

export type FaseBourre = 'decidir' | 'cambio' | 'bazas';

export type AccionBourre =
  | { readonly tipo: 'jugar' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'jugarCarta'; readonly carta: IdCarta };

export interface ResultadoManoBourre {
  readonly repartidor: Asiento;
  readonly triunfo: PaloFrances;
  /** Quién jugó la mano (`null` si no tenía fichas). */
  readonly juegan: readonly (boolean | null)[];
  readonly bazas: readonly number[];
  /** Quien se llevó el bote, o `null` si se quedó. */
  readonly ganador: Asiento | null;
  /** Los que jugaron y no hicieron ninguna baza. */
  readonly bourre: readonly Asiento[];
  /** El bote que se jugó. */
  readonly bote: number;
  readonly cambioFichas: readonly number[];
  readonly fichasTras: readonly number[];
  readonly boteTras: number;
}

export interface EstadoBourre {
  readonly config: ConfigBourre;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Los asientos con fichas al empezar la mano. */
  readonly activos: readonly boolean[];
  readonly manos: readonly (readonly IdCarta[])[];
  /** El siguiente que se roba es el primero. */
  readonly mazo: readonly IdCarta[];
  /** Descartes y manos de quienes pasaron, boca abajo. */
  readonly descartes: readonly IdCarta[];
  readonly vuelta: IdCarta;
  readonly fase: FaseBourre;
  readonly turno: Asiento;
  /** `true` si juega, `false` si pasó, `null` si aún no ha decidido o no tiene fichas. */
  readonly juega: readonly (boolean | null)[];
  /** Cuántas cartas cambió cada uno (`null` si aún no). */
  readonly cambiadas: readonly (number | null)[];
  /** Cuántas se ha descartado el que tiene el turno en el cambio. */
  readonly cambiando: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos que cada uno no tiene: el de salida que no siguió y el triunfo que no echó. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly bote: number;
  readonly resultadosManos: readonly ResultadoManoBourre[];
}

export interface VistaBourre {
  readonly config: ConfigBourre;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enMazo: number;
  readonly repartidor: Asiento;
  readonly activos: readonly boolean[];
  readonly vuelta: IdCarta;
  readonly fase: FaseBourre;
  readonly turno: Asiento | null;
  readonly juega: readonly (boolean | null)[];
  readonly cambiadas: readonly (number | null)[];
  readonly cambiando: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoBourre['ultimaBaza'];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly bote: number;
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoBourre[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_BOURRE: readonly IdCarta[] = crearBaraja('francesa52');

export const paloBourre = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** El orden: del 2 (2) al As (14). */
export const rangoBourre = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
const AS = 14;

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraBourre(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloBourre(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    paloBourre(c) === triunfo
      ? 100 + rangoBourre(c)
      : paloBourre(c) === salida
        ? rangoBourre(c)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/**
 * Cartas que se pueden jugar (spec juego-bourre): al salir, el As de triunfo si se tiene; con el
 * palo, una que gane si se puede; sin el palo, triunfo, y uno que supere al más alto si se puede.
 */
export function cartasLegalesBourre(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
): IdCarta[] {
  if (mesa.length === 0) {
    const as = mano.find((c) => paloBourre(c) === triunfo && rangoBourre(c) === AS);
    return as ? [as] : [...mano];
  }
  const salida = paloBourre(mesa[0]!.carta);
  const ganadora = ganadoraBourre(mesa, triunfo).carta;
  const delPalo = mano.filter((c) => paloBourre(c) === salida);
  if (delPalo.length > 0) {
    if (paloBourre(ganadora) !== salida) return delPalo;
    const ganan = delPalo.filter((c) => rangoBourre(c) > rangoBourre(ganadora));
    return ganan.length > 0 ? ganan : delPalo;
  }
  const triunfos = mano.filter((c) => paloBourre(c) === triunfo);
  if (triunfos.length === 0) return [...mano];
  const alto = Math.max(
    0,
    ...mesa.filter((j) => paloBourre(j.carta) === triunfo).map((j) => rangoBourre(j.carta)),
  );
  const superan = triunfos.filter((c) => rangoBourre(c) > alto);
  return superan.length > 0 ? superan : triunfos;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 5;
export const CARTAS_EN_MANO_BOURRE = 5;
const MAXIMO_CAMBIO = 5;

const ceros = () => [0, 0, 0, 0, 0];
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Los asientos que cumplen `vale`, en orden desde el siguiente a `desde`. */
function desde(a: Asiento, vale: (x: Asiento) => boolean): Asiento[] {
  return Array.from({ length: JUGADORES }, (_, k) => (a + 1 + k) % JUGADORES).filter(vale);
}

const conFichas = (fichas: readonly number[]) => fichas.filter((f) => f > 0).length;

const terminada = (e: Pick<EstadoBourre, 'config' | 'resultadosManos' | 'fichas'>) =>
  e.resultadosManos.length >= e.config.manos ||
  (e.resultadosManos.length > 0 && conFichas(e.fichas) <= 1);

function nuevaMano(
  base: Pick<EstadoBourre, 'config' | 'fichas' | 'bote' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoBourre {
  const activos = base.fichas.map((f) => f > 0);
  const { cartas, azar: sig } = barajar(BARAJA_BOURRE, azar);
  const manos: IdCarta[][] = [[], [], [], [], []];
  const orden = desde(repartidor, (a) => activos[a]!);
  orden.forEach((a, k) => {
    manos[a] = cartas.slice(k * CARTAS_EN_MANO_BOURRE, (k + 1) * CARTAS_EN_MANO_BOURRE);
  });
  const repartidas = orden.length * CARTAS_EN_MANO_BOURRE;
  return {
    ...base,
    azar: sig,
    repartidor,
    activos,
    manos,
    mazo: cartas.slice(repartidas),
    descartes: [],
    // La última carta del que reparte, que es el último del orden.
    vuelta: manos[repartidor]!.at(-1)!,
    fase: 'decidir',
    turno: orden[0]!,
    juega: [null, null, null, null, null],
    cambiadas: [null, null, null, null, null],
    cambiando: 0,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadasPor: [[], [], [], [], []],
    fallos: [[], [], [], [], []],
    bazas: ceros(),
    fichas: base.fichas.map((f) => (f > 0 ? f - 1 : f)),
    bote: base.bote + activos.filter(Boolean).length,
  };
}

/** El siguiente que reparte: el siguiente con fichas. */
const siguienteRepartidor = (e: EstadoBourre) =>
  desde(e.repartidor, (a) => e.fichas[a]! > 0)[0] ?? siguiente(e.repartidor);

function cerrarMano(e: EstadoBourre, ganador: Asiento | null, boteJugado: number): EstadoBourre {
  const juegan = e.juega;
  const bourre =
    e.fase === 'bazas' ? [0, 1, 2, 3, 4].filter((a) => juegan[a] === true && e.bazas[a] === 0) : [];
  const cambioFichas = ceros();
  if (ganador !== null) cambioFichas[ganador] = e.bote;
  let pagos = 0;
  for (const a of bourre) {
    const paga = Math.min(e.fichas[a]!, boteJugado);
    cambioFichas[a] = cambioFichas[a]! - paga;
    pagos += paga;
  }
  const fichasTras = e.fichas.map((f, a) => f + cambioFichas[a]!);
  const boteTras = (ganador === null ? e.bote : 0) + pagos;
  const resultado: ResultadoManoBourre = {
    repartidor: e.repartidor,
    triunfo: paloBourre(e.vuelta),
    juegan,
    bazas: e.bazas,
    ganador,
    bourre,
    bote: e.bote,
    cambioFichas,
    fichasTras,
    boteTras,
  };
  const cerrado: EstadoBourre = {
    ...e,
    fichas: fichasTras,
    bote: boteTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguienteRepartidor(cerrado), e.azar);
}

/** Tras decidir todos: nadie juega, juega uno o empieza el cambio. */
function trasDecidir(e: EstadoBourre): EstadoBourre {
  const juegan = desde(e.repartidor, (a) => e.juega[a] === true);
  if (juegan.length === 0) return cerrarMano(e, null, e.bote);
  if (juegan.length === 1) return cerrarMano(e, juegan[0]!, e.bote);
  return { ...e, fase: 'cambio', turno: juegan[0]!, cambiando: 0 };
}

function resolverBaza(e: EstadoBourre): EstadoBourre {
  const triunfo = paloBourre(e.vuelta);
  const ganador = ganadoraBourre(e.mesa, triunfo).asiento;
  const r: EstadoBourre = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  const quedan = [0, 1, 2, 3, 4].some((a) => e.juega[a] === true && r.manos[a]!.length > 0);
  if (quedan) return r;
  const maximo = Math.max(...r.bazas);
  const con = [0, 1, 2, 3, 4].filter((a) => r.bazas[a] === maximo);
  return cerrarMano(r, con.length === 1 ? con[0]! : null, r.bote);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const bourre: Juego<ConfigBourre, EstadoBourre, AccionBourre, VistaBourre> = {
  id: 'bourre',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Bourré se juega con 5 jugadores');
    if (!Number.isInteger(config.manos) || config.manos < 1) {
      return error('El número de manos debe ser un entero positivo');
    }
    if (!Number.isInteger(config.fichas) || config.fichas < 1) {
      return error('Las fichas deben ser un entero positivo');
    }
    // Reparte el asiento 4, así el asiento 0 decide primero.
    return ok(
      nuevaMano(
        {
          config: { jugadores: 5, manos: config.manos, fichas: config.fichas },
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
      case 'decidir':
        return [{ tipo: 'jugar' }, { tipo: 'pasar' }];
      case 'cambio': {
        const r: AccionBourre[] = [{ tipo: 'robar' }];
        if (e.cambiando < MAXIMO_CAMBIO) {
          for (const carta of [...mano].sort()) {
            if (asiento === e.repartidor && carta === e.vuelta) continue;
            r.push({ tipo: 'descartar', carta });
          }
        }
        return r;
      }
      case 'bazas':
        return cartasLegalesBourre(mano, e.mesa, paloBourre(e.vuelta))
          .sort()
          .map((carta) => ({ tipo: 'jugarCarta', carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'jugar':
      case 'pasar': {
        const juega = accion.tipo === 'jugar';
        const r: EstadoBourre = {
          ...e,
          juega: e.juega.map((j, a) => (a === asiento ? juega : j)),
          // Quien pasa deja sus cartas boca abajo.
          manos: juega ? e.manos : e.manos.map((m, a) => (a === asiento ? [] : m)),
          descartes: juega ? e.descartes : [...e.descartes, ...e.manos[asiento]!],
        };
        const falta = desde(asiento, (a) => r.activos[a]! && r.juega[a] === null)[0];
        return falta === undefined ? trasDecidir(r) : { ...r, turno: falta };
      }
      case 'descartar':
        return {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          descartes: [...e.descartes, accion.carta],
          cambiando: e.cambiando + 1,
        };
      case 'robar': {
        const k = e.cambiando;
        const r: EstadoBourre = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.mazo.slice(0, k)] : m)),
          mazo: e.mazo.slice(k),
          cambiadas: e.cambiadas.map((c, a) => (a === asiento ? k : c)),
          cambiando: 0,
        };
        const falta = desde(asiento, (a) => r.juega[a] === true && r.cambiadas[a] === null)[0];
        if (falta !== undefined) return { ...r, turno: falta };
        const sale = desde(r.repartidor, (a) => r.juega[a] === true)[0]!;
        return { ...r, fase: 'bazas', turno: sale };
      }
      case 'jugarCarta': {
        const triunfo = paloBourre(e.vuelta);
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = paloBourre(mesa[0]!.carta);
        const palo = paloBourre(accion.carta);
        const nuevos: PaloFrances[] = [];
        if (palo !== salida) {
          nuevos.push(salida);
          if (palo !== triunfo && salida !== triunfo) nuevos.push(triunfo);
        }
        const jugado: EstadoBourre = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          mesa,
          jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          fallos: e.fallos.map((f, a) =>
            a === asiento ? [...f, ...nuevos.filter((x) => !f.includes(x))] : f,
          ),
        };
        const juegan = e.juega.filter((j) => j === true).length;
        if (mesa.length < juegan) {
          const sigue = desde(asiento, (a) => e.juega[a] === true)[0]!;
          return { ...jugado, turno: sigue };
        }
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
      enMazo: e.mazo.length,
      repartidor: e.repartidor,
      activos: [...e.activos],
      vuelta: e.vuelta,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      juega: [...e.juega],
      cambiadas: [...e.cambiadas],
      cambiando: e.cambiando,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => [...f]),
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
