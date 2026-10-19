import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaButifarraBasica, UMBRAL_DELEGAR, valorConTriunfo } from '../../src/ia/butifarra-basica';
import {
  butifarra,
  CONFIG_BUTIFARRA_POR_DEFECTO,
  type AccionButifarra,
  type VistaButifarra,
} from '../../src/juegos/butifarra';
import { duelo, porBandos } from './duelo';

const azarDe = aleatorio<VistaButifarra, AccionButifarra>();

/** Vista armada a mano para el asiento 0, en la fase de juego con triunfo en oros. */
function vista(parcial: Partial<VistaButifarra> & Pick<VistaButifarra, 'miMano'>): VistaButifarra {
  return {
    config: { ...CONFIG_BUTIFARRA_POR_DEFECTO, jugadores: 4 },
    asiento: 0,
    cartasEnMano: [12, 12, 12, 12],
    mazo: 0,
    muestra: null,
    repartidor: 3,
    fase: 'jugar',
    turno: 0,
    eleccion: { triunfo: 'oros', quien: 3, delegada: false },
    contros: 0,
    decideContro: null,
    pasados: 0,
    multiplicador: 1,
    mesa: [],
    bazasJugadas: [],
    bazas: [0, 0, 0, 0],
    puntos: [0, 0],
    ultimaBaza: null,
    resultadosManos: [],
    totales: [0, 0],
    ...parcial,
  };
}

const decide = (v: VistaButifarra, acciones: readonly AccionButifarra[]) =>
  iaButifarraBasica.decidir(v, acciones, crearAzar('x')).accion;
const jugadas = (cartas: readonly IdCarta[]): AccionButifarra[] =>
  cartas.map((carta) => ({ tipo: 'jugar', carta }));
const ELEGIR: AccionButifarra[] = [
  { tipo: 'elegir', triunfo: 'oros' },
  { tipo: 'elegir', triunfo: 'copas' },
  { tipo: 'elegir', triunfo: 'espadas' },
  { tipo: 'elegir', triunfo: 'bastos' },
  { tipo: 'elegir', triunfo: null },
  { tipo: 'delegar' },
];

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica de la Butifarra', () => {
  it('delega sin manillas ni ases y sin palos largos', () => {
    const mano: IdCarta[] = [
      'oros-12',
      'oros-11',
      'oros-10',
      'copas-12',
      'copas-11',
      'copas-10',
      'espadas-12',
      'espadas-11',
      'espadas-10',
      'bastos-8',
      'bastos-7',
      'bastos-6',
    ];
    for (const palo of ['oros', 'copas', 'espadas', 'bastos'] as const) {
      expect(valorConTriunfo(mano, palo)).toBeLessThan(UMBRAL_DELEGAR);
    }
    expect(decide(vista({ miMano: mano, fase: 'elegir', eleccion: null }), ELEGIR)).toEqual({
      tipo: 'delegar',
    });
  });

  it('elige de triunfo su palo largo con manilla y As', () => {
    const mano: IdCarta[] = [
      'copas-9',
      'copas-1',
      'copas-12',
      'copas-5',
      'copas-3',
      'oros-2',
      'oros-4',
      'espadas-3',
      'espadas-6',
      'bastos-2',
      'bastos-4',
      'bastos-7',
    ];
    expect(decide(vista({ miMano: mano, fase: 'elegir', eleccion: null }), ELEGIR)).toEqual({
      tipo: 'elegir',
      triunfo: 'copas',
    });
  });

  it('con cuatro manillas y sus ases juega butifarra', () => {
    const mano: IdCarta[] = [
      'oros-9',
      'oros-1',
      'copas-9',
      'copas-1',
      'espadas-9',
      'espadas-1',
      'bastos-9',
      'bastos-1',
      'bastos-12',
      'oros-12',
      'copas-2',
      'espadas-2',
    ];
    expect(decide(vista({ miMano: mano, fase: 'elegir', eleccion: null }), ELEGIR)).toEqual({
      tipo: 'elegir',
      triunfo: null,
    });
  });

  it('el compañero delegado no puede delegar y elige', () => {
    const mano: IdCarta[] = [
      'oros-12',
      'oros-11',
      'oros-10',
      'copas-12',
      'copas-11',
      'copas-10',
      'espadas-12',
      'espadas-11',
      'espadas-10',
      'bastos-8',
      'bastos-7',
      'bastos-6',
    ];
    const a = decide(vista({ miMano: mano, fase: 'elegir', eleccion: null }), ELEGIR.slice(0, 5));
    expect(a.tipo).toBe('elegir');
  });

  it('dice contro con mucho triunfo y pasa sin juego', () => {
    const fuerte: IdCarta[] = [
      'oros-9',
      'oros-1',
      'oros-12',
      'oros-11',
      'oros-5',
      'oros-4',
      'copas-9',
      'copas-1',
      'espadas-9',
      'bastos-2',
      'bastos-3',
      'espadas-2',
    ];
    const debil: IdCarta[] = [
      'oros-2',
      'copas-3',
      'copas-4',
      'copas-5',
      'espadas-3',
      'espadas-4',
      'espadas-5',
      'bastos-3',
      'bastos-4',
      'bastos-5',
      'bastos-6',
      'copas-6',
    ];
    const contros: AccionButifarra[] = [{ tipo: 'contro' }, { tipo: 'pasar' }];
    const v = (miMano: IdCarta[]) => vista({ miMano, fase: 'contros', decideContro: 0 });
    expect(decide(v(fuerte), contros)).toEqual({ tipo: 'contro' });
    expect(decide(v(debil), contros)).toEqual({ tipo: 'pasar' });
  });

  it('carga puntos al compañero cuando su carta no se la quita nadie', () => {
    // El compañero (asiento 2) sale con la manilla de copas; el asiento 3 sigue el palo.
    const v = vista({
      asiento: 0,
      miMano: ['espadas-1', 'espadas-2', 'bastos-3'],
      mesa: [
        { asiento: 1, carta: 'copas-2' },
        { asiento: 2, carta: 'copas-9' },
        { asiento: 3, carta: 'copas-3' },
      ],
    });
    expect(decide(v, jugadas(['espadas-1', 'espadas-2', 'bastos-3']))).toEqual({
      tipo: 'jugar',
      carta: 'espadas-1',
    });
  });

  it('carga al compañero aunque no sea el último si su carta es la más alta y es triunfo', () => {
    const v = vista({
      asiento: 1,
      miMano: ['espadas-1', 'espadas-2'],
      mesa: [{ asiento: 3, carta: 'oros-9' }],
      repartidor: 2,
    });
    expect(decide(v, jugadas(['espadas-1', 'espadas-2']))).toEqual({
      tipo: 'jugar',
      carta: 'espadas-1',
    });
  });

  it('sale con la manilla de un palo que no es triunfo', () => {
    const v = vista({ miMano: ['copas-9', 'copas-2', 'espadas-4'] });
    expect(decide(v, jugadas(['copas-9', 'copas-2', 'espadas-4']))).toEqual({
      tipo: 'jugar',
      carta: 'copas-9',
    });
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA de la Butifarra', () => {
  it('500 partidas entre IAs (y con el azar) terminan sin acciones ilegales', () => {
    const r = duelo(
      butifarra,
      { objetivo: 51 },
      iaButifarraBasica,
      iaButifarraBasica,
      400,
      porBandos,
      'entre-ias',
    );
    expect(r.partidas).toBe(400);
    const mezcla = duelo(
      butifarra,
      CONFIG_BUTIFARRA_POR_DEFECTO,
      iaButifarraBasica,
      azarDe,
      100,
      (a, i) => (a + i) % 3 !== 0,
      'mezcla',
    );
    expect(mezcla.partidas).toBe(100);
  });

  it('una pareja de IAs gana claramente a una pareja que juega al azar', () => {
    const r = duelo(
      butifarra,
      CONFIG_BUTIFARRA_POR_DEFECTO,
      iaButifarraBasica,
      azarDe,
      500,
      porBandos,
      'contra-azar',
    );
    expect(r.ganadas).toBeGreaterThan(400);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = butifarra.crear(CONFIG_BUTIFARRA_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = butifarra.vistaDe(e, e.turno);
    const acciones = butifarra.accionesLegales(e, e.turno);
    const a = iaButifarraBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaButifarraBasica.decidir(
      JSON.parse(JSON.stringify(v)) as VistaButifarra,
      [...acciones],
      crearAzar('s'),
    );
    expect(b).toEqual(a);
  });
});
