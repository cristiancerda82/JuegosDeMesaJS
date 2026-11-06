import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  cartasLegalesTresillo,
  CONFIG_TRESILLO_POR_DEFECTO,
  ganadoraTresillo,
  rangoTresillo,
  tresillo,
  type AccionTresillo,
  type EstadoTresillo,
} from '../../src/juegos/tresillo';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(semilla = 'tresillo', manos = 12, fichas = 100): EstadoTresillo {
  const r = tresillo.crear({ manos, fichas }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTresillo, accion: AccionTresillo): EstadoTresillo {
  const r = aplicar(tresillo, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const pasar = (e: EstadoTresillo) => hacer(e, { tipo: 'pasar' });
const robar = (e: EstadoTresillo) => hacer(e, { tipo: 'robar' });
const pujar = (e: EstadoTresillo, contrato: 'entrada' | 'vuelta' | 'solo') =>
  hacer(e, { tipo: 'pujar', contrato });
const legales = (mano: string, mesa: [number, string][], triunfo: 'oros' | 'copas' | 'espadas') =>
  cartasLegalesTresillo(c(mano), enMesa(...mesa), triunfo).sort();

/** Un estado en bazas: el 0 es el hombre de una entrada. */
function enBazas(manos: string[], parcial: Partial<EstadoTresillo> = {}): EstadoTresillo {
  return {
    ...nueva(),
    fase: 'bazas',
    hombre: 0,
    contrato: 'entrada',
    triunfo: 'oros',
    pujas: ['entrada', 'paso', 'paso'],
    pujaMayor: 'entrada',
    cambiadas: [0, 0, 0],
    manos: manos.map(c),
    turno: 0,
    ...parcial,
  };
}

/** Juega la última baza (una carta cada uno, desde el 0) con esas bazas ya hechas. */
function ultimaBaza(parcial: Partial<EstadoTresillo>, ganaLa: 0 | 1 | 2): EstadoTresillo {
  const manos = ['3e', '4e', '5e'];
  manos[ganaLa] = 'Re';
  let e = enBazas(manos, parcial);
  for (let i = 0; i < 3; i++) e = hacer(e, tresillo.accionesLegales(e, e.turno)[0]!);
  return e;
}

describe('baraja y orden', () => {
  it('con triunfo de oros, el orden de los triunfos', () => {
    const orden = c('Ae 7o Ab Ao Ro Co So 2o 3o 4o 5o 6o');
    const rangos = orden.map((x) => rangoTresillo(x, 'oros'));
    expect([...rangos].sort((a, b) => b - a)).toEqual(rangos);
    expect(Math.min(...rangos)).toBeGreaterThan(rangoTresillo(una('Rc'), 'oros'));
  });

  it('con triunfo de espadas, el 2 es la malilla y no hay punto', () => {
    const orden = c('Ae 2e Ab Re Ce Se 7e 6e 5e 4e 3e');
    const rangos = orden.map((x) => rangoTresillo(x, 'espadas'));
    expect([...rangos].sort((a, b) => b - a)).toEqual(rangos);
  });

  it('la espadilla es siempre triunfo', () => {
    expect(ganadoraTresillo(enMesa([0, 'Rc'], [1, 'Ae']), 'copas').asiento).toBe(1);
    expect(ganadoraTresillo(enMesa([0, 'Rc'], [1, 'Ae']), 'oros').asiento).toBe(1);
  });

  it('en un palo rojo sin triunfo, el As va tras la sota', () => {
    const mesa = enMesa([0, '2c'], [1, '7c'], [2, 'Ac']);
    expect(ganadoraTresillo(mesa, 'espadas').asiento).toBe(2);
    expect(ganadoraTresillo(enMesa([0, 'Sc'], [1, 'Ac']), 'espadas').asiento).toBe(0);
  });

  it('en un palo negro sin triunfo, el 7 es la más alta tras la sota', () => {
    expect(ganadoraTresillo(enMesa([0, '2b'], [1, '7b']), 'oros').asiento).toBe(1);
  });
});

describe('fichas y reparto', () => {
  it('cada uno pone 1 y recibe 9; quedan 13 en el monte', () => {
    const e = nueva();
    expect(e.fichas).toEqual([99, 99, 99]);
    expect(e.bote).toBe(3);
    expect(e.manos.map((m) => m.length)).toEqual([9, 9, 9]);
    expect(e.monte).toHaveLength(13);
    expect(e.repartidor).toBe(2);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('subasta');
  });
});

describe('subasta', () => {
  it('se puja más alto o se pasa; gana el último que queda', () => {
    let e = pujar(nueva(), 'entrada');
    expect(tresillo.accionesLegales(e, 1)).toEqual([
      { tipo: 'pasar' },
      { tipo: 'pujar', contrato: 'vuelta' },
      { tipo: 'pujar', contrato: 'solo' },
    ]);
    e = pasar(pujar(e, 'vuelta'));
    expect(e.turno).toBe(0);
    const primera = e.monte[0]!;
    e = pasar(e);
    expect(e.hombre).toBe(1);
    expect(e.contrato).toBe('vuelta');
    expect(e.vuelta).toBe(primera);
    expect(e.triunfo).toBe(primera.split('-')[0]);
    expect(e.fase).toBe('cambio');
    expect(e.turno).toBe(1);
    expect(tresillo.vistaDe(e, 2).vuelta).toBe(primera);
  });

  it('si pasan los tres no se juega, el bote se queda y reparte el siguiente', () => {
    const e = pasar(pasar(pasar(nueva())));
    const r = e.resultadosManos.at(-1)!;
    expect(r.pasada).toBe(true);
    expect(r.boteTras).toBe(3);
    expect(e.bote).toBe(6);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
  });

  it('en la entrada el hombre elige el triunfo y cambia; en el solo no cambia', () => {
    let e = pasar(pasar(pujar(nueva(), 'entrada')));
    expect(e.fase).toBe('triunfo');
    e = hacer(e, { tipo: 'triunfo', palo: 'copas' });
    expect(e.triunfo).toBe('copas');
    expect(e.fase).toBe('cambio');
    expect(e.turno).toBe(0);

    let s = pasar(pasar(pujar(nueva(), 'solo')));
    s = hacer(s, { tipo: 'triunfo', palo: 'bastos' });
    expect(s.cambiadas).toEqual([0, null, null]);
    expect(s.turno).toBe(1);
  });
});

describe('cambio', () => {
  it('el hombre se descarta de 5, roba 5 y quedan 8', () => {
    let e = pasar(pasar(pujar(nueva(), 'entrada')));
    e = hacer(e, { tipo: 'triunfo', palo: 'oros' });
    for (const x of e.manos[0]!.slice(0, 5)) e = hacer(e, { tipo: 'descartar', carta: x });
    e = robar(e);
    expect(e.manos[0]).toHaveLength(9);
    expect(e.monte).toHaveLength(8);
    expect(tresillo.vistaDe(e, 1).cambiadas[0]).toBe(5);
    expect(e.turno).toBe(1);
  });

  it('en la vuelta el hombre tiene que descartarse de una y roba la vuelta', () => {
    let e = pasar(pasar(pujar(nueva(), 'vuelta')));
    expect(tresillo.accionesLegales(e, 0).some((a) => a.tipo === 'robar')).toBe(false);
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    e = robar(e);
    expect(e.manos[0]).toContain(e.vuelta);
  });

  it('no se puede descartar más de lo que queda en el monte', () => {
    let e = pasar(pasar(pujar(nueva(), 'entrada')));
    e = hacer(e, { tipo: 'triunfo', palo: 'oros' });
    e = { ...e, monte: e.monte.slice(0, 3) };
    for (const x of e.manos[0]!.slice(0, 3)) e = hacer(e, { tipo: 'descartar', carta: x });
    expect(tresillo.accionesLegales(e, 0)).toEqual([{ tipo: 'robar' }]);
  });

  it('tras el cambio de todos, sale el mano', () => {
    const e0 = pasar(pujar(pasar(nueva()), 'entrada'));
    let e = e0;
    expect(e.hombre).toBe(1);
    e = hacer(e, { tipo: 'triunfo', palo: 'oros' });
    e = robar(robar(robar(e)));
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
  });
});

describe('bazas', () => {
  it('hay que seguir el palo', () => {
    expect(legales('4c 5o Ae', [[0, 'Rc']], 'oros')).toEqual([una('4c')]);
  });

  it('la espadilla no sigue las espadas si el triunfo es otro', () => {
    expect(legales('Ae 3b', [[0, 'Re']], 'oros')).toEqual(c('Ae 3b').sort());
  });

  it('si sale triunfo, el matador no obliga', () => {
    expect(legales('7o 4c 5e', [[0, '3o']], 'oros')).toEqual(c('7o 4c 5e').sort());
  });

  it('si sale triunfo, el triunfo que no es matador obliga (y se puede echar el matador)', () => {
    expect(legales('7o 4o 5e', [[0, '3o']], 'oros')).toEqual(c('7o 4o').sort());
  });

  it('un matador más alto en la salida obliga al matador', () => {
    expect(legales('Ab 4c', [[0, 'Ae']], 'oros')).toEqual([una('Ab')]);
    expect(legales('Ae 4c', [[0, 'Ab']], 'oros')).toEqual(c('Ae 4c').sort());
  });

  it('quien no sigue queda sin el palo; quien no echa triunfo, por debajo de la salida', () => {
    let e = enBazas(['3c', '4b 5b', '6c'], { turno: 1, mesa: enMesa([0, 'Rc']) });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('4b') });
    expect(e.fallos[1]).toEqual({ palos: ['copas'], triunfo: 0 });
    let f = enBazas(['3o', '7o 5b', '6c'], { turno: 1, mesa: enMesa([0, '3o']) });
    f = hacer(f, { tipo: 'jugarCarta', carta: una('5b') });
    expect(f.fallos[1]).toEqual({ palos: [], triunfo: rangoTresillo(una('3o'), 'oros') });
  });
});

describe('sacada, puesta y codillo', () => {
  it('sacada: el hombre se lleva el bote y 2 de cada defensor', () => {
    const e = ultimaBaza({ bote: 3, bazas: [4, 2, 2], fichas: [99, 99, 99] }, 0);
    const r = e.resultadosManos.at(-1)!;
    expect(r.desenlace).toBe('sacada');
    expect(r.cambioFichas).toEqual([7, -2, -2]);
    expect(r.boteTras).toBe(0);
  });

  it('puesta: el hombre paga el bote al bote y 4 a cada defensor', () => {
    const e = ultimaBaza(
      { contrato: 'vuelta', bote: 3, bazas: [4, 3, 1], fichas: [99, 99, 99] },
      1,
    );
    const r = e.resultadosManos.at(-1)!;
    expect(r.desenlace).toBe('puesta');
    expect(r.cambioFichas).toEqual([-11, 4, 4]);
    expect(r.boteTras).toBe(6);
  });

  it('codillo: el hombre paga el bote al defensor y 6 a cada uno; el bote se queda', () => {
    const e = ultimaBaza({ contrato: 'solo', bote: 3, bazas: [3, 4, 1], fichas: [99, 99, 99] }, 1);
    const r = e.resultadosManos.at(-1)!;
    expect(r.desenlace).toBe('codillo');
    expect(r.codillo).toBe(1);
    expect(r.cambioFichas).toEqual([-15, 9, 6]);
    expect(r.boteTras).toBe(3);
  });

  it('codillo con los defensores empatados: para el primero tras el hombre', () => {
    const e = ultimaBaza({ bote: 3, bazas: [1, 3, 4], fichas: [99, 99, 99] }, 1);
    expect(e.resultadosManos.at(-1)!.codillo).toBe(1);
  });

  it('nadie paga más de lo que tiene', () => {
    const e = ultimaBaza({ contrato: 'solo', bote: 3, bazas: [3, 4, 1], fichas: [5, 99, 99] }, 1);
    const r = e.resultadosManos.at(-1)!;
    expect(r.fichasTras[0]).toBe(0);
    expect(r.cambioFichas.reduce((s, x) => s + x, 0)).toBe(0);
  });
});

describe('partida', () => {
  it('termina tras las manos de la config y gana quien tiene más fichas', () => {
    let e = nueva('corta', 2);
    while (tresillo.resultado(e) === null) e = hacer(e, tresillo.accionesLegales(e, e.turno)[0]!);
    expect(e.resultadosManos).toHaveLength(2);
    expect(tresillo.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('termina si un jugador se queda sin fichas', () => {
    const e = ultimaBaza({ contrato: 'solo', bote: 3, bazas: [3, 4, 1], fichas: [5, 99, 99] }, 1);
    expect(tresillo.resultado(e)).not.toBeNull();
    expect(tresillo.resultado(e)!.ganadores).toEqual([1]);
  });
});

describirContrato(tresillo, {
  configs: [CONFIG_TRESILLO_POR_DEFECTO, { manos: 2, fichas: 5 }],
  // La vuelta es pública; los descartes y el monte, no.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    if (e.vuelta) vistas.add(e.vuelta);
    const ajenas = e.manos.flatMap((m, a) => (a === asiento ? [] : m));
    return [...ajenas, ...e.monte, ...e.descartes].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1_000,
});
