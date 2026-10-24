import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaRummy500Basica } from '../../src/ia/rummy-500-basica';
import {
  CONFIG_RUMMY_500_POR_DEFECTO,
  rummy500,
  type AccionRummy500,
  type CombinacionRummy500,
  type EstadoRummy500,
  type VistaRummy500,
} from '../../src/juegos/rummy-500';
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
    const valor = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[valor] ?? Number(valor)}` as IdCarta;
  });
}

function estado(manos: IdCarta[][], parcial: Partial<EstadoRummy500> = {}): EstadoRummy500 {
  const r = rummy500.crear(CONFIG_RUMMY_500_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const descarte = parcial.descarte ?? c('2c');
  const usadas = new Set([
    ...manos.flat(),
    ...descarte,
    ...(parcial.combinaciones ?? []).flatMap((x) => x.cartas.map((y) => y.carta)),
  ]);
  const todas = [...r.valor.mazo, ...r.valor.descarte, ...r.valor.manos.flat()];
  return {
    ...r.valor,
    manos,
    descarte,
    mazo: todas.filter((x) => !usadas.has(x)).slice(0, 15),
    turno: 0,
    fase: 'robar',
    ...parcial,
  };
}

function decide(e: EstadoRummy500): AccionRummy500 {
  const vista: VistaRummy500 = rummy500.vistaDe(e, e.turno);
  return iaRummy500Basica.decidir(vista, rummy500.accionesLegales(e, e.turno), crearAzar('x'))
    .accion;
}

const RIVAL = c('Kc Qd Jt 8d 6t 4c 5d');
const mesa = (cartas: IdCarta[]): CombinacionRummy500 => ({
  id: 0,
  tipo: 'escalera',
  cartas: cartas.map((carta) => ({ carta, de: 1 })),
});

describe('IA básica del Rummy 500', () => {
  it('coge del descarte desde la carta que le deja bajar una escalera', () => {
    const e = estado([c('8p 9p 2d 5t 3c'), RIVAL], { descarte: c('Ad 7p 10c') });
    expect(decide(e)).toEqual({ tipo: 'robarDescarte', desde: 1 });
    const tras = rummy500.transicion(e, 0, { tipo: 'robarDescarte', desde: 1 });
    expect(decide(tras)).toEqual({ tipo: 'bajar', cartas: c('7p 8p 9p') });
  });

  it('roba del mazo si el descarte no le sirve', () => {
    const e = estado([c('8p 9p 2d 5t 3c'), RIVAL], { descarte: c('Ad 10c') });
    expect(decide(e)).toEqual({ tipo: 'robarMazo' });
  });

  it('baja el grupo de reinas', () => {
    const e = estado([c('Qp Qc Qt 2d 5t'), RIVAL], { fase: 'bajar' });
    expect(decide(e)).toEqual({ tipo: 'bajar', cartas: c('Qp Qc Qt') });
  });

  it('añade a la mesa', () => {
    const e = estado([c('7c 2d 5t'), RIVAL], {
      fase: 'bajar',
      combinaciones: [mesa(c('4c 5c 6c'))],
      siguienteId: 1,
    });
    expect(decide(e)).toEqual({ tipo: 'anadir', combinacion: 0, carta: 'corazones-7' });
  });

  it('suelta la carta más cara que no le sirve', () => {
    const e = estado([c('Kp 3d 4d 2t'), RIVAL], { fase: 'bajar' });
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: 'picas-13' });
  });
});

describe('garantías de la IA del Rummy 500', () => {
  const azar = aleatorio<VistaRummy500, AccionRummy500>();

  it('200 partidas entre IAs, de 2 a 4, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [2, 3, 4] as const) {
      const r = duelo(
        rummy500,
        { jugadores },
        iaRummy500Basica,
        IAS.rummy500.facil,
        jugadores === 2 ? 68 : 66,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      rummy500,
      CONFIG_RUMMY_500_POR_DEFECTO,
      iaRummy500Basica,
      azar,
      200,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('misma vista y misma semilla, misma decisión en el difícil', () => {
    const e = estado([c('8p 9p 2d 5t 3c'), RIVAL], { descarte: c('Ad 7p 10c') });
    const vista = rummy500.vistaDe(e, 0);
    const acciones = rummy500.accionesLegales(e, 0);
    const a = IAS.rummy500.dificil.decidir(vista, acciones, crearAzar('s'));
    const b = IAS.rummy500.dificil.decidir(vista, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });

  it('el difícil baja como la normal', () => {
    const e = estado([c('Qp Qc Qt 2d 5t'), RIVAL], { fase: 'bajar' });
    const { accion } = IAS.rummy500.dificil.decidir(
      rummy500.vistaDe(e, 0),
      rummy500.accionesLegales(e, 0),
      crearAzar('s'),
    );
    expect(accion).toEqual({ tipo: 'bajar', cartas: c('Qp Qc Qt') });
  });
});
