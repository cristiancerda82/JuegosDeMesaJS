import { describe, expect, it } from 'vitest';
import { crearAzar, type EstadoAzar } from '../../src/baraja/azar';
import { barajar } from '../../src/baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import type { Agente } from '../../src/ia/agente';
import { conErrores, porSimulacion, type Simulable } from '../../src/ia/niveles';
import {
  juguete,
  type AccionJuguete,
  type ConfigJuguete,
  type EstadoJuguete,
  type VistaJuguete,
} from '../contrato/juego-juguete';
import { describirReconstruccion } from '../contrato/verificar-reconstruccion';

type AgenteJuguete = Agente<VistaJuguete, AccionJuguete>;

const valor = (c: IdCarta) => cartaDeId(c)!.valor;

/** Juega siempre su carta más baja: fácil de batir pensando un poco. */
const laMasBaja: AgenteJuguete = {
  id: 'la-mas-baja',
  decidir(vista, acciones, azar) {
    const accion = [...acciones].sort((a, b) => valor(a.carta) - valor(b.carta))[0]!;
    return { accion, azar };
  },
};

/** Las manos ajenas y el mazo, al azar entre las cartas que no se ven. */
function reconstruirJuguete(vista: VistaJuguete, azar: EstadoAzar): EstadoJuguete {
  const visibles = new Set([...(vista.miMano ?? []), ...vista.mesa]);
  const { cartas } = barajar(
    crearBaraja('espanola40').filter((c) => !visibles.has(c)),
    azar,
  );
  let resto = cartas;
  const tomar = (n: number) => {
    const tomadas = resto.slice(0, n);
    resto = resto.slice(n);
    return tomadas;
  };
  const manos = vista.cartasEnMano.map((n, a) =>
    a === vista.asiento ? [...vista.miMano!] : tomar(n),
  );
  return {
    manos,
    mazo: tomar(vista.mazo),
    mesa: [...vista.mesa],
    turno: vista.turno,
    // En el juguete, quien sale es quien no ha jugado si hay una carta en la mesa.
    salida: vista.mesa.length === 1 ? 1 - vista.turno : vista.turno,
    puntos: [...vista.puntos],
  };
}

const simulable: Simulable<ConfigJuguete, EstadoJuguete, AccionJuguete, VistaJuguete> = {
  juego: juguete,
  reconstruir: reconstruirJuguete,
  manoTerminada: () => false,
  valorar: (inicio, final, asiento) =>
    final.puntos[asiento]! -
    inicio.puntos[asiento]! -
    (final.puntos[1 - asiento]! - inicio.puntos[1 - asiento]!),
  reconstrucciones: 8,
  presupuesto: 80,
};

function enfrentar(a: AgenteJuguete, b: AgenteJuguete, partidas: number): number {
  let ganadasA = 0;
  for (let i = 0; i < partidas; i++) {
    const r = juguete.crear({ cartas: 5 }, `duelo-${i}`);
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    const asientoA = i % 2;
    const azares: EstadoAzar[] = [crearAzar(`${i}/0`), crearAzar(`${i}/1`)];
    while (juguete.resultado(e) === null) {
      const t = e.turno;
      const agente = t === asientoA ? a : b;
      const d = agente.decidir(juguete.vistaDe(e, t), juguete.accionesLegales(e, t), azares[t]!);
      azares[t] = d.azar;
      e = juguete.transicion(e, t, d.accion);
    }
    if (juguete.resultado(e)!.ganadores.includes(asientoA)) ganadasA++;
  }
  return ganadasA;
}

const vistaConMano = (mano: IdCarta[]): VistaJuguete => ({
  asiento: 0,
  miMano: mano,
  cartasEnMano: [mano.length, mano.length],
  mazo: 30,
  mesa: [],
  turno: 0,
  puntos: [0, 0],
});
const accionesDe = (mano: IdCarta[]): AccionJuguete[] =>
  mano.map((carta) => ({ tipo: 'jugar', carta }));

describe('nivel fácil (conErrores)', () => {
  const mano: IdCarta[] = ['oros-1', 'oros-5', 'oros-12'];

  it('a veces se equivoca y a veces decide como la base', () => {
    const facil = conErrores(laMasBaja, 0.3);
    const elegidas = Array.from(
      { length: 200 },
      (_, i) =>
        facil.decidir(vistaConMano(mano), accionesDe(mano), crearAzar(`f${i}`)).accion.carta,
    );
    const comoLaBase = elegidas.filter((c) => c === 'oros-1').length;
    expect(comoLaBase).toBeGreaterThan(120);
    expect(comoLaBase).toBeLessThan(200);
  });

  it('solo falla en las acciones que se le permiten', () => {
    const facil = conErrores(laMasBaja, 1, (a) => a.carta !== 'oros-12');
    for (let i = 0; i < 50; i++) {
      const c = facil.decidir(vistaConMano(mano), accionesDe(mano), crearAzar(`p${i}`)).accion;
      expect(c.carta).not.toBe('oros-12');
    }
  });

  it('es reproducible', () => {
    const facil = conErrores(laMasBaja, 0.3);
    for (let i = 0; i < 20; i++) {
      const a = facil.decidir(vistaConMano(mano), accionesDe(mano), crearAzar(`r${i}`));
      const b = facil.decidir(vistaConMano(mano), accionesDe(mano), crearAzar(`r${i}`));
      expect(b).toEqual(a);
    }
  });
});

describe('nivel difícil (porSimulacion)', () => {
  const dificil = porSimulacion(laMasBaja, simulable);

  it('con una sola acción legal la elige sin simular', () => {
    const v = vistaConMano(['copas-3']);
    expect(dificil.decidir(v, accionesDe(['copas-3']), crearAzar('x')).accion.carta).toBe(
      'copas-3',
    );
  });

  it('si todas las acciones valen lo mismo, elige la de la base', () => {
    const mismoValor: typeof simulable = { ...simulable, valorar: () => 0 };
    const d = porSimulacion(laMasBaja, mismoValor);
    const mano: IdCarta[] = ['oros-12', 'oros-1', 'oros-7'];
    expect(d.decidir(vistaConMano(mano), accionesDe(mano), crearAzar('e')).accion.carta).toBe(
      'oros-1',
    );
  });

  it('es reproducible', () => {
    const mano: IdCarta[] = ['oros-12', 'copas-2', 'espadas-7', 'bastos-4', 'oros-3'];
    const a = dificil.decidir(vistaConMano(mano), accionesDe(mano), crearAzar('s'));
    const b = dificil.decidir(vistaConMano(mano), accionesDe(mano), crearAzar('s'));
    expect(b).toEqual(a);
  });

  it('juega mejor que la base contra la que simula', () => {
    // Solo cambia de acción cuando la ventaja es clara, así que gana, aunque con poco margen.
    expect(enfrentar(dificil, laMasBaja, 200)).toBeGreaterThan(100);
  });
});

describirReconstruccion(juguete, reconstruirJuguete, {
  configs: [{ cartas: 5 }],
  base: laMasBaja,
});
