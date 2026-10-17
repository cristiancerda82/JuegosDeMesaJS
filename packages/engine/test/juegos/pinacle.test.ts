import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  bajadasPosibles,
  bandoPinacle,
  cartasPinacle,
  CONFIG_PINACLE_POR_DEFECTO,
  pinacle,
  puntuarManoPinacle,
  valorCombinacion,
  type AccionPinacle,
  type CartaPinacle,
  type Combinacion,
  type EscaleraPinacle,
  type EstadoPinacle,
  type GrupoPinacle,
} from '../../src/juegos/pinacle';
import { planesParaBajar } from '../../src/juegos/pinacle-plan';
import { aplicar } from '../../src/motor/aplicar';
import { igualesJSON } from '../../src/motor/json';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

const c = (id: IdCarta, copia = 0): CartaPinacle => `${id}#${copia}`;
const J0 = c('comodin-1');
const J1 = c('comodin-2');

function nueva(jugadores: 2 | 4 = 2, semilla = 'p'): EstadoPinacle {
  const r = pinacle.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Estado con las manos dadas, en la fase dada y con el resto por defecto. */
function mesa(manos: CartaPinacle[][], parcial: Partial<EstadoPinacle> = {}): EstadoPinacle {
  const base = nueva(manos.length as 2 | 4);
  return {
    ...base,
    manos,
    conocidas: manos.map(() => []),
    mazo: [c('diamantes-5', 1), c('treboles-6', 1), c('picas-7', 1)],
    monton: [c('corazones-4', 1)],
    turno: 0,
    fase: 'bajar',
    ...parcial,
  };
}

function jugar(e: EstadoPinacle, asiento: number, accion: AccionPinacle): EstadoPinacle {
  const r = aplicar(pinacle, e, asiento, accion);
  if (!r.ok) throw new Error(`${r.error}: ${JSON.stringify(accion)}`);
  return r.valor;
}

const legales = (e: EstadoPinacle, a = e.turno) => pinacle.accionesLegales(e, a);
const esLegal = (e: EstadoPinacle, accion: AccionPinacle, a = e.turno) =>
  legales(e, a).some((x) => igualesJSON(x, accion));

const grupo = (
  numero: number,
  cartas: CartaPinacle[],
  extra: Partial<GrupoPinacle> = {},
): GrupoPinacle => ({
  id: 1,
  bando: 0,
  cambiados: [],
  primerTurno: 1,
  variosTurnos: false,
  tipo: 'grupo',
  numero,
  cartas,
  ...extra,
});

const escalera = (
  palo: EscaleraPinacle['palo'],
  desde: number,
  puestos: CartaPinacle[],
  extra: Partial<EscaleraPinacle> = {},
): EscaleraPinacle => ({
  id: 1,
  bando: 0,
  cambiados: [],
  primerTurno: 1,
  variosTurnos: false,
  tipo: 'escalera',
  palo,
  desde,
  puestos,
  ...extra,
});

/** Las cartas naturales de una escalera completa de un palo, del 3 al As. */
const completa = (palo: string, copia = 0) =>
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1].map((v) => c(`${palo}-${v}` as IdCarta, copia));

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto del Pinacle', () => {
  it('108 cartas distintas, con 4 comodines', () => {
    const cartas = cartasPinacle();
    expect(cartas).toHaveLength(108);
    expect(new Set(cartas).size).toBe(108);
    expect(cartas.filter((x) => x.startsWith('comodin'))).toHaveLength(4);
  });

  it('con 2 jugadores: 11 cartas cada uno, 1 en el montón y 85 en el mazo', () => {
    const e = nueva(2);
    expect(e.manos.map((m) => m.length)).toEqual([11, 11]);
    expect(e.monton).toHaveLength(1);
    expect(e.mazo).toHaveLength(85);
    expect(e.turno).toBe(0);
  });

  it('con 4 jugadores, las parejas están enfrentadas', () => {
    const e = nueva(4);
    expect(e.manos.map((m) => m.length)).toEqual([11, 11, 11, 11]);
    expect(e.mazo).toHaveLength(63);
    expect([0, 1, 2, 3].map(bandoPinacle)).toEqual([0, 1, 0, 1]);
  });

  it('rechaza 3 jugadores', () => {
    expect(pinacle.crear({ jugadores: 3 as 2 }, 'x').ok).toBe(false);
  });
});

// ── Turno ────────────────────────────────────────────────────────────────────

describe('turno del Pinacle', () => {
  it('robar del mazo da la carta de arriba y no toca el montón', () => {
    const e = mesa([[c('picas-3')], [c('picas-4')]], { fase: 'robar' });
    const tras = jugar(e, 0, { tipo: 'robar', desde: 'mazo' });
    expect(tras.manos[0]).toEqual([c('picas-3'), c('picas-7', 1)]);
    expect(tras.monton).toEqual(e.monton);
    expect(tras.fase).toBe('bajar');
  });

  it('llevarse el montón obliga a bajar su carta de arriba antes de descartar', () => {
    const monton = [
      c('picas-4'),
      c('corazones-12'),
      c('treboles-5'),
      c('picas-10'),
      c('diamantes-9'),
    ];
    const e = mesa([[c('treboles-9'), c('picas-9'), c('corazones-3')], [c('picas-4', 1)]], {
      fase: 'robar',
      monton,
    });
    expect(esLegal(e, { tipo: 'robar', desde: 'monton' })).toBe(true);
    const tras = jugar(e, 0, { tipo: 'robar', desde: 'monton' });
    expect(tras.manos[0]).toHaveLength(8);
    expect(tras.monton).toEqual([]);
    expect(tras.conocidas[0]).toEqual(monton);
    expect(tras.debeBajar).toBe(c('diamantes-9'));
    expect(legales(tras).some((a) => a.tipo === 'descartar')).toBe(false);
    const bajado = jugar(tras, 0, {
      tipo: 'bajar',
      combinacion: { tipo: 'grupo', cartas: [c('picas-9'), c('diamantes-9'), c('treboles-9')] },
    });
    expect(bajado.debeBajar).toBeNull();
    expect(legales(bajado).some((a) => a.tipo === 'descartar')).toBe(true);
    // Las que se llevó del montón y no bajó siguen siendo conocidas.
    expect(bajado.conocidas[0]).toHaveLength(4);
  });

  it('no se puede llevar un montón cuya carta de arriba no se puede bajar', () => {
    const e = mesa([[c('treboles-9'), c('picas-3'), c('corazones-12')], [c('picas-4', 1)]], {
      fase: 'robar',
      monton: [c('diamantes-6')],
    });
    expect(legales(e)).toEqual([{ tipo: 'robar', desde: 'mazo' }]);
  });

  it('solo actúa el jugador en turno', () => {
    const e = nueva();
    expect(legales(e, 1)).toEqual([]);
    expect(legales(e, 0).length).toBeGreaterThan(0);
  });
});

// ── Combinaciones ────────────────────────────────────────────────────────────

describe('combinaciones del Pinacle', () => {
  it('un grupo puede llevar varios comodines', () => {
    const mano = [c('treboles-7'), c('diamantes-7'), J0, c('picas-2'), c('corazones-13')];
    let e = mesa([mano, [c('picas-4', 1)]]);
    e = jugar(e, 0, {
      tipo: 'bajar',
      combinacion: { tipo: 'grupo', cartas: [c('diamantes-7'), c('treboles-7'), J0] },
    });
    e = jugar(e, 0, { tipo: 'anadir', combinacion: 1, carta: c('picas-2') });
    expect(e.combinaciones[0]).toMatchObject({ tipo: 'grupo', numero: 7 });
    expect((e.combinaciones[0] as GrupoPinacle).cartas).toHaveLength(4);
  });

  it('toda combinación lleva al menos 2 cartas naturales', () => {
    const bajadas = bajadasPosibles([c('treboles-7'), J0, c('picas-2')]);
    expect(bajadas).toEqual([]);
  });

  it('una escalera puede tener un comodín en un hueco', () => {
    const bajadas = bajadasPosibles([c('corazones-5'), J0, c('corazones-7')]);
    expect(bajadas).toContainEqual({
      tipo: 'escalera',
      palo: 'corazones',
      desde: 5,
      puestos: [c('corazones-5'), J0, c('corazones-7')],
    });
  });

  it('el As va solo por arriba y un dos no es natural', () => {
    const bajadas = bajadasPosibles([c('picas-1'), c('picas-2'), c('picas-3')]);
    expect(bajadas).toEqual([]);
    const arriba = bajadasPosibles([c('picas-12'), c('picas-13'), c('picas-1')]);
    expect(arriba).toEqual([
      {
        tipo: 'escalera',
        palo: 'picas',
        desde: 12,
        puestos: [c('picas-12'), c('picas-13'), c('picas-1')],
      },
    ]);
  });

  it('las dos copias de una carta dan la misma jugada', () => {
    const una = bajadasPosibles([c('picas-5'), c('picas-6'), c('picas-7')]);
    const dos = bajadasPosibles([c('picas-5'), c('picas-5', 1), c('picas-6'), c('picas-7')]);
    expect(dos).toEqual(una);
  });

  it('se añade a las combinaciones del compañero, no a las del rival', () => {
    const propia = grupo(12, [c('picas-12'), c('corazones-12'), c('treboles-12')], {
      id: 1,
      bando: 0,
    });
    const rival = grupo(12, [c('picas-12', 1), c('corazones-12', 1), c('treboles-12', 1)], {
      id: 2,
      bando: 1,
    });
    const e = mesa([[c('diamantes-12'), c('picas-3')], [], [], []], {
      combinaciones: [propia, rival],
      siguienteId: 3,
    });
    expect(esLegal(e, { tipo: 'anadir', combinacion: 1, carta: c('diamantes-12') })).toBe(true);
    expect(esLegal(e, { tipo: 'anadir', combinacion: 2, carta: c('diamantes-12') })).toBe(false);
  });
});

// ── Cambiar comodines ────────────────────────────────────────────────────────

describe('cambiar un comodín', () => {
  it('en una escalera: la natural a su sitio y el comodín a un extremo, con premio', () => {
    const esc = escalera('picas', 8, [c('picas-8'), J0, c('picas-10')]);
    const e = mesa([[c('picas-9'), c('corazones-3'), c('corazones-4')], [c('picas-4', 1)]], {
      combinaciones: [esc],
      siguienteId: 2,
    });
    expect(
      esLegal(e, { tipo: 'cambiar', combinacion: 1, carta: c('picas-9'), extremo: 'abajo' }),
    ).toBe(true);
    expect(
      esLegal(e, { tipo: 'cambiar', combinacion: 1, carta: c('picas-9'), extremo: 'arriba' }),
    ).toBe(true);
    const tras = jugar(e, 0, {
      tipo: 'cambiar',
      combinacion: 1,
      carta: c('picas-9'),
      extremo: 'abajo',
    });
    expect(tras.combinaciones[0]).toMatchObject({
      desde: 7,
      puestos: [J0, c('picas-8'), c('picas-9'), c('picas-10')],
      cambiados: [J0],
    });
    expect(tras.cambiosTurno).toBe(30);
    // Ese comodín ya no se cambia otra vez.
    const otra = mesa([[c('picas-7', 1), c('corazones-3')], [c('picas-4', 1)]], {
      combinaciones: tras.combinaciones,
      siguienteId: 2,
    });
    expect(legales(otra).some((a) => a.tipo === 'cambiar')).toBe(false);
  });

  it('en una escalera completa no hay sitio para el comodín', () => {
    const puestos = completa('corazones');
    puestos[4] = J0;
    const e = mesa([[c('corazones-7', 1), c('picas-3')], [c('picas-4', 1)]], {
      combinaciones: [escalera('corazones', 3, puestos)],
      siguienteId: 2,
    });
    expect(legales(e).some((a) => a.tipo === 'cambiar')).toBe(false);
  });

  it('en un grupo: la natural se añade y el dos se queda, con 30 de premio', () => {
    const g = grupo(10, [c('picas-10'), c('corazones-10'), c('treboles-2')]);
    const e = mesa([[c('diamantes-10'), c('picas-3')], [c('picas-4', 1)]], {
      combinaciones: [g],
      siguienteId: 2,
    });
    const tras = jugar(e, 0, { tipo: 'cambiar', combinacion: 1, carta: c('diamantes-10') });
    expect((tras.combinaciones[0] as GrupoPinacle).cartas).toHaveLength(4);
    expect(tras.combinaciones[0]!.cambiados).toEqual([c('treboles-2')]);
    expect(tras.cambiosTurno).toBe(30);
  });
});

// ── Barbelé ──────────────────────────────────────────────────────────────────

describe('barbelé', () => {
  const ases = [c('picas-1'), c('corazones-1'), c('treboles-1')];
  const escaleraDiez = [c('diamantes-8'), c('diamantes-9'), c('diamantes-10')];

  it('una primera bajada de 70 o más se queda en la mesa', () => {
    let e = mesa([[...ases, ...escaleraDiez, c('picas-4'), c('picas-5')], [c('picas-4', 1)]], {
      puntos: [820, 0],
      puntosInicioMano: [820, 0],
      barbele: [true, false],
    });
    e = jugar(e, 0, { tipo: 'bajar', combinacion: { tipo: 'grupo', cartas: ases } });
    e = jugar(e, 0, {
      tipo: 'bajar',
      combinacion: { tipo: 'escalera', palo: 'diamantes', desde: 8, puestos: escaleraDiez },
    });
    e = jugar(e, 0, { tipo: 'descartar', carta: c('picas-4') });
    expect(e.combinaciones).toHaveLength(2);
    expect(e.abierto[0]).toBe(true);
    expect(e.puntos[0]).toBe(820);
  });

  it('una primera bajada de menos de 70 vuelve a la mano y cuesta 50', () => {
    const sietes = [c('picas-7'), c('corazones-7'), c('treboles-7')];
    let e = mesa([[...sietes, c('picas-4'), c('diamantes-12')], [c('picas-4', 1)]], {
      puntos: [820, 0],
      puntosInicioMano: [820, 0],
      barbele: [true, false],
    });
    e = jugar(e, 0, { tipo: 'bajar', combinacion: { tipo: 'grupo', cartas: sietes } });
    e = jugar(e, 0, { tipo: 'descartar', carta: c('picas-4') });
    expect(e.combinaciones).toEqual([]);
    expect([...e.manos[0]!].sort()).toEqual([...sietes, c('diamantes-12')].sort());
    expect(e.puntos[0]).toBe(770);
    expect(e.abierto[0]).toBe(false);
    expect(e.turno).toBe(1);
  });

  it('el bando barbelé no puede cerrar con menos de 70', () => {
    const sietes = [c('picas-7'), c('corazones-7'), c('treboles-7')];
    const e = mesa([sietes, [c('picas-4', 1)]], {
      puntos: [820, 0],
      puntosInicioMano: [820, 0],
      barbele: [true, false],
    });
    expect(legales(e).some((a) => a.tipo === 'bajar')).toBe(false);
  });
});

// ── Fin de la mano ───────────────────────────────────────────────────────────

describe('fin de la mano del Pinacle', () => {
  it('cerrar descartando la última carta termina la mano', () => {
    const reyes = [c('picas-13'), c('corazones-13'), c('treboles-13')];
    let e = mesa(
      [
        [...reyes, c('picas-4')],
        [c('picas-5', 1), c('picas-6', 1)],
      ],
      {
        bajo: [true, false],
        turnoActual: { puntosBajados: 0, creadas: [], comodinBajado: false, bajoAntes: true },
      },
    );
    e = jugar(e, 0, { tipo: 'bajar', combinacion: { tipo: 'grupo', cartas: reyes } });
    e = jugar(e, 0, { tipo: 'descartar', carta: c('picas-4') });
    expect(e.ultimaMano).toMatchObject({ numero: 1, cierra: 0 });
    expect(e.numeroMano).toBe(2);
    // Reyes (30), otra vez por cerrar sin comodín (30) y 20 por cerrar; el rival resta 10.
    expect(e.puntos).toEqual([80, -10]);
    expect(e.manos.map((m) => m.length)).toEqual([11, 11]);
  });

  it('robar la última carta del mazo termina la mano al acabar el turno', () => {
    let e = mesa([[c('picas-3')], [c('picas-5', 1)]], { fase: 'robar', mazo: [c('picas-4', 1)] });
    e = jugar(e, 0, { tipo: 'robar', desde: 'mazo' });
    expect(e.ultimaMano).toBeNull();
    e = jugar(e, 0, { tipo: 'descartar', carta: c('picas-4', 1) });
    expect(e.ultimaMano).toMatchObject({ cierra: null });
    expect(e.puntos).toEqual([-5, -5]);
  });

  it('la partida termina al llegar a 1500 y gana el bando con más puntos', () => {
    let e = mesa([[c('picas-3')], []], {
      fase: 'robar',
      mazo: [c('picas-4', 1)],
      puntos: [1625, 1480],
      puntosInicioMano: [1625, 1480],
      barbele: [true, true],
    });
    e = jugar(e, 0, { tipo: 'robar', desde: 'mazo' });
    e = jugar(e, 0, { tipo: 'descartar', carta: c('picas-4', 1) });
    expect(pinacle.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [1620, 1480] });
    expect(legales(e, 0)).toEqual([]);
    expect(legales(e, 1)).toEqual([]);
  });
});

// ── Puntos ───────────────────────────────────────────────────────────────────

describe('puntos del Pinacle', () => {
  it('valor de una combinación sencilla', () => {
    expect(valorCombinacion(grupo(13, [c('picas-13'), c('corazones-13'), c('picas-2')]))).toEqual({
      valor: 40,
      premio: null,
    });
  });

  it('ocho Ases limpios valen 1000', () => {
    const ocho = ['picas', 'corazones', 'diamantes', 'treboles'].flatMap((p) => [
      c(`${p}-1` as IdCarta),
      c(`${p}-1` as IdCarta, 1),
    ]);
    expect(valorCombinacion(grupo(14, ocho))).toEqual({ valor: 1000, premio: 'ocho-limpias' });
    expect(valorCombinacion(grupo(14, ocho.slice(0, 6)))).toEqual({
      valor: 300,
      premio: 'seis-limpias',
    });
    expect(valorCombinacion(grupo(14, [...ocho.slice(0, 5), J0]))).toEqual({
      valor: 180,
      premio: 'seis-con-comodin',
    });
  });

  it('ocho cincos limpios valen 50 más sus cartas', () => {
    const ocho = ['picas', 'corazones', 'diamantes', 'treboles'].flatMap((p) => [
      c(`${p}-5` as IdCarta),
      c(`${p}-5` as IdCarta, 1),
    ]);
    expect(valorCombinacion(grupo(5, ocho))).toEqual({ valor: 90, premio: 'ocho-iguales' });
  });

  it('Pinacle: 11 cartas iguales, 3000 de golpe y 1500 poco a poco', () => {
    const once = [
      ...['picas', 'corazones', 'diamantes', 'treboles'].flatMap((p) => [
        c(`${p}-13` as IdCarta),
        c(`${p}-13` as IdCarta, 1),
      ]),
      J0,
      J1,
      c('picas-2'),
    ];
    expect(valorCombinacion(grupo(13, once))).toEqual({ valor: 3000, premio: 'pinacle-golpe' });
    expect(valorCombinacion(grupo(13, once, { variosTurnos: true }))).toEqual({
      valor: 1500,
      premio: 'pinacle',
    });
  });

  it('escaleras completas', () => {
    const limpia = completa('corazones');
    expect(valorCombinacion(escalera('corazones', 3, limpia)).valor).toBe(1000);
    const conDos = limpia.map((x, i) => (i === 6 ? c('corazones-2') : x));
    expect(valorCombinacion(escalera('corazones', 3, conDos))).toEqual({
      valor: 800,
      premio: 'escalera-un-comodin',
    });
    const conDosComodines = conDos.map((x, i) => (i === 2 ? J0 : x));
    expect(valorCombinacion(escalera('corazones', 3, conDosComodines)).valor).toBe(750);
    const sucia = limpia.map((x, i) => (i === 6 ? c('treboles-2') : x));
    expect(valorCombinacion(escalera('corazones', 3, sucia))).toEqual({
      valor: 550,
      premio: 'escalera-sucia',
    });
  });

  const trio = (v: number, copia = 0, id = 1, bando = 0): Combinacion =>
    grupo(
      v,
      ['picas', 'corazones', 'treboles'].map((p) => c(`${p}-${v}` as IdCarta, copia)),
      { id, bando },
    );

  it('puntuación con cierre: combinaciones, 20 por cerrar y lo que resta la mano', () => {
    // 6 tríos de 30 para el que cierra (180) y 3 para el rival (90).
    const propias = [13, 12, 11, 10, 9, 8].map((v, i) => trio(v, 0, i + 1, 0));
    const rivales = [13, 12, 11].map((v, i) => trio(v, 1, i + 10, 1));
    const [a, b] = puntuarManoPinacle({
      bandos: 2,
      combinaciones: [...propias, ...rivales],
      manos: [[], [c('picas-8'), c('picas-9'), c('picas-10'), c('picas-3')]],
      cambios: [0, 0],
      penalizaciones: [0, 0],
      cierre: { bando: 0, deGolpe: false, sinComodin: false, creadas: [] },
    });
    expect(a!.total).toBe(200);
    expect(b!.total).toBe(55);
  });

  it('cerrar de golpe sin comodines cuadruplica', () => {
    const ases = grupo(14, [c('picas-1'), c('corazones-1'), c('treboles-1')], { id: 1 });
    const reyes = grupo(
      13,
      ['picas', 'corazones', 'treboles', 'diamantes', 'picas'].map((p, i) =>
        c(`${p}-13` as IdCarta, i === 4 ? 1 : 0),
      ),
      { id: 2 },
    );
    const [a] = puntuarManoPinacle({
      bandos: 2,
      combinaciones: [ases, reyes],
      manos: [[], []],
      cambios: [0, 0],
      penalizaciones: [0, 0],
      cierre: { bando: 0, deGolpe: true, sinComodin: true, creadas: [1, 2] },
    });
    expect(a).toMatchObject({ enMesa: 95, cerrar: 0, total: 380 });
  });

  it('cerrar sin comodín dobla las combinaciones nuevas del turno', () => {
    const viejo = trio(13, 0, 1);
    const nuevo = trio(12, 0, 2);
    const [a] = puntuarManoPinacle({
      bandos: 2,
      combinaciones: [viejo, nuevo],
      manos: [[], []],
      cambios: [15, 0],
      penalizaciones: [1, 0],
      cierre: { bando: 0, deGolpe: false, sinComodin: true, creadas: [2] },
    });
    expect(a).toMatchObject({ enMesa: 60, cerrar: 20, sinComodin: 30, cambios: 15, barbele: -50 });
    expect(a!.total).toBe(75);
  });
});

// ── Ayuda para bajar ─────────────────────────────────────────────────────────

describe('planes para bajar', () => {
  const vistaCon = (mano: CartaPinacle[], parcial: Partial<EstadoPinacle> = {}) =>
    pinacle.vistaDe(mesa([mano, [c('picas-4', 1)]], parcial), 0);

  it('tres reinas forman un grupo', () => {
    const reinas = [c('picas-12'), c('corazones-12'), c('treboles-12')];
    const planes = planesParaBajar(vistaCon([...reinas, c('picas-3')]), reinas);
    expect(planes).toHaveLength(1);
    expect(planes[0]!.acciones).toHaveLength(1);
  });

  it('cartas que no combinan no tienen plan', () => {
    const sel = [c('treboles-4'), c('corazones-9'), c('picas-13')];
    expect(planesParaBajar(vistaCon(sel), sel)).toEqual([]);
  });

  it('una escalera larga se baja en varias jugadas', () => {
    const sel = [3, 4, 5, 6, 7].map((v) => c(`diamantes-${v}` as IdCarta));
    const planes = planesParaBajar(vistaCon([...sel, c('picas-13')]), sel);
    expect(planes).toHaveLength(1);
    expect(planes[0]!.combinacion).toMatchObject({ tipo: 'escalera', desde: 3 });
    // Las jugadas del plan son legales una tras otra.
    let e = mesa([[...sel, c('picas-13')], [c('picas-4', 1)]]);
    for (const accion of planes[0]!.acciones) e = jugar(e, 0, accion);
    expect(e.manos[0]).toEqual([c('picas-13')]);
  });

  it('un comodín con dos puestos posibles da dos planes', () => {
    const sel = [c('corazones-6'), c('corazones-7'), J0];
    const planes = planesParaBajar(vistaCon([...sel, c('picas-13')]), sel);
    expect(planes.map((p) => (p.combinacion as EscaleraPinacle).desde).sort()).toEqual([5, 6]);
  });

  it('añadir a una combinación del bando', () => {
    const g = grupo(9, [c('picas-9'), c('corazones-9'), c('treboles-9')]);
    const sel = [c('diamantes-9'), c('picas-9', 1)];
    const planes = planesParaBajar(
      vistaCon([...sel, c('picas-3')], { combinaciones: [g], siguienteId: 2 }),
      sel,
      1,
    );
    expect(planes).toHaveLength(1);
    expect(planes[0]!.acciones).toHaveLength(2);
  });
});

// ── Rendimiento ──────────────────────────────────────────────────────────────

describe('rendimiento', () => {
  it('las acciones legales con 50 cartas en la mano tardan menos de 5 ms', () => {
    const mano = cartasPinacle()
      .filter((_, i) => i % 2 === 0)
      .slice(0, 50);
    const e = mesa([mano, [c('picas-4', 1)]]);
    const inicio = Date.now();
    for (let i = 0; i < 20; i++) legales(e);
    expect((Date.now() - inicio) / 20).toBeLessThan(5);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(pinacle, {
  configs: [CONFIG_PINACLE_POR_DEFECTO, { jugadores: 4 }],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) =>
      a === asiento ? [] : m.filter((x) => !e.conocidas[a]!.includes(x)),
    ),
  ],
  pasosMaximos: 300,
  // Con manos grandes cada paso cuesta más que en otros juegos.
  ejecuciones: 20,
});
