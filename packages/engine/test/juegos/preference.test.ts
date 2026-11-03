import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_PREFERENCE,
  CONFIG_PREFERENCE_POR_DEFECTO,
  ganadoraPreference,
  ordenPujaPreference,
  preference,
  puntuarManoPreference,
  saldosPreference,
  type AccionPreference,
  type EstadoPreference,
  type PaloPujaPreference,
  type PujaPreference,
} from '../../src/juegos/preference';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

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
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));
const bazas = (n: number, palo: PaloPujaPreference): PujaPreference => ({
  tipo: 'bazas',
  bazas: n,
  palo,
});

function nueva(semilla = 'preference', meta = 10): EstadoPreference {
  const r = preference.crear({ jugadores: 3, meta }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPreference, accion: AccionPreference): EstadoPreference {
  const r = aplicar(preference, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const pujar = (e: EstadoPreference, p: PujaPreference) => hacer(e, { tipo: 'pujar', puja: p });
const pasar = (e: EstadoPreference) => hacer(e, { tipo: 'pasar' });
const pujasLegales = (e: EstadoPreference) =>
  preference.accionesLegales(e, e.turno).flatMap((a) => (a.tipo === 'pujar' ? [a.puja] : []));

describe('baraja y reparto', () => {
  it('32 cartas; 10 a cada uno y 2 en la viuda; puja primero el siguiente al repartidor', () => {
    expect(BARAJA_PREFERENCE).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10]);
    expect(e.viuda).toHaveLength(2);
    expect(new Set([...e.manos.flat(), ...e.viuda]).size).toBe(32);
    expect(e.repartidor).toBe(2);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('subasta');
  });
});

describe('subasta', () => {
  it('el orden de las pujas, con la miseria entre el 8 sin triunfo y el 9 de picas', () => {
    expect(ordenPujaPreference(bazas(6, 'sin'))).toBeLessThan(
      ordenPujaPreference(bazas(7, 'picas')),
    );
    expect(ordenPujaPreference(bazas(8, 'sin'))).toBeLessThan(
      ordenPujaPreference({ tipo: 'miseria' }),
    );
    expect(ordenPujaPreference({ tipo: 'miseria' })).toBeLessThan(
      ordenPujaPreference(bazas(9, 'picas')),
    );
  });

  it('tras 6 de corazones se puede 6 sin triunfo, pero no 6 de diamantes', () => {
    const e = pujar(nueva(), bazas(6, 'corazones'));
    const legales = pujasLegales(e);
    expect(legales).toContainEqual(bazas(6, 'sin'));
    expect(legales).not.toContainEqual(bazas(6, 'diamantes'));
  });

  it('la miseria solo como primera puja', () => {
    let e = pujar(nueva(), bazas(6, 'picas'));
    e = pujar(e, bazas(6, 'treboles'));
    e = pasar(e);
    // Le toca otra vez al 0, que ya pujó.
    expect(e.turno).toBe(0);
    expect(pujasLegales(e)).not.toContainEqual({ tipo: 'miseria' });
    expect(pujasLegales(pujar(nueva(), bazas(6, 'picas')))).toContainEqual({ tipo: 'miseria' });
  });

  it('quien puja y ve pasar a los otros dos gana la subasta y se queda la viuda', () => {
    let e = nueva();
    const viuda = e.viuda;
    e = pujar(e, bazas(7, 'treboles'));
    e = pasar(e);
    e = pasar(e);
    expect(e.fase).toBe('descarte');
    expect(e.juega).toBe(0);
    expect(e.turno).toBe(0);
    expect(e.manos[0]).toHaveLength(12);
    for (const x of viuda) expect(e.manos[0]).toContain(x);
    expect(preference.vistaDe(e, 1).viuda).toEqual(viuda);
  });

  it('si pasan los tres se juega la raspasy', () => {
    let e = nueva();
    for (let i = 0; i < 3; i++) e = pasar(e);
    expect(e.fase).toBe('bazas');
    expect(e.contrato).toBeNull();
    expect(e.juega).toBeNull();
    expect(e.turno).toBe(0);
  });
});

describe('descarte, contrato y whist', () => {
  function ganada(puja: PujaPreference = bazas(7, 'treboles')) {
    let e = pujar(nueva(), puja);
    e = pasar(e);
    return pasar(e);
  }

  it('descarta 2 y declara un contrato igual o más alto', () => {
    let e = ganada();
    const [a, b] = [...e.manos[0]!].sort();
    e = hacer(e, { tipo: 'descartar', carta: a! });
    e = hacer(e, { tipo: 'descartar', carta: b! });
    expect(e.manos[0]).toHaveLength(10);
    expect(e.fase).toBe('contrato');
    const legales = preference
      .accionesLegales(e, 0)
      .flatMap((x) => (x.tipo === 'declarar' ? [x.puja] : []));
    expect(legales).toContainEqual(bazas(8, 'corazones'));
    expect(legales).toContainEqual(bazas(7, 'treboles'));
    expect(legales).not.toContainEqual(bazas(6, 'corazones'));
    expect(legales).not.toContainEqual(bazas(7, 'picas'));
    expect(preference.vistaDe(e, 0).misDescartes).toEqual([a, b]);
    expect(preference.vistaDe(e, 1).misDescartes).toEqual([]);
  });

  it('si nadie hace whist, el contrato se da por cumplido sin jugarse', () => {
    let e = ganada();
    const [a, b] = [...e.manos[0]!].sort();
    e = hacer(e, { tipo: 'descartar', carta: a! });
    e = hacer(e, { tipo: 'descartar', carta: b! });
    e = hacer(e, { tipo: 'declarar', puja: bazas(7, 'treboles') });
    expect(e.fase).toBe('whist');
    expect(e.turno).toBe(1);
    e = hacer(e, { tipo: 'pasarWhist' });
    e = hacer(e, { tipo: 'pasarWhist' });
    const r = e.resultadosManos.at(-1)!;
    expect(r).toMatchObject({ sinJugar: true, cumplido: true, pulka: [4, 0, 0] });
  });

  it('con un whist se juegan las bazas y sale el siguiente al repartidor', () => {
    let e = ganada();
    const [a, b] = [...e.manos[0]!].sort();
    e = hacer(e, { tipo: 'descartar', carta: a! });
    e = hacer(e, { tipo: 'descartar', carta: b! });
    e = hacer(e, { tipo: 'declarar', puja: bazas(7, 'treboles') });
    e = hacer(e, { tipo: 'whist' });
    e = hacer(e, { tipo: 'pasarWhist' });
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    expect(e.whist).toEqual([null, true, false]);
  });

  it('la miseria no se declara ni tiene whist', () => {
    let e = ganada({ tipo: 'miseria' });
    const [a, b] = [...e.manos[0]!].sort();
    e = hacer(e, { tipo: 'descartar', carta: a! });
    e = hacer(e, { tipo: 'descartar', carta: b! });
    expect(e.fase).toBe('bazas');
    expect(e.contrato).toEqual({ tipo: 'miseria' });
  });
});

describe('bazas', () => {
  function enBazas(
    manos: string[],
    contrato: PujaPreference | null,
    parcial: Partial<EstadoPreference> = {},
  ) {
    return {
      ...nueva(),
      manos: manos.map(c),
      fase: 'bazas' as const,
      contrato,
      juega: contrato ? 0 : null,
      turno: 1,
      ...parcial,
    };
  }

  it('sin el palo hay que echar triunfo', () => {
    const e = enBazas(['', '7c 8t', ''], bazas(6, 'corazones'), { mesa: enMesa([0, 'Ad']) });
    expect(preference.accionesLegales(e, 1)).toEqual([{ tipo: 'jugar', carta: una('7c') }]);
  });

  it('sin triunfo, el As de otro palo no gana', () => {
    expect(ganadoraPreference(enMesa([0, '7p'], [1, 'Ac'], [2, '8p']), null).asiento).toBe(2);
    expect(ganadoraPreference(enMesa([0, 'Ad'], [1, '7c']), 'corazones').asiento).toBe(1);
  });

  it('quien no sigue ni falla queda sin el palo y sin triunfos', () => {
    let e = enBazas(['', '8d 9t', ''], bazas(6, 'corazones'), { mesa: enMesa([0, 'Ap']) });
    e = hacer(e, { tipo: 'jugar', carta: una('8d') });
    expect(e.fallos[1]).toEqual(['picas', 'triunfo']);
  });
});

describe('cuenta', () => {
  it('7 de picas cumplido con un whist de 2 bazas', () => {
    const r = puntuarManoPreference(bazas(7, 'picas'), 0, [null, true, false], [7, 2, 1], false);
    expect(r.pulka).toEqual([4, 0, 0]);
    expect(r.whists[1]![0]).toBe(8);
    expect(r.montana).toEqual([0, 0, 0]);
  });

  it('6 de picas fallado con 5 bazas, whists de 3 y 2', () => {
    const r = puntuarManoPreference(bazas(6, 'picas'), 0, [null, true, true], [5, 3, 2], false);
    expect(r.montana[0]).toBe(2);
    expect(r.whists[1]![0]).toBe(8);
    expect(r.whists[2]![0]).toBe(6);
    expect(r.cumplido).toBe(false);
  });

  it('un whist que no llega a las 4 bazas de un 6 suma montaña', () => {
    const r = puntuarManoPreference(bazas(6, 'picas'), 0, [null, true, false], [7, 3, 0], false);
    expect(r.montana).toEqual([0, 2, 0]);
  });

  it('dos whists cortos se reparten la montaña', () => {
    const r = puntuarManoPreference(bazas(6, 'picas'), 0, [null, true, true], [8, 1, 1], false);
    expect(r.montana).toEqual([0, 2, 2]);
  });

  it('miseria fallada con 2 bazas: 20 de montaña', () => {
    const r = puntuarManoPreference({ tipo: 'miseria' }, 0, [null, null, null], [2, 4, 4], false);
    expect(r.montana[0]).toBe(20);
  });

  it('raspasy: cada baza suma 1 a la montaña', () => {
    const r = puntuarManoPreference(null, null, [null, null, null], [4, 3, 3], false);
    expect(r.montana).toEqual([4, 3, 3]);
  });

  it('cierre de cuentas: montañas 0, 6 y 12 con pulkas de 10 dan +60, 0 y −60', () => {
    expect(
      saldosPreference(
        [10, 10, 10],
        [0, 6, 12],
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ),
    ).toEqual([60, 0, -60]);
    // Los whists se suman al que los apunta y se restan al otro.
    expect(
      saldosPreference(
        [0, 0, 0],
        [0, 0, 0],
        [
          [0, 8, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ),
    ).toEqual([8, -8, 0]);
  });
});

describe('partida', () => {
  it('termina cuando la pulka de los tres llega a la meta y gana el mayor saldo', () => {
    let e = nueva('corta', 2);
    // Cada uno, por turno, puja 6 de picas, los otros pasan y nadie hace whist.
    for (let mano = 0; mano < 3; mano++) {
      e = pujar(e, bazas(6, 'picas'));
      e = pasar(e);
      e = pasar(e);
      const [a, b] = [...e.manos[e.juega!]!].sort();
      e = hacer(e, { tipo: 'descartar', carta: a! });
      e = hacer(e, { tipo: 'descartar', carta: b! });
      e = hacer(e, { tipo: 'declarar', puja: bazas(6, 'picas') });
      e = hacer(e, { tipo: 'pasarWhist' });
      e = hacer(e, { tipo: 'pasarWhist' });
    }
    expect(e.pulka).toEqual([2, 2, 2]);
    expect(preference.resultado(e)).toEqual({ ganadores: [], empate: true, puntos: [0, 0, 0] });
    expect(preference.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describe('fin por la suma de las pulkas', () => {
  it('con pulkas de 14, 10 y 6 la partida termina', () => {
    const e = { ...nueva(), pulka: [14, 10, 6] };
    expect(preference.resultado(e)).not.toBeNull();
    expect(preference.resultado({ ...e, pulka: [14, 10, 5] })).toBeNull();
  });

  it('termina también tras 60 manos', () => {
    // Todos pasan siempre: solo raspasy, sin pulka.
    let f = nueva();
    while (preference.resultado(f) === null) {
      const acciones = preference.accionesLegales(f, f.turno);
      f = hacer(f, acciones.find((x) => x.tipo === 'pasar') ?? acciones[0]!);
    }
    expect(f.resultadosManos).toHaveLength(60);
    expect(preference.resultado(f)).not.toBeNull();
  });
});

describe('vista', () => {
  it('no se ven la viuda durante la subasta ni las manos ajenas', () => {
    const e = nueva();
    const v = preference.vistaDe(e, 0);
    expect(v.viuda).toBeNull();
    const texto = JSON.stringify(v);
    for (const x of [...e.manos[1]!, ...e.viuda]) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(preference, {
  configs: [CONFIG_PREFERENCE_POR_DEFECTO, { jugadores: 3, meta: 2 }],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...(e.viudaVista ? e.viuda : []),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 4_000,
});
