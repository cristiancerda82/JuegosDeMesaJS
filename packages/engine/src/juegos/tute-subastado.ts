import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import {
  cartaGanadora,
  cartasObligadas,
  puntosDe,
  siguiente,
  valorDe,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { palosCantables, tieneTute, type Cante } from './tute';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const MANOS_TUTE_SUBASTADO = [4, 8, 12] as const;

export interface ConfigTuteSubastado {
  /** Manos que dura la partida (las que se juegan; si todos pasan, no cuenta). */
  readonly manos: (typeof MANOS_TUTE_SUBASTADO)[number];
  /** Variante: 3 jugadores con 12 cartas sin los doses. Sin ella, 4. */
  readonly jugadores?: 3 | 4;
}

export const CONFIG_TUTE_SUBASTADO_POR_DEFECTO: ConfigTuteSubastado = { manos: 8, jugadores: 4 };

/** Puja mínima (con 4; con 3, 70), máxima y salto entre pujas. */
export const PUJA_MINIMA_SUBASTADO = 60;
export const PUJA_MINIMA_SUBASTADO_TRES = 70;
export const PUJA_MAXIMA_SUBASTADO = 230;
export const SALTO_PUJA_SUBASTADO = 10;
/** Puntos de las bazas de una mano, con las 10 de últimas. */
export const PUNTOS_MANO_TUTE = 130;

const DIEZ_DE_ULTIMAS = 10;
const DOS = 2;

/** Jugadores de la partida: 3 con la variante, 4 si no (también en las partidas guardadas). */
export function jugadoresSubastado(config: ConfigTuteSubastado): 3 | 4 {
  return config.jugadores === 3 ? 3 : 4;
}

/** La baraja de la partida: las 40 cartas, o las 36 sin los doses con 3 jugadores. */
export function barajaTuteSubastado(config: ConfigTuteSubastado): IdCarta[] {
  const baraja = crearBaraja('espanola40');
  return jugadoresSubastado(config) === 3 ? baraja.filter((c) => valorDe(c) !== DOS) : baraja;
}

/** La primera puja posible: 60 con 4 jugadores y 70 con 3. */
export function pujaMinimaSubastado(config: ConfigTuteSubastado): number {
  return jugadoresSubastado(config) === 3 ? PUJA_MINIMA_SUBASTADO_TRES : PUJA_MINIMA_SUBASTADO;
}

export type FaseTuteSubastado = 'subasta' | 'triunfo' | 'bazas';

/** Lo último que dijo cada uno en la subasta: su puja, `'paso'`, o `null` si aún no habló. */
export type DichoSubasta = number | 'paso' | null;

export interface ResultadoManoTuteSubastado {
  readonly repartidor: Asiento;
  readonly pujador: Asiento;
  readonly puja: number;
  readonly triunfo: PaloEspanol;
  /** Puntos del pujador y de los defensores: bazas, cantes y 10 de últimas. */
  readonly puntosPujador: number;
  readonly puntosDefensores: number;
  readonly cumple: boolean;
  /** Quien cantó el tute, si la mano acabó así. */
  readonly tute: Asiento | null;
  /** Fichas que ganó (positivo) o perdió (negativo) cada uno. */
  readonly cambio: readonly number[];
  readonly fichasTras: readonly number[];
}

interface Baza {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface EstadoTuteSubastado {
  readonly config: ConfigTuteSubastado;
  readonly azar: EstadoAzar;
  /** Manos ya jugadas (las que cuentan). */
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: FaseTuteSubastado;
  readonly turno: Asiento;
  readonly dichos: readonly DichoSubasta[];
  /** Puja vigente y quién la hizo; tras la subasta, el pujador. */
  readonly puja: number | null;
  readonly pujador: Asiento | null;
  /** La mano anterior se repartió de nuevo porque pasaron los cuatro. */
  readonly todosPasaron: boolean;
  readonly triunfo: PaloEspanol | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazasMano: readonly Baza[];
  /** Puntos de las bazas ganadas por cada asiento en la mano, con las 10 de últimas. */
  readonly puntos: readonly number[];
  readonly bazas: readonly number[];
  readonly cantes: readonly Cante[];
  /** Quien ganó la última baza y aún puede cantar. */
  readonly puedeCantar: Asiento | null;
  readonly fichas: readonly number[];
  readonly resultadosManos: readonly ResultadoManoTuteSubastado[];
  /** La última baza jugada, aunque sea de la mano anterior: se ve mientras se recoge. */
  readonly ultimaBaza: Baza | null;
}

export type AccionTuteSubastado =
  | { readonly tipo: 'pujar'; readonly puntos: number }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'triunfo'; readonly palo: PaloEspanol }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'cantar'; readonly palo: PaloEspanol }
  | { readonly tipo: 'cantarTute' };

export interface VistaTuteSubastado {
  readonly config: ConfigTuteSubastado;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  /** El primero en hablar en la subasta. */
  readonly mano: Asiento;
  readonly fase: FaseTuteSubastado;
  readonly turno: Asiento | null;
  readonly dichos: readonly DichoSubasta[];
  readonly puja: number | null;
  readonly pujador: Asiento | null;
  readonly todosPasaron: boolean;
  readonly triunfo: PaloEspanol | null;
  readonly mesa: readonly CartaJugada[];
  /** Las bazas de la mano, a la vista de todos cuando se jugaron. */
  readonly bazasMano: readonly Baza[];
  readonly puntos: readonly number[];
  readonly bazas: readonly number[];
  readonly cantes: readonly Cante[];
  readonly puedeCantar: Asiento | null;
  readonly fichas: readonly number[];
  readonly numeroMano: number;
  readonly resultadosManos: readonly ResultadoManoTuteSubastado[];
  readonly ultimaBaza: Baza | null;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const partidaTerminada = (e: EstadoTuteSubastado) => e.numeroMano >= e.config.manos;

/** Pujas posibles ahora: de la mínima (o la vigente más 10) a 230, de 10 en 10. */
export function pujasSubastado(puja: number | null, minima = PUJA_MINIMA_SUBASTADO): number[] {
  const desde = puja === null ? minima : puja + SALTO_PUJA_SUBASTADO;
  const pujas: number[] = [];
  for (let p = desde; p <= PUJA_MAXIMA_SUBASTADO; p += SALTO_PUJA_SUBASTADO) pujas.push(p);
  return pujas;
}

/** Puntos del pujador y de los defensores: bazas (con las últimas) y cantes. */
export function puntosTuteSubastado(
  e: Pick<EstadoTuteSubastado, 'puntos' | 'cantes'>,
  pujador: Asiento,
): { pujador: number; defensores: number } {
  let p = 0;
  let d = 0;
  e.puntos.forEach((x, a) => (a === pujador ? (p += x) : (d += x)));
  for (const c of e.cantes) {
    if (c.asiento === pujador) p += c.puntos;
    else d += c.puntos;
  }
  return { pujador: p, defensores: d };
}

/** Reparte una mano nueva con `repartidor`: toda la baraja (10 o 12 cartas cada uno) y la subasta. */
function nuevaMano(
  base: Pick<
    EstadoTuteSubastado,
    'config' | 'azar' | 'numeroMano' | 'repartidor' | 'fichas' | 'resultadosManos' | 'ultimaBaza'
  >,
  todosPasaron: boolean,
): EstadoTuteSubastado {
  const n = jugadoresSubastado(base.config);
  const { cartas, azar } = barajar(barajaTuteSubastado(base.config), base.azar);
  const reparto = repartir(cartas, new Array<number>(n).fill(cartas.length / n));
  if (!reparto.ok) throw new Error(reparto.error);
  const mano = siguiente(base.repartidor, n);
  const manos = Array.from({ length: n }, (_, a) => reparto.valor.manos[(a - mano + n) % n]!);
  return {
    ...base,
    azar,
    manos,
    fase: 'subasta',
    turno: mano,
    dichos: new Array<DichoSubasta>(n).fill(null),
    puja: null,
    pujador: null,
    todosPasaron,
    triunfo: null,
    mesa: [],
    bazasMano: [],
    puntos: new Array<number>(n).fill(0),
    bazas: new Array<number>(n).fill(0),
    cantes: [],
    puedeCantar: null,
  };
}

/** Cierra la mano: cumple o falla el pujador, cobro en fichas, y la mano siguiente o el fin. */
function cerrarMano(e: EstadoTuteSubastado, tute: Asiento | null): EstadoTuteSubastado {
  const pujador = e.pujador!;
  const puja = e.puja!;
  const { pujador: puntosPujador, defensores: puntosDefensores } = puntosTuteSubastado(e, pujador);
  const cumple = tute !== null ? tute === pujador : puntosPujador >= puja;
  const valor = (cumple ? 1 : -1) * (puja / SALTO_PUJA_SUBASTADO);
  // El pujador cobra de cada defensor, o le paga: 3 con 4 jugadores, 2 con 3.
  const defensores = e.fichas.length - 1;
  const cambio = e.fichas.map((_, a) => (a === pujador ? defensores * valor : -valor));
  const fichas = e.fichas.map((f, a) => f + cambio[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      pujador,
      puja,
      triunfo: e.triunfo!,
      puntosPujador,
      puntosDefensores,
      cumple,
      tute,
      cambio,
      fichasTras: fichas,
    },
  ];
  const cerrado: EstadoTuteSubastado = {
    ...e,
    numeroMano: e.numeroMano + 1,
    fichas,
    resultadosManos,
    puedeCantar: null,
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    { ...cerrado, repartidor: siguiente(e.repartidor, jugadoresSubastado(e.config)) },
    false,
  );
}

function resolverBaza(e: EstadoTuteSubastado): EstadoTuteSubastado {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  const baza = { cartas: e.mesa, ganador };
  const ultima = e.manos.every((m) => m.length === 0);
  const valor =
    e.mesa.reduce((suma, j) => suma + puntosDe(j.carta), 0) + (ultima ? DIEZ_DE_ULTIMAS : 0);
  const resuelto: EstadoTuteSubastado = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasMano: [...e.bazasMano, baza],
    puntos: e.puntos.map((p, a) => (a === ganador ? p + valor : p)),
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    puedeCantar: ganador,
    ultimaBaza: baza,
  };
  return ultima ? cerrarMano(resuelto, null) : resuelto;
}

/** Tras pujar o pasar: sigue la subasta, gana el pujador, o se reparte otra vez. */
function trasHablar(e: EstadoTuteSubastado, asiento: Asiento): EstadoTuteSubastado {
  const n = jugadoresSubastado(e.config);
  const quedan = e.dichos.flatMap((d, a) => (d === 'paso' ? [] : [a]));
  if (quedan.length === 0) {
    return nuevaMano({ ...e, repartidor: siguiente(e.repartidor, n) }, true);
  }
  if (quedan.length === 1 && e.puja !== null) {
    return { ...e, fase: 'triunfo', turno: e.pujador! };
  }
  let turno = siguiente(asiento, n);
  while (e.dichos[turno] === 'paso') turno = siguiente(turno, n);
  return { ...e, turno };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const tuteSubastado: Juego<
  ConfigTuteSubastado,
  EstadoTuteSubastado,
  AccionTuteSubastado,
  VistaTuteSubastado
> = {
  id: 'tute-subastado',

  crear(config, semilla) {
    if (!(MANOS_TUTE_SUBASTADO as readonly number[]).includes(config.manos)) {
      return error('La partida de Tute subastado dura 4, 8 o 12 manos');
    }
    if (config.jugadores !== undefined && config.jugadores !== 3 && config.jugadores !== 4) {
      return error('El Tute subastado es de 3 o 4 jugadores');
    }
    const limpia: ConfigTuteSubastado = {
      manos: config.manos,
      jugadores: jugadoresSubastado(config),
    };
    const n = jugadoresSubastado(limpia);
    // Empieza repartiendo el último asiento, así es mano el asiento 0.
    return ok(
      nuevaMano(
        {
          config: limpia,
          azar: crearAzar(semilla),
          numeroMano: 0,
          repartidor: n - 1,
          fichas: new Array<number>(n).fill(0),
          resultadosManos: [],
          ultimaBaza: null,
        },
        false,
      ),
    );
  },

  asientos: (e) => jugadoresSubastado(e.config),

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'subasta':
        return [
          { tipo: 'pasar' },
          ...pujasSubastado(e.puja, pujaMinimaSubastado(e.config)).map((puntos) => ({
            tipo: 'pujar' as const,
            puntos,
          })),
        ];
      case 'triunfo':
        return PALOS_ESPANOLES.map((palo) => ({ tipo: 'triunfo' as const, palo }));
      case 'bazas': {
        const acciones: AccionTuteSubastado[] = [];
        if (e.puedeCantar === asiento && e.mesa.length === 0) {
          // Con 3 jugadores no hay tute: con 12 cartas no tiene objeto.
          if (jugadoresSubastado(e.config) === 4 && tieneTute(e.manos[asiento]!)) {
            acciones.push({ tipo: 'cantarTute' });
          }
          for (const palo of palosCantables(e, asiento)) acciones.push({ tipo: 'cantar', palo });
        }
        const jugables = cartasObligadas(e.manos[asiento]!, e.mesa, e.triunfo, {
          asiento,
          montarSobreCompanero: true,
        });
        for (const carta of jugables) acciones.push({ tipo: 'jugar', carta });
        return acciones;
      }
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pujar':
        return trasHablar(
          {
            ...e,
            dichos: e.dichos.map((d, a) => (a === asiento ? accion.puntos : d)),
            puja: accion.puntos,
            pujador: asiento,
            todosPasaron: false,
          },
          asiento,
        );
      case 'pasar':
        return trasHablar(
          {
            ...e,
            dichos: e.dichos.map((d, a) => (a === asiento ? 'paso' : d)),
            todosPasaron: false,
          },
          asiento,
        );
      case 'triunfo':
        return { ...e, triunfo: accion.palo, fase: 'bazas', turno: asiento };
      case 'cantar': {
        const puntos = accion.palo === e.triunfo ? 40 : 20;
        return {
          ...e,
          cantes: [...e.cantes, { asiento, palo: accion.palo, puntos }],
          puedeCantar: null,
        };
      }
      case 'cantarTute':
        return cerrarMano(e, asiento);
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoTuteSubastado = { ...e, manos, mesa, puedeCantar: null };
        const n = jugadoresSubastado(e.config);
        return mesa.length < n ? { ...jugado, turno: siguiente(asiento, n) } : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      mano: siguiente(e.repartidor, jugadoresSubastado(e.config)),
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      dichos: [...e.dichos],
      puja: e.puja,
      pujador: e.pujador,
      todosPasaron: e.todosPasaron,
      triunfo: e.triunfo,
      mesa: [...e.mesa],
      bazasMano: [...e.bazasMano],
      puntos: [...e.puntos],
      bazas: [...e.bazas],
      cantes: [...e.cantes],
      puedeCantar: e.puedeCantar,
      fichas: [...e.fichas],
      numeroMano: e.numeroMano,
      resultadosManos: [...e.resultadosManos],
      ultimaBaza: e.ultimaBaza,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const maximo = Math.max(...e.fichas);
    const ganadores = e.fichas.flatMap((f, a) => (f === maximo ? [a] : []));
    const puntos = [...e.fichas];
    if (ganadores.length === e.fichas.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
