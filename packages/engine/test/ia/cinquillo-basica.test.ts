import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaCinquilloBasica } from '../../src/ia/cinquillo-basica';
import {
  cinquillo,
  CONFIG_CINQUILLO_POR_DEFECTO,
  type AccionCinquillo,
  type ConfigCinquillo,
  type VistaCinquillo,
} from '../../src/juegos/cinquillo';
import { aplicar } from '../../src/motor/aplicar';

type AgenteCinquillo = Agente<VistaCinquillo, AccionCinquillo>;
const azarDe = aleatorio<VistaCinquillo, AccionCinquillo>();

function jugarPartida(
  config: ConfigCinquillo,
  semilla: string,
  agentes: readonly AgenteCinquillo[],
) {
  const creado = cinquillo.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; cinquillo.resultado(e) === null; pasos++) {
    if (pasos > 5_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = cinquillo.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(cinquillo.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(cinquillo, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

describe('IA básica del Cinquillo', () => {
  it('se abre camino a sí misma: el 6 antes que el 4 si tiene el 7 y la Sota', () => {
    const vista: VistaCinquillo = {
      config: CONFIG_CINQUILLO_POR_DEFECTO,
      asiento: 0,
      miMano: ['bastos-4', 'bastos-6', 'bastos-7', 'bastos-10'],
      cartasEnMano: [4, 5, 5, 5],
      mesa: {
        oros: { bajo: 4, alto: 4 },
        copas: null,
        espadas: null,
        bastos: { bajo: 4, alto: 4 },
      },
      turno: 0,
      repartidor: 3,
      ultimaAccion: null,
      resultadosManos: [],
      totales: [0, 0, 0, 0],
    };
    const acciones: AccionCinquillo[] = [
      { tipo: 'jugar', carta: 'bastos-4' },
      { tipo: 'jugar', carta: 'bastos-6' },
    ];
    expect(iaCinquilloBasica.decidir(vista, acciones, crearAzar('x')).accion).toEqual({
      tipo: 'jugar',
      carta: 'bastos-6',
    });
  });

  it('si solo puede pasar, pasa', () => {
    const r = cinquillo.crear(CONFIG_CINQUILLO_POR_DEFECTO, 'p');
    if (!r.ok) throw new Error(r.error);
    const v = cinquillo.vistaDe(r.valor, 0);
    expect(iaCinquilloBasica.decidir(v, [{ tipo: 'pasar' }], crearAzar('x')).accion).toEqual({
      tipo: 'pasar',
    });
  });
});

describe('garantías de la IA del Cinquillo', () => {
  const configs: ConfigCinquillo[] = [
    CONFIG_CINQUILLO_POR_DEFECTO,
    { jugadores: 2, manos: 1 },
    { jugadores: 3, manos: 3 },
    { jugadores: 4, manos: 5 },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaCinquilloBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(cinquillo.resultado(final)).not.toBeNull();
    }
  });

  it('gana claramente más de la mitad de 1.000 partidas contra el azar', () => {
    let ganadas = 0;
    let perdidas = 0;
    for (let i = 0; i < 1_000; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaCinquilloBasica, azarDe] : [azarDe, iaCinquilloBasica];
      const { final } = jugarPartida({ jugadores: 2, manos: 3 }, `contra-${i}`, agentes);
      const fin = cinquillo.resultado(final)!;
      if (fin.ganadores.includes(ia)) ganadas++;
      else if (!fin.empate) perdidas++;
    }
    expect(ganadas).toBeGreaterThan(600);
    expect(ganadas).toBeGreaterThan(perdidas * 1.5);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = cinquillo.crear(CONFIG_CINQUILLO_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = cinquillo.vistaDe(e, e.turno);
    const acciones = cinquillo.accionesLegales(e, e.turno);
    for (const agente of [iaCinquilloBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaCinquillo,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaCinquilloBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
