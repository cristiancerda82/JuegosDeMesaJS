import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_BEZIQUE,
  bezique,
  cantesPosiblesBezique,
  CONFIG_BEZIQUE_POR_DEFECTO,
  type AccionBezique,
  type EstadoBezique,
  type UsadasBezique,
} from '../../src/juegos/bezique';
import { aplicar } from '../../src/motor/aplicar';
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
const una = (t: string) => c(t)[0]!;

function nueva(semilla = 'bezique'): EstadoBezique {
  const r = bezique.crear(CONFIG_BEZIQUE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoBezique, accion: AccionBezique): EstadoBezique {
  const r = aplicar(bezique, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoBezique) => bezique.accionesLegales(e, e.turno);
const sinUsadas = (): UsadasBezique => ({
  matrimonio: [],
  bezique: [],
  dobleBezique: [],
  cuatroJ: [],
  cuatroQ: [],
  cuatroK: [],
  cuatroA: [],
  escalera: [],
  siete: [],
});

/** Un estado preparado: triunfo corazones, le toca al 0. */
function preparado(parcial: Partial<EstadoBezique>): EstadoBezique {
  return {
    ...nueva(),
    triunfo: 'corazones',
    vuelta: una('9c'),
    manos: [c('Kc Qc 8t 9p'), c('Ap 10d 7t Jt')],
    cantadas: [[], []],
    mazo: c('8d 8p 9d 9t'),
    fase: 'bazas',
    turno: 0,
    mesa: [],
    usadas: [sinUsadas(), sinUsadas()],
    cantes: [],
    ganadas: [[], []],
    puntosMano: [0, 0],
    ...parcial,
  };
}

const jugarCarta = (carta: string): AccionBezique => ({ tipo: 'jugar', carta: una(carta) });

describe('baraja y reparto', () => {
  it('64 cartas de piquet; 8 a cada uno, la vuelta y 47 en el mazo', () => {
    expect(BARAJA_BEZIQUE).toHaveLength(64);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([8, 8]);
    expect(e.mazo).toHaveLength(47);
    expect(e.vuelta).not.toBeNull();
    expect(e.triunfo).toBe(e.vuelta!.split('-')[0]);
    expect(e.turno).toBe(0);
  });

  it('si la vuelta es un 7, el repartidor suma 10', () => {
    for (let i = 0; i < 200; i++) {
      const e = nueva(`siete-${i}`);
      if (e.vuelta!.endsWith('-7')) {
        expect(e.puntosMano[e.repartidor]).toBe(10);
        return;
      }
    }
    throw new Error('Ninguna semilla con un 7 vuelto');
  });
});

describe('bazas con mazo', () => {
  it('no hay que seguir el palo', () => {
    const e = jugar(preparado({}), jugarCarta('8t'));
    expect(legales(e)).toHaveLength(4);
  });

  it('con dos cartas iguales gana la primera', () => {
    let e = preparado({ manos: [c('Ap 8t'), c('Ap 7t')] });
    e = jugar(e, jugarCarta('Ap'));
    e = jugar(e, jugarCarta('Ap'));
    expect(e.ultimaBaza!.ganador).toBe(0);
    expect(e.fase).toBe('declarar');
  });

  it('tras declarar, roba el ganador y después el otro', () => {
    let e = preparado({});
    e = jugar(e, jugarCarta('9p'));
    e = jugar(e, jugarCarta('Ap'));
    expect(e.turno).toBe(1);
    e = jugar(e, { tipo: 'pasar' });
    expect(e.manos[1]).toContain(una('9t'));
    expect(e.manos[0]).toContain(una('9d'));
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.fase).toBe('bazas');
  });

  it('la última del mazo para el ganador y la vuelta para el otro; después, las últimas bazas', () => {
    let e = preparado({ mazo: c('8d') });
    e = jugar(e, jugarCarta('9p'));
    e = jugar(e, jugarCarta('Ap'));
    e = jugar(e, { tipo: 'pasar' });
    expect(e.manos[1]).toContain(una('8d'));
    expect(e.manos[0]).toContain(una('9c'));
    expect(e.vuelta).toBeNull();
    expect(e.fase).toBe('final');
  });
});

describe('declaraciones', () => {
  it('matrimonio de triunfo: 40, y las cartas quedan cantadas', () => {
    let e = preparado({ manos: [c('Kc Qc 8t 9p'), c('Ap 10d 7t Jt')] });
    e = jugar(e, jugarCarta('8t'));
    e = jugar(e, jugarCarta('7t'));
    e = jugar(e, { tipo: 'cantar', cante: 'matrimonio', cartas: c('Kc Qc').sort() });
    expect(e.puntosMano[0]).toBe(40);
    expect([...e.cantadas[0]!].sort()).toEqual(c('Kc Qc').sort());
  });

  it('una combinación con una carta nueva se puede cantar sobre otra ya cantada', () => {
    const e = preparado({
      triunfo: 'diamantes',
      manos: [c('Kp Kc Kd Kt Qp 8t'), c('Ap')],
      cantadas: [c('Kp Kc Kd Kt'), []],
      usadas: [{ ...sinUsadas(), cuatroK: c('Kp Kc Kd Kt') }, sinUsadas()],
      fase: 'declarar',
    });
    const posibles = cantesPosiblesBezique(e, 0);
    expect(posibles).toContainEqual({ cante: 'matrimonio', cartas: c('Kp Qp').sort() });
    expect(posibles.some((p) => p.cante === 'cuatroK')).toBe(false);
  });

  it('no se repite el mismo matrimonio con las mismas cartas', () => {
    const e = preparado({
      manos: [c('Kt Qt 8p'), c('Ap')],
      cantadas: [c('Kt Qt'), []],
      usadas: [{ ...sinUsadas(), matrimonio: c('Kt Qt') }, sinUsadas()],
      fase: 'declarar',
    });
    expect(cantesPosiblesBezique(e, 0).some((p) => p.cante === 'matrimonio')).toBe(false);
  });

  it('cambiar el 7 de triunfo por la vuelta', () => {
    let e = preparado({ manos: [c('7c 8t'), c('Ap 9p')], vuelta: una('Ac') });
    e = jugar(e, jugarCarta('8t'));
    e = jugar(e, jugarCarta('9p'));
    expect(e.turno).toBe(0);
    e = jugar(e, { tipo: 'cambiar' });
    expect(e.vuelta).toBe(una('7c'));
    expect(e.manos[0]).toContain(una('Ac'));
    expect(e.puntosMano[0]).toBe(10);
  });

  it('bézique y doble bézique', () => {
    const e = preparado({
      manos: [c('Qp Qp Jd Jd'), c('Ap')],
      fase: 'declarar',
    });
    const tipos = cantesPosiblesBezique(e, 0).map((p) => p.cante);
    expect(tipos).toContain('bezique');
    expect(tipos).toContain('dobleBezique');
  });
});

describe('últimas bazas', () => {
  it('seguir el palo y superar si se puede', () => {
    let e = preparado({ fase: 'final', mazo: [], vuelta: null, manos: [c('9d'), c('8d Ad')] });
    e = jugar(e, jugarCarta('9d'));
    expect(legales(e)).toEqual([jugarCarta('Ad')]);
  });

  it('sin el palo, fallar con triunfo', () => {
    let e = preparado({ fase: 'final', mazo: [], vuelta: null, manos: [c('9t'), c('8d 7c')] });
    e = jugar(e, jugarCarta('9t'));
    expect(legales(e)).toEqual([jugarCarta('7c')]);
  });
});

describe('puntos de la mano y partida', () => {
  it('brisques y última baza al cerrar la mano', () => {
    let e = preparado({
      fase: 'final',
      mazo: [],
      vuelta: null,
      manos: [c('Ad'), c('10d')],
      ganadas: [c('Ap 10p 8t'), []],
      puntosMano: [40, 0],
    });
    e = jugar(e, jugarCarta('Ad'));
    e = jugar(e, jugarCarta('10d'));
    const r = e.resultadosManos.at(-1)!;
    expect(r.brisques).toEqual([40, 0]);
    expect(r.ultimaBaza).toBe(0);
    expect(r.puntosMano).toEqual([90, 0]);
    expect(e.puntos).toEqual([90, 0]);
    // Empieza otra mano con el otro repartidor.
    expect(e.repartidor).toBe(0);
    expect(e.manos.map((m) => m.length)).toEqual([8, 8]);
  });

  it('la partida termina al llegar a 1.000', () => {
    let e = preparado({
      fase: 'final',
      mazo: [],
      vuelta: null,
      manos: [c('Ad'), c('8d')],
      puntos: [990, 880],
    });
    e = jugar(e, jugarCarta('Ad'));
    e = jugar(e, jugarCarta('8d'));
    expect(bezique.resultado(e)).toEqual({
      ganadores: [0],
      empate: false,
      puntos: [1010, 880],
    });
  });
});

describe('vista', () => {
  it('se ven las cantadas del rival, pero no el resto de su mano ni el mazo', () => {
    const e = preparado({
      manos: [c('Kc Qc 8t 9p'), c('Ap 10d 7t Jt')],
      cantadas: [[], c('Ap')],
    });
    const v = bezique.vistaDe(e, 0);
    expect(v.cantadas[1]).toEqual(c('Ap'));
    const texto = JSON.stringify({ ...v, cantadas: [] });
    for (const x of [...c('10d 7t Jt'), ...e.mazo]) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(bezique, {
  configs: [{ objetivo: 200 }],
  // Con dos copias, una carta oculta puede tener su copia a la vista: solo cuentan las que no.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(asiento === null ? [] : e.manos[asiento]!),
      ...e.cantadas.flat(),
      ...e.ganadas.flat(),
      ...e.mesa.map((j) => j.carta),
      ...(e.vuelta ? [e.vuelta] : []),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...e.cantes.flatMap((x) => x.cartas),
    ]);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mazo].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 1_500,
});
