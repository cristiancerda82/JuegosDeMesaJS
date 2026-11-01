import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaKlaverjasBasica, valorTriunfoKlaverjas } from '../../src/ia/klaverjas-basica';
import {
  klaverjas,
  type AccionKlaverjas,
  type EstadoKlaverjas,
  type VistaKlaverjas,
} from '../../src/juegos/klaverjas';
import { duelo, porBandos } from './duelo';

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

/** Partidas cortas para las pruebas. */
const CONFIG = { jugadores: 4, manos: 2 } as const;

function preparado(parcial: Partial<EstadoKlaverjas>): EstadoKlaverjas {
  const r = klaverjas.crear(CONFIG, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, ...parcial };
}

const decide = (e: EstadoKlaverjas) =>
  iaKlaverjasBasica.decidir(
    klaverjas.vistaDe(e, e.turno),
    klaverjas.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Klaverjas', () => {
  it('juega con un triunfo fuerte', () => {
    const mano = c('Jc 9c Ac 10c 7p 8p 7d 8d');
    expect(valorTriunfoKlaverjas(mano, 'corazones')).toBeGreaterThanOrEqual(16);
    const e = preparado({ propuesto: 'corazones', manos: [mano, [], [], []] });
    expect(decide(e)).toEqual({ tipo: 'jugar' });
  });

  it('pasa con un triunfo flojo', () => {
    const e = preparado({
      propuesto: 'corazones',
      manos: [c('7c 8p 9p Kp 8d 9d Qt Kt'), [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('si pasan todos, elige el palo que más vale', () => {
    const e = preparado({
      fase: 'eleccion',
      manos: [c('Jt 9t At 7c 8p 9p 8d 9d'), [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'elegir', palo: 'treboles' });
  });

  it('carga a su compañero', () => {
    const e = preparado({
      fase: 'bazas',
      triunfo: 'treboles',
      juega: 0,
      turno: 2,
      manos: [c('7d'), c('7d'), c('10p 7p'), c('7d')],
      mesa: [
        { asiento: 0, carta: una('Ap') },
        { asiento: 1, carta: una('8p') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'carta', carta: una('10p') });
  });
});

describe('IA difícil del Klaverjas', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = klaverjas.crear(CONFIG, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoKlaverjas = { ...r.valor, fase: 'bazas', triunfo: 'corazones', juega: 0 };
    const v = klaverjas.vistaDe(e, e.turno);
    const acciones = klaverjas.accionesLegales(e, e.turno);
    expect(IAS.klaverjas.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.klaverjas.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Klaverjas', () => {
  const azar = aleatorio<VistaKlaverjas, AccionKlaverjas>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      klaverjas,
      CONFIG,
      iaKlaverjasBasica,
      IAS.klaverjas.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(klaverjas, CONFIG, iaKlaverjasBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      klaverjas,
      CONFIG,
      IAS.klaverjas.dificil,
      iaKlaverjasBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
