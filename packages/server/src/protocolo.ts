import {
  esJuegoEnRed,
  NIVELES_IA,
  type Asiento,
  type Fin,
  type IdJuegoRed,
  type NivelIA,
} from '@juegos/engine';

/**
 * Protocolo entre el cliente y el servidor de salas (spec partidas-en-red; design, decisión 3).
 * Mensajes JSON con un campo `tipo`. Sin dependencias de Node: lo importa también el cliente.
 */

// ── Del cliente al servidor ──────────────────────────────────────────────────

export type MensajeCliente =
  | {
      readonly tipo: 'crear';
      readonly juego: IdJuegoRed;
      readonly config: unknown;
      readonly nivel: NivelIA;
      readonly nombre: string;
    }
  | { readonly tipo: 'unirse'; readonly codigo: string; readonly nombre: string }
  | { readonly tipo: 'volver'; readonly codigo: string; readonly testigo: string }
  | { readonly tipo: 'asiento'; readonly asiento: Asiento }
  | { readonly tipo: 'empezar' }
  | { readonly tipo: 'revancha' }
  /** `n`: número de jugadas de la partida que el cliente ha visto al decidir. */
  | { readonly tipo: 'jugar'; readonly accion: unknown; readonly n: number }
  | { readonly tipo: 'pausa'; readonly activa: boolean }
  | { readonly tipo: 'salir' }
  | { readonly tipo: 'ping' };

// ── Del servidor al cliente ──────────────────────────────────────────────────

export interface InfoAsiento {
  readonly nombre: string;
  readonly conectado: boolean;
  /** La IA está jugando por él (lleva desconectado más de lo permitido). */
  readonly relevado: boolean;
}

export type CodigoError =
  | 'mensaje-invalido'
  | 'juego-desconocido'
  | 'config-invalida'
  | 'sin-sala'
  | 'sala-llena'
  | 'empezada'
  | 'no-empezada'
  | 'no-en-sala'
  | 'ya-en-sala'
  | 'no-anfitrion'
  | 'asiento-ocupado'
  | 'testigo'
  | 'accion-ilegal'
  | 'desfase'
  | 'servidor-lleno'
  | 'demasiados-mensajes';

export type MensajeServidor =
  | {
      readonly tipo: 'entrada';
      readonly codigo: string;
      readonly asiento: Asiento;
      readonly testigo: string;
    }
  | {
      readonly tipo: 'sala';
      readonly codigo: string;
      readonly juego: IdJuegoRed;
      readonly config: unknown;
      readonly nivel: NivelIA;
      readonly anfitrion: Asiento;
      /** `null`: asiento libre (lo juega la IA). */
      readonly asientos: readonly (InfoAsiento | null)[];
      readonly empezada: boolean;
      /** Número de partida en la sala (sube con cada revancha). */
      readonly partida: number;
    }
  | {
      readonly tipo: 'partida';
      readonly partida: number;
      /** Jugadas aplicadas: el cliente lo devuelve al jugar. */
      readonly n: number;
      readonly vista: unknown;
      readonly legales: readonly unknown[];
      readonly fin: Fin | null;
      /** Asiento de la IA que va a jugar, o `null`. */
      readonly piensa: Asiento | null;
    }
  | { readonly tipo: 'error'; readonly codigo: CodigoError; readonly mensaje: string }
  | { readonly tipo: 'pong' };

export const MENSAJES_ERROR: Readonly<Record<CodigoError, string>> = {
  'mensaje-invalido': 'Mensaje no válido',
  'juego-desconocido': 'Ese juego no se puede jugar en red',
  'config-invalida': 'Las opciones del juego no son válidas',
  'sin-sala': 'No hay ninguna sala con ese código',
  'sala-llena': 'La sala está llena',
  empezada: 'La partida ya ha empezado',
  'no-empezada': 'La partida aún no ha empezado',
  'no-en-sala': 'No estás en ninguna sala',
  'ya-en-sala': 'Ya estás en una sala',
  'no-anfitrion': 'Solo el anfitrión puede hacerlo',
  'asiento-ocupado': 'Ese asiento no está libre',
  testigo: 'No se puede volver a esa sala',
  'accion-ilegal': 'Esa jugada no está permitida',
  desfase: 'La partida ha cambiado: vuelve a intentarlo',
  'servidor-lleno': 'El servidor está lleno: inténtalo más tarde',
  'demasiados-mensajes': 'Demasiados mensajes',
};

// ── Validación ───────────────────────────────────────────────────────────────

export const TAMANO_MAXIMO = 16 * 1024;
export const NOMBRE_MAXIMO = 20;
/** Letras de los códigos: sin I, L, O ni U, que se confunden. */
export const LETRAS_CODIGO = 'ABCDEFGHJKMNPQRSTVWXYZ';
export const LARGO_CODIGO = 5;

const esObjeto = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

const esNombre = (x: unknown): x is string =>
  typeof x === 'string' && x.trim().length >= 1 && x.trim().length <= NOMBRE_MAXIMO;

const esCodigo = (x: unknown): x is string =>
  typeof x === 'string' &&
  x.length === LARGO_CODIGO &&
  [...x].every((l) => LETRAS_CODIGO.includes(l));

const esEntero = (x: unknown): x is number =>
  typeof x === 'number' && Number.isInteger(x) && x >= 0;

/** Normaliza un código escrito por el jugador: mayúsculas, sin espacios. */
export const normalizarCodigo = (texto: string) => texto.trim().toUpperCase().replace(/\s+/g, '');

/** Lee un mensaje del cliente; `null` si no es válido. */
export function leerMensajeCliente(texto: string): MensajeCliente | null {
  if (texto.length > TAMANO_MAXIMO) return null;
  let m: unknown;
  try {
    m = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!esObjeto(m)) return null;
  switch (m.tipo) {
    case 'crear':
      if (!esJuegoEnRed(m.juego) || !esObjeto(m.config) || !esNombre(m.nombre)) return null;
      if (!NIVELES_IA.includes(m.nivel as NivelIA)) return null;
      return {
        tipo: 'crear',
        juego: m.juego,
        config: m.config,
        nivel: m.nivel as NivelIA,
        nombre: m.nombre.trim(),
      };
    case 'unirse':
      if (!esCodigo(m.codigo) || !esNombre(m.nombre)) return null;
      return { tipo: 'unirse', codigo: m.codigo, nombre: m.nombre.trim() };
    case 'volver':
      if (!esCodigo(m.codigo) || typeof m.testigo !== 'string' || m.testigo.length > 64)
        return null;
      return { tipo: 'volver', codigo: m.codigo, testigo: m.testigo };
    case 'asiento':
      return esEntero(m.asiento) ? { tipo: 'asiento', asiento: m.asiento } : null;
    case 'jugar':
      if (!esEntero(m.n) || m.accion === undefined) return null;
      return { tipo: 'jugar', accion: m.accion, n: m.n };
    case 'pausa':
      return typeof m.activa === 'boolean' ? { tipo: 'pausa', activa: m.activa } : null;
    case 'empezar':
    case 'revancha':
    case 'salir':
    case 'ping':
      return { tipo: m.tipo };
    default:
      return null;
  }
}
