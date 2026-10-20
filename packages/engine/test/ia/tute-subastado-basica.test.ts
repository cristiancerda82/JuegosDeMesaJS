import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { estimarPuntos, iaTuteSubastadoBasica } from '../../src/ia/tute-subastado-basica';
import {
  CONFIG_TUTE_SUBASTADO_POR_DEFECTO,
  tuteSubastado,
  type AccionTuteSubastado,
  type EstadoTuteSubastado,
  type VistaTuteSubastado,
} from '../../src/juegos/tute-subastado';
import { duelo, unoContraTodos } from './duelo';

const azarDe = aleatorio<VistaTuteSubastado, AccionTuteSubastado>();

/** Partida recién repartida con la mano del asiento 0 cambiada. */
function conMano(mano: IdCarta[], parcial: Partial<EstadoTuteSubastado> = {}) {
  const r = tuteSubastado.crear(CONFIG_TUTE_SUBASTADO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const e = r.valor;
  return { ...e, manos: e.manos.map((m, a) => (a === 0 ? mano : m)), ...parcial };
}

const decide = (e: EstadoTuteSubastado) =>
  iaTuteSubastadoBasica.decidir(
    tuteSubastado.vistaDe(e, e.turno),
    tuteSubastado.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const FLOJA: IdCarta[] = [
  'oros-2',
  'oros-4',
  'copas-5',
  'copas-6',
  'espadas-2',
  'espadas-7',
  'bastos-4',
  'bastos-5',
  'bastos-6',
  'copas-10',
];

describe('IA básica del Tute subastado', () => {
  it('pasa con mano floja', () => {
    expect(decide(conMano(FLOJA))).toEqual({ tipo: 'pasar' });
  });

  it('puja con buena mano', () => {
    const buena: IdCarta[] = [
      'oros-1',
      'oros-3',
      'oros-12',
      'oros-11',
      'copas-1',
      'espadas-1',
      'bastos-2',
      'bastos-4',
      'copas-5',
      'espadas-6',
    ];
    const a = decide(conMano(buena));
    expect(a.tipo).toBe('pujar');
    if (a.tipo === 'pujar') expect(a.puntos).toBeGreaterThanOrEqual(60);
  });

  it('elige el palo de su fuerza', () => {
    const espadas: IdCarta[] = [
      'espadas-1',
      'espadas-3',
      'espadas-7',
      'espadas-5',
      'espadas-2',
      'oros-12',
      'copas-6',
      'copas-4',
      'bastos-10',
      'bastos-2',
    ];
    const e = conMano(espadas, { fase: 'triunfo', puja: 60, pujador: 0 });
    expect(decide(e)).toEqual({ tipo: 'triunfo', palo: 'espadas' });
  });

  it('la estimación sube con los triunfos y los cantes', () => {
    expect(estimarPuntos(FLOJA, 'bastos')).toBeLessThan(60);
    expect(estimarPuntos(['oros-12', 'oros-11'], 'oros')).toBeGreaterThan(
      estimarPuntos(['oros-12', 'oros-11'], 'copas'),
    );
  });

  it('un defensor carga puntos a otro defensor cuando el pujador ya jugó', () => {
    const e = conMano(['copas-1', 'copas-2'], {
      fase: 'bazas',
      triunfo: 'oros',
      puja: 60,
      pujador: 3,
      turno: 0,
      mesa: [
        { asiento: 2, carta: 'copas-4' },
        { asiento: 3, carta: 'copas-5' },
        { asiento: 1, carta: 'oros-2' },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'copas-1' });
  });

  it('canta las 40 antes que las 20', () => {
    const e = conMano(['oros-12', 'oros-11', 'copas-12', 'copas-11'], {
      fase: 'bazas',
      triunfo: 'oros',
      puja: 60,
      pujador: 0,
      turno: 0,
      puedeCantar: 0,
    });
    expect(decide(e)).toEqual({ tipo: 'cantar', palo: 'oros' });
  });
});

describe('garantías de la IA del Tute subastado', () => {
  it('500 partidas entre IAs terminan sin acciones ilegales', () => {
    const r = duelo(
      tuteSubastado,
      { manos: 4 },
      iaTuteSubastadoBasica,
      iaTuteSubastadoBasica,
      440,
      unoContraTodos(4),
      'entre',
    );
    expect(r.partidas).toBe(440);
    const mezcla = duelo(
      tuteSubastado,
      { manos: 4 },
      iaTuteSubastadoBasica,
      azarDe,
      60,
      (a, i) => (a + i) % 2 === 0,
      'mezcla',
    );
    expect(mezcla.partidas).toBe(60);
  });

  it('gana claramente más de lo que le toca contra el azar', () => {
    const r = duelo(
      tuteSubastado,
      CONFIG_TUTE_SUBASTADO_POR_DEFECTO,
      iaTuteSubastadoBasica,
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
    const v = tuteSubastado.vistaDe(e, 0);
    const acciones = tuteSubastado.accionesLegales(e, 0);
    const a = iaTuteSubastadoBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaTuteSubastadoBasica.decidir(
      JSON.parse(JSON.stringify(v)) as VistaTuteSubastado,
      [...acciones],
      crearAzar('s'),
    );
    expect(b).toEqual(a);
  });
});
