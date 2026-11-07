import { cartaDeId, crearBaraja, type IdCarta } from '@juegos/engine';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { CARGAR, leerTema, TEMAS } from '.';
import type { Baraja, IdTema, Pieza, TemaNaipes } from './tipos';

// Contrato que cumple todo tema ilustrado (spec temas-naipes; design, decisión 4).

const ARTE = import.meta.glob<string>('./*/arte/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Cartas que debe dibujar un tema de cada baraja: la española de 48 y la francesa con los caballos del Tarot. */
const CARTAS: Readonly<Record<Baraja, readonly IdCarta[]>> = {
  espanola: crearBaraja('espanola48'),
  francesa: [
    ...crearBaraja('francesa52'),
    'picas-14',
    'corazones-14',
    'diamantes-14',
    'treboles-14',
  ],
};

const ilustrados = (Object.keys(TEMAS) as Baraja[]).flatMap((baraja) =>
  TEMAS[baraja].filter((id) => id !== 'minimal').map((id) => ({ baraja, id })),
);

const refs = (piezas: readonly Pieza[]) => piezas.flatMap((p) => (p.tipo === 'uso' ? [p.ref] : []));

describe.each(ilustrados)(
  'tema $id ($baraja)',
  ({ baraja, id }: { baraja: Baraja; id: IdTema }) => {
    const cargar = () => CARGAR[id]();

    it('dibuja todas las cartas de su baraja con símbolos que existen en su sprite', async () => {
      const tema: TemaNaipes = await cargar();
      const sprite = tema.sprite ?? '';
      for (const carta of CARTAS[baraja]) {
        const { palo, valor } = cartaDeId(carta)!;
        const piezas = [
          ...(tema.marco?.(palo) ?? []),
          tema.paloEsquina(palo, 12, 41, 16),
          ...tema.cuerpo(palo, valor),
        ];
        expect(tema.cuerpo(palo, valor).length, carta).toBeGreaterThan(0);
        for (const ref of refs(piezas)) expect(sprite, `${carta}: ${ref}`).toContain(`id="${ref}"`);
      }
    });

    it('el arte es seguro de insertar y no lleva texto (ni marcas)', () => {
      const archivos = Object.entries(ARTE).filter(([ruta]) => ruta.startsWith(`./${id}/`));
      expect(archivos.length).toBeGreaterThan(0);
      for (const [ruta, svg] of archivos) {
        expect(svg, ruta).not.toMatch(/<script|<foreignObject|<text|\son[a-z]+\s*=/i);
        expect(svg, ruta).not.toMatch(/(?:xlink:)?href\s*=\s*["'](?!#)/i);
      }
    });

    it('el sprite comprimido no pasa de 150 KB', async () => {
      const tema = await cargar();
      expect(gzipSync(tema.sprite ?? '').length).toBeLessThan(150 * 1024);
    });
  },
);

describe('elección guardada', () => {
  it('por defecto, y con un valor que no existe, Minimal', () => {
    expect(leerTema('espanola', null)).toBe('minimal');
    expect(leerTema('espanola', 'inventado')).toBe('minimal');
  });

  it('un tema solo vale para su baraja', () => {
    expect(leerTema('espanola', 'castizo')).toBe('castizo');
    expect(leerTema('francesa', 'castizo')).toBe('minimal');
  });

  it('cada baraja tiene Minimal como primer tema', () => {
    for (const b of Object.keys(TEMAS) as Baraja[]) expect(TEMAS[b][0]).toBe('minimal');
  });
});
