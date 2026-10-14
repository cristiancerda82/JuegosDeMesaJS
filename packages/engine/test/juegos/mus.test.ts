import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_MUS_POR_DEFECTO,
  mus,
  type AccionMus,
  type ConfigMus,
  type EstadoMus,
} from '../../src/juegos/mus';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigMus> = {}, semilla = 'm'): EstadoMus {
  const r = mus.crear({ ...CONFIG_MUS_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoMus>, 'config'> & { config?: Partial<ConfigMus> };

/** Manos de ejemplo, sin pares ni juego salvo que se indique otra cosa. */
const SIN_NADA: IdCarta[][] = [
  ['oros-12', 'oros-7', 'oros-5', 'oros-4'],
  ['copas-11', 'copas-7', 'copas-6', 'copas-1'],
  ['espadas-10', 'espadas-6', 'espadas-5', 'espadas-1'],
  ['bastos-11', 'bastos-6', 'bastos-4', 'bastos-1'],
];

/** Estado en la fase de mus con las manos dadas; reparte el 3 y es mano el 0. */
function mesa(parcial: Parcial = {}): EstadoMus {
  const config = { ...CONFIG_MUS_POR_DEFECTO, ...parcial.config };
  const base = nueva(config);
  const enMano = new Set((parcial.manos ?? SIN_NADA).flat());
  return {
    ...base,
    manos: SIN_NADA,
    mazo: base.mazo.filter((c) => !enMano.has(c)),
    ...parcial,
    config,
  };
}

function jugar(e: EstadoMus, asiento: number, accion: AccionMus): EstadoMus {
  const r = aplicar(mus, e, asiento, accion);
  if (!r.ok) throw new Error(`${asiento} ${JSON.stringify(accion)}: ${r.error}`);
  return r.valor;
}

/** Aplica una serie de acciones, cada una del asiento que tiene el turno. */
function secuencia(e: EstadoMus, acciones: AccionMus[]): EstadoMus {
  for (const a of acciones) e = jugar(e, e.turno, a);
  return e;
}

const MUS: AccionMus = { tipo: 'mus' };
const CORTAR: AccionMus = { tipo: 'cortar' };
const PASO: AccionMus = { tipo: 'paso' };
const QUIERO: AccionMus = { tipo: 'quiero' };
const NO_QUIERO: AccionMus = { tipo: 'noQuiero' };
const ORDAGO: AccionMus = { tipo: 'ordago' };
const envidar = (piedras: 2 | 5): AccionMus => ({ tipo: 'envidar', piedras });
const subir = (piedras: 2 | 5): AccionMus => ({ tipo: 'subir', piedras });

/** Juega con la primera acción legal (pide mus lo menos posible) hasta la condición o el fin. */
function avanzar(e: EstadoMus, hasta: (e: EstadoMus) => boolean = () => false): EstadoMus {
  for (let pasos = 0; mus.resultado(e) === null && !hasta(e); pasos++) {
    if (pasos > 5000) throw new Error('No termina');
    const acciones = mus.accionesLegales(e, e.turno);
    const accion = acciones.find((a) => a.tipo === 'cortar') ?? acciones[0]!;
    e = jugar(e, e.turno, accion);
  }
  return e;
}

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto', () => {
  it('4 cartas a cada uno, reparte el 3 y es mano el 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([4, 4, 4, 4]);
    expect(e.mazo).toHaveLength(24);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
    expect(mus.vistaDe(e, 0).mano).toBe(0);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(mus.crear({ ...CONFIG_MUS_POR_DEFECTO, reyes: 6 as 8 }, 's').ok).toBe(false);
    expect(mus.crear({ ...CONFIG_MUS_POR_DEFECTO, puntos: 20 as 40 }, 's').ok).toBe(false);
    expect(mus.crear({ ...CONFIG_MUS_POR_DEFECTO, juegos: 2 as 3 }, 's').ok).toBe(false);
  });
});

// ── Mus y descartes ──────────────────────────────────────────────────────────

describe('mus y descartes', () => {
  it('si todos piden mus, cada uno descarta y roba, y se vuelve a preguntar', () => {
    let e = secuencia(nueva(), [MUS, MUS, MUS, MUS]);
    expect(e.fase).toBe('descarte');
    expect(e.turno).toBe(0);
    const antes = e.manos[0]!;
    const fuera = antes.slice(0, 3);
    e = jugar(e, 0, { tipo: 'descartar', cartas: fuera });
    expect(e.manos[0]).toHaveLength(4);
    expect(e.manos[0]!.filter((c) => fuera.includes(c))).toEqual([]);
    expect(e.turno).toBe(1);
    expect(mus.vistaDe(e, 2).descartados).toEqual([3, null, null, null]);
    expect(JSON.stringify(mus.vistaDe(e, 2))).not.toContain(fuera[0]);
    for (const a of [1, 2, 3]) e = jugar(e, a, { tipo: 'descartar', cartas: [e.manos[a]![0]!] });
    expect(e.fase).toBe('mus');
    expect(e.turno).toBe(0);
    expect(e.musPedido).toEqual([false, false, false, false]);
  });

  it('se ofrecen los 15 descartes posibles', () => {
    const e = secuencia(nueva(), [MUS, MUS, MUS, MUS]);
    expect(mus.accionesLegales(e, 0)).toHaveLength(15);
  });

  it('cuando se acaba el mazo se barajan los descartes', () => {
    let e = nueva({}, 'rebarajar');
    for (let ronda = 0; ronda < 4; ronda++) {
      e = secuencia(e, [MUS, MUS, MUS, MUS]);
      for (let i = 0; i < 4; i++) {
        e = jugar(e, e.turno, { tipo: 'descartar', cartas: e.manos[e.turno]! });
      }
    }
    const todas = [...e.manos.flat(), ...e.mazo, ...e.descartes];
    expect(new Set(todas).size).toBe(40);
    expect(e.manos.every((m) => m.length === 4)).toBe(true);
  });

  it('cortar el mus empieza la Grande hablando la mano', () => {
    const e = secuencia(nueva(), [MUS, CORTAR]);
    expect(e.fase).toBe('lance');
    expect(e.lance).toBe('grande');
    expect(e.turno).toBe(0);
  });
});

// ── Lances y apuestas ────────────────────────────────────────────────────────

describe('apuestas', () => {
  it('envite no querido: la pareja que envidó cobra 1', () => {
    let e = secuencia(mesa(), [CORTAR, envidar(2)]);
    expect(e.turno).toBe(1);
    expect(mus.accionesLegales(e, 1).map((a) => a.tipo)).not.toContain('paso');
    e = secuencia(e, [NO_QUIERO]);
    expect(e.turno).toBe(3);
    e = secuencia(e, [NO_QUIERO]);
    expect(e.lances[0]).toEqual({ lance: 'grande', estado: 'noQuerido', piedras: 1, pareja: 0 });
    expect(e.lance).toBe('chica');
  });

  it('contesta el compañero y puede quererlo', () => {
    const e = secuencia(mesa(), [CORTAR, envidar(2), NO_QUIERO, QUIERO]);
    expect(e.lances[0]).toEqual({ lance: 'grande', estado: 'querido', piedras: 2, pareja: null });
  });

  it('subida no querida: cobra lo aceptado antes', () => {
    const e = secuencia(mesa(), [CORTAR, envidar(2), subir(5), NO_QUIERO, NO_QUIERO]);
    expect(e.lances[0]).toEqual({ lance: 'grande', estado: 'noQuerido', piedras: 2, pareja: 1 });
  });

  it('subida querida: 7 piedras', () => {
    const e = secuencia(mesa(), [CORTAR, envidar(2), subir(5), QUIERO]);
    expect(e.lances[0]).toMatchObject({ estado: 'querido', piedras: 7 });
  });

  it('todos pasan: el lance queda en paso', () => {
    const e = secuencia(mesa(), [CORTAR, PASO, PASO, PASO, PASO]);
    expect(e.lances[0]).toMatchObject({ lance: 'grande', estado: 'paso' });
    expect(e.lance).toBe('chica');
  });

  it('nadie tiene pares ni juego: no se juegan Pares y se juega el Punto', () => {
    const e = secuencia(mesa(), [CORTAR, PASO, PASO, PASO, PASO, PASO, PASO, PASO, PASO]);
    expect(e.lances.map((r) => [r.lance, r.estado])).toEqual([
      ['grande', 'paso'],
      ['chica', 'paso'],
      ['pares', 'noSeJuega'],
    ]);
    expect(e.lance).toBe('punto');
    expect(e.declaraciones).toEqual({
      pares: [false, false, false, false],
      juego: [false, false, false, false],
    });
  });

  it('solo una pareja con pares: no se apuesta y cobra sus pares en el conteo', () => {
    const manos: IdCarta[][] = [
      ['oros-12', 'copas-12', 'oros-5', 'oros-4'],
      SIN_NADA[1]!,
      ['espadas-10', 'oros-10', 'oros-6', 'oros-1'],
      SIN_NADA[3]!,
    ];
    let e = secuencia(mesa({ manos }), [CORTAR, PASO, PASO, PASO, PASO, PASO, PASO, PASO, PASO]);
    expect(e.lances[2]).toMatchObject({ lance: 'pares', estado: 'sinApuesta' });
    expect(e.lance).toBe('punto');
    e = secuencia(e, [PASO, PASO, PASO, PASO]);
    const pares = e.resultadosManos[0]!.lances.find((l) => l.lance === 'pares')!;
    expect(pares).toEqual({
      lance: 'pares',
      estado: 'sinApuesta',
      ganador: 0,
      apuesta: [0, 0],
      jugadas: [2, 0],
    });
  });

  it('en Pares solo apuestan los que tienen', () => {
    const manos: IdCarta[][] = [
      SIN_NADA[0]!,
      ['copas-12', 'espadas-12', 'copas-6', 'copas-1'],
      ['espadas-10', 'oros-10', 'espadas-5', 'espadas-1'],
      SIN_NADA[3]!,
    ];
    const e = secuencia(mesa({ manos }), [CORTAR, PASO, PASO, PASO, PASO, PASO, PASO, PASO, PASO]);
    expect(e.lance).toBe('pares');
    expect(e.turno).toBe(1);
    expect(mus.vistaDe(e, 0).declaraciones.pares).toEqual([false, true, true, false]);
    const tras = secuencia(e, [envidar(2)]);
    expect(tras.turno).toBe(2);
    expect(tras.envite!.responde).toEqual([2]);
  });
});

// ── Conteo ───────────────────────────────────────────────────────────────────

describe('conteo', () => {
  it('Grande y Chica en paso valen 1, el Punto 1 y lo no querido se cobra', () => {
    let e = secuencia(mesa(), [CORTAR, PASO, PASO, PASO, PASO]); // Grande en paso
    e = secuencia(e, [envidar(2), NO_QUIERO, NO_QUIERO]); // Chica: 1 para la pareja 0
    e = secuencia(e, [PASO, PASO, PASO, PASO]); // Punto en paso
    const r = e.resultadosManos[0]!;
    // Grande: Rey del 0 (pareja 0). Punto: 0 tiene 26, 1 tiene 24, 2 tiene 22, 3 tiene 22.
    expect(r.lances.map((l) => [l.lance, l.ganador, l.apuesta, l.jugadas])).toEqual([
      ['grande', 0, [1, 0], [0, 0]],
      ['chica', 1, [1, 0], [0, 0]],
      ['pares', null, [0, 0], [0, 0]],
      ['punto', 0, [0, 0], [1, 0]],
    ]);
    expect(r.piedrasTras).toEqual([3, 0]);
    expect(e.piedras).toEqual([3, 0]);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
  });

  it('Pares y Juego cobran por cada jugador de la pareja que gana', () => {
    const manos: IdCarta[][] = [
      ['oros-12', 'copas-12', 'espadas-12', 'oros-1'], // medias de reyes, 31
      ['copas-11', 'oros-11', 'copas-10', 'oros-10'], // duples, 40
      ['espadas-10', 'bastos-10', 'espadas-11', 'espadas-1'], // pareja de sotas, 31
      ['bastos-7', 'bastos-6', 'bastos-4', 'bastos-1'],
    ];
    let e = secuencia(mesa({ manos }), [CORTAR, PASO, PASO, PASO, PASO, PASO, PASO, PASO, PASO]);
    expect(e.lance).toBe('pares');
    e = secuencia(e, [PASO, PASO, PASO]);
    expect(e.lance).toBe('juego');
    e = secuencia(e, [PASO, PASO, PASO]);
    const r = e.resultadosManos[0]!;
    const de = (lance: string) => r.lances.find((l) => l.lance === lance)!;
    // Pares: duples del 1 (3). Juego: 31 del 0 (3) y 31 del 2 (3).
    expect(de('pares')).toMatchObject({ ganador: 1, jugadas: [0, 3] });
    expect(de('juego')).toMatchObject({ ganador: 0, jugadas: [6, 0] });
  });

  it('al llegar a los puntos se gana el juego aunque quede por contar', () => {
    const e0 = mesa({ piedras: [38, 39] });
    let e = secuencia(e0, [CORTAR, envidar(5), QUIERO]); // Grande: 5 para la pareja 0
    e = secuencia(e, [PASO, PASO, PASO, PASO, PASO, PASO, PASO, PASO]);
    const r = e.resultadosManos[0]!;
    expect(r.juegoGanado).toBe(0);
    expect(r.piedrasTras).toEqual([40, 39]);
    expect(r.juegosTras).toEqual([1, 0]);
    expect(e.piedras).toEqual([0, 0]);
    expect(e.juegos).toEqual([1, 0]);
  });

  it('órdago querido: se resuelve en el acto y gana el juego', () => {
    const e = secuencia(mesa(), [CORTAR, ORDAGO, QUIERO]);
    const r = e.resultadosManos[0]!;
    expect(r.ordago).toBe('grande');
    expect(r.juegoGanado).toBe(0);
    expect(r.manos).toEqual(SIN_NADA);
    expect(e.juegos).toEqual([1, 0]);
  });

  it('ante un órdago solo se puede querer o no querer', () => {
    const e = secuencia(mesa(), [CORTAR, ORDAGO]);
    expect(mus.accionesLegales(e, 1)).toEqual([QUIERO, NO_QUIERO]);
  });

  it('órdago no querido: 1 piedra o lo aceptado antes', () => {
    let e = secuencia(mesa(), [CORTAR, ORDAGO, NO_QUIERO, NO_QUIERO]);
    expect(e.lances[0]).toMatchObject({ estado: 'noQuerido', piedras: 1, pareja: 0 });
    e = secuencia(mesa(), [CORTAR, envidar(5), ORDAGO, NO_QUIERO, NO_QUIERO]);
    expect(e.lances[0]).toMatchObject({ estado: 'noQuerido', piedras: 5, pareja: 1 });
  });
});

// ── Partida ──────────────────────────────────────────────────────────────────

describe('partida', () => {
  it('al mejor de 3 gana la pareja que gana 2 juegos', () => {
    const e = secuencia(mesa({ juegos: [1, 1] }), [CORTAR, ORDAGO, QUIERO]);
    expect(mus.resultado(e)).toEqual({ ganadores: [0, 2], empate: false, puntos: [2, 1, 2, 1] });
    expect(mus.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('una partida a 1 juego termina', () => {
    const e = avanzar(nueva({ juegos: 1, puntos: 30 }));
    expect(mus.resultado(e)).not.toBeNull();
    expect(Math.max(...e.juegos)).toBe(1);
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra manos ajenas, el mazo ni los descartes', () => {
    const e = secuencia(nueva(), [MUS, CORTAR]);
    const texto = JSON.stringify(mus.vistaDe(e, 0));
    for (const c of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.mazo]) {
      expect(texto).not.toContain(`"${c}"`);
    }
    expect(mus.vistaDe(e, 0).musPedido).toEqual([true, false, false, false]);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(mus, {
  configs: [
    CONFIG_MUS_POR_DEFECTO,
    { reyes: 4, puntos: 30, juegos: 1 },
    { reyes: 8, puntos: 30, juegos: 5 },
  ],
  // Las cartas enseñadas en los conteos ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.resultadosManos.flatMap((r) => r.manos.flat()));
    return [
      ...e.mazo,
      ...e.descartes,
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
    ].filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
