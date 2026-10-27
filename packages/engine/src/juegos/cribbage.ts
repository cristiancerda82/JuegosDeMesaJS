import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** El Cribbage clásico no tiene opciones: 2 jugadores y partida a 121. */
export interface ConfigCribbage {
  readonly jugadores: 2;
}

export const CONFIG_CRIBBAGE_POR_DEFECTO: ConfigCribbage = { jugadores: 2 };

export const PUNTOS_PARTIDA_CRIBBAGE = 121;
const JUGADORES = 2;
const CARTAS_REPARTO = 6;
const TOPE = 31;
const QUINCE = 15;

type DeDos<T> = readonly [T, T];
export type FaseCribbage = 'descarte' | 'juego';

export type MotivoCribbage =
  'quince' | 'treintaYUno' | 'pareja' | 'trio' | 'poker' | 'escalera' | 'go' | 'ultima' | 'talones';

export interface PuntosMotivo {
  readonly motivo: MotivoCribbage;
  readonly puntos: number;
  /** Cartas de la escalera, para el texto. */
  readonly cartas?: number;
}

export type AccionCribbage =
  /** Las 2 cartas que se echan al crib, en el orden de la baraja. */
  | { readonly tipo: 'echar'; readonly cartas: readonly IdCarta[] }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'go' };

export interface AccionCribbageHecha {
  readonly asiento: Asiento;
  /** Lo que se echa al crib se ve sin las cartas, salvo para quien las echa. */
  readonly accion: AccionCribbage | { readonly tipo: 'echar' };
  readonly puntos: readonly PuntosMotivo[];
}

export interface DesgloseCribbage {
  readonly quinces: number;
  readonly parejas: number;
  readonly escaleras: number;
  readonly color: number;
  readonly nobs: number;
  readonly total: number;
}

export interface RecuentoCribbage {
  readonly asiento: Asiento;
  readonly crib: boolean;
  readonly cartas: readonly IdCarta[];
  readonly desglose: DesgloseCribbage;
}

export interface ResultadoManoCribbage {
  readonly repartidor: Asiento;
  readonly starter: IdCarta | null;
  /** Los recuentos hechos, en orden; si la partida terminó antes, faltan los siguientes. */
  readonly recuentos: readonly RecuentoCribbage[];
  /** Lo que sumó cada uno al cortar y al jugar las cartas. */
  readonly puntosJuego: DeDos<number>;
  readonly totales: DeDos<number>;
}

export interface EstadoCribbage {
  readonly config: ConfigCribbage;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseCribbage;
  /** Las cartas que le quedan a cada uno por echar o por jugar. */
  readonly manos: readonly (readonly IdCarta[])[];
  /** Las 4 con las que se queda cada uno, para el recuento. */
  readonly guardadas: readonly (readonly IdCarta[])[];
  readonly echadas: readonly (readonly IdCarta[])[];
  readonly mazo: readonly IdCarta[];
  readonly starter: IdCarta | null;
  readonly turno: Asiento;
  readonly cuenta: number;
  /** Cartas jugadas desde que la cuenta empezó en 0. */
  readonly secuencia: readonly IdCarta[];
  readonly jugadasMano: readonly IdCarta[];
  /** Los que dijeron go en esta cuenta. */
  readonly pasaron: readonly Asiento[];
  readonly ultimoEnJugar: Asiento | null;
  readonly puntos: DeDos<number>;
  readonly puntosJuego: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoCribbage[];
  readonly ultimaAccion: AccionCribbageHecha | null;
}

export interface VistaCribbage {
  readonly config: ConfigCribbage;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  /** Las que echó al crib el jugador. */
  readonly misEchadas: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly cartasEnCrib: number;
  readonly repartidor: Asiento;
  readonly fase: FaseCribbage;
  readonly starter: IdCarta | null;
  readonly turno: Asiento | null;
  readonly cuenta: number;
  readonly secuencia: readonly IdCarta[];
  readonly jugadasMano: readonly IdCarta[];
  /** Las cartas que ha jugado cada uno en la mano. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly pasaron: readonly Asiento[];
  readonly ultimoEnJugar: Asiento | null;
  readonly puntos: DeDos<number>;
  readonly puntosJuego: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoCribbage[];
  readonly ultimaAccion: AccionCribbageHecha | null;
}

// ── Cartas y puntos ──────────────────────────────────────────────────────────

/** Número de la carta: del As (1) a la K (13). */
export const rangoCribbage = (c: IdCarta) => cartaDeId(c)!.valor;
/** Valor para contar: el número, y las figuras 10. */
export const valorCribbage = (c: IdCarta) => Math.min(rangoCribbage(c), 10);
const paloDe = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

const BARAJA = crearBaraja('francesa52');
const ordenBaraja = (cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => BARAJA.indexOf(a) - BARAJA.indexOf(b));

/** Desglose del recuento de una mano (o del crib) con el starter. */
export function puntosRecuento(
  cartas: readonly IdCarta[],
  starter: IdCarta,
  esCrib: boolean,
): DesgloseCribbage {
  const todas = [...cartas, starter];
  let quinces = 0;
  for (let m = 1; m < 1 << todas.length; m++) {
    let suma = 0;
    todas.forEach((c, i) => {
      if (m & (1 << i)) suma += valorCribbage(c);
    });
    if (suma === QUINCE) quinces += 2;
  }
  let parejas = 0;
  for (let i = 0; i < todas.length; i++) {
    for (let j = i + 1; j < todas.length; j++) {
      if (rangoCribbage(todas[i]!) === rangoCribbage(todas[j]!)) parejas += 2;
    }
  }
  const veces = new Array<number>(15).fill(0);
  for (const c of todas) veces[rangoCribbage(c)]!++;
  let escaleras = 0;
  for (let r = 1; r <= 13;) {
    if (veces[r] === 0) {
      r++;
      continue;
    }
    let largo = 0;
    let producto = 1;
    while (r + largo <= 13 && veces[r + largo]! > 0) {
      producto *= veces[r + largo]!;
      largo++;
    }
    if (largo >= 3) escaleras += largo * producto;
    r += largo;
  }
  const palo = paloDe(cartas[0]!);
  const mismoPalo = cartas.every((c) => paloDe(c) === palo);
  const conStarter = mismoPalo && paloDe(starter) === palo;
  const color = esCrib ? (conStarter ? 5 : 0) : mismoPalo ? (conStarter ? 5 : 4) : 0;
  const nobs = cartas.some((c) => rangoCribbage(c) === 11 && paloDe(c) === paloDe(starter)) ? 1 : 0;
  return {
    quinces,
    parejas,
    escaleras,
    color,
    nobs,
    total: quinces + parejas + escaleras + color + nobs,
  };
}

/** Los puntos de la última carta de `secuencia` al jugar, con la cuenta ya sumada. */
export function puntosJugada(secuencia: readonly IdCarta[], cuenta: number): PuntosMotivo[] {
  const puntos: PuntosMotivo[] = [];
  if (cuenta === QUINCE) puntos.push({ motivo: 'quince', puntos: 2 });
  if (cuenta === TOPE) puntos.push({ motivo: 'treintaYUno', puntos: 2 });
  const ultima = rangoCribbage(secuencia.at(-1)!);
  let iguales = 1;
  while (
    iguales < secuencia.length &&
    rangoCribbage(secuencia[secuencia.length - 1 - iguales]!) === ultima
  ) {
    iguales++;
  }
  if (iguales === 2) puntos.push({ motivo: 'pareja', puntos: 2 });
  if (iguales === 3) puntos.push({ motivo: 'trio', puntos: 6 });
  if (iguales === 4) puntos.push({ motivo: 'poker', puntos: 12 });
  for (let n = secuencia.length; n >= 3; n--) {
    const rangos = secuencia.slice(-n).map(rangoCribbage);
    const distintos = new Set(rangos).size === n;
    if (distintos && Math.max(...rangos) - Math.min(...rangos) === n - 1) {
      puntos.push({ motivo: 'escalera', puntos: n, cartas: n });
      break;
    }
  }
  return puntos;
}

const suma = (p: readonly PuntosMotivo[]) => p.reduce((s, x) => s + x.puntos, 0);

// ── Reglas ───────────────────────────────────────────────────────────────────

const otro = (a: Asiento) => 1 - a;

const partidaTerminada = (e: Pick<EstadoCribbage, 'puntos'>) =>
  Math.max(...e.puntos) >= PUNTOS_PARTIDA_CRIBBAGE;

function sumar(puntos: DeDos<number>, asiento: Asiento, n: number): DeDos<number> {
  return asiento === 0 ? [puntos[0] + n, puntos[1]] : [puntos[0], puntos[1] + n];
}

/** Todas las parejas de cartas de la mano, en el orden de la baraja. */
function parejasDe(mano: readonly IdCarta[]): IdCarta[][] {
  const orden = ordenBaraja(mano);
  const res: IdCarta[][] = [];
  for (let i = 0; i < orden.length; i++) {
    for (let j = i + 1; j < orden.length; j++) res.push([orden[i]!, orden[j]!]);
  }
  return res;
}

function nuevaMano(
  config: ConfigCribbage,
  azar: EstadoAzar,
  repartidor: Asiento,
  previo: Pick<EstadoCribbage, 'puntos' | 'resultadosManos' | 'ultimaAccion'>,
): EstadoCribbage {
  const { cartas, azar: azarSiguiente } = barajar(BARAJA, azar);
  const manos = [0, 1].map((a) =>
    ordenBaraja(cartas.slice(a * CARTAS_REPARTO, (a + 1) * CARTAS_REPARTO)),
  );
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    fase: 'descarte',
    manos,
    guardadas: [[], []],
    echadas: [[], []],
    mazo: cartas.slice(JUGADORES * CARTAS_REPARTO),
    starter: null,
    turno: otro(repartidor),
    cuenta: 0,
    secuencia: [],
    jugadasMano: [],
    pasaron: [],
    ultimoEnJugar: null,
    puntos: previo.puntos,
    puntosJuego: [0, 0],
    resultadosManos: previo.resultadosManos,
    ultimaAccion: previo.ultimaAccion,
  };
}

/** Guarda el resultado de la mano con los recuentos hechos. */
function conResultado(e: EstadoCribbage, recuentos: readonly RecuentoCribbage[]): EstadoCribbage {
  return {
    ...e,
    resultadosManos: [
      ...e.resultadosManos,
      {
        repartidor: e.repartidor,
        starter: e.starter,
        recuentos,
        puntosJuego: e.puntosJuego,
        totales: e.puntos,
      },
    ],
  };
}

/** El recuento en orden, parando si alguien llega a 121; después, otra mano. */
function recontar(e: EstadoCribbage): EstadoCribbage {
  const pie = otro(e.repartidor);
  const orden: { asiento: Asiento; crib: boolean; cartas: readonly IdCarta[] }[] = [
    { asiento: pie, crib: false, cartas: e.guardadas[pie]! },
    { asiento: e.repartidor, crib: false, cartas: e.guardadas[e.repartidor]! },
    { asiento: e.repartidor, crib: true, cartas: [...e.echadas[0]!, ...e.echadas[1]!] },
  ];
  let puntos = e.puntos;
  const recuentos: RecuentoCribbage[] = [];
  for (const r of orden) {
    const desglose = puntosRecuento(r.cartas, e.starter!, r.crib);
    recuentos.push({ ...r, cartas: ordenBaraja(r.cartas), desglose });
    puntos = sumar(puntos, r.asiento, desglose.total);
    if (partidaTerminada({ puntos })) break;
  }
  const cerrado = conResultado({ ...e, puntos }, recuentos);
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, otro(e.repartidor), cerrado);
}

/** Vuelve la cuenta a 0; sale `sale` si tiene cartas, o el otro. */
function reiniciar(e: EstadoCribbage, sale: Asiento): EstadoCribbage {
  const turno = e.manos[sale]!.length > 0 ? sale : otro(sale);
  return { ...e, cuenta: 0, secuencia: [], pasaron: [], turno };
}

/** Suma puntos de una jugada al jugador, a su cuenta de la mano y a la última acción. */
function anotar(
  e: EstadoCribbage,
  asiento: Asiento,
  motivos: readonly PuntosMotivo[],
): EstadoCribbage {
  const n = suma(motivos);
  if (n === 0) return e;
  return {
    ...e,
    puntos: sumar(e.puntos, asiento, n),
    puntosJuego: sumar(e.puntosJuego, asiento, n),
    ultimaAccion: e.ultimaAccion && {
      ...e.ultimaAccion,
      puntos: [...e.ultimaAccion.puntos, ...motivos],
    },
  };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cribbage: Juego<ConfigCribbage, EstadoCribbage, AccionCribbage, VistaCribbage> = {
  id: 'cribbage',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Cribbage se juega con 2 jugadores');
    // Reparte primero el asiento 1: el 0 es el primero en echar y en jugar.
    return ok(
      nuevaMano({ jugadores: 2 }, crearAzar(semilla), 1, {
        puntos: [0, 0],
        resultadosManos: [],
        ultimaAccion: null,
      }),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'descarte') {
      return parejasDe(e.manos[asiento]!).map((cartas) => ({ tipo: 'echar', cartas }));
    }
    const caben = e.manos[asiento]!.filter((c) => e.cuenta + valorCribbage(c) <= TOPE);
    if (caben.length === 0) return [{ tipo: 'go' }];
    return caben.map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoCribbage = { ...e, ultimaAccion: { asiento, accion, puntos: [] } };

    if (accion.tipo === 'echar') {
      const manos = e.manos.map((m, a) =>
        a === asiento ? m.filter((c) => !accion.cartas.includes(c)) : m,
      );
      const echado: EstadoCribbage = {
        ...hecha,
        manos,
        guardadas: e.guardadas.map((g, a) => (a === asiento ? manos[a]! : g)),
        echadas: e.echadas.map((x, a) => (a === asiento ? [...accion.cartas] : x)),
      };
      if (asiento !== e.repartidor) return { ...echado, turno: e.repartidor };
      // Los dos han echado: se corta el starter, y la J suma 2 al repartidor.
      const starter = e.mazo[0]!;
      const cortado: EstadoCribbage = {
        ...echado,
        fase: 'juego',
        starter,
        mazo: e.mazo.slice(1),
        turno: otro(e.repartidor),
      };
      if (rangoCribbage(starter) !== 11) return cortado;
      const conTalones = anotar(cortado, e.repartidor, [{ motivo: 'talones', puntos: 2 }]);
      return partidaTerminada(conTalones) ? conResultado(conTalones, []) : conTalones;
    }

    if (accion.tipo === 'go') {
      const pasaron = [...e.pasaron, asiento];
      const rival = otro(asiento);
      if (!pasaron.includes(rival) && e.manos[rival]!.length > 0) {
        return { ...hecha, pasaron, turno: rival };
      }
      // Nadie puede seguir: el último en jugar suma 1 y la cuenta vuelve a 0.
      const ultimo = e.ultimoEnJugar!;
      const conGo = anotar({ ...hecha, pasaron }, ultimo, [{ motivo: 'go', puntos: 1 }]);
      if (partidaTerminada(conGo)) return conResultado(conGo, []);
      return reiniciar(conGo, otro(ultimo));
    }

    // Jugar una carta.
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const cuenta = e.cuenta + valorCribbage(accion.carta);
    const secuencia = [...e.secuencia, accion.carta];
    let s = anotar(
      {
        ...hecha,
        manos,
        cuenta,
        secuencia,
        jugadasMano: [...e.jugadasMano, accion.carta],
        ultimoEnJugar: asiento,
      },
      asiento,
      puntosJugada(secuencia, cuenta),
    );
    if (partidaTerminada(s)) return conResultado(s, []);
    const sinCartas = manos.every((m) => m.length === 0);
    if (sinCartas) {
      // La última carta de la mano suma 1, salvo que llegue a 31.
      if (cuenta !== TOPE) s = anotar(s, asiento, [{ motivo: 'ultima', puntos: 1 }]);
      if (partidaTerminada(s)) return conResultado(s, []);
      return recontar(s);
    }
    if (cuenta === TOPE) return reiniciar(s, otro(asiento));
    const rival = otro(asiento);
    const sigueRival = !e.pasaron.includes(rival) && manos[rival]!.length > 0;
    if (sigueRival) return { ...s, turno: rival };
    if (manos[asiento]!.length > 0) return { ...s, turno: asiento };
    // Sin cartas el que jugó y el otro ya dijo go: go para quien jugó.
    const conGo = anotar(s, asiento, [{ motivo: 'go', puntos: 1 }]);
    if (partidaTerminada(conGo)) return conResultado(conGo, []);
    return reiniciar(conGo, rival);
  },

  vistaDe(e, asiento) {
    const accion = e.ultimaAccion;
    const ultimaAccion =
      accion && accion.accion.tipo === 'echar' && accion.asiento !== asiento
        ? { ...accion, accion: { tipo: 'echar' as const } }
        : accion;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      misEchadas: asiento === null ? null : [...e.echadas[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      cartasEnCrib: e.echadas[0]!.length + e.echadas[1]!.length,
      repartidor: e.repartidor,
      fase: e.fase,
      starter: e.starter,
      turno: partidaTerminada(e) ? null : e.turno,
      cuenta: e.cuenta,
      secuencia: [...e.secuencia],
      jugadasMano: [...e.jugadasMano],
      jugadasPor: e.guardadas.map((g, a) => g.filter((c) => !e.manos[a]!.includes(c))),
      pasaron: [...e.pasaron],
      ultimoEnJugar: e.ultimoEnJugar,
      puntos: e.puntos,
      puntosJuego: e.puntosJuego,
      resultadosManos: [...e.resultadosManos],
      ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const gana = e.puntos[0] >= PUNTOS_PARTIDA_CRIBBAGE ? 0 : 1;
    return { ganadores: [gana], empate: false, puntos: [...e.puntos] };
  },
};
