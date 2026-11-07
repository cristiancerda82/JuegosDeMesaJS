import { PALOS_ESPANOLES, PALOS_FRANCESES, type Palo } from '@juegos/engine';
import { MINIMAL } from '../minimal';
import type { TemaNaipes } from '../tipos';
import type { DisenoPropio } from './catalogo';

/** Lo que publica cada generador del usuario (solo lo que se usa). */
interface Generador {
  /** `indices`: «Antigua» imita las barajas sin índices y solo los dibuja si se le pide. */
  svgCarta(valor: string | number, palo: string, opciones?: { indices?: boolean }): string;
}

/**
 * Cuánto se agrandan los índices de las esquinas: los de los diseños propios son pequeños para
 * leerlos en una mano en abanico. Las españolas solo llevan el número; las francesas, número y palo.
 */
export const AUMENTO_INDICES = { espanola: 1.4, francesa: 1.3 } as const;

/** Zona de cada esquina (en la carta de 240 × 336) y el punto desde el que se agranda. */
function esquinaDe(x: number, y: number): readonly [number, number] | null {
  if (x < 48 && y < 80) return [4, 4];
  if (x > 192 && y > 256) return [236, 332];
  return null;
}

const escalarDesde = ([ax, ay]: readonly [number, number], k: number) =>
  `translate(${ax} ${ay}) scale(${k}) translate(${-ax} ${-ay})`;

/**
 * Agranda los índices de las esquinas sin tocar los generadores: los `<text>` de las esquinas y
 * el palo pequeño que llevan debajo se escalan desde la esquina de la carta hacia dentro. La
 * esquina girada de las francesas usa las mismas coordenadas dentro de un `rotate(180)`.
 */
export function agrandarIndices(svg: string, k: number): string {
  return svg
    .replace(/<text\b([^>]*)>/g, (etiqueta, attrs: string) => {
      const x = Number(/\bx="([\d.]+)"/.exec(attrs)?.[1]);
      const y = Number(/\by="([\d.]+)"/.exec(attrs)?.[1]);
      const ancla = esquinaDe(x, y);
      if (!ancla || /\btransform=/.test(attrs)) return etiqueta;
      return `<text transform="${escalarDesde(ancla, k)}"${attrs}>`;
    })
    .replace(
      /<g\b([^>]*)\btransform="(translate\(([\d.]+) ([\d.]+)\)[^"]*scale\(([\d.]+)[^"]*)"/g,
      (etiqueta, antes: string, transform: string, x: string, y: string, escala: string) => {
        const ancla = esquinaDe(Number(x), Number(y));
        // Solo el palo pequeño del índice, pegado al borde (no adornos de las figuras).
        const pegado = Math.min(Number(x), 240 - Number(x)) <= 24;
        if (!ancla || !pegado || Number(escala) >= 0.25) return etiqueta;
        return `<g${antes}transform="${escalarDesde(ancla, k)} ${transform}"`;
      },
    );
}

// Un trozo por baraja: solo se descarga la que se usa.
const MODULOS = import.meta.glob('./vendor/*.js');

const VALORES_ESPANOLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const VALORES_FRANCESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const LETRA_FRANCESA: Readonly<Record<number, string>> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

/**
 * Convierte el SVG completo de una carta en un `<symbol>`. Los ids internos (degradados,
 * patrones…) se reescriben con el id de la carta: varias barajas usan los mismos.
 */
export function aSimbolo(svg: string, id: string): string {
  const m = /^\s*<svg\b[^>]*\bviewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/.exec(svg);
  if (!m) throw new Error(`Carta sin <svg viewBox>: ${id}`);
  let interior = m[2]!;
  const propios = new Set([...interior.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]!));
  if (propios.size > 0) {
    const nuevo = (x: string) => (propios.has(x) ? `${id}-${x}` : x);
    interior = interior
      .replace(/\bid="([^"]+)"/g, (_, x: string) => `id="${nuevo(x)}"`)
      .replace(/url\(#([^)]+)\)/g, (_, x: string) => `url(#${nuevo(x)})`)
      .replace(/href="#([^"]+)"/g, (t, x: string) => t.replace(`#${x}`, `#${nuevo(x)}`));
  }
  return `<symbol id="${id}" viewBox="${m[1]}">${interior}</symbol>`;
}

export async function cargarPropio(diseno: DisenoPropio): Promise<TemaNaipes> {
  const cargar = MODULOS[`./vendor/${diseno.archivo}`];
  if (!cargar) throw new Error(`Falta el generador ${diseno.archivo}`);
  await cargar();
  const generador = (globalThis as Record<string, unknown>)[diseno.global] as Generador | undefined;
  if (typeof generador?.svgCarta !== 'function') {
    throw new Error(`El generador ${diseno.archivo} no publica ${diseno.global}.svgCarta`);
  }

  const espanola = diseno.baraja === 'espanola';
  const palos: readonly Palo[] = espanola ? PALOS_ESPANOLES : PALOS_FRANCESES;
  const valores = espanola ? VALORES_ESPANOLES : VALORES_FRANCESES;
  const simbolos: string[] = [];
  const cartas = new Set<string>();
  for (const palo of palos) {
    for (const valor of valores) {
      const id = `${diseno.id}-${palo}-${valor}`;
      try {
        const svg = generador.svgCarta(
          espanola ? valor : (LETRA_FRANCESA[valor] ?? String(valor)),
          palo,
          { indices: true },
        );
        simbolos.push(aSimbolo(agrandarIndices(svg, AUMENTO_INDICES[diseno.baraja]), id));
        cartas.add(id);
      } catch (e) {
        // Una carta que el generador no sabe dibujar se queda en Minimal.
        console.warn(`El diseño «${diseno.id}» no dibuja ${valor} de ${palo}.`, e);
      }
    }
  }

  return {
    ...MINIMAL,
    id: diseno.id,
    // Las cartas que el diseño no trae (el caballo francés del Tarot) se dibujan con Minimal.
    completa: (palo, valor) => {
      const id = `${diseno.id}-${palo}-${valor}`;
      return cartas.has(id) ? id : null;
    },
    sprite: simbolos.join(''),
  };
}
