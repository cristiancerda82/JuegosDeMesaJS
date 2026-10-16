import { Generador, type EstadoAzar } from '../baraja/azar';
import type { Asiento, Juego } from '../motor/contrato';
import { igualesJSON } from '../motor/json';
import type { Agente } from './agente';

/** Nivel de la IA que elige el jugador. `normal` es la IA básica de cada juego. */
export type NivelIA = 'facil' | 'normal' | 'dificil';
export const NIVELES_IA: readonly NivelIA[] = ['facil', 'normal', 'dificil'];

/** Un estado de azar nuevo sacado de un generador. */
function azarDe(g: Generador): EstadoAzar {
  return [g.siguiente(), g.siguiente(), g.siguiente(), g.siguiente() | 1];
}

/**
 * Nivel fácil: decide como `base` salvo en una parte (`prob`) de sus decisiones, en las que
 * elige al azar entre las acciones legales que `puedeFallar` permite (todas si no se indica).
 */
export function conErrores<V, A>(
  base: Agente<V, A>,
  prob: number,
  puedeFallar?: (accion: A) => boolean,
): Agente<V, A> {
  return {
    id: `${base.id}-facil`,
    decidir(vista, acciones, azar) {
      if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
      const g = new Generador(azar);
      const falla = g.siguiente() / 2 ** 32 < prob;
      const candidatas = puedeFallar ? acciones.filter(puedeFallar) : acciones;
      if (falla && candidatas.length > 0) {
        const accion = candidatas[g.enteroHasta(candidatas.length)]!;
        return { accion, azar: g.estado() };
      }
      return base.decidir(vista, acciones, g.estado());
    },
  };
}

/** Lo propio de cada juego para que la IA difícil pueda simular. */
export interface Simulable<C, E, A, V> {
  readonly juego: Juego<C, E, A, V>;
  /** Un estado completo coherente con la vista: las cartas que no se ven, repartidas al azar. */
  reconstruir(vista: V, azar: EstadoAzar): E;
  /** La mano que estaba en juego en `inicio` ha terminado en `estado`. */
  manoTerminada(inicio: E, estado: E): boolean;
  /** Lo bueno que es para `asiento` cómo ha ido la mano de `inicio` a `final`. */
  valorar(inicio: E, final: E, asiento: Asiento): number;
  /** Reconstrucciones por decisión, como máximo: fijo, para que sea reproducible. */
  readonly reconstrucciones: number;
  /**
   * Partidas simuladas por decisión, como máximo (reconstrucciones × acciones). Con muchas
   * acciones se hacen menos reconstrucciones; si no llegan a 2, decide la IA base.
   */
  readonly presupuesto: number;
  /** Jugadas simuladas como máximo tras la acción; sin él, hasta el fin de la mano. */
  readonly horizonte?: number;
  /**
   * Situaciones en las que no se simula y decide la IA base. Sirve para las apuestas: al
   * repartir las cartas ocultas al azar, la simulación no ve que el rival acepta justo cuando
   * tiene buena mano, y sobrevalora envidar.
   */
  decideLaBase?(vista: V): boolean;
}

/** Menos reconstrucciones que estas por acción no dan información: decide la base. */
const RECONSTRUCCIONES_MINIMAS = 2;

/** Salvaguarda: pasos máximos de una partida simulada. */
const PASOS_MAXIMOS = 2_000;

/** Juega con `base` en todos los asientos hasta el fin de la mano (o de la partida). */
function simular<C, E, A, V>(
  s: Simulable<C, E, A, V>,
  base: Agente<V, A>,
  inicio: E,
  estado: E,
  azar: EstadoAzar,
): E {
  const { juego } = s;
  let e = estado;
  let a = azar;
  for (let paso = 0; paso < (s.horizonte ?? PASOS_MAXIMOS); paso++) {
    if (juego.resultado(e) !== null || s.manoTerminada(inicio, e)) break;
    let asiento = -1;
    let acciones: readonly A[] = [];
    for (let i = 0; i < juego.asientos(e) && asiento === -1; i++) {
      acciones = juego.accionesLegales(e, i);
      if (acciones.length > 0) asiento = i;
    }
    if (asiento === -1) break;
    const d = base.decidir(juego.vistaDe(e, asiento), acciones, a);
    a = d.azar;
    e = juego.transicion(e, asiento, d.accion);
  }
  return e;
}

/**
 * Con qué seguridad tiene que ganar una acción a la de la base para cambiarla: la ventaja
 * media, en número de errores típicos.
 */
const SEGURIDAD = 1.5;

/**
 * La acción que elegir a la vista de las simulaciones: la de mayor ventaja media sobre la de la
 * base, pero solo si esa ventaja es clara. Las diferencias se miden por parejas (la misma
 * reconstrucción para las dos acciones), y con pocas simulaciones y mucho azar elegir sin más la
 * de mejor media escoge a menudo una acción que solo tuvo suerte.
 */
function mejorQueLaBase(valores: readonly (readonly number[])[], deBase: number): number {
  const n = valores.length;
  if (n < RECONSTRUCCIONES_MINIMAS) return deBase;
  let mejor = deBase;
  let mejorMedia = 0;
  for (let i = 0; i < valores[0]!.length; i++) {
    if (i === deBase) continue;
    const diferencias = valores.map((v) => v[i]! - v[deBase]!);
    const media = diferencias.reduce((s, d) => s + d, 0) / n;
    const varianza = diferencias.reduce((s, d) => s + (d - media) ** 2, 0) / (n - 1);
    const errorTipico = Math.sqrt(varianza / n);
    const clara = media > 0 && (errorTipico === 0 || media / errorTipico > SEGURIDAD);
    if (clara && media > mejorMedia) {
      mejor = i;
      mejorMedia = media;
    }
  }
  return mejor;
}

/**
 * Nivel difícil: reconstruye varias veces las cartas ocultas y, en cada reconstrucción,
 * prueba cada acción legal jugando el resto de la mano con `base`. Se aparta de lo que haría
 * `base` solo cuando otra acción le gana claramente.
 */
export function porSimulacion<C, E, A, V extends { readonly asiento: Asiento | null }>(
  base: Agente<V, A>,
  s: Simulable<C, E, A, V>,
): Agente<V, A> {
  return {
    id: `${base.id}-dificil`,
    decidir(vista, acciones, azar) {
      if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
      const normal = base.decidir(vista, acciones, azar);
      const asiento = vista.asiento;
      const reconstrucciones = Math.min(
        s.reconstrucciones,
        Math.floor(s.presupuesto / acciones.length),
      );
      if (acciones.length === 1 || asiento === null) return normal;
      if (reconstrucciones < RECONSTRUCCIONES_MINIMAS || s.decideLaBase?.(vista)) return normal;
      const g = new Generador(normal.azar);
      /** Valor de cada acción en cada reconstrucción que se pudo jugar. */
      const valores: number[][] = [];
      for (let r = 0; r < reconstrucciones; r++) {
        const estado = s.reconstruir(vista, azarDe(g));
        const azarSimulacion = azarDe(g);
        // Una reconstrucción que no se pueda jugar hasta el final no cuenta: la IA no debe
        // romper la partida por una suposición imposible sobre las cartas ocultas.
        try {
          valores.push(
            acciones.map((accion) => {
              const tras = s.juego.transicion(estado, asiento, accion);
              return s.valorar(estado, simular(s, base, estado, tras, azarSimulacion), asiento);
            }),
          );
        } catch {
          continue;
        }
      }
      const deBase = Math.max(
        0,
        acciones.findIndex((a) => igualesJSON(a, normal.accion)),
      );
      const mejor = mejorQueLaBase(valores, deBase);
      return { accion: acciones[mejor]!, azar: g.estado() };
    },
  };
}
