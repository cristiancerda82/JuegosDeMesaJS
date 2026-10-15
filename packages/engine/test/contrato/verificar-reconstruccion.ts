import { describe, expect, it } from 'vitest';
import { crearAzar, Generador, type EstadoAzar } from '../../src/baraja/azar';
import type { Agente } from '../../src/ia/agente';
import type { Juego } from '../../src/motor/contrato';
import { igualesJSON } from '../../src/motor/json';

export interface OpcionesReconstruccion<C, V, A> {
  readonly configs: readonly C[];
  /** IA con la que se comprueba que el estado reconstruido se puede jugar hasta el final. */
  readonly base: Agente<V, A>;
  /** Partidas al azar por configuración. Por defecto 6. */
  readonly partidas?: number;
  /** Jugadas máximas por partida al azar. Por defecto 300. */
  readonly pasosMaximos?: number;
  /** Cada cuántos estados se juega uno reconstruido hasta el final. Por defecto 25. */
  readonly cadaN?: number;
  /** Jugadas máximas desde un estado reconstruido. Por defecto 3.000. */
  readonly pasosFinales?: number;
}

/** Juega con `agente` en todos los asientos hasta que termina la partida o se agotan los pasos. */
// (Basta con que siga siendo jugable: cada paso valida que la acción elegida es legal.)
function jugarHastaElFin<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  estado: E,
  agente: Agente<V, A>,
  azar: EstadoAzar,
  pasos: number,
): E {
  let e = estado;
  let a = azar;
  for (let paso = 0; paso < pasos && juego.resultado(e) === null; paso++) {
    const asientos = Array.from({ length: juego.asientos(e) }, (_, i) => i);
    const asiento = asientos.find((i) => juego.accionesLegales(e, i).length > 0);
    if (asiento === undefined) throw new Error('Estado reconstruido sin acciones legales');
    const acciones = juego.accionesLegales(e, asiento);
    const d = agente.decidir(juego.vistaDe(e, asiento), acciones, a);
    if (!acciones.some((x) => igualesJSON(x, d.accion))) throw new Error('Acción ilegal');
    a = d.azar;
    e = juego.transicion(e, asiento, d.accion);
  }
  return e;
}

/**
 * Comprueba la reconstrucción de las cartas ocultas de un juego (spec niveles-ia): en estados
 * alcanzados al azar, el estado reconstruido desde la vista de cada asiento da la misma vista,
 * las mismas acciones legales y se puede seguir jugando.
 */
export function describirReconstruccion<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  reconstruir: (vista: V, azar: EstadoAzar) => E,
  opciones: OpcionesReconstruccion<C, V, A>,
): void {
  const {
    configs,
    base,
    partidas = 6,
    pasosMaximos = 300,
    cadaN = 25,
    pasosFinales = 3_000,
  } = opciones;

  describe(`reconstrucción de ${juego.id}`, () => {
    it('da la misma vista y las mismas acciones legales, y se puede seguir jugando', () => {
      let revisados = 0;
      configs.forEach((config, c) => {
        for (let p = 0; p < partidas; p++) {
          const semilla = `reconstruir-${c}-${p}`;
          const creado = juego.crear(config, semilla);
          if (!creado.ok) throw new Error(creado.error);
          let e = creado.valor;
          const elegir = new Generador(crearAzar(`${semilla}/elegir`));
          for (let paso = 0; paso < pasosMaximos && juego.resultado(e) === null; paso++) {
            for (let asiento = 0; asiento < juego.asientos(e); asiento++) {
              const vista = juego.vistaDe(e, asiento);
              const r = reconstruir(vista, crearAzar(`${semilla}/${paso}/${asiento}`));
              expect(juego.vistaDe(r, asiento)).toEqual(vista);
              expect(juego.accionesLegales(r, asiento)).toEqual(juego.accionesLegales(e, asiento));
              if (revisados++ % cadaN === 0) {
                jugarHastaElFin(juego, r, base, crearAzar(`${semilla}/fin/${paso}`), pasosFinales);
              }
            }
            const conAcciones = Array.from({ length: juego.asientos(e) }, (_, i) => i).filter(
              (i) => juego.accionesLegales(e, i).length > 0,
            );
            const asiento = conAcciones[elegir.enteroHasta(conAcciones.length)]!;
            const acciones = juego.accionesLegales(e, asiento);
            e = juego.transicion(e, asiento, acciones[elegir.enteroHasta(acciones.length)]!);
          }
        }
      });
    });

    it('con otro azar, las cartas ocultas pueden cambiar de sitio', () => {
      const creado = juego.crear(configs[0]!, 'reconstruir-azar');
      if (!creado.ok) throw new Error(creado.error);
      const vista = juego.vistaDe(creado.valor, 0);
      const distintos = new Set(
        Array.from({ length: 6 }, (_, i) =>
          JSON.stringify(reconstruir(vista, crearAzar(`azar-${i}`))),
        ),
      );
      expect(distintos.size).toBeGreaterThan(1);
    });
  });
}
