import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  borrarEstadisticas,
  guardarEstadisticas,
  leerEstadisticas,
  registrar,
  registrarPartida,
  resultadoDe,
  type Estadisticas,
  type Novedades,
  type PartidaTerminada,
} from './estadisticas';

const ganada: PartidaTerminada = { resultado: 'ganada', tiempoMs: 1000, movimientos: null };
const perdida: PartidaTerminada = { resultado: 'perdida', tiempoMs: 1000, movimientos: null };

/** Aplica varias partidas seguidas a un juego. */
function serie(partidas: PartidaTerminada[], juego: 'brisca' | 'klondike' = 'brisca') {
  let est: Estadisticas = {};
  let novedades: Novedades | null = null;
  for (const p of partidas) ({ estadisticas: est, novedades } = registrar(est, juego, p));
  return { est: est[juego]!, novedades: novedades! };
}

describe('registrar', () => {
  it('cuenta jugadas, ganadas, empatadas y perdidas', () => {
    const { est } = serie([ganada, perdida, { ...ganada, resultado: 'empatada' }, ganada]);
    expect(est).toMatchObject({ jugadas: 4, ganadas: 2, empatadas: 1, perdidas: 1 });
  });

  it('ganar suma a la racha; perder o empatar la corta, sin tocar la mejor', () => {
    let r = serie([ganada, ganada, ganada]);
    expect(r.est.racha).toBe(3);
    expect(r.novedades.racha).toBe(3);
    r = serie([ganada, ganada, ganada, ganada, ganada, perdida, ganada, ganada, ganada, perdida]);
    expect(r.est.racha).toBe(0);
    expect(r.est.mejorRacha).toBe(5);
    r = serie([ganada, ganada, { ...ganada, resultado: 'empatada' }]);
    expect(r.est.racha).toBe(0);
  });

  it('nueva mejor racha solo si supera a una anterior', () => {
    expect(serie([ganada]).novedades.mejorRacha).toBe(false);
    expect(serie([ganada, perdida, ganada, ganada]).novedades.mejorRacha).toBe(true);
    expect(serie([ganada, ganada, perdida, ganada]).novedades.mejorRacha).toBe(false);
  });

  it('récords de los solitarios al ganar', () => {
    const lenta = { resultado: 'ganada', tiempoMs: 300_000, movimientos: 120 } as const;
    const rapida = { resultado: 'ganada', tiempoMs: 180_000, movimientos: 130 } as const;
    const { est, novedades } = serie([lenta, rapida], 'klondike');
    expect(est.mejorTiempoMs).toBe(180_000);
    expect(est.menosMovimientos).toBe(120);
    expect(novedades).toMatchObject({ mejorTiempo: true, menosMovimientos: false });
    // La primera victoria guarda los récords sin anunciarlos.
    const primera = serie([lenta], 'klondike');
    expect(primera.est.mejorTiempoMs).toBe(300_000);
    expect(primera.novedades).toMatchObject({ mejorTiempo: false, menosMovimientos: false });
  });

  it('perder un solitario no guarda récords', () => {
    const { est } = serie([{ resultado: 'perdida', tiempoMs: 10, movimientos: 3 }], 'klondike');
    expect(est.mejorTiempoMs).toBeNull();
    expect(est.menosMovimientos).toBeNull();
  });

  it('los juegos con IA no guardan tiempos', () => {
    expect(serie([ganada]).est.mejorTiempoMs).toBeNull();
  });
});

describe('resultadoDe', () => {
  it('ganada, empatada o perdida según el fin del motor', () => {
    expect(resultadoDe({ ganadores: [0, 2], empate: false }, 0)).toBe('ganada');
    expect(resultadoDe({ ganadores: [], empate: true }, 0)).toBe('empatada');
    expect(resultadoDe({ ganadores: [1], empate: false }, 0)).toBe('perdida');
  });
});

describe('almacenamiento', () => {
  let datos: Record<string, string>;
  beforeEach(() => {
    datos = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => datos[k] ?? null,
      setItem: (k: string, v: string) => (datos[k] = v),
      removeItem: (k: string) => delete datos[k],
    });
  });

  it('guarda, lee y borra', () => {
    const novedades = registrarPartida('brisca', ganada);
    expect(novedades.racha).toBe(1);
    registrarPartida('brisca', ganada);
    expect(leerEstadisticas().brisca).toMatchObject({ jugadas: 2, racha: 2 });
    borrarEstadisticas();
    expect(leerEstadisticas()).toEqual({});
  });

  it('datos dañados o de otra versión cuentan como vacíos', () => {
    datos['juegos-de-mesa/estadisticas'] = '{no es json';
    expect(leerEstadisticas()).toEqual({});
    datos['juegos-de-mesa/estadisticas'] = JSON.stringify({ version: 99, juegos: {} });
    expect(leerEstadisticas()).toEqual({});
    registrarPartida('tute', ganada);
    expect(leerEstadisticas().tute?.jugadas).toBe(1);
  });

  it('descarta juegos desconocidos y entradas inválidas', () => {
    guardarEstadisticas({});
    const valida = serie([ganada]).est;
    datos['juegos-de-mesa/estadisticas'] = JSON.stringify({
      version: 1,
      juegos: { brisca: valida, ajedrez: valida, tute: { jugadas: -1 } },
    });
    expect(leerEstadisticas()).toEqual({ brisca: valida });
  });

  it('si el almacenamiento falla, sigue funcionando', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('sin espacio');
      },
      removeItem: () => {
        throw new Error('bloqueado');
      },
    });
    expect(leerEstadisticas()).toEqual({});
    expect(registrarPartida('brisca', ganada).racha).toBe(1);
    expect(() => borrarEstadisticas()).not.toThrow();
  });
});
