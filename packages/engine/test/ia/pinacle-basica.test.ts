import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaPinacleBasica } from '../../src/ia/pinacle-basica';
import {
  pinacle,
  type AccionPinacle,
  type CartaPinacle,
  type ConfigPinacle,
  type EstadoPinacle,
  type VistaPinacle,
} from '../../src/juegos/pinacle';
import { igualesJSON } from '../../src/motor/json';

type AgentePinacle = Agente<VistaPinacle, AccionPinacle>;
const azarDe = aleatorio<VistaPinacle, AccionPinacle>();

const c = (id: IdCarta, copia = 0): CartaPinacle => `${id}#${copia}`;

// ── Utilidades ───────────────────────────────────────────────────────────────

function jugarPartida(config: ConfigPinacle, semilla: string, agentes: readonly AgentePinacle[]) {
  const creado = pinacle.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; pinacle.resultado(e) === null; pasos++) {
    if (pasos > 100_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = pinacle.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(pinacle.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    // Las acciones legales ya están calculadas: se comprueba con ellas en vez de con plicar.
    if (!acciones.some((x) => igualesJSON(x, accion))) {
      throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${JSON.stringify(accion)}`);
    }
    e = pinacle.transicion(e, a, accion);
  }
  return { final: e, maxMs };
}

function mesa(manos: CartaPinacle[][], parcial: Partial<EstadoPinacle> = {}): EstadoPinacle {
  const r = pinacle.crear({ jugadores: 2 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos,
    conocidas: manos.map(() => []),
    turno: 0,
    fase: 'bajar',
    ...parcial,
  };
}

const decide = (e: EstadoPinacle) =>
  iaPinacleBasica.decidir(
    pinacle.vistaDe(e, e.turno),
    pinacle.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica del Pinacle', () => {
  it('baja lo que tiene antes de descartar', () => {
    const e = mesa([
      [c('treboles-9'), c('diamantes-9'), c('picas-9'), c('corazones-4'), c('picas-13')],
      [c('picas-4', 1)],
    ]);
    expect(decide(e)).toMatchObject({ tipo: 'bajar', combinacion: { tipo: 'grupo' } });
  });

  it('no regala cartas al rival', () => {
    const rival = {
      id: 1,
      bando: 1,
      cambiados: [],
      primerTurno: 1,
      variosTurnos: false,
      tipo: 'escalera' as const,
      palo: 'picas' as const,
      desde: 5,
      puestos: [5, 6, 7, 8].map((v) => c(`picas-${v}` as IdCarta)),
    };
    const e = mesa([[c('picas-9'), c('diamantes-4')], [c('picas-4', 1)]], {
      combinaciones: [rival],
      siguienteId: 2,
    });
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: c('diamantes-4') });
  });

  it('no descarta un comodín si tiene otra opción', () => {
    const e = mesa([
      [c('comodin-1'), c('picas-2'), c('diamantes-12'), c('treboles-5')],
      [c('picas-4', 1)],
    ]);
    const accion = decide(e);
    expect(accion.tipo).toBe('descartar');
    expect(['comodin-1#0', 'picas-2#0']).not.toContain((accion as { carta: string }).carta);
  });

  it('se lleva un montón que le sirve y deja uno que no', () => {
    const mano = [c('picas-9'), c('corazones-9'), c('treboles-5'), c('diamantes-12')];
    const bueno = mesa([mano, [c('picas-4', 1)]], {
      fase: 'robar',
      monton: [c('corazones-5'), c('treboles-6'), c('diamantes-9')],
    });
    expect(decide(bueno)).toEqual({ tipo: 'robar', desde: 'monton' });
    const malo = mesa([mano, [c('picas-4', 1)]], {
      fase: 'robar',
      monton: [
        c('corazones-3'),
        c('treboles-11'),
        c('diamantes-4'),
        c('corazones-13'),
        c('picas-3'),
        c('diamantes-6'),
        c('diamantes-9'),
      ],
    });
    expect(decide(malo)).toEqual({ tipo: 'robar', desde: 'mazo' });
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA del Pinacle', () => {
  const configs: ConfigPinacle[] = [{ jugadores: 2 }, { jugadores: 4 }];

  it('200 partidas entre IAs de 2 y 4 jugadores terminan sin acciones ilegales', () => {
    for (let i = 0; i < 200; i++) {
      const config = configs[i % 2]!;
      const agentes = Array.from({ length: config.jugadores }, () => iaPinacleBasica);
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(pinacle.resultado(final)).not.toBeNull();
    }
  });

  it('gana más del 90 % de 200 partidas contra el azar', () => {
    let ganadas = 0;
    for (let i = 0; i < 200; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaPinacleBasica, azarDe] : [azarDe, iaPinacleBasica];
      const { final } = jugarPartida(configs[0]!, `contra-${i}`, agentes);
      const fin = pinacle.resultado(final)!;
      if (fin.ganadores.includes(ia) && !fin.empate) ganadas++;
    }
    expect(ganadas).toBeGreaterThan(180);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = pinacle.crear({ jugadores: 2 }, 'repro');
    if (!r.ok) throw new Error(r.error);
    const v = pinacle.vistaDe(r.valor, 0);
    const acciones = pinacle.accionesLegales(r.valor, 0);
    const a = iaPinacleBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaPinacleBasica.decidir(
      JSON.parse(JSON.stringify(v)) as VistaPinacle,
      [...acciones],
      crearAzar('s'),
    );
    expect(b).toEqual(a);
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaPinacleBasica);
      expect(jugarPartida(config, 'tiempo', agentes).maxMs).toBeLessThan(500);
    }
  });
});
