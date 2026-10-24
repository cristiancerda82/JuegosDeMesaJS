import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { mejorManoPoker, type CategoriaPoker } from './holdem-manos';

export * from './holdem-manos';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigHoldem {
  /** De 2 a 6 jugadores, cada uno por su cuenta. */
  readonly jugadores: 2 | 3 | 4 | 5 | 6;
}

export const CONFIG_HOLDEM_POR_DEFECTO: ConfigHoldem = { jugadores: 4 };

export const FICHAS_INICIALES_HOLDEM = 100;
/** Manos que dura cada nivel de ciegas. */
export const MANOS_POR_NIVEL_HOLDEM = 10;
/** Ciegas pequeña y grande de cada nivel; tras el último se quedan fijas. */
export const NIVELES_CIEGAS_HOLDEM: readonly (readonly [number, number])[] = [
  [1, 2],
  [2, 4],
  [3, 6],
  [5, 10],
  [10, 20],
  [15, 30],
  [25, 50],
  [50, 100],
  [100, 200],
];

export const ciegasHoldem = (numeroMano: number): readonly [number, number] =>
  NIVELES_CIEGAS_HOLDEM[
    Math.min(
      Math.floor((numeroMano - 1) / MANOS_POR_NIVEL_HOLDEM),
      NIVELES_CIEGAS_HOLDEM.length - 1,
    )
  ]!;

export type FaseHoldem = 'preflop' | 'flop' | 'turn' | 'river';

export type AccionHoldem =
  | { readonly tipo: 'retirarse' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'igualar' }
  /** Apostar o subir hasta esta cantidad total en la ronda. */
  | { readonly tipo: 'subir'; readonly hasta: number };

export interface ManoEnsenadaHoldem {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
  readonly categoria: CategoriaPoker;
  /** Las cinco cartas de su jugada. */
  readonly jugada: readonly IdCarta[];
}

export interface BoteHoldem {
  readonly cantidad: number;
  readonly participantes: readonly Asiento[];
}

export interface BoteRepartidoHoldem extends BoteHoldem {
  readonly ganadores: readonly Asiento[];
  /** Lo que se lleva cada ganador, en el orden de `ganadores`. */
  readonly porGanador: readonly number[];
}

export interface ResultadoManoHoldem {
  readonly numeroMano: number;
  readonly comunes: readonly IdCarta[];
  readonly ensenadas: readonly ManoEnsenadaHoldem[];
  readonly botes: readonly BoteRepartidoHoldem[];
  /** Quien se llevó el bote porque los demás se retiraron; `null` si hubo showdown. */
  readonly sinShowdown: Asiento | null;
  readonly fichasTras: readonly number[];
  readonly eliminadosTras: readonly boolean[];
}

export interface EstadoHoldem {
  readonly config: ConfigHoldem;
  readonly azar: EstadoAzar;
  readonly numeroMano: number;
  readonly boton: Asiento;
  /** Fichas que le quedan a cada uno, sin lo que ya ha apostado en la mano. */
  readonly fichas: readonly number[];
  readonly eliminados: readonly boolean[];
  /** Orden en que han caído los eliminados. */
  readonly eliminacion: readonly Asiento[];
  readonly manos: readonly (readonly IdCarta[])[];
  /** Boca abajo; se reparte la primera. */
  readonly mazo: readonly IdCarta[];
  readonly comunes: readonly IdCarta[];
  readonly fase: FaseHoldem;
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
  /** Quién tiene que actuar todavía en la ronda. */
  readonly pendientes: readonly boolean[];
  /** Falso para quien solo puede igualar o retirarse tras un all-in corto. */
  readonly puedeSubir: readonly boolean[];
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly tipo: AccionHoldem['tipo'];
    readonly cantidad: number;
  } | null;
  readonly resultadosManos: readonly ResultadoManoHoldem[];
}

export interface VistaHoldem {
  readonly config: ConfigHoldem;
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
  readonly comunes: readonly IdCarta[];
  readonly fase: FaseHoldem;
  readonly turno: Asiento | null;
  readonly apuestas: readonly number[];
  readonly aportado: readonly number[];
  readonly retirados: readonly boolean[];
  readonly allIn: readonly boolean[];
  readonly apuestaMaxima: number;
  readonly ultimaSubida: number;
  /** Los botes con lo apostado hasta ahora, también en la ronda. */
  readonly botes: readonly BoteHoldem[];
  readonly ultimaAccion: EstadoHoldem['ultimaAccion'];
  readonly resultadosManos: readonly ResultadoManoHoldem[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const FASES: readonly FaseHoldem[] = ['preflop', 'flop', 'turn', 'river'];

/** El siguiente asiento sin eliminar. */
function siguienteVivo(eliminados: readonly boolean[], desde: Asiento): Asiento {
  const n = eliminados.length;
  let a = (desde + 1) % n;
  while (eliminados[a]) a = (a + 1) % n;
  return a;
}

const vivos = (e: Pick<EstadoHoldem, 'eliminados'>) => e.eliminados.filter((x) => !x).length;
const terminada = (e: Pick<EstadoHoldem, 'eliminados'>) => vivos(e) <= 1;
const enLaMano = (e: EstadoHoldem, a: Asiento) => !e.eliminados[a] && !e.retirados[a];
const puedeActuar = (e: EstadoHoldem, a: Asiento) => enLaMano(e, a) && !e.allIn[a];

/** Los botes según lo aportado: principal y secundarios. */
export function botesHoldem(aportado: readonly number[], enMano: readonly boolean[]): BoteHoldem[] {
  const niveles = [...new Set(aportado.filter((x, a) => enMano[a] && x > 0))].sort((a, b) => a - b);
  const botes: BoteHoldem[] = [];
  let previo = 0;
  for (const nivel of niveles) {
    const cantidad = aportado.reduce((s, x) => s + Math.min(x, nivel) - Math.min(x, previo), 0);
    const participantes = aportado.flatMap((x, a) => (enMano[a] && x >= nivel ? [a] : []));
    botes.push({ cantidad, participantes });
    previo = nivel;
  }
  // Lo que pusieron por encima los que se retiraron va al último bote.
  const sobra = aportado.reduce((s, x) => s + Math.max(0, x - previo), 0);
  if (sobra > 0 && botes.length > 0) {
    const ultimo = botes.at(-1)!;
    botes[botes.length - 1] = { ...ultimo, cantidad: ultimo.cantidad + sobra };
  }
  return botes;
}

/**
 * Los botes mientras se apuesta: uno solo, salvo que alguien vaya all-in, que separa un bote
 * por cada all-in y otro con lo que los demás han puesto por encima.
 */
export function botesEnJuegoHoldem(
  aportado: readonly number[],
  enMano: readonly boolean[],
  allIn: readonly boolean[],
): BoteHoldem[] {
  const niveles = [...new Set(aportado.filter((x, a) => enMano[a] && allIn[a] && x > 0))].sort(
    (a, b) => a - b,
  );
  const botes: BoteHoldem[] = [];
  let previo = 0;
  for (const nivel of niveles) {
    const cantidad = aportado.reduce((s, x) => s + Math.min(x, nivel) - Math.min(x, previo), 0);
    const participantes = aportado.flatMap((x, a) => (enMano[a] && x >= nivel ? [a] : []));
    botes.push({ cantidad, participantes });
    previo = nivel;
  }
  const resto = aportado.reduce((s, x) => s + Math.max(0, x - previo), 0);
  if (resto > 0 || botes.length === 0) {
    const participantes = aportado.flatMap((x, a) => (enMano[a] && !allIn[a] ? [a] : []));
    botes.push({ cantidad: resto, participantes });
  }
  return botes;
}

function nuevaMano(
  config: ConfigHoldem,
  azar: EstadoAzar,
  numeroMano: number,
  boton: Asiento,
  fichasIniciales: readonly number[],
  eliminados: readonly boolean[],
  eliminacion: readonly Asiento[],
  resultadosManos: readonly ResultadoManoHoldem[],
): EstadoHoldem {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const mazo = [...cartas];
  const manos: IdCarta[][] = Array.from({ length: n }, () => []);
  for (let ronda = 0; ronda < 2; ronda++) {
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
  const base: EstadoHoldem = {
    config,
    azar: azarSiguiente,
    numeroMano,
    boton,
    fichas,
    eliminados,
    eliminacion,
    manos,
    mazo,
    comunes: [],
    fase: 'preflop',
    turno: bb,
    apuestas,
    aportado: [...apuestas],
    retirados: new Array<boolean>(n).fill(false),
    allIn,
    apuestaMaxima: Math.max(...apuestas),
    ultimaSubida: grande,
    pendientes: eliminados.map((x, a) => !x && !allIn[a]),
    puedeSubir: new Array<boolean>(n).fill(true),
    ultimaAccion: null,
    resultadosManos,
  };
  // Antes del flop empieza el de después de la ciega grande (con 2, el botón).
  return continuar(base, dos ? boton : siguienteVivo(eliminados, bb));
}

/** El primer asiento pendiente que puede actuar, empezando por `desde`. */
function primerPendiente(e: EstadoHoldem, desde: Asiento): Asiento | null {
  const n = e.config.jugadores;
  for (let k = 0; k < n; k++) {
    const a = (desde + k) % n;
    if (e.pendientes[a] && puedeActuar(e, a)) return a;
  }
  return null;
}

/** Tras una acción: el siguiente en hablar, la siguiente calle o el final de la mano. */
function continuar(e: EstadoHoldem, desde: Asiento): EstadoHoldem {
  const n = e.config.jugadores;
  const quedan = Array.from({ length: n }, (_, a) => a).filter((a) => enLaMano(e, a));
  if (quedan.length === 1) return ganaSinShowdown(e, quedan[0]!);
  const siguiente = primerPendiente(e, desde);
  if (siguiente !== null) return { ...e, turno: siguiente };

  // Fin de la ronda.
  const capaces = quedan.filter((a) => !e.allIn[a]).length;
  if (e.fase === 'river' || capaces <= 1) return showdown(e);
  const fase = FASES[FASES.indexOf(e.fase) + 1]!;
  const descubre = e.fase === 'preflop' ? 3 : 1;
  const nueva: EstadoHoldem = {
    ...e,
    fase,
    comunes: [...e.comunes, ...e.mazo.slice(0, descubre)],
    mazo: e.mazo.slice(descubre),
    apuestas: new Array<number>(n).fill(0),
    apuestaMaxima: 0,
    ultimaSubida: ciegasHoldem(e.numeroMano)[1],
    pendientes: Array.from({ length: n }, (_, a) => puedeActuar(e, a)),
    puedeSubir: new Array<boolean>(n).fill(true),
  };
  return continuar(nueva, siguienteVivo(e.eliminados, e.boton));
}

function ganaSinShowdown(e: EstadoHoldem, ganador: Asiento): EstadoHoldem {
  const total = e.aportado.reduce((s, x) => s + x, 0);
  const fichas = e.fichas.map((f, a) => (a === ganador ? f + total : f));
  const botes: BoteRepartidoHoldem[] = [
    { cantidad: total, participantes: [ganador], ganadores: [ganador], porGanador: [total] },
  ];
  return cerrarMano(e, fichas, botes, [], ganador, e.comunes);
}

function showdown(e: EstadoHoldem): EstadoHoldem {
  const n = e.config.jugadores;
  const faltan = 5 - e.comunes.length;
  const comunes = [...e.comunes, ...e.mazo.slice(0, faltan)];
  const enMano = Array.from({ length: n }, (_, a) => enLaMano(e, a));
  const manos = new Map(
    Array.from({ length: n }, (_, a) => a)
      .filter((a) => enMano[a])
      .map((a) => [a, mejorManoPoker([...e.manos[a]!, ...comunes])]),
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
  return cerrarMano(e, fichas, botes, ensenadas, null, comunes);
}

/** Apunta el resultado, elimina a quien se quedó sin fichas y reparte otra mano o termina. */
function cerrarMano(
  e: EstadoHoldem,
  fichas: readonly number[],
  botes: readonly BoteRepartidoHoldem[],
  ensenadas: readonly ManoEnsenadaHoldem[],
  sinShowdown: Asiento | null,
  comunes: readonly IdCarta[],
): EstadoHoldem {
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
      comunes,
      ensenadas,
      botes,
      sinShowdown,
      fichasTras: fichas,
      eliminadosTras: eliminados,
    },
  ];
  const n = e.config.jugadores;
  const cerrada: EstadoHoldem = {
    ...e,
    fichas,
    eliminados,
    eliminacion,
    comunes,
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

// ── Juego ────────────────────────────────────────────────────────────────────

export const holdem: Juego<ConfigHoldem, EstadoHoldem, AccionHoldem, VistaHoldem> = {
  id: 'holdem',

  crear(config, semilla) {
    if (![2, 3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Texas Hold’em se juega de 2 a 6 jugadores');
    }
    const limpia: ConfigHoldem = { jugadores: config.jugadores };
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
    if (terminada(e) || asiento !== e.turno || !puedeActuar(e, asiento)) return [];
    const acciones: AccionHoldem[] = [{ tipo: 'retirarse' }];
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
    const tras: EstadoHoldem = {
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
      comunes: [...e.comunes],
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      apuestas: [...e.apuestas],
      aportado: [...e.aportado],
      retirados: [...e.retirados],
      allIn: [...e.allIn],
      apuestaMaxima: e.apuestaMaxima,
      ultimaSubida: e.ultimaSubida,
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
