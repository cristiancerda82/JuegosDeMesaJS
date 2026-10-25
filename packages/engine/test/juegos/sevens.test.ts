import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_SEVENS_POR_DEFECTO,
  sevens,
  type AccionSevens,
  type ConfigSevens,
  type EstadoSevens,
} from '../../src/juegos/sevens';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(config: Partial<ConfigSevens> = {}, semilla = 'sevens'): EstadoSevens {
  const r = sevens.crear({ ...CONFIG_SEVENS_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const legales = (e: EstadoSevens) => sevens.accionesLegales(e, e.turno);
const hacer = (e: EstadoSevens, a: AccionSevens) => {
  const r = aplicar(sevens, e, e.turno, a);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};

/** Una mesa con escaleras armadas a mano: le toca al asiento 0. */
function mesa(
  manos: string[],
  escaleras: Partial<EstadoSevens['mesa']>,
  parcial: Partial<EstadoSevens> = {},
): EstadoSevens {
  const base = nueva({ jugadores: manos.length as 3 | 4 | 5 | 6 });
  return {
    ...base,
    manos: manos.map(c),
    mesa: {
      picas: null,
      corazones: null,
      diamantes: { bajo: 7, alto: 7 },
      treboles: null,
      ...escaleras,
    },
    turno: 0,
    ...parcial,
  };
}

describe('Reparto y salida del Sevens', () => {
  it('con 5 jugadores, dos tienen 11 cartas y tres 10, sin repetir', () => {
    const e = nueva({ jugadores: 5 });
    expect([...e.manos.map((m) => m.length)].sort()).toEqual([10, 10, 10, 11, 11]);
    expect(new Set(e.manos.flat()).size).toBe(52);
  });

  it('abre quien tiene el 7 de diamantes, y solo puede jugarlo', () => {
    for (let i = 0; i < 8; i++) {
      const e = nueva({}, `salida-${i}`);
      expect(e.manos[e.turno]).toContain('diamantes-7');
      expect(legales(e)).toEqual([{ tipo: 'jugar', carta: 'diamantes-7' }]);
    }
  });

  it('no se juega con 2 ni con 7', () => {
    expect(sevens.crear({ jugadores: 2 as 3 }, 'x').ok).toBe(false);
    expect(sevens.crear({ jugadores: 7 as 3 }, 'x').ok).toBe(false);
  });
});

describe('Escaleras del Sevens', () => {
  it('se alarga por los dos lados', () => {
    const e = mesa(['4c 10c 3c', '2t', '3t'], { corazones: { bajo: 5, alto: 9 } });
    expect(legales(e)).toEqual([
      { tipo: 'jugar', carta: 'corazones-4' },
      { tipo: 'jugar', carta: 'corazones-10' },
    ]);
  });

  it('un palo sin abrir solo admite su 7', () => {
    const e = mesa(['8p 7p', '2t', '3t'], {});
    expect(legales(e)).toEqual([{ tipo: 'jugar', carta: 'picas-7' }]);
  });

  it('jugar alarga la escalera', () => {
    const e = hacer(mesa(['8d 2t', '2c', '3c'], {}), { tipo: 'jugar', carta: 'diamantes-8' });
    expect(e.mesa.diamantes).toEqual({ bajo: 7, alto: 8 });
    expect(e.turno).toBe(1);
  });
});

describe('Jugar es obligatorio en el Sevens', () => {
  it('con jugada no se puede pasar; sin ella, solo pasar', () => {
    expect(legales(mesa(['8d 2t', '2c', '3c'], {}))).not.toContainEqual({ tipo: 'pasar' });
    const sin = mesa(['2t', '2c', '3c'], {});
    expect(legales(sin)).toEqual([{ tipo: 'pasar' }]);
    expect(hacer(sin, { tipo: 'pasar' }).turno).toBe(1);
  });
});

describe('Fin de la mano y partida del Sevens', () => {
  it('quien se queda sin cartas cierra la mano y los demás suman las suyas', () => {
    const e = hacer(mesa(['8d', '2c 3c 4c', '2t 3t 4t 5t 6t', 'Kp Qp Jp 10p 9p 2p 3p 4p'], {}), {
      tipo: 'jugar',
      carta: 'diamantes-8',
    });
    const r = e.resultadosManos[0]!;
    expect(r.ganador).toBe(0);
    expect(r.puntos).toEqual([0, 3, 5, 8]);
    expect(e.totales).toEqual([0, 3, 5, 8]);
    // Empieza otra mano con el repartidor siguiente.
    expect(e.manos.flat()).toHaveLength(52);
  });

  it('al llegar alguien a 50, gana quien menos tiene', () => {
    const e = hacer(mesa(['8d', '2c 3c', '2t', 'Kp Qp'], {}, { totales: [19, 50, 40, 10] }), {
      tipo: 'jugar',
      carta: 'diamantes-8',
    });
    expect(e.totales).toEqual([19, 52, 41, 12]);
    expect(sevens.resultado(e)).toEqual({
      ganadores: [3],
      empate: false,
      puntos: [19, 52, 41, 12],
    });
    expect(sevens.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('sin llegar a 50, la partida sigue', () => {
    const e = hacer(mesa(['8d', '2c 3c', '2t', 'Kp Qp'], {}, { totales: [10, 20, 30, 40] }), {
      tipo: 'jugar',
      carta: 'diamantes-8',
    });
    expect(sevens.resultado(e)).toBeNull();
  });
});

describe('Vista del jugador en el Sevens', () => {
  it('no muestra las cartas de los demás', () => {
    const e = nueva();
    const v = sevens.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    const texto = JSON.stringify(v);
    for (const carta of e.manos[1]!) expect(texto).not.toContain(`"${carta}"`);
  });
});

describirContrato(sevens, {
  configs: [CONFIG_SEVENS_POR_DEFECTO, { jugadores: 3 }, { jugadores: 6 }],
  // La última acción muestra una carta jugada, que ya está en la mesa o, tras otra mano, en una
  // mano nueva.
  cartasOcultas: (e, asiento) => {
    const vista = e.ultimaAccion?.tipo === 'jugar' ? e.ultimaAccion.carta : null;
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => x !== vista);
  },
  pasosMaximos: 300,
});
