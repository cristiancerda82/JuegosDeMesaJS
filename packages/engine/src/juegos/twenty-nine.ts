import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Twenty-Nine para 4 por parejas; el objetivo va en la config para que las pruebas sean cortas. */
export interface ConfigTwentyNine {
  readonly objetivo: number;
}

export const CONFIG_TWENTY_NINE_POR_DEFECTO: ConfigTwentyNine = { objetivo: 6 };

export type FaseTwentyNine = 'subasta' | 'triunfo' | 'doblar' | 'redoblar' | 'bazas';

export const PUJA_MINIMA_TWENTY_NINE = 16;
export const PUJA_MAXIMA_TWENTY_NINE = 28;

export type AccionTwentyNine =
  | { readonly tipo: 'pujar'; readonly valor: number }
  | { readonly tipo: 'pasar' }
  /** `null` es sin triunfo. */
  | { readonly tipo: 'elegirTriunfo'; readonly palo: PaloFrances | null }
  | { readonly tipo: 'doblar' }
  | { readonly tipo: 'noDoblar' }
  | { readonly tipo: 'redoblar' }
  | { readonly tipo: 'noRedoblar' }
  | { readonly tipo: 'pedirTriunfo' }
  | { readonly tipo: 'cantarPareja' }
  | { readonly tipo: 'jugarCarta'; readonly carta: IdCarta };

export interface ResultadoManoTwentyNine {
  readonly repartidor: Asiento;
  /** `true` si pasaron los cuatro y no se jugó. */
  readonly pasada: boolean;
  readonly pujador: Asiento | null;
  readonly pujaInicial: number | null;
  /** La puja tras la pareja. */
  readonly puja: number | null;
  readonly triunfo: PaloFrances | null;
  readonly sinTriunfo: boolean;
  readonly multiplicador: number;
  /** Quien cantó la pareja. */
  readonly pareja: Asiento | null;
  /** Los puntos de cada pareja (0 y 2, 1 y 3). */
  readonly puntos: readonly [number, number];
  readonly cumplida: boolean | null;
  readonly cambio: readonly [number, number];
  readonly marcadorTras: readonly [number, number];
}

export interface EstadoTwentyNine {
  readonly config: ConfigTwentyNine;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Las 4 cartas de cada uno que se reparten tras la subasta. */
  readonly pendientes: readonly (readonly IdCarta[])[];
  readonly fase: FaseTwentyNine;
  readonly turno: Asiento;
  /** Lo último que pujó cada uno, `'paso'` si pasó, `null` si aún nada. */
  readonly pujas: readonly (number | 'paso' | null)[];
  readonly pujaMayor: number | null;
  readonly pujador: Asiento | null;
  readonly puja: number | null;
  readonly triunfo: PaloFrances | null;
  readonly sinTriunfo: boolean;
  readonly descubierto: boolean;
  readonly multiplicador: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de salida que cada uno no siguió. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntosMano: readonly [number, number];
  /** Quien pidió el triunfo en esta baza y tiene que echar triunfo si tiene. */
  readonly debeTriunfo: Asiento | null;
  readonly pareja: Asiento | null;
  readonly marcador: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoTwentyNine[];
}

export interface VistaTwentyNine {
  readonly config: ConfigTwentyNine;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cuántas cartas le faltan por recibir a cada uno. */
  readonly pendientes: readonly number[];
  readonly repartidor: Asiento;
  readonly fase: FaseTwentyNine;
  readonly turno: Asiento | null;
  readonly pujas: EstadoTwentyNine['pujas'];
  readonly pujaMayor: number | null;
  readonly pujador: Asiento | null;
  readonly puja: number | null;
  /** El triunfo si este asiento lo conoce. */
  readonly triunfo: PaloFrances | null;
  /** Hay un triunfo elegido que este asiento no conoce. */
  readonly triunfoOculto: boolean;
  readonly sinTriunfo: boolean;
  readonly descubierto: boolean;
  readonly multiplicador: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoTwentyNine['ultimaBaza'];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntosMano: readonly [number, number];
  readonly debeTriunfo: Asiento | null;
  readonly pareja: Asiento | null;
  readonly marcador: readonly [number, number];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoTwentyNine[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

const VALORES_32 = [1, 7, 8, 9, 10, 11, 12, 13];
export const BARAJA_TWENTY_NINE: readonly IdCarta[] = crearBaraja('francesa52').filter((c) =>
  VALORES_32.includes(cartaDeId(c)!.valor),
);

export const paloTwentyNine = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const valor = (c: IdCarta) => cartaDeId(c)!.valor;

const RANGO: Readonly<Record<number, number>> = {
  11: 8,
  9: 7,
  1: 6,
  10: 5,
  13: 4,
  12: 3,
  8: 2,
  7: 1,
};
const PUNTOS: Readonly<Record<number, number>> = { 11: 3, 9: 2, 1: 1, 10: 1 };

/** El orden en el palo: J, 9, As, 10, K, Q, 8 y 7. */
export const rangoTwentyNine = (c: IdCarta) => RANGO[valor(c)]!;
/** La J 3, el 9 2, el As y el 10 1; el resto nada. */
export const puntosTwentyNine = (c: IdCarta) => PUNTOS[valor(c)] ?? 0;

/** Carta que gana la baza; `triunfo` solo si cuenta (descubierto y no sin triunfo). */
export function ganadoraTwentyNine(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): CartaJugada {
  const salida = paloTwentyNine(mesa[0]!.carta);
  const fuerza = (c: IdCarta) =>
    paloTwentyNine(c) === triunfo
      ? 100 + rangoTwentyNine(c)
      : paloTwentyNine(c) === salida
        ? rangoTwentyNine(c)
        : 0;
  return mesa.reduce((mejor, j) => (fuerza(j.carta) > fuerza(mejor.carta) ? j : mejor));
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
export const MANOS_MAXIMAS_TWENTY_NINE = 40;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
/** La pareja de un asiento: 0 (asientos 0 y 2) o 1 (asientos 1 y 3). */
export const ladoTwentyNine = (a: Asiento) => a % 2;

/** El triunfo que cuenta en las bazas: descubierto y no sin triunfo. */
export const triunfoActivoTwentyNine = (
  e: Pick<EstadoTwentyNine, 'triunfo' | 'descubierto' | 'sinTriunfo'>,
) => (e.descubierto && !e.sinTriunfo ? e.triunfo : null);

const terminada = (e: Pick<EstadoTwentyNine, 'config' | 'marcador' | 'resultadosManos'>) =>
  e.marcador.some((m) => Math.abs(m) >= e.config.objetivo) ||
  e.resultadosManos.length >= MANOS_MAXIMAS_TWENTY_NINE;

function nuevaMano(
  base: Pick<EstadoTwentyNine, 'config' | 'marcador' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoTwentyNine {
  const { cartas, azar: sig } = barajar(BARAJA_TWENTY_NINE, azar);
  const manos: IdCarta[][] = [[], [], [], []];
  const pendientes: IdCarta[][] = [[], [], [], []];
  [1, 2, 3, 4].forEach((k, i) => {
    const a = (repartidor + k) % JUGADORES;
    manos[a] = cartas.slice(4 * i, 4 * i + 4);
    pendientes[a] = cartas.slice(16 + 4 * i, 16 + 4 * i + 4);
  });
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    pendientes,
    fase: 'subasta',
    turno: siguiente(repartidor),
    pujas: [null, null, null, null],
    pujaMayor: null,
    pujador: null,
    puja: null,
    triunfo: null,
    sinTriunfo: false,
    descubierto: false,
    multiplicador: 1,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadasPor: [[], [], [], []],
    fallos: [[], [], [], []],
    puntosMano: [0, 0],
    debeTriunfo: null,
    pareja: null,
  };
}

function cerrarMano(e: EstadoTwentyNine): EstadoTwentyNine {
  const pasada = e.pujador === null;
  let cumplida: boolean | null = null;
  const cambio: [number, number] = [0, 0];
  if (!pasada) {
    const lado = ladoTwentyNine(e.pujador!);
    cumplida = e.puntosMano[lado]! >= e.puja!;
    cambio[lado] = cumplida ? e.multiplicador : -e.multiplicador;
  }
  const marcadorTras: [number, number] = [e.marcador[0] + cambio[0], e.marcador[1] + cambio[1]];
  const resultado: ResultadoManoTwentyNine = {
    repartidor: e.repartidor,
    pasada,
    pujador: e.pujador,
    pujaInicial: e.pujaMayor,
    puja: e.puja,
    triunfo: e.triunfo,
    sinTriunfo: e.sinTriunfo,
    multiplicador: e.multiplicador,
    pareja: e.pareja,
    puntos: e.puntosMano,
    cumplida,
    cambio,
    marcadorTras,
  };
  const cerrado: EstadoTwentyNine = {
    ...e,
    marcador: marcadorTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Tras doblar o no: se reparten las 4 cartas que quedan y empiezan las bazas. */
function repartirResto(e: EstadoTwentyNine): EstadoTwentyNine {
  return {
    ...e,
    manos: e.manos.map((m, a) => [...m, ...e.pendientes[a]!]),
    pendientes: [[], [], [], []],
    fase: 'bazas',
    turno: siguiente(e.repartidor),
  };
}

function cartasLegales(e: EstadoTwentyNine, asiento: Asiento): IdCarta[] {
  const mano = e.manos[asiento]!;
  if (e.mesa.length === 0) return [...mano];
  const salida = paloTwentyNine(e.mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloTwentyNine(c) === salida);
  if (delPalo.length > 0) return delPalo;
  if (e.debeTriunfo === asiento) {
    const triunfos = mano.filter((c) => paloTwentyNine(c) === e.triunfo);
    if (triunfos.length > 0) return triunfos;
  }
  return [...mano];
}

const tienePareja = (mano: readonly IdCarta[], triunfo: PaloFrances) =>
  mano.includes(`${triunfo}-13`) && mano.includes(`${triunfo}-12`);

function resolverBaza(e: EstadoTwentyNine): EstadoTwentyNine {
  const ganador = ganadoraTwentyNine(e.mesa, triunfoActivoTwentyNine(e)).asiento;
  const puntos = e.mesa.reduce((s, j) => s + puntosTwentyNine(j.carta), 0);
  const lado = ladoTwentyNine(ganador);
  const r: EstadoTwentyNine = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    puntosMano:
      lado === 0
        ? [e.puntosMano[0] + puntos, e.puntosMano[1]]
        : [e.puntosMano[0], e.puntosMano[1] + puntos],
    debeTriunfo: null,
  };
  return r.manos.every((m) => m.length === 0) ? cerrarMano(r) : r;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const twentyNine: Juego<
  ConfigTwentyNine,
  EstadoTwentyNine,
  AccionTwentyNine,
  VistaTwentyNine
> = {
  id: 'twentyNine',

  crear(config, semilla) {
    if (!Number.isInteger(config.objetivo) || config.objetivo < 1) {
      return error('El objetivo debe ser un entero positivo');
    }
    // Reparte el asiento 3, así el asiento 0 puja y sale primero.
    return ok(
      nuevaMano(
        { config: { objetivo: config.objetivo }, marcador: [0, 0], resultadosManos: [] },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'subasta': {
        const desde = Math.max(PUJA_MINIMA_TWENTY_NINE, (e.pujaMayor ?? 0) + 1);
        const r: AccionTwentyNine[] = [{ tipo: 'pasar' }];
        for (let v = desde; v <= PUJA_MAXIMA_TWENTY_NINE; v++) r.push({ tipo: 'pujar', valor: v });
        return r;
      }
      case 'triunfo':
        return [
          ...(['picas', 'corazones', 'treboles', 'diamantes'] as const).map(
            (palo): AccionTwentyNine => ({ tipo: 'elegirTriunfo', palo }),
          ),
          { tipo: 'elegirTriunfo', palo: null },
        ];
      case 'doblar':
        return [{ tipo: 'noDoblar' }, { tipo: 'doblar' }];
      case 'redoblar':
        return [{ tipo: 'noRedoblar' }, { tipo: 'redoblar' }];
      case 'bazas': {
        const r: AccionTwentyNine[] = cartasLegales(e, asiento)
          .sort()
          .map((carta) => ({ tipo: 'jugarCarta', carta }));
        const salida = e.mesa[0] ? paloTwentyNine(e.mesa[0].carta) : null;
        const sinPalo =
          salida !== null && !e.manos[asiento]!.some((c) => paloTwentyNine(c) === salida);
        if (sinPalo && !e.descubierto && !e.sinTriunfo) r.push({ tipo: 'pedirTriunfo' });
        if (
          e.descubierto &&
          !e.sinTriunfo &&
          e.pareja === null &&
          tienePareja(e.manos[asiento]!, e.triunfo!)
        ) {
          r.push({ tipo: 'cantarPareja' });
        }
        return r;
      }
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pujar':
      case 'pasar': {
        const r: EstadoTwentyNine = {
          ...e,
          pujas: e.pujas.map((p, a) =>
            a === asiento ? (accion.tipo === 'pujar' ? accion.valor : 'paso') : p,
          ),
          pujaMayor: accion.tipo === 'pujar' ? accion.valor : e.pujaMayor,
        };
        const quedan = [0, 1, 2, 3].filter((a) => r.pujas[a] !== 'paso');
        if (quedan.length === 0) return cerrarMano(r);
        if (r.pujaMayor !== null && quedan.length === 1) {
          const pujador = quedan[0]!;
          return { ...r, pujador, puja: r.pujaMayor, fase: 'triunfo', turno: pujador };
        }
        let sig = siguiente(asiento);
        while (r.pujas[sig] === 'paso') sig = siguiente(sig);
        return { ...r, turno: sig };
      }
      case 'elegirTriunfo':
        return {
          ...e,
          triunfo: accion.palo,
          sinTriunfo: accion.palo === null,
          fase: 'doblar',
          turno: siguiente(asiento),
        };
      case 'doblar':
        return { ...e, multiplicador: 2, fase: 'redoblar', turno: e.pujador! };
      case 'noDoblar':
        // Deciden los dos rivales del que pujó, el de su izquierda primero.
        return asiento === siguiente(e.pujador!)
          ? { ...e, turno: (e.pujador! + 3) % JUGADORES }
          : repartirResto(e);
      case 'redoblar':
        return repartirResto({ ...e, multiplicador: 4 });
      case 'noRedoblar':
        return repartirResto(e);
      case 'pedirTriunfo':
        return { ...e, descubierto: true, debeTriunfo: asiento };
      case 'cantarPareja': {
        const delPujador = ladoTwentyNine(asiento) === ladoTwentyNine(e.pujador!);
        const puja = delPujador
          ? Math.max(PUJA_MINIMA_TWENTY_NINE, e.puja! - 4)
          : Math.min(PUJA_MAXIMA_TWENTY_NINE, e.puja! + 4);
        return { ...e, pareja: asiento, puja };
      }
      case 'jugarCarta': {
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = paloTwentyNine(mesa[0]!.carta);
        const nuevo = paloTwentyNine(accion.carta) !== salida ? salida : null;
        const jugado: EstadoTwentyNine = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          mesa,
          jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          fallos: e.fallos.map((f, a) =>
            a === asiento && nuevo !== null && !f.includes(nuevo) ? [...f, nuevo] : f,
          ),
          debeTriunfo: null,
        };
        if (mesa.length < JUGADORES) return { ...jugado, turno: siguiente(asiento) };
        return resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const conoce = e.descubierto || e.sinTriunfo || (asiento !== null && asiento === e.pujador);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      pendientes: e.pendientes.map((p) => p.length),
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      pujas: [...e.pujas],
      pujaMayor: e.pujaMayor,
      pujador: e.pujador,
      puja: e.puja,
      triunfo: conoce ? e.triunfo : null,
      triunfoOculto: !conoce && e.triunfo !== null,
      sinTriunfo: e.sinTriunfo,
      descubierto: e.descubierto,
      multiplicador: e.multiplicador,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => [...f]),
      puntosMano: e.puntosMano,
      debeTriunfo: e.debeTriunfo,
      pareja: e.pareja,
      marcador: e.marcador,
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const [m0, m1] = e.marcador;
    const o = e.config.objetivo;
    let gana: 0 | 1 | null;
    if (m0 >= o || m1 <= -o) gana = 0;
    else if (m1 >= o || m0 <= -o) gana = 1;
    else gana = m0 === m1 ? null : m0 > m1 ? 0 : 1;
    const puntos = [0, 1, 2, 3].map((a) => e.marcador[ladoTwentyNine(a)]!);
    if (gana === null) return { ganadores: [], empate: true, puntos };
    return { ganadores: gana === 0 ? [0, 2] : [1, 3], empate: false, puntos };
  },
};
