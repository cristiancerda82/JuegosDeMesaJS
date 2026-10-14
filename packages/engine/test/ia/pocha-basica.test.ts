import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { estimarBazas, iaPochaBasica } from '../../src/ia/pocha-basica';
import {
  CONFIG_POCHA_POR_DEFECTO,
  pocha,
  type AccionPocha,
  type ConfigPocha,
  type EstadoPocha,
  type VistaPocha,
} from '../../src/juegos/pocha';
import { aplicar } from '../../src/motor/aplicar';

type AgentePocha = Agente<VistaPocha, AccionPocha>;
const azarDe = aleatorio<VistaPocha, AccionPocha>();

// ── Utilidades ───────────────────────────────────────────────────────────────

/** Juega una partida completa con un agente por asiento, cada uno con su propia semilla. */
function jugarPartida(config: ConfigPocha, semilla: string, agentes: readonly AgentePocha[]) {
  const creado = pocha.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; pocha.resultado(e) === null; pasos++) {
    if (pasos > 5_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = pocha.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(pocha.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(pocha, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Vista de 4 jugadores armada a mano, en la fase de juego; triunfo en oros. */
function vista(parcial: Partial<VistaPocha> & Pick<VistaPocha, 'miMano'>): VistaPocha {
  return {
    config: CONFIG_POCHA_POR_DEFECTO,
    asiento: 0,
    cartasEnMano: [3, 3, 3, 3],
    muestra: 'oros-4',
    cartaTriunfo: null,
    triunfo: 'oros',
    fase: 'jugar',
    apuestas: [1, 1, 0, 1],
    apuestaProhibida: null,
    mesa: [],
    turno: 0,
    repartidor: 3,
    bazas: [0, 0, 0, 0],
    ultimaBaza: null,
    cartasMano: 3,
    indiceMano: 2,
    totalManos: 9,
    resultadosManos: [],
    totales: [0, 0, 0, 0],
    ...parcial,
  };
}

const decide = (v: VistaPocha, acciones: AccionPocha[]) =>
  iaPochaBasica.decidir(v, acciones, crearAzar('x')).accion;
const jugadas = (cartas: readonly IdCarta[]): AccionPocha[] =>
  cartas.map((carta) => ({ tipo: 'jugar', carta }));
const apuestas = (bazas: readonly number[]): AccionPocha[] =>
  bazas.map((b) => ({ tipo: 'apostar', bazas: b }));

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica de la Pocha', () => {
  it('estima las bazas con los triunfos altos y los Ases', () => {
    expect(estimarBazas(vista({ miMano: ['oros-1', 'copas-1', 'espadas-2'] }))).toBe(2);
    expect(estimarBazas(vista({ miMano: ['copas-2', 'espadas-4', 'bastos-5'] }))).toBe(0);
  });

  it('apuesta su estimación', () => {
    const v = vista({ miMano: ['oros-1', 'copas-1', 'espadas-2'], fase: 'apostar' });
    expect(decide(v, apuestas([0, 1, 2, 3]))).toEqual({ tipo: 'apostar', bazas: 2 });
  });

  it('si la estimación es la prohibida, se desvía lo mínimo', () => {
    const v = vista({ miMano: ['oros-1', 'copas-1', 'espadas-2'], fase: 'apostar' });
    expect(decide(v, apuestas([0, 1, 3]))).toEqual({ tipo: 'apostar', bazas: 1 });
  });

  it('ya cumplida, no gana más: juega la más alta que pierde', () => {
    const v = vista({
      miMano: ['copas-1', 'copas-4', 'copas-6'],
      apuestas: [1, 1, 0, 1],
      bazas: [1, 0, 0, 0],
      mesa: [{ asiento: 3, carta: 'copas-7' }],
    });
    expect(decide(v, jugadas(['copas-1', 'copas-4', 'copas-6']))).toEqual({
      tipo: 'jugar',
      carta: 'copas-6',
    });
  });

  it('si le faltan bazas, gana con la carta más barata que gane', () => {
    const v = vista({
      miMano: ['copas-1', 'copas-3', 'copas-4'],
      mesa: [{ asiento: 3, carta: 'copas-12' }],
    });
    expect(decide(v, jugadas(['copas-1', 'copas-3']))).toEqual({
      tipo: 'jugar',
      carta: 'copas-3',
    });
  });

  it('si le faltan bazas, sale con su carta más alta que no sea triunfo', () => {
    const v = vista({ miMano: ['oros-1', 'copas-12', 'espadas-1'] });
    expect(decide(v, jugadas(['oros-1', 'copas-12', 'espadas-1']))).toEqual({
      tipo: 'jugar',
      carta: 'espadas-1',
    });
  });

  it('ya cumplida, sale con la carta más baja', () => {
    const v = vista({ miMano: ['oros-2', 'copas-12', 'espadas-4'], apuestas: [0, 1, 0, 1] });
    expect(decide(v, jugadas(['oros-2', 'copas-12', 'espadas-4']))).toEqual({
      tipo: 'jugar',
      carta: 'espadas-4',
    });
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA de la Pocha', () => {
  const configs: ConfigPocha[] = [
    CONFIG_POCHA_POR_DEFECTO,
    { jugadores: 3, duracion: 'corta', restriccionRepartidor: true },
    { jugadores: 4, duracion: 'corta', restriccionRepartidor: false },
    { jugadores: 3, duracion: 'completa', restriccionRepartidor: true },
    { jugadores: 4, duracion: 'completa', restriccionRepartidor: true },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaPochaBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(pocha.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 partidas contra el azar', () => {
    let ganadas = 0;
    for (let i = 0; i < 1_000; i++) {
      const jugadores = i % 2 === 0 ? 3 : 4;
      const asientoIa = i % jugadores;
      const agentes = Array.from({ length: jugadores }, (_, a) =>
        a === asientoIa ? iaPochaBasica : azarDe,
      );
      const { final } = jugarPartida(
        { ...CONFIG_POCHA_POR_DEFECTO, jugadores },
        `contra-${i}`,
        agentes,
      );
      if (pocha.resultado(final)!.ganadores.includes(asientoIa)) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(650);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = pocha.crear(CONFIG_POCHA_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoPocha = r.valor;
    const v = pocha.vistaDe(e, e.turno);
    const acciones = pocha.accionesLegales(e, e.turno);
    for (const agente of [iaPochaBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaPocha,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaPochaBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
