import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  anadidosRummy,
  bajadasRummy,
  combinacionRummy,
  CONFIG_RUMMY_500_POR_DEFECTO,
  mejorBajadaRummy,
  puntosBajadaRummy,
  rummy500,
  type AccionRummy500,
  type CombinacionRummy500,
  type ConfigRummy500,
  type EstadoRummy500,
} from '../../src/juegos/rummy-500';
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
    const valor = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[valor] ?? Number(valor)}` as IdCarta;
  });
}

function nueva(config: Partial<ConfigRummy500> = {}, semilla = 'rummy'): EstadoRummy500 {
  const r = rummy500.crear({ ...CONFIG_RUMMY_500_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoRummy500, accion: AccionRummy500): EstadoRummy500 {
  const r = aplicar(rummy500, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoRummy500) => rummy500.accionesLegales(e, e.turno);
const esLegal = (e: EstadoRummy500, a: AccionRummy500) => aplicar(rummy500, e, e.turno, a).ok;

/** Una mano de 2 jugadores armada a mano; el mazo, con las cartas que sobran salvo que se dé. */
function enJuego(manos: IdCarta[][], parcial: Partial<EstadoRummy500> = {}): EstadoRummy500 {
  const base = nueva({ jugadores: manos.length as 2 | 3 | 4 });
  const descarte = parcial.descarte ?? c('2c');
  const usadas = new Set([
    ...manos.flat(),
    ...descarte,
    ...(parcial.combinaciones ?? []).flatMap((x) => x.cartas.map((y) => y.carta)),
  ]);
  return {
    ...base,
    manos,
    descarte,
    mazo: base.mazo.concat(base.descarte, base.manos.flat()).filter((x) => !usadas.has(x)),
    turno: 0,
    fase: 'robar',
    ...parcial,
  };
}

const mesa = (
  id: number,
  tipo: CombinacionRummy500['tipo'],
  cartas: IdCarta[],
  de = 1,
): CombinacionRummy500 => ({
  id,
  tipo,
  cartas: cartas.map((carta) => ({ carta, de })),
});

// ── Combinaciones ────────────────────────────────────────────────────────────

describe('combinaciones del Rummy 500', () => {
  it('el As va abajo o arriba, pero sin vuelta', () => {
    expect(combinacionRummy(c('Qc Kc Ac'))).toEqual({ tipo: 'escalera', cartas: c('Qc Kc Ac') });
    expect(combinacionRummy(c('Ac 2c 3c'))).toEqual({ tipo: 'escalera', cartas: c('Ac 2c 3c') });
    expect(combinacionRummy(c('Kp Ap 2p'))).toBeNull();
  });

  it('grupos de 3 o 4 del mismo número', () => {
    expect(combinacionRummy(c('7p 7c 7d'))?.tipo).toBe('grupo');
    expect(combinacionRummy(c('7p 7c 7d 7t'))?.tipo).toBe('grupo');
    expect(combinacionRummy(c('7p 7c'))).toBeNull();
  });

  it('puntos: el As vale 1 en A-2-3 y 15 en Q-K-A', () => {
    expect(puntosBajadaRummy(c('Ap 2p 3p'))).toBe(6);
    expect(puntosBajadaRummy(c('Qt Kt At'))).toBe(35);
    expect(puntosBajadaRummy(c('Ac Ad At'))).toBe(45);
  });

  it('enumera las bajadas, también las escaleras con As arriba', () => {
    const bajadas = bajadasRummy(c('Jc Qc Kc Ac 5p'));
    expect(bajadas).toContainEqual(c('Jc Qc Kc'));
    expect(bajadas).toContainEqual(c('Qc Kc Ac'));
    expect(bajadas).toContainEqual(c('Jc Qc Kc Ac'));
  });

  it('añadidos: la cuarta de un grupo y los extremos de una escalera', () => {
    const combinaciones = [mesa(0, 'grupo', c('9p 9c 9d')), mesa(1, 'escalera', c('4c 5c 6c'))];
    const a = anadidosRummy(c('9t 7c 3c 8c'), combinaciones);
    expect(a).toContainEqual({ combinacion: 0, carta: 'treboles-9' });
    expect(a).toContainEqual({ combinacion: 1, carta: 'corazones-7' });
    expect(a).toContainEqual({ combinacion: 1, carta: 'corazones-3' });
    expect(a).not.toContainEqual({ combinacion: 1, carta: 'corazones-8' });
  });

  it('la mejor bajada es la que más puntos pone', () => {
    // La escalera 10-J-Q-K de picas pone 40, pero 10-J-Q de picas y el grupo de reyes ponen 60.
    const r = mejorBajadaRummy(c('10p Jp Qp Kp Kc Kd 2t'));
    expect(r.puntos).toBe(60);
    expect(r.sueltas).toEqual(c('2t'));
  });
});

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto', () => {
  it('2 jugadores: 13 cartas, descarte 1 y mazo 25', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13]);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(25);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('robar');
  });

  it('4 jugadores: 7 cartas, descarte 1 y mazo 23', () => {
    const e = nueva({ jugadores: 4 });
    expect(e.manos.map((m) => m.length)).toEqual([7, 7, 7, 7]);
    expect(e.mazo).toHaveLength(23);
  });

  it('rechaza 5 jugadores', () => {
    expect(rummy500.crear({ jugadores: 5 } as never, 'x').ok).toBe(false);
  });
});

// ── Robar ────────────────────────────────────────────────────────────────────

describe('robar', () => {
  it('coger varias del descarte deja la de más abajo como obligada', () => {
    const e = enJuego([c('8p 9p 2d 5t 6c'), c('Ad 3d 4d 5d 6d')], { descarte: c('3c 7p Kc 2t') });
    expect(esLegal(e, { tipo: 'robarDescarte', desde: 1 })).toBe(true);
    let tras = hacer(e, { tipo: 'robarDescarte', desde: 1 });
    expect(tras.manos[0]).toEqual(expect.arrayContaining(c('7p Kc 2t')));
    expect(tras.descarte).toEqual(c('3c'));
    expect(tras.obligada).toBe('picas-7');
    // No puede descartar ni bajar otra cosa hasta usar el 7 de picas.
    expect(legales(tras).some((a) => a.tipo === 'descartar')).toBe(false);
    expect(legales(tras).every((a) => a.tipo !== 'bajar' || a.cartas.includes('picas-7'))).toBe(
      true,
    );
    tras = hacer(tras, { tipo: 'bajar', cartas: c('7p 8p 9p') });
    expect(tras.obligada).toBeNull();
    expect(legales(tras).some((a) => a.tipo === 'descartar')).toBe(true);
  });

  it('no se puede coger desde una carta que no se puede usar', () => {
    const e = enJuego([c('8p 9p 2d 5t 6c'), c('Ad 3d 4d 5d 6d')], { descarte: c('3c Jd Kc') });
    expect(esLegal(e, { tipo: 'robarDescarte', desde: 1 })).toBe(false);
    expect(esLegal(e, { tipo: 'robarDescarte', desde: 2 })).toBe(true);
  });

  it('la de arriba cogida sola no se puede descartar en el turno', () => {
    const e = enJuego([c('8p 9p 2d 5t 6c'), c('Ad 3d 4d 5d 6d')], { descarte: c('3c Jt') });
    const tras = hacer(e, { tipo: 'robarDescarte', desde: 1 });
    expect(tras.noDescartar).toBe('treboles-11');
    expect(legales(tras)).not.toContainEqual({ tipo: 'descartar', carta: 'treboles-11' });
  });

  it('si baja la carta cogida de arriba, deja de estar marcada', () => {
    const e = enJuego([c('Jp Jc 5t 6c'), c('Ad 3d 4d 5d 6d')], { descarte: c('3c Jt') });
    let tras = hacer(e, { tipo: 'robarDescarte', desde: 1 });
    tras = hacer(tras, { tipo: 'bajar', cartas: c('Jp Jc Jt') });
    expect(tras.noDescartar).toBeNull();
  });

  it('se puede coger desde una carta que se añade a la mesa', () => {
    const e = enJuego([c('2d 5t 6c'), c('Ad 3d 4d')], {
      descarte: c('3c 7c Jt'),
      combinaciones: [mesa(0, 'escalera', c('4c 5c 6c'))],
      siguienteId: 1,
    });
    expect(esLegal(e, { tipo: 'robarDescarte', desde: 1 })).toBe(true);
  });
});

// ── Bajar, añadir y descartar ────────────────────────────────────────────────

describe('bajar, añadir y descartar', () => {
  it('añadir a la escalera de un rival cuenta para quien añade', () => {
    const e = enJuego([c('7c 2d 5t'), c('Ad 3d 4d')], {
      fase: 'bajar',
      combinaciones: [mesa(0, 'escalera', c('4c 5c 6c'), 1)],
      siguienteId: 1,
    });
    const tras = hacer(e, { tipo: 'anadir', combinacion: 0, carta: 'corazones-7' });
    expect(tras.combinaciones[0]!.cartas.at(-1)).toEqual({ carta: 'corazones-7', de: 0 });
  });

  it('siempre tiene que quedar una carta que descartar', () => {
    const e = enJuego([c('Qp Qc Qd'), c('Ad 3d 4d')], { fase: 'bajar' });
    expect(legales(e).some((a) => a.tipo === 'bajar')).toBe(false);
    const cuatro = enJuego([c('Qp Qc Qd 4t'), c('Ad 3d 4d')], { fase: 'bajar' });
    expect(legales(cuatro)).toContainEqual({ tipo: 'bajar', cartas: c('Qp Qc Qd') });
  });

  it('el As se puede añadir arriba o abajo de una escalera del 2 a la K', () => {
    const e = enJuego([c('Ap 3c'), c('Ad 3d 4d')], {
      fase: 'bajar',
      combinaciones: [mesa(0, 'escalera', c('2p 3p 4p 5p 6p 7p 8p 9p 10p Jp Qp Kp'))],
      siguienteId: 1,
    });
    const arriba = hacer(e, { tipo: 'anadir', combinacion: 0, carta: 'picas-1', arriba: true });
    expect(arriba.combinaciones[0]!.cartas.at(-1)!.carta).toBe('picas-1');
    const abajo = hacer(e, { tipo: 'anadir', combinacion: 0, carta: 'picas-1', arriba: false });
    expect(abajo.combinaciones[0]!.cartas[0]!.carta).toBe('picas-1');
  });
});

// ── Fin de la mano y partida ─────────────────────────────────────────────────

describe('fin de la mano y puntos', () => {
  it('cerrar descartando la última carta puntúa lo bajado menos lo de la mano', () => {
    const e = enJuego([c('Kd'), c('Kp 5c')], {
      fase: 'bajar',
      combinaciones: [
        mesa(0, 'grupo', c('7p 7c 7d'), 0),
        mesa(1, 'escalera', c('Ap 2p 3p'), 0),
        mesa(2, 'escalera', c('Qt Kt At'), 1),
      ],
      siguienteId: 3,
    });
    const tras = hacer(e, { tipo: 'descartar', carta: 'diamantes-13' });
    const r = tras.resultadosManos.at(-1)!;
    expect(r.cerro).toBe(0);
    expect(r.bajado).toEqual([27, 35]);
    expect(r.enMano).toEqual([0, 15]);
    expect(r.puntosMano).toEqual([27, 20]);
    expect(tras.puntos).toEqual([27, 20]);
    // Nueva mano: reparte el siguiente.
    expect(tras.manos.map((m) => m.length)).toEqual([13, 13]);
    expect(tras.combinaciones).toEqual([]);
    expect(tras.turno).toBe(1);
  });

  it('con el mazo vacío, la mano termina al descartar', () => {
    const e = enJuego([c('Kd 4c'), c('Kp 5c')], { fase: 'bajar', mazo: [] });
    const tras = hacer(e, { tipo: 'descartar', carta: 'diamantes-13' });
    const r = tras.resultadosManos.at(-1)!;
    expect(r.cerro).toBeNull();
    expect(r.puntosMano).toEqual([-4, -15]);
  });

  it('la partida termina al llegar a 500 y gana el que más tiene', () => {
    const e = enJuego([c('Kd'), c('Kp 5c')], {
      fase: 'bajar',
      puntos: [480, 430],
      combinaciones: [mesa(0, 'grupo', c('7p 7c 7d'), 0)],
      siguienteId: 1,
    });
    const tras = hacer(e, { tipo: 'descartar', carta: 'diamantes-13' });
    expect(tras.puntos).toEqual([501, 415]);
    expect(rummy500.resultado(tras)).toEqual({ ganadores: [0], empate: false, puntos: [501, 415] });
    expect(rummy500.accionesLegales(tras, 0)).toEqual([]);
  });

  it('con empate arriba se juega otra mano', () => {
    const e = enJuego([c('Kd'), c('5c')], {
      fase: 'bajar',
      puntos: [479, 510],
      combinaciones: [mesa(0, 'grupo', c('7p 7c 7d'), 0)],
      siguienteId: 1,
    });
    const tras = hacer(e, { tipo: 'descartar', carta: 'diamantes-13' });
    expect(tras.puntos).toEqual([500, 505]);
    expect(rummy500.resultado(tras)).not.toBeNull();
    const empate = enJuego([c('Kd'), c('5c')], {
      fase: 'bajar',
      puntos: [484, 510],
      combinaciones: [mesa(0, 'grupo', c('7p 7c 7d'), 0)],
      siguienteId: 1,
    });
    const tras2 = hacer(empate, { tipo: 'descartar', carta: 'diamantes-13' });
    expect(tras2.puntos).toEqual([505, 505]);
    expect(rummy500.resultado(tras2)).toBeNull();
    expect(tras2.manos.map((m) => m.length)).toEqual([13, 13]);
  });
});

describe('vista', () => {
  it('no muestra las manos ajenas ni el mazo', () => {
    const e = nueva({ jugadores: 3 });
    const v = rummy500.vistaDe(e, 0);
    const texto = JSON.stringify(v);
    for (const carta of [...e.manos[1]!, ...e.manos[2]!, ...e.mazo])
      expect(texto).not.toContain(`"${carta}"`);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(v.descarte).toEqual(e.descarte);
  });
});

describirContrato(rummy500, {
  configs: [CONFIG_RUMMY_500_POR_DEFECTO, { jugadores: 3 }, { jugadores: 4 }],
  // Cada mano se baraja la baraja entera: las cartas de las manos anteriores, que se ven en sus
  // resultados, vuelven al mazo.
  cartasOcultas: (e, asiento) => {
    // Las cartas cogidas del descarte son públicas: las muestran la última acción, la obligada y
    // la que no se puede soltar.
    const vistas = new Set<string>([
      ...e.resultadosManos.flatMap((r) => r.cartasEnMano.flat()),
      ...(e.ultimaAccion?.cartas ?? []),
      ...(e.obligada ? [e.obligada] : []),
      ...(e.noDescartar ? [e.noDescartar] : []),
    ]);
    const ocultas = [...e.mazo, ...e.manos.flatMap((m, a) => (a === asiento ? [] : m))];
    return ocultas.filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
