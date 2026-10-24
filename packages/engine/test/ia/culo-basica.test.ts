import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCuloBasica } from '../../src/ia/culo-basica';
import { IAS } from '../../src/ia/ias';
import {
  compararCulo,
  CONFIG_CULO_POR_DEFECTO,
  culo,
  type AccionCulo,
  type EstadoCulo,
  type VistaCulo,
} from '../../src/juegos/culo';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos; S, C, R y A. */
function c(texto: string): IdCarta[] {
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto
    .split(' ')
    .map((t) => {
      const v = t.slice(0, -1);
      return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
    })
    .sort(compararCulo);
}

/** Una mano de 4 en juego en la que le toca al asiento 0 con esta mano. */
function conMano(mano: string, parcial: Partial<EstadoCulo> = {}): EstadoCulo {
  const r = culo.crear(CONFIG_CULO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const propias = c(mano);
  const resto = r.valor.manos.flat().filter((x) => !propias.includes(x));
  const manos = [propias, ...[1, 2, 3].map(() => resto.splice(0, 5).sort(compararCulo))];
  return { ...r.valor, manos, turno: 0, fase: 'juego', ...parcial };
}

function decide(e: EstadoCulo, ia = iaCuloBasica): AccionCulo {
  const v = culo.vistaDe(e, e.turno);
  return ia.decidir(v, culo.accionesLegales(e, e.turno), crearAzar('x')).accion;
}

describe('IA básica del Culo', () => {
  it('abre con todas las cartas de su valor más bajo', () => {
    expect(decide(conMano('3o 3c 7e 2b'))).toEqual({ tipo: 'jugar', cartas: c('3o 3c') });
  });

  it('si solo le quedan doses, los juega', () => {
    expect(decide(conMano('2o 2c'))).toEqual({ tipo: 'jugar', cartas: c('2o 2c') });
  });

  it('responde con el valor más bajo que supera sin romper un grupo', () => {
    const e = conMano('6o So Sc Rb', { mesa: { asiento: 3, cartas: c('5e') } });
    expect(decide(e)).toEqual({ tipo: 'jugar', cartas: c('6o') });
  });

  it('rompe un grupo si no tiene otro modo de superar', () => {
    const e = conMano('4o So Sc Rb', { mesa: { asiento: 3, cartas: c('Ce') } });
    expect(decide(e)).toEqual({ tipo: 'jugar', cartas: c('Rb') });
    const f = conMano('4o So Sc Se', { mesa: { asiento: 3, cartas: c('7e') } });
    expect(decide(f)).toEqual({ tipo: 'jugar', cartas: c('So') });
  });

  it('guarda los doses si le quedan muchos valores', () => {
    const e = conMano('3o 5c 7e Rb 2o', { mesa: { asiento: 3, cartas: c('Ae') } });
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('corta con los doses si después le quedan dos valores o menos', () => {
    const e = conMano('3o 5c 2o', { mesa: { asiento: 3, cartas: c('Ae') } });
    expect(decide(e)).toEqual({ tipo: 'jugar', cartas: c('2o') });
  });

  it('devuelve en el intercambio sus cartas bajas, primero las sueltas', () => {
    const r = culo.crear(CONFIG_CULO_POR_DEFECTO, 'ia');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoCulo = {
      ...conMano('3o 3c 4e 6b So Rb Ao 2o 2c 2e'),
      fase: 'intercambio',
      intercambios: [{ da: 3, recibe: 0, dadas: c('2o 2c'), devueltas: null }],
    };
    expect(decide(e)).toEqual({ tipo: 'devolver', cartas: c('4e 6b') });
  });
});

describe('IA difícil del Culo', () => {
  it('decide como la normal en el intercambio', () => {
    const e: EstadoCulo = {
      ...conMano('3o 3c 4e 6b So Rb Ao 2o 2c 2e'),
      fase: 'intercambio',
      intercambios: [{ da: 3, recibe: 0, dadas: c('2o 2c'), devueltas: null }],
    };
    expect(decide(e, IAS.culo.dificil)).toEqual(decide(e));
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano('3o 5c 7e Rb 2o', { mesa: { asiento: 3, cartas: c('4e') } });
    const v = culo.vistaDe(e, 0);
    const acciones = culo.accionesLegales(e, 0);
    const a = IAS.culo.dificil.decidir(v, acciones, crearAzar('s'));
    const b = IAS.culo.dificil.decidir(v, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });
});

describe('garantías de la IA del Culo', () => {
  const azar = aleatorio<VistaCulo, AccionCulo>();

  it('200 partidas entre IAs, de 3 a 6, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [3, 4, 5, 6] as const) {
      const r = duelo(
        culo,
        { jugadores },
        iaCuloBasica,
        IAS.culo.facil,
        50,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      culo,
      CONFIG_CULO_POR_DEFECTO,
      iaCuloBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      culo,
      CONFIG_CULO_POR_DEFECTO,
      IAS.culo.dificil,
      iaCuloBasica,
      3,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
