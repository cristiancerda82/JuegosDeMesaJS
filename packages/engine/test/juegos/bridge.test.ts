import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  actorBridge,
  bridge,
  CONFIG_BRIDGE_POR_DEFECTO,
  declaracionesLegalesBridge,
  puntuarManoBridge,
  vulnerabilidadBridge,
  type AccionBridge,
  type DenominacionBridge,
  type EstadoBridge,
} from '../../src/juegos/bridge';
import { describirContrato } from '../contrato/verificar-contrato';

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

function nueva(semilla = 'bridge', ciclos: 1 | 2 | 3 = 1): EstadoBridge {
  const r = bridge.crear({ ciclos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoBridge, accion: AccionBridge): EstadoBridge {
  const actor = actorBridge(e);
  const r = aplicar(bridge, e, actor, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${actor}: ${r.error}`);
  return r.valor;
}

const pasar: AccionBridge = { tipo: 'pasar' };
const puja = (nivel: number, denominacion: DenominacionBridge): AccionBridge => ({
  tipo: 'pujar',
  nivel,
  denominacion,
});

/** Juega la primera carta legal hasta que acabe la mano. */
function acabarMano(e: EstadoBridge): EstadoBridge {
  const manos = e.resultadosManos.length;
  while (e.resultadosManos.length === manos) {
    e = jugar(e, bridge.accionesLegales(e, actorBridge(e))[0]!);
  }
  return e;
}

describe('reparto y subasta', () => {
  it('13 cartas a cada uno y puja primero el repartidor', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(new Set(e.manos.flat()).size).toBe(52);
    expect(e.fase).toBe('subasta');
    expect(e.turno).toBe(e.repartidor);
  });

  it('solo se puja por encima de la última puja', () => {
    const legales = declaracionesLegalesBridge(
      [{ asiento: 0, declaracion: { tipo: 'pujar', nivel: 2, denominacion: 'corazones' } }],
      1,
    );
    const pujas = legales.filter((d) => d.tipo === 'pujar');
    expect(pujas).toContainEqual(puja(2, 'picas'));
    expect(pujas).toContainEqual(puja(2, 'sinTriunfo'));
    expect(pujas).toContainEqual(puja(3, 'treboles'));
    expect(pujas).not.toContainEqual(puja(2, 'diamantes'));
    expect(pujas).not.toContainEqual(puja(1, 'sinTriunfo'));
    expect(pujas).toHaveLength(2 + 5 * 5);
  });

  it('doblar y redoblar', () => {
    let e = nueva();
    e = jugar(e, pasar);
    e = jugar(e, puja(3, 'treboles'));
    expect(bridge.accionesLegales(e, 2)).toContainEqual({ tipo: 'doblar' });
    e = jugar(e, { tipo: 'doblar' });
    expect(bridge.accionesLegales(e, 3)).toContainEqual({ tipo: 'redoblar' });
    e = jugar(e, pasar);
    expect(bridge.accionesLegales(e, 0)).not.toContainEqual({ tipo: 'doblar' });
    expect(bridge.accionesLegales(e, 0)).not.toContainEqual({ tipo: 'redoblar' });
  });

  it('tres pases tras una puja cierran el contrato', () => {
    let e = nueva();
    e = jugar(e, pasar);
    e = jugar(e, pasar);
    e = jugar(e, puja(4, 'picas'));
    e = jugar(e, pasar);
    e = jugar(e, pasar);
    expect(e.fase).toBe('subasta');
    e = jugar(e, pasar);
    expect(e.fase).toBe('carteo');
    expect(e.contrato).toEqual({ nivel: 4, denominacion: 'picas', declarante: 2, doblado: 0 });
    expect(e.turno).toBe(3);
  });

  it('si pasan los cuatro se reparte de nuevo con el mismo repartidor', () => {
    let e = nueva();
    const antes = e.manos;
    for (let i = 0; i < 4; i++) e = jugar(e, pasar);
    expect(e.fase).toBe('subasta');
    expect(e.repartidor).toBe(0);
    expect(e.manoDelCiclo).toBe(0);
    expect(e.manosJugadas).toBe(0);
    expect(e.repartoRepetido).toBe(true);
    expect(e.manos).not.toEqual(antes);
  });
});

describe('declarante y muerto', () => {
  it('el declarante es el primero de la pareja en nombrar la denominación', () => {
    let e = nueva();
    e = jugar(e, puja(1, 'corazones')); // 0
    e = jugar(e, pasar);
    e = jugar(e, puja(3, 'corazones')); // 2
    e = jugar(e, pasar);
    e = jugar(e, puja(4, 'corazones')); // 0
    e = jugar(e, pasar);
    e = jugar(e, puja(5, 'corazones')); // 2: el contrato es del 2, pero declara el 0
    for (let i = 0; i < 3; i++) e = jugar(e, pasar);
    expect(e.contrato!.declarante).toBe(0);
    expect(e.turno).toBe(1);
  });

  it('el muerto se descubre tras la primera carta y juega el declarante por él', () => {
    let e = nueva();
    e = jugar(e, puja(1, 'sinTriunfo'));
    for (let i = 0; i < 3; i++) e = jugar(e, pasar);
    // Declarante 0, muerto 2; sale el 1.
    expect(bridge.vistaDe(e, 3).manoMuerto).toBeNull();
    e = jugar(e, bridge.accionesLegales(e, 1)[0]!);
    const v = bridge.vistaDe(e, 3);
    expect(v.manoMuerto).toEqual(e.manos[2]);
    expect(e.turno).toBe(2);
    expect(bridge.accionesLegales(e, 2)).toEqual([]);
    const legales = bridge.accionesLegales(e, 0);
    expect(legales.length).toBeGreaterThan(0);
    for (const a of legales) expect(e.manos[2]).toContain((a as { carta: IdCarta }).carta);
    expect(bridge.vistaDe(e, 0).juegaPorElMuerto).toBe(true);
    // El defensor no ve las cartas del declarante ni las de su compañero.
    const texto = JSON.stringify(v);
    for (const x of [...e.manos[0]!, ...e.manos[1]!]) expect(texto).not.toContain(`"${x}"`);
  });
});

describe('bazas', () => {
  it('hay que seguir el palo y, sin triunfo, un As de otro palo no gana', () => {
    let e = nueva();
    e = jugar(e, puja(3, 'sinTriunfo'));
    for (let i = 0; i < 3; i++) e = jugar(e, pasar);
    e = {
      ...e,
      manos: [c('Ad 2d'), c('2c 3c'), c('Ac 3d'), c('4c 5c')],
      turno: 1,
    };
    e = jugar(e, { tipo: 'jugar', carta: c('2c')[0]! });
    // El muerto (2) tiene corazones: solo el As de corazones.
    expect(bridge.accionesLegales(e, 0)).toEqual([{ tipo: 'jugar', carta: c('Ac')[0]! }]);
    e = jugar(e, { tipo: 'jugar', carta: c('Ac')[0]! });
    e = jugar(e, { tipo: 'jugar', carta: c('4c')[0]! });
    // El declarante no tiene corazones: juega el As de diamantes y no gana.
    e = jugar(e, { tipo: 'jugar', carta: c('Ad')[0]! });
    expect(e.ultimaBaza!.ganador).toBe(2);
    expect(e.bazas).toEqual([1, 0]);
  });
});

describe('puntuación', () => {
  const p = (
    nivel: number,
    d: DenominacionBridge,
    doblado: 0 | 1 | 2,
    bazas: number,
    vul = false,
  ) => puntuarManoBridge({ nivel, denominacion: d, doblado }, bazas, vul);

  it('mangas, parciales y slams', () => {
    expect(p(4, 'picas', 0, 10)).toEqual({ declarante: 420, defensa: 0 });
    expect(p(4, 'picas', 0, 10, true).declarante).toBe(620);
    expect(p(3, 'sinTriunfo', 0, 9).declarante).toBe(400);
    expect(p(1, 'sinTriunfo', 0, 7).declarante).toBe(90);
    expect(p(2, 'corazones', 0, 9).declarante).toBe(140);
    expect(p(5, 'treboles', 0, 11).declarante).toBe(400);
    expect(p(6, 'corazones', 0, 12).declarante).toBe(980);
    expect(p(7, 'sinTriunfo', 0, 13, true).declarante).toBe(2220);
  });

  it('doblados y redoblados cumplidos', () => {
    // 2 tréboles doblado: 80 + 50 parcial + 50 por cumplir doblado.
    expect(p(2, 'treboles', 1, 8).declarante).toBe(180);
    // 2 corazones doblado con una sobrebaza sin vulnerabilidad: 120 + 300 + 50 + 100.
    expect(p(2, 'corazones', 1, 9).declarante).toBe(570);
    // 1 sin triunfo redoblado: 160 + 300 + 100.
    expect(p(1, 'sinTriunfo', 2, 7).declarante).toBe(560);
  });

  it('multas', () => {
    expect(p(4, 'picas', 0, 8)).toEqual({ declarante: 0, defensa: 100 });
    expect(p(4, 'picas', 0, 8, true).defensa).toBe(200);
    expect(p(4, 'picas', 1, 8, true).defensa).toBe(500);
    expect(p(4, 'picas', 1, 6).defensa).toBe(800);
    expect(p(4, 'picas', 1, 5).defensa).toBe(1100);
    expect(p(3, 'sinTriunfo', 2, 8).defensa).toBe(200);
    expect(p(3, 'sinTriunfo', 2, 7, true).defensa).toBe(1000);
  });
});

describe('Chicago y partida', () => {
  it('vulnerabilidad del ciclo', () => {
    expect(vulnerabilidadBridge(0, 0)).toEqual([false, false]);
    expect(vulnerabilidadBridge(1, 1)).toEqual([false, true]);
    expect(vulnerabilidadBridge(2, 2)).toEqual([true, false]);
    expect(vulnerabilidadBridge(3, 3)).toEqual([true, true]);
  });

  it('cuatro manos por ciclo, el repartidor rota y gana la pareja con más puntos', () => {
    let e = nueva('ciclo');
    for (let mano = 0; mano < 4; mano++) {
      expect(e.repartidor).toBe(mano);
      expect(e.manoDelCiclo).toBe(mano);
      e = jugar(e, puja(1, 'treboles'));
      for (let i = 0; i < 3; i++) e = jugar(e, pasar);
      e = acabarMano(e);
    }
    expect(e.resultadosManos).toHaveLength(4);
    const fin = bridge.resultado(e)!;
    expect(fin).not.toBeNull();
    const [a, b] = e.puntos;
    if (a !== b) expect(fin.ganadores).toEqual(a > b ? [0, 2] : [1, 3]);
    expect(fin.puntos).toEqual([a, b, a, b]);
    expect(bridge.accionesLegales(e, actorBridge(e))).toEqual([]);
  });

  it('el resultado de la mano registra el contrato y los puntos', () => {
    let e = nueva('resultado');
    e = jugar(e, puja(1, 'treboles'));
    for (let i = 0; i < 3; i++) e = jugar(e, pasar);
    e = acabarMano(e);
    const r = e.resultadosManos[0]!;
    expect(r.contrato.declarante).toBe(0);
    expect(r.bazas[0] + r.bazas[1]).toBe(13);
    expect(r.diferencia).toBe(r.bazas[0] - 7);
    expect(r.puntosTras).toEqual(e.puntos);
    expect(e.repartidor).toBe(1);
    expect(e.fase).toBe('subasta');
  });

  it('con 2 ciclos se juegan 8 manos', () => {
    let e = nueva('dos', 2);
    for (let mano = 0; mano < 8; mano++) {
      expect(bridge.resultado(e)).toBeNull();
      e = jugar(e, puja(1, 'treboles'));
      for (let i = 0; i < 3; i++) e = jugar(e, pasar);
      e = acabarMano(e);
    }
    expect(bridge.resultado(e)).not.toBeNull();
  });
});

describe('vista', () => {
  it('durante la subasta no se ve ninguna carta ajena', () => {
    const e = nueva();
    const texto = JSON.stringify(bridge.vistaDe(e, 1));
    for (const x of e.manos.flatMap((m, a) => (a === 1 ? [] : m))) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(bridge, {
  configs: [CONFIG_BRIDGE_POR_DEFECTO],
  // Las manos ajenas están ocultas, salvo el muerto descubierto.
  cartasOcultas: (e, asiento) => {
    const muerto = e.contrato ? (e.contrato.declarante + 2) % 4 : null;
    const descubierto =
      e.fase === 'carteo' && (e.mesa.length > 0 || e.jugadasPor.some((j) => j.length > 0));
    // Las de la última baza de la mano anterior ya se vieron, aunque se hayan vuelto a repartir.
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos
      .flatMap((m, a) => (a === asiento || (a === muerto && descubierto) ? [] : m))
      .filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1_500,
});
