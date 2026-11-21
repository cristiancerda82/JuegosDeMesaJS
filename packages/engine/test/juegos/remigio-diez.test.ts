import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import { barajar } from '../../src/baraja/barajar';
import {
  remigio,
  type AccionRemigio,
  type ConfigRemigio,
  type EstadoRemigio,
} from '../../src/juegos/remigio';
import {
  cartasRemigio,
  puntosCartaRemigio,
  type CartaRemigio,
} from '../../src/juegos/remigio-combinaciones';
import {
  cartasDeCierreRemigioDiez,
  cierreRemigioDiez,
  sueltasRemigioDiez,
} from '../../src/juegos/remigio-diez';
import { aplicar } from '../../src/motor/aplicar';

// ── Utilidades ───────────────────────────────────────────────────────────────

const DIEZ: ConfigRemigio = { jugadores: 2, diezCartas: true };

function nueva(config: Partial<ConfigRemigio> = {}, semilla = 'd'): EstadoRemigio {
  const r = remigio.crear({ ...DIEZ, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoRemigio, accion: AccionRemigio): EstadoRemigio {
  const r = aplicar(remigio, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Cartas a partir de códigos cortos: "p4" (4 de picas), "c13", "d1", "t10" y "w" (comodín). */
function mano(...codigos: string[]): CartaRemigio[] {
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  let comodines = 0;
  const usadas = new Set<string>();
  return codigos.map((x) => {
    if (x === 'w')
      return `comodin-${(comodines % 2) + 1}#${Math.floor(comodines++ / 2)}` as CartaRemigio;
    const base = `${palos[x[0]!]}-${x.slice(1)}`;
    const copia = usadas.has(`${base}#0`) ? 1 : 0;
    usadas.add(`${base}#${copia}`);
    return `${base}#${copia}` as CartaRemigio;
  });
}

/** Estado de 2 jugadores en la fase de bajar del asiento 0, con las manos dadas. */
function enBajar(manos: CartaRemigio[][]): EstadoRemigio {
  return { ...nueva(), azar: crearAzar('mesa'), manos, fase: 'bajar', turno: 0 };
}

// ── Cartas ───────────────────────────────────────────────────────────────────

describe('cartas francesas', () => {
  it('108 cartas: dos barajas de 52 y 4 comodines', () => {
    const cartas = cartasRemigio(true);
    expect(cartas).toHaveLength(108);
    expect(new Set(cartas).size).toBe(108);
    expect(cartas.filter((c) => c.startsWith('comodin'))).toHaveLength(4);
  });

  it('puntos: los números lo suyo, J 10, Q 11, K 12 y el comodín 25', () => {
    expect(mano('p1', 'c9', 't11', 'd12', 'p13', 'w').map(puntosCartaRemigio)).toEqual([
      1, 9, 10, 11, 12, 25,
    ]);
  });
});

// ── Ligar ────────────────────────────────────────────────────────────────────

describe('cartas ligadas', () => {
  it('escalera de palos distintos y grupo de cualquier palo', () => {
    expect(sueltasRemigioDiez(mano('p4', 'c5', 't6')).puntos).toBe(0);
    expect(sueltasRemigioDiez(mano('p8', 'p8', 'c8')).puntos).toBe(0);
  });

  it('el As va abajo o arriba, pero no da la vuelta', () => {
    expect(sueltasRemigioDiez(mano('p1', 'c2', 't3')).puntos).toBe(0);
    expect(sueltasRemigioDiez(mano('d12', 'p13', 'c1')).puntos).toBe(0);
    expect(sueltasRemigioDiez(mano('p13', 'p1', 'p2')).puntos).toBe(15);
  });

  it('el comodín rellena, pero cada combinación lleva 2 naturales', () => {
    expect(sueltasRemigioDiez(mano('p4', 'w', 'c6')).puntos).toBe(0);
    expect(sueltasRemigioDiez(mano('p9', 'w', 'w')).puntos).toBe(59);
    // Los comodines que sobran se añaden a una combinación.
    expect(sueltasRemigioDiez(mano('p4', 'c5', 't6', 'w')).puntos).toBe(0);
  });

  it('suma solo lo que no se liga, con la forma que deja menos', () => {
    const m = mano('p7', 'c7', 't7', 'p9', 'c13', 'p2', 'c3', 'd4', 't5', 'p6');
    const s = sueltasRemigioDiez(m);
    expect(s.puntos).toBe(21);
    expect(s.cartas).toEqual(['picas-9#0', 'corazones-13#0']);
  });

  it('en manos al azar, quitando las sueltas lo demás liga, y cerrar coincide con probar cada carta', () => {
    let azar = crearAzar('ligar');
    for (let i = 0; i < 400; i++) {
      const r = barajar(cartasRemigio(true), azar);
      azar = r.azar;
      const m = r.cartas.slice(0, 11);
      const s = sueltasRemigioDiez(m);
      expect(s.puntos).toBe(s.cartas.reduce((t, c) => t + puntosCartaRemigio(c), 0));
      expect(sueltasRemigioDiez(m.filter((c) => !s.cartas.includes(c))).puntos).toBe(0);
      expect(cartasDeCierreRemigioDiez(m, m)).toEqual(
        m.filter((c) => cierreRemigioDiez(m.filter((x) => x !== c)) !== null),
      );
    }
  });
});

describe('jugada de cierre', () => {
  it('ligadas: ×1 con comodines y ×2 sin ellos', () => {
    const sin = mano('p7', 'c7', 't7', 'p2', 'c3', 'd4', 't9', 'p10', 'c11', 'd12');
    expect(cierreRemigioDiez(sin)).toEqual({
      jugada: 'normal',
      conComodines: false,
      multiplicador: 2,
    });
    const con = mano('p7', 'c7', 'w', 'p2', 'c3', 'd4', 't9', 'p10', 'c11', 'd12');
    expect(cierreRemigioDiez(con)?.multiplicador).toBe(1);
  });

  it('color: del mismo palo o del mismo color, aunque no combinen', () => {
    const rojas = mano('c1', 'c4', 'c7', 'c9', 'c13', 'd2', 'd5', 'd8', 'd11', 'd13');
    expect(cierreRemigioDiez(rojas)).toEqual({
      jugada: 'color',
      conComodines: false,
      multiplicador: 4,
    });
    const conComodin = mano('t1', 't4', 't7', 't9', 't13', 'p2', 'p5', 'p8', 'p11', 'w');
    expect(cierreRemigioDiez(conComodin)?.multiplicador).toBe(3);
  });

  it('escalera de diez (×5 o ×6) y escalera de color (×8 o ×10)', () => {
    const escalera = mano('p2', 'c3', 'd4', 't5', 'p6', 'c7', 'd8', 't9', 'p10', 'c11');
    expect(cierreRemigioDiez(escalera)?.jugada).toBe('escalera');
    expect(cierreRemigioDiez(escalera)?.multiplicador).toBe(6);
    const conComodin = mano('p2', 'c3', 'w', 't5', 'p6', 'c7', 'd8', 't9', 'p10', 'c11');
    expect(cierreRemigioDiez(conComodin)?.multiplicador).toBe(5);
    const deColor = mano('p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11');
    expect(cierreRemigioDiez(deColor)).toEqual({
      jugada: 'escaleraColor',
      conComodines: false,
      multiplicador: 10,
    });
    const alta = mano('c5', 'c6', 'd7', 'd8', 'c9', 'c10', 'd11', 'd12', 'c13', 'c1');
    expect(cierreRemigioDiez(alta)?.jugada).toBe('escaleraColor');
    const conComodinDeColor = mano('p2', 'p3', 'w', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'w');
    expect(cierreRemigioDiez(conComodinDeColor)?.multiplicador).toBe(8);
  });

  it('sin ligar ni color, no se puede cerrar', () => {
    expect(
      cierreRemigioDiez(mano('p7', 'c7', 't7', 'p2', 'c3', 'd4', 't9', 'p10', 'c11', 'd13')),
    ).toBeNull();
  });
});

// ── Motor ────────────────────────────────────────────────────────────────────

describe('reparto y turno con diez cartas', () => {
  it('con 3 jugadores: 10 cartas francesas, 1 en el montón y 77 en el mazo', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.config).toEqual({ jugadores: 3, diezCartas: true });
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10]);
    expect(e.monton).toHaveLength(1);
    expect(e.mazo).toHaveLength(77);
    expect(e.manos.flat().every((c) => !/^(oros|copas|espadas|bastos)/.test(c))).toBe(true);
  });

  it('sin la opción, la config no la guarda y se juega con 7', () => {
    const r = remigio.crear({ jugadores: 2, diezCartas: false }, 'x');
    if (!r.ok) throw new Error(r.error);
    expect(r.valor.config).toEqual({ jugadores: 2 });
    expect(r.valor.manos[0]).toHaveLength(7);
  });

  it('no se baja: tras robar, solo descartar o cerrar', () => {
    const e = enBajar([
      mano('p5', 'c5', 't5', 'p2', 'c9', 'd13', 't1', 'p11', 'c4', 'd7', 't12'),
      mano('p3', 'c3', 't3', 'd3', 'p4', 'c6', 't8', 'p9', 'c10', 'd2'),
    ]);
    const tipos = new Set(remigio.accionesLegales(e, 0).map((a) => a.tipo));
    expect([...tipos]).toEqual(['descartar']);
  });

  it('cerrar con diez ligadas: los demás suman sus sueltas por el multiplicador', () => {
    const e = enBajar([
      // Sin comodines: ×2. Sobra la K de diamantes.
      mano('p7', 'c7', 't7', 'p2', 'c3', 'd4', 't9', 'p10', 'c11', 'd12', 'd13'),
      // Tres sietes y del 2 al 6 ligan; el 9 y la K, no: 21 puntos.
      mano('d7', 'p7', 'c7', 'p9', 'c13', 'p2', 'c3', 'd4', 't5', 'p6'),
    ]);
    const cerrar = { tipo: 'cerrar' as const, carta: 'diamantes-13#0' as CartaRemigio };
    expect(remigio.accionesLegales(e, 0)).toContainEqual(cerrar);
    // También cierra soltando el 9: del 10 a la K.
    expect(remigio.accionesLegales(e, 0).filter((a) => a.tipo === 'cerrar')).toHaveLength(2);
    const tras = hacer(e, cerrar);
    const r = tras.resultadosManos[0]!;
    expect(r.cerro).toBe(0);
    expect(r.remigio).toBe(false);
    expect(r.jugada).toBe('normal');
    expect(r.multiplicador).toBe(2);
    expect(r.puntosMano).toEqual([0, 42]);
    expect(r.sueltas).toEqual([[], ['picas-9#0', 'corazones-13#0']]);
    expect(r.manos[0]).toHaveLength(10);
    expect(tras.puntos).toEqual([0, 42]);
  });

  it('escalera de color sin comodines: los demás suman diez veces', () => {
    const e = enBajar([
      mano('p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'c1'),
      mano('d7', 'p7', 'c7', 'p9', 'c13', 'p2', 'c3', 'd4', 't5', 'p6'),
    ]);
    const tras = hacer(e, { tipo: 'cerrar', carta: 'corazones-1#0' });
    expect(tras.resultadosManos[0]!.multiplicador).toBe(10);
    expect(tras.resultadosManos[0]!.puntosMano[1]).toBe(210);
    expect(tras.eliminados[1]).toBe(true);
    expect(remigio.resultado(tras)).toEqual({ ganadores: [0], empate: false, puntos: [0, 210] });
  });
});

describe('partidas al azar con diez cartas', () => {
  it('terminan o siguen con las 108 cartas, y la vista no enseña manos ajenas', () => {
    const g = new Generador(crearAzar('azar-diez'));
    for (const jugadores of [2, 5] as const) {
      let e = nueva({ jugadores }, `azar-diez-${jugadores}`);
      for (let paso = 0; paso < 1500 && remigio.resultado(e) === null; paso++) {
        const acciones = remigio.accionesLegales(e, e.turno);
        const cierre = acciones.find((a) => a.tipo === 'cerrar');
        const utiles = acciones.filter((a) => a.tipo !== 'robarMonton');
        const lista = utiles.length > 0 ? utiles : acciones;
        e = hacer(e, cierre ?? lista[g.enteroHasta(lista.length)]!);
        expect([...e.manos.flat(), ...e.mazo, ...e.monton]).toHaveLength(108);
        if (paso % 50 === 0) {
          const v = remigio.vistaDe(e, 0);
          for (const c of e.manos.slice(1).flat()) {
            expect(JSON.stringify(v.miMano)).not.toContain(`"${c}"`);
          }
        }
      }
      expect(e.resultadosManos.length).toBeGreaterThan(0);
    }
  });
});
