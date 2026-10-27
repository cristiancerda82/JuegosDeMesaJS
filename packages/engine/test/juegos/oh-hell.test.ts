import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  BARAJA_OH_HELL,
  CONFIG_OH_HELL_POR_DEFECTO,
  ganadoraOhHell,
  ohHell,
  secuenciaOhHell,
  type AccionOhHell,
  type ConfigOhHell,
  type EstadoOhHell,
} from '../../src/juegos/oh-hell';
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

function nueva(
  config: ConfigOhHell = CONFIG_OH_HELL_POR_DEFECTO,
  semilla = 'oh-hell',
): EstadoOhHell {
  const r = ohHell.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoOhHell, accion: AccionOhHell): EstadoOhHell {
  const r = aplicar(ohHell, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoOhHell) => ohHell.accionesLegales(e, e.turno);
const apostar = (bazas: number): AccionOhHell => ({ tipo: 'apostar', bazas });
const carta = (t: string): AccionOhHell => ({ tipo: 'jugar', carta: una(t) });

describe('baraja, jugadores y secuencia', () => {
  it('con 4 jugadores: 12, 11… 1, 2… 12, 23 manos', () => {
    const s = secuenciaOhHell(4);
    expect(s).toHaveLength(23);
    expect(s.slice(0, 3)).toEqual([12, 11, 10]);
    expect(s[11]).toBe(1);
    expect(s.at(-1)).toBe(12);
  });

  it('el máximo deja una carta para el triunfo', () => {
    expect([3, 4, 5, 6, 7].map((n) => secuenciaOhHell(n)[0])).toEqual([17, 12, 10, 8, 7]);
  });

  it('la primera mano con 5 jugadores reparte 10 a cada uno y una carta de triunfo', () => {
    const e = nueva({ jugadores: 5 });
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10, 10]);
    expect(e.triunfo).toBe(e.cartaTriunfo.split('-')[0]);
    expect(new Set([...e.manos.flat(), e.cartaTriunfo, ...e.mazo]).size).toBe(52);
    expect(BARAJA_OH_HELL).toHaveLength(52);
    // Reparte el último y apuesta primero el de su izquierda.
    expect(e.repartidor).toBe(4);
    expect(e.turno).toBe(0);
  });

  it('no se acepta un número de jugadores fuera de 3 a 7', () => {
    expect(ohHell.crear({ jugadores: 8 as 7 }, 'x').ok).toBe(false);
  });
});

describe('apuestas', () => {
  it('el repartidor no puede hacer que la suma cuadre', () => {
    // Mano de 5 cartas con 4 jugadores: apuestan 1, 2 y 0, y al repartidor le queda prohibido el 2.
    let e: EstadoOhHell = {
      ...nueva(),
      indiceMano: 7,
      manos: [c('Ap 2p 3p 4p 5p'), c('Ac 2c 3c 4c 5c'), c('Ad 2d 3d 4d 5d'), c('At 2t 3t 4t 5t')],
    };
    e = jugar(e, apostar(1));
    e = jugar(e, apostar(2));
    e = jugar(e, apostar(0));
    expect(e.turno).toBe(3);
    expect(ohHell.vistaDe(e, 3).apuestaProhibida).toBe(2);
    expect(legales(e).map((a) => (a.tipo === 'apostar' ? a.bazas : -1))).toEqual([0, 1, 3, 4, 5]);
    e = jugar(e, apostar(3));
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(0);
  });
});

describe('bazas', () => {
  const mesa = (cartas: string) => c(cartas).map((carta, asiento) => ({ asiento, carta }));

  it('gana el triunfo más alto o la más alta del palo de salida', () => {
    expect(ganadoraOhHell(mesa('Kp Ap 2c'), 'corazones').asiento).toBe(2);
    expect(ganadoraOhHell(mesa('Kp Ap Ac'), 'diamantes').asiento).toBe(1);
  });

  it('sin el palo de salida se puede jugar cualquier carta', () => {
    const e: EstadoOhHell = {
      ...nueva(),
      fase: 'jugar',
      triunfo: 'corazones',
      manos: [c(''), c('2c Ad 5t'), c(''), c('')],
      mesa: [{ asiento: 0, carta: una('Kp') }],
      turno: 1,
    };
    expect(legales(e)).toHaveLength(3);
  });

  it('con el palo de salida hay que seguirlo', () => {
    const e: EstadoOhHell = {
      ...nueva(),
      fase: 'jugar',
      manos: [c(''), c('2p Ad 5t'), c(''), c('')],
      mesa: [{ asiento: 0, carta: una('Kp') }],
      turno: 1,
    };
    expect(legales(e)).toEqual([carta('2p')]);
  });
});

describe('puntos y partida', () => {
  it('acertar suma 10 más la apuesta; fallar, nada', () => {
    // Mano de 1 carta (índice 11 con 4 jugadores): triunfo picas.
    let e: EstadoOhHell = {
      ...nueva(),
      indiceMano: 11,
      triunfo: 'picas',
      manos: [c('Ap'), c('2c'), c('3c'), c('4c')],
    };
    e = jugar(e, apostar(1));
    e = jugar(e, apostar(0));
    e = jugar(e, apostar(1));
    e = jugar(e, apostar(1));
    for (const t of ['Ap', '2c', '3c', '4c']) e = jugar(e, carta(t));
    const r = e.resultadosManos[0]!;
    expect(r.bazas).toEqual([1, 0, 0, 0]);
    expect(r.puntos).toEqual([11, 10, 0, 0]);
    expect(e.puntos).toEqual([11, 10, 0, 0]);
    // La siguiente mano es de 2 cartas y reparte el siguiente.
    expect(e.manos[0]).toHaveLength(2);
    expect(e.repartidor).toBe(0);
  });

  it('la partida termina tras la última mano de la secuencia', () => {
    let e = nueva({ jugadores: 7 }, 'fin');
    let pasos = 0;
    while (ohHell.resultado(e) === null && pasos++ < 10_000) e = jugar(e, legales(e)[0]!);
    expect(e.resultadosManos).toHaveLength(secuenciaOhHell(7).length);
    const max = Math.max(...e.puntos);
    expect(ohHell.resultado(e)!.ganadores).toEqual(
      e.puntos.flatMap((p, a) => (p === max ? [a] : [])),
    );
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el mazo', () => {
    const e = nueva();
    const texto = JSON.stringify(ohHell.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.mazo]) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(ohHell, {
  configs: [{ jugadores: 3 }, CONFIG_OH_HELL_POR_DEFECTO, { jugadores: 7 }],
  // La carta del triunfo y las de la última baza ya se vieron.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      e.cartaTriunfo,
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
    ]);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mazo].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 3_000,
});
