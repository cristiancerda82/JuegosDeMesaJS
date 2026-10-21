import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaOchoLocoBasica, iaOchoLocoExperta } from '../../src/ia/ocho-loco-basica';
import { reconstruirOchoLoco } from '../../src/ia/reconstruir/ocho-loco';
import {
  CONFIG_OCHO_LOCO_POR_DEFECTO,
  esOcho,
  numeroOchoLoco,
  ochoLoco,
  paloOchoLoco,
  type AccionOchoLoco,
  type ConfigOchoLoco,
  type VistaOchoLoco,
} from '../../src/juegos/ocho-loco';
import { aplicar } from '../../src/motor/aplicar';

type AgenteOchoLoco = Agente<VistaOchoLoco, AccionOchoLoco>;
const azarDe = aleatorio<VistaOchoLoco, AccionOchoLoco>();

function jugarPartida(config: ConfigOchoLoco, semilla: string, agentes: readonly AgenteOchoLoco[]) {
  const creado = ochoLoco.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; ochoLoco.resultado(e) === null; pasos++) {
    if (pasos > 20_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = ochoLoco.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(ochoLoco.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(ochoLoco, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

/** Una vista con esta mano y este descarte, turno del asiento 0. */
function vistaCon(
  miMano: VistaOchoLoco['miMano'],
  arriba: VistaOchoLoco['descarte'][number],
  parcial: Partial<VistaOchoLoco> = {},
): VistaOchoLoco {
  return {
    config: CONFIG_OCHO_LOCO_POR_DEFECTO,
    asiento: 0,
    miMano,
    cartasEnMano: [miMano!.length, 5, 5, 5],
    mazo: 20,
    descarte: [arriba],
    palo: arriba.split('-')[0] as VistaOchoLoco['palo'],
    turno: 0,
    robe: false,
    robada: null,
    pasesSeguidos: 0,
    repartidor: 3,
    ultimas: [null, null, null, null],
    faltas: [null, null, null, null],
    resultadosManos: [],
    totales: [0, 0, 0, 0],
    ...parcial,
  };
}

const decide = (vista: VistaOchoLoco, acciones: AccionOchoLoco[]) =>
  iaOchoLocoBasica.decidir(vista, acciones, crearAzar('x')).accion;

describe('IA básica del Ocho loco', () => {
  it('la normal suelta el 8 como otra carta; la experta y la difícil lo guardan', () => {
    const v = vistaCon(['corazones-4', 'picas-8', 'treboles-2'], 'corazones-9');
    const acciones: AccionOchoLoco[] = [
      { tipo: 'jugar', carta: 'corazones-4' },
      ...(['picas', 'corazones', 'diamantes', 'treboles'] as const).map((palo): AccionOchoLoco => ({
        tipo: 'jugar',
        carta: 'picas-8',
        palo,
      })),
    ];
    expect(decide(v, acciones)).toEqual({ tipo: 'jugar', carta: 'picas-8', palo: 'corazones' });
    const guarda = { tipo: 'jugar', carta: 'corazones-4' };
    expect(iaOchoLocoExperta.decidir(v, acciones, crearAzar('x')).accion).toEqual(guarda);
    expect(IAS.ochoLoco.dificil.decidir(v, acciones, crearAzar('x')).accion).toEqual(guarda);
  });

  it('con el 8 elige el palo del que más cartas le quedan', () => {
    const v = vistaCon(
      ['picas-8', 'diamantes-2', 'diamantes-5', 'diamantes-12', 'treboles-3'],
      'corazones-9',
    );
    const acciones = (['picas', 'corazones', 'diamantes', 'treboles'] as const).map(
      (palo): AccionOchoLoco => ({ tipo: 'jugar', carta: 'picas-8', palo }),
    );
    expect(decide(v, acciones)).toEqual({ tipo: 'jugar', carta: 'picas-8', palo: 'diamantes' });
  });

  it('prefiere la carta que la deja con más del palo que tocará', () => {
    const v = vistaCon(['corazones-4', 'picas-9', 'picas-2', 'picas-3'], 'corazones-9');
    const acciones: AccionOchoLoco[] = [
      { tipo: 'jugar', carta: 'corazones-4' },
      { tipo: 'jugar', carta: 'picas-9' },
    ];
    expect(decide(v, acciones)).toEqual({ tipo: 'jugar', carta: 'picas-9' });
  });

  it('juega la carta robada si casa', () => {
    const v = vistaCon(['picas-2', 'corazones-6'], 'corazones-9', {
      robe: true,
      robada: 'corazones-6',
    });
    expect(decide(v, [{ tipo: 'jugar', carta: 'corazones-6' }, { tipo: 'pasar' }])).toEqual({
      tipo: 'jugar',
      carta: 'corazones-6',
    });
  });

  it('sin jugables, roba', () => {
    const v = vistaCon(['picas-2'], 'corazones-9');
    expect(decide(v, [{ tipo: 'robar' }])).toEqual({ tipo: 'robar' });
  });
});

describe('garantías de la IA del Ocho loco', () => {
  const configs: ConfigOchoLoco[] = [
    { jugadores: 2 },
    { jugadores: 3 },
    { jugadores: 4 },
    { jugadores: 5 },
  ];

  it('500 partidas entre IAs, de 2 a 5, terminan sin acciones ilegales', () => {
    let maximo = 0;
    for (let i = 0; i < 500; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaOchoLocoBasica,
      );
      const { final, maxMs } = jugarPartida(config, `sim-${i}`, agentes);
      expect(ochoLoco.resultado(final)).not.toBeNull();
      maximo = Math.max(maximo, maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente más de la mitad de 500 partidas contra el azar', () => {
    let ganadas = 0;
    for (let i = 0; i < 500; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaOchoLocoBasica, azarDe] : [azarDe, iaOchoLocoBasica];
      const { final } = jugarPartida({ jugadores: 2 }, `contra-${i}`, agentes);
      if (ochoLoco.resultado(final)!.ganadores.includes(ia)) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(300);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = ochoLoco.crear(CONFIG_OCHO_LOCO_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = ochoLoco.vistaDe(e, e.turno);
    const acciones = ochoLoco.accionesLegales(e, e.turno);
    const a = iaOchoLocoBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaOchoLocoBasica.decidir(v, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });
});

describe('reconstrucción del Ocho loco', () => {
  it('quien robó no tenía el palo, el número ni ochos: todas sus cartas menos una lo cumplen', () => {
    const r = ochoLoco.crear({ jugadores: 3 }, 'faltas');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    // Se juega hasta que el asiento 1 roba y pasa.
    for (let paso = 0; paso < 500; paso++) {
      const a = e.turno;
      const acciones = ochoLoco.accionesLegales(e, a);
      const accion = iaOchoLocoBasica.decidir(
        ochoLoco.vistaDe(e, a),
        acciones,
        crearAzar('x'),
      ).accion;
      e = ochoLoco.transicion(e, a, accion);
      if (e.faltas[1] !== null && e.turno === 2 && e.manos[1]!.length > 2) break;
    }
    const falta = e.faltas[1]!;
    expect(falta).not.toBeNull();
    const vista = ochoLoco.vistaDe(e, 0);
    for (let i = 0; i < 20; i++) {
      const rec = reconstruirOchoLoco(vista, crearAzar(`rec-${i}`));
      const libres = rec.manos[1]!.filter(
        (c) => esOcho(c) || paloOchoLoco(c) === falta.palo || numeroOchoLoco(c) === falta.numero,
      );
      expect(libres.length).toBeLessThanOrEqual(1);
      expect(ochoLoco.vistaDe(rec, 0)).toEqual(vista);
    }
  });
});
