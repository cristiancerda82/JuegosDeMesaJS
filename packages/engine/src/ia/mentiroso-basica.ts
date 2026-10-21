import { Generador, type EstadoAzar } from '../baraja/azar';
import type { IdCarta } from '../baraja/cartas';
import {
  MAXIMO_BAJADA_MENTIROSO,
  valorMentiroso,
  type AccionMentiroso,
  type VistaMentiroso,
} from '../juegos/mentiroso';
import type { Agente } from './agente';

/**
 * IAs del Mentiroso. Las dos deciden al empezar su turno si desconfían y qué cartas bajan, y
 * después las marcan una a una hasta bajar. La básica dice la verdad cuando puede y miente con
 * una carta si no; la experta además recuerda lo que ha visto y mezcla faroles.
 */

/** Cuántas veces de cada valor hay en la baraja. */
const COPIAS = 4;

const deValor = (cartas: readonly IdCarta[], v: number) =>
  cartas.filter((c) => valorMentiroso(c) === v).length;

/**
 * Turnos (contando desde el siguiente propio) hasta que a este asiento le toque declarar `v`;
 * `Infinity` si nunca le toca. Cada vuelta de la mesa avanza el valor en `n`.
 */
function turnosHasta(v: number, valorAhora: number, n: number): number {
  for (let k = 1; k <= 13; k++) {
    if (((valorAhora - 1 + k * n) % 13) + 1 === v) return k;
  }
  return Infinity;
}

/** La carta que menos falta le hace: la del valor que más tarde le tocará declarar. */
function cartaParaMentir(vista: VistaMentiroso, excluir: readonly IdCarta[] = []): IdCarta {
  const mano = (vista.miMano ?? []).filter((c) => !excluir.includes(c));
  const n = vista.config.jugadores;
  return [...mano].sort(
    (a, b) =>
      turnosHasta(valorMentiroso(b), vista.valor, n) -
        turnosHasta(valorMentiroso(a), vista.valor, n) || a.localeCompare(b),
  )[0]!;
}

/**
 * Las cartas que se bajan: las del valor (verdad) o una para mentir, y si el montón tiene como
 * mucho `montonMax` cartas, se rellena con cartas falsas hasta `objetivo`: si alguien desconfía,
 * llevarse un montón pequeño cuesta poco, y así la mano se vacía antes.
 */
export function planMentiroso(
  vista: VistaMentiroso,
  objetivo: number,
  montonMax: number,
): IdCarta[] {
  const mano = vista.miMano ?? [];
  const buenas = mano.filter((c) => valorMentiroso(c) === vista.valor);
  const plan =
    buenas.length > 0 ? buenas.slice(0, MAXIMO_BAJADA_MENTIROSO) : [cartaParaMentir(vista)];
  if (vista.monton > montonMax) return plan;
  // No se rellena hasta vaciar la mano: la última bajada se desconfía siempre.
  while (plan.length < objetivo && mano.length > plan.length + 1) {
    plan.push(cartaParaMentir(vista, plan));
  }
  return plan;
}

/** Una acción que acerca las marcadas al plan: desmarcar lo que sobra, marcar lo que falta, bajar. */
function haciaElPlan(vista: VistaMentiroso, plan: readonly IdCarta[]): AccionMentiroso {
  const sobra = vista.marcadas.find((c) => !plan.includes(c));
  if (sobra) return { tipo: 'desmarcar', carta: sobra };
  const falta = plan.find((c) => !vista.marcadas.includes(c));
  if (falta) return { tipo: 'marcar', carta: falta };
  return { tipo: 'bajar' };
}

/** Una tirada entre 0 y 1 con el azar del agente. */
function tirada(azar: EstadoAzar): { valor: number; azar: EstadoAzar } {
  const g = new Generador(azar);
  return { valor: g.siguiente() / 2 ** 32, azar: g.estado() };
}

/** La última bajada y lo que tiene este asiento de su valor. */
function ultimaBajada(vista: VistaMentiroso) {
  const ultima = vista.bajadas.at(-1)!;
  return { ultima, mias: deValor(vista.miMano ?? [], ultima.valor) };
}

/** Combinaciones de `k` entre `n`. */
function combinaciones(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

/**
 * Probabilidad de que quien bajó tuviera de verdad `declaradas` cartas del valor: entre las
 * `desconocidas` cartas que este asiento no ve hay `quedan` de ese valor, y quien bajó tenía
 * `enMano` cartas (hipergeométrica: al menos `declaradas` de ellas).
 */
export function probabilidadVerdad(
  declaradas: number,
  quedan: number,
  desconocidas: number,
  enMano: number,
): number {
  if (declaradas > quedan) return 0;
  const total = combinaciones(desconocidas, enMano);
  let p = 0;
  for (let k = declaradas; k <= Math.min(quedan, enMano); k++) {
    p += (combinaciones(quedan, k) * combinaciones(desconocidas - quedan, enMano - k)) / total;
  }
  return Math.min(1, p);
}

/**
 * Probabilidad de desconfiar: crece cuanto menos probable es que diga la verdad. Con un montón
 * grande se desconfía algo menos, porque equivocarse cuesta más.
 */
export function probabilidadDesconfiar(pVerdad: number, monton: number): number {
  return (1 - pVerdad) * (monton > 6 ? 0.75 : 0.9);
}

interface Estrategia {
  readonly id: string;
  /** Si desconfía de la última bajada, dada una tirada entre 0 y 1. */
  desconfia(vista: VistaMentiroso, t: number): boolean;
  /** Las cartas que bajará en este turno. */
  plan(vista: VistaMentiroso): IdCarta[];
}

function agente(e: Estrategia): Agente<VistaMentiroso, AccionMentiroso> {
  return {
    id: e.id,
    decidir(vista, acciones, azar) {
      if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
      const puede = (tipo: AccionMentiroso['tipo']) => acciones.some((a) => a.tipo === tipo);
      // El anterior se quedó sin cartas: creerle es perder, así que se desconfía siempre.
      if (puede('creer')) return { accion: { tipo: 'desconfiar' }, azar };
      if (puede('desconfiar')) {
        const t = tirada(azar);
        if (e.desconfia(vista, t.valor)) return { accion: { tipo: 'desconfiar' }, azar: t.azar };
        return { accion: haciaElPlan(vista, e.plan(vista)), azar: t.azar };
      }
      return { accion: haciaElPlan(vista, e.plan(vista)), azar };
    },
  };
}

// ── Niveles ──────────────────────────────────────────────────────────────────

/**
 * Cartas de valor `v` que seguro no tiene quien bajó: las propias, las que este asiento dejó
 * en el montón y las descubiertas que se llevó otro jugador que aún no ha bajado desde entonces.
 */
export function fueraDelQueBaja(vista: VistaMentiroso, v: number, quienBaja: number): number {
  let fuera = deValor(vista.miMano ?? [], v) + deValor(vista.misCartasEnMonton, v);
  const ultima = vista.revelaciones.at(-1);
  if (ultima && ultima.seLleva !== quienBaja && ultima.seLleva !== vista.asiento) {
    const haBajado = vista.bajadas.some((b) => b.asiento === ultima.seLleva);
    if (!haBajado) fuera += deValor(ultima.cartas, v);
  }
  return fuera;
}

/** Cómo juega cada nivel. */
export interface ParametrosMentiroso {
  readonly id: string;
  /** Si recuerda las cartas que dejó en el montón y las descubiertas que tiene otro. */
  readonly memoria: boolean;
  /** Cartas que intenta bajar, rellenando con falsas, con un montón de hasta `montonMax`. */
  readonly objetivo: number;
  readonly montonMax: number;
}

export function iaMentiroso(p: ParametrosMentiroso): Agente<VistaMentiroso, AccionMentiroso> {
  return agente({
    id: p.id,
    desconfia(vista, t) {
      const { ultima, mias } = ultimaBajada(vista);
      const fuera = p.memoria ? fueraDelQueBaja(vista, ultima.valor, ultima.asiento) : mias;
      if (ultima.cuantas + fuera > COPIAS) return true;
      // Las cartas vistas no las puede tener quien bajó.
      const vistas =
        (vista.miMano ?? []).length +
        (p.memoria
          ? vista.misCartasEnMonton.length +
            (fuera - mias - deValor(vista.misCartasEnMonton, ultima.valor))
          : 0);
      const enMano = vista.cartasEnMano[ultima.asiento]! + ultima.cuantas;
      const pv = probabilidadVerdad(ultima.cuantas, COPIAS - fuera, 52 - vistas, enMano);
      return t < probabilidadDesconfiar(pv, vista.monton);
    },
    plan: (vista) => planMentiroso(vista, p.objetivo, p.montonMax),
  });
}

/** Parámetros de la básica: sin memoria, y con el montón de hasta 6 cartas rellena hasta 3. */
export const PARAMETROS_MENTIROSO_BASICA: ParametrosMentiroso = {
  id: 'mentiroso-basica',
  memoria: false,
  objetivo: 3,
  montonMax: 6,
};

/**
 * La básica: baja la verdad (o una carta si no la tiene) y, con el montón pequeño, rellena con
 * falsas: así gana a quien no desconfía.
 */
export const iaMentirosoBasica = iaMentiroso(PARAMETROS_MENTIROSO_BASICA);

/**
 * La experta (difícil): baja solo la verdad, o una carta si no la tiene, y desconfía con lo que
 * recuerda. Contra quien rellena con falsas, desconfiar bien y no arriesgar es lo que gana
 * (con 4 jugadores, unas 160 de 200 partidas contra la básica).
 */
export const iaMentirosoExperta = iaMentiroso({
  id: 'mentiroso-experta',
  memoria: true,
  objetivo: 1,
  montonMax: 0,
});
