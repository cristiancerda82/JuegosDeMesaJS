import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaEcarteBasica } from '../../src/ia/ecarte-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_ECARTE_POR_DEFECTO,
  ecarte,
  type AccionEcarte,
  type EstadoEcarte,
  type VistaEcarte,
} from '../../src/juegos/ecarte';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «Kp» es el rey de picas; c, d y t, corazones, diamantes y tréboles. */
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

/** Mano del 0 con triunfo de corazones (vuelta 7c). */
function preparado(mano: string, parcial: Partial<EstadoEcarte> = {}): EstadoEcarte {
  const r = ecarte.crear(CONFIG_ECARTE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    vuelta: c('7c')[0]!,
    manos: [c(mano), c('9t 10t Jt Qt Kt')],
    turno: 0,
    ...parcial,
  };
}

const decide = (e: EstadoEcarte) =>
  iaEcarteBasica.decidir(
    ecarte.vistaDe(e, e.turno),
    ecarte.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Écarté', () => {
  it('juega de autoridad con buena mano', () => {
    expect(decide(preparado('Kc Qc Jc 7p 8d'))).toEqual({ tipo: 'jugar' });
  });

  it('propone con mala mano', () => {
    expect(decide(preparado('7p 8p 9d 10d Jt'))).toEqual({ tipo: 'proponer' });
  });

  it('se descarta del 8 y del 7', () => {
    let e = preparado('9c 10c Kp 8d 7t', { fase: 'descarte', cambiando: 0 });
    const tiradas: IdCarta[] = [];
    for (let i = 0; i < 5; i++) {
      const a = decide(e);
      if (a.tipo !== 'descartar') break;
      tiradas.push(a.carta);
      e = ecarte.transicion(e, 0, a);
    }
    expect(tiradas.sort()).toEqual(c('8d 7t').sort());
    expect(decide(e)).toEqual({ tipo: 'robar' });
  });
});

describe('IA difícil del Écarté', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = ecarte.crear(CONFIG_ECARTE_POR_DEFECTO, 'dificil');
    if (!e.ok) throw new Error(e.error);
    const estado = ecarte.transicion(e.valor, 0, { tipo: 'jugar' });
    const v = ecarte.vistaDe(estado, estado.turno);
    const acciones = ecarte.accionesLegales(estado, estado.turno);
    expect(IAS.ecarte.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.ecarte.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Écarté', () => {
  const azar = aleatorio<VistaEcarte, AccionEcarte>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      ecarte,
      CONFIG_ECARTE_POR_DEFECTO,
      iaEcarteBasica,
      IAS.ecarte.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      ecarte,
      CONFIG_ECARTE_POR_DEFECTO,
      iaEcarteBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      ecarte,
      CONFIG_ECARTE_POR_DEFECTO,
      IAS.ecarte.dificil,
      iaEcarteBasica,
      2,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
