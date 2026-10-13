import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaChinchonBasica } from '../../src/ia/chinchon-basica';
import {
  chinchon,
  CONFIG_CHINCHON_POR_DEFECTO,
  type AccionChinchon,
  type ConfigChinchon,
  type VistaChinchon,
} from '../../src/juegos/chinchon';
import { aplicar } from '../../src/motor/aplicar';

type AgenteChinchon = Agente<VistaChinchon, AccionChinchon>;
const azarDe = aleatorio<VistaChinchon, AccionChinchon>();

// ── Utilidades ───────────────────────────────────────────────────────────────

function jugarPartida(config: ConfigChinchon, semilla: string, agentes: readonly AgenteChinchon[]) {
  const creado = chinchon.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; chinchon.resultado(e) === null; pasos++) {
    if (pasos > 50_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = chinchon.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(chinchon.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(chinchon, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

function vista(parcial: Partial<VistaChinchon> & Pick<VistaChinchon, 'miMano'>): VistaChinchon {
  return {
    config: CONFIG_CHINCHON_POR_DEFECTO,
    asiento: 0,
    cartasEnMano: [7, 7],
    descarteArriba: null,
    cartasDescarte: 1,
    mazo: 20,
    turno: 0,
    fase: 'robar',
    robadaDelDescarte: null,
    puntos: [0, 0],
    eliminados: [false, false],
    ultimaAccion: null,
    resultadosManos: [],
    ...parcial,
  };
}

const decide = (v: VistaChinchon, acciones: AccionChinchon[]) =>
  iaChinchonBasica.decidir(v, acciones, crearAzar('x')).accion;

const ROBOS: AccionChinchon[] = [
  { tipo: 'robar', desde: 'mazo' },
  { tipo: 'robar', desde: 'descarte' },
];

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica del Chinchón', () => {
  const mano: IdCarta[] = [
    'oros-4',
    'bastos-4',
    'copas-1',
    'copas-2',
    'espadas-12',
    'bastos-10',
    'oros-6',
  ];

  it('roba del descarte cuando esa carta le completa una combinación', () => {
    const v = vista({ miMano: mano, descarteArriba: 'espadas-4' });
    expect(decide(v, ROBOS)).toEqual({ tipo: 'robar', desde: 'descarte' });
  });

  it('roba del mazo cuando la del descarte no le baja los puntos', () => {
    // Otro rey: lo cambiaría por el rey que ya tiene, sin ganar nada.
    const v = vista({ miMano: mano, descarteArriba: 'copas-12' });
    expect(decide(v, ROBOS)).toEqual({ tipo: 'robar', desde: 'mazo' });
  });

  it('descarta la carta que menos sirve, la de más valor si empatan', () => {
    const ocho: IdCarta[] = [
      'oros-1',
      'oros-2',
      'oros-3',
      'copas-5',
      'espadas-5',
      'bastos-5',
      'copas-6',
      'bastos-12',
    ];
    const v = vista({ miMano: ocho, fase: 'descartar' });
    const acciones = ocho.map((carta): AccionChinchon => ({ tipo: 'descartar', carta }));
    expect(decide(v, acciones)).toEqual({ tipo: 'descartar', carta: 'bastos-12' });
  });

  it('no descarta un comodín si tiene otra opción', () => {
    const ocho: IdCarta[] = [
      'comodin-1',
      'oros-12',
      'copas-12',
      'espadas-1',
      'bastos-2',
      'oros-6',
      'copas-7',
      'espadas-11',
    ];
    const v = vista({ miMano: ocho, fase: 'descartar' });
    const acciones = ocho.map((carta): AccionChinchon => ({ tipo: 'descartar', carta }));
    expect(decide(v, acciones)).not.toEqual({ tipo: 'descartar', carta: 'comodin-1' });
  });

  it('cierra cuando puede', () => {
    const ocho: IdCarta[] = [
      'oros-1',
      'oros-2',
      'oros-3',
      'copas-5',
      'espadas-5',
      'bastos-5',
      'copas-2',
      'bastos-12',
    ];
    const v = vista({ miMano: ocho, fase: 'descartar' });
    const acciones: AccionChinchon[] = [
      ...ocho.map((carta): AccionChinchon => ({ tipo: 'descartar', carta })),
      { tipo: 'cerrar', carta: 'bastos-12' },
    ];
    expect(decide(v, acciones)).toEqual({ tipo: 'cerrar', carta: 'bastos-12' });
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA del Chinchón', () => {
  const configs: ConfigChinchon[] = [
    { ...CONFIG_CHINCHON_POR_DEFECTO, limite: 50 },
    { jugadores: 3, baraja: 'espanola48', comodines: false, limite: 50, cierreMaximo: 5 },
    { jugadores: 4, baraja: 'espanola40', comodines: true, limite: 50, cierreMaximo: 3 },
    { jugadores: 2, baraja: 'espanola40', comodines: true, limite: 50, cierreMaximo: 0 },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaChinchonBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(chinchon.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 partidas contra el azar', () => {
    let ganadas = 0;
    let perdidas = 0;
    for (let i = 0; i < 1_000; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaChinchonBasica, azarDe] : [azarDe, iaChinchonBasica];
      const { final } = jugarPartida(configs[0]!, `contra-${i}`, agentes);
      const fin = chinchon.resultado(final)!;
      if (fin.ganadores.includes(ia) && !fin.empate) ganadas++;
      else if (!fin.empate) perdidas++;
    }
    expect(ganadas).toBeGreaterThan(600);
    expect(ganadas).toBeGreaterThan(perdidas * 1.5);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = chinchon.crear(CONFIG_CHINCHON_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const v = chinchon.vistaDe(r.valor, r.valor.turno);
    const acciones = chinchon.accionesLegales(r.valor, r.valor.turno);
    for (const agente of [iaChinchonBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaChinchon,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaChinchonBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
