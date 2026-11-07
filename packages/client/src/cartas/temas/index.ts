import { MINIMAL } from './minimal';
import { PROPIOS } from './propios/catalogo';
import { cargarPropio } from './propios/cargar';
import type { Baraja, IdTema, TemaNaipes } from './tipos';

/**
 * Registro de temas (design, decisión 5). Minimal va en el bundle principal; el resto se carga
 * con `import()`, así que Vite genera un trozo por tema y solo se descarga el que se usa.
 */

/** Temas de cada baraja, en el orden del selector; el primero es el de por defecto. */
export const TEMAS: Readonly<Record<Baraja, readonly IdTema[]>> = {
  espanola: [
    'minimal',
    'castizo',
    ...PROPIOS.filter((d) => d.baraja === 'espanola').map((d) => d.id),
  ],
  francesa: [
    'minimal',
    'victoriano',
    ...PROPIOS.filter((d) => d.baraja === 'francesa').map((d) => d.id),
  ],
};

export const CARGAR: Readonly<Record<IdTema, () => Promise<TemaNaipes>>> = {
  minimal: () => Promise.resolve(MINIMAL),
  castizo: () => import('./castizo/tema').then((m) => m.CASTIZO),
  // Aún sin dibujar: si llegaran a pedirse, se queda Minimal.
  napolitano: () => Promise.reject(new Error('tema sin dibujar')),
  victoriano: () => import('./victoriano/tema').then((m) => m.VICTORIANO),
  ...(Object.fromEntries(PROPIOS.map((d) => [d.id, () => cargarPropio(d)])) as Record<
    (typeof PROPIOS)[number]['id'],
    () => Promise<TemaNaipes>
  >),
};

export const CLAVES_TEMA: Readonly<Record<Baraja, string>> = {
  espanola: 'juegos-de-mesa/tema-espanola',
  francesa: 'juegos-de-mesa/tema-francesa',
};

/** El tema guardado para una baraja, o Minimal si no hay o no existe para esa baraja. */
export function leerTema(baraja: Baraja, texto: string | null): IdTema {
  return TEMAS[baraja].find((id) => id === texto) ?? 'minimal';
}
