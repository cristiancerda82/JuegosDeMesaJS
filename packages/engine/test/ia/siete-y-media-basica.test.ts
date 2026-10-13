import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaSieteYMediaBasica } from '../../src/ia/siete-y-media-basica';
import {
  CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
  sieteYMedia,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type VistaSieteYMedia,
} from '../../src/juegos/siete-y-media';
import { aplicar } from '../../src/motor/aplicar';

type AgenteSyM = Agente<VistaSieteYMedia, AccionSieteYMedia>;
const azarDe = aleatorio<VistaSieteYMedia, AccionSieteYMedia>();

/** Juega una partida completa con un agente por asiento, cada uno con su propia semilla. */
function jugarPartida(config: ConfigSieteYMedia, semilla: string, agentes: readonly AgenteSyM[]) {
  const creado = sieteYMedia.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; sieteYMedia.resultado(e) === null; pasos++) {
    if (pasos > 5_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = sieteYMedia.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(sieteYMedia.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(sieteYMedia, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Vista de 2 jugadores en fase de juego armada a mano; el asiento 1 es punto. */
function vista(parcial: Partial<VistaSieteYMedia>): VistaSieteYMedia {
  return {
    config: CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
    asiento: 1,
    banca: 0,
    fichas: [50, 50],
    fase: 'jugar',
    turno: 1,
    apuestas: [null, 5],
    cartas: [[null], ['oros-1']],
    miValor: 2,
    visibles: [0, 0],
    estados: ['jugando', 'jugando'],
    mazo: 30,
    ultimaAccion: null,
    resultadosManos: [],
    ...parcial,
  };
}

const JUGAR: AccionSieteYMedia[] = [{ tipo: 'pedir' }, { tipo: 'plantarse' }];
const decide = (v: VistaSieteYMedia, acciones = JUGAR) =>
  iaSieteYMediaBasica.decidir(v, acciones, crearAzar('x')).accion;

describe('IA básica de la Siete y media', () => {
  it('el punto se planta con 5,5', () => {
    expect(decide(vista({ miValor: 11 }))).toEqual({ tipo: 'plantarse' });
  });

  it('el punto pide con 3', () => {
    expect(decide(vista({ miValor: 6 }))).toEqual({ tipo: 'pedir' });
  });

  it('la banca pide si pierde contra lo que se ve de un punto plantado', () => {
    const v = vista({
      asiento: 0,
      turno: 0,
      miValor: 10,
      visibles: [0, 12],
      estados: ['jugando', 'plantado'],
    });
    expect(decide(v)).toEqual({ tipo: 'pedir' });
  });

  it('la banca con 6 o más se planta aunque pierda', () => {
    const v = vista({
      asiento: 0,
      turno: 0,
      miValor: 12,
      visibles: [0, 13],
      estados: ['jugando', 'plantado'],
    });
    expect(decide(v)).toEqual({ tipo: 'plantarse' });
  });

  it('la banca no cuenta a los puntos pasados', () => {
    const v = vista({
      asiento: 0,
      turno: 0,
      miValor: 10,
      visibles: [0, 14],
      estados: ['jugando', 'pasado'],
    });
    expect(decide(v)).toEqual({ tipo: 'plantarse' });
  });

  it('apuesta según sus fichas, sin pasar de la máxima', () => {
    const apuestas = (n: number): AccionSieteYMedia[] =>
      Array.from({ length: n }, (_, i) => ({ tipo: 'apostar', fichas: i + 1 }));
    expect(decide(vista({ fase: 'apostar', fichas: [50, 50] }), apuestas(10))).toEqual({
      tipo: 'apostar',
      fichas: 5,
    });
    expect(decide(vista({ fase: 'apostar', fichas: [50, 200] }), apuestas(10))).toEqual({
      tipo: 'apostar',
      fichas: 10,
    });
    expect(decide(vista({ fase: 'apostar', fichas: [50, 3] }), apuestas(3))).toEqual({
      tipo: 'apostar',
      fichas: 1,
    });
  });
});

describe('garantías de la IA de la Siete y media', () => {
  const configs: ConfigSieteYMedia[] = [
    CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 3, cambioBanca: 'sieteYMedia' },
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 4, pagoDoble: false, manos: 20 },
    { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 4, fichasIniciales: 10 },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaSieteYMediaBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(sieteYMedia.resultado(final)).not.toBeNull();
    }
  });

  it('termina con más fichas que el azar en claramente más de la mitad de 1.000 partidas', () => {
    let ganadas = 0;
    for (let i = 0; i < 1_000; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaSieteYMediaBasica, azarDe] : [azarDe, iaSieteYMediaBasica];
      const { final } = jugarPartida(CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, `contra-${i}`, agentes);
      if (final.fichas[ia]! > final.fichas[1 - ia]!) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(600);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = sieteYMedia.crear({ ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, jugadores: 4 }, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = sieteYMedia.vistaDe(e, e.turno);
    const acciones = sieteYMedia.accionesLegales(e, e.turno);
    for (const agente of [iaSieteYMediaBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaSieteYMedia,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaSieteYMediaBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
