import { describe, expect, it } from 'vitest';
import { crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import {
  colocar,
  CONFIG_GIN_RUMMY_POR_DEFECTO,
  ginRummy,
  marcadorFinal,
  mejorRepartoGin,
  type AccionGinRummy,
  type EstadoGinRummy,
} from '../../src/juegos/gin-rummy';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(semilla = 'gin'): EstadoGinRummy {
  const r = ginRummy.crear(CONFIG_GIN_RUMMY_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoGinRummy, accion: AccionGinRummy): EstadoGinRummy {
  const r = aplicar(ginRummy, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoGinRummy) => ginRummy.accionesLegales(e, e.turno);

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const valor = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[valor] ?? Number(valor)}` as IdCarta;
  });
}

/**
 * Una mano en juego armada a mano. El mazo, si no se da, son las cartas que sobran (la siguiente
 * que sale es la última).
 */
function enJuego(
  manos: [IdCarta[], IdCarta[]],
  parcial: Partial<EstadoGinRummy> = {},
): EstadoGinRummy {
  const descarte = parcial.descarte ?? c('2c');
  const usadas = new Set([...manos.flat(), ...descarte]);
  return {
    ...nueva(),
    manos,
    descarte,
    mazo: crearBaraja('francesa52').filter((x) => !usadas.has(x)),
    turno: 0,
    fase: 'descartar',
    pasesPrimera: 0,
    ...parcial,
  };
}

// ── Reparto y primera carta ──────────────────────────────────────────────────

describe('reparto y primera carta', () => {
  it('empieza con 10 cartas cada uno, una en el descarte y 31 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10]);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(31);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('primera');
    expect(legales(e)).toEqual([{ tipo: 'robar', desde: 'descarte' }, { tipo: 'pasar' }]);
  });

  it('si los dos pasan, el que no reparte solo puede robar del mazo', () => {
    let e = hacer(nueva(), { tipo: 'pasar' });
    expect(e.turno).toBe(1);
    expect(e.fase).toBe('primera');
    e = hacer(e, { tipo: 'pasar' });
    expect(e.turno).toBe(0);
    expect(legales(e)).toEqual([{ tipo: 'robar', desde: 'mazo' }]);
  });

  it('quien se queda la primera carta tiene 11 y no puede soltarla', () => {
    const inicio = nueva();
    const primera = inicio.descarte[0]!;
    const e = hacer(inicio, { tipo: 'robar', desde: 'descarte' });
    expect(e.manos[0]).toHaveLength(11);
    expect(e.descarte).toHaveLength(0);
    const descartes = legales(e).filter((a) => a.tipo === 'descartar');
    expect(descartes).toHaveLength(10);
    expect(descartes).not.toContainEqual({ tipo: 'descartar', carta: primera });
  });

  it('tras quedársela el que no reparte, el siguiente roba con normalidad', () => {
    let e = hacer(nueva(), { tipo: 'robar', desde: 'descarte' });
    const carta = legales(e).find((a) => a.tipo === 'descartar')!;
    e = hacer(e, carta);
    expect(e.turno).toBe(1);
    expect(legales(e)).toEqual([
      { tipo: 'robar', desde: 'mazo' },
      { tipo: 'robar', desde: 'descarte' },
    ]);
  });
});

// ── Turno ────────────────────────────────────────────────────────────────────

describe('turno', () => {
  it('la carta cogida del descarte no se puede soltar en el mismo turno', () => {
    const e = enJuego([c('Ap 2p 3p 4c 4d 4t 7t 8t 9t 6c'), c('Kc Qc Jc 5d 6d 7d 9p 9c 9d 2t')], {
      fase: 'robar',
      descarte: c('3c 7p'),
    });
    const tras = hacer(e, { tipo: 'robar', desde: 'descarte' });
    expect(tras.robadaDelDescarte).toBe('picas-7');
    expect(legales(tras)).not.toContainEqual({ tipo: 'descartar', carta: 'picas-7' });
    expect(tras.cogidas[0]).toEqual(['picas-7']);
  });

  it('robar del mazo no revela la carta y descartar pasa el turno', () => {
    const e = enJuego([c('Ap 2p 3p 4c 4d 4t 7t 8t 9t 6c'), c('Kc Qc Jc 5d 6d 7d 9p 9c 9d 2t')], {
      fase: 'robar',
    });
    let tras = hacer(e, { tipo: 'robar', desde: 'mazo' });
    expect(tras.ultimaAccion).toEqual({ asiento: 0, tipo: 'robar', desde: 'mazo', carta: null });
    expect(ginRummy.vistaDe(tras, 1).miMano).toEqual(e.manos[1]);
    tras = hacer(tras, { tipo: 'descartar', carta: 'corazones-6' });
    expect(tras.turno).toBe(1);
    expect(tras.fase).toBe('robar');
    expect(tras.descarte.at(-1)).toBe('corazones-6');
  });
});

// ── Combinaciones ────────────────────────────────────────────────────────────

describe('combinaciones y puntos sueltos', () => {
  it('el As es bajo: A-2-3 es escalera y Q-K-A no', () => {
    expect(mejorRepartoGin(c('Ac 2c 3c')).puntos).toBe(0);
    expect(mejorRepartoGin(c('Qc Kc Ac')).puntos).toBe(21);
  });

  it('elige la agrupación que deja menos puntos', () => {
    const r = mejorRepartoGin(c('7p 7c 7d 8p 9p'));
    expect(r.puntos).toBe(14);
    expect(r.sueltas).toEqual(expect.arrayContaining(c('7c 7d')));
  });

  it('los grupos son de 3 o 4 cartas', () => {
    expect(mejorRepartoGin(c('5p 5c 5d 5t')).puntos).toBe(0);
    expect(mejorRepartoGin(c('5p 5c')).puntos).toBe(10);
  });
});

// ── Cerrar y colocar ─────────────────────────────────────────────────────────

describe('cerrar y colocar', () => {
  it('no se puede cerrar si cualquier descarte deja 11 o más', () => {
    const e = enJuego([c('Ap 2p 3p 4c 4d 4t 7t 8t Kd Qc 9c'), c('Kc Jc 5d 6d 7d 9p 9d 2t 3t 6p')]);
    expect(legales(e).some((a) => a.tipo === 'cerrar')).toBe(false);
  });

  it('se puede cerrar con 10 o menos, y solo con las cartas que lo permiten', () => {
    const e = enJuego([c('Ap 2p 3p 4c 4d 4t 7t 8t 9t 6c Kd'), c('Kc Jc 5d 6d 7d 9p 9d 2t 3t 6p')]);
    const cierres = legales(e).filter((a) => a.tipo === 'cerrar');
    expect(cierres).toContainEqual({ tipo: 'cerrar', carta: 'diamantes-13' });
    expect(cierres).not.toContainEqual({ tipo: 'cerrar', carta: 'picas-1' });
  });

  it('el rival coloca en una escalera, también en cadena', () => {
    const r = colocar([c('5d 6d 7d')], c('8d 9d Kp'));
    expect(r.colocadas).toEqual(expect.arrayContaining(c('8d 9d')));
    expect(r.puntos).toBe(10);
  });

  it('el rival coloca la cuarta carta de un grupo', () => {
    const r = colocar([c('4c 4d 4t')], c('4p Kp'));
    expect(r.colocadas).toEqual(c('4p'));
    expect(r.puntos).toBe(10);
  });

  it('una carta que no está junto a la escalera no se coloca', () => {
    const r = colocar([c('5d 6d 7d')], c('9d Kp'));
    expect(r.colocadas).toEqual([]);
    expect(r.puntos).toBe(19);
  });

  it('prefiere alargar la escalera si eso deja colocar más', () => {
    // El 8 de diamantes cabe en el grupo de ochos y en la escalera, pero solo en la escalera
    // deja colocar el 9 de diamantes.
    const r = colocar([c('5d 6d 7d'), c('8p 8c 8t')], c('8d 9d'));
    expect(r.puntos).toBe(0);
  });
});

// ── Puntuación ───────────────────────────────────────────────────────────────

/** Quien cierra: A-2-3 de picas, cuatros y 7-8-9 de tréboles; la undécima carta se suelta. */
const CIERRA = 'Ap 2p 3p 4c 4d 4t 7t 8t 9t';

describe('puntuación de la mano', () => {
  it('cierre normal: gana la diferencia', () => {
    const e = enJuego([c(`${CIERRA} 6c Kd`), c('10p Jp Qp 9c 9d 9p Kt 2c 3d 5d')], {
      descarte: c('Ac'),
    });
    const tras = hacer(e, { tipo: 'cerrar', carta: 'diamantes-13' });
    const r = tras.resultadosManos.at(-1)!;
    expect(r.tipo).toBe('cierre');
    expect(r.gana).toBe(0);
    expect(r.puntosMano).toBe(14);
    expect(tras.puntos).toEqual([14, 0]);
    expect(tras.manosGanadas).toEqual([1, 0]);
  });

  it('undercut: el rival gana la diferencia más 25', () => {
    const e = enJuego([c(`${CIERRA} 8c Kd`), c('10p Jp Qp 9c 9d 9p Jc Jd Jt 5c')], {
      descarte: c('Ac'),
    });
    const tras = hacer(e, { tipo: 'cerrar', carta: 'diamantes-13' });
    const r = tras.resultadosManos.at(-1)!;
    expect(r.tipo).toBe('undercut');
    expect(r.gana).toBe(1);
    expect(r.puntosMano).toBe(28);
    expect(tras.puntos).toEqual([0, 28]);
  });

  it('gin: gana los puntos del rival más 25 y el rival no coloca', () => {
    const e = enJuego([c(`${CIERRA} 10t Kd`), c('10p Jp Qp 9c 9d 9p Jt Kc 5c 5d')], {
      descarte: c('Ac'),
    });
    const tras = hacer(e, { tipo: 'cerrar', carta: 'diamantes-13' });
    const r = tras.resultadosManos.at(-1)!;
    expect(r.tipo).toBe('gin');
    expect(r.puntosMano).toBe(55);
    expect(r.manos[1]!.colocadas).toEqual([]);
    expect(r.manos[1]!.sueltas).toContain('treboles-11');
  });

  it('tras cerrar reparte el otro jugador', () => {
    const e = enJuego([c(`${CIERRA} 6c Kd`), c('10p Jp Qp 9c 9d 9p Kt 2c 3d 5d')], {
      descarte: c('Ac'),
      repartidor: 1,
    });
    const tras = hacer(e, { tipo: 'cerrar', carta: 'diamantes-13' });
    expect(tras.repartidor).toBe(0);
    expect(tras.turno).toBe(1);
    expect(tras.fase).toBe('primera');
    expect(tras.manos.map((m) => m.length)).toEqual([10, 10]);
  });

  it('mano nula: con 2 cartas en el mazo, descartar sin cerrar no puntúa', () => {
    const base = enJuego(
      [c('Ap 3p 5c 7d 9t Jc Kd 2t 4d 6p'), c('Kc Qd Jt 10c 8d 6t 4c 2p 3c 5d')],
      {
        fase: 'robar',
        repartidor: 0,
      },
    );
    const e = { ...base, mazo: base.mazo.slice(0, 3) };
    let tras = hacer(e, { tipo: 'robar', desde: 'mazo' });
    tras = hacer(tras, { tipo: 'descartar', carta: 'diamantes-13' });
    const r = tras.resultadosManos.at(-1)!;
    expect(r.tipo).toBe('nula');
    expect(r.gana).toBeNull();
    expect(tras.puntos).toEqual([0, 0]);
    expect(tras.repartidor).toBe(0);
    expect(tras.fase).toBe('primera');
  });
});

// ── Partida ──────────────────────────────────────────────────────────────────

describe('partida a 100', () => {
  it('marcador final con bonos', () => {
    const m = marcadorFinal([104, 30], [3, 2], 0);
    expect(m.map((x) => x.total)).toEqual([279, 80]);
    expect(m[0]).toMatchObject({ bonoManos: 75, bonoPartida: 100, doble: false });
  });

  it('el ganador dobla si el rival no ganó ninguna mano', () => {
    const m = marcadorFinal([110, 0], [2, 0], 0);
    expect(m[0]!.doble).toBe(true);
    expect(m[0]!.total).toBe((110 + 50 + 100) * 2);
  });

  it('la partida termina al llegar a 100', () => {
    const e = enJuego([c(`${CIERRA} 6c Kd`), c('10p Jp Qp 9c 9d 9p Kt 2c 3d 5d')], {
      descarte: c('Ac'),
      puntos: [90, 20],
      manosGanadas: [3, 1],
    });
    const tras = hacer(e, { tipo: 'cerrar', carta: 'diamantes-13' });
    expect(tras.puntos).toEqual([104, 20]);
    const fin = ginRummy.resultado(tras)!;
    expect(fin.ganadores).toEqual([0]);
    expect(fin.puntos).toEqual([104 + 100 + 100, 20 + 25]);
    expect(ginRummy.accionesLegales(tras, 0)).toEqual([]);
    expect(ginRummy.vistaDe(tras, 0).turno).toBeNull();
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('muestra las cartas que el rival cogió del descarte, pero no su mano', () => {
    const e = enJuego([c('Ap 2p 3p 4c 4d 4t 7t 8t 9t 6c'), c('Kc Qc Jc 5d 6d 7d 9p 9c 9d 2t')], {
      fase: 'robar',
      turno: 1,
      descarte: c('3c Kt'),
    });
    const tras = hacer(e, { tipo: 'robar', desde: 'descarte' });
    const vista = ginRummy.vistaDe(tras, 0);
    expect(vista.cogidas[1]).toEqual(['treboles-13']);
    expect(vista.cartasEnMano).toEqual([10, 11]);
    expect(vista.descarte).toEqual(c('3c'));
    expect(JSON.stringify(vista)).not.toContain('corazones-12');
  });
});

describe('configuración', () => {
  it('solo admite 2 jugadores', () => {
    expect(ginRummy.crear({ jugadores: 3 } as never, 'x').ok).toBe(false);
  });
});

describirContrato(ginRummy, {
  configs: [CONFIG_GIN_RUMMY_POR_DEFECTO],
  // Cada mano se baraja la baraja entera: las cartas de las manos anteriores, que se ven en sus
  // resultados, vuelven al mazo.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(
      e.resultadosManos.flatMap((r) => r.manos.flatMap((m) => m.cartas)),
    );
    const ocultas = [
      ...e.mazo,
      ...[0, 1]
        .filter((a) => a !== asiento)
        .flatMap((a) => e.manos[a]!.filter((x) => !e.cogidas[a]!.includes(x))),
    ];
    return ocultas.filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
