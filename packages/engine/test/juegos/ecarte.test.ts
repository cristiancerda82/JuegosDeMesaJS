import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_ECARTE,
  cartasLegalesEcarte,
  CONFIG_ECARTE_POR_DEFECTO,
  ecarte,
  type AccionEcarte,
  type EstadoEcarte,
} from '../../src/juegos/ecarte';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «Kp» es el rey de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

function nueva(semilla = 'ecarte'): EstadoEcarte {
  const r = ecarte.crear(CONFIG_ECARTE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoEcarte, accion: AccionEcarte): EstadoEcarte {
  const r = aplicar(ecarte, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano en bazas con triunfo de corazones (vuelta 7c): sale el 0. */
function bazas(manos: [string, string], parcial: Partial<EstadoEcarte> = {}): EstadoEcarte {
  return {
    ...nueva(),
    vuelta: una('7c'),
    manos: manos.map(c),
    fase: 'bazas',
    turno: 0,
    reyVuelto: false,
    puntos: [0, 0],
    puntosMano: [0, 0],
    ...parcial,
  };
}

/** Juega las bazas con la primera carta legal hasta que acaba la mano. */
function jugarBazas(e: EstadoEcarte, orden: string[][]): EstadoEcarte {
  for (const baza of orden)
    for (const t of baza) e = hacer(e, { tipo: 'jugarCarta', carta: una(t) });
  return e;
}

describe('Baraja y reparto del Écarté', () => {
  it('32 cartas; 5 a cada uno, la vuelta y 21 en el montón', () => {
    expect(BARAJA_ECARTE).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.monton).toHaveLength(21);
    expect(e.repartidor).toBe(1);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('cambio');
  });

  it('si la vuelta es un rey, el que reparte anota 1', () => {
    let e: EstadoEcarte | null = null;
    for (let i = 0; i < 200 && !e; i++) {
      const n = nueva(`vuelta-${i}`);
      if (n.vuelta.endsWith('-13')) e = n;
    }
    expect(e!.reyVuelto).toBe(true);
    expect(e!.puntos).toEqual([0, 1]);
  });
});

describe('Cambio de cartas del Écarté', () => {
  it('cambio aceptado: los dos siguen con 5, quedan 16 y el mano vuelve a elegir', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'proponer' });
    e = hacer(e, { tipo: 'aceptar' });
    for (const carta of e.manos[0]!.slice(0, 3)) e = hacer(e, { tipo: 'descartar', carta });
    e = hacer(e, { tipo: 'robar' });
    expect(e.turno).toBe(1);
    for (const carta of e.manos[1]!.slice(0, 2)) e = hacer(e, { tipo: 'descartar', carta });
    e = hacer(e, { tipo: 'robar' });
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.monton).toHaveLength(16);
    expect(e.fase).toBe('cambio');
    expect(e.turno).toBe(0);
    expect(e.autoridad).toBeNull();
  });

  it('el mano tiene que descartarse de una al menos; el que reparte puede quedarse con todas', () => {
    let e = hacer(hacer(nueva(), { tipo: 'proponer' }), { tipo: 'aceptar' });
    expect(ecarte.accionesLegales(e, 0).some((a) => a.tipo === 'robar')).toBe(false);
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    e = hacer(e, { tipo: 'robar' });
    expect(ecarte.accionesLegales(e, 1).some((a) => a.tipo === 'robar')).toBe(true);
  });

  it('cambio rehusado: empiezan las bazas y sale el mano', () => {
    const e = hacer(hacer(nueva(), { tipo: 'proponer' }), { tipo: 'rehusar' });
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    expect(e.autoridad).toBe(1);
  });

  it('con el montón agotado empiezan las bazas', () => {
    let e: EstadoEcarte = { ...nueva(), monton: c('8p 9p') };
    e = hacer(hacer(e, { tipo: 'proponer' }), { tipo: 'aceptar' });
    for (const carta of e.manos[0]!.slice(0, 2)) e = hacer(e, { tipo: 'descartar', carta });
    // No puede descartarse de más de las que quedan.
    expect(ecarte.accionesLegales(e, 0).every((a) => a.tipo === 'robar')).toBe(true);
    e = hacer(e, { tipo: 'robar' });
    expect(e.fase).toBe('bazas');
  });
});

describe('Jugar de autoridad en el Écarté', () => {
  it('el mano juega sin proponer y hace 2 bazas: el que reparte anota 2', () => {
    let e = bazas(['Kp 8p 7d 8d 9d', 'Qp Jp Kd Qd Jd']);
    e = { ...e, autoridad: 0 };
    e = jugarBazas(e, [
      ['Kp', 'Jp'],
      ['8p', 'Qp'],
      ['Kd', '7d'],
      ['Qd', '8d'],
      ['Jd', '9d'],
    ]);
    const r = e.resultadosManos.at(-1)!;
    expect(r.bazas).toEqual([1, 4]);
    expect(r.puntosMano).toEqual([0, 2]);
  });

  it('rehusar la segunda propuesta no es autoridad', () => {
    let e = hacer(hacer(nueva(), { tipo: 'proponer' }), { tipo: 'aceptar' });
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    e = hacer(hacer(e, { tipo: 'robar' }), { tipo: 'robar' });
    e = hacer(hacer(e, { tipo: 'proponer' }), { tipo: 'rehusar' });
    expect(e.autoridad).toBeNull();
  });

  it('jugar tras un cambio no es autoridad', () => {
    let e = hacer(hacer(nueva(), { tipo: 'proponer' }), { tipo: 'aceptar' });
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    e = hacer(hacer(e, { tipo: 'robar' }), { tipo: 'robar' });
    e = hacer(e, { tipo: 'jugar' });
    expect(e.fase).toBe('bazas');
    expect(e.autoridad).toBeNull();
  });
});

describe('Rey de triunfo del Écarté', () => {
  it('al salir con el rey de triunfo en la mano anota 1, a la vista de los dos', () => {
    const e = hacer(bazas(['Kc 8p 7d 8d 9d', 'Qp Jp Kd Qd Jd']), {
      tipo: 'jugarCarta',
      carta: una('8p'),
    });
    expect(e.rey).toBe(0);
    expect(e.puntos).toEqual([1, 0]);
    expect(ecarte.vistaDe(e, 1).rey).toBe(0);
  });

  it('con 4 puntos, el rey da la partida', () => {
    const e = hacer(bazas(['Kc 8p 7d 8d 9d', 'Qp Jp Kd Qd Jd'], { puntos: [4, 2] }), {
      tipo: 'jugarCarta',
      carta: una('8p'),
    });
    expect(ecarte.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [5, 2] });
    expect(e.resultadosManos.at(-1)?.completa).toBe(false);
  });
});

describe('Bazas del Écarté', () => {
  it('hay que ganar la baza si se puede', () => {
    const mesa = [{ asiento: 0, carta: una('Jp') }];
    expect(cartasLegalesEcarte(c('Qp 8p 9d'), mesa, 'corazones')).toEqual(c('Qp'));
  });

  it('el As va entre la J y el 10', () => {
    const mesa = [{ asiento: 0, carta: una('10p') }];
    expect(cartasLegalesEcarte(c('Ap 9p'), mesa, 'corazones')).toEqual(c('Ap'));
  });

  it('sin el palo, hay que fallar', () => {
    const mesa = [{ asiento: 0, carta: una('9p') }];
    expect(cartasLegalesEcarte(c('8c 9d Kt'), mesa, 'corazones')).toEqual(c('8c'));
  });

  it('el que no siguió ni falló queda apuntado', () => {
    let e = bazas(['9p 8p 7d 8d 9d', 'Qd Jt Kd 7t Jd']);
    e = jugarBazas(e, [['9p', 'Jt']]);
    expect(e.fallos[1]).toEqual(['picas', 'triunfo']);
  });
});

describe('Puntos de la mano del Écarté', () => {
  it('vole: 2 puntos', () => {
    let e = bazas(['Kp Qp Jp Ap 10p', '7p 8p 9p 7d 8d']);
    e = jugarBazas(e, [
      ['Kp', '7p'],
      ['Qp', '8p'],
      ['Jp', '9p'],
      ['Ap', '7d'],
      ['10p', '8d'],
    ]);
    const r = e.resultadosManos.at(-1)!;
    expect(r.vole).toBe(true);
    expect(r.puntosMano).toEqual([2, 0]);
    // Nueva mano: reparte el otro.
    expect(e.repartidor).toBe(0);
  });

  it('3 bazas: 1 punto', () => {
    let e = bazas(['Kp Qp Jp 7d 8d', '7p 8p 9p Kd Qd']);
    e = jugarBazas(e, [
      ['Kp', '7p'],
      ['Qp', '8p'],
      ['Jp', '9p'],
      ['7d', 'Kd'],
      ['Qd', '8d'],
    ]);
    expect(e.resultadosManos.at(-1)!.puntosMano).toEqual([1, 0]);
  });
});

describe('Vista del Écarté', () => {
  it('ve cuántas cartas se descartó el otro, pero no cuáles', () => {
    let e = hacer(hacer(nueva(), { tipo: 'proponer' }), { tipo: 'aceptar' });
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    e = hacer(e, { tipo: 'robar' });
    const tiradas = e.manos[1]!.slice(0, 2);
    for (const carta of tiradas) e = hacer(e, { tipo: 'descartar', carta });
    const v = ecarte.vistaDe(e, 0);
    expect(v.enDescarte[1]).toBe(2);
    for (const t of tiradas) expect(JSON.stringify(v)).not.toContain(`"${t}"`);
  });
});

describirContrato(ecarte, {
  configs: [CONFIG_ECARTE_POR_DEFECTO],
  cartasOcultas: (e, asiento) => [
    ...e.monton,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
    ...e.descartes.flatMap((d, a) => (a === asiento ? [] : d)),
  ],
  pasosMaximos: 600,
  ejecuciones: 30,
});
