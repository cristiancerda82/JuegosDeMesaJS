import type { Asiento, Fin } from '@juegos/engine';
import { ID_JUEGOS, type IdJuego } from '../sesion/juegos';

/**
 * Estadísticas de las partidas terminadas, por juego, guardadas en el dispositivo. El registro
 * es puro (`registrar`); la lectura y el guardado toleran que el almacenamiento falle.
 */

export interface EstadisticasJuego {
  readonly jugadas: number;
  readonly ganadas: number;
  readonly empatadas: number;
  readonly perdidas: number;
  /** Victorias seguidas hasta la última partida. */
  readonly racha: number;
  readonly mejorRacha: number;
  /** Solo en los solitarios: récords de las partidas ganadas. */
  readonly mejorTiempoMs: number | null;
  readonly menosMovimientos: number | null;
}

export type Estadisticas = Partial<Record<IdJuego, EstadisticasJuego>>;

export type ResultadoPartida = 'ganada' | 'empatada' | 'perdida';

export interface PartidaTerminada {
  readonly resultado: ResultadoPartida;
  readonly tiempoMs: number;
  /** Movimientos en los solitarios; `null` en el resto. */
  readonly movimientos: number | null;
}

/** Lo que la partida ha cambiado y merece un aviso en la pantalla de fin. */
export interface Novedades {
  readonly resultado: ResultadoPartida;
  readonly racha: number;
  readonly mejorRacha: boolean;
  readonly mejorTiempo: boolean;
  readonly menosMovimientos: boolean;
}

const VACIAS: EstadisticasJuego = {
  jugadas: 0,
  ganadas: 0,
  empatadas: 0,
  perdidas: 0,
  racha: 0,
  mejorRacha: 0,
  mejorTiempoMs: null,
  menosMovimientos: null,
};

export function resultadoDe(fin: Fin, humano: Asiento): ResultadoPartida {
  if (fin.ganadores.includes(humano)) return 'ganada';
  return fin.empate ? 'empatada' : 'perdida';
}

/** Suma una partida terminada a las estadísticas de su juego. */
export function registrar(
  est: Estadisticas,
  juego: IdJuego,
  partida: PartidaTerminada,
): { estadisticas: Estadisticas; novedades: Novedades } {
  const antes = est[juego] ?? VACIAS;
  const gana = partida.resultado === 'ganada';
  const racha = gana ? antes.racha + 1 : 0;
  const mejoraTiempo =
    gana && (antes.mejorTiempoMs === null || partida.tiempoMs < antes.mejorTiempoMs);
  const mejoraMovimientos =
    gana &&
    partida.movimientos !== null &&
    (antes.menosMovimientos === null || partida.movimientos < antes.menosMovimientos);
  const despues: EstadisticasJuego = {
    jugadas: antes.jugadas + 1,
    ganadas: antes.ganadas + (gana ? 1 : 0),
    empatadas: antes.empatadas + (partida.resultado === 'empatada' ? 1 : 0),
    perdidas: antes.perdidas + (partida.resultado === 'perdida' ? 1 : 0),
    racha,
    mejorRacha: Math.max(antes.mejorRacha, racha),
    mejorTiempoMs:
      partida.movimientos !== null && mejoraTiempo ? partida.tiempoMs : antes.mejorTiempoMs,
    menosMovimientos: mejoraMovimientos ? partida.movimientos : antes.menosMovimientos,
  };
  return {
    estadisticas: { ...est, [juego]: despues },
    novedades: {
      resultado: partida.resultado,
      racha,
      // Solo es récord si supera a una racha anterior: la primera victoria no lo es.
      mejorRacha: antes.mejorRacha > 0 && racha > antes.mejorRacha,
      mejorTiempo: partida.movimientos !== null && mejoraTiempo && antes.mejorTiempoMs !== null,
      menosMovimientos: mejoraMovimientos && antes.menosMovimientos !== null,
    },
  };
}

// ── Almacenamiento ───────────────────────────────────────────────────────────

const CLAVE = 'juegos-de-mesa/estadisticas';
export const VERSION_ESTADISTICAS = 1;

/** El almacenamiento puede no existir o fallar (modo privado, cuota): nunca rompe la app. */
function almacen(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const esEntero = (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0;
const esEnteroONulo = (n: unknown) => n === null || esEntero(n);

function esValida(e: unknown): e is EstadisticasJuego {
  if (typeof e !== 'object' || e === null) return false;
  const x = e as Record<string, unknown>;
  return (
    ['jugadas', 'ganadas', 'empatadas', 'perdidas', 'racha', 'mejorRacha'].every((k) =>
      esEntero(x[k]),
    ) &&
    esEnteroONulo(x.mejorTiempoMs) &&
    esEnteroONulo(x.menosMovimientos)
  );
}

/** Lee las estadísticas; lo que falte, no se pueda leer o no sea válido cuenta como vacío. */
export function leerEstadisticas(): Estadisticas {
  try {
    const texto = almacen()?.getItem(CLAVE);
    if (!texto) return {};
    const datos = JSON.parse(texto) as { version?: unknown; juegos?: unknown };
    if (
      datos.version !== VERSION_ESTADISTICAS ||
      typeof datos.juegos !== 'object' ||
      !datos.juegos
    ) {
      return {};
    }
    const est: Estadisticas = {};
    for (const [juego, valor] of Object.entries(datos.juegos)) {
      if (ID_JUEGOS.includes(juego as IdJuego) && esValida(valor)) est[juego as IdJuego] = valor;
    }
    return est;
  } catch {
    return {};
  }
}

export function guardarEstadisticas(est: Estadisticas): void {
  try {
    almacen()?.setItem(CLAVE, JSON.stringify({ version: VERSION_ESTADISTICAS, juegos: est }));
  } catch {
    // Sin espacio o sin permiso: las estadísticas no se guardan, pero la partida sigue.
  }
}

export function borrarEstadisticas(): void {
  try {
    almacen()?.removeItem(CLAVE);
  } catch {
    // Nada que hacer.
  }
}

/** Lee, registra la partida y guarda; devuelve las novedades para la pantalla de fin. */
export function registrarPartida(juego: IdJuego, partida: PartidaTerminada): Novedades {
  const { estadisticas, novedades } = registrar(leerEstadisticas(), juego, partida);
  guardarEstadisticas(estadisticas);
  return novedades;
}
