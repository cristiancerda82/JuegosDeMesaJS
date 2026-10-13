import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { aleatorio, type Agente } from '../../src/ia/agente';
import { iaEscobaBasica } from '../../src/ia/escoba-basica';
import {
  CONFIG_ESCOBA_POR_DEFECTO,
  escoba,
  type AccionEscoba,
  type ConfigEscoba,
  type EstadoEscoba,
  type VistaEscoba,
} from '../../src/juegos/escoba';
import { aplicar } from '../../src/motor/aplicar';

type AgenteEscoba = Agente<VistaEscoba, AccionEscoba>;
const azarDe = aleatorio<VistaEscoba, AccionEscoba>();

// ── Utilidades ───────────────────────────────────────────────────────────────

/** Juega hasta que se cumple `hasta` (por defecto, el fin de la partida). */
function jugarPartida(
  config: ConfigEscoba,
  semilla: string,
  agentes: readonly AgenteEscoba[],
  hasta: (e: EstadoEscoba) => boolean = (e) => escoba.resultado(e) !== null,
) {
  const creado = escoba.crear(config, semilla);
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  const azares: EstadoAzar[] = agentes.map((_, a) => crearAzar(`${semilla}/ia${a}`));
  let maxMs = 0;
  for (let pasos = 0; !hasta(e); pasos++) {
    if (pasos > 10_000) throw new Error('La partida no termina');
    const a = e.turno;
    const acciones = escoba.accionesLegales(e, a);
    const inicio = Date.now();
    const { accion, azar } = agentes[a]!.decidir(escoba.vistaDe(e, a), acciones, azares[a]!);
    maxMs = Math.max(maxMs, Date.now() - inicio);
    azares[a] = azar;
    const r = aplicar(escoba, e, a, accion);
    if (!r.ok) throw new Error(`Acción ilegal de ${agentes[a]!.id}: ${r.error}`);
    e = r.valor;
  }
  return { final: e, maxMs };
}

function vista(parcial: Partial<VistaEscoba>): VistaEscoba {
  return {
    config: CONFIG_ESCOBA_POR_DEFECTO,
    asiento: 0,
    miMano: [],
    cartasEnMano: [3, 3],
    mazo: 20,
    mesa: [],
    turno: 0,
    repartidor: 1,
    cartasRecogidas: [0, 0],
    escobas: [0, 0],
    ultimoEnRecoger: null,
    ultimaJugada: null,
    puntosPartida: [0, 0],
    resultadosManos: [],
    ...parcial,
  };
}

const decide = (v: VistaEscoba, acciones: AccionEscoba[]) =>
  iaEscobaBasica.decidir(v, acciones, crearAzar('x')).accion;

// ── Reglas de la IA básica ───────────────────────────────────────────────────

describe('IA básica de la Escoba', () => {
  it('hace escoba cuando puede, aunque otra captura lleve el 7 de oros', () => {
    // Mesa: 3 de copas, rey de bastos (10) y sota de oros (8).
    // 2 + 3 + 10 = 15 deja la sota en la mesa; 7 de oros + sota = 15 deja 3 + 10 en la mesa.
    const v = vista({
      mesa: ['copas-3', 'bastos-12', 'oros-10'],
      miMano: ['espadas-2', 'oros-7'],
    });
    const acciones: AccionEscoba[] = [
      { tipo: 'jugar', carta: 'espadas-2', captura: ['copas-3', 'bastos-12'] },
      { tipo: 'jugar', carta: 'oros-7', captura: ['oros-10'] },
      { tipo: 'jugar', carta: 'espadas-2', captura: [] },
    ];
    // Sin escoba posible, elige la captura del 7 de oros.
    expect(decide(v, acciones)).toEqual(acciones[1]);

    // Sin la sota, 2 + 3 + 10 vacía la mesa: prefiere la escoba a soltar el 7 de oros.
    const conEscoba = vista({ ...v, mesa: ['copas-3', 'bastos-12'] });
    const escobaTotal = acciones[0]!;
    expect(
      decide(conEscoba, [{ tipo: 'jugar', carta: 'oros-7', captura: [] }, escobaTotal]),
    ).toEqual(escobaTotal);
  });

  it('se lleva el 7 de oros si puede', () => {
    // La sota (8) suma 15 con cualquiera de los dos sietes.
    const v = vista({ mesa: ['copas-7', 'oros-7', 'bastos-1'], miMano: ['espadas-10'] });
    const acciones: AccionEscoba[] = [
      { tipo: 'jugar', carta: 'espadas-10', captura: ['copas-7'] },
      { tipo: 'jugar', carta: 'espadas-10', captura: ['oros-7'] },
      { tipo: 'jugar', carta: 'espadas-10', captura: [] },
    ];
    expect(decide(v, acciones)).toEqual(acciones[1]);
  });

  it('no da escoba: sin poder recoger, evita dejar la mesa entre 5 y 14', () => {
    // Con un 6 en la mesa: soltar el 4 deja 10 (a tiro de escoba); soltar el rey deja 16.
    const v = vista({ mesa: ['copas-6'], miMano: ['bastos-4', 'bastos-12'] });
    const acciones: AccionEscoba[] = [
      { tipo: 'jugar', carta: 'bastos-4', captura: [] },
      { tipo: 'jugar', carta: 'bastos-12', captura: [] },
    ];
    expect(decide(v, acciones)).toEqual(acciones[1]);
  });

  it('sin captura, no suelta sietes ni oros si tiene otra opción', () => {
    const v = vista({ mesa: ['copas-12', 'espadas-12'], miMano: ['oros-7', 'bastos-6'] });
    const acciones: AccionEscoba[] = [
      { tipo: 'jugar', carta: 'oros-7', captura: [] },
      { tipo: 'jugar', carta: 'bastos-6', captura: [] },
    ];
    expect(decide(v, acciones)).toEqual(acciones[1]);
  });
});

// ── Garantías ────────────────────────────────────────────────────────────────

describe('garantías de la IA de la Escoba', () => {
  const configs: ConfigEscoba[] = [
    { ...CONFIG_ESCOBA_POR_DEFECTO, puntosPartida: 15 },
    { jugadores: 2, puntosPartida: 15, capturaObligatoria: true, escobaInicial: false },
    { jugadores: 4, puntosPartida: 15, capturaObligatoria: false, escobaInicial: true },
    { jugadores: 4, puntosPartida: 15, capturaObligatoria: true, escobaInicial: true },
  ];

  it('1.000 partidas entre IAs terminan sin acciones ilegales', () => {
    for (let i = 0; i < 1_000; i++) {
      const config = configs[i % configs.length]!;
      const agentes = Array.from({ length: config.jugadores }, (_, a) =>
        (i + a) % 3 === 0 ? azarDe : iaEscobaBasica,
      );
      const { final } = jugarPartida(config, `sim-${i}`, agentes);
      expect(escoba.resultado(final)).not.toBeNull();
    }
  });

  it('la IA básica gana claramente más de la mitad de 1.000 manos contra el azar', () => {
    let ganadas = 0;
    let perdidas = 0;
    for (let i = 0; i < 1_000; i++) {
      const ia = i % 2;
      const agentes = ia === 0 ? [iaEscobaBasica, azarDe] : [azarDe, iaEscobaBasica];
      const { final } = jugarPartida(
        CONFIG_ESCOBA_POR_DEFECTO,
        `contra-${i}`,
        agentes,
        (e) => e.resultadosManos.length > 0,
      );
      const [r] = final.resultadosManos;
      const propio = r!.puntos[ia]!.total;
      const rival = r!.puntos[1 - ia]!.total;
      if (propio > rival) ganadas++;
      else if (propio < rival) perdidas++;
    }
    expect(ganadas).toBeGreaterThan(600);
    expect(ganadas).toBeGreaterThan(perdidas * 1.5);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const r = escoba.crear(CONFIG_ESCOBA_POR_DEFECTO, 'repro');
    if (!r.ok) throw new Error(r.error);
    const v = escoba.vistaDe(r.valor, r.valor.turno);
    const acciones = escoba.accionesLegales(r.valor, r.valor.turno);
    for (const agente of [iaEscobaBasica, azarDe]) {
      const a = agente.decidir(v, acciones, crearAzar('semilla-ia'));
      const b = agente.decidir(
        JSON.parse(JSON.stringify(v)) as VistaEscoba,
        [...acciones],
        crearAzar('semilla-ia'),
      );
      expect(b).toEqual(a);
    }
  });

  it('decide en menos de 500 ms en cualquier momento de la partida', () => {
    for (const config of configs) {
      const agentes = Array.from({ length: config.jugadores }, () => iaEscobaBasica);
      const { maxMs } = jugarPartida(config, 'tiempo', agentes);
      expect(maxMs).toBeLessThan(500);
    }
  });
});
