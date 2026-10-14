import {
  aplicar,
  baseSpider,
  CONFIG_SPIDER_POR_DEFECTO,
  spider,
  type AccionSpider,
  type ConfigSpider,
  type EstadoSpider,
} from '@juegos/engine';

const valor = (c: string) => Number(baseSpider(c as never).split('-')[1]);
const palo = (c: string) => baseSpider(c as never).split('-')[0];

/**
 * Política voraz y determinista para los tests: alarga escaleras del mismo palo, destapa
 * cartas y, si no hay nada útil, reparte. Devuelve las acciones hasta que se cumple `meta`.
 */
export function jugarVoraz(
  semilla: string,
  meta: (e: EstadoSpider) => boolean,
  config: ConfigSpider = CONFIG_SPIDER_POR_DEFECTO,
  limite = 400,
): AccionSpider[] | null {
  const r = spider.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  let e = r.valor;
  const acciones: AccionSpider[] = [];
  const vistos = new Set<string>();
  while (acciones.length < limite && spider.resultado(e) === null) {
    if (meta(e)) return acciones;
    vistos.add(JSON.stringify(e.columnas));
    let mejor: { accion: AccionSpider; puntos: number } | null = null;
    for (const a of spider.accionesLegales(e, 0)) {
      if (a.tipo !== 'mover') continue;
      const origen = e.columnas[a.desde]!;
      const destino = e.columnas[a.hasta]!;
      const primera = origen.visibles.at(-a.cantidad)!;
      const debajo = origen.visibles.at(-a.cantidad - 1);
      const tope = destino.visibles.at(-1);
      const sueltaDebajo = debajo === undefined || valor(debajo) !== valor(primera) + 1;
      const mismoPaloDestino = tope !== undefined && palo(tope) === palo(primera);
      const mismoPaloDebajo =
        debajo !== undefined && !sueltaDebajo && palo(debajo) === palo(primera);
      if (!sueltaDebajo && !(mismoPaloDestino && !mismoPaloDebajo)) continue;
      if (tope === undefined && a.cantidad < origen.visibles.length) continue;
      let puntos = a.cantidad;
      if (mismoPaloDestino) puntos += 5;
      if (a.cantidad === origen.visibles.length && origen.ocultas.length > 0) puntos += 3;
      if (tope === undefined) puntos -= 2;
      const siguiente = spider.transicion(e, 0, a);
      if (vistos.has(JSON.stringify(siguiente.columnas))) continue;
      if (mejor === null || puntos > mejor.puntos) mejor = { accion: a, puntos };
    }
    const accion: AccionSpider | null =
      mejor?.accion ??
      (spider.accionesLegales(e, 0).some((a) => a.tipo === 'repartir')
        ? { tipo: 'repartir' }
        : null);
    if (accion === null) return null;
    const paso = aplicar(spider, e, 0, accion);
    if (!paso.ok) throw new Error(paso.error);
    e = paso.valor;
    acciones.push(accion);
  }
  return meta(e) ? acciones : null;
}
