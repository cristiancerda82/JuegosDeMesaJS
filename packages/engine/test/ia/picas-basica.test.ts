import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { apuestaPicas, cartaPicas, iaPicasBasica } from '../../src/ia/picas-basica';
import { reconstruirPicas } from '../../src/ia/reconstruir/picas';
import {
  CONFIG_PICAS_POR_DEFECTO,
  paloPicas,
  picas,
  type AccionPicas,
  type VistaPicas,
} from '../../src/juegos/picas';
import { duelo, porBandos } from './duelo';

/** Una vista del asiento 0 con esta mano, en la fase dada. */
function vistaCon(miMano: IdCarta[], parcial: Partial<VistaPicas> = {}): VistaPicas {
  return {
    config: CONFIG_PICAS_POR_DEFECTO,
    asiento: 0,
    miMano,
    cartasEnMano: [miMano.length, 13, 13, 13],
    fase: 'apuesta',
    turno: 0,
    repartidor: 3,
    apuestas: [null, null, null, null],
    contratos: [0, 0],
    mesa: [],
    ultimaBaza: null,
    bazas: [0, 0, 0, 0],
    jugadas: [],
    rotas: false,
    fallos: [[], [], [], []],
    resultadosManos: [],
    puntos: [0, 0],
    sacos: [0, 0],
    ...parcial,
  };
}

describe('IA básica de Picas: apuesta', () => {
  it('cuenta ases y reyes acompañados', () => {
    const mano: IdCarta[] = [
      'corazones-1',
      'treboles-1',
      'diamantes-13',
      'diamantes-3',
      'picas-2',
      'picas-5',
      'corazones-4',
      'corazones-6',
      'treboles-3',
      'treboles-7',
      'diamantes-6',
      'diamantes-8',
      'corazones-9',
    ];
    expect(apuestaPicas(vistaCon(mano))).toBe(3);
  });

  it('Nil con una mano baja, salvo que el compañero ya lo haya dicho', () => {
    const mano: IdCarta[] = [
      'picas-2',
      'picas-6',
      'corazones-2',
      'corazones-3',
      'corazones-5',
      'corazones-8',
      'treboles-2',
      'treboles-4',
      'treboles-7',
      'diamantes-2',
      'diamantes-3',
      'diamantes-5',
      'diamantes-8',
    ];
    expect(apuestaPicas(vistaCon(mano))).toBe(0);
    expect(apuestaPicas(vistaCon(mano, { apuestas: [null, 3, 0, 4] }))).toBe(1);
  });
});

describe('IA básica de Picas: juego', () => {
  it('con contrato pendiente gana con la carta más baja que gane', () => {
    const v = vistaCon(['corazones-13', 'corazones-12', 'treboles-2'], {
      fase: 'bazas',
      apuestas: [3, 2, 3, 2],
      contratos: [6, 4],
      mesa: [{ asiento: 3, carta: 'corazones-10' }],
    });
    expect(cartaPicas(v, ['corazones-13', 'corazones-12'])).toBe('corazones-12');
  });

  it('con Nil propio juega la más alta que no gane', () => {
    const v = vistaCon(['treboles-13', 'treboles-9', 'treboles-4'], {
      fase: 'bazas',
      apuestas: [0, 2, 3, 2],
      contratos: [3, 4],
      mesa: [{ asiento: 3, carta: 'treboles-12' }],
    });
    expect(cartaPicas(v, ['treboles-13', 'treboles-9', 'treboles-4'])).toBe('treboles-9');
  });

  it('con el contrato cumplido no gana bazas', () => {
    const v = vistaCon(['diamantes-1', 'diamantes-5', 'diamantes-11'], {
      fase: 'bazas',
      apuestas: [2, 2, 1, 2],
      contratos: [3, 4],
      bazas: [2, 0, 1, 1],
      mesa: [{ asiento: 3, carta: 'diamantes-12' }],
    });
    expect(cartaPicas(v, ['diamantes-1', 'diamantes-5', 'diamantes-11'])).toBe('diamantes-11');
  });

  it('protege el Nil del compañero quitándole la baza', () => {
    const v = vistaCon(['corazones-1', 'corazones-3'], {
      fase: 'bazas',
      apuestas: [3, 2, 0, 2],
      contratos: [3, 4],
      mesa: [
        { asiento: 1, carta: 'corazones-5' },
        { asiento: 2, carta: 'corazones-10' },
        { asiento: 3, carta: 'corazones-2' },
      ],
    });
    expect(cartaPicas(v, ['corazones-1', 'corazones-3'])).toBe('corazones-1');
  });
});

describe('garantías de la IA de Picas', () => {
  const azar = aleatorio<VistaPicas, AccionPicas>();

  it('300 partidas entre IAs terminan sin acciones ilegales, y deciden en menos de 500 ms', () => {
    const r = duelo(
      picas,
      CONFIG_PICAS_POR_DEFECTO,
      iaPicasBasica,
      IAS.picas.facil,
      300,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(300);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('una pareja básica gana claramente al azar', () => {
    const r = duelo(picas, CONFIG_PICAS_POR_DEFECTO, iaPicasBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(140);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = picas.crear(CONFIG_PICAS_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = picas.vistaDe(e, 0);
    const acciones = picas.accionesLegales(e, 0);
    expect(iaPicasBasica.decidir(v, acciones, crearAzar('s'))).toEqual(
      iaPicasBasica.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('reconstrucción de Picas', () => {
  it('quien no siguió un palo no tiene cartas de ese palo', () => {
    const r = picas.crear(CONFIG_PICAS_POR_DEFECTO, 'fallos');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    for (let paso = 0; paso < 200 && e.fallos.every((f, a) => a === 0 || f.length === 0); paso++) {
      const a = e.turno;
      const d = iaPicasBasica.decidir(
        picas.vistaDe(e, a),
        picas.accionesLegales(e, a),
        crearAzar('x'),
      );
      e = picas.transicion(e, a, d.accion);
    }
    const vista = picas.vistaDe(e, 0);
    const falta = vista.fallos.findIndex((f, a) => a !== 0 && f.length > 0);
    expect(falta).toBeGreaterThan(0);
    for (let i = 0; i < 20; i++) {
      const rec = reconstruirPicas(vista, crearAzar(`rec-${i}`));
      for (const c of rec.manos[falta]!) expect(vista.fallos[falta]).not.toContain(paloPicas(c));
      expect(picas.vistaDe(rec, 0)).toEqual(vista);
    }
  });
});
