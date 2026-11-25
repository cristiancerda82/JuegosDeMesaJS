import { LARGO_CODIGO, LETRAS_CODIGO, normalizarCodigo } from '@juegos/server/protocolo';
import { esNativa } from '../plataforma';
import { servidorPorDefecto, servidorUsable } from './red.svelte';

/**
 * Enlaces de invitación a una sala (spec partidas-en-red, «Invitar con un enlace»; change
 * invitar-enlace, design, decisión 1): la web pública con `?sala=CODIGO` y, si el anfitrión no
 * usa el servidor por defecto, `&servidor=`. El mismo enlace abre la app si está instalada.
 */

/** Dirección pública de la web, la que se comparte desde la app (que vive en https://localhost). */
export const URL_PUBLICA: string =
  (import.meta.env.VITE_URL_PUBLICA as string | undefined) ??
  'https://cristiancerda82.github.io/JuegosDeMesaJS/';

export interface Invitacion {
  readonly codigo: string;
  /** Servidor del enlace, si trae uno que se puede usar aquí; si no, el de por defecto. */
  readonly servidor: string | null;
}

/** Base de los enlaces: la propia página en la web; la dirección pública en la app. */
export function baseEnlaces(): string {
  if (esNativa() || typeof location === 'undefined') return URL_PUBLICA;
  return location.origin + location.pathname;
}

export function enlaceSala(codigo: string, servidor: string, base = baseEnlaces()): string {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('sala', codigo);
  if (servidor.trim() !== servidorPorDefecto()) url.searchParams.set('servidor', servidor.trim());
  return url.toString();
}

const esCodigo = (c: string) =>
  c.length === LARGO_CODIGO && [...c].every((l) => LETRAS_CODIGO.includes(l));

/** La invitación de una dirección, o `null` si no lleva una con un código bien formado. */
export function leerInvitacion(direccion: string): Invitacion | null {
  let url: URL;
  try {
    url = new URL(direccion);
  } catch {
    return null;
  }
  const sala = url.searchParams.get('sala');
  if (sala === null) return null;
  const codigo = normalizarCodigo(sala);
  if (!esCodigo(codigo)) return null;
  const servidor = url.searchParams.get('servidor')?.trim() ?? '';
  const valido = /^wss?:\/\//.test(servidor) && servidorUsable(servidor);
  return { codigo, servidor: valido ? servidor : null };
}

/** La misma dirección sin la invitación, para dejarla en la barra sin `?sala=`. */
export function sinInvitacion(direccion: string): string {
  const url = new URL(direccion);
  url.searchParams.delete('sala');
  url.searchParams.delete('servidor');
  return url.toString();
}
