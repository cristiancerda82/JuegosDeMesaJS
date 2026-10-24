import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  botesEnJuegoHoldem,
  botesHoldem,
  ciegasHoldem,
  CONFIG_HOLDEM_POR_DEFECTO,
  holdem,
  mejorManoPoker,
  valorMano5,
  type AccionHoldem,
  type ConfigHoldem,
  type EstadoHoldem,
} from '../../src/juegos/holdem';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
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

function nueva(config: Partial<ConfigHoldem> = {}, semilla = 'holdem'): EstadoHoldem {
  const r = holdem.crear({ ...CONFIG_HOLDEM_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoHoldem, accion: AccionHoldem): EstadoHoldem {
  const r = aplicar(holdem, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoHoldem) => holdem.accionesLegales(e, e.turno);
const tipos = (e: EstadoHoldem) => [...new Set(legales(e).map((a) => a.tipo))];
const minimaSubida = (e: EstadoHoldem) =>
  Math.min(...legales(e).flatMap((a) => (a.tipo === 'subir' ? [a.hasta] : [])));

// ── Manos de póker ───────────────────────────────────────────────────────────

describe('valor de las manos', () => {
  it('ordena las categorías', () => {
    const manos = [
      c('2p 5c 9d Jt Kp'),
      c('2p 2c 9d Jt Kp'),
      c('2p 2c 9d 9t Kp'),
      c('2p 2c 2d Jt Kp'),
      c('5p 6c 7d 8t 9p'),
      c('2p 5p 9p Jp Kp'),
      c('2p 2c 2d Kt Kp'),
      c('2p 2c 2d 2t Kp'),
      c('5p 6p 7p 8p 9p'),
    ];
    const valores = manos.map((m) => valorMano5(m).valor);
    expect([...valores].sort((a, b) => a - b)).toEqual(valores);
    expect(manos.map((m) => valorMano5(m).categoria)).toEqual([
      'cartaAlta',
      'pareja',
      'doblePareja',
      'trio',
      'escalera',
      'color',
      'full',
      'poker',
      'escaleraColor',
    ]);
  });

  it('la mejor mano de siete: escalera de color aunque haya doble pareja', () => {
    const m = mejorManoPoker(c('Ac Kc Qc Jc 10c 2p 2t'));
    expect(m.categoria).toBe('escaleraColor');
  });

  it('el As bajo: A-2-3-4-5 pierde contra 2-3-4-5-6, y Q-K-A-2-3 no es escalera', () => {
    expect(valorMano5(c('Ap 2c 3d 4t 5p')).categoria).toBe('escalera');
    expect(valorMano5(c('2p 3c 4d 5t 6p')).valor).toBeGreaterThan(
      valorMano5(c('Ap 2c 3d 4t 5p')).valor,
    );
    expect(valorMano5(c('Qp Kc Ad 2t 3p')).categoria).toBe('cartaAlta');
  });

  it('desempata por las cartas que no forman la jugada', () => {
    const a = valorMano5(c('Kp Kc Ad 9t 4p')).valor;
    const b = valorMano5(c('Kd Kt Ac 8p 7c')).valor;
    expect(a).toBeGreaterThan(b);
  });

  it('los palos no desempatan', () => {
    expect(valorMano5(c('Kp Kc Ad 9t 4p')).valor).toBe(valorMano5(c('Kd Kt Ac 9p 4c')).valor);
  });
});

// ── Torneo y ciegas ──────────────────────────────────────────────────────────

describe('torneo y ciegas', () => {
  it('4 jugadores: el 1 pone 1, el 2 pone 2 y le toca al 3', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([2, 2, 2, 2]);
    expect(e.apuestas).toEqual([0, 1, 2, 0]);
    expect(e.fichas).toEqual([100, 99, 98, 100]);
    expect(e.turno).toBe(3);
  });

  it('las ciegas suben cada 10 manos', () => {
    expect(ciegasHoldem(1)).toEqual([1, 2]);
    expect(ciegasHoldem(10)).toEqual([1, 2]);
    expect(ciegasHoldem(11)).toEqual([2, 4]);
    expect(ciegasHoldem(200)).toEqual([100, 200]);
  });

  it('con 2 jugadores el botón pone la pequeña y habla primero', () => {
    const e = nueva({ jugadores: 2 });
    expect(e.apuestas).toEqual([1, 2]);
    expect(e.turno).toBe(0);
  });

  it('la ciega grande puede subir aunque todos igualen', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'igualar' });
    e = hacer(e, { tipo: 'igualar' });
    e = hacer(e, { tipo: 'igualar' });
    expect(e.turno).toBe(2);
    expect(e.fase).toBe('preflop');
    expect(tipos(e)).toEqual(['retirarse', 'pasar', 'subir']);
    e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('flop');
    expect(e.comunes).toHaveLength(3);
    // Después del flop habla el primero tras el botón.
    expect(e.turno).toBe(1);
  });

  it('si todos pasan el flop, se descubre el turn', () => {
    let e = nueva();
    for (let i = 0; i < 3; i++) e = hacer(e, { tipo: 'igualar' });
    e = hacer(e, { tipo: 'pasar' });
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('turn');
    expect(e.comunes).toHaveLength(4);
  });
});

// ── Acciones sin límite ──────────────────────────────────────────────────────

describe('acciones sin límite', () => {
  it('subida mínima: tras subir a 6 con ciegas 1/2, hay que llegar a 10', () => {
    let e = nueva();
    expect(minimaSubida(e)).toBe(4);
    e = hacer(e, { tipo: 'subir', hasta: 6 });
    expect(minimaSubida(e)).toBe(10);
  });

  it('se puede ir all-in aunque no llegue al mínimo', () => {
    const base = nueva({ jugadores: 3 });
    let e = hacer(base, { tipo: 'subir', hasta: 50 });
    e = { ...e, fichas: e.fichas.map((f, a) => (a === 1 ? 20 : f)) };
    // El asiento 1 tiene 20 + 1 apostado: solo puede ir all-in a 21.
    expect(legales(e).filter((a) => a.tipo === 'subir')).toEqual([]);
    expect(tipos(e)).toEqual(['retirarse', 'igualar']);
  });

  it('un all-in corto no reabre las apuestas a quien ya actuó', () => {
    let e = nueva({ jugadores: 3 });
    // El asiento 1 (ciega pequeña) solo tiene 13 en total.
    e = { ...e, fichas: e.fichas.map((f, a) => (a === 1 ? 12 : f)) };
    e = hacer(e, { tipo: 'subir', hasta: 10 }); // asiento 0
    e = hacer(e, { tipo: 'subir', hasta: 13 }); // asiento 1, all-in corto
    expect(e.allIn[1]).toBe(true);
    e = hacer(e, { tipo: 'igualar' }); // asiento 2: no había actuado
    expect(e.turno).toBe(0);
    expect(tipos(e)).toEqual(['retirarse', 'igualar']);
  });
});

// ── Botes y showdown ─────────────────────────────────────────────────────────

/** Un river a punto de terminar con estas manos, comunes y aportaciones. */
function enRiver(
  manos: IdCarta[][],
  comunes: IdCarta[],
  aportado: number[],
  parcial: Partial<EstadoHoldem> = {},
): EstadoHoldem {
  const base = nueva({ jugadores: manos.length as 3 });
  const n = manos.length;
  return {
    ...base,
    manos,
    comunes,
    mazo: [],
    fase: 'river',
    apuestas: new Array<number>(n).fill(0),
    aportado,
    apuestaMaxima: 0,
    retirados: new Array<boolean>(n).fill(false),
    allIn: aportado.map(() => false),
    pendientes: aportado.map(() => true),
    puedeSubir: aportado.map(() => true),
    ...parcial,
  };
}

describe('botes y showdown', () => {
  it('bote principal y secundario', () => {
    expect(botesHoldem([20, 50, 50], [true, true, true])).toEqual([
      { cantidad: 60, participantes: [0, 1, 2] },
      { cantidad: 60, participantes: [1, 2] },
    ]);
  });

  it('mientras se apuesta, solo un all-in separa botes', () => {
    expect(
      botesEnJuegoHoldem([0, 1, 2, 0], [true, true, true, true], [false, false, false, false]),
    ).toEqual([{ cantidad: 3, participantes: [0, 1, 2, 3] }]);
    expect(botesEnJuegoHoldem([20, 50, 50], [true, true, true], [true, false, false])).toEqual([
      { cantidad: 60, participantes: [0, 1, 2] },
      { cantidad: 60, participantes: [1, 2] },
    ]);
  });

  it('el all-in gana el principal y la segunda mano el secundario', () => {
    let e = enRiver([c('Ap Ac'), c('Kp Kc'), c('2d 7t')], c('Ad 9c 5p 3t Jd'), [20, 50, 50], {
      fichas: [0, 50, 50],
      allIn: [true, false, false],
      pendientes: [false, true, true],
      turno: 1,
    });
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    const r = e.resultadosManos.at(-1)!;
    expect(r.botes.map((b) => [b.cantidad, b.ganadores])).toEqual([
      [60, [0]],
      [60, [1]],
    ]);
    expect(r.ensenadas.map((m) => m.categoria)).toEqual(['trio', 'pareja', 'cartaAlta']);
    expect(r.fichasTras).toEqual([60, 110, 50]);
  });

  it('un empate reparte el bote y la ficha impar va al primero tras el botón', () => {
    let e = enRiver([c('2c 3c'), c('2d 3d'), c('4t 6t')], c('10p Jc Qd Kt Ap'), [20, 20, 1], {
      boton: 1,
      fichas: [80, 80, 99],
      retirados: [false, false, true],
      pendientes: [true, true, false],
      turno: 0,
    });
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    const bote = e.resultadosManos.at(-1)!.botes[0]!;
    expect(bote.cantidad).toBe(41);
    // Tras el botón (asiento 1) va el 2, que se retiró, y después el 0.
    expect(bote.ganadores).toEqual([0, 1]);
    expect(bote.porGanador).toEqual([21, 20]);
  });

  it('todos all-in antes del flop: se descubren las cinco comunes', () => {
    let e = nueva({ jugadores: 2 });
    e = hacer(e, { tipo: 'subir', hasta: 100 });
    e = hacer(e, { tipo: 'igualar' });
    const r = e.resultadosManos.at(-1)!;
    expect(r.comunes).toHaveLength(5);
    expect(r.ensenadas).toHaveLength(2);
  });

  it('si todos se retiran, el último se lleva el bote sin enseñar', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'retirarse' });
    e = hacer(e, { tipo: 'retirarse' });
    e = hacer(e, { tipo: 'retirarse' });
    const r = e.resultadosManos.at(-1)!;
    expect(r.sinShowdown).toBe(2);
    expect(r.ensenadas).toEqual([]);
    expect(r.fichasTras).toEqual([100, 99, 101, 100]);
    // Siguiente mano: el botón pasa al asiento 1.
    expect(e.boton).toBe(1);
    expect(e.numeroMano).toBe(2);
  });
});

// ── Eliminación y fin ────────────────────────────────────────────────────────

describe('eliminación y fin', () => {
  it('quien pierde todas sus fichas queda eliminado y no recibe cartas', () => {
    let e = enRiver([c('Ap Ac'), c('Kp Kc'), c('2d 7t')], c('Ad 9c 5p 3t Jd'), [20, 20, 20], {
      fichas: [80, 80, 0],
      allIn: [false, false, true],
      pendientes: [true, true, false],
      turno: 0,
    });
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    expect(e.eliminados).toEqual([false, false, true]);
    expect(e.eliminacion).toEqual([2]);
    expect(e.manos[2]).toEqual([]);
    expect(holdem.resultado(e)).toBeNull();
  });

  it('termina cuando queda uno, con la clasificación', () => {
    let e = enRiver([c('Ap Ac'), c('Kp Kc'), c('2d 7t')], c('Ad 9c 5p 3t Jd'), [100, 100, 100], {
      fichas: [0, 0, 0],
      allIn: [true, true, true],
      pendientes: [false, false, false],
      turno: 0,
    });
    // Nadie puede hablar: se fuerza el cierre de la ronda con un estado con turno ajeno.
    e = { ...e, allIn: [false, true, true], pendientes: [true, false, false] };
    e = hacer(e, { tipo: 'pasar' });
    // Los dos caen en la misma mano con las mismas fichas: cae antes el de menor asiento.
    expect(holdem.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [1, 3, 2] });
    expect(holdem.vistaDe(e, 0).turno).toBeNull();
  });
});

describe('vista', () => {
  it('no muestra las cartas ajenas ni las comunes que faltan', () => {
    let e = nueva();
    for (let i = 0; i < 3; i++) e = hacer(e, { tipo: 'igualar' });
    e = hacer(e, { tipo: 'pasar' });
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'pasar' });
    const v = holdem.vistaDe(e, 0);
    expect(v.comunes).toHaveLength(4);
    const texto = JSON.stringify(v);
    for (const carta of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.mazo]) {
      expect(texto).not.toContain(`"${carta}"`);
    }
  });

  it('rechaza 7 jugadores', () => {
    expect(holdem.crear({ jugadores: 7 } as never, 'x').ok).toBe(false);
  });
});

describirContrato(holdem, {
  configs: [CONFIG_HOLDEM_POR_DEFECTO, { jugadores: 2 }, { jugadores: 6 }],
  // Cada mano se baraja entera: lo enseñado en manos anteriores vuelve al mazo.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(
      e.resultadosManos.flatMap((r) => [...r.comunes, ...r.ensenadas.flatMap((m) => m.cartas)]),
    );
    const ocultas = [...e.mazo, ...e.manos.flatMap((m, a) => (a === asiento ? [] : m))];
    return ocultas.filter((x) => !vistas.has(x) && !e.comunes.includes(x));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
