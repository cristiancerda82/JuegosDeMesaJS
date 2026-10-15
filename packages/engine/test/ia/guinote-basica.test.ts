import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaGuinoteBasica } from '../../src/ia/guinote-basica';
import {
  CONFIG_GUINOTE_POR_DEFECTO,
  guinote,
  type AccionGuinote,
  type ConfigGuinote,
  type EstadoGuinote,
  type VistaGuinote,
} from '../../src/juegos/guinote';
import { bandoDe } from '../../src/motor/bazas';
import { aplicar } from '../../src/motor/aplicar';

type AgenteGuinote = Agente<VistaGuinote, AccionGuinote>;
const azarDe = aleatorio<VistaGuinote, AccionGuinote>();

// ── Utilidades ───────────────────────────────────────────────────────────────

/** Juega una partida completa con un agente por asiento, cada uno con su propia semilla. */
function jugarPartida(config: ConfigGuinote, semilla: string, agentes: readonly AgenteGuinote[]) {
  const creado = guinote.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; guinote.resultado(e) === null; pasos++) {
    if (pasos > 5_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = guinote.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(guinote.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(guinote, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Vista de 2 jugadores armada a mano, con mazo; triunfo en oros. */
function vista(parcial: Partial<VistaGuinote> & Pick<VistaGuinote, 'miMano'>): VistaGuinote {
  return {
    config: CONFIG_GUINOTE_POR_DEFECTO,
    asiento: 0,
    cartasEnMano: [6, 6],
    mazo: 10,
    muestra: 'oros-4',
    triunfo: 'oros',
    arrastre: false,
    mesa: [],
    turno: 0,
    repartidor: 1,
    bazas: [1, 0],
    ultimaBaza: null,
    puntos: [0, 0],
    jugadas: [],
    puedeCantar: null,
    cantes: [],
    resultadosManos: [],
    totales: [0, 0],
    ...parcial,
  };
}

const decide = (v: VistaGuinote, acciones: AccionGuinote[]) =>
  iaGuinoteBasica.decidir(v, acciones, crearAzar('x')).accion;
const jugadas = (v: VistaGuinote): AccionGuinote[] =>
  v.miMano!.map((carta) => ({ tipo: 'jugar', carta }));

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica del Guiñote', () => {
  it('canta lo que puede: las 40 antes que las 20', () => {
    const v = vista({ miMano: ['oros-12', 'oros-10', 'copas-12', 'copas-10'] });
    const acciones: AccionGuinote[] = [
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

  it('guarda la pareja: al salir con mazo no juega el rey ni la sota', () => {
    const v = vista({ miMano: ['espadas-12', 'espadas-10', 'copas-1', 'bastos-1'] });
    const accion = decide(v, jugadas(v));
    expect(accion).not.toEqual({ tipo: 'jugar', carta: 'espadas-12' });
    expect(accion).not.toEqual({ tipo: 'jugar', carta: 'espadas-10' });
  });

  it('en el arrastre ya no guarda la pareja', () => {
    const v = vista({
      miMano: ['espadas-12', 'espadas-10', 'copas-1', 'bastos-1'],
      arrastre: true,
      mazo: 0,
      muestra: null,
    });
    expect(decide(v, jugadas(v))).toEqual({ tipo: 'jugar', carta: 'espadas-10' });
  });

  it('gana con la sota al caballo cuando la baza tiene puntos', () => {
    const v = vista({
      miMano: ['espadas-10', 'copas-2'],
      mesa: [{ asiento: 1, carta: 'espadas-11' }],
      cartasEnMano: [2, 1],
    });
    expect(decide(v, jugadas(v))).toEqual({ tipo: 'jugar', carta: 'espadas-10' });
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA del Guiñote', () => {
  const configs: ConfigGuinote[] = [
    CONFIG_GUINOTE_POR_DEFECTO,
    { jugadores: 2, cambioSiete: 'libre', montarSobreCompanero: false, meta: 51 },
    { jugadores: 4, cambioSiete: 'no', montarSobreCompanero: false, meta: 101 },
    { jugadores: 4, cambioSiete: 'trasGanarBaza', montarSobreCompanero: true, meta: 101 },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaGuinoteBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(guinote.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 partidas contra el azar', () => {
    let ganadas = 0;
    for (let i = 0; i < 1_000; i++) {
      const jugadores = i % 4 < 2 ? 2 : 4;
      const bandoIa = i % 2;
      const agentes = Array.from({ length: jugadores }, (_, a) =>
        bandoDe(a) === bandoIa ? iaGuinoteBasica : azarDe,
      );
      const { final } = jugarPartida(
        { ...CONFIG_GUINOTE_POR_DEFECTO, jugadores },
        `contra-${i}`,
        agentes,
      );
      if (guinote.resultado(final)!.ganadores.includes(bandoIa)) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(650);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = guinote.crear({ ...CONFIG_GUINOTE_POR_DEFECTO, jugadores: 4 }, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoGuinote = r.valor;
    const v = guinote.vistaDe(e, e.turno);
    const acciones = guinote.accionesLegales(e, e.turno);
    for (const agente of [iaGuinoteBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaGuinote,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaGuinoteBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
