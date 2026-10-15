import { describe, expect, it } from 'vitest';
import { crearAzar, Generador, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaBurroBasica } from '../../src/ia/burro-basica';
import {
  burro,
  CONFIG_BURRO_POR_DEFECTO,
  LETRAS_BURRO,
  type AccionBurro,
  type ConfigBurro,
  type VistaBurro,
} from '../../src/juegos/burro';
import { aplicar } from '../../src/motor/aplicar';

type AgenteBurro = Agente<VistaBurro, AccionBurro>;
const azarDe = aleatorio<VistaBurro, AccionBurro>();

/**
 * Juega una partida completa. En cada paso, el asiento que actúa se elige al azar entre los que
 * pueden, como si reaccionaran a distinta velocidad.
 */
function jugarPartida(config: ConfigBurro, semilla: string, agentes: readonly AgenteBurro[]) {
  const creado = burro.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  const orden = new Generador(crearAzar(`${semilla}/orden`));
  let maxMs = 0;
  for (let pasos = 0; burro.resultado(e) === null; pasos++) {
    if (pasos > 200_000) throw new Error('La partida no termina');
    const pueden = agentes.flatMap((_, a) => (burro.accionesLegales(e, a).length > 0 ? [a] : []));
    const a = pueden[orden.enteroHasta(pueden.length)]!;
    const acciones = burro.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(burro.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(burro, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

function vista(miMano: IdCarta[], parcial: Partial<VistaBurro> = {}): VistaBurro {
  return {
    config: CONFIG_BURRO_POR_DEFECTO,
    asiento: 1,
    miMano,
    miPase: null,
    pasada: null,
    recibida: null,
    eligieron: [false, false, false, false],
    cartasEnMano: [4, 4, 4, 4],
    fase: 'pase',
    plantados: [],
    letras: [0, 0, 0, 0],
    numeroMano: 0,
    intercambios: 0,
    ultimaMano: null,
    ...parcial,
  };
}

const pasarDe = (mano: IdCarta[]): AccionBurro[] => mano.map((carta) => ({ tipo: 'pasar', carta }));

describe('IA básica del Burro', () => {
  it('pasa del número que menos tiene', () => {
    const mano: IdCarta[] = ['oros-12', 'copas-12', 'oros-1', 'espadas-12'];
    for (const semilla of ['a', 'b', 'c', 'd']) {
      const accion = iaBurroBasica.decidir(vista(mano), pasarDe(mano), crearAzar(semilla)).accion;
      expect(accion).toEqual({ tipo: 'pasar', carta: 'oros-1' });
    }
  });

  it('entre números empatados elige uno de los que menos tiene', () => {
    const mano: IdCarta[] = ['oros-3', 'copas-3', 'oros-5', 'bastos-7'];
    const elegidas = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const accion = iaBurroBasica.decidir(vista(mano), pasarDe(mano), crearAzar(`e${i}`)).accion;
      if (accion.tipo === 'pasar') elegidas.add(accion.carta);
    }
    expect([...elegidas].sort()).toEqual(['bastos-7', 'oros-5']);
  });

  it('se planta con cuatro iguales', () => {
    const mano: IdCarta[] = ['oros-11', 'copas-11', 'espadas-11', 'bastos-11'];
    const acciones: AccionBurro[] = [...pasarDe(mano), { tipo: 'plantarse' }];
    const accion = iaBurroBasica.decidir(vista(mano), acciones, crearAzar('x')).accion;
    expect(accion).toEqual({ tipo: 'plantarse' });
  });

  it('se planta en cuanto otro se ha plantado', () => {
    const mano: IdCarta[] = ['oros-11', 'copas-2', 'espadas-11', 'bastos-5'];
    const v = vista(mano, { fase: 'plantando', plantados: [2] });
    const accion = iaBurroBasica.decidir(v, [{ tipo: 'plantarse' }], crearAzar('x')).accion;
    expect(accion).toEqual({ tipo: 'plantarse' });
  });
});

describe('garantías de la IA del Burro', () => {
  const configs: ConfigBurro[] = [{ jugadores: 3 }, CONFIG_BURRO_POR_DEFECTO, { jugadores: 5 }];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % 3]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaBurroBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(burro.resultado(final)).not.toBeNull();
      expect(final.letras.filter((l) => l === LETRAS_BURRO)).toHaveLength(1);
    }
  });

  it('contra tres jugadores al azar, es el burro en menos del 15 % de 1.000 partidas', () => {
    let perdidas = 0;
    for (let i = 0; i < 1_000; i++) {
      const asientoIa = i % 4;
      const agentes = Array.from({ length: 4 }, (_, a) =>
        a === asientoIa ? iaBurroBasica : azarDe,
      );
      const { final } = jugarPartida(CONFIG_BURRO_POR_DEFECTO, `contra-${i}`, agentes);
      if (!burro.resultado(final)!.ganadores.includes(asientoIa)) perdidas++;
    }
    expect(perdidas).toBeLessThan(150);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = burro.crear(CONFIG_BURRO_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const v = burro.vistaDe(r.valor, 0);
    const acciones = burro.accionesLegales(r.valor, 0);
    for (const agente of [iaBurroBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaBurro,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaBurroBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
