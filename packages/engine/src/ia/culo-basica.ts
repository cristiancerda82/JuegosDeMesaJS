import type { IdCarta } from '../baraja/cartas';
import {
  compararCulo,
  gruposCulo,
  rangoCulo,
  RANGO_DOS_CULO,
  type AccionCulo,
  type VistaCulo,
} from '../juegos/culo';
import { igualesJSON } from '../motor/json';
import type { Agente } from './agente';

/** Rango del 7: lo que está por debajo es carta baja, buena para devolver. */
const RANGO_SIETE = 4;

/** La acción legal que juega exactamente estas cartas. */
function buscar(acciones: readonly AccionCulo[], accion: AccionCulo): AccionCulo {
  return acciones.find((a) => igualesJSON(a, accion)) ?? acciones[0]!;
}

/** Las cartas que devuelve: las bajas, primero las de los valores de los que tiene menos. */
export function devolucionCulo(mano: readonly IdCarta[], cuantas: number): IdCarta[] {
  const tamano = new Map<number, number>();
  for (const g of gruposCulo(mano)) tamano.set(rangoCulo(g[0]!), g.length);
  const clave = (c: IdCarta) => {
    const r = rangoCulo(c);
    return [r <= RANGO_SIETE ? tamano.get(r)! : 5, r] as const;
  };
  const elegidas = [...mano]
    .sort((a, b) => {
      const [ta, ra] = clave(a);
      const [tb, rb] = clave(b);
      return ta - tb || ra - rb || compararCulo(a, b);
    })
    .slice(0, cuantas);
  return elegidas.sort(compararCulo);
}

/** Lo que juega la básica: abrir con lo más bajo, superar sin romper y guardar los doses. */
export function jugadaCulo(vista: VistaCulo): AccionCulo {
  const grupos = gruposCulo(vista.miMano ?? []);
  const sinDoses = grupos.filter((g) => rangoCulo(g[0]!) !== RANGO_DOS_CULO);
  if (vista.mesa === null) {
    return { tipo: 'jugar', cartas: sinDoses[0] ?? grupos[0]! };
  }
  const k = vista.mesa.cartas.length;
  const minimo = rangoCulo(vista.mesa.cartas[0]!);
  const superan = grupos.filter((g) => rangoCulo(g[0]!) > minimo && g.length >= k);
  const normales = superan.filter((g) => rangoCulo(g[0]!) !== RANGO_DOS_CULO);
  const justo = normales.find((g) => g.length === k);
  if (justo) return { tipo: 'jugar', cartas: justo };
  if (normales[0]) return { tipo: 'jugar', cartas: normales[0].slice(0, k) };
  const doses = superan.find((g) => rangoCulo(g[0]!) === RANGO_DOS_CULO);
  // Corta solo si después le quedan, como mucho, dos valores distintos.
  if (doses && grupos.length - (doses.length === k ? 1 : 0) <= 2) {
    return { tipo: 'jugar', cartas: doses.slice(0, k) };
  }
  return { tipo: 'pasar' };
}

/** IA básica del Culo (spec ia-jugadores). */
export const iaCuloBasica: Agente<VistaCulo, AccionCulo> = {
  id: 'culo-basica',
  decidir(vista, acciones, azar) {
    if (vista.fase === 'intercambio') {
      const k = acciones[0]!.tipo === 'devolver' ? acciones[0]!.cartas.length : 0;
      const cartas = devolucionCulo(vista.miMano ?? [], k);
      return { accion: buscar(acciones, { tipo: 'devolver', cartas }), azar };
    }
    return { accion: buscar(acciones, jugadaCulo(vista)), azar };
  },
};
