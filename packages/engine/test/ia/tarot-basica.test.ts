import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTarotBasica, valorManoTarot } from '../../src/ia/tarot-basica';
import { tarot, type AccionTarot, type EstadoTarot, type VistaTarot } from '../../src/juegos/tarot';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «Kp» es el Rey de picas; «t21» el 21 de triunfo y «E» la Excusa. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13, C: 14 };
  return texto.split(' ').map((t) => {
    if (t === 'E') return 'excusa';
    if (/^t\d+$/.test(t)) return `triunfo-${t.slice(1)}` as IdCarta;
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

/** Una Garde con 4 en bazas: el preneur es el 3. */
function preparado(parcial: Partial<EstadoTarot>): EstadoTarot {
  const r = tarot.crear({ jugadores: 4 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    fase: 'bazas',
    contrato: 'garde',
    preneur: 3,
    dichos: ['pasa', 'pasa', 'pasa', 'garde'],
    ...parcial,
  };
}

const decide = (e: EstadoTarot) =>
  iaTarotBasica.decidir(
    tarot.vistaDe(e, e.turno),
    tarot.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Tarot', () => {
  it('gana con lo justo una baza con puntos', () => {
    // El 0 (defensor) va ganando con la Dama de picas; el último es el preneur (3).
    const e = preparado({
      turno: 3,
      manos: [c('2c'), c('2c'), c('2c'), c('Kp 3p')],
      mesa: [
        { asiento: 0, carta: una('Qp') },
        { asiento: 1, carta: una('4p') },
        { asiento: 2, carta: una('5p') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kp') });
  });

  it('carga puntos a su bando', () => {
    // El 0 (defensor) va ganando; el 1 (defensor) no tiene corazones ni triunfos.
    const e = preparado({
      turno: 1,
      manos: [c('2p'), c('Kt 2t'), c('2p'), c('2p')],
      mesa: [{ asiento: 0, carta: una('Kc') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kt') });
  });

  it('sale con un Rey de un palo que aún no ha salido', () => {
    const e = preparado({ turno: 0, manos: [c('2p 3p Kc t5'), c('2c'), c('2c'), c('2c')] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kc') });
  });

  it('puja según su mano', () => {
    const fuerte = c('t21 E t1 t20 t19 t18 t17 t16 t15 t14 Kp Kc Kd Kt Qp 2c 3c 4c');
    expect(valorManoTarot(fuerte)).toBe(72);
    const r = tarot.crear({ jugadores: 4 }, 'puja');
    if (!r.ok) throw new Error(r.error);
    const e = { ...r.valor, manos: [fuerte, ...r.valor.manos.slice(1)] };
    expect(decide(e)).toEqual({ tipo: 'pujar', contrato: 'gardeSans' });
    const flojo = {
      ...e,
      manos: [c('2p 3p 4p 5p 6p 7p 8p 9p 10p 2c 3c 4c 5c 6c 7c 8c 9c t2'), ...e.manos.slice(1)],
    };
    expect(decide(flojo)).toEqual({ tipo: 'pasar' });
  });
});

describe('IA difícil del Tarot', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = tarot.crear({ jugadores: 4 }, 'dificil');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    e = tarot.transicion(e, e.turno, { tipo: 'pujar', contrato: 'gardeSans' });
    for (let i = 0; i < 3; i++) e = tarot.transicion(e, e.turno, { tipo: 'pasar' });
    const v = tarot.vistaDe(e, e.turno);
    const acciones = tarot.accionesLegales(e, e.turno);
    expect(IAS.tarot.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.tarot.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Tarot', () => {
  const azar = aleatorio<VistaTarot, AccionTarot>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    for (const jugadores of [3, 4, 5] as const) {
      const r = duelo(
        tarot,
        { jugadores },
        iaTarotBasica,
        IAS.tarot.facil,
        34,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(tarot, { jugadores: 4 }, iaTarotBasica, azar, 200, unoContraTodos(4), 'azar');
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      tarot,
      { jugadores: 4 },
      IAS.tarot.dificil,
      iaTarotBasica,
      1,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
