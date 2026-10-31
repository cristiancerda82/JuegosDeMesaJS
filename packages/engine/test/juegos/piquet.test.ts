import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  BARAJA_PIQUET,
  CONFIG_PIQUET_POR_DEFECTO,
  declararPiquet,
  piquet,
  valorPartidaPiquet,
  type AccionPiquet,
  type EstadoPiquet,
} from '../../src/juegos/piquet';
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

function nueva(semilla = 'piquet'): EstadoPiquet {
  const r = piquet.crear(CONFIG_PIQUET_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPiquet, accion: AccionPiquet): EstadoPiquet {
  const r = aplicar(piquet, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const jugar = (e: EstadoPiquet, t: string) => hacer(e, { tipo: 'jugar', carta: una(t) });
const legales = (e: EstadoPiquet) => piquet.accionesLegales(e, e.turno);

/** Una mano en bazas: el 0 es el mayor y sale. */
function enBazas(manos: [string, string], parcial: Partial<EstadoPiquet> = {}): EstadoPiquet {
  const base = nueva();
  return {
    ...base,
    fase: 'bazas',
    turno: 0,
    mayor: 0,
    manos: manos.map(c),
    monton: [],
    cambiadas: [5, 3],
    declaraciones: declararPiquet([[], []]),
    porDeclaraciones: [0, 0],
    puntosMano: [0, 0],
    bazas: [0, 0],
    jugadas: [],
    mesa: [],
    ...parcial,
  };
}

describe('baraja y reparto', () => {
  it('32 cartas del 7 al As; 12 a cada uno y 8 al montón', () => {
    expect(BARAJA_PIQUET).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([12, 12]);
    expect(e.monton).toHaveLength(8);
    expect(e.mayor).toBe(0);
    expect(e.turno).toBe(0);
  });
});

describe('cambio', () => {
  it('el mayor tiene que descartar al menos 1 y como mucho 5', () => {
    let e = nueva();
    expect(legales(e).some((a) => a.tipo === 'robar')).toBe(false);
    for (let i = 0; i < 5; i++)
      e = hacer(
        e,
        legales(e).find((a) => a.tipo === 'descartar')!,
      );
    expect(legales(e)).toEqual([{ tipo: 'robar' }]);
    e = hacer(e, { tipo: 'robar' });
    expect(e.manos[0]).toHaveLength(12);
    expect(e.monton).toHaveLength(3);
    expect(e.turno).toBe(1);
  });

  it('el menor cambia como mucho lo que queda, o nada', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++)
      e = hacer(
        e,
        legales(e).find((a) => a.tipo === 'descartar')!,
      );
    e = hacer(e, { tipo: 'robar' });
    expect(legales(e)[0]).toEqual({ tipo: 'robar' });
    for (let i = 0; i < 4; i++)
      e = hacer(
        e,
        legales(e).find((a) => a.tipo === 'descartar')!,
      );
    expect(legales(e)).toEqual([{ tipo: 'robar' }]);
    e = hacer(e, { tipo: 'robar' });
    expect(e.fase).toBe('bazas');
    expect(e.manos.map((m) => m.length)).toEqual([12, 12]);
    expect(e.declaraciones).not.toBeNull();
    expect(e.turno).toBe(0);
  });

  it('nadie ve los descartes del otro ni el montón', () => {
    let e = nueva();
    e = hacer(
      e,
      legales(e).find((a) => a.tipo === 'descartar')!,
    );
    const v = piquet.vistaDe(e, 1);
    expect(v.misDescartes).toEqual([]);
    expect(v.enDescarte).toEqual([1, 0]);
    expect(piquet.vistaDe(e, 0).misDescartes).toHaveLength(1);
  });
});

describe('declaraciones', () => {
  it('punto: gana el palo más largo y anota sus cartas', () => {
    const d = declararPiquet([c('7p 8p 9p Jp Qp Ap'), c('7c 8c 10c Jc Kc')]);
    expect(d.punto).toMatchObject({ ganador: 0, puntos: 6 });
  });

  it('punto: con igual largo, el de más valor', () => {
    const d = declararPiquet([c('Ap Kp Qp 9p 7p'), c('Ac Kc Qc 8c 7c')]);
    expect(d.punto).toMatchObject({ ganador: 0, puntos: 5 });
  });

  it('secuencias: gana la más larga y anota todas las suyas', () => {
    const d = declararPiquet([c('7d 8d 9d 10d'), c('7c 8c 9c 10c Jc Qt Kt At')]);
    expect(d.secuencia).toMatchObject({ ganador: 1, puntos: 15 + 3, largo: 5 });
  });

  it('conjuntos: el de cuatro gana al de tres, y anota todos los suyos', () => {
    const d = declararPiquet([c('Kp Kc Kd'), c('10p 10c 10d 10t Ap Ac Ad')]);
    expect(d.conjunto).toMatchObject({ ganador: 1, puntos: 14 + 3 });
  });

  it('con un empate exacto no anota nadie', () => {
    const d = declararPiquet([c('7p 8p 9p'), c('7c 8c 9c')]);
    expect(d.secuencia.ganador).toBeNull();
  });

  it('repique: 30 con declaraciones sin que el otro gane ninguna', () => {
    let e = nueva();
    e = {
      ...e,
      manos: [
        c('7p 8p 9p 10p Jp Ap Ac Ad At 7c 8d 9t'),
        c('Kc Qc Jc 9c Kd Qd 10d 7d Kt Qt Jt 10t'),
      ],
      monton: [],
      descartes: [[una('Kp')], []],
      turno: 1,
      cambiadas: [1, null],
    };
    e = hacer(e, { tipo: 'robar' });
    // El mayor: punto 6, quinta 15 (más ninguna otra), catorce de Ases 14 = 35.
    expect(e.porDeclaraciones[0]).toBeGreaterThanOrEqual(30);
    expect(e.porDeclaraciones[1]).toBe(0);
    expect(e.repique).toBe(0);
    expect(e.puntosMano[0]).toBe(e.porDeclaraciones[0] + 60);
  });
});

describe('bazas', () => {
  it('hay que seguir el palo', () => {
    const e = enBazas(['Kc 7p', 'Ac 8c 9p'], {
      turno: 1,
      mesa: [{ asiento: 0, carta: una('Kc') }],
    });
    expect(legales(e).map((a) => (a.tipo === 'jugar' ? a.carta : ''))).toEqual(c('Ac 8c').sort());
  });

  it('salir vale 1; ganar la salida del otro, 1', () => {
    let e = enBazas(['Ap Qt', '7p Kt'], { porDeclaraciones: [0, 3], puntosMano: [0, 3] });
    e = jugar(e, 'Ap');
    e = jugar(e, '7p');
    expect(e.puntosMano).toEqual([1, 3]);
    // Sale el 0 con la Q de tréboles y la gana el 1 con el K: 1 y 1, y la última vale 1 más.
    e = { ...e, manos: [c('Qt 7d'), c('Kt 8d')] };
    e = jugar(e, 'Qt');
    e = jugar(e, 'Kt');
    expect(e.puntosMano).toEqual([2, 4]);
  });

  it('las cartas: 10 a quien gana más bazas; capote 40', () => {
    let e = enBazas(['Ap', '7p'], { bazas: [11, 0], porDeclaraciones: [0, 5], puntosMano: [0, 5] });
    e = jugar(e, 'Ap');
    e = jugar(e, '7p');
    const r = e.resultadosManos.at(-1)!;
    expect(r.capote).toBe(true);
    // 1 por salir, 1 por la última y 40 de capote.
    expect(r.puntosMano).toEqual([42, 5]);
  });

  it('pique: el mayor llega a 30 antes de que el menor anote', () => {
    let e = enBazas(['Ap Kp', '7p 8p'], { porDeclaraciones: [27, 0], puntosMano: [27, 0] });
    e = jugar(e, 'Ap');
    e = jugar(e, '7p');
    expect(e.puntosMano[0]).toBe(28);
    e = jugar(e, 'Kp');
    e = jugar(e, '8p');
    // 29 por salir, 30 por la última baza: pique (+30) y después las cartas (+10).
    const r = e.resultadosManos.at(-1)!;
    expect(r.pique).toBe(0);
    expect(r.puntosMano[0]).toBe(30 + 30 + 10);
  });
});

describe('rubber', () => {
  it('lo que vale la partida', () => {
    expect(valorPartidaPiquet([140, 90])).toBe(330);
    expect(valorPartidaPiquet([150, 120])).toBe(130);
  });

  it('tras 6 manos gana el de más puntos; el mayor se alterna', () => {
    let e = nueva('rubber');
    for (let i = 0; i < 2000 && piquet.resultado(e) === null; i++) {
      const a = legales(e);
      const robar = a.find((x) => x.tipo === 'robar');
      e = hacer(e, e.fase === 'cambio' && e.turno !== e.mayor && robar ? robar : a[0]!);
    }
    expect(e.resultadosManos).toHaveLength(6);
    expect(e.resultadosManos.map((r) => r.mayor)).toEqual([0, 1, 0, 1, 0, 1]);
    const fin = piquet.resultado(e)!;
    expect(fin.puntos).toEqual([...e.puntos]);
  });
});

describe('vista', () => {
  it('cada uno ve su mano, cuántas tiene el otro y el montón', () => {
    const v = piquet.vistaDe(nueva(), 0);
    expect(v.miMano).toHaveLength(12);
    expect(v.cartasEnMano).toEqual([12, 12]);
    expect(v.enMonton).toBe(8);
    expect(JSON.stringify(v)).not.toContain('"monton"');
  });
});

describirContrato(piquet, {
  configs: [{ manos: 1 }, { manos: 2 }],
  // Las cartas de la última baza y las de las combinaciones declaradas ya se vieron.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...(e.declaraciones ? Object.values(e.declaraciones).flatMap((d) => d.cartas) : []),
      ...e.resultadosManos.flatMap((r) => Object.values(r.declaraciones).flatMap((d) => d.cartas)),
      ...(asiento === null ? [] : [...e.manos[asiento]!, ...e.descartes[asiento]!]),
    ]);
    return [
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
      ...e.descartes.flatMap((d, a) => (a === asiento ? [] : d)),
      ...e.monton,
    ].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
});
