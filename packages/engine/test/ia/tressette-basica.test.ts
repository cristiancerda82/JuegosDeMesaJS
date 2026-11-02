import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTressetteBasica } from '../../src/ia/tressette-basica';
import {
  CONFIG_TRESSETTE_POR_DEFECTO,
  tressette,
  type AccionTressette,
  type ConfigTressette,
  type EstadoTressette,
  type VistaTressette,
} from '../../src/juegos/tressette';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos; S, C y R. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

/** Un estado armado; con `resto` las cartas que no se usan siguen en alguna mano, no jugadas. */
function preparado(manos: string[], parcial: Partial<EstadoTressette>): EstadoTressette {
  const r = tressette.crear(CONFIG_TRESSETTE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, manos: manos.map(c), fallos: [[], [], [], []], ...parcial };
}

/** Todas las cartas que no están en `usadas`, para rellenar una mano y que nada cuente como jugado. */
function resto(...usadas: string[]): string {
  const fuera = new Set(usadas.flatMap((t) => c(t)));
  const palos = ['o', 'c', 'e', 'b'];
  const valores = ['A', '2', '3', '4', '5', '6', '7', 'S', 'C', 'R'];
  return palos
    .flatMap((p) => valores.map((v) => `${v}${p}`))
    .filter((t) => !fuera.has(una(t)))
    .join(' ');
}

const decide = (e: EstadoTressette) =>
  iaTressetteBasica.decidir(
    tressette.vistaDe(e, e.turno),
    tressette.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Tressette', () => {
  it('sale con la más alta que queda', () => {
    const mia = '3o Ao 5c';
    const e = preparado([mia, resto(mia), '', ''], { turno: 0, mesa: [] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('3o') });
  });

  it('carga a su compañero', () => {
    // El 0 va ganando con el 3 de copas; responde su compañero, el 2.
    const mia = 'Ac 4c';
    const mesa = '3c 5c';
    const e = preparado(['', resto(mia, mesa), mia, ''], {
      turno: 2,
      mesa: [
        { asiento: 0, carta: una('3c') },
        { asiento: 1, carta: una('5c') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ac') });
  });

  it('gana con lo justo', () => {
    // Un rival gana la baza de oros con el rey; la IA, el 3, es la última.
    const mia = '2o 3o';
    const mesa = 'Ro 4o 5o';
    const e = preparado([resto(mia, mesa), '', '', mia], {
      turno: 3,
      mesa: [
        { asiento: 0, carta: una('Ro') },
        { asiento: 1, carta: una('4o') },
        { asiento: 2, carta: una('5o') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('2o') });
  });

  it('sin la más alta, sale con la más baja de su palo más largo', () => {
    const mia = '4c 7c Rc 5o';
    const e = preparado([mia, resto(mia), '', ''], { turno: 0, mesa: [] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('4c') });
  });
});

describe('IA difícil del Tressette', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = tressette.crear(CONFIG_TRESSETTE_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = tressette.vistaDe(e, e.turno);
    const acciones = tressette.accionesLegales(e, e.turno);
    expect(IAS.tressette.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.tressette.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Tressette', () => {
  const azar = aleatorio<VistaTressette, AccionTressette>();
  // A 11, para que las 100 partidas no sean tan largas.
  const corta: ConfigTressette = { jugadores: 4, meta: 11 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      tressette,
      corta,
      iaTressetteBasica,
      IAS.tressette.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      tressette,
      CONFIG_TRESSETTE_POR_DEFECTO,
      iaTressetteBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      tressette,
      CONFIG_TRESSETTE_POR_DEFECTO,
      IAS.tressette.dificil,
      iaTressetteBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
