import { PALOS_ESPANOLES, PALOS_FRANCESES, type Palo } from '@juegos/engine';
import { MINIMAL } from '../minimal';
import type { TemaNaipes } from '../tipos';
import type { DisenoPropio } from './catalogo';

/** Lo que publica cada generador del usuario (solo lo que se usa). */
interface Generador {
  svgCarta(valor: string | number, palo: string): string;
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
        );
        simbolos.push(aSimbolo(svg, id));
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
