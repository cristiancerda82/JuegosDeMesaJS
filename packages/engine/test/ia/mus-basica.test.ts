import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaMusBasica } from '../../src/ia/mus-basica';
import {
  CONFIG_MUS_POR_DEFECTO,
  mus,
  parejaDe,
  type AccionMus,
  type ConfigMus,
  type VistaMus,
} from '../../src/juegos/mus';
import { aplicar } from '../../src/motor/aplicar';

type AgenteMus = Agente<VistaMus, AccionMus>;
const azarDe = aleatorio<VistaMus, AccionMus>();

// ── Utilidades ───────────────────────────────────────────────────────────────

function jugarPartida(config: ConfigMus, semilla: string, agentes: readonly AgenteMus[]) {
  const creado = mus.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; mus.resultado(e) === null; pasos++) {
    if (pasos > 20_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = mus.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(mus.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(mus, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Vista armada a mano: habla el asiento 1 (no es mano). */
function vista(parcial: Partial<VistaMus> & Pick<VistaMus, 'miMano'>): VistaMus {
  return {
    config: CONFIG_MUS_POR_DEFECTO,
    asiento: 1,
    cartasEnMano: [4, 4, 4, 4],
    repartidor: 3,
    mano: 0,
    fase: 'lance',
    turno: 1,
    musPedido: [false, false, false, false],
    descartados: [null, null, null, null],
    lance: 'grande',
    hablados: [],
    cartasDescartadas: 0,
    envite: null,
    lances: [],
    declaraciones: { pares: null, juego: null },
    piedras: [0, 0],
    juegos: [0, 0],
    resultadosManos: [],
    ultimaAccion: null,
    ...parcial,
  };
}

const decide = (v: VistaMus, acciones: AccionMus[]) =>
  iaMusBasica.decidir(v, acciones, crearAzar('x')).accion;
const MUS_O_CORTAR: AccionMus[] = [{ tipo: 'mus' }, { tipo: 'cortar' }];
const RESPUESTAS: AccionMus[] = [
  { tipo: 'quiero' },
  { tipo: 'noQuiero' },
  { tipo: 'subir', piedras: 2 },
  { tipo: 'subir', piedras: 5 },
  { tipo: 'ordago' },
];
const ENVITE_2 = { pareja: 0 as const, total: 2, previo: 0, ordago: false, responde: [1, 3] };

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica del Mus', () => {
  it('corta el mus con 31', () => {
    const v = vista({ fase: 'mus', miMano: ['oros-12', 'copas-11', 'espadas-10', 'oros-1'] });
    expect(decide(v, MUS_O_CORTAR)).toEqual({ tipo: 'cortar' });
  });

  it('pide mus con una mano floja', () => {
    const v = vista({ fase: 'mus', miMano: ['oros-4', 'copas-5', 'espadas-6', 'oros-7'] });
    expect(decide(v, MUS_O_CORTAR)).toEqual({ tipo: 'mus' });
  });

  it('descarta lo que no son reyes ni pares', () => {
    const mano: IdCarta[] = ['oros-12', 'copas-5', 'espadas-5', 'oros-7'];
    const v = vista({ fase: 'descarte', miMano: mano });
    const acciones: AccionMus[] = [
      { tipo: 'descartar', cartas: ['oros-12'] },
      { tipo: 'descartar', cartas: ['oros-7'] },
      { tipo: 'descartar', cartas: ['copas-5', 'oros-7'] },
    ];
    expect(decide(v, acciones)).toEqual({ tipo: 'descartar', cartas: ['oros-7'] });
  });

  it('no quiere un envite a Grande sin reyes ni caballos', () => {
    const v = vista({
      miMano: ['oros-7', 'copas-5', 'espadas-4', 'oros-1'],
      envite: ENVITE_2,
    });
    expect(decide(v, RESPUESTAS)).toEqual({ tipo: 'noQuiero' });
  });

  it('echa órdago a Grande solo con cuatro reyes', () => {
    const sin: AccionMus[] = [
      { tipo: 'paso' },
      { tipo: 'envidar', piedras: 2 },
      { tipo: 'envidar', piedras: 5 },
      { tipo: 'ordago' },
    ];
    const tres = vista({ miMano: ['oros-12', 'copas-12', 'espadas-12', 'oros-11'] });
    expect(decide(tres, sin)).toEqual({ tipo: 'envidar', piedras: 5 });
    const cuatro = vista({ miMano: ['oros-12', 'copas-12', 'espadas-3', 'oros-3'] });
    expect(decide(cuatro, sin)).toEqual({ tipo: 'ordago' });
  });

  it('quiere un envite a Grande con dos reyes y sube con cuatro', () => {
    const dos = vista({ miMano: ['oros-12', 'copas-12', 'espadas-4', 'oros-1'], envite: ENVITE_2 });
    expect(decide(dos, RESPUESTAS)).toEqual({ tipo: 'quiero' });
    const cuatro = vista({
      miMano: ['oros-12', 'copas-12', 'espadas-3', 'oros-3'],
      envite: ENVITE_2,
    });
    expect(decide(cuatro, RESPUESTAS)).toEqual({ tipo: 'subir', piedras: 2 });
  });

  it('quiere el órdago con una jugada fuerte, no con una regular', () => {
    const ordago = { ...ENVITE_2, ordago: true };
    const acciones: AccionMus[] = [{ tipo: 'quiero' }, { tipo: 'noQuiero' }];
    const dos = vista({ miMano: ['oros-12', 'copas-12', 'espadas-7', 'oros-1'], envite: ordago });
    expect(decide(dos, acciones)).toEqual({ tipo: 'noQuiero' });
    const cuatro = vista({
      miMano: ['oros-12', 'copas-12', 'espadas-3', 'oros-3'],
      envite: ordago,
    });
    expect(decide(cuatro, acciones)).toEqual({ tipo: 'quiero' });
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA del Mus', () => {
  const configs: ConfigMus[] = [
    { reyes: 8, puntos: 30, juegos: 1 },
    { reyes: 4, puntos: 30, juegos: 1 },
    { reyes: 8, puntos: 40, juegos: 1 },
    CONFIG_MUS_POR_DEFECTO,
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: 4 }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaMusBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(mus.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 partidas contra el azar', () => {
    let ganadas = 0;
    for (let i = 0; i < 1_000; i++) {
      const parejaIa = i % 2;
      const agentes = Array.from({ length: 4 }, (_, a) =>
        parejaDe(a) === parejaIa ? iaMusBasica : azarDe,
      );
      const { final } = jugarPartida(configs[i % 3]!, `contra-${i}`, agentes);
      if (mus.resultado(final)!.ganadores.includes(parejaIa)) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(650);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = mus.crear(CONFIG_MUS_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = mus.vistaDe(e, e.turno);
    const acciones = mus.accionesLegales(e, e.turno);
    for (const agente of [iaMusBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaMus,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: 4 }, () => iaMusBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
