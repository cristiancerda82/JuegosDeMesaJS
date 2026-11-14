import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  botesEnJuegoHoldem,
  botesHoldem,
  ciegasHoldem,
  FICHAS_INICIALES_HOLDEM,
  type BoteHoldem,
  type BoteRepartidoHoldem,
  type ManoEnsenadaHoldem,
} from './holdem';
import { mejorManoPoker, rangoPoker } from './holdem-manos';

/**
 * Póker de cinco cartas con descarte (design, decisión 1): el torneo, las apuestas sin límite y
 * los botes del Texas Hold'em, con un descarte entre las dos rondas y sin cartas comunes.
 */

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigPokerCinco {
  /** De 2 a 6 jugadores, cada uno por su cuenta. */
  readonly jugadores: 2 | 3 | 4 | 5 | 6;
}

export const CONFIG_POKER_CINCO_POR_DEFECTO: ConfigPokerCinco = { jugadores: 4 };

export const CARTAS_POKER_CINCO = 5;
/** Lo que se puede cambiar: 3, o 4 si la que queda es un As. */
export const CAMBIO_MAXIMO_POKER_CINCO = 3;

export type FasePokerCinco = 'antes' | 'descarte' | 'despues';

export type AccionPokerCinco =
  | { readonly tipo: 'retirarse' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'igualar' }
  /** Apostar o subir hasta esta cantidad total en la ronda. */
  | { readonly tipo: 'subir'; readonly hasta: number }
  /** Las cartas que cambia, ordenadas (`ordenarCambio`). */
  | { readonly tipo: 'cambiar'; readonly cartas: readonly IdCarta[] };

export interface ResultadoManoPokerCinco {
  readonly numeroMano: number;
  readonly ensenadas: readonly ManoEnsenadaHoldem[];
  readonly botes: readonly BoteRepartidoHoldem[];
  /** Quien se llevó el bote porque los demás se retiraron; `null` si hubo showdown. */
  readonly sinShowdown: Asiento | null;
  readonly fichasTras: readonly number[];
  readonly eliminadosTras: readonly boolean[];
}

export interface EstadoPokerCinco {
  readonly config: ConfigPokerCinco;
  readonly azar: EstadoAzar;
  readonly numeroMano: number;
  readonly boton: Asiento;
  /** Fichas que le quedan a cada uno, sin lo que ya ha apostado en la mano. */
  readonly fichas: readonly number[];
  readonly eliminados: readonly boolean[];
  /** Orden en que han caído los eliminados. */
  readonly eliminacion: readonly Asiento[];
  readonly manos: readonly (readonly IdCarta[])[];
  /** Boca abajo; se roba la primera. */
  readonly mazo: readonly IdCarta[];
  /** Las cartas cambiadas en la mano, boca abajo. */
  readonly descartes: readonly IdCarta[];
  readonly fase: FasePokerCinco;
  readonly turno: Asiento;
  /** Lo apostado en la ronda. */
  readonly apuestas: readonly number[];
  /** Lo apostado en toda la mano, para los botes. */
  readonly aportado: readonly number[];
  readonly retirados: readonly boolean[];
  readonly allIn: readonly boolean[];
  readonly apuestaMaxima: number;
  /** Tamaño de la última subida completa de la ronda. */
  readonly ultimaSubida: number;
  /** Quién tiene que actuar todavía en la ronda (o cambiar, en el descarte). */
  readonly pendientes: readonly boolean[];
  /** Falso para quien solo puede igualar o retirarse tras un all-in corto. */
  readonly puedeSubir: readonly boolean[];
  /** Cuántas cartas cambió cada uno en la mano; `null` si aún no ha cambiado. */
  readonly cambiadas: readonly (number | null)[];
  /** El As que enseñó quien cambió cuatro. */
  readonly asEnsenado: readonly (IdCarta | null)[];
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly tipo: AccionPokerCinco['tipo'];
    /** Lo apostado, o las cartas cambiadas. */
    readonly cantidad: number;
  } | null;
  readonly resultadosManos: readonly ResultadoManoPokerCinco[];
}

export interface VistaPokerCinco {
  readonly config: ConfigPokerCinco;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly numeroMano: number;
  readonly ciegas: readonly [number, number];
  readonly boton: Asiento;
  readonly fichas: readonly number[];
  readonly eliminados: readonly boolean[];
  readonly eliminacion: readonly Asiento[];
  /** Cuántas cartas tapadas tiene cada uno (0 si no juega la mano). */
  readonly cartasEnMano: readonly number[];
  readonly fase: FasePokerCinco;
  readonly turno: Asiento | null;
  readonly apuestas: readonly number[];
  readonly aportado: readonly number[];
  readonly retirados: readonly boolean[];
  readonly allIn: readonly boolean[];
  readonly apuestaMaxima: number;
  readonly ultimaSubida: number;
  readonly cambiadas: readonly (number | null)[];
  readonly asEnsenado: readonly (IdCarta | null)[];
  /** Los botes con lo apostado hasta ahora, también en la ronda. */
  readonly botes: readonly BoteHoldem[];
  readonly ultimaAccion: EstadoPokerCinco['ultimaAccion'];
  readonly resultadosManos: readonly ResultadoManoPokerCinco[];
}

// ── Descarte ─────────────────────────────────────────────────────────────────

/** El orden de las cartas en una acción de cambiar. */
export const ordenarCambio = (cartas: readonly IdCarta[]): IdCarta[] => [...cartas].sort();

const esAs = (c: IdCarta) => rangoPoker(c) === 14;

/** Si se pueden cambiar esas cartas de esa mano: hasta 3, o 4 dejando un As. */
export function cambioValidoPokerCinco(
  mano: readonly IdCarta[],
  cartas: readonly IdCarta[],
): boolean {
  if (new Set(cartas).size !== cartas.length || !cartas.every((c) => mano.includes(c))) {
    return false;
  }
  if (cartas.length <= CAMBIO_MAXIMO_POKER_CINCO) return true;
  const quedan = mano.filter((c) => !cartas.includes(c));
  return cartas.length === 4 && quedan.length === 1 && esAs(quedan[0]!);
}

/** Todos los cambios que se pueden hacer con una mano, de menos a más cartas. */
export function cambiosPosiblesPokerCinco(mano: readonly IdCarta[]): IdCarta[][] {
  const ordenada = ordenarCambio(mano);
  const todos: IdCarta[][] = [];
  for (let mascara = 0; mascara < 1 << ordenada.length; mascara++) {
    const cartas = ordenada.filter((_, i) => mascara & (1 << i));
    if (cambioValidoPokerCinco(ordenada, cartas)) todos.push(cartas);
  }
  return todos.sort((a, b) => a.length - b.length);
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** El siguiente asiento sin eliminar. */
function siguienteVivo(eliminados: readonly boolean[], desde: Asiento): Asiento {
  const n = eliminados.length;
  let a = (desde + 1) % n;
  while (eliminados[a]) a = (a + 1) % n;
  return a;
}

const vivos = (e: Pick<EstadoPokerCinco, 'eliminados'>) => e.eliminados.filter((x) => !x).length;
const terminada = (e: Pick<EstadoPokerCinco, 'eliminados'>) => vivos(e) <= 1;
const enLaMano = (e: EstadoPokerCinco, a: Asiento) => !e.eliminados[a] && !e.retirados[a];
const puedeActuar = (e: EstadoPokerCinco, a: Asiento) => enLaMano(e, a) && !e.allIn[a];

function nuevaMano(
  config: ConfigPokerCinco,
  azar: EstadoAzar,
  numeroMano: number,
  boton: Asiento,
  fichasIniciales: readonly number[],
  eliminados: readonly boolean[],
  eliminacion: readonly Asiento[],
  resultadosManos: readonly ResultadoManoPokerCinco[],
): EstadoPokerCinco {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const mazo = [...cartas];
  const manos: IdCarta[][] = Array.from({ length: n }, () => []);
  for (let ronda = 0; ronda < CARTAS_POKER_CINCO; ronda++) {
    for (let k = 1; k <= n; k++) {
      const a = (boton + k) % n;
      if (!eliminados[a]) manos[a]!.push(mazo.shift()!);
    }
  }
  const [pequena, grande] = ciegasHoldem(numeroMano);
  const dos = eliminados.filter((x) => !x).length === 2;
  const sb = dos ? boton : siguienteVivo(eliminados, boton);
  const bb = siguienteVivo(eliminados, sb);
  const fichas = [...fichasIniciales];
  const apuestas = new Array<number>(n).fill(0);
  const allIn = new Array<boolean>(n).fill(false);
  const pagar = (a: Asiento, x: number) => {
    const pago = Math.min(x, fichas[a]!);
    fichas[a]! -= pago;
    apuestas[a]! += pago;
    if (fichas[a] === 0) allIn[a] = true;
  };
  pagar(sb, pequena);
  pagar(bb, grande);
  const base: EstadoPokerCinco = {
    config,
    azar: azarSiguiente,
    numeroMano,
    boton,
    fichas,
    eliminados,
    eliminacion,
    manos,
    mazo,
    descartes: [],
    fase: 'antes',
    turno: bb,
    apuestas,
    aportado: [...apuestas],
    retirados: new Array<boolean>(n).fill(false),
    allIn,
    apuestaMaxima: Math.max(...apuestas),
    ultimaSubida: grande,
    pendientes: eliminados.map((x, a) => !x && !allIn[a]),
    puedeSubir: new Array<boolean>(n).fill(true),
    cambiadas: new Array<number | null>(n).fill(null),
    asEnsenado: new Array<IdCarta | null>(n).fill(null),
    ultimaAccion: null,
    resultadosManos,
  };
  // Antes del descarte empieza el de después de la ciega grande (con 2, el botón).
  return continuar(base, dos ? boton : siguienteVivo(eliminados, bb));
}

/** El primer asiento pendiente que cumple `puede`, empezando por `desde`. */
function primerPendiente(
  e: EstadoPokerCinco,
  desde: Asiento,
  puede: (e: EstadoPokerCinco, a: Asiento) => boolean,
): Asiento | null {
  const n = e.config.jugadores;
  for (let k = 0; k < n; k++) {
    const a = (desde + k) % n;
    if (e.pendientes[a] && puede(e, a)) return a;
  }
  return null;
}

/** Tras una acción: el siguiente en hablar o en cambiar, la siguiente fase o el showdown. */
function continuar(e: EstadoPokerCinco, desde: Asiento): EstadoPokerCinco {
  const n = e.config.jugadores;
  const quedan = Array.from({ length: n }, (_, a) => a).filter((a) => enLaMano(e, a));
  if (quedan.length === 1) return ganaSinShowdown(e, quedan[0]!);

  if (e.fase === 'descarte') {
    const siguiente = primerPendiente(e, desde, enLaMano);
    if (siguiente !== null) return { ...e, turno: siguiente };
    // Sin al menos dos que puedan apostar, no hay segunda ronda.
    if (quedan.filter((a) => !e.allIn[a]).length <= 1) return showdown(e);
    const despues: EstadoPokerCinco = {
      ...e,
      fase: 'despues',
      apuestas: new Array<number>(n).fill(0),
      apuestaMaxima: 0,
      ultimaSubida: ciegasHoldem(e.numeroMano)[1],
      pendientes: Array.from({ length: n }, (_, a) => puedeActuar(e, a)),
      puedeSubir: new Array<boolean>(n).fill(true),
    };
    return continuar(despues, siguienteVivo(e.eliminados, e.boton));
  }

  const siguiente = primerPendiente(e, desde, puedeActuar);
  if (siguiente !== null) return { ...e, turno: siguiente };
  if (e.fase === 'despues') return showdown(e);
  // Fin de la primera ronda: cambian todos los que siguen en la mano, también los all-in.
  const descarte: EstadoPokerCinco = {
    ...e,
    fase: 'descarte',
    pendientes: Array.from({ length: n }, (_, a) => enLaMano(e, a)),
  };
  return continuar(descarte, siguienteVivo(e.eliminados, e.boton));
}

function ganaSinShowdown(e: EstadoPokerCinco, ganador: Asiento): EstadoPokerCinco {
  const total = e.aportado.reduce((s, x) => s + x, 0);
  const fichas = e.fichas.map((f, a) => (a === ganador ? f + total : f));
  const botes: BoteRepartidoHoldem[] = [
    { cantidad: total, participantes: [ganador], ganadores: [ganador], porGanador: [total] },
  ];
  return cerrarMano(e, fichas, botes, [], ganador);
}

function showdown(e: EstadoPokerCinco): EstadoPokerCinco {
  const n = e.config.jugadores;
  const enMano = Array.from({ length: n }, (_, a) => enLaMano(e, a));
  const manos = new Map(
    Array.from({ length: n }, (_, a) => a)
      .filter((a) => enMano[a])
      .map((a) => [a, mejorManoPoker(e.manos[a]!)]),
  );
  const fichas = [...e.fichas];
  const orden = (a: Asiento) => (a - e.boton - 1 + n) % n;
  const botes: BoteRepartidoHoldem[] = botesHoldem(e.aportado, enMano).map((bote) => {
    const mejor = Math.max(...bote.participantes.map((a) => manos.get(a)!.valor));
    const ganadores = bote.participantes
      .filter((a) => manos.get(a)!.valor === mejor)
      .sort((x, y) => orden(x) - orden(y));
    const parte = Math.floor(bote.cantidad / ganadores.length);
    const resto = bote.cantidad - parte * ganadores.length;
    const porGanador = ganadores.map((_, i) => parte + (i < resto ? 1 : 0));
    ganadores.forEach((a, i) => (fichas[a]! += porGanador[i]!));
    return { ...bote, ganadores, porGanador };
  });
  const ensenadas: ManoEnsenadaHoldem[] = [...manos].map(([asiento, m]) => ({
    asiento,
    cartas: e.manos[asiento]!,
    categoria: m.categoria,
    jugada: m.cartas,
  }));
  return cerrarMano(e, fichas, botes, ensenadas, null);
}

/** Apunta el resultado, elimina a quien se quedó sin fichas y reparte otra mano o termina. */
function cerrarMano(
  e: EstadoPokerCinco,
  fichas: readonly number[],
  botes: readonly BoteRepartidoHoldem[],
  ensenadas: readonly ManoEnsenadaHoldem[],
  sinShowdown: Asiento | null,
): EstadoPokerCinco {
  // Caen los que se quedan sin fichas; antes, los que empezaron la mano con menos.
  const alEmpezar = e.fichas.map((f, a) => f + e.aportado[a]!);
  const caen = fichas
    .flatMap((f, a) => (f === 0 && !e.eliminados[a] ? [a] : []))
    .sort((x, y) => alEmpezar[x]! - alEmpezar[y]! || x - y);
  const eliminados = e.eliminados.map((x, a) => x || caen.includes(a));
  const eliminacion = [...e.eliminacion, ...caen];
  const resultadosManos = [
    ...e.resultadosManos,
    {
      numeroMano: e.numeroMano,
      ensenadas,
      botes,
      sinShowdown,
      fichasTras: fichas,
      eliminadosTras: eliminados,
    },
  ];
  const n = e.config.jugadores;
  const cerrada: EstadoPokerCinco = {
    ...e,
    fichas,
    eliminados,
    eliminacion,
    apuestas: new Array<number>(n).fill(0),
    aportado: new Array<number>(n).fill(0),
    pendientes: new Array<boolean>(n).fill(false),
    resultadosManos,
  };
  if (terminada(cerrada)) return cerrada;
  return nuevaMano(
    e.config,
    e.azar,
    e.numeroMano + 1,
    siguienteVivo(eliminados, e.boton),
    fichas,
    eliminados,
    eliminacion,
    resultadosManos,
  );
}

function cambiar(
  e: EstadoPokerCinco,
  asiento: Asiento,
  cartas: readonly IdCarta[],
): EstadoPokerCinco {
  let mazo = [...e.mazo];
  let descartes = [...e.descartes];
  let azar = e.azar;
  // Si el mazo no alcanza, se barajan debajo los descartes de los anteriores.
  if (mazo.length < cartas.length) {
    const barajado = barajar(descartes, azar);
    mazo = [...mazo, ...barajado.cartas];
    azar = barajado.azar;
    descartes = [];
  }
  const nuevas = mazo.slice(0, cartas.length);
  const mano = [...e.manos[asiento]!.filter((c) => !cartas.includes(c)), ...nuevas];
  const quedo = e.manos[asiento]!.filter((c) => !cartas.includes(c));
  const tras: EstadoPokerCinco = {
    ...e,
    azar,
    manos: e.manos.map((m, a) => (a === asiento ? mano : m)),
    mazo: mazo.slice(cartas.length),
    descartes: [...descartes, ...cartas],
    pendientes: e.pendientes.map((p, a) => (a === asiento ? false : p)),
    cambiadas: e.cambiadas.map((c, a) => (a === asiento ? cartas.length : c)),
    asEnsenado: e.asEnsenado.map((x, a) => (a === asiento && cartas.length === 4 ? quedo[0]! : x)),
    ultimaAccion: { asiento, tipo: 'cambiar', cantidad: cartas.length },
  };
  return continuar(tras, (asiento + 1) % e.config.jugadores);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const pokerCinco: Juego<
  ConfigPokerCinco,
  EstadoPokerCinco,
  AccionPokerCinco,
  VistaPokerCinco
> = {
  id: 'pokerCinco',

  crear(config, semilla) {
    if (![2, 3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Póker de cinco cartas se juega de 2 a 6 jugadores');
    }
    const limpia: ConfigPokerCinco = { jugadores: config.jugadores };
    const n = limpia.jugadores;
    return ok(
      nuevaMano(
        limpia,
        crearAzar(semilla),
        1,
        0,
        new Array<number>(n).fill(FICHAS_INICIALES_HOLDEM),
        new Array<boolean>(n).fill(false),
        [],
        [],
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'descarte') {
      if (!enLaMano(e, asiento)) return [];
      return cambiosPosiblesPokerCinco(e.manos[asiento]!).map((cartas) => ({
        tipo: 'cambiar',
        cartas,
      }));
    }
    if (!puedeActuar(e, asiento)) return [];
    const acciones: AccionPokerCinco[] = [{ tipo: 'retirarse' }];
    const aIgualar = e.apuestaMaxima - e.apuestas[asiento]!;
    acciones.push(aIgualar === 0 ? { tipo: 'pasar' } : { tipo: 'igualar' });
    const maximo = e.apuestas[asiento]! + e.fichas[asiento]!;
    if (e.puedeSubir[asiento] && maximo > e.apuestaMaxima) {
      const minimo = Math.min(e.apuestaMaxima + e.ultimaSubida, maximo);
      for (let hasta = minimo; hasta <= maximo; hasta++) acciones.push({ tipo: 'subir', hasta });
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'cambiar') return cambiar(e, asiento, accion.cartas);
    const n = e.config.jugadores;
    const fichas = [...e.fichas];
    const apuestas = [...e.apuestas];
    const aportado = [...e.aportado];
    const allIn = [...e.allIn];
    const retirados = [...e.retirados];
    const pendientes = [...e.pendientes];
    const puedeSubir = [...e.puedeSubir];
    let { apuestaMaxima, ultimaSubida } = e;
    const pagar = (x: number) => {
      const pago = Math.min(x, fichas[asiento]!);
      fichas[asiento]! -= pago;
      apuestas[asiento]! += pago;
      aportado[asiento]! += pago;
      if (fichas[asiento] === 0) allIn[asiento] = true;
      return pago;
    };
    let cantidad = 0;
    switch (accion.tipo) {
      case 'retirarse':
        retirados[asiento] = true;
        break;
      case 'pasar':
        break;
      case 'igualar':
        cantidad = pagar(apuestaMaxima - apuestas[asiento]!);
        break;
      case 'subir': {
        pagar(accion.hasta - apuestas[asiento]!);
        cantidad = accion.hasta;
        const subida = accion.hasta - apuestaMaxima;
        const completa = subida >= ultimaSubida;
        for (let a = 0; a < n; a++) {
          if (a === asiento || e.eliminados[a] || retirados[a] || allIn[a]) continue;
          if (completa) {
            pendientes[a] = true;
            puedeSubir[a] = true;
          } else if (!pendientes[a]) {
            // Un all-in corto no reabre las apuestas a quien ya había actuado.
            pendientes[a] = true;
            puedeSubir[a] = false;
          }
        }
        if (completa) ultimaSubida = subida;
        apuestaMaxima = accion.hasta;
        break;
      }
    }
    pendientes[asiento] = false;
    const tras: EstadoPokerCinco = {
      ...e,
      fichas,
      apuestas,
      aportado,
      allIn,
      retirados,
      pendientes,
      puedeSubir,
      apuestaMaxima,
      ultimaSubida,
      ultimaAccion: { asiento, tipo: accion.tipo, cantidad },
    };
    return continuar(tras, (asiento + 1) % n);
  },

  vistaDe(e, asiento) {
    const n = e.config.jugadores;
    const enMano = Array.from({ length: n }, (_, a) => enLaMano(e, a));
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      numeroMano: e.numeroMano,
      ciegas: ciegasHoldem(e.numeroMano),
      boton: e.boton,
      fichas: [...e.fichas],
      eliminados: [...e.eliminados],
      eliminacion: [...e.eliminacion],
      cartasEnMano: e.manos.map((m, a) => (enMano[a] ? m.length : 0)),
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      apuestas: [...e.apuestas],
      aportado: [...e.aportado],
      retirados: [...e.retirados],
      allIn: [...e.allIn],
      apuestaMaxima: e.apuestaMaxima,
      ultimaSubida: e.ultimaSubida,
      cambiadas: [...e.cambiadas],
      asEnsenado: [...e.asEnsenado],
      botes: botesEnJuegoHoldem(e.aportado, enMano, e.allIn),
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const n = e.config.jugadores;
    const ganador = e.eliminados.findIndex((x) => !x);
    // Posición de cada uno: el ganador 1, el último eliminado 2…
    const puntos = new Array<number>(n).fill(0);
    puntos[ganador] = 1;
    [...e.eliminacion].reverse().forEach((a, i) => (puntos[a] = i + 2));
    return { ganadores: [ganador], empate: false, puntos };
  },
};
