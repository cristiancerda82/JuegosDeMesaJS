import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigBrisca {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Cambio de la muestra con el 7 (o el 2) de triunfo. */
  readonly cambioMuestra: 'no' | 'libre' | 'trasGanarBaza';
  /** Con el mazo agotado, obliga a seguir el palo, superar y fallar con triunfo. */
  readonly arrastreFinal: boolean;
  /** Partida a una mano o al mejor de N (N impar). */
  readonly manos: number;
}

export const CONFIG_BRISCA_POR_DEFECTO: ConfigBrisca = {
  jugadores: 2,
  cambioMuestra: 'libre',
  arrastreFinal: false,
  manos: 1,
};

export interface CartaJugada {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
}

export interface ResultadoMano {
  /** Puntos de cada bando (en 2 jugadores, bando = asiento; en parejas, asiento % 2). */
  readonly puntos: readonly [number, number];
  /** Bando ganador, o `null` si empataron a 60. */
  readonly ganador: 0 | 1 | null;
}

export interface EstadoBrisca {
  readonly config: ConfigBrisca;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas boca abajo; la siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Carta boca arriba que marca el triunfo; se roba al final. `null` cuando ya se robó. */
  readonly muestra: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Baza en curso, en orden de juego. */
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento;
  /** Puntos y bazas ganadas por asiento en la mano en curso. */
  readonly puntos: readonly number[];
  readonly bazas: readonly number[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly resultadosManos: readonly ResultadoMano[];
}

export type AccionBrisca =
  { readonly tipo: 'jugar'; readonly carta: IdCarta } | { readonly tipo: 'cambiarMuestra' };

export interface VistaBrisca {
  readonly config: ConfigBrisca;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas boca abajo que quedan en el mazo (sin contar la muestra). */
  readonly mazo: number;
  readonly muestra: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoBrisca['ultimaBaza'];
  readonly resultadosManos: readonly ResultadoMano[];
  readonly manosGanadas: readonly [number, number];
}

// ── Valores de las cartas ────────────────────────────────────────────────────

/** De mayor a menor: as, tres, rey, caballo, sota, 7, 6, 5, 4, 2. */
const ORDEN = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];
const PUNTOS: Readonly<Record<number, number>> = { 1: 11, 3: 10, 12: 4, 11: 3, 10: 2 };

export const paloDe = (id: IdCarta) => cartaDeId(id)!.palo as PaloEspanol;
export const valorDe = (id: IdCarta) => cartaDeId(id)!.valor;
/** Fuerza para comparar cartas del mismo palo: mayor es mejor. */
export const fuerza = (id: IdCarta) => ORDEN.length - ORDEN.indexOf(valorDe(id));
export const puntosDe = (id: IdCarta) => PUNTOS[valorDe(id)] ?? 0;

/** Carta que gana la baza: el triunfo más alto, o la más alta del palo de salida. */
export function cartaGanadora(mesa: readonly CartaJugada[], triunfo: PaloEspanol): CartaJugada {
  let mejor = mesa[0]!;
  for (const jugada of mesa.slice(1)) {
    const mismoPalo = paloDe(jugada.carta) === paloDe(mejor.carta);
    if (mismoPalo ? fuerza(jugada.carta) > fuerza(mejor.carta) : paloDe(jugada.carta) === triunfo) {
      mejor = jugada;
    }
  }
  return mejor;
}

/** Carta de la mano con la que se cambia la muestra: el 7 de triunfo, o el 2 si la muestra es baja. */
export function cartaDeCambio(muestra: IdCarta): IdCarta {
  const baja = fuerza(muestra) <= fuerza(`${paloDe(muestra)}-7`);
  return `${paloDe(muestra)}-${baja ? 2 : 7}`;
}

export const bandoDe = (asiento: Asiento): 0 | 1 => (asiento % 2) as 0 | 1;

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (e: EstadoBrisca, a: Asiento) => (a + 1) % e.config.jugadores;
const mazoAgotado = (e: EstadoBrisca) => e.mazo.length === 0 && e.muestra === null;

function manosNecesarias(config: ConfigBrisca): number {
  return Math.floor(config.manos / 2) + 1;
}

function manosGanadas(e: EstadoBrisca): [number, number] {
  const cuenta: [number, number] = [0, 0];
  for (const r of e.resultadosManos) if (r.ganador !== null) cuenta[r.ganador]++;
  return cuenta;
}

function partidaTerminada(e: EstadoBrisca): boolean {
  const ganadas = manosGanadas(e);
  const necesarias = manosNecesarias(e.config);
  return ganadas.some((g) => g >= necesarias) || e.resultadosManos.length >= e.config.manos;
}

/** Cartas que el asiento puede jugar, aplicando el arrastre si corresponde. */
function cartasJugables(e: EstadoBrisca, asiento: Asiento): readonly IdCarta[] {
  const mano = e.manos[asiento]!;
  if (!e.config.arrastreFinal || !mazoAgotado(e) || e.mesa.length === 0) return mano;
  const salida = paloDe(e.mesa[0]!.carta);
  const ganadora = cartaGanadora(e.mesa, e.triunfo).carta;
  const superanA = (cartas: readonly IdCarta[]) => {
    const superan = cartas.filter(
      (c) => paloDe(c) === paloDe(ganadora) && fuerza(c) > fuerza(ganadora),
    );
    return superan.length > 0 ? superan : cartas;
  };
  const delPalo = mano.filter((c) => paloDe(c) === salida);
  if (delPalo.length > 0) return superanA(delPalo);
  const triunfos = mano.filter((c) => paloDe(c) === e.triunfo);
  if (triunfos.length > 0) return superanA(triunfos);
  return mano;
}

function puedeCambiarMuestra(e: EstadoBrisca, asiento: Asiento): boolean {
  if (e.config.cambioMuestra === 'no' || e.muestra === null || e.mazo.length === 0) return false;
  if (e.config.cambioMuestra === 'trasGanarBaza' && e.bazas[asiento] === 0) return false;
  return e.manos[asiento]!.includes(cartaDeCambio(e.muestra));
}

/** Reparte una mano nueva: 3 cartas a cada uno empezando por el que sale, y la muestra. */
function nuevaMano(
  config: ConfigBrisca,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoMano[],
): EstadoBrisca {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const n = config.jugadores;
  const sale = (repartidor + 1) % n;
  const reparto = repartir(cartas, new Array<number>(n).fill(3));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  const [muestra, ...mazo] = reparto.valor.mazo as [IdCarta, ...IdCarta[]];
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo,
    muestra,
    triunfo: paloDe(muestra),
    manos,
    mesa: [],
    turno: sale,
    puntos: new Array<number>(n).fill(0),
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    resultadosManos,
  };
}

function cerrarMano(e: EstadoBrisca): EstadoBrisca {
  const puntos: [number, number] = [0, 0];
  e.puntos.forEach((p, asiento) => (puntos[bandoDe(asiento)] += p));
  const ganador: ResultadoMano['ganador'] = puntos[0] > 60 ? 0 : puntos[1] > 60 ? 1 : null;
  const cerrado: EstadoBrisca = {
    ...e,
    resultadosManos: [...e.resultadosManos, { puntos, ganador }],
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e, e.repartidor), cerrado.resultadosManos);
}

function resolverBaza(e: EstadoBrisca): EstadoBrisca {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  const valor = e.mesa.reduce((suma, j) => suma + puntosDe(j.carta), 0);
  const manos = e.manos.map((m) => [...m]);
  let mazo = [...e.mazo];
  let muestra = e.muestra;
  if (mazo.length > 0 || muestra !== null) {
    for (let i = 0, a = ganador; i < e.config.jugadores; i++, a = siguiente(e, a)) {
      if (mazo.length > 0) {
        manos[a]!.push(mazo.at(-1)!);
        mazo = mazo.slice(0, -1);
      } else {
        manos[a]!.push(muestra!);
        muestra = null;
      }
    }
  }
  const resuelto: EstadoBrisca = {
    ...e,
    manos,
    mazo,
    muestra,
    mesa: [],
    turno: ganador,
    puntos: e.puntos.map((p, a) => (a === ganador ? p + valor : p)),
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    ultimaBaza: { cartas: e.mesa, ganador },
  };
  return manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const brisca: Juego<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca> = {
  id: 'brisca',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('La Brisca se juega con 2 jugadores o con 4 en parejas');
    }
    if (!['no', 'libre', 'trasGanarBaza'].includes(config.cambioMuestra)) {
      return error('Opción de cambio de muestra inválida');
    }
    if (typeof config.arrastreFinal !== 'boolean') return error('Opción de arrastre inválida');
    if (!Number.isInteger(config.manos) || config.manos < 1 || config.manos % 2 === 0) {
      return error('El número de manos debe ser un entero impar positivo');
    }
    const limpia: ConfigBrisca = {
      jugadores: config.jugadores,
      cambioMuestra: config.cambioMuestra,
      arrastreFinal: config.arrastreFinal,
      manos: config.manos,
    };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, []));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const acciones: AccionBrisca[] = cartasJugables(e, asiento).map((carta) => ({
      tipo: 'jugar',
      carta,
    }));
    if (puedeCambiarMuestra(e, asiento)) acciones.push({ tipo: 'cambiarMuestra' });
    return acciones;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'cambiarMuestra') {
      const cambio = cartaDeCambio(e.muestra!);
      const manos = e.manos.map((m, a) =>
        a === asiento ? [...m.filter((c) => c !== cambio), e.muestra!] : m,
      );
      return { ...e, manos, muestra: cambio };
    }
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const jugado = { ...e, manos, mesa };
    return mesa.length < e.config.jugadores
      ? { ...jugado, turno: siguiente(e, asiento) }
      : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      muestra: e.muestra,
      triunfo: e.triunfo,
      mesa: [...e.mesa],
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      bazas: [...e.bazas],
      ultimaBaza: e.ultimaBaza,
      resultadosManos: [...e.resultadosManos],
      manosGanadas: manosGanadas(e),
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const ganadas = manosGanadas(e);
    // A una mano, la puntuación son los puntos; a varias, las manos ganadas.
    const porBando: readonly number[] =
      e.config.manos === 1 ? e.resultadosManos[0]!.puntos : ganadas;
    const puntos = asientos.map((a) => porBando[bandoDe(a)]!);
    if (ganadas[0] === ganadas[1]) return { ganadores: [], empate: true, puntos };
    const bando = ganadas[0] > ganadas[1] ? 0 : 1;
    return { ganadores: asientos.filter((a) => bandoDe(a) === bando), empate: false, puntos };
  },
};
