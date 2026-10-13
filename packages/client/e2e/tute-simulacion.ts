import {
  aplicar,
  iaTuteBasica,
  PALOS_ESPANOLES,
  tute,
  crearAzar,
  type AccionTute,
  type ConfigTute,
  type Cante,
  type IdCarta,
} from '@juegos/engine';

/**
 * Política del jugador humano en los tests E2E del Tute. La UI la reproduce paso a paso:
 * canta el tute o el primer cante que pueda; si no, juega la primera carta jugable que no sea
 * de una pareja aún cantable (o la primera, si no queda otra). Nunca cambia el 7.
 */
export function eleccionHumana(
  mano: readonly IdCarta[],
  jugables: readonly IdCarta[],
  cantados: readonly string[],
): IdCarta {
  const pareja = new Set<IdCarta>();
  for (const palo of PALOS_ESPANOLES) {
    const rey: IdCarta = `${palo}-12`;
    const caballo: IdCarta = `${palo}-11`;
    if (!cantados.includes(palo) && mano.includes(rey) && mano.includes(caballo)) {
      pareja.add(rey);
      pareja.add(caballo);
    }
  }
  return jugables.find((c) => !pareja.has(c)) ?? jugables[0]!;
}

export interface Simulacion {
  /** Cantes de la primera mano, con el número de acción en que ocurrieron. */
  readonly cantes: readonly (Cante & { readonly accion: number })[];
}

/**
 * Juega con el motor la misma partida que jugará la UI: el humano (asiento 0) con
 * `eleccionHumana` y el resto con la IA básica, que es determinista.
 */
export function simularTute(config: ConfigTute, semilla: string): Simulacion {
  const creado = tute.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const cantes: (Cante & { accion: number })[] = [];
  for (let paso = 0; tute.resultado(e) === null && e.resultadosManos.length === 0; paso++) {
    const a = e.turno;
    const legales = tute.accionesLegales(e, a);
    let accion: AccionTute;
    if (a === 0) {
      accion = legales.find((x) => x.tipo === 'cantarTute') ??
        legales.find((x) => x.tipo === 'cantar') ?? {
          tipo: 'jugar',
          carta: eleccionHumana(
            e.manos[0]!,
            legales.flatMap((x) => (x.tipo === 'jugar' ? [x.carta] : [])),
            e.cantes.map((c) => c.palo),
          ),
        };
    } else {
      accion = iaTuteBasica.decidir(tute.vistaDe(e, a), legales, crearAzar('x')).accion;
    }
    const r = aplicar(tute, e, a, accion);
    if (!r.ok) throw new Error(r.error);
    if (r.valor.cantes.length > e.cantes.length) {
      cantes.push({ ...r.valor.cantes.at(-1)!, accion: paso });
    }
    e = r.valor;
  }
  return { cantes };
}
