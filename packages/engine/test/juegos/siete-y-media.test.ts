import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
  esSieteYMediaNatural,
  sieteYMedia,
  valorCarta,
  valorJugada,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type EstadoSieteYMedia,
} from '../../src/juegos/siete-y-media';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigSieteYMedia> = {}, semilla = 's'): EstadoSieteYMedia {
  const r = sieteYMedia.crear({ ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoSieteYMedia>, 'config'> & {
  config?: Partial<ConfigSieteYMedia>;
};

/**
 * Mano en fase de juego armada a mano: banca en el asiento 0, apuestas de 5 y 50 fichas.
 * El mazo se pide desde el final.
 */
function enJuego(parcial: Parcial & Pick<EstadoSieteYMedia, 'cartas'>): EstadoSieteYMedia {
  const config = { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  const fichas = parcial.fichas ?? new Array<number>(n).fill(50);
  return {
    azar: crearAzar('mesa'),
    banca: 0,
    fichas,
    fichasInicioMano: fichas,
    fase: 'jugar',
    turno: 1,
    apuestas: Array.from({ length: n }, (_, a) => (a === (parcial.banca ?? 0) ? null : 5)),
    mazo: ['bastos-2', 'bastos-3'],
    estados: new Array(n).fill('jugando'),
    ultimaAccion: null,
    resultadosManos: [],
    ...parcial,
    tapadas: parcial.tapadas ?? parcial.cartas.map((c) => c.map((_, i) => i === 0)),
    config,
  };
}

function jugar(e: EstadoSieteYMedia, asiento: number, accion: AccionSieteYMedia) {
  const r = aplicar(sieteYMedia, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const PEDIR: AccionSieteYMedia = { tipo: 'pedir' };

describe('pedir tapada', () => {
  const conTapadas = (parcial: Parcial & Pick<EstadoSieteYMedia, 'cartas'>) =>
    enJuego({ ...parcial, config: { tapadas: true, ...parcial.config } });

  it('sin la opción solo se pide boca arriba', () => {
    const e = enJuego({ cartas: [['oros-1'], ['copas-2']] });
    expect(sieteYMedia.accionesLegales(e, 1)).toEqual([{ tipo: 'pedir' }, { tipo: 'plantarse' }]);
  });

  it('pedir tapada: el dueño la ve y los demás no, ni en la última jugada', () => {
    const e = jugar(conTapadas({ cartas: [['oros-1'], ['copas-2']], mazo: ['bastos-5'] }), 1, {
      tipo: 'pedirTapada',
    });
    expect(e.cartas[1]).toEqual(['copas-2', 'bastos-5']);
    expect(e.tapadas[1]).toEqual([true, true]);
    const propia = sieteYMedia.vistaDe(e, 1);
    expect(propia.cartas[1]).toEqual(['copas-2', 'bastos-5']);
    expect(propia.ultimaAccion).toMatchObject({ carta: 'bastos-5', tapada: true });
    const ajena = sieteYMedia.vistaDe(e, 0);
    expect(ajena.cartas[1]).toEqual([null, null]);
    expect(ajena.visibles[1]).toBe(0);
    expect(ajena.tapadas[1]).toEqual([true, true]);
    expect(ajena.ultimaAccion).toMatchObject({ tipo: 'pedir', carta: null, tapada: true });
    expect(JSON.stringify(ajena)).not.toContain('bastos-5');
  });

  it('pedir destapada con la opción, como siempre', () => {
    const e = jugar(
      conTapadas({ cartas: [['oros-1'], ['copas-2']], mazo: ['bastos-5'] }),
      1,
      PEDIR,
    );
    expect(e.tapadas[1]).toEqual([true, false]);
    expect(sieteYMedia.vistaDe(e, 0).cartas[1]).toEqual([null, 'bastos-5']);
    expect(sieteYMedia.vistaDe(e, 0).visibles[1]).toBe(10);
  });

  it('pasarse con una tapada: paga en el acto y los demás no ven la carta', () => {
    const e = jugar(
      conTapadas({
        config: { jugadores: 3 },
        cartas: [['oros-1'], ['copas-6'], ['espadas-2']],
        mazo: ['bastos-3'],
        fichas: [50, 50, 50],
      }),
      1,
      { tipo: 'pedirTapada' },
    );
    expect(e.estados[1]).toBe('pasado');
    expect(e.fichas).toEqual([55, 45, 50]);
    expect(e.turno).toBe(2);
    const ajena = sieteYMedia.vistaDe(e, 0);
    expect(ajena.estados[1]).toBe('pasado');
    expect(JSON.stringify(ajena.cartas)).not.toContain('bastos-3');
    expect(ajena.ultimaAccion).toMatchObject({ carta: null, pasado: true });
  });

  it('al terminar la mano, el resultado destapa todas las cartas', () => {
    const e = jugar(conTapadas({ cartas: [['oros-1'], ['copas-6']], mazo: ['bastos-3'] }), 1, {
      tipo: 'pedirTapada',
    });
    expect(e.resultadosManos.at(-1)!.cartas[1]).toEqual(['copas-6', 'bastos-3']);
  });
});
const PLANTARSE: AccionSieteYMedia = { tipo: 'plantarse' };

// ── Valores ──────────────────────────────────────────────────────────────────

describe('valores', () => {
  it('del As al 7 su número y las figuras medio punto (en medios puntos)', () => {
    expect(valorCarta('oros-1')).toBe(2);
    expect(valorCarta('oros-7')).toBe(14);
    for (const v of [10, 11, 12]) expect(valorCarta(`copas-${v}` as IdCarta)).toBe(1);
  });

  it('el 7 de oros y el Rey de copas suman siete y media', () => {
    expect(valorJugada(['oros-7', 'copas-12'])).toBe(15);
  });

  it('siete y media natural: exactamente un 7 y una figura', () => {
    expect(esSieteYMediaNatural(['oros-7', 'copas-10'])).toBe(true);
    expect(esSieteYMediaNatural(['copas-11', 'espadas-7'])).toBe(true);
    expect(esSieteYMediaNatural(['oros-5', 'copas-2', 'bastos-10'])).toBe(false);
    expect(esSieteYMediaNatural(['oros-6', 'copas-1'])).toBe(false);
  });
});

// ── Preparación y apuestas ───────────────────────────────────────────────────

describe('preparación y apuestas', () => {
  it('3 jugadores: el asiento 0 es la banca y todos tienen 50 fichas', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.banca).toBe(0);
    expect(e.fichas).toEqual([50, 50, 50]);
    expect(e.fase).toBe('apostar');
    expect(e.turno).toBe(1);
    expect(e.mazo).toEqual([]);
  });

  it('apuesta de 1 a la apuesta máxima, limitada por las fichas', () => {
    const e = nueva();
    expect(sieteYMedia.accionesLegales(e, 1)).toHaveLength(10);
    const pobre = { ...e, fichas: [50, 4] };
    expect(
      sieteYMedia.accionesLegales(pobre, 1).map((a) => (a as { fichas: number }).fichas),
    ).toEqual([1, 2, 3, 4]);
    expect(sieteYMedia.accionesLegales(e, 0)).toEqual([]);
  });

  it('al apostar el último se reparte una carta tapada a cada uno', () => {
    let e = nueva({ jugadores: 3 });
    e = jugar(e, 1, { tipo: 'apostar', fichas: 3 });
    expect(e.turno).toBe(2);
    expect(e.cartas.every((c) => c.length === 0)).toBe(true);
    e = jugar(e, 2, { tipo: 'apostar', fichas: 7 });
    expect(e.fase).toBe('jugar');
    expect(e.cartas.map((c) => c.length)).toEqual([1, 1, 1]);
    expect(e.mazo).toHaveLength(37);
    expect(e.apuestas).toEqual([null, 3, 7]);
    expect(e.turno).toBe(1);
  });

  it('rechaza configuraciones inválidas', () => {
    const base = CONFIG_SIETE_Y_MEDIA_POR_DEFECTO;
    expect(sieteYMedia.crear({ ...base, jugadores: 5 as 2 }, 's').ok).toBe(false);
    expect(sieteYMedia.crear({ ...base, manos: 0 }, 's').ok).toBe(false);
    expect(sieteYMedia.crear({ ...base, apuestaMaxima: 1.5 }, 's').ok).toBe(false);
    expect(sieteYMedia.crear({ ...base, cambioBanca: 'x' as 'rotar' }, 's').ok).toBe(false);
  });
});

// ── Turnos ───────────────────────────────────────────────────────────────────

describe('turnos', () => {
  it('pedir da la carta de arriba boca arriba y sigue el turno', () => {
    const e = jugar(enJuego({ cartas: [['oros-4'], ['copas-2']] }), 1, PEDIR);
    expect(e.cartas[1]).toEqual(['copas-2', 'bastos-3']);
    expect(e.turno).toBe(1);
  });

  it('pasarse: la banca cobra la apuesta en el acto y el turno pasa', () => {
    const e = jugar(
      enJuego({
        config: { jugadores: 3 },
        cartas: [['oros-4'], ['copas-6'], ['espadas-1']],
        mazo: ['bastos-3'],
      }),
      1,
      PEDIR,
    );
    expect(e.estados[1]).toBe('pasado');
    expect(e.fichas).toEqual([55, 45, 50]);
    expect(e.turno).toBe(2);
  });

  it('con siete y media justa se planta solo', () => {
    const e = jugar(
      enJuego({
        config: { jugadores: 3 },
        cartas: [['oros-4'], ['copas-7'], ['espadas-1']],
        mazo: ['bastos-10'],
      }),
      1,
      PEDIR,
    );
    expect(e.estados[1]).toBe('plantado');
    expect(e.turno).toBe(2);
  });

  it('plantarse pasa el turno; tras el último punto juega la banca', () => {
    let e = enJuego({ config: { jugadores: 3 }, cartas: [['oros-4'], ['copas-5'], ['espadas-1']] });
    e = jugar(e, 1, PLANTARSE);
    expect(e.turno).toBe(2);
    e = jugar(e, 2, PLANTARSE);
    expect(e.turno).toBe(0);
  });

  it('si todos los puntos se pasan, la mano termina sin turno de la banca', () => {
    let e = enJuego({ cartas: [['oros-4'], ['copas-7']], mazo: ['bastos-3'] });
    e = jugar(e, 1, PEDIR);
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.resultadosManos[0]!.variacion).toEqual([5, -5]);
    expect(e.resultadosManos[0]!.pasados).toEqual([false, true]);
  });

  it('sin mazo no se puede pedir', () => {
    const e = enJuego({ cartas: [['oros-4'], ['copas-1']], mazo: [] });
    expect(sieteYMedia.accionesLegales(e, 1)).toEqual([PLANTARSE]);
  });
});

// ── Liquidación ──────────────────────────────────────────────────────────────

describe('liquidación', () => {
  it('la banca gana los empates', () => {
    let e = enJuego({ cartas: [['oros-6'], ['copas-6']], turno: 1 });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([5, -5]);
  });

  it('el punto con más gana su apuesta', () => {
    let e = enJuego({ cartas: [['oros-5'], ['copas-6']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([-5, 5]);
    expect(e.resultadosManos[0]!.valores).toEqual([10, 12]);
  });

  it('si la banca se pasa paga a los puntos plantados', () => {
    let e = enJuego({
      config: { jugadores: 3 },
      cartas: [['oros-6'], ['copas-2'], ['espadas-1']],
      mazo: ['bastos-5'],
    });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 2, PLANTARSE);
    e = jugar(e, 0, PEDIR);
    expect(e.resultadosManos[0]!.variacion).toEqual([-10, 5, 5]);
  });

  it('siete y media natural cobra el doble', () => {
    let e = enJuego({ cartas: [['oros-6'], ['copas-7', 'oros-10']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([-10, 10]);
    let f = enJuego({ config: { pagoDoble: false }, cartas: [['oros-6'], ['copas-7', 'oros-10']] });
    f = jugar(f, 1, PLANTARSE);
    f = jugar(f, 0, PLANTARSE);
    expect(f.resultadosManos[0]!.variacion).toEqual([-5, 5]);
  });

  it('una siete y media de tres cartas cobra sencillo sin la opción', () => {
    let e = enJuego({ cartas: [['oros-6'], ['copas-4', 'oros-3', 'bastos-10']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([-5, 5]);
  });

  // Variante: el doble para cualquier siete y media.
  const conOpcion = (parcial: Parameters<typeof enJuego>[0]) =>
    enJuego({ ...parcial, config: { dobleCualquiera: true, ...parcial.config } });

  it('con la opción, una siete y media de tres cartas cobra el doble', () => {
    let e = conOpcion({ cartas: [['oros-6'], ['copas-4', 'oros-3', 'bastos-10']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([-10, 10]);
  });

  it('con la opción, la natural sigue cobrando el doble y el resto, sencillo', () => {
    let e = conOpcion({
      config: { jugadores: 3 },
      cartas: [['oros-6'], ['copas-7', 'oros-10'], ['espadas-7']],
    });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 2, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([-15, 10, 5]);
  });

  it('con la opción, el empate a siete y media es para la banca', () => {
    let e = conOpcion({
      cartas: [
        ['oros-7', 'copas-11'],
        ['copas-5', 'oros-2', 'bastos-12'],
      ],
    });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.resultadosManos[0]!.variacion).toEqual([5, -5]);
  });

  it('sin pago doble, crear deja la opción desactivada', () => {
    const r = sieteYMedia.crear(
      { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, pagoDoble: false, dobleCualquiera: true },
      's',
    );
    if (!r.ok) throw new Error(r.error);
    expect(r.valor.config.dobleCualquiera).toBe(false);
    const con = sieteYMedia.crear(
      { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, dobleCualquiera: true },
      's',
    );
    if (!con.ok) throw new Error(con.error);
    expect(con.valor.config.dobleCualquiera).toBe(true);
    const sin = sieteYMedia.crear(CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, 's');
    if (!sin.ok) throw new Error(sin.error);
    expect(sin.valor.config.dobleCualquiera).toBe(false);
  });

  it('la banca paga en orden hasta quedarse sin fichas', () => {
    let e = enJuego({
      config: { jugadores: 3 },
      fichas: [7, 50, 50],
      cartas: [['oros-6'], ['copas-7'], ['espadas-7']],
      mazo: ['bastos-5'],
    });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 2, PLANTARSE);
    e = jugar(e, 0, PEDIR);
    expect(e.resultadosManos[0]!.fichasTras).toEqual([0, 55, 52]);
  });

  it('el registro destapa las cartas de todos', () => {
    let e = enJuego({ cartas: [['oros-5'], ['copas-6']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    const v = sieteYMedia.vistaDe(e, 1);
    expect(v.resultadosManos[0]!.cartas).toEqual([['oros-5'], ['copas-6']]);
  });
});

// ── Banca y fin ──────────────────────────────────────────────────────────────

describe('banca y fin de la partida', () => {
  it('la banca rota cada mano', () => {
    let e = enJuego({ cartas: [['oros-5'], ['copas-6']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.banca).toBe(1);
    expect(e.fase).toBe('apostar');
    expect(e.turno).toBe(0);
  });

  it('con banca por siete y media, la banca pasa a quien le gana con 7,5', () => {
    const config = { jugadores: 3 as const, cambioBanca: 'sieteYMedia' as const };
    let e = enJuego({ config, cartas: [['oros-5'], ['copas-6'], ['espadas-7']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 2, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.banca).toBe(0);
    let f = enJuego({ config, cartas: [['oros-5'], ['copas-6'], ['espadas-7', 'oros-11']] });
    f = jugar(f, 1, PLANTARSE);
    f = jugar(f, 2, PLANTARSE);
    f = jugar(f, 0, PLANTARSE);
    expect(f.banca).toBe(2);
  });

  it('quiebra: la partida termina y gana quien tiene más fichas', () => {
    let e = enJuego({ fichas: [50, 5], cartas: [['oros-6'], ['copas-6']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.fichas).toEqual([55, 0]);
    expect(sieteYMedia.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [55, 0] });
    expect(sieteYMedia.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('partida a N manos', () => {
    let e = enJuego({ config: { manos: 1 }, cartas: [['oros-5'], ['copas-6']] });
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(sieteYMedia.resultado(e)?.ganadores).toEqual([1]);
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('oculta la carta tapada ajena y el mazo; muestra las destapadas', () => {
    const e = enJuego({
      config: { jugadores: 3 },
      cartas: [['oros-4'], ['copas-2', 'bastos-12'], ['espadas-1']],
    });
    const v = sieteYMedia.vistaDe(e, 2);
    expect(v.cartas).toEqual([[null], [null, 'bastos-12'], ['espadas-1']]);
    expect(v.miValor).toBe(2);
    expect(v.visibles).toEqual([0, 1, 0]);
    expect(JSON.stringify(v)).not.toContain('bastos-2');
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(sieteYMedia, {
  configs: [
    CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 3, cambioBanca: 'sieteYMedia', manos: 4 },
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 4, fichasIniciales: 10, pagoDoble: false },
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 3, tapadas: true },
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 4, dobleCualquiera: true },
  ],
  // Cada mano se baraja de nuevo, así que una carta oculta ahora pudo verse en una mano anterior
  // (en su registro o en la última acción): esas no cuentan.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>(e.resultadosManos.flatMap((r) => r.cartas.flat()));
    const u = e.ultimaAccion;
    if (u?.tipo === 'pedir' && u.carta !== null && (!u.tapada || u.asiento === asiento)) {
      vistas.add(u.carta);
    }
    return [
      ...e.mazo,
      ...e.cartas.flatMap((c, a) => (a === asiento ? [] : c.filter((_, i) => e.tapadas[a]![i]))),
    ].filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
