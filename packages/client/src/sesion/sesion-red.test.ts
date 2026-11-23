import { afterEach, describe, expect, it, vi } from 'vitest';
import { JUEGOS } from './juegos';
import type { ClienteRed, MensajePartida } from './red.svelte';
import { SesionRed } from './sesion-red.svelte';

// Spec modo-asistido, «Modo asistido en red»: solo con el permiso del anfitrión, calculado en el
// dispositivo con la vista del asiento y sin lecturas de los rivales.

const def = JUEGOS.brisca;
const config = { ...def.configPorDefecto, jugadores: 2 as const };

/** Un cliente de red simulado, sentado en el asiento 0 de una sala de Brisca ya empezada. */
function clienteFalso(asistido: boolean | undefined) {
  const enviados: unknown[] = [];
  const cliente = {
    sala: {
      tipo: 'sala',
      codigo: 'ABCDE',
      juego: 'brisca',
      config,
      nivel: 'normal',
      asistido,
      anfitrion: 0,
      asientos: [null, null],
      empezada: true,
      partida: 1,
    },
    entrada: { tipo: 'entrada', codigo: 'ABCDE', asiento: 0, testigo: 't' },
    error: null,
    alRecibirPartida: null,
    enviar: (m: unknown) => enviados.push(m),
    cerrar: () => {},
  };
  return { cliente: cliente as unknown as ClienteRed, enviados };
}

function primeraPartida(): MensajePartida {
  const r = def.juego.crear(config, 'semilla-red');
  if (!r.ok) throw new Error(r.error);
  return {
    tipo: 'partida',
    partida: 1,
    n: 0,
    vista: def.juego.vistaDe(r.valor, 0),
    legales: def.juego.accionesLegales(r.valor, 0),
    fin: null,
    piensa: null,
  } as MensajePartida;
}

function guardarPreferencia(valor: 'si' | 'no' | null) {
  const almacen = new Map<string, string>();
  if (valor !== null) almacen.set('juegos-de-mesa/asistido/brisca', valor);
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => almacen.get(k) ?? null,
    setItem: (k: string, v: string) => almacen.set(k, v),
    removeItem: (k: string) => almacen.delete(k),
  });
}

let sesion: SesionRed<unknown, unknown, unknown, unknown> | null = null;
afterEach(() => {
  sesion?.cerrar();
  sesion = null;
  vi.unstubAllGlobals();
});

function crear(asistido: boolean | undefined) {
  const { cliente, enviados } = clienteFalso(asistido);
  sesion = new SesionRed(def as never, cliente, primeraPartida());
  return { sesion, enviados };
}

describe('modo asistido en red', () => {
  it('sin el permiso del anfitrión no se ofrece, aunque el jugador lo tenga activado', async () => {
    guardarPreferencia('si');
    const { sesion } = crear(false);
    expect(sesion.puedeAsistir).toBe(false);
    sesion.alternarAsistido();
    expect(sesion.asistido).toBe(false);
    await new Promise((r) => setTimeout(r, 20));
    expect(sesion.asistencia).toBeNull();
  });

  it('un servidor anterior, sin el campo, cuenta como sin permiso', () => {
    guardarPreferencia('si');
    expect(crear(undefined).sesion.puedeAsistir).toBe(false);
  });

  it('con permiso, empieza según la preferencia del jugador y sugiere una jugada legal', async () => {
    guardarPreferencia('si');
    const { sesion, enviados } = crear(true);
    expect(sesion.puedeAsistir).toBe(true);
    expect(sesion.asistido).toBe(true);
    await vi.waitFor(() => expect(sesion.asistencia).not.toBeNull());
    expect(sesion.legales).toContainEqual(sesion.asistencia!.sugerida);
    expect(sesion.lecturas).toEqual([]);
    // Calcular la sugerencia no envía nada al servidor.
    expect(enviados).toEqual([]);
  });

  it('con permiso y sin preferencia empieza apagado, y se puede encender y apagar', async () => {
    guardarPreferencia(null);
    const { sesion } = crear(true);
    expect(sesion.asistido).toBe(false);
    sesion.alternarAsistido();
    expect(sesion.asistido).toBe(true);
    await vi.waitFor(() => expect(sesion.asistencia).not.toBeNull());
    sesion.alternarAsistido();
    expect(sesion.asistido).toBe(false);
    expect(sesion.asistencia).toBeNull();
  });
});
