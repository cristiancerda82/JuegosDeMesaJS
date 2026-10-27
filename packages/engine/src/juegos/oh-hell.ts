import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigOhHell {
  /** Cada uno juega por su cuenta. */
  readonly jugadores: 3 | 4 | 5 | 6 | 7;
}

export const CONFIG_OH_HELL_POR_DEFECTO: ConfigOhHell = { jugadores: 4 };

/** Puntos por acertar la apuesta, además de lo apostado. */
export const PUNTOS_ACIERTO_OH_HELL = 10;

export type AccionOhHell =
  | { readonly tipo: 'apostar'; readonly bazas: number }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface AccionOhHellHecha {
  readonly asiento: Asiento;
  readonly accion: AccionOhHell;
}

export interface ResultadoManoOhHell {
  /** Cartas que recibió cada jugador en la mano. */
  readonly cartas: number;
  readonly triunfo: PaloFrances;
  readonly apuestas: readonly number[];
  readonly bazas: readonly number[];
  readonly puntos: readonly number[];
  readonly totales: readonly number[];
}

export interface EstadoOhHell {
  readonly config: ConfigOhHell;
  readonly azar: EstadoAzar;
  readonly indiceMano: number;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Las cartas que no se reparten, ocultas. */
  readonly mazo: readonly IdCarta[];
  readonly cartaTriunfo: IdCarta;
  readonly triunfo: PaloFrances;
  readonly fase: 'apostar' | 'jugar';
  readonly apuestas: readonly (number | null)[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazas: readonly number[];
  /** Las cartas que jugó cada uno en las bazas cerradas de la mano. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de salida que cada uno no siguió en la mano: no le quedan. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoOhHell[];
  readonly ultimaAccion: AccionOhHellHecha | null;
}

export interface VistaOhHell {
  readonly config: ConfigOhHell;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas de la mano en curso. */
  readonly cartasMano: number;
  readonly indiceMano: number;
  readonly totalManos: number;
  readonly repartidor: Asiento;
  readonly cartaTriunfo: IdCarta;
  readonly triunfo: PaloFrances;
  readonly fase: 'apostar' | 'jugar';
  readonly apuestas: readonly (number | null)[];
  /** La apuesta que el repartidor no puede hacer, cuando le toca apostar. */
  readonly apuestaProhibida: number | null;
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoOhHell['ultimaBaza'];
  readonly bazas: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoOhHell[];
  readonly ultimaAccion: AccionOhHellHecha | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_OH_HELL: readonly IdCarta[] = crearBaraja('francesa52');

export const paloOhHell = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** El rango de la carta en su palo: el As vale 14. */
export const rangoOhHell = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};

/** Las cartas de cada mano: del máximo a 1 y de 2 al máximo. */
export function secuenciaOhHell(jugadores: number): number[] {
  const max = Math.floor((BARAJA_OH_HELL.length - 1) / jugadores);
  const bajada = Array.from({ length: max }, (_, i) => max - i);
  const subida = Array.from({ length: max - 1 }, (_, i) => i + 2);
  return [...bajada, ...subida];
}

/** La carta que va ganando la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraOhHell(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloOhHell(mesa[0]!.carta);
  const fuerza = (c: IdCarta) =>
    paloOhHell(c) === triunfo
      ? 100 + rangoOhHell(c)
      : paloOhHell(c) === salida
        ? rangoOhHell(c)
        : 0;
  return mesa.reduce((mejor, j) => (fuerza(j.carta) > fuerza(mejor.carta) ? j : mejor));
}

/** Las cartas que se pueden jugar: las del palo de salida, si se tienen. */
export function cartasLegalesOhHell(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloOhHell(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloOhHell(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const n = (e: Pick<EstadoOhHell, 'config'>) => e.config.jugadores;
const siguiente = (e: Pick<EstadoOhHell, 'config'>, a: Asiento) => (a + 1) % n(e);
const totalManos = (e: Pick<EstadoOhHell, 'config'>) => secuenciaOhHell(n(e)).length;
const cartasDeMano = (e: Pick<EstadoOhHell, 'config' | 'indiceMano'>) =>
  secuenciaOhHell(n(e))[e.indiceMano]!;
const partidaTerminada = (e: Pick<EstadoOhHell, 'config' | 'resultadosManos'>) =>
  e.resultadosManos.length >= totalManos(e);

/** La apuesta que no puede hacer el repartidor, si es él quien apuesta. */
export function apuestaProhibida(
  e: Pick<EstadoOhHell, 'config' | 'indiceMano' | 'fase' | 'turno' | 'repartidor' | 'apuestas'>,
): number | null {
  if (e.fase !== 'apostar' || e.turno !== e.repartidor) return null;
  const suma = e.apuestas.reduce<number>((s, a) => s + (a ?? 0), 0);
  const prohibida = cartasDeMano(e) - suma;
  return prohibida >= 0 ? prohibida : null;
}

function nuevaMano(
  config: ConfigOhHell,
  azar: EstadoAzar,
  indiceMano: number,
  repartidor: Asiento,
  previo: Pick<EstadoOhHell, 'puntos' | 'resultadosManos' | 'ultimaBaza' | 'ultimaAccion'>,
): EstadoOhHell {
  const jugadores = config.jugadores;
  const cartas = secuenciaOhHell(jugadores)[indiceMano]!;
  const { cartas: barajadas, azar: azarSiguiente } = barajar(BARAJA_OH_HELL, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(jugadores);
  for (let k = 0; k < jugadores; k++) {
    manos[(repartidor + 1 + k) % jugadores] = barajadas.slice(k * cartas, (k + 1) * cartas);
  }
  const resto = barajadas.slice(jugadores * cartas);
  const vacios = () => Array.from({ length: jugadores }, () => [] as IdCarta[]);
  return {
    config,
    azar: azarSiguiente,
    indiceMano,
    repartidor,
    manos,
    mazo: resto.slice(1),
    cartaTriunfo: resto[0]!,
    triunfo: paloOhHell(resto[0]!),
    fase: 'apostar',
    apuestas: new Array<number | null>(jugadores).fill(null),
    turno: (repartidor + 1) % jugadores,
    mesa: [],
    bazas: new Array<number>(jugadores).fill(0),
    jugadasPor: vacios(),
    fallos: Array.from({ length: jugadores }, () => [] as PaloFrances[]),
    puntos: previo.puntos,
    resultadosManos: previo.resultadosManos,
    ultimaBaza: previo.ultimaBaza,
    ultimaAccion: previo.ultimaAccion,
  };
}

function cerrarMano(e: EstadoOhHell): EstadoOhHell {
  const apuestas = e.apuestas.map((a) => a!);
  const puntosMano = apuestas.map((a, i) => (a === e.bazas[i] ? PUNTOS_ACIERTO_OH_HELL + a : 0));
  const totales = e.puntos.map((p, i) => p + puntosMano[i]!);
  const cerrado: EstadoOhHell = {
    ...e,
    puntos: totales,
    resultadosManos: [
      ...e.resultadosManos,
      {
        cartas: cartasDeMano(e),
        triunfo: e.triunfo,
        apuestas,
        bazas: e.bazas,
        puntos: puntosMano,
        totales,
      },
    ],
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, e.indiceMano + 1, siguiente(e, e.repartidor), cerrado);
}

function resolverBaza(e: EstadoOhHell): EstadoOhHell {
  const ganador = ganadoraOhHell(e.mesa, e.triunfo).asiento;
  const resuelto: EstadoOhHell = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    jugadasPor: e.jugadasPor.map((js, a) => [
      ...js,
      ...e.mesa.filter((j) => j.asiento === a).map((j) => j.carta),
    ]),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const ohHell: Juego<ConfigOhHell, EstadoOhHell, AccionOhHell, VistaOhHell> = {
  id: 'ohHell',

  crear(config, semilla) {
    if (![3, 4, 5, 6, 7].includes(config.jugadores)) {
      return error('El Oh Hell se juega de 3 a 7');
    }
    return ok(
      nuevaMano({ ...config }, crearAzar(semilla), 0, config.jugadores - 1, {
        puntos: new Array<number>(config.jugadores).fill(0),
        resultadosManos: [],
        ultimaBaza: null,
        ultimaAccion: null,
      }),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'apostar') {
      const prohibida = apuestaProhibida(e);
      return Array.from({ length: cartasDeMano(e) + 1 }, (_, b) => b)
        .filter((b) => b !== prohibida)
        .map((bazas) => ({ tipo: 'apostar', bazas }));
    }
    return cartasLegalesOhHell(e.manos[asiento]!, e.mesa).map((carta) => ({
      tipo: 'jugar',
      carta,
    }));
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoOhHell = { ...e, ultimaAccion: { asiento, accion } };
    if (accion.tipo === 'apostar') {
      const apuestas = e.apuestas.map((a, i) => (i === asiento ? accion.bazas : a));
      const todas = asiento === e.repartidor;
      return {
        ...hecha,
        apuestas,
        fase: todas ? 'jugar' : 'apostar',
        turno: siguiente(e, asiento),
      };
    }
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const salida = paloOhHell(mesa[0]!.carta);
    const falla = paloOhHell(accion.carta) !== salida;
    const jugado: EstadoOhHell = {
      ...hecha,
      manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
      mesa,
      fallos:
        falla && !e.fallos[asiento]!.includes(salida)
          ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f))
          : e.fallos,
    };
    return mesa.length < n(e) ? { ...jugado, turno: siguiente(e, asiento) } : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      cartasMano: cartasDeMano(e),
      indiceMano: e.indiceMano,
      totalManos: totalManos(e),
      repartidor: e.repartidor,
      cartaTriunfo: e.cartaTriunfo,
      triunfo: e.triunfo,
      fase: e.fase,
      apuestas: [...e.apuestas],
      apuestaProhibida: apuestaProhibida(e),
      turno: partidaTerminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      jugadasPor: e.jugadasPor.map((js) => [...js]),
      fallos: e.fallos.map((f) => [...f]),
      puntos: [...e.puntos],
      resultadosManos: [...e.resultadosManos],
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const max = Math.max(...e.puntos);
    const ganadores = e.puntos.flatMap((p, a) => (p === max ? [a] : []));
    return { ganadores, empate: ganadores.length > 1, puntos: [...e.puntos] };
  },
};
