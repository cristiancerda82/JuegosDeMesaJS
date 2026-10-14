import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_POCHA_POR_DEFECTO,
  pocha,
  puntosPocha,
  secuenciaPocha,
  type AccionPocha,
  type ConfigPocha,
  type EstadoPocha,
} from '../../src/juegos/pocha';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigPocha> = {}, semilla = 'p'): EstadoPocha {
  const r = pocha.crear({ ...CONFIG_POCHA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoPocha>, 'config'> & { config?: Partial<ConfigPocha> };

/** Estado armado a mano en la fase de juego, con triunfo en oros. */
function mesa(parcial: Parcial = {}): EstadoPocha {
  const config = { ...CONFIG_POCHA_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  return {
    azar: crearAzar('mesa'),
    secuencia: secuenciaPocha(config),
    indiceMano: 0,
    repartidor: n - 1,
    manos: Array.from({ length: n }, () => []),
    mazo: [],
    muestra: 'oros-4',
    cartaTriunfo: null,
    triunfo: 'oros',
    fase: 'jugar',
    apuestas: new Array<number>(n).fill(0),
    turno: 0,
    mesa: [],
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    resultadosManos: [],
    totales: new Array<number>(n).fill(0),
    ...parcial,
    config,
  };
}

function jugar(e: EstadoPocha, asiento: number, accion: AccionPocha): EstadoPocha {
  const r = aplicar(pocha, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const carta = (c: IdCarta): AccionPocha => ({ tipo: 'jugar', carta: c });
const apostar = (bazas: number): AccionPocha => ({ tipo: 'apostar', bazas });
const apuestasLegales = (e: EstadoPocha) =>
  pocha.accionesLegales(e, e.turno).flatMap((a) => (a.tipo === 'apostar' ? [a.bazas] : []));
const cartasLegales = (e: EstadoPocha, a: number) =>
  pocha
    .accionesLegales(e, a)
    .flatMap((x) => (x.tipo === 'jugar' ? [x.carta] : []))
    .sort();

/** Juega eligiendo siempre la primera acción legal hasta que se cumpla la condición o termine. */
function avanzar(e: EstadoPocha, hasta: (e: EstadoPocha) => boolean = () => false): EstadoPocha {
  while (pocha.resultado(e) === null && !hasta(e)) {
    e = jugar(e, e.turno, pocha.accionesLegales(e, e.turno)[0]!);
  }
  return e;
}

// ── Secuencia de manos ───────────────────────────────────────────────────────

describe('secuencia de manos', () => {
  it('partida corta: 9 manos de 1 a 5 y vuelta a 1', () => {
    expect(secuenciaPocha(CONFIG_POCHA_POR_DEFECTO)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
    const e = avanzar(nueva());
    expect(e.resultadosManos.map((r) => r.cartas)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
  });

  it('partida completa con 4: 19 manos de 1 a 10 y vuelta', () => {
    const s = secuenciaPocha({ ...CONFIG_POCHA_POR_DEFECTO, duracion: 'completa' });
    expect(s).toHaveLength(19);
    expect(Math.max(...s)).toBe(10);
    expect(s.filter((c) => c === 10)).toHaveLength(1);
  });

  it('partida completa con 3: hasta 13 cartas', () => {
    const s = secuenciaPocha({ jugadores: 3, duracion: 'completa', restriccionRepartidor: true });
    expect(s).toHaveLength(25);
    expect(Math.max(...s)).toBe(13);
  });

  it('el reparto rota y apuesta y sale el siguiente al repartidor', () => {
    let e = nueva();
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
    expect(e.manos.map((m) => m.length)).toEqual([1, 1, 1, 1]);
    e = avanzar(e, (x) => x.indiceMano === 1);
    expect(e.ultimaBaza!.cartas).toHaveLength(4);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.fase).toBe('apostar');
    expect(e.manos.map((m) => m.length)).toEqual([2, 2, 2, 2]);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(pocha.crear({ ...CONFIG_POCHA_POR_DEFECTO, jugadores: 5 as 4 }, 's').ok).toBe(false);
    expect(pocha.crear({ ...CONFIG_POCHA_POR_DEFECTO, duracion: 'x' as 'corta' }, 's').ok).toBe(
      false,
    );
  });
});

// ── Triunfo ──────────────────────────────────────────────────────────────────

describe('triunfo', () => {
  it('la muestra marca el triunfo y no está en ninguna mano', () => {
    const e = nueva();
    expect(e.muestra).not.toBeNull();
    expect(e.triunfo).toBe(e.muestra!.split('-')[0]);
    expect(e.manos.flat()).not.toContain(e.muestra);
  });

  it('con la baraja entera, marca el triunfo la última carta del repartidor y todos la ven', () => {
    const e = avanzar(nueva({ duracion: 'completa' }), (x) => x.secuencia[x.indiceMano] === 10);
    expect(e.muestra).toBeNull();
    expect(e.mazo).toEqual([]);
    expect(e.cartaTriunfo).toBe(e.manos[e.repartidor]!.at(-1));
    expect(e.triunfo).toBe(e.cartaTriunfo!.split('-')[0]);
    for (const a of [0, 1, 2, 3]) expect(pocha.vistaDe(e, a).cartaTriunfo).toBe(e.cartaTriunfo);
  });

  it('la carta de triunfo deja de estar a la vista cuando el repartidor la juega', () => {
    const e = mesa({
      muestra: null,
      cartaTriunfo: 'oros-5',
      turno: 3,
      manos: [[], [], [], ['oros-5', 'copas-2']],
    });
    expect(jugar(e, 3, carta('oros-5')).cartaTriunfo).toBeNull();
  });
});

// ── Apuestas ─────────────────────────────────────────────────────────────────

describe('apuestas', () => {
  /** Apuestas de la mano de 3 cartas (la tercera de la partida), con 4 jugadores. */
  function manoDeTres(config: Partial<ConfigPocha> = {}): EstadoPocha {
    return avanzar(nueva(config), (x) => x.indiceMano === 2);
  }

  it('en orden desde el siguiente al repartidor, de 0 a las cartas de la mano', () => {
    const e = manoDeTres();
    expect(e.repartidor).toBe(1);
    expect(e.turno).toBe(2);
    expect(apuestasLegales(e)).toEqual([0, 1, 2, 3]);
  });

  it('el repartidor no cuadra: tras 1, 0 y 1 no puede apostar 1', () => {
    let e = manoDeTres();
    e = jugar(e, 2, apostar(1));
    e = jugar(e, 3, apostar(0));
    e = jugar(e, 0, apostar(1));
    expect(e.turno).toBe(1);
    expect(apuestasLegales(e)).toEqual([0, 2, 3]);
    expect(pocha.vistaDe(e, 1).apuestaProhibida).toBe(1);
    expect(aplicar(pocha, e, 1, apostar(1)).ok).toBe(false);
  });

  it('sin restricción, el repartidor puede apostar cualquier número', () => {
    let e = manoDeTres({ restriccionRepartidor: false });
    e = jugar(e, 2, apostar(1));
    e = jugar(e, 3, apostar(0));
    e = jugar(e, 0, apostar(1));
    expect(apuestasLegales(e)).toEqual([0, 1, 2, 3]);
  });

  it('si las demás ya suman más que las cartas, no hay apuesta prohibida', () => {
    let e = manoDeTres();
    e = jugar(e, 2, apostar(3));
    e = jugar(e, 3, apostar(2));
    e = jugar(e, 0, apostar(0));
    expect(apuestasLegales(e)).toEqual([0, 1, 2, 3]);
  });

  it('tras la apuesta del repartidor empieza el juego y sale el siguiente', () => {
    let e = manoDeTres();
    for (const a of [2, 3, 0, 1]) e = jugar(e, a, apostar(0));
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(2);
    expect(e.apuestas).toEqual([0, 0, 0, 0]);
    expect(pocha.vistaDe(e, 3).apuestas).toEqual([0, 0, 0, 0]);
  });

  it('en la fase de apuestas no se juegan cartas', () => {
    const e = nueva();
    expect(pocha.accionesLegales(e, 0).every((a) => a.tipo === 'apostar')).toBe(true);
    expect(aplicar(pocha, e, 0, carta(e.manos[0]![0]!)).ok).toBe(false);
  });
});

// ── Bazas ────────────────────────────────────────────────────────────────────

describe('bazas y obligaciones', () => {
  it('seguir y montar: solo el Rey de copas sobre el Caballo', () => {
    const e = mesa({
      turno: 1,
      mesa: [{ asiento: 0, carta: 'copas-11' }],
      manos: [[], ['copas-2', 'copas-12', 'oros-1'], [], []],
    });
    expect(cartasLegales(e, 1)).toEqual(['copas-12']);
  });

  it('sin el palo, fallar y superar el triunfo más alto, aunque sea de otro jugador', () => {
    const e = mesa({
      turno: 2,
      mesa: [
        { asiento: 0, carta: 'copas-11' },
        { asiento: 1, carta: 'oros-5' },
      ],
      manos: [[], [], ['oros-2', 'oros-7', 'espadas-1'], []],
    });
    expect(cartasLegales(e, 2)).toEqual(['oros-7']);
  });

  it('sin palo ni triunfo, cualquier carta', () => {
    const e = mesa({
      config: { jugadores: 3 },
      turno: 1,
      mesa: [{ asiento: 0, carta: 'copas-11' }],
      manos: [[], ['espadas-2', 'bastos-1'], []],
    });
    expect(cartasLegales(e, 1)).toEqual(['bastos-1', 'espadas-2']);
  });

  it('gana el triunfo o la más alta del palo de salida, y el ganador sale', () => {
    let e = mesa({
      config: { jugadores: 3 },
      manos: [
        ['copas-3', 'bastos-2'],
        ['copas-1', 'bastos-4'],
        ['espadas-2', 'bastos-5'],
      ],
    });
    e = jugar(e, 0, carta('copas-3'));
    e = jugar(e, 1, carta('copas-1'));
    e = jugar(e, 2, carta('espadas-2'));
    expect(e.ultimaBaza!.ganador).toBe(1);
    expect(e.bazas).toEqual([0, 1, 0]);
    expect(e.turno).toBe(1);
  });
});

// ── Puntuación y fin ─────────────────────────────────────────────────────────

describe('puntuación', () => {
  it('acertar suma 10 más 5 por baza; fallar resta 5 por baza de diferencia', () => {
    expect(puntosPocha(2, 2)).toBe(20);
    expect(puntosPocha(0, 0)).toBe(10);
    expect(puntosPocha(1, 3)).toBe(-10);
    expect(puntosPocha(2, 0)).toBe(-10);
  });

  it('registra apuestas, bazas, puntos y totales de la mano', () => {
    let e = mesa({
      config: { jugadores: 3 },
      indiceMano: 1,
      apuestas: [2, 0, 1],
      bazas: [1, 0, 2],
      totales: [10, 5, 0],
      manos: [['copas-1'], ['copas-2'], ['copas-4']],
    });
    e = jugar(e, 0, carta('copas-1'));
    e = jugar(e, 1, carta('copas-2'));
    e = jugar(e, 2, carta('copas-4'));
    expect(e.resultadosManos[0]).toEqual({
      cartas: 2,
      apuestas: [2, 0, 1],
      bazas: [2, 0, 2],
      puntos: [20, 10, -5],
      totalesTras: [30, 15, -5],
    });
    expect(e.totales).toEqual([30, 15, -5]);
    expect(e.indiceMano).toBe(2);
    expect(e.fase).toBe('apostar');
  });

  it('al acabar la última mano, ganan los que tienen más puntos', () => {
    const config = CONFIG_POCHA_POR_DEFECTO;
    const resultadosPrevios = Array.from({ length: 8 }, () => ({
      cartas: 1,
      apuestas: [0, 0, 0, 0],
      bazas: [0, 0, 0, 0],
      puntos: [0, 0, 0, 0],
      totalesTras: [0, 0, 0, 0],
    }));
    let e = mesa({
      indiceMano: 8,
      apuestas: [0, 0, 0, 1],
      resultadosManos: resultadosPrevios,
      totales: [75, 65, 75, 40],
      manos: [['copas-2'], ['copas-4'], ['copas-5'], ['copas-1']],
      config,
    });
    expect(pocha.resultado(e)).toBeNull();
    for (const [a, c] of [
      [0, 'copas-2'],
      [1, 'copas-4'],
      [2, 'copas-5'],
      [3, 'copas-1'],
    ] as const) {
      e = jugar(e, a, carta(c));
    }
    // 0, 1 y 2 aciertan con 0 (+10) y 3 acierta con 1 (+15).
    expect(e.totales).toEqual([85, 75, 85, 55]);
    expect(pocha.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [85, 75, 85, 55],
    });
    expect(pocha.accionesLegales(e, 0)).toEqual([]);
    expect(pocha.vistaDe(e, 0).turno).toBeNull();
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra manos ajenas ni el mazo', () => {
    const e = avanzar(nueva(), (x) => x.indiceMano === 4);
    const v = pocha.vistaDe(e, 0);
    const texto = JSON.stringify(v);
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta));
    const ajenas = [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.mazo];
    for (const c of ajenas.filter((x) => !vistas.has(x))) {
      expect(texto).not.toContain(`"${c}"`);
    }
    expect(v.cartasEnMano).toEqual([5, 5, 5, 5]);
    expect(v.cartasMano).toBe(5);
    expect(v.indiceMano).toBe(4);
    expect(v.totalManos).toBe(9);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(pocha, {
  configs: [
    CONFIG_POCHA_POR_DEFECTO,
    { jugadores: 3, duracion: 'corta', restriccionRepartidor: false },
    { jugadores: 4, duracion: 'completa', restriccionRepartidor: true },
    { jugadores: 3, duracion: 'completa', restriccionRepartidor: true },
  ],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([e.cartaTriunfo, ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? [])]);
    return [...e.mazo, ...e.manos.flatMap((m, a) => (a === asiento ? [] : m))].filter(
      (c) => !vistas.has(c),
    );
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
