import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_BRISCOLA_CHIAMATA,
  briscolaChiamata,
  CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO,
  ganadoraBriscolaChiamata,
  nivelDePuntos,
  puntosBriscolaChiamata,
  puntosDeNivel,
  type AccionBriscolaChiamata,
  type EstadoBriscolaChiamata,
} from '../../src/juegos/briscola-chiamata';
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

function nueva(semilla = 'chiamata', manos = 5): EstadoBriscolaChiamata {
  const r = briscolaChiamata.crear({ manos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoBriscolaChiamata, accion: AccionBriscolaChiamata): EstadoBriscolaChiamata {
  const r = aplicar(briscolaChiamata, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const pasar = (e: EstadoBriscolaChiamata) => hacer(e, { tipo: 'pasar' });
const pujar = (e: EstadoBriscolaChiamata, nivel: number) => hacer(e, { tipo: 'pujar', nivel });

/** Un estado en la llamada: el 0 ganó la subasta con `nivel`, con estas manos. */
function enLlamada(manos: string[], nivel = 0): EstadoBriscolaChiamata {
  return {
    ...nueva(),
    manos: manos.map(c),
    fase: 'llamada',
    pujas: [nivel, 'paso', 'paso', 'paso', 'paso'],
    nivel,
    llamador: 0,
    turno: 0,
  };
}

/** La última baza de una mano: el 0 llamó con el compañero en el 3 y triunfo de oros. */
function ultima(parcial: Partial<EstadoBriscolaChiamata>, manos = 1): EstadoBriscolaChiamata {
  return {
    ...nueva('ultima', manos),
    manos: ['2c', '4c', '5c', '6c', '7c'].map((t) => [una(t)]),
    fase: 'bazas',
    pujas: [0, 'paso', 'paso', 'paso', 'paso'],
    nivel: 0,
    llamador: 0,
    llamada: una('Ao'),
    triunfo: 'oros',
    companero: 3,
    solo: false,
    descubierto: true,
    turno: 0,
    ...parcial,
  };
}
/** Juega la última baza (nadie gana puntos: solo cartas sin valor de copas; la gana el 4). */
function jugarUltima(e: EstadoBriscolaChiamata): EstadoBriscolaChiamata {
  for (let i = 0; i < 5; i++) e = hacer(e, { tipo: 'jugarCarta', carta: e.manos[e.turno]![0]! });
  return e;
}

describe('Briscola Chiamata: baraja, orden y puntos', () => {
  it('40 cartas que suman 120 puntos', () => {
    expect(BARAJA_BRISCOLA_CHIAMATA).toHaveLength(40);
    expect(BARAJA_BRISCOLA_CHIAMATA.reduce((s, x) => s + puntosBriscolaChiamata(x), 0)).toBe(120);
  });

  it('el 3 gana al Rey', () => {
    expect(ganadoraBriscolaChiamata(enMesa([0, 'Rc'], [1, '3c']), 'oros').asiento).toBe(1);
  });

  it('puntos de una baza', () => {
    expect(c('Ao 3o So 7o 2o').reduce((s, x) => s + puntosBriscolaChiamata(x), 0)).toBe(23);
  });

  it('niveles de puja', () => {
    expect(puntosDeNivel(0)).toBe(61);
    expect(puntosDeNivel(9)).toBe(61);
    expect(puntosDeNivel(10)).toBe(62);
    expect(puntosDeNivel(68)).toBe(120);
    expect(nivelDePuntos(70)).toBe(18);
  });
});

describe('Briscola Chiamata: reparto y subasta', () => {
  it('8 cartas a cada uno y puja primero el asiento 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8, 8]);
    expect(e.repartidor).toBe(4);
    expect(e.turno).toBe(0);
  });

  it('subasta ganada: el 7 con 61 puntos', () => {
    let e = pujar(nueva(), 0); // As
    e = pujar(e, 2); // Rey
    e = pujar(e, 5); // 7
    e = pasar(pasar(e));
    e = pasar(pasar(e));
    expect(e.fase).toBe('llamada');
    expect(e.llamador).toBe(2);
    expect(puntosDeNivel(e.nivel!)).toBe(61);
  });

  it('subasta por puntos: 2 con 70', () => {
    let e = pujar(nueva(), 9); // el 2
    e = pujar(e, nivelDePuntos(70));
    for (let i = 0; i < 4; i++) e = pasar(e);
    expect(e.llamador).toBe(1);
    expect(puntosDeNivel(e.nivel!)).toBe(70);
    e = hacer(e, { tipo: 'llamar', palo: 'copas' });
    expect(e.llamada).toBe('copas-2');
  });

  it('solo se puede pujar más bajo y quien pasa no vuelve', () => {
    let e = pujar(nueva(), 3);
    const legales = briscolaChiamata.accionesLegales(e, 1);
    expect(legales.some((a) => a.tipo === 'pujar' && a.nivel <= 3)).toBe(false);
    e = pasar(e);
    e = pujar(e, 4);
    e = pujar(pujar(e, 5), 6);
    // Le toca al 0 (el 1 pasó): se salta al 1.
    e = pujar(e, 7);
    expect(e.turno).toBe(2);
  });

  it('el que reparte no puede pasar', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = pasar(e);
    expect(e.turno).toBe(4);
    expect(briscolaChiamata.accionesLegales(e, 4)).toEqual([{ tipo: 'pujar', nivel: 0 }]);
    e = pujar(e, 0);
    expect(e.fase).toBe('llamada');
    expect(e.llamador).toBe(4);
  });

  it('con 120 la subasta se acaba', () => {
    const e = pujar(nueva(), 68);
    expect(e.fase).toBe('llamada');
    expect(e.llamador).toBe(0);
  });
});

describe('Briscola Chiamata: llamada y compañero oculto', () => {
  const manos = [
    'Ao 3o Ro Co So 7o 6o 5o',
    '4o 2o Ac 3c Rc Cc Sc 7c',
    '6c 5c 4c 2c Ae 3e Re Ce',
    'Se 7e 6e 5e 4e 2e Ab 3b',
    'Rb Cb Sb 7b 6b 5b 4b 2b',
  ];

  it('el compañero es quien tiene la carta llamada y solo él lo sabe', () => {
    const e = hacer(enLlamada(manos, 0), { tipo: 'llamar', palo: 'espadas' });
    expect(e.llamada).toBe('espadas-1');
    expect(e.triunfo).toBe('espadas');
    expect(e.companero).toBe(2);
    expect(e.solo).toBe(false);
    expect(briscolaChiamata.vistaDe(e, 2).companero).toBe(2);
    for (const a of [0, 1, 3, 4]) expect(briscolaChiamata.vistaDe(e, a).companero).toBeNull();
    expect(briscolaChiamata.vistaDe(e, 1).solo).toBeNull();
    expect(briscolaChiamata.vistaDe(e, 0).solo).toBe(false);
    expect(briscolaChiamata.vistaDe(e, 1).llamada).toBe('espadas-1');
  });

  it('se descubre al jugar la carta llamada', () => {
    let e = hacer(enLlamada(manos, 0), { tipo: 'llamar', palo: 'espadas' });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('5o') });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('7c') });
    expect(briscolaChiamata.vistaDe(e, 4).companero).toBeNull();
    e = hacer(e, { tipo: 'jugarCarta', carta: una('Ae') });
    for (const a of [0, 1, 3, 4]) expect(briscolaChiamata.vistaDe(e, a).companero).toBe(2);
  });

  it('llamar una carta propia es jugar solo', () => {
    const e = hacer(enLlamada(manos, 1), { tipo: 'llamar', palo: 'oros' });
    expect(e.llamada).toBe('oros-3');
    expect(e.solo).toBe(true);
    expect(briscolaChiamata.vistaDe(e, 0).solo).toBe(true);
    expect(briscolaChiamata.vistaDe(e, 1).solo).toBeNull();
  });
});

describe('Briscola Chiamata: bazas', () => {
  it('se puede echar cualquier carta y gana el triunfo', () => {
    let e = hacer(
      enLlamada(
        [
          'Ac 3o Ro Co So 7o 6o 5o',
          '4o 2o Ao 3c Rc Cc Sc 7c',
          '6c 5c 4c 2c Ae 3e Re Ce',
          'Se 7e 6e 5e 4e 2e Ab 3b',
          'Rb Cb Sb 7b 6b 5b 4b 2b',
        ],
        0,
      ),
      { tipo: 'llamar', palo: 'oros' },
    );
    e = hacer(e, { tipo: 'jugarCarta', carta: una('Ac') });
    // El 1 tiene copas y puede echar un oro.
    expect(briscolaChiamata.accionesLegales(e, 1)).toHaveLength(8);
    e = hacer(e, { tipo: 'jugarCarta', carta: una('2o') });
    for (const t of ['2c', '2e', '2b']) e = hacer(e, { tipo: 'jugarCarta', carta: una(t) });
    expect(e.ultimaBaza!.ganador).toBe(1);
    expect(e.puntosMano[1]).toBe(11);
    expect(e.turno).toBe(1);
  });
});

describe('Briscola Chiamata: puntuación y partida', () => {
  it('mano ganada con compañero', () => {
    const e = jugarUltima(ultima({ puntosMano: [40, 0, 0, 30, 50] }));
    const r = e.resultadosManos[0]!;
    expect(r.puntosBando).toBe(70);
    expect(r.ganada).toBe(true);
    expect(r.cambio).toEqual([2, -1, -1, 1, -1]);
  });

  it('60 puntos no bastan', () => {
    const e = jugarUltima(ultima({ puntosMano: [30, 20, 20, 30, 20] }));
    expect(e.resultadosManos[0]!.ganada).toBe(false);
    expect(e.marcador).toEqual([-2, 1, 1, -1, 1]);
  });

  it('mano ganada solo', () => {
    const e = jugarUltima(
      ultima({
        puntosMano: [75, 10, 10, 15, 10],
        solo: true,
        companero: 0,
        nivel: nivelDePuntos(75),
      }),
    );
    expect(e.resultadosManos[0]!.ganada).toBe(true);
    expect(e.marcador).toEqual([4, -1, -1, -1, -1]);
  });

  it('la partida acaba tras la quinta mano y gana el que más tiene', () => {
    const base = ultima({ puntosMano: [40, 0, 0, 30, 50] }, 5);
    const e = jugarUltima(base);
    // Cuatro manos ya jugadas (sin cambios): la que se juega es la quinta.
    const quinta = jugarUltima({
      ...base,
      marcador: [0, 0, 0, 0, 0],
      resultadosManos: Array.from({ length: 4 }, () => ({
        repartidor: 0,
        llamador: 0,
        nivel: 0,
        objetivo: 61,
        llamada: una('Ao'),
        companero: 3,
        solo: false,
        puntosBando: 0,
        ganada: false,
        cambio: [0, 0, 0, 0, 0],
        marcadorTras: [0, 0, 0, 0, 0],
      })),
    });
    expect(briscolaChiamata.resultado(e)).toBeNull();
    expect(briscolaChiamata.resultado(quinta)).toEqual({
      ganadores: [0],
      empate: false,
      puntos: [2, -1, -1, 1, -1],
    });
  });

  it('las manos siguen con el siguiente repartidor', () => {
    const e = jugarUltima(ultima({ puntosMano: [40, 0, 0, 30, 50] }, 5));
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('subasta');
    expect(e.turno).toBe(1);
    expect(e.ultimaBaza).toBeNull();
  });
});

describe('Briscola Chiamata: vista', () => {
  it('sin manos ajenas', () => {
    const e = nueva();
    const v = briscolaChiamata.vistaDe(e, 2);
    expect(v.miMano).toEqual(e.manos[2]);
    expect(v.cartasEnMano).toEqual([8, 8, 8, 8, 8]);
    expect(JSON.stringify(v)).not.toContain(e.manos[0]![0]!);
  });
});

describirContrato(briscolaChiamata, {
  configs: [CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO, { manos: 1 }],
  // Los nombres de las cartas llamadas (de esta mano y de las anteriores) son públicos.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...(e.llamada ? [e.llamada] : []),
      ...e.resultadosManos.map((r) => r.llamada),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 2_000,
});
