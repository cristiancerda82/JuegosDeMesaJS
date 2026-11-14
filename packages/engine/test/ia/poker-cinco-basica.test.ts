import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import {
  descartePokerCinco,
  iaPokerCincoBasica,
  iaPokerCincoExperta,
} from '../../src/ia/poker-cinco-basica';
import {
  CONFIG_POKER_CINCO_POR_DEFECTO,
  pokerCinco,
  type AccionPokerCinco,
  type EstadoPokerCinco,
  type VistaPokerCinco,
} from '../../src/juegos/poker-cinco';
import { duelo, unoContraTodos } from './duelo';

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
const ordenadas = (t: string) => c(t).sort();

function base(): EstadoPokerCinco {
  const r = pokerCinco.crear(CONFIG_POKER_CINCO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** El asiento 3, que habla primero antes del descarte, con esta mano. */
const conMano = (mano: IdCarta[], parcial: Partial<EstadoPokerCinco> = {}): EstadoPokerCinco => {
  const e = base();
  return { ...e, manos: e.manos.map((m, a) => (a === 3 ? mano : m)), ...parcial };
};

/** Igualando o pasando todos, hasta que le toca cambiar al primero. */
function alDescarte(): EstadoPokerCinco {
  let e = base();
  while (e.fase === 'antes') {
    const l = pokerCinco.accionesLegales(e, e.turno);
    e = pokerCinco.transicion(
      e,
      e.turno,
      l.find((a) => a.tipo === 'igualar' || a.tipo === 'pasar')!,
    );
  }
  return e;
}

const decide = (e: EstadoPokerCinco) =>
  iaPokerCincoBasica.decidir(
    pokerCinco.vistaDe(e, e.turno),
    pokerCinco.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('descarte de la IA básica', () => {
  it('con una pareja cambia las tres sueltas', () => {
    expect(descartePokerCinco(c('8p 8c Kd 4t 2p'))).toEqual(ordenadas('Kd 4t 2p'));
  });

  it('sin nada, se queda con el As y cambia cuatro', () => {
    expect(descartePokerCinco(c('Ap 9c 7d 4t 2c'))).toEqual(ordenadas('9c 7d 4t 2c'));
  });

  it('sin nada ni As, se queda con las dos más altas', () => {
    expect(descartePokerCinco(c('Kp 9c 7d 4t 2c'))).toEqual(ordenadas('7d 4t 2c'));
  });

  it('servida con color', () => {
    expect(descartePokerCinco(c('2p 5p 9p Jp Kp'))).toEqual([]);
  });

  it('con trío cambia dos y con doble pareja una', () => {
    expect(descartePokerCinco(c('7p 7c 7d Kt 2c'))).toEqual(ordenadas('Kt 2c'));
    expect(descartePokerCinco(c('7p 7c Kd Kt 2c'))).toEqual(ordenadas('2c'));
  });

  it('con cuatro al color o a escalera abierta, cambia la otra', () => {
    expect(descartePokerCinco(c('2p 5p 9p Jp Kc'))).toEqual(ordenadas('Kc'));
    expect(descartePokerCinco(c('5p 6c 7d 8t Kc'))).toEqual(ordenadas('Kc'));
  });

  it('su cambio siempre es legal', () => {
    const e = alDescarte();
    expect(pokerCinco.accionesLegales(e, e.turno)).toContainEqual(decide(e));
  });
});

describe('apuestas de la IA básica', () => {
  it('con un trío antes del descarte, sube', () => {
    expect(decide(conMano(c('7p 7c 7d Kt 2c'))).tipo).toBe('subir');
  });

  it('sin nada ante una subida, se retira', () => {
    const e = conMano(c('Kp 9c 7d 4t 2c'), { apuestaMaxima: 8, apuestas: [0, 1, 8, 0] });
    expect(decide(e)).toEqual({ tipo: 'retirarse' });
  });
});

describe('IA experta', () => {
  it('cambia las mismas cartas que la normal', () => {
    const e = alDescarte();
    const v = pokerCinco.vistaDe(e, e.turno);
    const acciones = pokerCinco.accionesLegales(e, e.turno);
    const experta = iaPokerCincoExperta.decidir(v, acciones, crearAzar('s')).accion;
    expect(experta).toEqual(decide(e));
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano(c('Jp Jc 4d 8t 2c'));
    const v = pokerCinco.vistaDe(e, 3);
    const acciones = pokerCinco.accionesLegales(e, 3);
    const a = IAS.pokerCinco.dificil.decidir(v, acciones, crearAzar('s'));
    const b = IAS.pokerCinco.dificil.decidir(v, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });
});

describe('garantías de la IA del Póker de cinco cartas', () => {
  const azar = aleatorio<VistaPokerCinco, AccionPokerCinco>();

  it('200 partidas entre IAs, de 2 a 6, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [2, 3, 4, 5, 6] as const) {
      const r = duelo(
        pokerCinco,
        { jugadores },
        iaPokerCincoBasica,
        IAS.pokerCinco.facil,
        40,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(40);
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      pokerCinco,
      CONFIG_POKER_CINCO_POR_DEFECTO,
      iaPokerCincoBasica,
      azar,
      400,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas, `${r.ganadas} de 400`).toBeGreaterThan(110);
  });

  it('la difícil decide en menos de 500 ms, también con 6', () => {
    for (const jugadores of [4, 6] as const) {
      const r = duelo(
        pokerCinco,
        { jugadores },
        IAS.pokerCinco.dificil,
        iaPokerCincoBasica,
        2,
        unoContraTodos(jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
