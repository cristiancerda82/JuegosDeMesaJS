import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { aleatorio } from '../../src/ia/agente';
import { iaCanastaBasica } from '../../src/ia/canasta-basica';
import { IAS } from '../../src/ia/ias';
import {
  canasta,
  compararCanasta,
  CONFIG_CANASTA_POR_DEFECTO,
  type AccionCanasta,
  type CartaCanasta,
  type CombinacionCanasta,
  type EstadoCanasta,
  type VistaCanasta,
} from '../../src/juegos/canasta';
import { duelo, porBandos } from './duelo';

let copias = new Map<string, number>();
/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): CartaCanasta[] {
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
    return `${base}#${n}` as CartaCanasta;
  });
}

function mesa(mano: string, parcial: Partial<EstadoCanasta> = {}): EstadoCanasta {
  copias = new Map();
  const r = canasta.crear(CONFIG_CANASTA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const propia = c(mano).sort(compararCanasta);
  const resto = [...r.valor.manos.flat(), ...r.valor.mazo].filter((x) => !propia.includes(x));
  return {
    ...r.valor,
    manos: [propia, resto.splice(0, 5), resto.splice(0, 5), resto.splice(0, 5)],
    mazo: resto.slice(0, 30),
    pozo: [],
    congelado: false,
    combinaciones: [],
    treses: [[], []],
    conocidas: [[], [], [], []],
    turno: 0,
    fase: 'bajar',
    ...parcial,
  };
}

function decide(e: EstadoCanasta, ia = iaCanastaBasica): AccionCanasta {
  const acciones = canasta.accionesLegales(e, e.turno);
  return ia.decidir(canasta.vistaDe(e, e.turno), acciones, crearAzar('x')).accion;
}

const canastaDeReyes = (): CombinacionCanasta => ({
  id: 0,
  bando: 0,
  valor: 13,
  cartas: c('Kp Kc Kd Kt Kp Kc Kd'),
});

describe('IA básica de la Canasta', () => {
  it('se lleva el pozo con dos nueves si su pareja ya ha bajado', () => {
    const e = mesa('9p 9c 5d 6t', { fase: 'robar', abierto: [true, false] });
    const pozo = c('4t 9d');
    expect(decide({ ...e, pozo }).tipo).toBe('tomarPozo');
  });

  it('descarta el 3 negro', () => {
    const e = mesa('3p 5d 6t 9c', { abierto: [true, false] });
    const d = decide(e);
    expect(d.tipo).toBe('descartar');
    expect(d.tipo === 'descartar' && d.carta.startsWith('picas-3')).toBe(true);
  });

  it('con canasta, baja los cuatros y cierra descartando el 9', () => {
    let e = mesa('4p 4c 4d 9t', { abierto: [true, false] });
    e = { ...e, combinaciones: [canastaDeReyes()], siguienteId: 1 };
    const primera = decide(e);
    expect(primera).toMatchObject({ tipo: 'bajar' });
    e = canasta.transicion(e, 0, primera);
    const segunda = decide(e);
    expect(segunda.tipo).toBe('descartar');
    e = canasta.transicion(e, 0, segunda);
    expect(e.resultadosManos[0]!.cierra).toBe(0);
  });

  it('en la primera bajada baja solo si llega al mínimo', () => {
    // 3 cincos (15): no llega a 50, descarta.
    expect(decide(mesa('5p 5c 5d 9t 7c')).tipo).toBe('descartar');
    // 3 ases y 3 reyes (90): baja.
    expect(decide(mesa('Ap Ac Ad Kp Kc Kd 9t 7c')).tipo).toBe('bajar');
  });

  it('nunca descarta un comodín si tiene otra carta', () => {
    copias = new Map();
    const e = mesa('2p 9t 7c', { abierto: [true, false] });
    const d = decide(e);
    expect(d.tipo === 'descartar' && !d.carta.startsWith('picas-2')).toBe(true);
  });
});

describe('IA difícil de la Canasta', () => {
  it('baja como la normal, sin simular', () => {
    const e = mesa('Ap Ac Ad Kp Kc Kd 9t 7c');
    expect(decide(e, IAS.canasta.dificil)).toEqual(decide(e));
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = mesa('9p 9c 5d 6t 7c', { fase: 'robar', abierto: [true, false], pozo: c('4t 9d') });
    const v = canasta.vistaDe(e, 0);
    const acciones = canasta.accionesLegales(e, 0);
    const a = IAS.canasta.dificil.decidir(v, acciones, crearAzar('s'));
    const b = IAS.canasta.dificil.decidir(v, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });
});

describe('garantías de la IA de la Canasta', () => {
  const azar = aleatorio<VistaCanasta, AccionCanasta>();

  it(
    '100 partidas entre IAs terminan sin acciones ilegales y rápidas',
    { timeout: 600_000 },
    () => {
      const r = duelo(
        canasta,
        CONFIG_CANASTA_POR_DEFECTO,
        iaCanastaBasica,
        IAS.canasta.facil,
        100,
        porBandos,
        'sim',
      );
      expect(r.partidas).toBe(100);
      expect(r.maxMs).toBeLessThan(500);
    },
  );

  it('gana claramente al azar', { timeout: 600_000 }, () => {
    const r = duelo(
      canasta,
      CONFIG_CANASTA_POR_DEFECTO,
      iaCanastaBasica,
      azar,
      100,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', { timeout: 600_000 }, () => {
    const r = duelo(
      canasta,
      CONFIG_CANASTA_POR_DEFECTO,
      IAS.canasta.dificil,
      iaCanastaBasica,
      2,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
