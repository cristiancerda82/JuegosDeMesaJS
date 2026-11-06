import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type JugadoresTreinta = 2 | 3 | 4 | 5 | 6;

/** Treinta y uno; las vidas van en la config para que las pruebas sean cortas. */
export interface ConfigTreintaYUno {
  readonly jugadores: JugadoresTreinta;
  readonly vidas: number;
}

export const CONFIG_TREINTA_Y_UNO_POR_DEFECTO: ConfigTreintaYUno = { jugadores: 4, vidas: 3 };

export type FaseTreintaYUno = 'robar' | 'descartar';

export type AccionTreintaYUno =
  | { readonly tipo: 'robar'; readonly desde: 'mazo' | 'descarte' }
  | { readonly tipo: 'plantarse' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta };

export interface ResultadoRondaTreinta {
  readonly empieza: Asiento;
  /** Quien se plantó, o `null` si se acabaron las vueltas. */
  readonly plantado: Asiento | null;
  /** Las manos enseñadas (vacía la de quien ya no tenía vidas). */
  readonly manos: readonly (readonly IdCarta[])[];
  /** El valor de cada mano (`null` si no jugaba). */
  readonly valores: readonly (number | null)[];
  readonly pierden: readonly Asiento[];
  readonly vidasTras: readonly number[];
}

export interface EstadoTreintaYUno {
  readonly config: ConfigTreintaYUno;
  readonly azar: EstadoAzar;
  readonly empieza: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** El siguiente que se roba es el primero. */
  readonly mazo: readonly IdCarta[];
  /** El último es el de arriba. */
  readonly descarte: readonly IdCarta[];
  /** Las cartas que cada uno cogió del descarte y aún tiene. */
  readonly conocidas: readonly (readonly IdCarta[])[];
  readonly fase: FaseTreintaYUno;
  readonly turno: Asiento;
  /** La carta recién cogida del descarte, que no se puede descartar en ese turno. */
  readonly cogida: IdCarta | null;
  readonly plantado: Asiento | null;
  /** Cuántos últimos turnos quedan tras plantarse alguien. */
  readonly ultimos: number;
  /** Turnos jugados en la ronda. */
  readonly turnos: number;
  readonly vidas: readonly number[];
  readonly resultadosRondas: readonly ResultadoRondaTreinta[];
}

export interface VistaTreintaYUno {
  readonly config: ConfigTreintaYUno;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  /** El valor de la mano propia (`null` sin asiento). */
  readonly valor: number | null;
  readonly cartasEnMano: readonly number[];
  readonly conocidas: readonly (readonly IdCarta[])[];
  readonly descarte: readonly IdCarta[];
  readonly enMazo: number;
  readonly fase: FaseTreintaYUno;
  readonly turno: Asiento | null;
  readonly empieza: Asiento;
  readonly cogida: IdCarta | null;
  readonly plantado: Asiento | null;
  readonly ultimos: number;
  readonly turnos: number;
  readonly vidas: readonly number[];
  /** El número de la ronda, desde 1. */
  readonly rondaNumero: number;
  readonly resultadosRondas: readonly ResultadoRondaTreinta[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_TREINTA: readonly IdCarta[] = crearBaraja('francesa52');

/** As 11, figuras 10, el resto su número. */
export function puntosCartaTreinta(c: IdCarta): number {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 11 : Math.min(v, 10);
}

export const TRES_IGUALES_TREINTA = 30.5;

/** La mayor suma de un palo, o 30,5 con tres cartas del mismo número. */
export function valorManoTreinta(mano: readonly IdCarta[]): number {
  const cartas = mano.map((c) => cartaDeId(c)!);
  if (cartas.length === 3 && cartas.every((c) => c.valor === cartas[0]!.valor)) {
    return TRES_IGUALES_TREINTA;
  }
  const porPalo = new Map<string, number>();
  mano.forEach((c, i) => {
    const palo = cartas[i]!.palo;
    porPalo.set(palo, (porPalo.get(palo) ?? 0) + puntosCartaTreinta(c));
  });
  return Math.max(0, ...porPalo.values());
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const CARTAS_EN_MANO_TREINTA = 3;
/** Vueltas sin que nadie se plante tras las que se enseñan las manos. */
export const VUELTAS_MAXIMAS_TREINTA = 8;

const conVidas = (vidas: readonly number[]) => vidas.flatMap((v, a) => (v > 0 ? [a] : []));

/** El siguiente asiento con vidas después de `a`. */
function siguienteVivo(vidas: readonly number[], a: Asiento): Asiento {
  const n = vidas.length;
  for (let k = 1; k <= n; k++) {
    const b = (a + k) % n;
    if (vidas[b]! > 0) return b;
  }
  return a;
}

const terminada = (e: Pick<EstadoTreintaYUno, 'vidas'>) => conVidas(e.vidas).length <= 1;

function nuevaRonda(
  base: Pick<EstadoTreintaYUno, 'config' | 'vidas' | 'resultadosRondas'>,
  empieza: Asiento,
  azar: EstadoAzar,
): EstadoTreintaYUno {
  const { cartas, azar: sig } = barajar(BARAJA_TREINTA, azar);
  let i = 0;
  const manos = base.vidas.map((v) => {
    if (v <= 0) return [];
    const m = cartas.slice(i, i + CARTAS_EN_MANO_TREINTA);
    i += CARTAS_EN_MANO_TREINTA;
    return m;
  });
  return {
    ...base,
    azar: sig,
    empieza,
    manos,
    descarte: [cartas[i]!],
    mazo: cartas.slice(i + 1),
    conocidas: base.vidas.map(() => []),
    fase: 'robar',
    turno: empieza,
    cogida: null,
    plantado: null,
    ultimos: 0,
    turnos: 0,
  };
}

/** Se enseñan las manos: la de menos valor pierde una vida. */
function ensenar(e: EstadoTreintaYUno): EstadoTreintaYUno {
  const vivos = conVidas(e.vidas);
  const valores = e.vidas.map((v, a) => (v > 0 ? valorManoTreinta(e.manos[a]!) : null));
  const minimo = Math.min(...vivos.map((a) => valores[a]!));
  const pierden = vivos.filter((a) => valores[a] === minimo);
  const vidasTras = e.vidas.map((v, a) => (pierden.includes(a) ? v - 1 : v));
  const resultado: ResultadoRondaTreinta = {
    empieza: e.empieza,
    plantado: e.plantado,
    manos: e.manos.map((m) => [...m]),
    valores,
    pierden,
    vidasTras,
  };
  const cerrado: EstadoTreintaYUno = {
    ...e,
    vidas: vidasTras,
    resultadosRondas: [...e.resultadosRondas, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaRonda(cerrado, siguienteVivo(vidasTras, e.empieza), e.azar);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const treintaYUno: Juego<
  ConfigTreintaYUno,
  EstadoTreintaYUno,
  AccionTreintaYUno,
  VistaTreintaYUno
> = {
  id: 'treintaYUno',

  crear(config, semilla) {
    if (![2, 3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Treinta y uno se juega de 2 a 6');
    }
    if (!Number.isInteger(config.vidas) || config.vidas < 1) {
      return error('Las vidas deben ser un entero positivo');
    }
    return ok(
      nuevaRonda(
        {
          config: { jugadores: config.jugadores, vidas: config.vidas },
          vidas: new Array<number>(config.jugadores).fill(config.vidas),
          resultadosRondas: [],
        },
        0,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'descartar') {
      return [...e.manos[asiento]!]
        .filter((c) => c !== e.cogida)
        .sort()
        .map((carta) => ({ tipo: 'descartar', carta }));
    }
    const r: AccionTreintaYUno[] = [{ tipo: 'robar', desde: 'mazo' }];
    if (e.descarte.length > 0) r.push({ tipo: 'robar', desde: 'descarte' });
    if (e.plantado === null) r.push({ tipo: 'plantarse' });
    return r;
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'robar': {
        if (accion.desde === 'descarte') {
          const carta = e.descarte.at(-1)!;
          return {
            ...e,
            manos: e.manos.map((m, a) => (a === asiento ? [...m, carta] : m)),
            descarte: e.descarte.slice(0, -1),
            conocidas: e.conocidas.map((cs, a) => (a === asiento ? [...cs, carta] : cs)),
            cogida: carta,
            fase: 'descartar',
          };
        }
        let { mazo, descarte, azar } = e;
        if (mazo.length === 0) {
          // Se baraja el descarte, salvo la de arriba, para formar un mazo nuevo.
          const r = barajar(descarte.slice(0, -1), azar);
          mazo = r.cartas;
          azar = r.azar;
          descarte = descarte.slice(-1);
        }
        return {
          ...e,
          azar,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, mazo[0]!] : m)),
          mazo: mazo.slice(1),
          descarte,
          cogida: null,
          fase: 'descartar',
        };
      }
      case 'plantarse':
        return {
          ...e,
          plantado: asiento,
          ultimos: conVidas(e.vidas).length - 1,
          turnos: e.turnos + 1,
          turno: siguienteVivo(e.vidas, asiento),
        };
      case 'descartar': {
        const r: EstadoTreintaYUno = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          descarte: [...e.descarte, accion.carta],
          conocidas: e.conocidas.map((cs, a) =>
            a === asiento ? cs.filter((c) => c !== accion.carta) : cs,
          ),
          cogida: null,
          turnos: e.turnos + 1,
          fase: 'robar',
          turno: siguienteVivo(e.vidas, asiento),
        };
        if (r.plantado !== null) {
          const ultimos = r.ultimos - 1;
          return ultimos === 0 ? ensenar({ ...r, ultimos }) : { ...r, ultimos };
        }
        const maximo = VUELTAS_MAXIMAS_TREINTA * conVidas(r.vidas).length;
        return r.turnos >= maximo ? ensenar(r) : r;
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      valor: asiento === null ? null : valorManoTreinta(e.manos[asiento]!),
      cartasEnMano: e.manos.map((m) => m.length),
      conocidas: e.conocidas.map((cs) => [...cs]),
      descarte: [...e.descarte],
      enMazo: e.mazo.length,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      empieza: e.empieza,
      cogida: e.cogida,
      plantado: e.plantado,
      ultimos: e.ultimos,
      turnos: e.turnos,
      vidas: [...e.vidas],
      rondaNumero: e.resultadosRondas.length + (terminada(e) ? 0 : 1),
      resultadosRondas: [...e.resultadosRondas],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = [...e.vidas];
    const vivos = conVidas(e.vidas);
    // Si nadie queda con vidas, ganan los que perdieron la última a la vez.
    const ganadores = vivos.length === 1 ? vivos : [...e.resultadosRondas.at(-1)!.pierden];
    if (ganadores.length === e.config.jugadores) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
