import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_CUATROLA_POR_DEFECTO,
  cuatrola,
  esMatador,
  ganadoraCuatrola,
  jugablesCuatrola,
  llamablesCuatrola,
  rangoCuatrola,
  type AccionCuatrola,
  type EstadoCuatrola,
} from '../../src/juegos/cuatrola';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(semilla = 'cu', manos: 4 | 8 | 12 = 8): EstadoCuatrola {
  const r = cuatrola.crear({ manos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoCuatrola, accion: AccionCuatrola): EstadoCuatrola {
  const r = aplicar(cuatrola, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoCuatrola) => cuatrola.accionesLegales(e, e.turno);
const pasar = { tipo: 'pasar' } as const;
const conRey = { tipo: 'pujar', modalidad: 'rey' } as const;
const solo = { tipo: 'pujar', modalidad: 'solo' } as const;
const jugadas = (j: [number, IdCarta][]) => j.map(([asiento, carta]) => ({ asiento, carta }));

/** Fase de bazas armada a mano: el asiento 0 juega con rey, triunfo oros. */
function enBazas(manos: IdCarta[][], parcial: Partial<EstadoCuatrola> = {}): EstadoCuatrola {
  return {
    ...nueva(),
    azar: crearAzar('mesa'),
    manos,
    fase: 'bazas',
    turno: 0,
    dichos: ['rey', 'paso', 'paso', 'paso'],
    modalidad: 'rey',
    jugador: 0,
    triunfo: 'oros',
    llamada: 'copas-12',
    companero: 2,
    ...parcial,
  };
}

/** Cierra una mano con `bazas` por asiento sin jugarla: la última baza la gana el asiento 0. */
function cerrarCon(bazas: number[], parcial: Partial<EstadoCuatrola> = {}): EstadoCuatrola {
  const e = enBazas([['oros-1'], ['copas-2'], ['copas-4'], ['copas-5']], {
    bazas: bazas.map((b, a) => (a === 0 ? b - 1 : b)),
    bazasMano: new Array(9).fill({ cartas: [], ganador: 0 }),
    ...parcial,
  });
  let f = e;
  for (let i = 0; i < 4; i++) f = hacer(f, legales(f)[0]!);
  return f;
}

// ── Orden del Tresillo ───────────────────────────────────────────────────────

describe('orden de las cartas', () => {
  it('matadores con triunfo rojo y negro', () => {
    expect(esMatador('espadas-1', 'oros')).toBe(true);
    expect(esMatador('bastos-1', 'copas')).toBe(true);
    expect(esMatador('oros-7', 'oros')).toBe(true);
    expect(esMatador('oros-1', 'oros')).toBe(true);
    expect(esMatador('espadas-2', 'espadas')).toBe(true);
    expect(esMatador('espadas-7', 'espadas')).toBe(false);
    expect(esMatador('copas-1', 'oros')).toBe(false);
  });

  it('la espadilla gana siempre', () => {
    const mesa = jugadas([
      [0, 'oros-1'],
      [1, 'espadas-1'],
      [2, 'oros-7'],
    ]);
    expect(ganadoraCuatrola(mesa, 'oros').asiento).toBe(1);
  });

  it('el As de bastos es triunfo', () => {
    const mesa = jugadas([
      [0, 'bastos-12'],
      [1, 'bastos-1'],
    ]);
    expect(ganadoraCuatrola(mesa, 'copas').asiento).toBe(1);
  });

  it('oros al revés fuera del triunfo', () => {
    const mesa = jugadas([
      [0, 'oros-6'],
      [1, 'oros-2'],
    ]);
    expect(ganadoraCuatrola(mesa, 'espadas').asiento).toBe(1);
    expect(rangoCuatrola('copas-1', 'oros')).toBeLessThan(rangoCuatrola('copas-10', 'oros'));
    expect(rangoCuatrola('copas-1', 'oros')).toBeGreaterThan(rangoCuatrola('copas-2', 'oros'));
  });

  it('en un palo negro que no es triunfo manda el 7', () => {
    const mesa = jugadas([
      [0, 'espadas-2'],
      [1, 'espadas-7'],
    ]);
    expect(ganadoraCuatrola(mesa, 'oros').asiento).toBe(1);
  });

  it('el triunfo negro: después de los matadores, R, C, S, 7…3', () => {
    const t = 'bastos';
    const orden: IdCarta[] = [
      'espadas-1',
      'bastos-2',
      'bastos-1',
      'bastos-12',
      'bastos-11',
      'bastos-10',
      'bastos-7',
      'bastos-3',
    ];
    for (let i = 1; i < orden.length; i++) {
      expect(rangoCuatrola(orden[i - 1]!, t)).toBeGreaterThan(rangoCuatrola(orden[i]!, t));
    }
  });
});

describe('obligaciones', () => {
  it('hay que seguir el palo', () => {
    const mano: IdCarta[] = ['copas-4', 'copas-12', 'oros-3'];
    expect(jugablesCuatrola(mano, jugadas([[1, 'copas-6']]), 'oros')).toEqual([
      'copas-4',
      'copas-12',
    ]);
  });

  it('sin el palo, libre', () => {
    const mano: IdCarta[] = ['espadas-4', 'oros-3'];
    expect(jugablesCuatrola(mano, jugadas([[1, 'copas-6']]), 'oros')).toEqual(mano);
  });

  it('los matadores cuentan como triunfo para seguir el palo', () => {
    // La espadilla abre una baza de triunfo: la malilla, más baja, tiene que salir.
    const mano: IdCarta[] = ['oros-7', 'copas-3'];
    expect(jugablesCuatrola(mano, jugadas([[1, 'espadas-1']]), 'oros')).toEqual(['oros-7']);
  });

  it('un matador no está obligado ante un triunfo menor', () => {
    const mano: IdCarta[] = ['espadas-1', 'copas-3'];
    expect(jugablesCuatrola(mano, jugadas([[1, 'oros-12']]), 'oros')).toEqual(mano);
  });

  it('con otros triunfos, se echan esos o los matadores', () => {
    const mano: IdCarta[] = ['espadas-1', 'oros-3', 'copas-3'];
    expect(jugablesCuatrola(mano, jugadas([[1, 'oros-12']]), 'oros')).toEqual([
      'espadas-1',
      'oros-3',
    ]);
  });
});

// ── Reparto, subasta y elección ──────────────────────────────────────────────

describe('reparto y subasta', () => {
  it('10 cartas a cada uno y habla el asiento 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
    expect(new Set(e.manos.flat()).size).toBe(40);
    expect(e.turno).toBe(0);
    expect(legales(e)).toEqual([pasar, conRey, solo]);
  });

  it('valida la configuración', () => {
    expect(cuatrola.crear({ manos: 5 as 4 }, 'x').ok).toBe(false);
    expect(CONFIG_CUATROLA_POR_DEFECTO.manos).toBe(8);
  });

  it('tras «con rey» solo se puede pasar o subir a solo', () => {
    const e = hacer(nueva(), conRey);
    expect(e.turno).toBe(1);
    expect(legales(e)).toEqual([pasar, solo]);
  });

  it('«solo» cierra la subasta', () => {
    let e = hacer(nueva(), conRey);
    e = hacer(e, solo);
    expect(e.fase).toBe('triunfo');
    expect(e.jugador).toBe(1);
    expect(e.modalidad).toBe('solo');
    expect(legales(e)).toHaveLength(4);
  });

  it('gana con rey quien queda cuando los demás pasan', () => {
    let e = hacer(nueva(), pasar);
    e = hacer(e, conRey);
    e = hacer(e, pasar);
    e = hacer(e, pasar);
    expect(e.fase).toBe('triunfo');
    expect(e.jugador).toBe(1);
    expect(e.modalidad).toBe('rey');
  });

  it('si pasan los cuatro se reparte otra vez y la mano no cuenta', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = hacer(e, pasar);
    expect(e.fase).toBe('subasta');
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.numeroMano).toBe(0);
    expect(e.todosPasaron).toBe(true);
  });
});

describe('triunfo y rey llamado', () => {
  it('se llaman los reyes que no se tienen', () => {
    expect(llamablesCuatrola(['oros-12', 'copas-12', 'espadas-3'])).toEqual([
      'espadas-12',
      'bastos-12',
    ]);
  });

  it('con los cuatro reyes se llama un caballo, y con todos los caballos una sota', () => {
    const reyes: IdCarta[] = ['oros-12', 'copas-12', 'espadas-12', 'bastos-12'];
    expect(llamablesCuatrola([...reyes, 'oros-11'])).toEqual([
      'copas-11',
      'espadas-11',
      'bastos-11',
    ]);
    const caballos: IdCarta[] = ['oros-11', 'copas-11', 'espadas-11', 'bastos-11'];
    expect(llamablesCuatrola([...reyes, ...caballos])).toHaveLength(4);
  });

  it('al elegir, el compañero es quien tiene la carta llamada, oculto para los demás', () => {
    let e = hacer(nueva(), conRey);
    for (let i = 0; i < 3; i++) e = hacer(e, pasar);
    const acciones = legales(e);
    expect(acciones.every((a) => a.tipo === 'elegir' && a.llamada !== null)).toBe(true);
    const eleccion = acciones.find((a) => a.tipo === 'elegir' && a.triunfo === 'oros')!;
    e = hacer(e, eleccion);
    const llamada = e.llamada!;
    const companero = e.manos.findIndex((m) => m.includes(llamada));
    expect(e.companero).toBe(companero);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    for (let a = 0; a < 4; a++) {
      expect(cuatrola.vistaDe(e, a).companero).toBe(a === companero ? companero : null);
    }
    expect(cuatrola.vistaDe(e, null).companero).toBeNull();
  });

  it('el compañero se descubre al jugar la carta llamada', () => {
    const e = enBazas([['copas-2'], ['copas-4'], ['copas-12'], ['copas-5']], { turno: 2 });
    const f = hacer(e, { tipo: 'jugar', carta: 'copas-12' });
    expect(cuatrola.vistaDe(f, 1).companero).toBe(2);
    expect(cuatrola.vistaDe(f, 0).companero).toBe(2);
  });
});

// ── Cobro y fin ──────────────────────────────────────────────────────────────

describe('cobro', () => {
  it('gana con rey: la pareja cobra 2 cada uno', () => {
    const f = cerrarCon([4, 1, 3, 2]);
    const r = f.resultadosManos[0]!;
    expect(r.bazasJugador).toBe(7);
    expect(r.gana).toBe(true);
    expect(r.cambio).toEqual([2, -2, 2, -2]);
  });

  it('pierde con rey: paga el jugador y el compañero no', () => {
    const f = cerrarCon([3, 3, 2, 2]);
    expect(f.resultadosManos[0]!.cambio).toEqual([-4, 2, 0, 2]);
  });

  it('bola solo: gana 12 y cada uno pierde 4', () => {
    const f = cerrarCon([10, 0, 0, 0], {
      modalidad: 'solo',
      llamada: null,
      companero: null,
      dichos: ['solo', null, null, null],
    });
    const r = f.resultadosManos[0]!;
    expect(r.bola).toBe(true);
    expect(r.cambio).toEqual([12, -4, -4, -4]);
  });

  it('solo pierde: paga 2 a cada uno', () => {
    const f = cerrarCon([5, 2, 2, 1], { modalidad: 'solo', llamada: null, companero: null });
    expect(f.resultadosManos[0]!.cambio).toEqual([-6, 2, 2, 2]);
  });

  it('las fichas suman 0 y la partida dura las manos de la configuración', () => {
    for (let i = 0; i < 10; i++) {
      let e = nueva(`cobro-${i}`, 4);
      const g = new Generador(crearAzar(`cobro-${i}/g`));
      for (let paso = 0; paso < 3000 && !cuatrola.resultado(e); paso++) {
        const acciones = legales(e);
        e = cuatrola.transicion(e, e.turno, acciones[g.enteroHasta(acciones.length)]!);
        expect(e.fichas.reduce((s, f) => s + f, 0)).toBe(0);
      }
      expect(cuatrola.resultado(e)).not.toBeNull();
      expect(e.resultadosManos).toHaveLength(4);
    }
  });

  it('gana quien más fichas tiene; los empatados ganan todos', () => {
    const e = { ...nueva(), numeroMano: 8, fichas: [4, 4, -4, -4] };
    expect(cuatrola.resultado(e)).toEqual({
      ganadores: [0, 1],
      empate: false,
      puntos: [4, 4, -4, -4],
    });
  });
});

describe('vista de la Cuatrola', () => {
  it('solo la mano propia y el número de cartas de los demás', () => {
    const e = nueva();
    const v = cuatrola.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    expect(JSON.stringify(v)).not.toContain(e.manos[0]![0]!);
  });

  it('en partidas al azar, nadie ve al compañero antes de tiempo', () => {
    for (let i = 0; i < 20; i++) {
      let e = nueva(`oculto-${i}`, 4);
      const g = new Generador(crearAzar(`oculto-${i}/g`));
      for (let paso = 0; paso < 600 && !cuatrola.resultado(e); paso++) {
        if (e.fase === 'bazas' && e.companero !== null) {
          const jugada = [...e.mesa, ...e.bazasMano.flatMap((b) => b.cartas)].some(
            (j) => j.carta === e.llamada,
          );
          for (let a = 0; a < 4; a++) {
            const visto = cuatrola.vistaDe(e, a).companero;
            expect(visto).toBe(jugada || a === e.companero ? e.companero : null);
          }
        }
        const acciones = legales(e);
        e = cuatrola.transicion(e, e.turno, acciones[g.enteroHasta(acciones.length)]!);
      }
    }
  });
});

describirContrato(cuatrola, {
  configs: [{ manos: 4 }],
  // Las cartas de la última baza ya se vieron, aunque sean de la mano anterior, y las cartas
  // llamadas (en esta mano y en las anteriores) se nombran en voz alta: lo oculto es quién las
  // tiene, no cuáles son.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    for (const llamada of [e.llamada, ...e.resultadosManos.map((r) => r.llamada)]) {
      if (llamada !== null) vistas.add(llamada);
    }
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  pasosMaximos: 400,
  ejecuciones: 30,
});
