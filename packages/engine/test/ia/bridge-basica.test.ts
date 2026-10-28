import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { equilibradaBridge, iaBridgeBasica, puntosHonoresBridge } from '../../src/ia/bridge-basica';
import { IAS } from '../../src/ia/ias';
import {
  actorBridge,
  bridge,
  CONFIG_BRIDGE_POR_DEFECTO,
  type AccionBridge,
  type EstadoBridge,
  type VistaBridge,
} from '../../src/juegos/bridge';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «Ap» es el As de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(): EstadoBridge {
  const r = bridge.crear(CONFIG_BRIDGE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Aplica las declaraciones en orden desde el repartidor (el 0). */
function subasta(e: EstadoBridge, ...acciones: AccionBridge[]): EstadoBridge {
  for (const a of acciones) e = bridge.transicion(e, actorBridge(e), a);
  return e;
}

const pasar: AccionBridge = { tipo: 'pasar' };

const decide = (e: EstadoBridge) => {
  const actor = actorBridge(e);
  return iaBridgeBasica.decidir(
    bridge.vistaDe(e, actor),
    bridge.accionesLegales(e, actor),
    crearAzar('x'),
  ).accion;
};

/** El jugador 0 con esta mano. */
const conMano = (e: EstadoBridge, mano: string): EstadoBridge => ({
  ...e,
  manos: e.manos.map((m, a) => (a === 0 ? c(mano) : m)),
});

describe('valoración de la mano', () => {
  it('puntos de honores y manos equilibradas', () => {
    expect(puntosHonoresBridge(c('Ap Kp Qc Jd 2t'))).toBe(10);
    expect(equilibradaBridge(c('Ap Kp 5p 4p Ac Qc 3c Kd 4d 3d 6t 5t 3t'))).toBe(true);
    expect(equilibradaBridge(c('Ap Kp 5p 4p 2p Ac Qc 3c 2c Kd 4d 3d 6t'))).toBe(false);
  });
});

describe('IA básica del Bridge: subasta', () => {
  it('abre 1 sin triunfo con 16 puntos y una mano 4-3-3-3', () => {
    const e = conMano(nueva(), 'Ap Kp 5p 4p Ac Qc 3c Kd 4d 3d 6t 5t 3t');
    expect(decide(e)).toEqual({ tipo: 'pujar', nivel: 1, denominacion: 'sinTriunfo' });
  });

  it('abre en su palo de 5 con 13 puntos', () => {
    const e = conMano(nueva(), 'Ap Kp 9p 5p 4p Ac 3c 2c Qd 4d 3d 6t 5t');
    expect(decide(e)).toEqual({ tipo: 'pujar', nivel: 1, denominacion: 'picas' });
  });

  it('pasa con menos de 12 puntos', () => {
    const e = conMano(nueva(), 'Kp 9p 5p 4p 2p Ac 3c 2c Qd 4d 3d 6t 5t');
    expect(decide(e)).toEqual(pasar);
  });

  it('apoya el mayor del compañero', () => {
    let e = conMano(nueva(), 'Kp 5p 3p Jc 4c 3c 2c Jd 4d 3d 2d Kt 4t');
    e = subasta(e, pasar, pasar, { tipo: 'pujar', nivel: 1, denominacion: 'picas' }, pasar);
    expect(decide(e)).toEqual({ tipo: 'pujar', nivel: 2, denominacion: 'picas' });
  });

  it('Stayman sobre el 1 sin triunfo del compañero, y la contestación', () => {
    let e = conMano(nueva(), 'Ac Kc 5c 4c Qp 3p 2p Jd 4d 3d 5t 4t 3t');
    e = subasta(e, pasar, pasar, { tipo: 'pujar', nivel: 1, denominacion: 'sinTriunfo' }, pasar);
    expect(decide(e)).toEqual({ tipo: 'pujar', nivel: 2, denominacion: 'treboles' });
    // El compañero (2) contesta 2 picas si tiene cuatro y no tiene cuatro corazones.
    e = subasta(e, { tipo: 'pujar', nivel: 2, denominacion: 'treboles' }, pasar);
    e = {
      ...e,
      manos: e.manos.map((m, a) => (a === 2 ? c('Ap Kp 5p 4p Qc 3c 2c Kd Qd 3d At 5t 4t') : m)),
    };
    expect(decide(e)).toEqual({ tipo: 'pujar', nivel: 2, denominacion: 'picas' });
  });

  it('busca la manga con fallo en mayor y 25 puntos entre los dos', () => {
    // El compañero abre 1 corazón y la IA, con 16 puntos y 4 corazones, lo apoya a manga.
    let e = conMano(nueva(), 'Ac Kc 5c 4c Ap 3p 2p Kd 4d 3d Qt 4t 3t');
    e = subasta(e, pasar, pasar, { tipo: 'pujar', nivel: 1, denominacion: 'corazones' }, pasar);
    expect(decide(e)).toEqual({ tipo: 'pujar', nivel: 4, denominacion: 'corazones' });
  });
});

describe('IA básica del Bridge: carteo', () => {
  it('juega por el muerto con sus cartas', () => {
    let e = nueva();
    e = subasta(e, { tipo: 'pujar', nivel: 1, denominacion: 'sinTriunfo' }, pasar, pasar, pasar);
    e = bridge.transicion(e, 1, bridge.accionesLegales(e, 1)[0]!);
    expect(actorBridge(e)).toBe(0);
    const accion = decide(e);
    expect(accion.tipo).toBe('jugar');
    expect(e.manos[2]).toContain((accion as { carta: IdCarta }).carta);
  });

  it('el declarante arrastra mientras los rivales pueden tener triunfos', () => {
    let e = nueva();
    e = subasta(e, { tipo: 'pujar', nivel: 2, denominacion: 'picas' }, pasar, pasar, pasar);
    // Le toca salir al declarante (0) con triunfos en la mano.
    e = {
      ...e,
      manos: [c('Ap Kp 2p 3c'), c('4p 4c 5c 6c'), c('Qp 7c 8c 9c'), c('5p 10c Jc Qc')],
      turno: 0,
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('Ap')[0]! });
  });

  it('la tercera mano gana con lo más bajo si su pareja no lleva la baza', () => {
    let e = nueva();
    e = subasta(e, { tipo: 'pujar', nivel: 1, denominacion: 'sinTriunfo' }, pasar, pasar, pasar);
    // Sale el 1 con el 5 de corazones, el muerto (2) juega el 9 y le toca al 3.
    e = {
      ...e,
      manos: [c('2c 2d'), c('5c 3d'), c('9c 4d'), c('10c Kc')],
      turno: 3,
      mesa: [
        { asiento: 1, carta: c('5c')[0]! },
        { asiento: 2, carta: c('9c')[0]! },
      ],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('10c')[0]! });
  });
});

describe('IA difícil del Bridge', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    let e = nueva();
    e = subasta(e, { tipo: 'pujar', nivel: 3, denominacion: 'sinTriunfo' }, pasar, pasar, pasar);
    const v = bridge.vistaDe(e, 1);
    const acciones = bridge.accionesLegales(e, 1);
    expect(IAS.bridge.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.bridge.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Bridge', () => {
  const azar = aleatorio<VistaBridge, AccionBridge>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      bridge,
      CONFIG_BRIDGE_POR_DEFECTO,
      iaBridgeBasica,
      IAS.bridge.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      bridge,
      CONFIG_BRIDGE_POR_DEFECTO,
      iaBridgeBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      bridge,
      CONFIG_BRIDGE_POR_DEFECTO,
      IAS.bridge.dificil,
      iaBridgeBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
