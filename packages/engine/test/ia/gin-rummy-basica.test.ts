import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaGinRummyBasica } from '../../src/ia/gin-rummy-basica';
import { IAS } from '../../src/ia/ias';
import { reconstruirGinRummy } from '../../src/ia/reconstruir/gin-rummy';
import {
  CONFIG_GIN_RUMMY_POR_DEFECTO,
  ginRummy,
  type AccionGinRummy,
  type EstadoGinRummy,
  type VistaGinRummy,
} from '../../src/juegos/gin-rummy';
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

/** Una partida en curso con estas manos, para sacar vistas y acciones legales reales. */
function estado(
  manos: [IdCarta[], IdCarta[]],
  parcial: Partial<EstadoGinRummy> = {},
): EstadoGinRummy {
  const r = ginRummy.crear(CONFIG_GIN_RUMMY_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const descarte = parcial.descarte ?? c('2c');
  const usadas = new Set([...manos.flat(), ...descarte]);
  return {
    ...r.valor,
    manos,
    descarte,
    mazo: r.valor.mazo.filter((x) => !usadas.has(x)).slice(0, 20),
    turno: 0,
    fase: 'robar',
    ...parcial,
  };
}

function decide(e: EstadoGinRummy): AccionGinRummy {
  const vista: VistaGinRummy = ginRummy.vistaDe(e, e.turno);
  return iaGinRummyBasica.decidir(vista, ginRummy.accionesLegales(e, e.turno), crearAzar('x'))
    .accion;
}

const RIVAL = c('Kc Qd Jt 8d 6t 4c 5d 9t Qp 6d');

describe('IA básica del Gin Rummy', () => {
  it('coge el descarte que liga con sus cartas', () => {
    const e = estado([c('5c 6c Kp Qt 9d 2t 3d Jd Ap 8p'), RIVAL], { descarte: c('7c') });
    expect(decide(e)).toEqual({ tipo: 'robar', desde: 'descarte' });
  });

  it('roba del mazo si el descarte no le sirve', () => {
    const e = estado([c('5c 6c Kp Qt 9d 2t 3d Jd Ap 8p'), RIVAL], {
      descarte: c('10t'),
    });
    expect(decide(e)).toEqual({ tipo: 'robar', desde: 'mazo' });
  });

  it('con la primera carta, la coge si le sirve y si no pasa', () => {
    const mano = c('5c 6c Kp Qt 9d 2t 3d Jd Ap 8p');
    expect(decide(estado([mano, RIVAL], { fase: 'primera', descarte: c('7c') }))).toEqual({
      tipo: 'robar',
      desde: 'descarte',
    });
    expect(decide(estado([mano, RIVAL], { fase: 'primera', descarte: c('10t') }))).toEqual({
      tipo: 'pasar',
    });
  });

  it('suelta la carta más cara que no le sirve', () => {
    // La K de picas no tiene pareja ni vecinas; el 3 de diamantes va junto al 4.
    const e = estado([c('Ap 2p 3p 7t 7c 7d 3d 4d Kp 9c 5t'), RIVAL], { fase: 'descartar' });
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: 'picas-13' });
  });

  it('cierra en cuanto puede, con la carta que deja menos', () => {
    // Soltando el 5 quedan 4 puntos sueltos.
    const e = estado([c('Ap 2p 3p 7t 7c 7d 9c 10c Jc 4d 5t'), RIVAL], {
      fase: 'descartar',
    });
    const accion = decide(e);
    expect(accion.tipo).toBe('cerrar');
  });

  it('cierra con Gin si puede', () => {
    const e = estado([c('Ap 2p 3p 7t 7c 7d 9c 10c Jc Qc Kd'), RIVAL], { fase: 'descartar' });
    expect(decide(e)).toEqual({ tipo: 'cerrar', carta: 'diamantes-13' });
  });
});

describe('garantías de la IA del Gin Rummy', () => {
  const azar = aleatorio<VistaGinRummy, AccionGinRummy>();

  it('500 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      ginRummy,
      CONFIG_GIN_RUMMY_POR_DEFECTO,
      iaGinRummyBasica,
      IAS.ginRummy.facil,
      500,
      unoContraTodos(2),
      'sim',
    );
    expect(r.partidas).toBe(500);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      ginRummy,
      CONFIG_GIN_RUMMY_POR_DEFECTO,
      iaGinRummyBasica,
      azar,
      500,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(400);
  });

  it('misma vista y misma semilla, misma decisión en el difícil', () => {
    const e = estado([c('Ap 2p 3p 7t 7c 7d 3d 4d Kp 9c 5t'), RIVAL], { fase: 'descartar' });
    const vista = ginRummy.vistaDe(e, 0);
    const acciones = ginRummy.accionesLegales(e, 0);
    const a = IAS.ginRummy.dificil.decidir(vista, acciones, crearAzar('s'));
    const b = IAS.ginRummy.dificil.decidir(vista, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });

  it('el difícil cierra como la normal', () => {
    const e = estado([c('Ap 2p 3p 7t 7c 7d 9c 10c Jc Qc Kd'), RIVAL], { fase: 'descartar' });
    const vista = ginRummy.vistaDe(e, 0);
    const { accion } = IAS.ginRummy.dificil.decidir(
      vista,
      ginRummy.accionesLegales(e, 0),
      crearAzar('s'),
    );
    expect(accion).toEqual({ tipo: 'cerrar', carta: 'diamantes-13' });
  });
});

describe('reconstrucción del Gin Rummy', () => {
  it('las cartas que el rival cogió del descarte siguen en su mano', () => {
    const e = estado([c('Ap 2p 3p 7t 7c 7d 3d 4d Kp 9c'), RIVAL], {
      turno: 1,
      descarte: c('2c Kt'),
    });
    const cogida = ginRummy.transicion(e, 1, { tipo: 'robar', desde: 'descarte' });
    const tras = ginRummy.transicion(cogida, 1, { tipo: 'descartar', carta: 'corazones-13' });
    const vista = ginRummy.vistaDe(tras, 0);
    expect(vista.cogidas[1]).toEqual(['treboles-13']);
    for (let k = 0; k < 30; k++) {
      const rec = reconstruirGinRummy(vista, crearAzar(`r-${k}`));
      expect(rec.manos[1]).toContain('treboles-13');
      expect(ginRummy.vistaDe(rec, 0)).toEqual(vista);
    }
  });
});
