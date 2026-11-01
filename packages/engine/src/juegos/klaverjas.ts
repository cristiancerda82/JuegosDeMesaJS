import { crearAzar, Generador, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_FRANCESES,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Klaverjas de Rotterdam: 4 jugadores en parejas; 8 manos (menos solo en las pruebas). */
export interface ConfigKlaverjas {
  readonly jugadores: 4;
  readonly manos: number;
}

export const MANOS_KLAVERJAS = 8;
export const CONFIG_KLAVERJAS_POR_DEFECTO: ConfigKlaverjas = {
  jugadores: 4,
  manos: MANOS_KLAVERJAS,
};

export type ParejaKlaverjas = 0 | 1;
type DePareja<T> = readonly [T, T];

export const PUNTOS_ULTIMA_KLAVERJAS = 10;
export const PUNTOS_PIT_KLAVERJAS = 100;
export const PUNTOS_MANO_KLAVERJAS = 162;

export type FaseKlaverjas = 'propuesta' | 'eleccion' | 'bazas';

export interface ResultadoManoKlaverjas {
  readonly triunfo: PaloFrances;
  /** La pareja que jugó la mano. */
  readonly juega: ParejaKlaverjas;
  /** Puntos de cartas (con los 10 de la última) y roem (con el pit) de cada pareja. */
  readonly cartas: DePareja<number>;
  readonly roem: DePareja<number>;
  /** Lo que anota cada pareja, con el nat aplicado. */
  readonly anotado: DePareja<number>;
  readonly nat: boolean;
  readonly pit: ParejaKlaverjas | null;
  readonly puntosTras: DePareja<number>;
}

export interface BazaKlaverjas {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
  readonly roem: number;
}

export interface EstadoKlaverjas {
  readonly config: ConfigKlaverjas;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseKlaverjas;
  /** El palo que se propone al empezar la mano. */
  readonly propuesto: PaloFrances;
  readonly pasados: readonly Asiento[];
  readonly triunfo: PaloFrances | null;
  readonly juega: ParejaKlaverjas | null;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: BazaKlaverjas | null;
  readonly bazasGanadas: DePareja<number>;
  /** Las cartas que ha jugado cada uno en la mano. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de los que se sabe que cada uno no tiene (el triunfo incluido). */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly cartasMano: DePareja<number>;
  readonly roemMano: DePareja<number>;
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoKlaverjas[];
}

export type AccionKlaverjas =
  | { readonly tipo: 'jugar' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'elegir'; readonly palo: PaloFrances }
  | { readonly tipo: 'carta'; readonly carta: IdCarta };

export interface VistaKlaverjas {
  readonly config: ConfigKlaverjas;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly fase: FaseKlaverjas;
  readonly repartidor: Asiento;
  readonly propuesto: PaloFrances;
  readonly pasados: readonly Asiento[];
  readonly triunfo: PaloFrances | null;
  readonly juega: ParejaKlaverjas | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: BazaKlaverjas | null;
  readonly bazasGanadas: DePareja<number>;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly cartasMano: DePareja<number>;
  readonly roemMano: DePareja<number>;
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoKlaverjas[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La francesa del 7 al As: 32 cartas. */
export const BARAJA_KLAVERJAS: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const paloKlaverjas = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const valorDe = (c: IdCarta) => cartaDeId(c)!.valor;

/** El orden natural, para las escaleras: del 7 (7) al As (14). */
export const naturalKlaverjas = (c: IdCarta) => (valorDe(c) === 1 ? 14 : valorDe(c));

const RANGO_TRIUNFO: Readonly<Record<number, number>> = {
  11: 8,
  9: 7,
  1: 6,
  10: 5,
  13: 4,
  12: 3,
  8: 2,
  7: 1,
};
const RANGO_COMUN: Readonly<Record<number, number>> = {
  1: 8,
  10: 7,
  13: 6,
  12: 5,
  11: 4,
  9: 3,
  8: 2,
  7: 1,
};
const PUNTOS_TRIUNFO: Readonly<Record<number, number>> = {
  11: 20,
  9: 14,
  1: 11,
  10: 10,
  13: 4,
  12: 3,
};
const PUNTOS_COMUN: Readonly<Record<number, number>> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2 };

const esTriunfo = (c: IdCarta, triunfo: PaloFrances | null) =>
  triunfo !== null && paloKlaverjas(c) === triunfo;

/** Rango para comparar dentro de un palo. */
export function rangoKlaverjas(c: IdCarta, triunfo: PaloFrances | null): number {
  return (esTriunfo(c, triunfo) ? RANGO_TRIUNFO : RANGO_COMUN)[valorDe(c)]!;
}

/** Puntos de una carta (spec juego-klaverjas). */
export function puntosCartaKlaverjas(c: IdCarta, triunfo: PaloFrances | null): number {
  return (esTriunfo(c, triunfo) ? PUNTOS_TRIUNFO : PUNTOS_COMUN)[valorDe(c)] ?? 0;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 8;

export const parejaKlaverjas = (asiento: Asiento): ParejaKlaverjas =>
  (asiento % 2) as ParejaKlaverjas;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraKlaverjas(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloKlaverjas(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    esTriunfo(c, triunfo)
      ? 100 + rangoKlaverjas(c, triunfo)
      : paloKlaverjas(c) === salida
        ? rangoKlaverjas(c, triunfo)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar con las reglas de Rotterdam (spec juego-klaverjas). */
export function cartasLegalesKlaverjas(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloKlaverjas(mesa[0]!.carta);
  const triunfos = mano.filter((c) => esTriunfo(c, triunfo));
  const alto = Math.max(
    0,
    ...mesa.filter((j) => esTriunfo(j.carta, triunfo)).map((j) => rangoKlaverjas(j.carta, triunfo)),
  );
  const masAltos = triunfos.filter((c) => rangoKlaverjas(c, triunfo) > alto);
  if (salida === triunfo) {
    if (triunfos.length === 0) return [...mano];
    return masAltos.length > 0 ? masAltos : triunfos;
  }
  const delPalo = mano.filter((c) => paloKlaverjas(c) === salida);
  if (delPalo.length > 0) return delPalo;
  if (triunfos.length === 0) return [...mano];
  if (masAltos.length > 0) return masAltos;
  // No puede subir: no se echa un triunfo más bajo salvo que solo queden triunfos.
  const otras = mano.filter((c) => !esTriunfo(c, triunfo));
  return otras.length > 0 ? otras : triunfos;
}

/** El roem de las cartas de una baza: escalera, cuatro iguales y stuk. */
export function roemBaza(cartas: readonly IdCarta[], triunfo: PaloFrances): number {
  let roem = 0;
  for (const palo of PALOS_FRANCESES) {
    const valores = cartas
      .filter((c) => paloKlaverjas(c) === palo)
      .map(naturalKlaverjas)
      .sort((a, b) => a - b);
    let largo = 1;
    let mejor = valores.length > 0 ? 1 : 0;
    for (let i = 1; i < valores.length; i++) {
      largo = valores[i] === valores[i - 1]! + 1 ? largo + 1 : 1;
      mejor = Math.max(mejor, largo);
    }
    if (mejor === 3) roem += 20;
    if (mejor >= 4) roem += 50;
  }
  if (cartas.length === 4 && cartas.every((c) => valorDe(c) === valorDe(cartas[0]!))) {
    roem += valorDe(cartas[0]!) === 11 ? 200 : 100;
  }
  const rey = `${triunfo}-13` as IdCarta;
  const dama = `${triunfo}-12` as IdCarta;
  if (cartas.includes(rey) && cartas.includes(dama)) roem += 20;
  return roem;
}

// ── Mano ─────────────────────────────────────────────────────────────────────

const terminada = (e: Pick<EstadoKlaverjas, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= e.config.manos;

const CERO: DePareja<number> = [0, 0];
const sumar = (par: DePareja<number>, pareja: ParejaKlaverjas, n: number): DePareja<number> =>
  pareja === 0 ? [par[0] + n, par[1]] : [par[0], par[1] + n];

function nuevaMano(
  base: Pick<EstadoKlaverjas, 'config' | 'puntos' | 'resultadosManos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoKlaverjas {
  const { cartas, azar: trasBarajar } = barajar(BARAJA_KLAVERJAS, azar);
  const g = new Generador(trasBarajar);
  const propuesto = PALOS_FRANCESES[g.enteroHasta(PALOS_FRANCESES.length)]!;
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO,
      (k + 1) * CARTAS_EN_MANO,
    );
  }
  return {
    ...base,
    azar: g.estado(),
    repartidor,
    fase: 'propuesta',
    propuesto,
    pasados: [],
    triunfo: null,
    juega: null,
    manos,
    turno: siguiente(repartidor),
    mesa: [],
    bazasGanadas: CERO,
    jugadasPor: [[], [], [], []],
    fallos: [[], [], [], []],
    cartasMano: CERO,
    roemMano: CERO,
  };
}

/** Lo que anota cada pareja al acabar la mano, con el nat (spec juego-klaverjas). */
export function anotarManoKlaverjas(
  cartas: DePareja<number>,
  roem: DePareja<number>,
  juega: ParejaKlaverjas,
): { anotado: DePareja<number>; nat: boolean } {
  const otra = (1 - juega) as ParejaKlaverjas;
  const nat = cartas[juega] + roem[juega] <= cartas[otra] + roem[otra];
  if (!nat) return { anotado: [cartas[0] + roem[0], cartas[1] + roem[1]], nat };
  const todo = PUNTOS_MANO_KLAVERJAS + roem[0] + roem[1];
  return { anotado: otra === 0 ? [todo, 0] : [0, todo], nat };
}

function cerrarMano(e: EstadoKlaverjas): EstadoKlaverjas {
  const juega = e.juega!;
  const pit =
    e.bazasGanadas[0] === CARTAS_EN_MANO ? 0 : e.bazasGanadas[1] === CARTAS_EN_MANO ? 1 : null;
  const roem = pit === null ? e.roemMano : sumar(e.roemMano, pit, PUNTOS_PIT_KLAVERJAS);
  const { anotado, nat } = anotarManoKlaverjas(e.cartasMano, roem, juega);
  const puntos: DePareja<number> = [e.puntos[0] + anotado[0], e.puntos[1] + anotado[1]];
  const resultado: ResultadoManoKlaverjas = {
    triunfo: e.triunfo!,
    juega,
    cartas: e.cartasMano,
    roem,
    anotado,
    nat,
    pit,
    puntosTras: puntos,
  };
  const cerrado: EstadoKlaverjas = {
    ...e,
    roemMano: roem,
    puntos,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoKlaverjas): EstadoKlaverjas {
  const triunfo = e.triunfo!;
  const ganador = ganadoraKlaverjas(e.mesa, triunfo).asiento;
  const pareja = parejaKlaverjas(ganador);
  const cartas = e.mesa.map((j) => j.carta);
  const roem = roemBaza(cartas, triunfo);
  const ultima = e.manos.every((m) => m.length === 0);
  const puntos =
    cartas.reduce((s, c) => s + puntosCartaKlaverjas(c, triunfo), 0) +
    (ultima ? PUNTOS_ULTIMA_KLAVERJAS : 0);
  const resuelto: EstadoKlaverjas = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador, roem },
    bazasGanadas: sumar(e.bazasGanadas, pareja, 1),
    cartasMano: sumar(e.cartasMano, pareja, puntos),
    roemMano: sumar(e.roemMano, pareja, roem),
  };
  return ultima ? cerrarMano(resuelto) : resuelto;
}

function jugarCarta(e: EstadoKlaverjas, asiento: Asiento, carta: IdCarta): EstadoKlaverjas {
  const triunfo = e.triunfo!;
  const mesa = [...e.mesa, { asiento, carta }];
  const salida = paloKlaverjas(mesa[0]!.carta);
  // Lo que dice la carta de su mano: sin el palo de salida y, si no falló pudiendo, sin triunfos.
  const sabidos: PaloFrances[] = [];
  if (paloKlaverjas(carta) !== salida) {
    sabidos.push(salida);
    const habiaTriunfo = e.mesa.some((j) => esTriunfo(j.carta, triunfo));
    if (!esTriunfo(carta, triunfo) && !habiaTriunfo) sabidos.push(triunfo);
  }
  const nuevos = sabidos.filter((p) => !e.fallos[asiento]!.includes(p));
  const jugado: EstadoKlaverjas = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
    mesa,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    fallos:
      nuevos.length > 0
        ? e.fallos.map((f, a) => (a === asiento ? [...f, ...nuevos] : f))
        : e.fallos,
  };
  return mesa.length < JUGADORES ? { ...jugado, turno: siguiente(asiento) } : resolverBaza(jugado);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const klaverjas: Juego<ConfigKlaverjas, EstadoKlaverjas, AccionKlaverjas, VistaKlaverjas> = {
  id: 'klaverjas',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Klaverjas se juega con 4 jugadores');
    if (!Number.isInteger(config.manos) || config.manos < 1) {
      return error('El número de manos debe ser positivo');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, manos: config.manos },
          puntos: CERO,
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
    if (e.fase === 'propuesta') return [{ tipo: 'jugar' }, { tipo: 'pasar' }];
    if (e.fase === 'eleccion') return PALOS_FRANCESES.map((palo) => ({ tipo: 'elegir', palo }));
    return cartasLegalesKlaverjas(e.manos[asiento]!, e.mesa, e.triunfo!)
      .sort()
      .map((carta) => ({ tipo: 'carta', carta }));
  },

  transicion(e, asiento, accion) {
    const sale = siguiente(e.repartidor);
    switch (accion.tipo) {
      case 'jugar':
        return {
          ...e,
          fase: 'bazas',
          triunfo: e.propuesto,
          juega: parejaKlaverjas(asiento),
          turno: sale,
        };
      case 'pasar': {
        const pasados = [...e.pasados, asiento];
        return pasados.length === JUGADORES
          ? { ...e, pasados, fase: 'eleccion', turno: sale }
          : { ...e, pasados, turno: siguiente(asiento) };
      }
      case 'elegir':
        return {
          ...e,
          fase: 'bazas',
          triunfo: accion.palo,
          juega: parejaKlaverjas(asiento),
          turno: sale,
        };
      case 'carta':
        return jugarCarta(e, asiento, accion.carta);
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      turno: terminada(e) ? null : e.turno,
      fase: e.fase,
      repartidor: e.repartidor,
      propuesto: e.propuesto,
      pasados: [...e.pasados],
      triunfo: e.triunfo,
      juega: e.juega,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazasGanadas: e.bazasGanadas,
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      cartasMano: e.cartasMano,
      roemMano: e.roemMano,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaKlaverjas(a)]);
    if (e.puntos[0] === e.puntos[1]) return { ganadores: [], empate: true, puntos };
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return { ganadores: [gana, gana + 2], empate: false, puntos };
  },
};
