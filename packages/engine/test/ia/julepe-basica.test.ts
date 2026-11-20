import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaJulepeBasica } from '../../src/ia/julepe-basica';
import {
  CONFIG_JULEPE_POR_DEFECTO,
  julepe,
  type AccionJulepe,
  type EstadoJulepe,
  type VistaJulepe,
} from '../../src/juegos/julepe';
import { duelo, unoContraTodos } from './duelo';

const azarDe = aleatorio<VistaJulepe, AccionJulepe>();

/** Partida de 4 con la mano del asiento 0 cambiada y triunfo en oros. */
function conMano(mano: IdCarta[]): EstadoJulepe {
  const r = julepe.crear(CONFIG_JULEPE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const e = r.valor;
  return {
    ...e,
    manos: e.manos.map((m, a) => (a === 0 ? mano : m)),
    triunfo: 'oros',
    cartaTriunfo: null,
  };
}

const decide = (e: EstadoJulepe) =>
  iaJulepeBasica.decidir(
    julepe.vistaDe(e, e.turno),
    julepe.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Julepe', () => {
  it('pasa sin juego', () => {
    expect(decide(conMano(['copas-2', 'copas-4', 'espadas-5', 'bastos-6', 'bastos-7']))).toEqual({
      tipo: 'pasar',
    });
  });

  it('juega con triunfos altos', () => {
    expect(decide(conMano(['oros-1', 'oros-3', 'copas-1', 'bastos-6', 'bastos-7']))).toEqual({
      tipo: 'jugar',
    });
  });

  it('descarta lo que no es triunfo, As ni Tres', () => {
    let e = conMano(['oros-5', 'copas-3', 'espadas-1', 'bastos-6', 'bastos-7']);
    e = { ...e, fase: 'descartar', juega: [true, false, false, true], turno: 0 };
    const a = decide(e);
    expect(a.tipo).toBe('descartar');
    if (a.tipo === 'descartar') expect([...a.cartas].sort()).toEqual(['bastos-6', 'bastos-7']);
  });

  it('gana la baza con la carta más barata que la gane', () => {
    let e = conMano(['copas-1', 'copas-12', 'copas-4', 'oros-2', 'espadas-4']);
    e = {
      ...e,
      fase: 'jugar',
      juega: [true, true, false, false],
      turno: 0,
      mesa: [{ asiento: 1, carta: 'copas-11' }],
    };
    expect(decide(e)).toEqual({ tipo: 'carta', carta: 'copas-12' });
  });
});

describe('IA básica del Julepe con bailarla y la defensa del bote', () => {
  const OPCIONES = { ...CONFIG_JULEPE_POR_DEFECTO, bailarla: true, defensa: true };

  /** El que reparte (asiento 3), a punto de bailarla o mirar, con esta muestra. */
  function conMuestra(muestra: IdCarta): EstadoJulepe {
    const r = julepe.crear(OPCIONES, 'ia');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const otras = e.manos[3]!.filter((c) => c !== e.cartaTriunfo).slice(0, 4);
    return {
      ...e,
      manos: e.manos.map((m, a) =>
        a === 3 ? [...otras.filter((c) => c !== muestra), muestra] : m,
      ),
      cartaTriunfo: muestra,
      triunfo: muestra.split('-')[0] as EstadoJulepe['triunfo'],
    };
  }

  it('la baila con un As o un Tres de muestra, y si no, mira', () => {
    expect(decide(conMuestra('copas-1'))).toEqual({ tipo: 'bailar' });
    expect(decide(conMuestra('copas-3'))).toEqual({ tipo: 'bailar' });
    expect(decide(conMuestra('copas-12'))).toEqual({ tipo: 'mirar' });
  });

  it('al defender el bote, suelta su peor carta', () => {
    const r = julepe.crear(OPCIONES, 'ia');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoJulepe = {
      ...r.valor,
      fase: 'descartar',
      triunfo: 'oros',
      cartaTriunfo: null,
      defiende: true,
      juega: [true, false, false, true],
      cambios: [0, null, null, null],
      turno: 3,
      manos: r.valor.manos.map((m, a) =>
        a === 3 ? ['oros-5', 'oros-7', 'copas-1', 'espadas-3', 'bastos-4', 'oros-2'] : m,
      ),
    };
    expect(decide(e)).toEqual({ tipo: 'descartar', cartas: ['bastos-4'] });
    // Si todas son buenas, la más baja.
    const buenas: EstadoJulepe = {
      ...e,
      manos: e.manos.map((m, a) =>
        a === 3 ? ['oros-5', 'oros-7', 'copas-1', 'espadas-3', 'oros-2', 'bastos-1'] : m,
      ),
    };
    expect(decide(buenas)).toEqual({ tipo: 'descartar', cartas: ['oros-2'] });
  });

  it('partidas entre IAs de 3 a 6 con las opciones terminan sin acciones ilegales', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      const r = duelo(
        julepe,
        { ...OPCIONES, jugadores, manos: 6 },
        iaJulepeBasica,
        IAS.julepe.facil,
        40,
        unoContraTodos(jugadores),
        `opciones-${jugadores}`,
      );
      expect(r.partidas).toBe(40);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('con las opciones, gana claramente más de lo que le toca contra el azar', () => {
    const r = duelo(julepe, OPCIONES, iaJulepeBasica, azarDe, 300, unoContraTodos(4), 'azar-opc');
    expect(r.ganadas).toBeGreaterThan(150);
  });
});

describe('garantías de la IA del Julepe', () => {
  it('500 partidas entre IAs de 3 a 6 terminan sin acciones ilegales', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      const r = duelo(
        julepe,
        { jugadores, manos: 6 },
        iaJulepeBasica,
        iaJulepeBasica,
        110,
        unoContraTodos(jugadores),
        `entre-${jugadores}`,
      );
      expect(r.partidas).toBe(110);
    }
    const mezcla = duelo(
      julepe,
      { jugadores: 5, manos: 6 },
      iaJulepeBasica,
      azarDe,
      60,
      (a, i) => (a + i) % 2 === 0,
      'mezcla',
    );
    expect(mezcla.partidas).toBe(60);
  });

  it('gana claramente más de lo que le toca contra el azar', () => {
    const r = duelo(
      julepe,
      CONFIG_JULEPE_POR_DEFECTO,
      iaJulepeBasica,
      azarDe,
      500,
      unoContraTodos(4),
      'contra-azar',
    );
    expect(r.ganadas).toBeGreaterThan(250);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano(['oros-1', 'oros-3', 'copas-1', 'bastos-6', 'bastos-7']);
    const v = julepe.vistaDe(e, 0);
    const acciones = julepe.accionesLegales(e, 0);
    const a = iaJulepeBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaJulepeBasica.decidir(
      JSON.parse(JSON.stringify(v)) as VistaJulepe,
      [...acciones],
      crearAzar('s'),
    );
    expect(b).toEqual(a);
  });
});
