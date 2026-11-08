import { NIVELES_IA, type NivelIA } from '@juegos/engine';
import type { IdJuego } from '../sesion/juegos';

/** Último nivel de la IA elegido en cada juego: una preferencia local, no imprescindible. */
const clave = (juego: IdJuego) => `juegos-de-mesa/nivel/${juego}`;

export function leerNivel(juego: IdJuego): NivelIA {
  try {
    const guardado = globalThis.localStorage?.getItem(clave(juego));
    return NIVELES_IA.includes(guardado as NivelIA) ? (guardado as NivelIA) : 'normal';
  } catch {
    return 'normal';
  }
}

/** Modo asistido activado en cada juego (spec modo-asistido): desactivado por defecto. */
const claveAsistido = (juego: IdJuego) => `juegos-de-mesa/asistido/${juego}`;

export function leerAsistido(juego: IdJuego): boolean {
  try {
    return globalThis.localStorage?.getItem(claveAsistido(juego)) === 'si';
  } catch {
    return false;
  }
}

export function guardarAsistido(juego: IdJuego, asistido: boolean): void {
  try {
    globalThis.localStorage?.setItem(claveAsistido(juego), asistido ? 'si' : 'no');
  } catch {
    // Sin almacenamiento, la próxima vez se propone desactivado.
  }
}

export function guardarNivel(juego: IdJuego, nivel: NivelIA): void {
  try {
    globalThis.localStorage?.setItem(clave(juego), nivel);
  } catch {
    // Sin almacenamiento, la próxima vez se propone Normal.
  }
}
