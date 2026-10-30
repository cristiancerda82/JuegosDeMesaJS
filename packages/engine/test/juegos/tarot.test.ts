import { describe, expect, it } from 'vitest';
import { BARAJA_TAROT, type IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  cartasLegalesTarot,
  ganadoraTarot,
  mediosTarot,
  puntuarManoTarot,
  tarot,
  type AccionTarot,
  type BazaTarot,
  type ConfigTarot,
  type EstadoTarot,
} from '../../src/juegos/tarot';
import { describirContrato } from '../contrato/verificar-contrato';

/**
 * Cartas en notación corta: «Kp» es el Rey de picas (C es el Caballo); «t21» el 21 de triunfo y
 * «E» la Excusa.
 */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13, C: 14 };
  return texto.split(' ').map((t) => {
    if (t === 'E') return 'excusa';
    if (t.startsWith('t') && /^t\d+$/.test(t)) return `triunfo-${t.slice(1)}` as IdCarta;
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;
const mesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(config: ConfigTarot = { jugadores: 4 }, semilla = 'tarot'): EstadoTarot {
  const r = tarot.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoTarot, accion: AccionTarot): EstadoTarot {
  const r = aplicar(tarot, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const legales = (e: EstadoTarot) => tarot.accionesLegales(e, e.turno);

describe('reparto', () => {
  it('con 4: 18 cartas a cada uno y 6 al perro; habla primero el siguiente al repartidor', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([18, 18, 18, 18]);
    expect(e.perro).toHaveLength(6);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
    expect(new Set([...e.manos.flat(), ...e.perro]).size).toBe(78);
  });

  it('con 3: 24 y 6; con 5: 15 y 3', () => {
    expect(nueva({ jugadores: 3 }).manos.map((m) => m.length)).toEqual([24, 24, 24]);
    const cinco = nueva({ jugadores: 5 });
    expect(cinco.manos.map((m) => m.length)).toEqual([15, 15, 15, 15, 15]);
    expect(cinco.perro).toHaveLength(3);
  });

  it('nunca queda nadie con el Petit seco', () => {
    for (let i = 0; i < 300; i++) {
      for (const m of nueva({ jugadores: 5 }, `seco-${i}`).manos) {
        const triunfos = m.filter((x) => x.startsWith('triunfo-') || x === 'excusa');
        expect(triunfos.length === 1 && triunfos[0] === 'triunfo-1').toBe(false);
      }
    }
  });

  it('la baraja suma 91 puntos', () => {
    expect(BARAJA_TAROT.reduce((s, x) => s + mediosTarot(x), 0)).toBe(182);
  });
});

describe('subasta', () => {
  it('solo se puede pasar o subir', () => {
    let e = nueva();
    e = jugar(e, { tipo: 'pujar', contrato: 'garde' });
    expect(legales(e)).toEqual([
      { tipo: 'pasar' },
      { tipo: 'pujar', contrato: 'gardeSans' },
      { tipo: 'pujar', contrato: 'gardeContre' },
    ]);
  });

  it('si todos pasan la mano es nula y se reparte la siguiente', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = jugar(e, { tipo: 'pasar' });
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.resultadosManos[0]!.nula).toBe(true);
    expect(e.puntos).toEqual([0, 0, 0, 0]);
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('subasta');
    expect(e.turno).toBe(1);
  });

  it('Garde: el preneur se queda el perro, que se ve, y descarta 6', () => {
    let e = nueva();
    const perro = e.perro;
    e = jugar(e, { tipo: 'pasar' });
    e = jugar(e, { tipo: 'pujar', contrato: 'garde' });
    e = jugar(e, { tipo: 'pasar' });
    e = jugar(e, { tipo: 'pasar' });
    expect(e.preneur).toBe(1);
    expect(e.contrato).toBe('garde');
    expect(e.fase).toBe('descarte');
    expect(e.manos[1]).toHaveLength(24);
    expect(tarot.vistaDe(e, 3).perro).toEqual(perro);
    for (let i = 0; i < 6; i++) e = jugar(e, legales(e)[0]!);
    expect(e.fase).toBe('bazas');
    expect(e.manos[1]).toHaveLength(18);
    expect(e.turno).toBe(0);
  });

  it('Garde sans: nadie ve el perro', () => {
    let e = nueva();
    e = jugar(e, { tipo: 'pujar', contrato: 'gardeSans' });
    for (let i = 0; i < 3; i++) e = jugar(e, { tipo: 'pasar' });
    expect(e.fase).toBe('bazas');
    expect(tarot.vistaDe(e, 0).perro).toBeNull();
    expect(e.manos[0]).toHaveLength(18);
  });
});

describe('descarte', () => {
  it('ni Reyes ni oudlers; triunfos solo si no queda otra cosa', () => {
    const base = nueva();
    const e: EstadoTarot = {
      ...base,
      fase: 'descarte',
      contrato: 'petite',
      preneur: 0,
      turno: 0,
      perro: c('2p 3p 4p 5p 6p 7p'),
      manos: [c('Kp Kc t1 t21 E t5 t6 2c 3c'), [], [], []],
    };
    const cartas = legales(e).map((a) => (a.tipo === 'descartar' ? a.carta : ''));
    // 2 normales y faltan 6: se pueden los triunfos que no son oudlers.
    expect(cartas.sort()).toEqual(c('2c 3c t5 t6').sort());
    const sinTriunfos = { ...e, manos: [c('Kp t1 2c 3c 4c 5c 6c 7c'), [], [], []] };
    expect(
      legales(sinTriunfos)
        .map((a) => (a.tipo === 'descartar' ? a.carta : ''))
        .sort(),
    ).toEqual(c('2c 3c 4c 5c 6c 7c').sort());
  });

  it('los demás solo ven los triunfos descartados', () => {
    const e: EstadoTarot = {
      ...nueva(),
      fase: 'bazas',
      contrato: 'garde',
      preneur: 0,
      descarte: c('7p t5'),
    };
    expect(tarot.vistaDe(e, 1).descarte).toEqual(c('t5'));
    expect(tarot.vistaDe(e, 0).descarte).toEqual(c('7p t5'));
  });
});

describe('llamada al Rey con 5', () => {
  function subastada(semilla = 'cinco'): EstadoTarot {
    let e = nueva({ jugadores: 5 }, semilla);
    e = jugar(e, { tipo: 'pujar', contrato: 'garde' });
    for (let i = 0; i < 4; i++) e = jugar(e, { tipo: 'pasar' });
    return e;
  }

  it('el preneur llama a un Rey que no tiene y quien lo tiene es su pareja secreta', () => {
    let e = subastada();
    expect(e.fase).toBe('llamada');
    const llamables = legales(e).map((a) => (a.tipo === 'llamar' ? a.carta : ''));
    expect(llamables.every((x) => x.endsWith('-13'))).toBe(true);
    expect(llamables.some((x) => e.manos[0]!.includes(x as IdCarta))).toBe(false);
    const carta = llamables.find((x) => !e.perro.includes(x as IdCarta)) as IdCarta;
    e = jugar(e, { tipo: 'llamar', carta });
    const pareja = e.manos.findIndex((m) => m.includes(carta));
    expect(e.pareja).toBe(pareja);
    const otro = [1, 2, 3, 4].find((a) => a !== pareja)!;
    expect(tarot.vistaDe(e, otro).pareja).toBeNull();
    expect(tarot.vistaDe(e, pareja).pareja).toBe(pareja);
  });

  it('con el Rey llamado en el perro juega solo', () => {
    const base = subastada();
    const e: EstadoTarot = {
      ...base,
      perro: c('Kc 2p 3p'),
      manos: base.manos.map((m) => m.filter((x) => x !== 'corazones-13')),
    };
    const r = jugar(e, { tipo: 'llamar', carta: una('Kc') });
    expect(r.pareja).toBeNull();
    expect(tarot.vistaDe(r, 2).bandos).toEqual([
      'ataque',
      'defensa',
      'defensa',
      'defensa',
      'defensa',
    ]);
  });
});

describe('bazas', () => {
  it('sin el palo hay que fallar y subir', () => {
    const legales = cartasLegalesTarot(c('t5 t15 2p'), mesa([0, 'Kc'], [1, 't12']));
    expect(legales).toEqual(c('t15'));
  });

  it('con el palo hay que seguirlo (o jugar la Excusa)', () => {
    expect(cartasLegalesTarot(c('2p t5 E'), mesa([0, 'Kp'])).sort()).toEqual(c('2p E').sort());
  });

  it('con triunfo de salida hay que subir si se puede', () => {
    expect(cartasLegalesTarot(c('t3 t9 Kp'), mesa([0, 't7']))).toEqual(c('t9'));
    expect(cartasLegalesTarot(c('t3 Kp'), mesa([0, 't7']))).toEqual(c('t3'));
  });

  it('gana el triunfo más alto o la más alta del palo; la Excusa nunca', () => {
    expect(ganadoraTarot(mesa([0, 'Qp'], [1, 'Kp'], [2, 'Cp'], [3, '2c'])).asiento).toBe(1);
    expect(ganadoraTarot(mesa([0, 'Kp'], [1, 't1'], [2, 'Cp'])).asiento).toBe(1);
    expect(ganadoraTarot(mesa([0, 'E'], [1, '3c'], [2, 'Kc'])).asiento).toBe(2);
    expect(ganadoraTarot(mesa([0, 'Cp'], [1, 'Qp'])).asiento).toBe(1);
  });

  it('tras la Excusa, la siguiente carta marca el palo', () => {
    expect(cartasLegalesTarot(c('2c 2p'), mesa([0, 'E'], [1, '5c']))).toEqual(c('2c'));
  });
});

describe('poignée', () => {
  it('en el primer turno, con 10 triunfos o más (con 4), se enseñan los 10 más bajos', () => {
    const base = nueva();
    const mano = c('t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t20 2p 3p 4p 5p 6p 7p 8p');
    let e: EstadoTarot = {
      ...base,
      fase: 'bazas',
      contrato: 'garde',
      preneur: 1,
      turno: 0,
      manos: [mano, base.manos[1]!, base.manos[2]!, base.manos[3]!],
    };
    expect(legales(e)[0]).toEqual({ tipo: 'poignee', nivel: 1 });
    e = jugar(e, { tipo: 'poignee', nivel: 1 });
    expect(e.poignees).toEqual([
      { asiento: 0, nivel: 1, cartas: c('t2 t3 t4 t5 t6 t7 t8 t9 t10 t11') },
    ]);
    expect(legales(e).some((a) => a.tipo === 'poignee')).toBe(false);
  });
});

describe('puntos de la mano', () => {
  /** Una mano de 4 terminada: el ataque (preneur 0) gana `ataque` y la defensa el resto. */
  function cerrada(parcial: Partial<EstadoTarot>, bazas: BazaTarot[]): EstadoTarot {
    return {
      ...nueva(),
      fase: 'bazas',
      contrato: 'petite',
      preneur: 0,
      manos: [[], [], [], []],
      descarte: [],
      bazas,
      ...parcial,
    };
  }
  /** Bazas que reparten estas cartas: las del ataque las gana el 0, las demás el 1. */
  const bazasDe = (ataque: string, defensa: string): BazaTarot[] => {
    const trozos = (t: string, ganador: number) => {
      const cs = c(t);
      const r: BazaTarot[] = [];
      for (let i = 0; i < cs.length; i += 4) {
        // En las bazas de la defensa solo juegan defensores: así la Excusa es suya.
        r.push({
          ganador,
          cartas: cs
            .slice(i, i + 4)
            .map((carta, k) => ({ asiento: ganador === 0 ? k : 1 + (k % 3), carta })),
        });
      }
      return r;
    };
    return [...trozos(ataque, 0), ...trozos(defensa, 1)];
  };
  /** Todas las cartas menos las indicadas, para la defensa. */
  const resto = (ataque: string) => {
    const usadas = new Set(c(ataque));
    return BARAJA_TAROT.filter((x) => !usadas.has(x))
      .map((x) => {
        if (x === 'excusa') return 'E';
        if (x.startsWith('triunfo-')) return `t${x.slice(8)}`;
        const [palo, v] = x.split('-');
        const letra =
          ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K', 14: 'C' } as Record<string, string>)[v!] ?? v;
        return `${letra}${palo![0]}`;
      })
      .join(' ');
  };

  it('Petite ganada con dos oudlers y 47 puntos: vale 31', () => {
    // t1 y t21 (4,5 + 4,5), 4 Reyes (18), 4 Damas (14), 2 Caballos (5) y 2 de medio punto: 47.
    const ataque = 't1 t21 Kp Kc Kd Kt Qp Qc Qd Qt Cp Cc 2p 3p';
    const r = puntuarManoTarot(cerrada({}, bazasDe(ataque, resto(ataque))));
    expect(r.oudlers).toBe(2);
    expect(r.mediosAtaque).toBe(94);
    expect(r.necesarios).toBe(41);
    expect(r.gana).toBe(true);
    expect(r.valor).toBe(31);
    expect(r.cambio).toEqual([93, -31, -31, -31]);
  });

  it('Garde perdida por 2,5 con un oudler: vale −56', () => {
    // t21 (4,5), 4 Reyes (18), 4 Damas (14), 4 Caballos (10), una Sota (1,5) y un 2 (0,5): 48,5.
    const ataque = 't21 Kp Kc Kd Kt Qp Qc Qd Qt Cp Cc Cd Ct Jp 2c';
    const r = puntuarManoTarot(cerrada({ contrato: 'garde' }, bazasDe(ataque, resto(ataque))));
    expect(r.mediosAtaque).toBe(97);
    expect(r.gana).toBe(false);
    expect(r.diferencia).toBe(3);
    expect(r.valor).toBe(-56);
    expect(r.cambio).toEqual([-168, 56, 56, 56]);
  });

  it('petit au bout: 10 por el multiplicador para el bando que gana la última baza con el Petit', () => {
    const ataque = 't21 Kp Kc Kd Kt 2p 3p 4p';
    const bazas = bazasDe(ataque, resto(`${ataque} t1 2c 3c 4c`));
    bazas.push({ ganador: 0, cartas: mesa([0, 't1'], [1, '2c'], [2, '3c'], [3, '4c']) });
    const r = puntuarManoTarot(cerrada({}, bazas));
    expect(r.petitAuBout).toBe('ataque');
    const sin = puntuarManoTarot(
      cerrada({}, bazasDe(`${ataque} t1 2c 3c 4c`, resto(`${ataque} t1 2c 3c 4c`))),
    );
    expect(r.valor - sin.valor).toBe(10);
  });

  it('la Excusa vuelve a su bando, que da medio punto al ganador', () => {
    const ataque = 'Kp';
    const bazas = bazasDe(ataque, resto(`${ataque} E 2c 3c 4c`));
    // La juega el preneur (0) y gana la baza el 1.
    bazas.push({ ganador: 1, cartas: mesa([0, 'E'], [1, '2c'], [2, '3c'], [3, '4c']) });
    const r = puntuarManoTarot(cerrada({}, bazas));
    expect(r.mediosAtaque).toBe(9 + 8);
    expect(r.oudlers).toBe(1);
  });

  it('con 5 y pareja: el preneur cobra el doble y la pareja el valor', () => {
    const r = puntuarManoTarot({
      ...cerrada({}, bazasDe('t1 t21 Kp Kc Kd Kt Qp Qc Qd Qt Cp Cc 2p 3p', '')),
      config: { jugadores: 5 },
      puntos: [0, 0, 0, 0, 0],
      pareja: 3,
    });
    expect(r.cambio).toEqual([2 * r.valor, -r.valor, -r.valor, r.valor, -r.valor]);
    expect(r.cambio.reduce((s, x) => s + x, 0)).toBe(0);
  });

  it('la poignée vale para el bando que gana, sin multiplicar', () => {
    const ataque = 't1 t21 Kp Kc Kd Kt Qp Qc Qd Qt Cp Cc 2p 3p';
    const r = puntuarManoTarot(
      cerrada(
        { contrato: 'garde', poignees: [{ asiento: 1, nivel: 1, cartas: [] }] },
        bazasDe(ataque, resto(ataque)),
      ),
    );
    expect(r.valor).toBe(31 * 2 + 20);
  });
});

describe('ronda y vista', () => {
  it('la partida dura dos manos por jugador', () => {
    let e = nueva({ jugadores: 3 });
    for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) e = jugar(e, { tipo: 'pasar' });
    expect(e.resultadosManos).toHaveLength(6);
    expect(tarot.resultado(e)).toEqual({ ganadores: [0, 1, 2], empate: true, puntos: [0, 0, 0] });
  });

  it('cada uno ve su mano y cuántas tienen los demás', () => {
    const v = tarot.vistaDe(nueva(), 0);
    expect(v.miMano).toHaveLength(18);
    expect(v.cartasEnMano).toEqual([18, 18, 18, 18]);
    expect(v.perro).toBeNull();
    expect(v.enPerro).toBe(6);
  });
});

describirContrato(tarot, {
  configs: [{ jugadores: 3 }, { jugadores: 4 }, { jugadores: 5 }],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(asiento === null ? [] : e.manos[asiento]!),
      ...e.bazas.flatMap((b) => b.cartas.map((j) => j.carta)),
      ...e.mesa.map((j) => j.carta),
      ...e.poignees.flatMap((p) => p.cartas),
      // La carta llamada se nombra a todos, aunque no se sepa quién la tiene.
      ...(e.llamada ? [e.llamada] : []),
      ...((e.contrato === 'petite' || e.contrato === 'garde') &&
      (e.fase === 'descarte' || e.fase === 'bazas')
        ? e.perro
        : []),
      ...e.descarte.filter((x) => x.startsWith('triunfo-')),
      ...(asiento !== null && asiento === e.preneur ? e.descarte : []),
    ]);
    return [
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
      ...e.perro,
      ...e.descarte,
    ].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 400,
});
