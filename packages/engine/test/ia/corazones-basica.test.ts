import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaCorazonesBasica } from '../../src/ia/corazones-basica';
import {
  CONFIG_CORAZONES_POR_DEFECTO,
  corazones,
  type AccionCorazones,
  type ConfigCorazones,
  type VistaCorazones,
} from '../../src/juegos/corazones';
import { aplicar } from '../../src/motor/aplicar';

type AgenteCorazones = Agente<VistaCorazones, AccionCorazones>;
const azarDe = aleatorio<VistaCorazones, AccionCorazones>();

function jugarPartida(
  config: ConfigCorazones,
  semilla: string,
  agentes: readonly AgenteCorazones[],
) {
  const creado = corazones.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; corazones.resultado(e) === null; pasos++) {
    if (pasos > 20_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = corazones.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(corazones.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(corazones, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

function vista(parcial: Partial<VistaCorazones> & Pick<VistaCorazones, 'miMano'>): VistaCorazones {
  return {
    config: CONFIG_CORAZONES_POR_DEFECTO,
    asiento: 1,
    cartasEnMano: [5, 5, 5, 5],
    fase: 'juego',
    direccionPase: 1,
    miPase: null,
    pasaron: [true, true, true, true],
    recibidas: null,
    turno: 1,
    mesa: [],
    ultimaBaza: null,
    bazasJugadas: 3,
    rotos: false,
    puntosMano: [0, 0, 0, 0],
    numeroMano: 0,
    resultadosManos: [],
    totales: [0, 0, 0, 0],
    ...parcial,
  };
}

const decide = (v: VistaCorazones, cartas: IdCarta[]) =>
  iaCorazonesBasica.decidir(
    v,
    cartas.map((carta) => ({ tipo: 'jugar', carta })),
    crearAzar('x'),
  ).accion;

describe('IA básica de los Corazones', () => {
  it('pasa la Q, el K y el A de picas', () => {
    const mano: IdCarta[] = ['picas-12', 'picas-13', 'picas-1', 'corazones-10', 'treboles-3'];
    const v = vista({ fase: 'pase', miMano: mano });
    const acciones: AccionCorazones[] = [
      { tipo: 'pasar', cartas: ['corazones-10', 'treboles-3', 'picas-1'] },
      { tipo: 'pasar', cartas: ['picas-12', 'picas-13', 'picas-1'] },
      { tipo: 'pasar', cartas: ['picas-12', 'corazones-10', 'treboles-3'] },
    ];
    const accion = iaCorazonesBasica.decidir(v, acciones, crearAzar('x')).accion;
    expect(accion.tipo === 'pasar' && [...accion.cartas].sort()).toEqual([
      'picas-1',
      'picas-12',
      'picas-13',
    ]);
  });

  it('sin el palo, se deshace de la Q de picas', () => {
    const v = vista({
      miMano: ['picas-12', 'corazones-13', 'treboles-5'],
      mesa: [{ asiento: 0, carta: 'diamantes-5' }],
    });
    expect(decide(v, ['picas-12', 'corazones-13', 'treboles-5'])).toEqual({
      tipo: 'jugar',
      carta: 'picas-12',
    });
  });

  it('siguiendo el palo, juega la más alta que no gana', () => {
    const v = vista({
      miMano: ['diamantes-3', 'diamantes-8', 'diamantes-13'],
      mesa: [{ asiento: 0, carta: 'diamantes-10' }],
    });
    expect(decide(v, ['diamantes-3', 'diamantes-8', 'diamantes-13'])).toEqual({
      tipo: 'jugar',
      carta: 'diamantes-8',
    });
  });

  it('sale con la más baja que no sea corazón', () => {
    const v = vista({ miMano: ['corazones-2', 'treboles-9', 'picas-4'], rotos: true });
    expect(decide(v, ['corazones-2', 'treboles-9', 'picas-4'])).toEqual({
      tipo: 'jugar',
      carta: 'picas-4',
    });
  });
});

describe('garantías de la IA de los Corazones', () => {
  const configs: ConfigCorazones[] = [
    { pase: true, fin: 50 },
    { pase: false, fin: 50 },
    CONFIG_CORAZONES_POR_DEFECTO,
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % 2]!;
      const agentes = Array.from({ length: 4 }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaCorazonesBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(corazones.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 partidas contra el azar', () => {
    let ganadas = 0;
    for (let i = 0; i < 1_000; i++) {
      const asientoIa = i % 4;
      const agentes = Array.from({ length: 4 }, (_, a) =>
        a === asientoIa ? iaCorazonesBasica : azarDe,
      );
      const { final } = jugarPartida(configs[i % 2]!, `contra-${i}`, agentes);
      if (corazones.resultado(final)!.ganadores.includes(asientoIa)) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(600);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = corazones.crear(CONFIG_CORAZONES_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = corazones.vistaDe(e, e.turno);
    const acciones = corazones.accionesLegales(e, e.turno);
    for (const agente of [iaCorazonesBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaCorazones,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: 4 }, () => iaCorazonesBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
