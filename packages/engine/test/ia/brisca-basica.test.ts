import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaBriscaBasica } from '../../src/ia/brisca-basica';
import {
  bandoDe,
  brisca,
  CONFIG_BRISCA_POR_DEFECTO,
  puntosDe,
  type AccionBrisca,
  type ConfigBrisca,
  type EstadoBrisca,
  type VistaBrisca,
} from '../../src/juegos/brisca';
import { aplicar } from '../../src/motor/aplicar';

type AgenteBrisca = Agente<VistaBrisca, AccionBrisca>;
const azarDe = aleatorio<VistaBrisca, AccionBrisca>();

// ── Utilidades ───────────────────────────────────────────────────────────────

interface Partida {
  final: EstadoBrisca;
  /** Milisegundos de la decisión más lenta. */
  maxMs: number;
}

/** Juega una partida completa con un agente por asiento, cada uno con su propia semilla. */
function jugarPartida(
  config: ConfigBrisca,
  semilla: string,
  agentes: readonly AgenteBrisca[],
): Partida {
  const creado = brisca.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; brisca.resultado(e) === null; pasos++) {
    if (pasos > 1_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = brisca.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(brisca.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(brisca, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Vista de 2 jugadores armada a mano; triunfo en oros. */
function vista(parcial: Partial<VistaBrisca> & Pick<VistaBrisca, 'miMano'>): VistaBrisca {
  const n = parcial.config?.jugadores ?? 2;
  return {
    config: CONFIG_BRISCA_POR_DEFECTO,
    asiento: 1,
    cartasEnMano: new Array<number>(n).fill(3),
    mazo: 10,
    muestra: 'oros-4',
    triunfo: 'oros',
    mesa: [],
    turno: 1,
    repartidor: 0,
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    puntos: [0, 0],
    jugadas: [],
    resultadosManos: [],
    manosGanadas: [0, 0],
    ...parcial,
  };
}

function decide(v: VistaBrisca): AccionBrisca {
  const acciones: AccionBrisca[] = v.miMano!.map((carta) => ({ tipo: 'jugar', carta }));
  return iaBriscaBasica.decidir(v, acciones, crearAzar('x')).accion;
}

const jugada = (carta: IdCarta): AccionBrisca => ({ tipo: 'jugar', carta });

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica de la Brisca', () => {
  it('cambia la muestra cuando puede', () => {
    const v = vista({ miMano: ['oros-7', 'copas-2'], muestra: 'oros-1' });
    const acciones: AccionBrisca[] = [
      jugada('oros-7'),
      jugada('copas-2'),
      { tipo: 'cambiarMuestra' },
    ];
    expect(iaBriscaBasica.decidir(v, acciones, crearAzar('x')).accion).toEqual({
      tipo: 'cambiarMuestra',
    });
  });

  it('gana una baza con puntos sin gastar triunfo', () => {
    const v = vista({
      miMano: ['copas-1', 'oros-2', 'bastos-4'],
      mesa: [{ asiento: 0, carta: 'copas-12' }],
    });
    expect(decide(v)).toEqual(jugada('copas-1'));
  });

  it('no gasta triunfos altos en bazas sin puntos', () => {
    const v = vista({
      miMano: ['oros-1', 'oros-3', 'bastos-4'],
      mesa: [{ asiento: 0, carta: 'copas-2' }],
    });
    expect(decide(v)).toEqual(jugada('bastos-4'));
  });

  it('falla con un triunfo bajo una baza con puntos', () => {
    const v = vista({
      miMano: ['oros-2', 'bastos-4', 'espadas-5'],
      mesa: [{ asiento: 0, carta: 'copas-1' }],
    });
    expect(decide(v)).toEqual(jugada('oros-2'));
  });

  it('no regala puntos: si no puede ganar, juega una carta de 0 puntos', () => {
    const v = vista({
      miMano: ['bastos-1', 'espadas-12', 'bastos-5'],
      mesa: [{ asiento: 0, carta: 'copas-1' }],
    });
    const accion = decide(v);
    expect(accion).toEqual(jugada('bastos-5'));
    expect(puntosDe((accion as { carta: IdCarta }).carta)).toBe(0);
  });

  it('sale con una carta baja que no es triunfo', () => {
    const v = vista({ miMano: ['oros-2', 'copas-1', 'espadas-6'] });
    expect(decide(v)).toEqual(jugada('espadas-6'));
  });

  it('en parejas, si gana el compañero y es el último, le carga puntos', () => {
    const v = vista({
      config: { ...CONFIG_BRISCA_POR_DEFECTO, jugadores: 4 },
      asiento: 3,
      turno: 3,
      miMano: ['copas-3', 'bastos-2', 'oros-1'],
      mesa: [
        { asiento: 0, carta: 'espadas-4' },
        { asiento: 1, carta: 'espadas-1' },
        { asiento: 2, carta: 'espadas-5' },
      ],
    });
    expect(bandoDe(1)).toBe(bandoDe(3));
    expect(decide(v)).toEqual(jugada('copas-3'));
  });
});

// ── Garantías de los agentes ─────────────────────────────────────────────────

describe('garantías de la IA', () => {
  const configs: ConfigBrisca[] = [
    CONFIG_BRISCA_POR_DEFECTO,
    { jugadores: 2, cambioMuestra: 'trasGanarBaza', arrastreFinal: true, manos: 3 },
    { jugadores: 4, cambioMuestra: 'libre', arrastreFinal: false, manos: 1 },
    { jugadores: 4, cambioMuestra: 'no', arrastreFinal: true, manos: 1 },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaBriscaBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(brisca.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 manos contra el azar', () => {
    let ganadas = 0;
    let perdidas = 0;
    for (let i = 0; i < 1_000; i++) {
      // Alterna el asiento de la IA para no favorecerla con la salida.
      const ia = i % 2;
      const agentes = ia === 0 ? [iaBriscaBasica, azarDe] : [azarDe, iaBriscaBasica];
      const { final } = jugarPartida(CONFIG_BRISCA_POR_DEFECTO, `contra-${i}`, agentes);
      const ganador = final.resultadosManos[0]!.ganador;
      if (ganador === ia) ganadas++;
      else if (ganador !== null) perdidas++;
    }
    expect(ganadas).toBeGreaterThan(600);
    expect(ganadas).toBeGreaterThan(perdidas * 1.5);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const { final } = jugarPartida(CONFIG_BRISCA_POR_DEFECTO, 'repro', [iaBriscaBasica, azarDe]);
    expect(brisca.resultado(final)).not.toBeNull();
    const e = brisca.crear(CONFIG_BRISCA_POR_DEFECTO, 'repro');
    if (!e.ok) throw new Error(e.error);
    const v = brisca.vistaDe(e.valor, e.valor.turno);
    const acciones = brisca.accionesLegales(e.valor, e.valor.turno);
    for (const agente of [iaBriscaBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaBrisca,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('dos estados con la misma vista producen la misma decisión', () => {
    const r = brisca.crear(CONFIG_BRISCA_POR_DEFECTO, 'oculta');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    // Mismo estado visible para el asiento que sale, con el mazo y la mano rival en otro orden.
    const otro: EstadoBrisca = {
      ...e,
      mazo: [...e.mazo].reverse(),
      manos: e.manos.map((m, a) => (a === e.turno ? m : [...m].reverse())),
    };
    expect(brisca.vistaDe(otro, e.turno)).toEqual(brisca.vistaDe(e, e.turno));
    const decidir = (x: EstadoBrisca) =>
      iaBriscaBasica.decidir(
        brisca.vistaDe(x, x.turno),
        brisca.accionesLegales(x, x.turno),
        crearAzar('s'),
      ).accion;
    expect(decidir(otro)).toEqual(decidir(e));
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaBriscaBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
