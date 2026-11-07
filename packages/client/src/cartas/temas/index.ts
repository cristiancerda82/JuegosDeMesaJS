import { MINIMAL } from './minimal';
import type { Baraja, IdTema, TemaNaipes } from './tipos';

/**
 * Registro de temas (design, decisión 5). Minimal va en el bundle principal; el resto se carga
 * con `import()`, así que Vite genera un trozo por tema y solo se descarga el que se usa.
 */

/** Temas de cada baraja, en el orden del selector; el primero es el de por defecto. */
export const TEMAS: Readonly<Record<Baraja, readonly IdTema[]>> = {
  espanola: ['minimal', 'castizo'],
  francesa: ['minimal'],
};

export const CARGAR: Readonly<Record<IdTema, () => Promise<TemaNaipes>>> = {
  minimal: () => Promise.resolve(MINIMAL),
  castizo: () => import('./castizo/tema').then((m) => m.CASTIZO),
  // Aún sin dibujar: si llegaran a pedirse, se queda Minimal.
  napolitano: () => Promise.reject(new Error('tema sin dibujar')),
  victoriano: () => Promise.reject(new Error('tema sin dibujar')),
};

export const CLAVES_TEMA: Readonly<Record<Baraja, string>> = {
  espanola: 'juegos-de-mesa/tema-espanola',
  francesa: 'juegos-de-mesa/tema-francesa',
};

/** El tema guardado para una baraja, o Minimal si no hay o no existe para esa baraja. */
export function leerTema(baraja: Baraja, texto: string | null): IdTema {
  return TEMAS[baraja].find((id) => id === texto) ?? 'minimal';
}
