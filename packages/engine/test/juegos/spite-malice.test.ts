import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  BARAJA_SPITE_MALICE,
  CONFIG_SPITE_MALICE_POR_DEFECTO,
  spiteMalice,
  type AccionSpiteMalice,
  type EstadoSpiteMalice,
} from '../../src/juegos/spite-malice';
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

function nueva(semilla = 'spite'): EstadoSpiteMalice {
  const r = spiteMalice.crear(CONFIG_SPITE_MALICE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoSpiteMalice, accion: AccionSpiteMalice): EstadoSpiteMalice {
  const r = aplicar(spiteMalice, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoSpiteMalice) => spiteMalice.accionesLegales(e, e.turno);
const vacias = () => [[], [], [], []] as IdCarta[][];

/** Un estado preparado: le toca al 0. */
function preparado(parcial: Partial<EstadoSpiteMalice>): EstadoSpiteMalice {
  return {
    ...nueva(),
    montones: [c('2t 9c'), c('3t 8c')],
    manos: [c('Ap 2p 3p Kd 7c'), c('4d 5d 6d 7d 8d')],
    descartes: [vacias(), vacias()],
    escaleras: vacias(),
    completas: [],
    ...parcial,
  };
}

describe('baraja y reparto', () => {
  it('104 cartas: montones de 20, manos de 5 y 54 en el mazo', () => {
    expect(BARAJA_SPITE_MALICE).toHaveLength(104);
    const e = nueva();
    expect(e.montones.map((m) => m.length)).toEqual([20, 20]);
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.mazo).toHaveLength(54);
    expect(e.turno).toBe(0);
    // La de arriba del montón se ve, las demás no.
    const v = spiteMalice.vistaDe(e, 1);
    expect(v.montones[0]).toEqual({ cartas: 20, arriba: e.montones[0]!.at(-1) });
  });
});

describe('escaleras', () => {
  it('una escalera libre solo se empieza con un As o un K', () => {
    const e = preparado({});
    const destinos = (carta: string) =>
      legales(e).filter(
        (a) => a.tipo === 'jugar' && a.desde.tipo === 'mano' && a.desde.carta === una(carta),
      );
    expect(destinos('Ap')).toEqual([
      { tipo: 'jugar', desde: { tipo: 'mano', carta: una('Ap') }, escalera: 0 },
    ]);
    expect(destinos('Kd')).toHaveLength(1);
    expect(destinos('2p')).toHaveLength(0);
  });

  it('el K vale la carta que haga falta', () => {
    let e = preparado({ escaleras: [c('Ap 2p 3p 4p 5p'), [], [], []] });
    e = jugar(e, { tipo: 'jugar', desde: { tipo: 'mano', carta: una('Kd') }, escalera: 0 });
    expect(e.escaleras[0]).toHaveLength(6);
    // Ahora va por el 6: el 7 de corazones va.
    expect(legales(e)).toContainEqual({
      tipo: 'jugar',
      desde: { tipo: 'mano', carta: una('7c') },
      escalera: 0,
    });
  });

  it('al llegar a la Q la escalera sale y su sitio queda libre', () => {
    let e = preparado({
      escaleras: [c('Ap 2p 3p 4p 5p 6p 7p 8p 9p 10p Jp'), [], [], []],
      manos: [c('Qc 2p 3p'), c('4d')],
    });
    e = jugar(e, { tipo: 'jugar', desde: { tipo: 'mano', carta: una('Qc') }, escalera: 0 });
    expect(e.escaleras[0]).toEqual([]);
    expect(e.completas).toHaveLength(12);
  });
});

describe('el turno', () => {
  it('jugar desde el montón deja la siguiente a la vista', () => {
    let e = preparado({ escaleras: [c('Ap 2p 3p 4p 5p 6p 7p 8p'), [], [], []] });
    e = jugar(e, { tipo: 'jugar', desde: { tipo: 'monton' }, escalera: 0 });
    expect(e.montones[0]).toEqual(c('2t'));
    expect(spiteMalice.vistaDe(e, 1).montones[0]!.arriba).toBe(una('2t'));
  });

  it('al vaciar la mano se roban otras 5', () => {
    let e = preparado({ manos: [c('Ap'), c('4d')] });
    const mazo = e.mazo.length;
    e = jugar(e, { tipo: 'jugar', desde: { tipo: 'mano', carta: una('Ap') }, escalera: 0 });
    expect(e.manos[0]).toHaveLength(5);
    expect(e.mazo).toHaveLength(mazo - 5);
    expect(e.turno).toBe(0);
  });

  it('descartar termina el turno, y el rival roba hasta 5', () => {
    let e = preparado({ manos: [c('Ap 2p 3p Kd 7c'), c('4d 5d')] });
    e = jugar(e, { tipo: 'descartar', carta: una('7c'), pila: 2 });
    expect(e.descartes[0]![2]).toEqual(c('7c'));
    expect(e.turno).toBe(1);
    expect(e.manos[1]).toHaveLength(5);
  });

  it('se puede jugar la de arriba de un descarte', () => {
    const e = preparado({ descartes: [[c('9c Ap'), [], [], []], vacias()] });
    expect(legales(e)).toContainEqual({
      tipo: 'jugar',
      desde: { tipo: 'descarte', pila: 0 },
      escalera: 0,
    });
  });

  it('con el mazo agotado, las completas se barajan y forman el mazo', () => {
    let e = preparado({
      mazo: [],
      completas: c('Ap 2p 3p 4p 5p 6p 7p 8p 9p 10p Jp Qp'),
      manos: [c('Ap 2p 3p Kd 7c'), c('4d')],
    });
    e = jugar(e, { tipo: 'descartar', carta: una('7c'), pila: 0 });
    expect(e.manos[1]).toHaveLength(5);
    expect(e.completas).toEqual([]);
    expect(e.mazo).toHaveLength(8);
  });
});

describe('fin', () => {
  it('gana quien vacía su montón', () => {
    let e = preparado({ montones: [c('Ap'), c('3t')] });
    e = jugar(e, { tipo: 'jugar', desde: { tipo: 'monton' }, escalera: 0 });
    expect(spiteMalice.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [0, 1] });
    expect(spiteMalice.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('empate si los dos pasan seguidos sin poder mover', () => {
    let e = preparado({ manos: [[], []], mazo: [], montones: [c('9c'), c('8c')] });
    expect(legales(e)).toEqual([{ tipo: 'pasar' }]);
    e = jugar(e, { tipo: 'pasar' });
    e = jugar(e, { tipo: 'pasar' });
    expect(spiteMalice.resultado(e)).toEqual({ ganadores: [], empate: true, puntos: [1, 1] });
  });
});

describe('vista', () => {
  it('no contiene la mano del rival, el montón boca abajo ni el mazo', () => {
    const e = nueva();
    const v = spiteMalice.vistaDe(e, 0);
    const texto = JSON.stringify(v);
    const vistas = new Set([...e.manos[0]!, ...e.montones.map((m) => m.at(-1)!)]);
    const ocultas = [...e.manos[1]!, ...e.montones.flatMap((m) => m.slice(0, -1)), ...e.mazo];
    for (const x of ocultas.filter((x) => !vistas.has(x))) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(spiteMalice, {
  configs: [CONFIG_SPITE_MALICE_POR_DEFECTO],
  // Con dos barajas, una carta oculta puede tener su copia a la vista: solo cuentan las que no.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(asiento === null ? [] : e.manos[asiento]!),
      ...e.montones.flatMap((m) => (m.length > 0 ? [m.at(-1)!] : [])),
      ...e.descartes.flat(2),
      ...e.escaleras.flat(),
      ...e.completas,
      ...(e.ultimaAccion?.carta ? [e.ultimaAccion.carta] : []),
      ...(e.ultimaAccion?.accion.tipo === 'descartar' ? [e.ultimaAccion.accion.carta] : []),
      ...(e.ultimaAccion?.accion.tipo === 'jugar' && e.ultimaAccion.accion.desde.tipo === 'mano'
        ? [e.ultimaAccion.accion.desde.carta]
        : []),
    ]);
    return [
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
      ...e.montones.flatMap((m) => m.slice(0, -1)),
      ...e.mazo,
    ].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1_500,
});
