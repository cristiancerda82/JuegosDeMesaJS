import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCuatrolaBasica } from '../../src/ia/cuatrola-basica';
import {
  CONFIG_CUATROLA_POR_DEFECTO,
  cuatrola,
  type AccionCuatrola,
  type EstadoCuatrola,
  type VistaCuatrola,
} from '../../src/juegos/cuatrola';
import { duelo, unoContraTodos } from './duelo';

const azarDe = aleatorio<VistaCuatrola, AccionCuatrola>();

/** Partida recién repartida con la mano del asiento 0 cambiada. */
function conMano(mano: IdCarta[], parcial: Partial<EstadoCuatrola> = {}): EstadoCuatrola {
  const r = cuatrola.crear(CONFIG_CUATROLA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const e = r.valor;
  return { ...e, manos: e.manos.map((m, a) => (a === 0 ? mano : m)), ...parcial };
}

const decide = (e: EstadoCuatrola) =>
  iaCuatrolaBasica.decidir(
    cuatrola.vistaDe(e, e.turno),
    cuatrola.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const FLOJA: IdCarta[] = [
  'oros-2',
  'oros-4',
  'copas-5',
  'copas-6',
  'espadas-3',
  'espadas-5',
  'bastos-4',
  'bastos-5',
  'bastos-6',
  'copas-10',
];

describe('IA básica de la Cuatrola', () => {
  it('pasa sin juego', () => {
    expect(decide(conMano(FLOJA))).toEqual({ tipo: 'pasar' });
  });

  it('juega solo con mano fuerte', () => {
    const fuerte: IdCarta[] = [
      'espadas-1',
      'bastos-1',
      'oros-7',
      'oros-1',
      'oros-12',
      'oros-11',
      'oros-10',
      'oros-2',
      'copas-12',
      'espadas-4',
    ];
    expect(decide(conMano(fuerte))).toEqual({ tipo: 'pujar', modalidad: 'solo' });
  });

  it('llama el rey del palo corto', () => {
    const mano: IdCarta[] = [
      'espadas-1',
      'oros-7',
      'oros-1',
      'oros-12',
      'oros-4',
      'espadas-12',
      'espadas-5',
      'bastos-12',
      'bastos-6',
      'bastos-5',
    ];
    const e = conMano(mano, { fase: 'triunfo', modalidad: 'rey', jugador: 0 });
    expect(decide(e)).toEqual({ tipo: 'elegir', triunfo: 'oros', llamada: 'copas-12' });
  });

  it('si la baza es de su compañero, echa la más baja', () => {
    const e = conMano(['copas-1', 'copas-7', 'copas-12'], {
      fase: 'bazas',
      modalidad: 'rey',
      jugador: 2,
      triunfo: 'oros',
      llamada: 'espadas-12',
      companero: 0,
      turno: 0,
      mesa: [
        { asiento: 1, carta: 'copas-4' },
        { asiento: 2, carta: 'copas-11' },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'copas-7' });
  });

  it('si no, gana con la carta más baja que gana', () => {
    const e = conMano(['copas-1', 'copas-7', 'copas-12', 'copas-11'], {
      fase: 'bazas',
      modalidad: 'rey',
      jugador: 2,
      triunfo: 'oros',
      llamada: 'espadas-12',
      companero: 3,
      turno: 0,
      mesa: [{ asiento: 1, carta: 'copas-10' }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'copas-11' });
  });
});

describe('garantías de la IA de la Cuatrola', () => {
  it('500 partidas entre IAs terminan sin acciones ilegales', () => {
    const r = duelo(
      cuatrola,
      { manos: 4 },
      iaCuatrolaBasica,
      iaCuatrolaBasica,
      440,
      unoContraTodos(4),
      'entre',
    );
    expect(r.partidas).toBe(440);
    const mezcla = duelo(
      cuatrola,
      { manos: 4 },
      iaCuatrolaBasica,
      azarDe,
      60,
      (a, i) => (a + i) % 2 === 0,
      'mezcla',
    );
    expect(mezcla.partidas).toBe(60);
  });

  it('gana claramente más de lo que le toca contra el azar', () => {
    const r = duelo(
      cuatrola,
      CONFIG_CUATROLA_POR_DEFECTO,
      iaCuatrolaBasica,
      azarDe,
      500,
      unoContraTodos(4),
      'contra-azar',
    );
    expect(r.ganadas).toBeGreaterThan(250);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano(FLOJA);
    const v = cuatrola.vistaDe(e, 0);
    const acciones = cuatrola.accionesLegales(e, 0);
    const a = iaCuatrolaBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaCuatrolaBasica.decidir(
      JSON.parse(JSON.stringify(v)) as VistaCuatrola,
      [...acciones],
      crearAzar('s'),
    );
    expect(b).toEqual(a);
  });
});
