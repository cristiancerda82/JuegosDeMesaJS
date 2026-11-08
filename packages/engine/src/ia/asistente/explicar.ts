import { Generador, type EstadoAzar } from '../../baraja/azar';
import { cartaDeId, type IdCarta } from '../../baraja/cartas';
import type { Asiento } from '../../motor/contrato';
import { igualesJSON } from '../../motor/json';
import type { Agente } from '../agente';
import type { Simulable, Simulacion } from '../niveles';
import { cartaJugada, cartasDeAccion } from './cartas';

/**
 * Explicaciones del modo asistido (spec modo-asistido; design, decisiones 3 y 4). Un motivo es
 * un código con sus datos: el cliente lo convierte en una frase. Todo lo que dice un motivo es
 * un hecho de la jugada en esa situación, medido sobre la vista del jugador y, cuando depende de
 * cartas que no ve, sobre reconstrucciones de esas cartas, como hace la IA difícil.
 */

export type CodigoMotivo =
  /** Es la única acción posible. */
  | 'unica'
  /** Gana la baza y se lleva puntos (`puntos`); `sinTriunfo` si no gasta triunfo pudiendo. */
  | 'gana-baza-puntos'
  | 'gana-baza'
  /** Nadie puede ganar la baza con lo que tiene: entrega la carta que menos puntos da (`puntos`). */
  | 'entrega-poco'
  /** Podría ganar la baza, pero conviene guardar la carta buena. */
  | 'guarda-carta'
  /** Juegos de bazas a evitar: se escapa de la baza. */
  | 'evita-baza'
  /** Juegos de bazas a evitar: gana la baza, pero sin castigo. */
  | 'gana-sin-castigo'
  /** Captura: se lleva todo lo de la mesa (`n` cartas). */
  | 'escoba'
  /** Captura: se lleva el 7 de oros. */
  | 'captura-siete-oros'
  /** Captura: se lleva `n` cartas de la mesa. */
  | 'captura'
  /** Captura: no recoge; deja la carta en la mesa. */
  | 'sin-captura'
  /** Una acción que no es jugar una carta (`tipo`): pasar, pedir, envidar, robar… */
  | 'accion'
  /**
   * La IA difícil la probó en `total` repartos posibles de las cartas que no se ven y salió
   * mejor (o igual) que las demás en `ganadas`.
   */
  | 'mejor-simulada'
  /** Sin un motivo concreto que contar: solo qué jugada conviene. */
  | 'jugada';

export type CodigoComentario =
  /** Ha dado `puntos` más al rival de los que daba `carta`. */
  | 'puntos-regalados'
  /** Ha perdido una baza que `carta` ganaba. */
  | 'baza-perdida'
  /** Ha gastado un triunfo cuando `carta` ganaba igual sin gastarlo. */
  | 'triunfo-gastado'
  /** Bazas a evitar: se ha llevado `puntos` de castigo que `carta` evitaba. */
  | 'castigo-evitable'
  /** Captura: `carta` hacía escoba. */
  | 'escoba-perdida'
  /** Captura: `carta` recogía `n` cartas más. */
  | 'captura-menor'
  /** En `peores` de `total` repartos posibles de las cartas ocultas, salió peor que la sugerida. */
  | 'peor-simulada';

export interface Motivo<C extends string = CodigoMotivo> {
  readonly codigo: C;
  readonly datos: Readonly<Record<string, string | number>>;
}

/** Lo que el asistente sabe de un juego para explicar sus jugadas. */
export interface ContextoAsistente<V, A> {
  /** IA que juega los demás asientos en las simulaciones (la normal). */
  readonly base: Agente<V, A>;
  /** Reconstrucción y reglas del juego; sin él, solo se explica lo que se ve. */
  readonly simulable?: Simulable<unknown, unknown, A, V> | undefined;
  /**
   * Juego de bazas en el que se gana evitando bazas o cartas (Corazones…); en los de contratos
   * (Barbu, Rentz) depende del contrato en juego.
   */
  readonly evitar?: boolean | ((vista: V) => boolean) | undefined;
  /** Las bazas se juegan por parejas fijas (0 y 2 contra 1 y 3). */
  readonly parejas?: boolean | undefined;
}

/** Reconstrucciones de las cartas ocultas para medir una baza: fijo, para que sea reproducible. */
const RECONSTRUCCIONES = 8;
/** Pasos como máximo hasta que se cierra la baza en curso. */
const PASOS_BAZA = 40;
/** «Gana la baza» si la gana al menos en esta parte de las reconstrucciones; «la pierde», por debajo de la otra. */
const SEGURO = 0.75;
const PIERDE = 0.3;
/** Diferencia de puntos mínima para comentar que se han regalado. */
const UMBRAL_PUNTOS = 2;

interface VistaGeneral {
  readonly asiento?: Asiento | null;
  readonly mesa?: unknown;
  readonly bazas?: unknown;
  readonly triunfo?: unknown;
  readonly ultimaBaza?: { readonly ganador?: Asiento } | null;
  readonly [campo: string]: unknown;
}

const numeros = (x: unknown): readonly number[] | null =>
  Array.isArray(x) && x.every((n) => typeof n === 'number') ? (x as number[]) : null;
const suma = (xs: readonly number[]) => xs.reduce((s, n) => s + n, 0);

/**
 * Los puntos que llevan las bazas de la mano, en el campo que use cada juego: `puntosBazas`
 * (Belote, Skat…), `puntosCartas` (Tysiącha), `puntosMano` (Corazones, Barbu…) o `puntos`.
 */
function puntosDe(v: VistaGeneral): readonly number[] | null {
  for (const campo of ['puntosBazas', 'puntosCartas', 'puntosMano', 'puntos']) {
    const xs = numeros(v[campo]);
    if (xs !== null) return xs;
  }
  return null;
}

/** Quién ganó la última baza: `ultimaBaza` o, si el juego guarda todas, la última de `bazas`. */
function ganadorUltima(v: VistaGeneral): Asiento | null {
  if (v.ultimaBaza?.ganador !== undefined) return v.ultimaBaza.ganador;
  const ultima: unknown = Array.isArray(v.bazas) ? v.bazas.at(-1) : undefined;
  const ganador = (ultima as { readonly ganador?: unknown } | undefined)?.ganador;
  return typeof ganador === 'number' ? ganador : null;
}

const mesaVacia = (v: VistaGeneral) => Array.isArray(v.mesa) && v.mesa.length === 0;

function azarDe(g: Generador): EstadoAzar {
  return [g.siguiente(), g.siguiente(), g.siguiente(), g.siguiente() | 1];
}

// ── Bazas ────────────────────────────────────────────────────────────────────

/** Cómo le va a una carta en la baza en curso, de media en las reconstrucciones. */
const evita = <V, A>(ctx: ContextoAsistente<V, A>, vista: V) =>
  typeof ctx.evitar === 'function' ? ctx.evitar(vista) : (ctx.evitar ?? false);

interface EnBaza {
  /** Parte de las reconstrucciones en que la baza es de su bando. */
  readonly gana: number;
  /** Puntos de la baza que se lleva su bando (en los juegos a evitar, el castigo). */
  readonly ganados: number;
  /** Puntos de la baza que se llevan los rivales. */
  readonly entregados: number;
}

/**
 * Es un juego de bazas: la mesa es la baza en curso (`{ asiento, carta }`) y la vista dice quién
 * ganó la última baza.
 */
function esDeBazas(vista: VistaGeneral): boolean {
  const mesa = vista.mesa;
  return (
    Array.isArray(mesa) &&
    mesa.every((j) => typeof j === 'object' && j !== null && 'carta' in j) &&
    ('ultimaBaza' in vista || Array.isArray(vista.bazas))
  );
}

/** Se juega `accion` y el resto de la baza con `base`: de quién es y cuántos puntos lleva. */
function jugarBaza<V, A>(
  ctx: ContextoAsistente<V, A>,
  s: Simulable<unknown, unknown, A, V>,
  estado: unknown,
  asiento: Asiento,
  accion: A,
  azar: EstadoAzar,
): { readonly mia: boolean; readonly puntos: number } | null {
  const { juego } = s;
  const antes = juego.vistaDe(estado, asiento) as VistaGeneral;
  const puntosAntes = puntosDe(antes);
  let e = juego.transicion(estado, asiento, accion);
  let a = azar;
  for (let paso = 0; paso <= PASOS_BAZA; paso++) {
    // La mano acabó con esta baza: ya no se ve en la vista de quién fue.
    if (juego.resultado(e) !== null || s.manoTerminada(estado, e)) return null;
    const v = juego.vistaDe(e, asiento) as VistaGeneral;
    // La baza se cierra cuando la mesa vuelve a quedar vacía.
    if (mesaVacia(v)) {
      const ganador = ganadorUltima(v);
      if (ganador === null) return null;
      const mia = ctx.parejas ? ganador % 2 === asiento % 2 : ganador === asiento;
      const puntos = puntosDe(v);
      const delta = puntos && puntosAntes ? suma(puntos) - suma(puntosAntes) : 0;
      return { mia, puntos: Math.max(0, delta) };
    }
    let turno = -1;
    let acciones: readonly A[] = [];
    for (let i = 0; i < juego.asientos(e) && turno === -1; i++) {
      acciones = juego.accionesLegales(e, i);
      if (acciones.length > 0) turno = i;
    }
    if (turno === -1) return null;
    const d = ctx.base.decidir(juego.vistaDe(e, turno), acciones, a);
    a = d.azar;
    e = juego.transicion(e, turno, d.accion);
  }
  return null;
}

/** Mide en la baza en curso cada una de `acciones` (con las mismas reconstrucciones para todas). */
function medirBaza<V, A>(
  ctx: ContextoAsistente<V, A>,
  vista: V,
  acciones: readonly A[],
  azar: EstadoAzar,
): (EnBaza | null)[] {
  const s = ctx.simulable;
  const asiento = (vista as VistaGeneral).asiento;
  if (!s || asiento === null || asiento === undefined) return acciones.map(() => null);
  const g = new Generador(azar);
  const resultados = acciones.map(() => ({ n: 0, gana: 0, ganados: 0, entregados: 0 }));
  for (let r = 0; r < RECONSTRUCCIONES; r++) {
    const azarReconstruccion = azarDe(g);
    const azarSimulacion = azarDe(g);
    let estado: unknown;
    try {
      estado = s.reconstruir(vista, azarReconstruccion);
    } catch {
      continue;
    }
    acciones.forEach((accion, i) => {
      try {
        const baza = jugarBaza(ctx, s, estado, asiento, accion, azarSimulacion);
        if (baza === null) return;
        const x = resultados[i]!;
        x.n++;
        if (baza.mia) {
          x.gana++;
          x.ganados += baza.puntos;
        } else {
          x.entregados += baza.puntos;
        }
      } catch {
        // Una reconstrucción imposible no cuenta.
      }
    });
  }
  return resultados.map((x) =>
    x.n === 0
      ? null
      : { gana: x.gana / x.n, ganados: x.ganados / x.n, entregados: x.entregados / x.n },
  );
}

const paloDe = (c: IdCarta) => cartaDeId(c)?.palo ?? null;
const esTriunfo = (vista: VistaGeneral, c: IdCarta | null) =>
  c !== null && typeof vista.triunfo === 'string' && paloDe(c) === vista.triunfo;

/** Las acciones que juegan una carta, sin repetir la de `accion`, con `accion` la primera. */
function jugadasDeCarta<A>(legales: readonly A[], ...primeras: A[]): A[] {
  const otras = legales.filter(
    (a) => cartaJugada(a) !== null && !primeras.some((p) => igualesJSON(p, a)),
  );
  return [...primeras, ...otras];
}

function explicarBaza<V, A>(
  ctx: ContextoAsistente<V, A>,
  vista: V,
  legales: readonly A[],
  accion: A,
  azar: EstadoAzar,
): Motivo | null {
  const carta = cartaJugada(accion)!;
  const acciones = jugadasDeCarta(legales, accion);
  const medidas = medirBaza(ctx, vista, acciones, azar);
  const propia = medidas[0];
  if (!propia) return null;
  const otras = medidas.slice(1).filter((m): m is EnBaza => m !== null);
  const v = vista as VistaGeneral;

  if (evita(ctx, vista)) {
    if (propia.gana <= PIERDE) return { codigo: 'evita-baza', datos: { carta } };
    // Sin castigo, solo si el juego cuenta los puntos de cada baza en la vista.
    if (propia.gana >= SEGURO && propia.ganados === 0 && puntosDe(v) !== null) {
      return { codigo: 'gana-sin-castigo', datos: { carta } };
    }
    return null;
  }

  if (propia.gana >= SEGURO) {
    // No gasta triunfo si otra carta de triunfo también ganaba.
    const triunfoQueGana = acciones
      .slice(1)
      .some((a, i) => esTriunfo(v, cartaJugada(a)) && (medidas[i + 1]?.gana ?? 0) >= SEGURO);
    const sinTriunfo = !esTriunfo(v, carta) && triunfoQueGana ? 1 : 0;
    const puntos = Math.round(propia.ganados);
    return puntos > 0
      ? { codigo: 'gana-baza-puntos', datos: { carta, puntos, sinTriunfo } }
      : { codigo: 'gana-baza', datos: { carta, sinTriunfo } };
  }
  const mejorGana = Math.max(propia.gana, ...otras.map((m) => m.gana));
  if (mejorGana < 0.5) {
    const menos = Math.min(propia.entregados, ...otras.map((m) => m.entregados));
    if (propia.entregados <= menos + 0.5) {
      return { codigo: 'entrega-poco', datos: { carta, puntos: Math.round(propia.entregados) } };
    }
    return null;
  }
  if (mejorGana >= SEGURO) return { codigo: 'guarda-carta', datos: { carta } };
  return null;
}

function comentarBaza<V, A>(
  ctx: ContextoAsistente<V, A>,
  vista: V,
  sugerida: A,
  hecha: A,
  azar: EstadoAzar,
): Motivo<CodigoComentario> | null {
  const [s, h] = medirBaza(ctx, vista, [sugerida, hecha], azar);
  if (!s || !h) return null;
  const carta = cartaJugada(sugerida)!;
  const v = vista as VistaGeneral;
  if (evita(ctx, vista)) {
    const castigo = h.ganados - s.ganados;
    return castigo >= 1
      ? { codigo: 'castigo-evitable', datos: { carta, puntos: Math.round(castigo) } }
      : null;
  }
  if (s.gana >= SEGURO && h.gana <= PIERDE) {
    return { codigo: 'baza-perdida', datos: { carta, puntos: Math.round(s.ganados) } };
  }
  const regalados = h.entregados - s.entregados;
  if (regalados >= UMBRAL_PUNTOS) {
    return { codigo: 'puntos-regalados', datos: { carta, puntos: Math.round(regalados) } };
  }
  if (
    s.gana >= SEGURO &&
    h.gana >= SEGURO &&
    esTriunfo(v, cartaJugada(hecha)) &&
    !esTriunfo(v, carta)
  ) {
    return { codigo: 'triunfo-gastado', datos: { carta } };
  }
  return null;
}

// ── Captura ──────────────────────────────────────────────────────────────────

/** Juegos de captura con la recogida en la acción (`{ carta, captura }`): Escoba, Scopa… */
function capturaDe(
  vista: VistaGeneral,
  accion: unknown,
): { carta: IdCarta; n: number; limpia: boolean; sieteOros: boolean } | null {
  const carta = cartaJugada(accion);
  const captura = (accion as { readonly captura?: unknown }).captura;
  if (carta === null || !Array.isArray(captura) || !Array.isArray(vista.mesa)) return null;
  const enMesa = cartasDeAccion(vista.mesa);
  const recogidas = cartasDeAccion(captura).filter((c) => enMesa.includes(c));
  return {
    carta,
    n: recogidas.length,
    limpia: recogidas.length > 0 && recogidas.length === enMesa.length,
    sieteOros: recogidas.includes('oros-7') || (recogidas.length > 0 && carta === 'oros-7'),
  };
}

function explicarCaptura(vista: VistaGeneral, accion: unknown): Motivo | null {
  const c = capturaDe(vista, accion);
  if (c === null) return null;
  const { carta, n } = c;
  if (n === 0) return { codigo: 'sin-captura', datos: { carta } };
  if (c.limpia) return { codigo: 'escoba', datos: { carta, n } };
  if (c.sieteOros) return { codigo: 'captura-siete-oros', datos: { carta, n } };
  return { codigo: 'captura', datos: { carta, n } };
}

function comentarCaptura(
  vista: VistaGeneral,
  sugerida: unknown,
  hecha: unknown,
): Motivo<CodigoComentario> | null {
  const s = capturaDe(vista, sugerida);
  const h = capturaDe(vista, hecha);
  if (s === null || h === null) return null;
  if (s.limpia && !h.limpia) return { codigo: 'escoba-perdida', datos: { carta: s.carta } };
  if (s.n - h.n >= 2) return { codigo: 'captura-menor', datos: { carta: s.carta, n: s.n - h.n } };
  return null;
}

// ── Entrada ──────────────────────────────────────────────────────────────────

/**
 * Motivo de una acción sin más contexto: su tipo, la primera carta que nombra y su detalle (el
 * primer dato sencillo que no es una carta: las bazas que apuesta, el palo que elige…).
 */
function porTipo(accion: unknown): Motivo {
  const tipo = (accion as { readonly tipo?: unknown } | null)?.tipo;
  const carta = cartasDeAccion(accion)[0];
  const datos: Record<string, string | number> = {};
  if (carta !== undefined) datos['carta'] = carta;
  if (accion !== null && typeof accion === 'object') {
    const detalle = Object.entries(accion).find(
      ([k, x]) =>
        k !== 'tipo' &&
        (typeof x === 'number' || (typeof x === 'string' && cartasDeAccion(x).length === 0)),
    );
    if (detalle) datos['detalle'] = detalle[1] as string | number;
  }
  if (typeof tipo === 'string') return { codigo: 'accion', datos: { ...datos, tipo } };
  return { codigo: 'jugada', datos };
}

// ── Lo que simuló la IA difícil ──────────────────────────────────────────────

/** Mínimo de repartos simulados para contar algo de ellos. */
const REPARTOS_MINIMOS = 4;
/** Parte de los repartos que tiene que salir a favor para decirlo. */
const MAYORIA = 0.6;
const EPSILON = 1e-9;

function columna<A>(sim: Simulacion<A> | undefined, accion: A): number {
  return sim ? sim.simuladas.findIndex((a) => igualesJSON(a, accion)) : -1;
}

/** En cuántos repartos `accion` salió mejor o igual que todas las demás simuladas. */
function mejorSimulada<A>(sim: Simulacion<A> | undefined, accion: A): Motivo | null {
  const i = columna(sim, accion);
  if (!sim || i === -1 || sim.simuladas.length < 2 || sim.valores.length < REPARTOS_MINIMOS) {
    return null;
  }
  const ganadas = sim.valores.filter((fila) =>
    fila.every((x, j) => j === i || fila[i]! >= x - EPSILON),
  ).length;
  const total = sim.valores.length;
  return ganadas / total >= MAYORIA
    ? { codigo: 'mejor-simulada', datos: { ganadas, total } }
    : null;
}

/** En cuántos repartos `hecha` salió peor que `sugerida`, si es claramente peor de media. */
function peorSimulada<A>(
  sim: Simulacion<A> | undefined,
  sugerida: A,
  hecha: A,
): Motivo<CodigoComentario> | null {
  const s = columna(sim, sugerida);
  const h = columna(sim, hecha);
  if (!sim || s === -1 || h === -1 || sim.valores.length < REPARTOS_MINIMOS) return null;
  const diferencias = sim.valores.map((fila) => fila[s]! - fila[h]!);
  const media = diferencias.reduce((t, d) => t + d, 0) / diferencias.length;
  const peores = diferencias.filter((d) => d > EPSILON).length;
  const total = diferencias.length;
  return media > 0 && peores / total >= 0.7
    ? { codigo: 'peor-simulada', datos: { peores, total } }
    : null;
}

// ── Entrada ──────────────────────────────────────────────────────────────────

/**
 * Por qué conviene `accion` (la sugerida) en esta situación. `simulacion` es lo que midió la IA
 * difícil al elegirla: si no hay un hecho más concreto que contar, se cuenta eso.
 */
export function explicar<V, A>(
  ctx: ContextoAsistente<V, A>,
  vista: V,
  legales: readonly A[],
  accion: A,
  azar: EstadoAzar,
  simulacion?: Simulacion<A>,
): Motivo {
  const base = porTipo(accion);
  if (legales.length === 1) return { codigo: 'unica', datos: base.datos };
  const v = vista as VistaGeneral;
  const deBazas = cartaJugada(accion) !== null && esDeBazas(v);
  const concreto = deBazas
    ? explicarBaza(ctx, vista, legales, accion, azar)
    : explicarCaptura(v, accion);
  if (concreto) return concreto;
  const simulada = mejorSimulada(simulacion, accion);
  if (simulada) return { codigo: simulada.codigo, datos: { ...base.datos, ...simulada.datos } };
  return deBazas ? { codigo: 'jugada', datos: base.datos } : base;
}

/**
 * Qué ha costado jugar `hecha` en lugar de `sugerida`, con la vista de antes de jugar; `null` si
 * no hay un coste concreto que señalar (el asistente no regaña por jugar distinto a la IA).
 */
export function comentar<V, A>(
  ctx: ContextoAsistente<V, A>,
  vista: V,
  sugerida: A,
  hecha: A,
  azar: EstadoAzar,
  simulacion?: Simulacion<A>,
): Motivo<CodigoComentario> | null {
  if (igualesJSON(sugerida, hecha)) return null;
  const v = vista as VistaGeneral;
  const concreto =
    cartaJugada(sugerida) !== null && cartaJugada(hecha) !== null && esDeBazas(v)
      ? comentarBaza(ctx, vista, sugerida, hecha, azar)
      : comentarCaptura(v, sugerida, hecha);
  return concreto ?? peorSimulada(simulacion, sugerida, hecha);
}
