import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_FIVE_HUNDRED,
  cartasLegalesFiveHundred,
  COMODIN_FIVE_HUNDRED,
  fiveHundred,
  ganadoraFiveHundred,
  ordenPujaFiveHundred,
  valorPujaFiveHundred,
  type AccionFiveHundred,
  type EstadoFiveHundred,
  type PaloPujaFiveHundred,
  type PujaFiveHundred,
} from '../../src/juegos/five-hundred';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t; «X» es el comodín. */
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
    if (t === 'X') return COMODIN_FIVE_HUNDRED;
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));
const b = (bazas: number, palo: PaloPujaFiveHundred): PujaFiveHundred => ({
  tipo: 'bazas',
  bazas,
  palo,
});

/** Partidas cortas para la suite del contrato. */
const CONFIG_PRUEBAS = { jugadores: 4, meta: 200 } as const;

function nueva(semilla = 'quinientos', meta = 500): EstadoFiveHundred {
  const r = fiveHundred.crear({ jugadores: 4, meta }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoFiveHundred, accion: AccionFiveHundred | string): EstadoFiveHundred {
  const a: AccionFiveHundred =
    typeof accion === 'string' ? { tipo: 'jugar', carta: una(accion) } : accion;
  const r = aplicar(fiveHundred, e, e.turno, a);
  if (!r.ok) throw new Error(`${JSON.stringify(a)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada en bazas: juega el 0 con el contrato dado y le toca salir. */
function mesa(
  manos: string[],
  puja: PujaFiveHundred,
  parcial: Partial<EstadoFiveHundred> = {},
): EstadoFiveHundred {
  return {
    ...nueva(),
    fase: 'bazas',
    mejor: { asiento: 0, puja },
    pujas: [puja, 'paso', 'paso', 'paso'],
    manos: manos.map(c),
    viuda: [],
    turno: 0,
    ...parcial,
  };
}

const legales = (e: EstadoFiveHundred) => fiveHundred.accionesLegales(e, e.turno);

/** Juega la mano con la primera acción legal (pasando en la subasta salvo el primero). */
function acabarMano(e: EstadoFiveHundred): EstadoFiveHundred {
  const inicio = e.resultadosManos.length;
  for (let paso = 0; e.resultadosManos.length === inicio && paso < 200; paso++) {
    const acciones = legales(e);
    const pasar = acciones.find((a) => a.tipo === 'pasar');
    const pujas = e.pujas.filter((p) => p !== null && p !== 'paso').length;
    e = hacer(e, e.fase === 'subasta' && pujas > 0 && pasar ? pasar : acciones[0]!);
  }
  return e;
}

describe('baraja y reparto', () => {
  it('43 cartas: del 5 al As, los cuatros rojos y el comodín', () => {
    expect(BARAJA_FIVE_HUNDRED).toHaveLength(43);
    expect(BARAJA_FIVE_HUNDRED).toContain('corazones-4');
    expect(BARAJA_FIVE_HUNDRED).not.toContain('picas-4');
    expect(BARAJA_FIVE_HUNDRED).toContain(COMODIN_FIVE_HUNDRED);
  });

  it('10 cartas a cada uno y 3 en la viuda; puja primero el siguiente al repartidor', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
    expect(e.viuda).toHaveLength(3);
    expect(new Set([...e.manos.flat(), ...e.viuda]).size).toBe(43);
    expect(e.turno).toBe(0);
    expect(fiveHundred.vistaDe(e, 1).enViuda).toBe(3);
  });
});

describe('subasta', () => {
  it('tabla de Avondale y orden con el misère', () => {
    expect(valorPujaFiveHundred(b(6, 'picas'))).toBe(40);
    expect(valorPujaFiveHundred(b(7, 'corazones'))).toBe(200);
    expect(valorPujaFiveHundred(b(10, 'sin'))).toBe(520);
    expect(valorPujaFiveHundred({ tipo: 'misere' })).toBe(250);
    const orden = (p: PujaFiveHundred) => ordenPujaFiveHundred(p);
    expect(orden({ tipo: 'misere' })).toBeGreaterThan(orden(b(8, 'picas')));
    expect(orden({ tipo: 'misere' })).toBeLessThan(orden(b(8, 'treboles')));
    expect(orden({ tipo: 'misereAbierto' })).toBeGreaterThan(orden(b(10, 'diamantes')));
    expect(orden({ tipo: 'misereAbierto' })).toBeLessThan(orden(b(10, 'corazones')));
  });

  it('hay que pujar más alto', () => {
    const e = hacer(nueva(), { tipo: 'pujar', puja: b(7, 'diamantes') });
    const pujas = legales(e).flatMap((a) => (a.tipo === 'pujar' ? [a.puja] : []));
    expect(pujas).toContainEqual(b(7, 'corazones'));
    expect(pujas).toContainEqual(b(8, 'picas'));
    expect(pujas).not.toContainEqual(b(7, 'treboles'));
    expect(legales(e)).toContainEqual({ tipo: 'pasar' });
  });

  it('se puede pujar misère sobre 8 picas', () => {
    const e = hacer(nueva(), { tipo: 'pujar', puja: b(8, 'picas') });
    expect(legales(e)).toContainEqual({ tipo: 'pujar', puja: { tipo: 'misere' } });
  });

  it('acaba cuando pasan los otros tres; quien gana se queda la viuda y se descarta', () => {
    let e = nueva();
    const viuda = e.viuda;
    e = hacer(e, { tipo: 'pujar', puja: b(7, 'picas') });
    for (let i = 0; i < 3; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('descarte');
    expect(e.mejor).toEqual({ asiento: 0, puja: b(7, 'picas') });
    expect(e.manos[0]).toHaveLength(13);
    expect(e.manos[0]).toEqual(expect.arrayContaining([...viuda]));
    for (let i = 0; i < 3; i++) e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    expect(e.manos[0]).toHaveLength(10);
    expect(e.descartes).toHaveLength(3);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    expect(fiveHundred.vistaDe(e, 0).misDescartes).toHaveLength(3);
    expect(fiveHundred.vistaDe(e, 1).misDescartes).toEqual([]);
  });

  it('quien pasa no vuelve a pujar', () => {
    let e = hacer(nueva(), { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pujar', puja: b(6, 'picas') });
    e = hacer(e, { tipo: 'pujar', puja: b(6, 'treboles') });
    e = hacer(e, { tipo: 'pujar', puja: b(6, 'diamantes') });
    expect(e.turno).toBe(1);
  });

  it('si pasan los cuatro, se reparte otra mano sin anotar nada', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.resultadosManos.at(-1)).toMatchObject({ contrato: null, suma: [0, 0] });
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('subasta');
    expect(e.turno).toBe(1);
  });
});

describe('triunfos y bazas', () => {
  it('el comodín, la Jota del triunfo y la otra Jota del color', () => {
    const todas = enMesa([0, 'Ac'], [1, 'Jd'], [2, 'Jc'], [3, 'X']);
    expect(ganadoraFiveHundred(todas, 'corazones', null).asiento).toBe(3);
    expect(ganadoraFiveHundred(todas.slice(0, 3), 'corazones', null).asiento).toBe(2);
    expect(ganadoraFiveHundred(todas.slice(0, 2), 'corazones', null).asiento).toBe(1);
  });

  it('la otra Jota es del triunfo, no de su palo', () => {
    const r = cartasLegalesFiveHundred(c('Jd 5p 6t'), enMesa([0, 'Ad']), 'corazones', null);
    expect(r).toHaveLength(3);
  });

  it('sin triunfo, el comodín no sigue el palo: hay que echar picas', () => {
    expect(cartasLegalesFiveHundred(c('X 5p 6t'), enMesa([0, 'Ap']), null, null)).toEqual(c('5p'));
    expect(ganadoraFiveHundred(enMesa([0, 'Ap'], [1, 'X']), null, null).asiento).toBe(1);
  });

  it('al salir con el comodín sin triunfo se nombra el palo', () => {
    let e = mesa(['X 5d', '6p 7t', '8p 9t', '9p 10t'], b(6, 'sin'));
    const comodin = legales(e).filter(
      (a) => a.tipo === 'jugar' && a.carta === COMODIN_FIVE_HUNDRED,
    );
    expect(comodin).toHaveLength(4);
    e = hacer(e, { tipo: 'jugar', carta: COMODIN_FIVE_HUNDRED, palo: 'picas' });
    expect(e.paloNombrado).toBe('picas');
    expect(legales(e)).toEqual([{ tipo: 'jugar', carta: una('6p') }]);
  });

  it('en el misère el compañero no juega y las bazas son de 3', () => {
    let e = mesa(['5p 5d', '6p 6d', '7p 7d', '8p 8d'], { tipo: 'misere' });
    e = hacer(e, '5p');
    expect(e.turno).toBe(1);
    e = hacer(e, '6p');
    expect(e.turno).toBe(3);
    e = hacer(e, '8p');
    expect(e.ultimaBaza?.cartas).toHaveLength(3);
    expect(e.turno).toBe(3);
  });

  it('en el misère abierto se ven las cartas de quien juega desde la primera carta', () => {
    let e = mesa(['5p 5d', '6p 6d', '7p 7d', '8p 8d'], { tipo: 'misereAbierto' });
    expect(fiveHundred.vistaDe(e, 1).abiertas).toBeNull();
    e = hacer(e, '5p');
    expect(fiveHundred.vistaDe(e, 1).abiertas).toEqual(c('5d'));
  });
});

describe('puntos de la mano', () => {
  /** Cierra la mano con estas bazas de cada pareja: la última baza la gana la pareja 0. */
  function cerrar(
    puja: PujaFiveHundred,
    bazas: [number, number],
    puntos: [number, number] = [0, 0],
  ) {
    let e = mesa(['Ap', '5p', '6p', '7p'], puja, {
      bazasGanadas: [bazas[0] - 1, bazas[1]],
      puntos,
    });
    for (const x of ['Ap', '5p', '6p', '7p']) e = hacer(e, x);
    return e;
  }

  it('cumple: suma su valor y los rivales 10 por baza', () => {
    const e = cerrar(b(7, 'corazones'), [8, 2]);
    expect(e.resultadosManos.at(-1)).toMatchObject({ cumple: true, suma: [200, 20] });
  });

  it('no cumple: resta su valor', () => {
    const e = cerrar(b(8, 'picas'), [7, 3]);
    expect(e.resultadosManos.at(-1)).toMatchObject({ cumple: false, suma: [-240, 30] });
  });

  it('con las 10 bazas suma 250', () => {
    expect(cerrar(b(7, 'picas'), [10, 0]).resultadosManos.at(-1)?.suma).toEqual([250, 0]);
  });

  it('misère: pierde en cuanto gana una baza', () => {
    let e = mesa(['Ap 5d', '5p 6d', '6p 7d', '7p 8d'], { tipo: 'misere' });
    for (const x of ['Ap', '5p', '7p']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)).toMatchObject({ cumple: false, suma: [-250, 0] });
  });

  it('misère cumplido: suma 250', () => {
    let e = mesa(['5p', 'Ap', '6p', '7p'], { tipo: 'misere' });
    for (const x of ['5p', 'Ap', '7p']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)).toMatchObject({ cumple: true, suma: [250, 0] });
  });
});

describe('partida', () => {
  function cerrar(puja: PujaFiveHundred, bazas: [number, number], puntos: [number, number]) {
    let e = mesa(['Ap', '5p', '6p', '7p'], puja, {
      bazasGanadas: [bazas[0] - 1, bazas[1]],
      puntos,
    });
    for (const x of ['Ap', '5p', '6p', '7p']) e = hacer(e, x);
    return e;
  }

  it('gana quien llega a 500 cumpliendo', () => {
    const e = cerrar(b(7, 'picas'), [7, 3], [380, 0]);
    expect(e.puntos).toEqual([520, 30]);
    expect(fiveHundred.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [520, 30, 520, 30],
    });
  });

  it('los rivales no pasan de 490 con sus bazas', () => {
    const e = cerrar(b(7, 'picas'), [7, 3], [0, 480]);
    expect(e.puntos).toEqual([140, 490]);
    expect(fiveHundred.resultado(e)).toBeNull();
  });

  it('quien baja a −500 pierde', () => {
    const e = cerrar(b(7, 'picas'), [6, 4], [-400, 0]);
    expect(e.puntos).toEqual([-540, 40]);
    expect(fiveHundred.resultado(e)?.ganadores).toEqual([1, 3]);
  });

  it('una mano entera reparte las 10 bazas', () => {
    for (let i = 0; i < 6; i++) {
      const e = acabarMano(nueva(`mano-${i}`));
      const r = e.resultadosManos.at(-1)!;
      if (r.contrato && r.contrato.tipo === 'bazas') expect(r.bazas[0] + r.bazas[1]).toBe(10);
    }
  });
});

describe('vista', () => {
  it('cada uno ve su mano, pero no la viuda ni las ajenas', () => {
    const e = nueva();
    const v = fiveHundred.vistaDe(e, 1);
    expect(v.miMano).toHaveLength(10);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    expect(JSON.stringify(v)).not.toContain('"viuda"');
    expect(JSON.stringify(v)).not.toContain('"manos"');
  });
});

describirContrato(fiveHundred, {
  configs: [CONFIG_PRUEBAS],
  // Las cartas de la última baza ya se vieron; las del misère abierto se enseñan.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    const abiertas = fiveHundred.vistaDe(e, asiento).abiertas ?? [];
    for (const x of abiertas) vistas.add(x);
    return [
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
      ...e.viuda,
      ...(asiento === e.mejor?.asiento ? [] : e.descartes),
    ].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 3000,
});
