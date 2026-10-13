import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaTuteBasica } from '../../src/ia/tute-basica';
import {
  CONFIG_TUTE_POR_DEFECTO,
  tute,
  type AccionTute,
  type ConfigTute,
  type EstadoTute,
  type VistaTute,
} from '../../src/juegos/tute';
import { aplicar } from '../../src/motor/aplicar';

type AgenteTute = Agente<VistaTute, AccionTute>;
const azarDe = aleatorio<VistaTute, AccionTute>();

// ── Utilidades ───────────────────────────────────────────────────────────────

/** Juega una partida completa con un agente por asiento, cada uno con su propia semilla. */
function jugarPartida(config: ConfigTute, semilla: string, agentes: readonly AgenteTute[]) {
  const creado = tute.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; tute.resultado(e) === null; pasos++) {
    if (pasos > 2_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = tute.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(tute.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(tute, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Vista de 2 jugadores armada a mano; triunfo en oros. */
function vista(parcial: Partial<VistaTute> & Pick<VistaTute, 'miMano'>): VistaTute {
  return {
    config: CONFIG_TUTE_POR_DEFECTO,
    asiento: 0,
    cartasEnMano: [8, 8],
    mazo: 10,
    muestra: 'oros-4',
    cartaTriunfo: null,
    triunfo: 'oros',
    mesa: [],
    turno: 0,
    repartidor: 1,
    bazas: [1, 0],
    ultimaBaza: null,
    cantes: [],
    resultadosManos: [],
    manosGanadas: [0, 0],
    ...parcial,
  };
}

const decide = (v: VistaTute, acciones: AccionTute[]) =>
  iaTuteBasica.decidir(v, acciones, crearAzar('x')).accion;
const jugadas = (v: VistaTute): AccionTute[] =>
  v.miMano!.map((carta) => ({ tipo: 'jugar', carta }));

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica del Tute', () => {
  it('canta el tute antes que cualquier otra cosa', () => {
    const v = vista({ miMano: ['oros-12', 'copas-12', 'espadas-12', 'bastos-12'] });
    const acciones: AccionTute[] = [
      { tipo: 'cantar', palo: 'oros' },
      { tipo: 'cantarTute' },
      ...jugadas(v),
    ];
    expect(decide(v, acciones)).toEqual({ tipo: 'cantarTute' });
  });

  it('canta lo que puede: las 40 antes que las 20', () => {
    const v = vista({ miMano: ['oros-12', 'oros-11', 'copas-12', 'copas-11'] });
    const acciones: AccionTute[] = [
      { tipo: 'cantar', palo: 'copas' },
      { tipo: 'cantar', palo: 'oros' },
      ...jugadas(v),
    ];
    expect(decide(v, acciones)).toEqual({ tipo: 'cantar', palo: 'oros' });
  });

  it('cambia el 7 cuando puede', () => {
    const v = vista({ miMano: ['oros-7', 'copas-2'], muestra: 'oros-1' });
    expect(decide(v, [{ tipo: 'cambiarSiete' }, ...jugadas(v)])).toEqual({
      tipo: 'cambiarSiete',
    });
  });

  it('guarda la pareja: al salir no juega el rey ni el caballo que aún puede cantar', () => {
    const v = vista({ miMano: ['espadas-12', 'espadas-11', 'copas-1', 'bastos-1'] });
    const accion = decide(v, jugadas(v));
    expect(accion).not.toEqual({ tipo: 'jugar', carta: 'espadas-12' });
    expect(accion).not.toEqual({ tipo: 'jugar', carta: 'espadas-11' });
  });

  it('una pareja ya cantada no se guarda', () => {
    const v = vista({
      miMano: ['espadas-11', 'espadas-12', 'oros-1'],
      cantes: [{ asiento: 0, palo: 'espadas', puntos: 20 }],
    });
    expect(decide(v, jugadas(v))).toEqual({ tipo: 'jugar', carta: 'espadas-11' });
  });

  it('si solo le quedan cartas de la pareja, juega una', () => {
    const v = vista({ miMano: ['espadas-12', 'espadas-11'] });
    expect(['espadas-12', 'espadas-11']).toContain(
      (decide(v, jugadas(v)) as { carta: string }).carta,
    );
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA del Tute', () => {
  const configs: ConfigTute[] = [
    CONFIG_TUTE_POR_DEFECTO,
    { jugadores: 2, cambioSiete: 'libre', montarSobreCompanero: false, manos: 3 },
    { jugadores: 4, cambioSiete: 'no', montarSobreCompanero: false, manos: 1 },
    { jugadores: 4, cambioSiete: 'libre', montarSobreCompanero: true, manos: 1 },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaTuteBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(tute.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 manos contra el azar', () => {
    let ganadas = 0;
    let perdidas = 0;
    for (let i = 0; i < 1_000; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaTuteBasica, azarDe] : [azarDe, iaTuteBasica];
      const { final } = jugarPartida(CONFIG_TUTE_POR_DEFECTO, `contra-${i}`, agentes);
      const ganador = final.resultadosManos[0]!.ganador;
      if (ganador === ia) ganadas++;
      else if (ganador !== null) perdidas++;
    }
    expect(ganadas).toBeGreaterThan(600);
    expect(ganadas).toBeGreaterThan(perdidas * 1.5);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = tute.crear({ ...CONFIG_TUTE_POR_DEFECTO, jugadores: 4 }, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoTute = r.valor;
    const v = tute.vistaDe(e, e.turno);
    const acciones = tute.accionesLegales(e, e.turno);
    for (const agente of [iaTuteBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaTute,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaTuteBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
