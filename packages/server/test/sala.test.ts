import {
  crearAzar,
  IDS_JUEGOS_EN_RED,
  JUEGOS_EN_RED,
  type IdJuegoRed,
  type NivelIA,
} from '@juegos/engine';
import { describe, expect, it } from 'vitest';
import type { MensajeServidor } from '../src/protocolo';
import { PAUSA_IA_MS, PAUSA_MAXIMA_MS, RELEVO_MS, Sala, type IdConexion } from '../src/sala';

// ── Utilidades ───────────────────────────────────────────────────────────────

/** Una sala de prueba con sus mensajes por conexión. */
function nueva(juego: IdJuegoRed = 'brisca', config?: unknown, nivel: NivelIA = 'normal') {
  const recibidos = new Map<IdConexion, MensajeServidor[]>();
  let testigos = 0;
  const deps = {
    enviar(c: IdConexion, m: MensajeServidor) {
      recibidos.set(c, [...(recibidos.get(c) ?? []), m]);
    },
    testigo: () => `testigo-${++testigos}`,
    semilla: () => `semilla-${testigos}`,
  };
  const r = Sala.crear(
    {
      codigo: 'ABCDE',
      juego,
      config: config ?? JUEGOS_EN_RED[juego].configPorDefecto,
      nivel,
      nombre: 'Ana',
      conexion: 1,
    },
    deps,
  );
  if (!r.ok) throw new Error(r.codigo);
  const ultimo = <T extends MensajeServidor['tipo']>(c: IdConexion, tipo: T) =>
    (recibidos.get(c) ?? []).filter((m) => m.tipo === tipo).at(-1) as
      Extract<MensajeServidor, { tipo: T }> | undefined;
  return { sala: r.valor, recibidos, ultimo };
}

/** Avanza el reloj despertando la sala hasta `hasta` o hasta que deje de pedirlo. */
function correr(sala: Sala, desde: number, hasta: number): number {
  let ahora = desde;
  for (let i = 0; i < 100_000; i++) {
    const espera = sala.proximoDespertar(ahora);
    if (espera === null || ahora + espera > hasta) return hasta;
    ahora += espera;
    sala.despertar(ahora);
  }
  throw new Error('La sala no se detiene');
}

// ── Crear, unirse y asientos ─────────────────────────────────────────────────

describe('crear una sala y unirse', () => {
  it('el anfitrión ocupa el asiento 0 y recibe su testigo', () => {
    const { sala, ultimo } = nueva('mus');
    expect(ultimo(1, 'entrada')).toEqual({
      tipo: 'entrada',
      codigo: 'ABCDE',
      asiento: 0,
      testigo: 'testigo-1',
    });
    expect(sala.asientos).toBe(4);
    expect(ultimo(1, 'sala')?.asientos).toEqual([
      { nombre: 'Ana', conectado: true, relevado: false },
      null,
      null,
      null,
    ]);
  });

  it('quien se une entra en el primer asiento libre, y los dos ven la sala', () => {
    const { sala, ultimo } = nueva('mus');
    expect(sala.unirse('Luis', 2, 0)).toEqual({ ok: true, valor: 1 });
    for (const c of [1, 2]) {
      expect(ultimo(c, 'sala')?.asientos.map((a) => a?.nombre ?? null)).toEqual([
        'Ana',
        'Luis',
        null,
        null,
      ]);
    }
  });

  it('opciones no válidas, sala llena y partida empezada', () => {
    const malas = Sala.crear(
      {
        codigo: 'ABCDE',
        juego: 'brisca',
        config: { jugadores: 3 },
        nivel: 'normal',
        nombre: 'A',
        conexion: 1,
      },
      { enviar: () => {}, testigo: () => 't', semilla: () => 's' },
    );
    expect(malas).toEqual({ ok: false, codigo: 'config-invalida' });
    const { sala } = nueva('brisca');
    expect(sala.unirse('Luis', 2, 0).ok).toBe(true);
    expect(sala.unirse('Eva', 3, 0)).toEqual({ ok: false, codigo: 'sala-llena' });
    const otra = nueva('mus').sala;
    otra.empezar(0, 0);
    expect(otra.unirse('Eva', 3, 0)).toEqual({ ok: false, codigo: 'empezada' });
  });

  it('cambiar de asiento antes de empezar', () => {
    const { sala, ultimo } = nueva('mus');
    sala.unirse('Luis', 2, 0);
    expect(sala.cambiarAsiento(1, 3, 0).ok).toBe(true);
    expect(ultimo(2, 'entrada')?.asiento).toBe(3);
    expect(ultimo(1, 'sala')?.asientos.map((a) => a?.nombre ?? null)).toEqual([
      'Ana',
      null,
      null,
      'Luis',
    ]);
    expect(sala.cambiarAsiento(3, 0, 0)).toEqual({ ok: false, codigo: 'asiento-ocupado' });
  });

  it('si el anfitrión se va antes de empezar, lo es el siguiente conectado', () => {
    const { sala } = nueva('mus');
    sala.unirse('Luis', 2, 0);
    sala.desconectar(0, 0);
    expect(sala.anfitrion).toBe(1);
    expect(sala.empezar(0, 0)).toEqual({ ok: false, codigo: 'no-anfitrion' });
  });
});

// ── Partida ──────────────────────────────────────────────────────────────────

describe('partida en una sala', () => {
  it('solo empieza el anfitrión; cada uno recibe su vista y sus acciones legales', () => {
    const { sala, ultimo } = nueva('brisca');
    sala.unirse('Luis', 2, 0);
    expect(sala.empezar(1, 0)).toEqual({ ok: false, codigo: 'no-anfitrion' });
    expect(sala.empezar(0, 0).ok).toBe(true);
    const j = JUEGOS_EN_RED.brisca.juego;
    for (const [c, a] of [
      [1, 0],
      [2, 1],
    ] as const) {
      const p = ultimo(c, 'partida')!;
      expect(p.vista).toEqual(j.vistaDe(sala.estado, a));
      expect(p.legales).toEqual(j.accionesLegales(sala.estado, a));
      expect(p.n).toBe(0);
    }
  });

  it('rechaza jugadas ilegales, de otro turno o sobre una vista vieja', () => {
    const { sala, ultimo } = nueva('brisca');
    sala.unirse('Luis', 2, 0);
    sala.empezar(0, 0);
    const turno = ultimo(1, 'partida')!.legales.length > 0 ? 0 : 1;
    const otro = 1 - turno;
    const legal = ultimo(turno === 0 ? 1 : 2, 'partida')!.legales[0];
    expect(sala.jugar(otro, legal, 0, 0)).toEqual({ ok: false, codigo: 'accion-ilegal' });
    expect(sala.jugar(turno, { tipo: 'jugar', carta: 'oros-99' }, 0, 0)).toEqual({
      ok: false,
      codigo: 'accion-ilegal',
    });
    expect(sala.jugar(turno, legal, 5, 0)).toEqual({ ok: false, codigo: 'desfase' });
    expect(sala.jugar(turno, legal, 0, 0).ok).toBe(true);
    expect(ultimo(1, 'partida')!.n).toBe(1);
  });

  it('los asientos libres los juega la IA tras una pausa', () => {
    const { sala, ultimo } = nueva('tute', {
      ...(JUEGOS_EN_RED.tute.configPorDefecto as object),
      jugadores: 4,
    });
    sala.unirse('Luis', 2, 0);
    sala.empezar(0, 0);
    // Sale el asiento 1... o quien toque: se juega hasta que les toque a los humanos.
    let ahora = 0;
    for (
      let i = 0;
      i < 20 &&
      ultimo(1, 'partida')!.legales.length === 0 &&
      ultimo(2, 'partida')!.legales.length === 0;
      i++
    ) {
      ahora = correr(sala, ahora, ahora + PAUSA_IA_MS);
    }
    const p = ultimo(1, 'partida')!;
    expect(p.legales.length + ultimo(2, 'partida')!.legales.length).toBeGreaterThan(0);
    // Mientras le toca a un humano, la IA no tiene nada que hacer.
    expect(sala.proximoDespertar(ahora)).toBeNull();
  });

  it('el difícil y el fácil también juegan en los asientos libres', () => {
    for (const nivel of ['facil', 'dificil'] as const) {
      const { sala, ultimo } = nueva('brisca', undefined, nivel);
      sala.empezar(0, 0);
      let ahora = 0;
      for (let i = 0; i < 50 && ultimo(1, 'partida')!.fin === null; i++) {
        const p = ultimo(1, 'partida')!;
        if (p.legales.length > 0) sala.jugar(0, p.legales[0], p.n, ahora);
        ahora = correr(sala, ahora, ahora + 5 * PAUSA_IA_MS);
      }
      expect(ultimo(1, 'partida')!.n).toBeGreaterThan(10);
    }
  });
});

// ── Conexión ─────────────────────────────────────────────────────────────────

describe('desconexión y reconexión', () => {
  /** Brisca de 2 humanos, empezada, con el turno del asiento indicado. */
  function empezada() {
    const s = nueva('brisca');
    s.sala.unirse('Luis', 2, 0);
    s.sala.empezar(0, 0);
    const turno = s.ultimo(1, 'partida')!.legales.length > 0 ? 0 : 1;
    return { ...s, turno };
  }

  it('al volver en menos de 10 s recupera el asiento, sin que haya jugado la IA', () => {
    const { sala, ultimo, turno } = empezada();
    const conexion = turno === 0 ? 1 : 2;
    const testigo = ultimo(conexion, 'entrada')!.testigo;
    sala.desconectar(turno, 0);
    expect(ultimo(turno === 0 ? 2 : 1, 'sala')!.asientos[turno]).toMatchObject({
      conectado: false,
      relevado: false,
    });
    correr(sala, 0, RELEVO_MS - 1);
    expect(sala.volver(testigo, 7, RELEVO_MS - 1)).toEqual({ ok: true, valor: turno });
    const p = ultimo(7, 'partida')!;
    expect(p.n).toBe(0);
    expect(p.legales.length).toBeGreaterThan(0);
  });

  it('si no vuelve, a los 10 s la IA juega por él', () => {
    const { sala, ultimo, turno } = empezada();
    const otra = turno === 0 ? 2 : 1;
    sala.desconectar(turno, 0);
    correr(sala, 0, RELEVO_MS + PAUSA_IA_MS);
    expect(ultimo(otra, 'partida')!.n).toBeGreaterThan(0);
    expect(ultimo(otra, 'sala')!.asientos[turno]).toMatchObject({
      conectado: false,
      relevado: true,
    });
  });

  it('un testigo que no es de la sala no entra', () => {
    const { sala } = empezada();
    expect(sala.volver('falso', 9, 0)).toEqual({ ok: false, codigo: 'testigo' });
  });

  it('antes de empezar, desconectarse deja libre el asiento', () => {
    const { sala, ultimo } = nueva('mus');
    sala.unirse('Luis', 2, 0);
    sala.desconectar(1, 0);
    expect(ultimo(1, 'sala')!.asientos[1]).toBeNull();
  });

  it('una sala sin conectados recuerda desde cuándo está vacía', () => {
    const { sala } = nueva('brisca');
    sala.empezar(0, 0);
    expect(sala.vaciaDesde).toBeNull();
    sala.desconectar(0, 500);
    expect(sala.vaciaDesde).toBe(500);
  });
});

// ── Pausas, fin y revancha ───────────────────────────────────────────────────

describe('pausas, fin y revancha', () => {
  it('con una pausa activa la IA espera, como mucho 60 s', () => {
    const { sala, ultimo } = nueva('brisca');
    sala.empezar(0, 0);
    let p = ultimo(1, 'partida')!;
    // Si sale el humano, juega para que le toque a la IA.
    if (p.legales.length > 0) sala.jugar(0, p.legales[0], p.n, 0);
    const n = ultimo(1, 'partida')!.n;
    sala.pausa(0, true, 0);
    correr(sala, 0, PAUSA_MAXIMA_MS - 1);
    expect(ultimo(1, 'partida')!.n).toBe(n);
    correr(sala, PAUSA_MAXIMA_MS - 1, PAUSA_MAXIMA_MS + PAUSA_IA_MS);
    p = ultimo(1, 'partida')!;
    expect(p.n).toBeGreaterThan(n);
  });

  it('al cerrar la pausa la IA sigue', () => {
    const { sala, ultimo } = nueva('brisca');
    sala.empezar(0, 0);
    const p = ultimo(1, 'partida')!;
    if (p.legales.length > 0) sala.jugar(0, p.legales[0], p.n, 0);
    const n = ultimo(1, 'partida')!.n;
    sala.pausa(0, true, 0);
    sala.pausa(0, false, 100);
    correr(sala, 100, 100 + PAUSA_IA_MS);
    expect(ultimo(1, 'partida')!.n).toBeGreaterThan(n);
  });

  it('al terminar, el anfitrión pide la revancha con los mismos asientos', () => {
    const { sala, ultimo } = nueva('brisca');
    sala.unirse('Luis', 2, 0);
    sala.empezar(0, 0);
    expect(sala.revancha(0, 0)).toEqual({ ok: false, codigo: 'empezada' });
    // Los dos humanos juegan su primera acción legal hasta el final.
    for (let i = 0; i < 500 && ultimo(1, 'partida')!.fin === null; i++) {
      for (const [c, a] of [
        [1, 0],
        [2, 1],
      ] as const) {
        const p = ultimo(c, 'partida')!;
        if (p.legales.length > 0) sala.jugar(a, p.legales[0], p.n, 0);
      }
    }
    expect(ultimo(2, 'partida')!.fin).not.toBeNull();
    expect(sala.revancha(1, 0)).toEqual({ ok: false, codigo: 'no-anfitrion' });
    expect(sala.revancha(0, 0).ok).toBe(true);
    expect(ultimo(2, 'partida')).toMatchObject({ partida: 2, n: 0, fin: null });
    expect(ultimo(2, 'sala')!.asientos.map((a) => a?.nombre)).toEqual(['Ana', 'Luis']);
  });
});

// ── Vistas en todos los juegos ───────────────────────────────────────────────

describe('cada asiento recibe solo su vista', () => {
  it.each(IDS_JUEGOS_EN_RED.map((id) => [id]))('%s, con humanos movidos por la IA', (id) => {
    const juego = JUEGOS_EN_RED[id].juego;
    const s = nueva(id);
    const n = s.sala.asientos;
    // Dos humanos (asientos 0 y 1); el resto, la IA del servidor.
    s.sala.unirse('Luis', 2, 0);
    s.sala.empezar(0, 0);
    const ia = JUEGOS_EN_RED[id].ias.normal;
    const azares = [crearAzar('h0'), crearAzar('h1')];
    let ahora = 0;
    for (let paso = 0; paso < 300 && s.ultimo(1, 'partida')!.fin === null; paso++) {
      // Cada mensaje de partida es exactamente la vista y las legales de su asiento.
      for (const [c, a] of [
        [1, 0],
        [2, 1],
      ] as const) {
        const p = s.ultimo(c, 'partida')!;
        expect(p.vista).toEqual(juego.vistaDe(s.sala.estado, a));
        expect(p.legales).toEqual(juego.accionesLegales(s.sala.estado, a));
      }
      const humano = [0, 1].find((a) => s.ultimo(a + 1, 'partida')!.legales.length > 0);
      if (humano !== undefined) {
        const p = s.ultimo(humano + 1, 'partida')!;
        const d = ia.decidir(p.vista, p.legales, azares[humano]!);
        azares[humano] = d.azar;
        expect(s.sala.jugar(humano, d.accion, p.n, ahora).ok).toBe(true);
      } else {
        ahora = correr(s.sala, ahora, ahora + 6_000);
      }
    }
    // Ningún mensaje de sala lleva los testigos de los demás.
    const textoSala = JSON.stringify(s.recibidos.get(2)!.filter((m) => m.tipo === 'sala'));
    expect(textoSala).not.toContain('testigo-1');
    expect(n).toBeGreaterThanOrEqual(2);
  });
});
