import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  BARAJA_SKAT,
  CONFIG_SKAT_POR_DEFECTO,
  ganadoraSkat,
  matadoresSkat,
  puntuarManoSkat,
  skat,
  VALORES_SUBASTA,
  type AccionSkat,
  type EstadoSkat,
} from '../../src/juegos/skat';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «Jt» es la J de tréboles; p, c y d, picas, corazones y diamantes. */
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

function nueva(semilla = 'skat'): EstadoSkat {
  const r = skat.crear(CONFIG_SKAT_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoSkat, accion: AccionSkat): EstadoSkat {
  const r = aplicar(skat, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoSkat) => skat.accionesLegales(e, e.turno);
const pujar: AccionSkat = { tipo: 'pujar' };
const aceptar: AccionSkat = { tipo: 'aceptar' };
const pasar: AccionSkat = { tipo: 'pasar' };

/** Reparte el 2: Vorhand es el 0, Mittelhand el 1 y Hinterhand el 2. */
const MANOS = [
  'Jt Jp At 10t Kt Qt 9t Ap 10p Ac',
  'Jc Jd 8t 7t Kp Qp 9p 10c Kc Qc',
  '8p 7p Ad 10d Kd Qd 9d 8d 9c 8c',
];
const SKAT = '7d 7c';

function conManos(parcial: Partial<EstadoSkat> = {}): EstadoSkat {
  return { ...nueva(), manos: MANOS.map(c), skat: c(SKAT), ...parcial };
}

/** El 0 gana la subasta con 18 y coge el Skat. */
function solistaCero(): EstadoSkat {
  let e = conManos();
  e = jugar(e, pujar); // Mittelhand 18
  e = jugar(e, aceptar); // Vorhand acepta
  e = jugar(e, pasar); // Mittelhand pasa
  e = jugar(e, pasar); // Hinterhand pasa
  return e;
}

describe('baraja y reparto', () => {
  it('32 cartas, 10 a cada uno y 2 en el Skat', () => {
    expect(BARAJA_SKAT).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10]);
    expect(e.skat).toHaveLength(2);
    expect(new Set([...e.manos.flat(), ...e.skat]).size).toBe(32);
    expect(e.repartidor).toBe(2);
    // Puja primero Mittelhand.
    expect(e.turno).toBe(1);
  });

  it('los valores de la subasta empiezan en 18, 20, 22, 23, 24, 27', () => {
    expect(VALORES_SUBASTA.slice(0, 10)).toEqual([18, 20, 22, 23, 24, 27, 30, 33, 35, 36]);
  });
});

describe('subasta', () => {
  it('Vorhand acepta 18 y 20, Mittelhand pasa y Hinterhand también: Vorhand juega con 20', () => {
    let e = conManos();
    e = jugar(e, pujar);
    expect(e.subasta.valor).toBe(18);
    expect(e.turno).toBe(0);
    e = jugar(e, aceptar);
    e = jugar(e, pujar);
    expect(e.subasta.valor).toBe(20);
    e = jugar(e, aceptar);
    e = jugar(e, pasar);
    // Ahora Hinterhand puja a Vorhand.
    expect(e.turno).toBe(2);
    expect(e.subasta.tramo).toBe(2);
    e = jugar(e, pasar);
    expect(e.fase).toBe('skat');
    expect(e.solista).toBe(0);
    expect(e.puja).toBe(20);
  });

  it('si todos pasan, mano nueva con el siguiente repartidor', () => {
    let e = conManos();
    e = jugar(e, pasar);
    e = jugar(e, pasar);
    expect(e.subasta.tramo).toBe(3);
    expect(e.turno).toBe(0);
    e = jugar(e, pasar);
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('subasta');
    expect(e.manosAnuladas).toBe(1);
    expect(e.resultadosManos).toEqual([]);
  });

  it('si nadie puja, Vorhand puede jugar con 18', () => {
    let e = conManos();
    e = jugar(jugar(e, pasar), pasar);
    e = jugar(e, pujar);
    expect(e.solista).toBe(0);
    expect(e.puja).toBe(18);
  });
});

describe('el Skat y declarar', () => {
  it('coger el Skat: 12 cartas, se descarta de 2 y declara', () => {
    let e = jugar(solistaCero(), { tipo: 'cogerSkat' });
    expect(e.manos[0]).toHaveLength(12);
    expect(skat.vistaDe(e, 0).skat).toEqual([]);
    e = jugar(e, { tipo: 'descartar', carta: una('7d') });
    e = jugar(e, { tipo: 'descartar', carta: una('7c') });
    expect(e.fase).toBe('declarar');
    expect(e.manos[0]).toHaveLength(10);
    expect(skat.vistaDe(e, 0).skat).toEqual(c('7d 7c'));
    expect(skat.vistaDe(e, 1).skat).toBeNull();
    // Sin jugar de mano, solo el Nulo puede ser ouvert.
    const anuncios = legales(e).flatMap((a) => (a.tipo === 'declarar' ? [a.anuncio] : []));
    expect(new Set(anuncios)).toEqual(new Set(['ninguno', 'ouvert']));
    e = jugar(e, { tipo: 'declarar', juego: 'treboles', anuncio: 'ninguno' });
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    expect(e.matadores).toEqual({ con: true, n: 2 });
  });

  it('jugando de mano se pueden anunciar schneider, schwarz y ouvert', () => {
    const e = solistaCero();
    expect(legales(e)).toContainEqual({ tipo: 'declarar', juego: 'grand', anuncio: 'schwarz' });
    const ouvert = jugar(e, { tipo: 'declarar', juego: 'nulo', anuncio: 'ouvert' });
    expect(skat.vistaDe(ouvert, 1).manoOuvert).toEqual(ouvert.manos[0]);
  });
});

describe('orden y bazas', () => {
  const mesa = (cartas: string) => c(cartas).map((carta, asiento) => ({ asiento, carta }));

  it('las J son los triunfos más altos, J♣ la primera', () => {
    expect(ganadoraSkat(mesa('Ac Jd'), 'corazones').asiento).toBe(1);
    expect(ganadoraSkat(mesa('Jd Jt'), 'grand').asiento).toBe(1);
    // En palo, el 10 gana al K y pierde con el As.
    expect(ganadoraSkat(mesa('Kp 10p Ap'), 'treboles').asiento).toBe(2);
    // En Nulo, la J va entre la Q y el 10.
    expect(ganadoraSkat(mesa('10p Jp'), 'nulo').asiento).toBe(1);
  });

  it('una J no obliga a seguir su palo: es triunfo', () => {
    const e = conManos({
      fase: 'bazas',
      solista: 0,
      juego: 'corazones',
      manos: [c('Ap'), c('Jp 8t Ac'), c('7p')],
      mesa: [{ asiento: 0, carta: una('Kp') }],
      turno: 1,
    });
    expect(legales(e)).toHaveLength(3);
  });

  it('con una J de salida hay que seguir con triunfo', () => {
    const e = conManos({
      fase: 'bazas',
      solista: 0,
      juego: 'treboles',
      manos: [c('Ap'), c('8t Ap 9c'), c('7p')],
      mesa: [{ asiento: 0, carta: una('Jd') }],
      turno: 1,
    });
    expect(legales(e)).toEqual([{ tipo: 'jugar', carta: una('8t') }]);
  });

  it('en Nulo la mano termina en cuanto el solista hace una baza', () => {
    let e = jugar(solistaCero(), { tipo: 'declarar', juego: 'nulo', anuncio: 'ninguno' });
    e = { ...e, manos: [c('At'), c('7t'), c('8t')], turno: 0 };
    e = jugar(e, { tipo: 'jugar', carta: una('At') });
    e = jugar(e, legales(e)[0]!);
    e = jugar(e, legales(e)[0]!);
    // Al hacer la primera baza, la mano se cierra aunque queden cartas.
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.resultadosManos[0]!.gana).toBe(false);
  });
});

describe('valor y resultado', () => {
  const declarado = (parcial: Partial<EstadoSkat>): EstadoSkat => ({
    ...nueva(),
    fase: 'bazas',
    solista: 0,
    puja: 18,
    cogioSkat: true,
    skat: c('7d 8d'),
    anuncio: 'ninguno',
    bazas: [5, 5],
    ...parcial,
  });

  it('con dos: picas con J♣ y J♠ y 70 puntos vale 33', () => {
    const r = puntuarManoSkat(
      declarado({
        juego: 'picas',
        matadores: matadoresSkat(c('Jt Jp'), 'picas'),
        puntosBazas: [70, 50],
      }),
    );
    expect(r.matadores).toEqual({ con: true, n: 2 });
    expect(r.gana).toBe(true);
    expect(r.valor).toBe(33);
    expect(r.delta).toBe(33);
  });

  it('Grand de mano sin uno con schneider vale 96', () => {
    const r = puntuarManoSkat(
      declarado({
        juego: 'grand',
        cogioSkat: false,
        skat: c('7d 8d'),
        matadores: matadoresSkat(c('Jp Jc Jd'), 'grand'),
        puntosBazas: [95, 25],
      }),
    );
    expect(r.matadores).toEqual({ con: false, n: 1 });
    expect(r.multiplicador).toBe(4);
    expect(r.valor).toBe(96);
  });

  it('pasarse en la puja: pujó 36 y su juego vale 18, pierde 2 × 36', () => {
    const r = puntuarManoSkat(
      declarado({
        juego: 'diamantes',
        puja: 36,
        matadores: matadoresSkat(c('Jt'), 'diamantes'),
        puntosBazas: [70, 50],
      }),
    );
    expect(r.gana).toBe(false);
    expect(r.pasado).toBe(true);
    expect(r.valor).toBe(36);
    expect(r.delta).toBe(-72);
  });

  it('el Skat cuenta para el solista: 55 en bazas y un As y un 10 en el Skat ganan', () => {
    const r = puntuarManoSkat(
      declarado({
        juego: 'grand',
        skat: c('Ad 10d'),
        matadores: matadoresSkat(c('Jt'), 'grand'),
        puntosBazas: [55, 44],
      }),
    );
    expect(r.puntosSolista).toBe(76);
    expect(r.gana).toBe(true);
  });

  it('el schneider anunciado obliga a hacer 90', () => {
    const r = puntuarManoSkat(
      declarado({
        juego: 'treboles',
        cogioSkat: false,
        anuncio: 'schneider',
        matadores: matadoresSkat(c('Jt'), 'treboles'),
        puntosBazas: [80, 40],
      }),
    );
    expect(r.gana).toBe(false);
  });

  it('Nulo: valores 23, 35, 46 y 59', () => {
    const nulo = (cogioSkat: boolean, anuncio: 'ninguno' | 'ouvert') =>
      puntuarManoSkat(declarado({ juego: 'nulo', cogioSkat, anuncio, bazas: [0, 10] })).valor;
    expect([
      nulo(true, 'ninguno'),
      nulo(false, 'ninguno'),
      nulo(true, 'ouvert'),
      nulo(false, 'ouvert'),
    ]).toEqual([23, 35, 46, 59]);
  });
});

describe('puntuación y partida', () => {
  /** Juega la mano entera con la primera acción legal de cada uno. */
  function terminar(e: EstadoSkat): EstadoSkat {
    const manos = e.resultadosManos.length;
    while (e.resultadosManos.length === manos) e = jugar(e, legales(e)[0]!);
    return e;
  }

  it('el solista suma o resta, y los demás no cambian', () => {
    const e = terminar(solistaCero());
    const r = e.resultadosManos[0]!;
    expect(r.solista).toBe(0);
    expect(r.delta).toBe(r.gana ? r.valor : -2 * r.valor);
    expect(e.puntos).toEqual([r.delta, 0, 0]);
    expect(e.repartidor).toBe(0);
  });

  it('la partida dura 3 manos por ronda', () => {
    const r = skat.crear({ jugadores: 3, rondas: 1 }, 'ronda');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    let pasos = 0;
    while (skat.resultado(e) === null && pasos++ < 5_000) e = jugar(e, legales(e)[0]!);
    expect(e.resultadosManos).toHaveLength(3);
    const fin = skat.resultado(e)!;
    const max = Math.max(...e.puntos);
    expect(fin.ganadores).toEqual(e.puntos.flatMap((p, a) => (p === max ? [a] : [])));
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el Skat', () => {
    const e = nueva();
    const texto = JSON.stringify(skat.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.manos[2]!, ...e.skat]) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(skat, {
  configs: [CONFIG_SKAT_POR_DEFECTO, { jugadores: 3, rondas: 1 }],
  // Lo que ya se vio: la última baza, la mano ouvert, el Skat de las manos anteriores y el que
  // conoce el solista.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...e.resultadosManos.flatMap((r) => r.skat),
      ...(e.fase === 'bazas' && e.anuncio === 'ouvert' ? e.manos[e.solista!]! : []),
      ...(asiento === e.solista && e.cogioSkat ? e.skat : []),
    ]);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.skat].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 2_000,
});
