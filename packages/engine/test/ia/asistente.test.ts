import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  cartasDeAccion,
  comentar,
  explicar,
  leer,
  sugerir,
  type ContextoAsistente,
} from '../../src/ia/asistente';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_BRISCA_POR_DEFECTO,
  type AccionBrisca,
  type VistaBrisca,
} from '../../src/juegos/brisca';

// Modo asistido (spec modo-asistido): sugerencia, explicación y comentario.

const CTX_BRISCA: ContextoAsistente<VistaBrisca, AccionBrisca> = {
  base: IAS.brisca.normal,
  simulable: IAS.brisca.simulable,
};

/** Brisca de 2 armada a mano: triunfo en oros; el rival (0) ya ha salido y le toca al jugador (1). */
function vista(miMano: IdCarta[], salida: IdCarta): VistaBrisca {
  return {
    config: CONFIG_BRISCA_POR_DEFECTO,
    asiento: 1,
    miMano,
    cartasEnMano: [2, miMano.length],
    mazo: 20,
    muestra: 'oros-4',
    triunfo: 'oros',
    mesa: [{ asiento: 0, carta: salida }],
    turno: 1,
    repartidor: 1,
    bazas: [3, 3],
    ultimaBaza: null,
    puntos: [10, 10],
    jugadas: ['bastos-5', 'bastos-6', 'bastos-7', 'espadas-5', 'espadas-6', 'espadas-7'],
    resultadosManos: [],
    manosGanadas: [0, 0],
  };
}

const jugar = (carta: IdCarta): AccionBrisca => ({ tipo: 'jugar', carta });
const legalesDe = (v: VistaBrisca) => v.miMano!.map(jugar);
const AZAR = crearAzar('asistente');

describe('sugerencia', () => {
  it('es la jugada de la IA difícil, siempre legal y la misma con la misma vista y el mismo azar', () => {
    const v = vista(['copas-1', 'oros-5', 'espadas-4'], 'copas-11');
    const legales = legalesDe(v);
    const a = sugerir(IAS.brisca.dificil, v, legales, AZAR);
    expect(legales).toContainEqual(a);
    expect(a).toEqual(IAS.brisca.dificil.decidir(v, legales, AZAR).accion);
    expect(sugerir(IAS.brisca.dificil, v, legales, AZAR)).toEqual(a);
  });

  it('en la Brisca gana con el as de copas al caballo de copas', () => {
    const v = vista(['copas-1', 'oros-5', 'espadas-4'], 'copas-11');
    expect(sugerir(IAS.brisca.dificil, v, legalesDe(v), AZAR)).toEqual(jugar('copas-1'));
  });
});

describe('explicación en los juegos de bazas', () => {
  it('ganar la baza con puntos sin gastar triunfo', () => {
    const v = vista(['copas-1', 'oros-5', 'espadas-4'], 'copas-11');
    expect(explicar(CTX_BRISCA, v, legalesDe(v), jugar('copas-1'), AZAR)).toEqual({
      codigo: 'gana-baza-puntos',
      datos: { carta: 'copas-1', puntos: 14, sinTriunfo: 1 },
    });
  });

  it('si no puede ganar, entrega la carta que menos da', () => {
    const v = vista(['espadas-3', 'bastos-4'], 'copas-1');
    expect(explicar(CTX_BRISCA, v, legalesDe(v), jugar('bastos-4'), AZAR)).toEqual({
      codigo: 'entrega-poco',
      datos: { carta: 'bastos-4', puntos: 11 },
    });
  });

  it('con una sola jugada posible lo dice', () => {
    const v = vista(['bastos-4'], 'copas-1');
    expect(explicar(CTX_BRISCA, v, legalesDe(v), jugar('bastos-4'), AZAR).codigo).toBe('unica');
  });

  it('misma vista, misma explicación', () => {
    const v = vista(['copas-1', 'oros-5', 'espadas-4'], 'copas-11');
    const una = explicar(CTX_BRISCA, v, legalesDe(v), jugar('copas-1'), AZAR);
    const otra = explicar(
      CTX_BRISCA,
      JSON.parse(JSON.stringify(v)) as VistaBrisca,
      legalesDe(v),
      jugar('copas-1'),
      AZAR,
    );
    expect(otra).toEqual(una);
  });
});

describe('comentario de la jugada', () => {
  it('regalar puntos: diez puntos teniendo una carta de cero', () => {
    // Spec: el jugador no puede ganar la baza y juega 10 puntos teniendo una carta de 0.
    const v = vista(['espadas-3', 'bastos-4'], 'copas-1');
    expect(comentar(CTX_BRISCA, v, jugar('bastos-4'), jugar('espadas-3'), AZAR)).toEqual({
      codigo: 'puntos-regalados',
      datos: { carta: 'bastos-4', puntos: 10 },
    });
  });

  it('perder una baza que se podía ganar', () => {
    const v = vista(['copas-1', 'bastos-4', 'espadas-4'], 'copas-11');
    expect(comentar(CTX_BRISCA, v, jugar('copas-1'), jugar('bastos-4'), AZAR)).toEqual({
      codigo: 'baza-perdida',
      datos: { carta: 'copas-1', puntos: 14 },
    });
  });

  it('gastar triunfo cuando otra carta ganaba igual', () => {
    const v = vista(['copas-1', 'oros-5', 'espadas-4'], 'copas-11');
    expect(comentar(CTX_BRISCA, v, jugar('copas-1'), jugar('oros-5'), AZAR)?.codigo).toBe(
      'triunfo-gastado',
    );
  });

  it('una jugada distinta pero sin coste no se comenta', () => {
    const v = vista(['bastos-4', 'espadas-4'], 'copas-1');
    expect(comentar(CTX_BRISCA, v, jugar('bastos-4'), jugar('espadas-4'), AZAR)).toBeNull();
  });

  it('la misma jugada no se comenta', () => {
    const v = vista(['bastos-4', 'espadas-4'], 'copas-1');
    expect(comentar(CTX_BRISCA, v, jugar('bastos-4'), jugar('bastos-4'), AZAR)).toBeNull();
  });
});

describe('juegos de captura', () => {
  const ctx = { base: IAS.escoba.normal } as unknown as ContextoAsistente<unknown, unknown>;
  const v = { asiento: 0, mesa: ['oros-3', 'copas-4', 'oros-7'] };
  const escoba = { tipo: 'jugar', carta: 'espadas-1', captura: ['oros-3', 'copas-4', 'oros-7'] };
  const siete = { tipo: 'jugar', carta: 'espadas-8', captura: ['oros-7'] };
  const nada = { tipo: 'jugar', carta: 'bastos-2', captura: [] };
  const legales = [escoba, siete, nada];

  it('escoba, 7 de oros y dejar la carta', () => {
    expect(explicar(ctx, v, legales, escoba, AZAR)).toEqual({
      codigo: 'escoba',
      datos: { carta: 'espadas-1', n: 3 },
    });
    expect(explicar(ctx, v, legales, siete, AZAR)).toEqual({
      codigo: 'captura-siete-oros',
      datos: { carta: 'espadas-8', n: 1 },
    });
    expect(explicar(ctx, v, legales, nada, AZAR)).toEqual({
      codigo: 'sin-captura',
      datos: { carta: 'bastos-2' },
    });
  });

  it('comenta la escoba perdida', () => {
    expect(comentar(ctx, v, escoba, siete, AZAR)).toEqual({
      codigo: 'escoba-perdida',
      datos: { carta: 'espadas-1' },
    });
  });
});

describe('acciones sin carta y cartas de una acción', () => {
  it('se explican por su tipo', () => {
    const ctx = { base: IAS.sieteYMedia.normal } as unknown as ContextoAsistente<unknown, unknown>;
    const legales = [{ tipo: 'pedir' }, { tipo: 'plantarse' }];
    expect(explicar(ctx, {}, legales, legales[1], AZAR)).toEqual({
      codigo: 'accion',
      datos: { tipo: 'plantarse' },
    });
  });

  it('extrae todas las cartas de una acción, sin repetir', () => {
    const accion = {
      tipo: 'bajar',
      grupos: [['oros-1', 'oros-2'], ['triunfo-21']],
      carta: 'oros-1',
    };
    expect(cartasDeAccion(accion)).toEqual(['oros-1', 'oros-2', 'triunfo-21']);
    expect(cartasDeAccion({ tipo: 'pasar' })).toEqual([]);
  });
});

describe('lectura de las jugadas de los rivales', () => {
  it('explica la jugada con la vista del rival, como la suya', () => {
    const v = vista(['copas-1', 'oros-5', 'espadas-4'], 'copas-11');
    expect(leer(CTX_BRISCA, v, legalesDe(v), jugar('copas-1'), AZAR)).toEqual(
      explicar(CTX_BRISCA, v, legalesDe(v), jugar('copas-1'), AZAR),
    );
  });

  it('con una sola jugada posible no lo dice (delataría sus cartas), pero mide la baza', () => {
    const v = vista(['espadas-3'], 'copas-1');
    const motivo = leer(CTX_BRISCA, v, legalesDe(v), jugar('espadas-3'), AZAR);
    expect(motivo.codigo).not.toBe('unica');
    expect(motivo).toEqual({ codigo: 'entrega-poco', datos: { carta: 'espadas-3', puntos: 21 } });
  });
});
