import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_TUTE_SUBASTADO_POR_DEFECTO,
  pujasSubastado,
  tuteSubastado,
  type AccionTuteSubastado,
  type EstadoTuteSubastado,
} from '../../src/juegos/tute-subastado';
import { aplicar } from '../../src/motor/aplicar';
import { valorDe } from '../../src/motor/bazas';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(semilla = 'ts', manos: 4 | 8 | 12 = 8): EstadoTuteSubastado {
  const r = tuteSubastado.crear({ manos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTuteSubastado, accion: AccionTuteSubastado): EstadoTuteSubastado {
  const r = aplicar(tuteSubastado, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoTuteSubastado) => tuteSubastado.accionesLegales(e, e.turno);
const pasar = { tipo: 'pasar' } as const;
const pujar = (puntos: number) => ({ tipo: 'pujar', puntos }) as const;

/** Fase de bazas armada a mano: pujador 0 con 80, triunfo oros, sale el asiento 0. */
function enBazas(
  manos: IdCarta[][],
  parcial: Partial<EstadoTuteSubastado> = {},
): EstadoTuteSubastado {
  return {
    ...nueva(),
    azar: crearAzar('mesa'),
    manos,
    fase: 'bazas',
    turno: 0,
    dichos: [80, 'paso', 'paso', 'paso'],
    puja: 80,
    pujador: 0,
    triunfo: 'oros',
    ...parcial,
  };
}

/** Juega una partida con acciones al azar y devuelve todos los estados. */
function partidaAlAzar(semilla: string, manos: 4 | 8 | 12 = 4): EstadoTuteSubastado[] {
  let e = nueva(semilla, manos);
  const g = new Generador(crearAzar(`${semilla}/g`));
  const estados = [e];
  for (let i = 0; i < 5000 && !tuteSubastado.resultado(e); i++) {
    const acciones = legales(e);
    // Pasar a menudo, para que la subasta no suba siempre hasta el máximo.
    const pasa = e.fase === 'subasta' && g.enteroHasta(2) === 0;
    e = tuteSubastado.transicion(
      e,
      e.turno,
      pasa ? pasar : acciones[g.enteroHasta(acciones.length)]!,
    );
    estados.push(e);
  }
  return estados;
}

// ── Reparto y subasta ────────────────────────────────────────────────────────

describe('reparto', () => {
  it('10 cartas a cada uno, sin mazo, y habla el asiento 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
    expect(new Set(e.manos.flat()).size).toBe(40);
    expect(e.repartidor).toBe(3);
    expect(e.fase).toBe('subasta');
    expect(e.turno).toBe(0);
    expect(e.fichas).toEqual([0, 0, 0, 0]);
  });

  it('valida la configuración', () => {
    expect(tuteSubastado.crear({ manos: 5 as 4 }, 'x').ok).toBe(false);
    expect(CONFIG_TUTE_SUBASTADO_POR_DEFECTO.manos).toBe(8);
    expect(CONFIG_TUTE_SUBASTADO_POR_DEFECTO.jugadores).toBe(4);
    expect(tuteSubastado.crear({ manos: 4, jugadores: 5 as 4 }, 'x').ok).toBe(false);
  });
});

describe('subasta', () => {
  it('la primera puja va de 60 a 230 de 10 en 10, y se puede pasar', () => {
    const acciones = legales(nueva());
    expect(acciones[0]).toEqual(pasar);
    const pujas = acciones.flatMap((a) => (a.tipo === 'pujar' ? [a.puntos] : []));
    expect(pujas[0]).toBe(60);
    expect(pujas.at(-1)).toBe(230);
    expect(pujas).toHaveLength(18);
    expect(pujas).not.toContain(50);
  });

  it('cada puja sube la vigente', () => {
    const e = hacer(nueva(), pujar(80));
    expect(e.turno).toBe(1);
    expect(pujasSubastado(e.puja)[0]).toBe(90);
    expect(() => hacer(e, pujar(80))).toThrow();
  });

  it('gana quien hizo la última puja cuando los otros tres pasan', () => {
    let e = hacer(nueva(), pasar);
    e = hacer(e, pujar(70));
    e = hacer(e, pasar);
    e = hacer(e, pasar);
    expect(e.fase).toBe('triunfo');
    expect(e.pujador).toBe(1);
    expect(e.puja).toBe(70);
  });

  it('la subasta sigue mientras quede alguien por pasar', () => {
    let e = hacer(nueva(), pujar(60));
    e = hacer(e, pujar(70));
    e = hacer(e, pasar);
    e = hacer(e, pasar);
    expect(e.fase).toBe('subasta');
    expect(e.turno).toBe(0);
    e = hacer(e, pasar);
    expect(e.fase).toBe('triunfo');
    expect(e.pujador).toBe(1);
    expect(e.puja).toBe(70);
    expect(e.turno).toBe(1);
  });

  it('quien pasa ya no vuelve a hablar', () => {
    let e = hacer(nueva(), pasar);
    e = hacer(e, pujar(60));
    e = hacer(e, pujar(70));
    e = hacer(e, pujar(80));
    expect(e.turno).toBe(1);
    e = hacer(e, pujar(90));
    expect(e.turno).toBe(2);
  });

  it('si pasan los cuatro se reparte otra vez y la mano no cuenta', () => {
    const inicio = nueva();
    let e = inicio;
    for (let i = 0; i < 4; i++) e = hacer(e, pasar);
    expect(e.fase).toBe('subasta');
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.numeroMano).toBe(0);
    expect(e.todosPasaron).toBe(true);
    expect(e.manos).not.toEqual(inicio.manos);
    e = hacer(e, pasar);
    expect(e.todosPasaron).toBe(false);
  });
});

describe('triunfo', () => {
  it('el pujador elige uno de los cuatro palos y sale', () => {
    let e = hacer(nueva(), pasar);
    e = hacer(e, pasar);
    e = hacer(e, pujar(60));
    e = hacer(e, pasar);
    expect(e.fase).toBe('triunfo');
    expect(e.turno).toBe(2);
    expect(legales(e)).toHaveLength(4);
    e = hacer(e, { tipo: 'triunfo', palo: 'espadas' });
    expect(e.triunfo).toBe('espadas');
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(2);
    expect(tuteSubastado.vistaDe(e, 0).triunfo).toBe('espadas');
  });
});

// ── Bazas y cantes ───────────────────────────────────────────────────────────

describe('bazas', () => {
  it('hay que superar también al compañero', () => {
    const e = enBazas([['copas-2'], ['oros-12', 'copas-3'], ['oros-1', 'oros-4'], ['espadas-2']], {
      pujador: 0,
      turno: 2,
      mesa: [{ asiento: 1, carta: 'oros-12' }],
      triunfo: 'bastos',
    });
    expect(legales(e)).toEqual([{ tipo: 'jugar', carta: 'oros-1' }]);
  });

  it('sin el palo hay que fallar y superar el triunfo', () => {
    const e = enBazas(
      [['copas-2'], ['espadas-1'], ['oros-2', 'oros-12', 'bastos-1'], ['espadas-2']],
      {
        turno: 2,
        mesa: [
          { asiento: 0, carta: 'espadas-4' },
          { asiento: 1, carta: 'oros-4' },
        ],
      },
    );
    expect(legales(e)).toEqual([{ tipo: 'jugar', carta: 'oros-12' }]);
  });

  it('la última baza suma 10 y cierra la mano', () => {
    const e = enBazas([['oros-1'], ['copas-2'], ['copas-4'], ['copas-5']], {
      puntos: [70, 0, 0, 0],
    });
    let f = hacer(e, { tipo: 'jugar', carta: 'oros-1' });
    f = hacer(f, { tipo: 'jugar', carta: 'copas-2' });
    f = hacer(f, { tipo: 'jugar', carta: 'copas-4' });
    f = hacer(f, { tipo: 'jugar', carta: 'copas-5' });
    const r = f.resultadosManos[0]!;
    expect(r.puntosPujador).toBe(91);
    expect(r.cumple).toBe(true);
  });
});

describe('cantes', () => {
  it('un defensor canta las 20 tras ganar una baza y suma a los defensores', () => {
    const e = enBazas([['oros-2'], ['copas-12', 'copas-11', 'espadas-4'], ['bastos-2'], []], {
      turno: 1,
      puedeCantar: 1,
    });
    const acciones = legales(e);
    expect(acciones).toContainEqual({ tipo: 'cantar', palo: 'copas' });
    const f = hacer(e, { tipo: 'cantar', palo: 'copas' });
    expect(f.cantes).toEqual([{ asiento: 1, palo: 'copas', puntos: 20 }]);
    expect(f.turno).toBe(1);
    expect(legales(f).some((a) => a.tipo === 'cantar')).toBe(false);
  });

  it('sin baza ganada no se canta', () => {
    const e = enBazas([['oros-2'], ['copas-12', 'copas-11'], [], []], { turno: 1 });
    expect(legales(e).some((a) => a.tipo === 'cantar')).toBe(false);
  });

  it('las 40 son del triunfo', () => {
    const e = enBazas([['oros-12', 'oros-11'], [], [], []], { puedeCantar: 0 });
    const f = hacer(e, { tipo: 'cantar', palo: 'oros' });
    expect(f.cantes[0]!.puntos).toBe(40);
  });

  it('el tute del pujador cierra la mano y cumple', () => {
    const reyes: IdCarta[] = ['oros-12', 'copas-12', 'espadas-12', 'bastos-12'];
    const e = enBazas([reyes, ['copas-2'], ['copas-4'], ['copas-5']], { puedeCantar: 0 });
    const f = hacer(e, { tipo: 'cantarTute' });
    const r = f.resultadosManos[0]!;
    expect(r.tute).toBe(0);
    expect(r.cumple).toBe(true);
    expect(f.numeroMano).toBe(1);
  });

  it('el tute de un defensor hace fallar al pujador', () => {
    const caballos: IdCarta[] = ['oros-11', 'copas-11', 'espadas-11', 'bastos-11'];
    const e = enBazas([['copas-2'], caballos, ['copas-4'], ['copas-5']], {
      turno: 1,
      puedeCantar: 1,
    });
    const f = hacer(e, { tipo: 'cantarTute' });
    expect(f.resultadosManos[0]!.cumple).toBe(false);
  });
});

// ── Cobro y fin ──────────────────────────────────────────────────────────────

/** Cierra la mano jugando la última baza con el pujador ganando o no las 10 de últimas. */
function cerrarCon(puja: number, puntosPujador: number): EstadoTuteSubastado {
  // La última baza la gana el pujador con el As de oros: 11 + 10 de últimas.
  const e = enBazas([['oros-1'], ['copas-2'], ['copas-4'], ['copas-5']], {
    puja,
    dichos: [puja, 'paso', 'paso', 'paso'],
    puntos: [puntosPujador - 21, 0, 0, 0],
  });
  let f = e;
  for (let i = 0; i < 4; i++)
    f = hacer(
      f,
      legales(f).find((a) => a.tipo === 'jugar')!,
    );
  return f;
}

describe('cobro', () => {
  it('cumple con 85 sobre 80: gana 24 y cada rival pierde 8', () => {
    const f = cerrarCon(80, 85);
    expect(f.resultadosManos[0]!.cambio).toEqual([24, -8, -8, -8]);
    expect(f.fichas).toEqual([24, -8, -8, -8]);
  });

  it('falla con 95 sobre 100: pierde 30 y cada rival gana 10', () => {
    const f = cerrarCon(100, 95);
    expect(f.resultadosManos[0]!.cumple).toBe(false);
    expect(f.fichas).toEqual([-30, 10, 10, 10]);
  });

  it('tras la mano reparte el siguiente', () => {
    const f = cerrarCon(80, 85);
    expect(f.repartidor).toBe(0);
    expect(f.fase).toBe('subasta');
    expect(f.turno).toBe(1);
  });

  it('las fichas suman 0 y la partida dura las manos de la configuración', () => {
    for (let i = 0; i < 10; i++) {
      const estados = partidaAlAzar(`cobro-${i}`);
      for (const e of estados) expect(e.fichas.reduce((s, f) => s + f, 0)).toBe(0);
      const fin = estados.at(-1)!;
      expect(tuteSubastado.resultado(fin)).not.toBeNull();
      expect(fin.resultadosManos).toHaveLength(4);
    }
  });

  it('gana quien más fichas tiene; los empatados ganan todos', () => {
    const e = { ...cerrarCon(80, 85), numeroMano: 8, fichas: [10, 10, -10, -10] };
    expect(tuteSubastado.resultado(e)).toEqual({
      ganadores: [0, 1],
      empate: false,
      puntos: [10, 10, -10, -10],
    });
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('solo la mano propia y el número de cartas de los demás', () => {
    const e = nueva();
    const v = tuteSubastado.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    expect(JSON.stringify(v)).not.toContain(e.manos[0]![0]!);
    expect(tuteSubastado.vistaDe(e, null).miMano).toBeNull();
  });
});

// ── Partida de 3 ─────────────────────────────────────────────────────────────

function nuevaDeTres(semilla = 'ts3'): EstadoTuteSubastado {
  const r = tuteSubastado.crear({ manos: 4, jugadores: 3 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

describe('partida de 3', () => {
  it('sin la opción juegan 4, también en las partidas guardadas', () => {
    const e = nueva();
    expect(e.config.jugadores).toBe(4);
    const guardada = { ...e, config: { manos: 8 as const } };
    expect(tuteSubastado.asientos(guardada)).toBe(4);
    expect(tuteSubastado.accionesLegales(guardada, 0)).toContainEqual(pujar(60));
  });

  it('12 cartas a cada uno, sin doses, y habla el asiento 0', () => {
    const e = nuevaDeTres();
    expect(tuteSubastado.asientos(e)).toBe(3);
    expect(e.manos.map((m) => m.length)).toEqual([12, 12, 12]);
    expect(new Set(e.manos.flat()).size).toBe(36);
    expect(e.manos.flat().some((c) => valorDe(c) === 2)).toBe(false);
    expect(e.repartidor).toBe(2);
    expect(e.turno).toBe(0);
    expect(e.fichas).toEqual([0, 0, 0]);
  });

  it('la primera puja va de 70 a 230', () => {
    const pujas = legales(nuevaDeTres()).flatMap((a) => (a.tipo === 'pujar' ? [a.puntos] : []));
    expect(pujas[0]).toBe(70);
    expect(pujas.at(-1)).toBe(230);
    expect(pujas).not.toContain(60);
    expect(pujasSubastado(null, 70)[0]).toBe(70);
  });

  it('gana la subasta quien pujó cuando pasan los otros dos', () => {
    let e = hacer(nuevaDeTres(), pasar);
    e = hacer(e, pujar(80));
    e = hacer(e, pasar);
    expect(e.fase).toBe('triunfo');
    expect(e.pujador).toBe(1);
  });

  it('si pasan los tres se reparte otra vez', () => {
    let e = nuevaDeTres();
    for (let i = 0; i < 3; i++) e = hacer(e, pasar);
    expect(e.todosPasaron).toBe(true);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.numeroMano).toBe(0);
  });

  it('no hay tute: con los cuatro Reyes solo se cantan las parejas', () => {
    const e: EstadoTuteSubastado = {
      ...nuevaDeTres(),
      azar: crearAzar('mesa3'),
      manos: [
        ['oros-12', 'oros-11', 'copas-12', 'espadas-12', 'bastos-12'],
        ['copas-4', 'copas-5', 'copas-6', 'copas-7', 'copas-1'],
        ['espadas-4', 'espadas-5', 'espadas-6', 'espadas-7', 'espadas-1'],
      ],
      fase: 'bazas',
      turno: 0,
      dichos: [80, 'paso', 'paso'],
      puja: 80,
      pujador: 0,
      triunfo: 'oros',
      puedeCantar: 0,
    };
    const acciones = legales(e);
    expect(acciones).not.toContainEqual({ tipo: 'cantarTute' });
    expect(acciones).toContainEqual({ tipo: 'cantar', palo: 'oros' });
  });

  it('cumple con 85 sobre 80: gana 16 y cada rival pierde 8', () => {
    const e: EstadoTuteSubastado = {
      ...nuevaDeTres(),
      azar: crearAzar('mesa3'),
      manos: [['oros-1'], ['copas-4'], ['copas-5']],
      fase: 'bazas',
      turno: 0,
      dichos: [80, 'paso', 'paso'],
      puja: 80,
      pujador: 0,
      triunfo: 'oros',
      puntos: [64, 0, 0],
    };
    let f = e;
    for (let i = 0; i < 3; i++)
      f = hacer(
        f,
        legales(f).find((a) => a.tipo === 'jugar')!,
      );
    expect(f.resultadosManos[0]!.puntosPujador).toBe(85);
    expect(f.resultadosManos[0]!.cambio).toEqual([16, -8, -8]);
    expect(f.fichas).toEqual([16, -8, -8]);
    expect(f.repartidor).toBe(0);
    expect(f.manos.map((m) => m.length)).toEqual([12, 12, 12]);
  });

  it('las partidas al azar terminan con las fichas a 0', () => {
    for (let i = 0; i < 10; i++) {
      let e = nuevaDeTres(`tres-${i}`);
      const g = new Generador(crearAzar(`tres-${i}/g`));
      for (let k = 0; k < 5000 && !tuteSubastado.resultado(e); k++) {
        const acciones = legales(e);
        const pasa = e.fase === 'subasta' && g.enteroHasta(2) === 0;
        e = tuteSubastado.transicion(
          e,
          e.turno,
          pasa ? pasar : acciones[g.enteroHasta(acciones.length)]!,
        );
        expect(e.fichas.reduce((suma, f) => suma + f, 0)).toBe(0);
      }
      expect(tuteSubastado.resultado(e)).not.toBeNull();
      expect(e.resultadosManos).toHaveLength(4);
    }
  });

  it('la vista tiene tres asientos', () => {
    const v = tuteSubastado.vistaDe(nuevaDeTres(), 1);
    expect(v.cartasEnMano).toEqual([12, 12, 12]);
    expect(v.mano).toBe(0);
    expect(v.config.jugadores).toBe(3);
  });
});

describirContrato(tuteSubastado, {
  configs: [{ manos: 4 }, { manos: 4, jugadores: 3 }],
  // Las cartas de la última baza ya se vieron, aunque sean de la mano anterior.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  pasosMaximos: 400,
  ejecuciones: 30,
});
