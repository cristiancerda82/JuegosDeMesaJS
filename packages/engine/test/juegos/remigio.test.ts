import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import {
  CONFIG_REMIGIO_POR_DEFECTO,
  remigio,
  type AccionRemigio,
  type ConfigRemigio,
  type EstadoRemigio,
} from '../../src/juegos/remigio';
import {
  anadidosRemigio,
  bajadasRemigio,
  cambiosRemigio,
  cartasRemigio,
  posicionRemigio,
  puntosCartaRemigio,
  type CartaRemigio,
  type CombinacionRemigio,
} from '../../src/juegos/remigio-combinaciones';
import { planesRemigio } from '../../src/juegos/remigio-plan';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigRemigio> = {}, semilla = 'r'): EstadoRemigio {
  const r = remigio.crear({ ...CONFIG_REMIGIO_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoRemigio, accion: AccionRemigio): EstadoRemigio {
  const r = aplicar(remigio, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Estado de 2 jugadores en la fase de bajar del asiento 0, con las manos dadas. */
function enBajar(manos: CartaRemigio[][], parcial: Partial<EstadoRemigio> = {}): EstadoRemigio {
  return {
    ...nueva({ jugadores: manos.length as 2 | 3 | 4 | 5 }),
    azar: crearAzar('mesa'),
    manos,
    fase: 'bajar',
    turno: 0,
    ...parcial,
  };
}

const tiene = (e: EstadoRemigio, accion: AccionRemigio) =>
  remigio.accionesLegales(e, e.turno).some((a) => JSON.stringify(a) === JSON.stringify(accion));

// ── Cartas y combinaciones ───────────────────────────────────────────────────

describe('cartas', () => {
  it('84 cartas: dos barajas de 40 y 4 comodines', () => {
    const cartas = cartasRemigio();
    expect(cartas).toHaveLength(84);
    expect(new Set(cartas).size).toBe(84);
    expect(cartas.filter((c) => c.startsWith('comodin'))).toHaveLength(4);
  });

  it('el 7 y la Sota son seguidos; puntos', () => {
    expect(posicionRemigio('copas-10#0') - posicionRemigio('copas-7#0')).toBe(1);
    expect(puntosCartaRemigio('oros-5#0')).toBe(5);
    expect(puntosCartaRemigio('oros-12#1')).toBe(10);
    expect(puntosCartaRemigio('comodin-1#0')).toBe(25);
  });
});

describe('combinaciones', () => {
  it('escalera que cruza del 7 a la Sota', () => {
    const b = bajadasRemigio(['copas-6#0', 'copas-7#0', 'copas-10#0']);
    expect(b).toContainEqual({
      tipo: 'escalera',
      palo: 'copas',
      desde: 6,
      puestos: ['copas-6#0', 'copas-7#0', 'copas-10#0'],
    });
  });

  it('grupo con palo repetido no vale', () => {
    expect(bajadasRemigio(['oros-5#0', 'oros-5#1', 'copas-5#0'])).toEqual([]);
    expect(bajadasRemigio(['oros-5#0', 'espadas-5#1', 'copas-5#0'])).toHaveLength(1);
  });

  it('comodín en el puesto del 4', () => {
    const b = bajadasRemigio(['bastos-3#0', 'comodin-1#0', 'bastos-5#0']);
    expect(b).toContainEqual({
      tipo: 'escalera',
      palo: 'bastos',
      desde: 3,
      puestos: ['bastos-3#0', 'comodin-1#0', 'bastos-5#0'],
    });
  });

  it('añadir a un grupo solo un palo que falte, hasta 4', () => {
    const grupo: CombinacionRemigio = {
      tipo: 'grupo',
      id: 0,
      duenio: 1,
      numero: 5,
      cartas: ['oros-5#0', 'copas-5#0', 'espadas-5#0'],
    };
    const a = anadidosRemigio(['oros-5#1', 'bastos-5#0'], [grupo]);
    expect(a).toEqual([{ tipo: 'anadir', combinacion: 0, carta: 'bastos-5#0' }]);
    const lleno = { ...grupo, cartas: [...grupo.cartas, 'bastos-5#1' as CartaRemigio] };
    expect(anadidosRemigio(['comodin-1#0'], [lleno])).toEqual([]);
  });

  it('cambiar un comodín de una escalera', () => {
    const escalera: CombinacionRemigio = {
      tipo: 'escalera',
      id: 3,
      duenio: 1,
      palo: 'bastos',
      desde: 3,
      puestos: ['bastos-3#0', 'comodin-1#0', 'bastos-5#0'],
    };
    expect(cambiosRemigio(['bastos-4#1'], [escalera])).toEqual([
      { tipo: 'cambiar', combinacion: 3, carta: 'bastos-4#1' },
    ]);
  });

  it('planes para bajar una escalera de 5 con comodín', () => {
    const mano: CartaRemigio[] = [
      'oros-4#0',
      'oros-5#0',
      'comodin-2#0',
      'oros-7#0',
      'oros-10#0',
      'copas-1#0',
    ];
    const planes = planesRemigio(mano, [], mano.slice(0, 5), { id: 0, duenio: 0 });
    expect(planes).toHaveLength(1);
    expect(planes[0]!.combinacion).toMatchObject({ tipo: 'escalera', desde: 4 });
    expect(
      planesRemigio(mano, [], ['oros-4#0', 'copas-1#0', 'oros-10#0'], { id: 0, duenio: 0 }),
    ).toEqual([]);
  });
});

// ── Reparto y turno ──────────────────────────────────────────────────────────

describe('reparto y turno', () => {
  it('con 3 jugadores: 7 cartas, 1 en el montón, 62 en el mazo y empieza el 0', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.manos.map((m) => m.length)).toEqual([7, 7, 7]);
    expect(e.monton).toHaveLength(1);
    expect(e.mazo).toHaveLength(62);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('robar');
  });

  it('robar del montón', () => {
    let e = nueva();
    const arriba = e.monton.at(-1)!;
    e = hacer(e, { tipo: 'robarMonton' });
    expect(e.manos[0]).toContain(arriba);
    expect(e.monton).toEqual([]);
    expect(e.fase).toBe('bajar');
  });

  it('no se puede añadir a la combinación de un rival sin haber bajado', () => {
    const escalera: CombinacionRemigio = {
      tipo: 'escalera',
      id: 0,
      duenio: 1,
      palo: 'copas',
      desde: 4,
      puestos: ['copas-4#0', 'copas-5#0', 'copas-6#0'],
    };
    const mano: CartaRemigio[] = ['copas-7#0', 'oros-1#0'];
    const anadir: AccionRemigio = { tipo: 'anadir', combinacion: 0, carta: 'copas-7#0', puesto: 7 };
    const e = enBajar([mano, ['oros-2#0']], { combinaciones: [escalera], siguienteId: 1 });
    expect(tiene(e, anadir)).toBe(false);
    expect(tiene({ ...e, bajado: [true, false] }, anadir)).toBe(true);
  });

  it('con el mazo agotado se rehace con el montón menos la de arriba', () => {
    const e0 = nueva();
    const monton = e0.mazo.slice(0, 10);
    let e: EstadoRemigio = { ...e0, mazo: [], monton };
    e = hacer(e, { tipo: 'robarMazo' });
    expect(e.monton).toEqual([monton.at(-1)]);
    expect(e.mazo).toHaveLength(8);
    expect(e.manos[0]).toHaveLength(8);
  });
});

// ── Cerrar, remigio y puntos ─────────────────────────────────────────────────

describe('mano anulada', () => {
  it('si el mazo ya se rehizo dos veces, la tercera anula la mano sin puntos', () => {
    const e0 = nueva();
    const e = hacer(
      { ...e0, mazo: [], monton: e0.mazo.slice(0, 5), rehechos: 2 },
      { tipo: 'robarMazo' },
    );
    const r = e.resultadosManos[0]!;
    expect(r.cerro).toBeNull();
    expect(r.puntosMano).toEqual([0, 0]);
    expect(e.puntos).toEqual([0, 0]);
    expect(e.repartidor).toBe(0);
    expect(e.rehechos).toBe(0);
  });
});

describe('cerrar y remigio', () => {
  const rival: CartaRemigio[] = ['oros-5#1', 'copas-12#0', 'comodin-1#1'];

  it('remigio: baja todo en el turno sin haber bajado antes y los demás pagan doble', () => {
    let e = enBajar([['oros-1#0', 'oros-2#0', 'oros-3#0', 'copas-7#0'], rival]);
    e = hacer(e, {
      tipo: 'bajar',
      combinacion: {
        tipo: 'escalera',
        palo: 'oros',
        desde: 1,
        puestos: ['oros-1#0', 'oros-2#0', 'oros-3#0'],
      },
    });
    e = hacer(e, { tipo: 'descartar', carta: 'copas-7#0' });
    const r = e.resultadosManos[0]!;
    expect(r.cerro).toBe(0);
    expect(r.remigio).toBe(true);
    // 5 + 10 + 25 = 40, doble.
    expect(r.puntosMano).toEqual([0, 80]);
  });

  it('cierre normal si ya había bajado antes', () => {
    let e = enBajar([['oros-1#0', 'oros-2#0', 'oros-3#0', 'copas-7#0'], rival], {
      bajado: [true, false],
      bajadoAntesDelTurno: true,
    });
    e = hacer(e, {
      tipo: 'bajar',
      combinacion: {
        tipo: 'escalera',
        palo: 'oros',
        desde: 1,
        puestos: ['oros-1#0', 'oros-2#0', 'oros-3#0'],
      },
    });
    e = hacer(e, { tipo: 'descartar', carta: 'copas-7#0' });
    expect(e.resultadosManos[0]!.remigio).toBe(false);
    expect(e.resultadosManos[0]!.puntosMano).toEqual([0, 40]);
  });

  it('eliminación al pasar de 100 y fin con el último', () => {
    let e = enBajar(
      [
        ['oros-1#0', 'oros-2#0', 'oros-3#0', 'copas-7#0'],
        ['oros-5#1', 'copas-12#0'],
      ],
      {
        puntos: [0, 90],
        bajado: [true, false],
        bajadoAntesDelTurno: true,
      },
    );
    e = hacer(e, {
      tipo: 'bajar',
      combinacion: {
        tipo: 'escalera',
        palo: 'oros',
        desde: 1,
        puestos: ['oros-1#0', 'oros-2#0', 'oros-3#0'],
      },
    });
    e = hacer(e, { tipo: 'descartar', carta: 'copas-7#0' });
    expect(e.puntos).toEqual([0, 105]);
    expect(e.eliminados).toEqual([false, true]);
    expect(remigio.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [0, 105] });
  });

  it('cambiar un comodín se lo lleva a la mano', () => {
    const escalera: CombinacionRemigio = {
      tipo: 'escalera',
      id: 0,
      duenio: 1,
      palo: 'bastos',
      desde: 3,
      puestos: ['bastos-3#0', 'comodin-1#0', 'bastos-5#0'],
    };
    let e = enBajar([['bastos-4#0', 'oros-1#0'], ['oros-2#0']], {
      combinaciones: [escalera],
      siguienteId: 1,
      bajado: [true, true],
    });
    e = hacer(e, { tipo: 'cambiar', combinacion: 0, carta: 'bastos-4#0' });
    expect(e.manos[0]).toEqual(['oros-1#0', 'comodin-1#0']);
    expect(e.combinaciones[0]).toMatchObject({
      puestos: ['bastos-3#0', 'bastos-4#0', 'bastos-5#0'],
    });
  });
});

describe('partidas al azar', () => {
  it('terminan, conservan las 84 cartas y la vista no enseña manos ajenas', () => {
    const g = new Generador(crearAzar('azar'));
    for (const jugadores of [2, 3, 5] as const) {
      let e = nueva({ jugadores }, `azar-${jugadores}`);
      for (let paso = 0; paso < 3000 && remigio.resultado(e) === null; paso++) {
        const acciones = remigio.accionesLegales(e, e.turno);
        // Al azar, pero sin robar del montón para que las manos avancen.
        const utiles = acciones.filter((a) => a.tipo !== 'robarMonton');
        const lista = utiles.length > 0 ? utiles : acciones;
        e = hacer(e, lista[g.enteroHasta(lista.length)]!);
        const todas = [
          ...e.manos.flat(),
          ...e.mazo,
          ...e.monton,
          ...e.combinaciones.flatMap((c) => (c.tipo === 'grupo' ? c.cartas : c.puestos)),
        ];
        expect(todas.length === 84 || e.resultadosManos.length > 0).toBe(true);
        if (paso % 50 === 0) {
          const v = remigio.vistaDe(e, 0);
          for (const c of e.manos.slice(1).flat()) {
            if (!e.monton.includes(c)) expect(JSON.stringify(v.miMano)).not.toContain(`"${c}"`);
          }
        }
      }
      expect(e.resultadosManos.length).toBeGreaterThan(0);
    }
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(remigio, {
  configs: [CONFIG_REMIGIO_POR_DEFECTO, { jugadores: 3 }, { jugadores: 5 }],
  // Las cartas que quedaron en las manos al cerrar se enseñan en el resultado.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.resultadosManos.flatMap((r) => r.manos.flat()));
    return [...e.mazo, ...e.manos.flatMap((m, a) => (a === asiento ? [] : m))].filter(
      (c) => !vistas.has(c),
    );
  },
  evitar: (a) => a.tipo === 'robarMonton',
  pasosMaximos: 400,
  ejecuciones: 25,
});
