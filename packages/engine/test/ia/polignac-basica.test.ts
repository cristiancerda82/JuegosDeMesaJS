import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaPolignacBasica } from '../../src/ia/polignac-basica';
import {
  CONFIG_POLIGNAC_POR_DEFECTO,
  polignac,
  type AccionPolignac,
  type ConfigPolignac,
  type EstadoPolignac,
  type VistaPolignac,
} from '../../src/juegos/polignac';
import { duelo, unoContraTodos } from './duelo';

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
const una = (t: string) => c(t)[0]!;

function base(): EstadoPolignac {
  const r = polignac.crear(CONFIG_POLIGNAC_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoPolignac) =>
  iaPolignacBasica.decidir(
    polignac.vistaDe(e, e.turno),
    polignac.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

/** El asiento 1 decide con esta mano. */
const conMano = (mano: string, parcial: Partial<EstadoPolignac> = {}): EstadoPolignac => ({
  ...base(),
  turno: 1,
  manos: [[], c(mano), [], []],
  ...parcial,
});

describe('IA básica del Polignac', () => {
  it('anuncia el general con las cartas más altas de cada palo', () => {
    expect(decide(conMano('Ap Kp Qp Ac Kc Ad At Kt'))).toEqual({ tipo: 'general' });
  });

  it('pasa sin una racha desde el As', () => {
    expect(decide(conMano('Ap Ac Ad At Qp 8c 9d 10t'))).toEqual({ tipo: 'pasar' });
    expect(decide(conMano('Ap Ac Ad At Qp'))).toEqual({ tipo: 'pasar' });
  });

  it('sin el palo, se descarta de la J de picas', () => {
    const e = conMano('Jp Jc 7t', { fase: 'bazas', mesa: [{ asiento: 0, carta: una('9d') }] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Jp') });
  });

  it('no gana la baza si puede evitarlo', () => {
    const e = conMano('9d Ad 7t', { fase: 'bazas', mesa: [{ asiento: 0, carta: una('10d') }] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('9d') });
  });

  it('al salir, no gasta las J y elige su palo más corto', () => {
    const e = conMano('Jp 7c 8c 9c Kd', { fase: 'bazas', mesa: [] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kd') });
  });

  it('si todas sus cartas ganan, guarda la J', () => {
    const e = conMano('Jd Ad', { fase: 'bazas', mesa: [{ asiento: 0, carta: una('9d') }] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ad') });
  });

  it('contra un general, intenta ganar la baza', () => {
    const e = conMano('8p Kp Ap', {
      fase: 'bazas',
      general: 0,
      mesa: [{ asiento: 0, carta: una('Qp') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kp') });
  });
});

describe('IA del Polignac en partidas', () => {
  const azar = aleatorio<VistaPolignac, AccionPolignac>();

  it('100 partidas entre IAs, de 3 a 6 jugadores, terminan sin acciones ilegales y rápidas', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      const config: ConfigPolignac = { ...CONFIG_POLIGNAC_POR_DEFECTO, jugadores };
      const r = duelo(
        polignac,
        config,
        iaPolignacBasica,
        IAS.polignac.facil,
        25,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(25);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      polignac,
      CONFIG_POLIGNAC_POR_DEFECTO,
      iaPolignacBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms, también con 6', () => {
    for (const jugadores of [4, 6] as const) {
      const r = duelo(
        polignac,
        { ...CONFIG_POLIGNAC_POR_DEFECTO, jugadores },
        IAS.polignac.dificil,
        iaPolignacBasica,
        1,
        unoContraTodos(jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
