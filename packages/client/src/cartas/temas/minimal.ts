import type { Palo } from '@juegos/engine';
import { colocar, colorTinta, esFrancesa, figuraDe, FIGURAS, PALOS, pips } from '../dibujo';
import type { Pieza, TemaNaipes } from './tipos';

/**
 * El diseño de siempre, de autoría propia: palos geométricos y figuras reducidas a un icono. Es
 * el tema por defecto de las dos barajas y va en el bundle principal (design, decisión 5).
 */

const palo = (p: Palo, cx: number, cy: number, tamano: number): Pieza => ({
  tipo: 'path',
  d: PALOS[p].d,
  fill: PALOS[p].color,
  ...(PALOS[p].regla ? { regla: PALOS[p].regla } : {}),
  transform: colocar(cx, cy, tamano),
});

export const MINIMAL: TemaNaipes = {
  id: 'minimal',
  papel: 'var(--papel)',
  borde: 'var(--borde-carta)',
  indice: { peso: 700, color: colorTinta },
  paloEsquina: palo,
  cuerpo(p, valor) {
    const figura = figuraDe(p, valor);
    if (figura !== null) {
      const color = PALOS[p].color;
      const tinta = colorTinta(p);
      return [
        {
          tipo: 'rect',
          x: 27,
          y: 14,
          ancho: 46,
          alto: 112,
          rx: 6,
          fill: color,
          opacidadRelleno: 0.1,
          stroke: color,
          grosor: 2,
        },
        ...FIGURAS[figura].map((capa): Pieza => ({
          tipo: 'path',
          d: capa.d,
          fill: capa.relleno === 'tinta' ? tinta : 'var(--papel)',
          transform: colocar(50, 56, 42),
        })),
        palo(p, 50, 102, 22),
      ];
    }
    if (valor === 1) return [palo(p, 50, 70, esFrancesa(p) ? 40 : 54)];
    return pips(valor).map(([x, y]) => palo(p, x, y, 20));
  },
};
