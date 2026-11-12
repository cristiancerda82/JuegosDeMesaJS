import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { aleatorio } from '../../src/ia/agente';
import { iaHandAndFootBasica } from '../../src/ia/hand-and-foot-basica';
import { IAS } from '../../src/ia/ias';
import { compararCanasta } from '../../src/juegos/canasta';
import {
  handAndFoot,
  type AccionHandAndFoot,
  type CartaHandAndFoot,
  type ConfigHandAndFoot,
  type EstadoHandAndFoot,
  type VistaHandAndFoot,
} from '../../src/juegos/hand-and-foot';
import { duelo, porBandos } from './duelo';

let copias = new Map<string, number>();
/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): CartaHandAndFoot[] {
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const base = `${palos[t.at(-1)!]}-${valores[t.slice(0, -1)] ?? Number(t.slice(0, -1))}`;
    const n = copias.get(base) ?? 0;
    copias.set(base, n + 1);
    return `${base}#${n}` as CartaHandAndFoot;
  });
}

function mesa(mano: string, parcial: Partial<EstadoHandAndFoot> = {}): EstadoHandAndFoot {
  copias = new Map();
  const r = handAndFoot.crear({ rondas: 1 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  const propia = c(mano).sort(compararCanasta);
  return {
    ...r.valor,
    manos: r.valor.manos.map((m, a) => (a === 0 ? propia : m)),
    descarte: [],
    combinaciones: [],
    treses: [[], []],
    turno: 0,
    fase: 'bajar',
    ...parcial,
  };
}

function decide(e: EstadoHandAndFoot, ia = iaHandAndFootBasica): AccionHandAndFoot {
  const acciones = handAndFoot.accionesLegales(e, e.turno);
  return ia.decidir(handAndFoot.vistaDe(e, e.turno), acciones, crearAzar('x')).accion;
}

describe('IA básica del Hand and Foot', () => {
  it('coge el descarte con dos nueves si su pareja ya ha bajado', () => {
    const e = mesa('9p 9c 5d 6t 7c', {
      fase: 'robar',
      abierto: [true, false],
      descarte: c('4t 9d'),
    });
    expect(decide(e).tipo).toBe('cogerDescarte');
  });

  it('descarta el 3 negro', () => {
    const e = mesa('3p 9c 5d Kt', { abierto: [true, false] });
    expect(decide(e)).toMatchObject({
      tipo: 'descartar',
      carta: expect.stringMatching(/^picas-3#/),
    });
  });

  it('termina un libro con un comodín', () => {
    const e = mesa('2c 5d 9t', {
      abierto: [true, false],
      combinaciones: [{ id: 0, bando: 0, valor: 13, cartas: c('Kp Kc Kd Kt Kp Kc') }],
      siguienteId: 1,
    });
    expect(decide(e)).toMatchObject({
      tipo: 'anadir',
      combinacion: 0,
      cartas: [expect.stringMatching(/^corazones-2#/)],
    });
  });

  it('en la primera bajada baja solo si llega al mínimo', () => {
    expect(decide(mesa('5p 5c 5d 9t Kc')).tipo).toBe('descartar');
    expect(decide(mesa('Ap Ac Ad Kp Kc Kd 9t'))).toMatchObject({ tipo: 'bajar' });
  });

  it('nunca descarta un comodín si tiene otra carta', () => {
    const e = mesa('2c 2d Kt', { abierto: [true, false] });
    const a = decide(e);
    expect(a).toMatchObject({ tipo: 'descartar', carta: expect.stringMatching(/^treboles-13#/) });
  });
});

describe('IA difícil del Hand and Foot', () => {
  it('añade un comodín a un libro como la normal, sin simular', () => {
    const e = mesa('2c 5d 9t', {
      abierto: [true, false],
      combinaciones: [{ id: 0, bando: 0, valor: 13, cartas: c('Kp Kc Kd Kt Kp Kc') }],
      siguienteId: 1,
    });
    expect(decide(e, IAS.handAndFoot.dificil)).toEqual(decide(e));
  });
});

describe('garantías de la IA del Hand and Foot', () => {
  const azar = aleatorio<VistaHandAndFoot, AccionHandAndFoot>();
  const corta: ConfigHandAndFoot = { rondas: 1 };

  it(
    '100 partidas entre IAs terminan sin acciones ilegales y rápidas',
    { timeout: 900_000 },
    () => {
      const r = duelo(
        handAndFoot,
        corta,
        iaHandAndFootBasica,
        IAS.handAndFoot.facil,
        100,
        porBandos,
        'sim',
      );
      expect(r.partidas).toBe(100);
      expect(r.maxMs).toBeLessThan(500);
    },
  );

  it('gana claramente al azar', { timeout: 900_000 }, () => {
    const r = duelo(handAndFoot, corta, iaHandAndFootBasica, azar, 100, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', { timeout: 900_000 }, () => {
    const r = duelo(
      handAndFoot,
      corta,
      IAS.handAndFoot.dificil,
      iaHandAndFootBasica,
      2,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
