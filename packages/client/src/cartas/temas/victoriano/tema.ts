import type { Palo } from '@juegos/engine';
import { figuraDe, pips } from '../../dibujo';
import { crearSprite } from '../sprite';
import type { Pieza, TemaNaipes } from '../tipos';

/**
 * Victoriano: inspirado en las barajas inglesas y americanas de hacia 1880 (figuras de doble
 * cabeza en rojo, azul, amarillo y negro, enmarcadas con un filete fino, y el palo grande en la
 * esquina del marco), con arte propio del proyecto.
 */

const ARTE = import.meta.glob<string>('./arte/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const SPRITE = crearSprite('victoriano', ARTE);

const ROJO = '#d22a2a';
const NEGRO = '#161616';
const AZUL = '#2c4fa3';
const AMARILLO = '#f0c419';

/** Paleta de las figuras de cada palo (ropa, capa y bandas). */
const PALETAS: Readonly<Record<string, { ropa: string; capa: string; banda: string }>> = {
  picas: { ropa: AZUL, capa: ROJO, banda: AMARILLO },
  corazones: { ropa: ROJO, capa: AZUL, banda: AMARILLO },
  diamantes: { ropa: ROJO, capa: AMARILLO, banda: AZUL },
  treboles: { ropa: AZUL, capa: NEGRO, banda: AMARILLO },
};

const esRojo = (palo: Palo) => palo === 'corazones' || palo === 'diamantes';

const uso = (ref: string, cx: number, cy: number, tamano: number, giro = 0): Pieza => ({
  tipo: 'uso',
  ref: `victoriano-${ref}`,
  x: cx - tamano / 2,
  y: cy - tamano / 2,
  ancho: tamano,
  alto: tamano,
  ...(giro ? { transform: `rotate(${giro} ${cx} ${cy})` } : {}),
});

/** El marco de la figura deja libres las esquinas de los índices. */
const MARCO = { x: 21, y: 8, ancho: 58, alto: 124 };
/** La media figura (caja de 64 × 60) ocupa la mitad de arriba del marco, a su ancho. */
const ALTO_MEDIA = (MARCO.ancho * 60) / 64;

const FIGURA: Readonly<Record<string, string>> = {
  rey: 'figura-rey',
  reina: 'figura-reina',
  sota: 'figura-jota',
  caballo: 'figura-caballo',
};

function figura(palo: Palo, ref: string): Pieza[] {
  const p = PALETAS[palo]!;
  const media = (giro: boolean): Pieza => ({
    tipo: 'uso',
    ref: `victoriano-${ref}`,
    x: MARCO.x,
    y: 70 - ALTO_MEDIA,
    ancho: MARCO.ancho,
    alto: ALTO_MEDIA,
    estilo: `--ropa:${p.ropa};--capa:${p.capa};--banda:${p.banda}`,
    ...(giro ? { transform: 'rotate(180 50 70)' } : {}),
  });
  return [
    { tipo: 'rect', ...MARCO, rx: 1, fill: '#fdfcf8' },
    media(false),
    media(true),
    // El palo grande, arriba a la derecha y (girado) abajo a la izquierda.
    uso(`palo-${palo}`, 70, 20, 15),
    uso(`palo-${palo}`, 30, 120, 15, 180),
    { tipo: 'rect', ...MARCO, rx: 1, fill: 'none', stroke: AZUL, grosor: 1.1 },
  ];
}

export const VICTORIANO: TemaNaipes = {
  id: 'victoriano',
  papel: '#fdfcf8',
  borde: '#a9a59a',
  indice: {
    fuente: "Georgia, 'Times New Roman', serif",
    peso: 700,
    color: (palo) => (esRojo(palo) ? ROJO : NEGRO),
  },
  paloEsquina: (palo, cx, cy, tamano) => uso(`palo-${palo}`, cx, cy, tamano),
  cuerpo(palo, valor) {
    const f = figuraDe(palo, valor);
    if (f !== null) return figura(palo, FIGURA[f]!);
    if (valor === 1) {
      return palo === 'picas' ? [uso('as-picas', 50, 70, 72)] : [uso(`palo-${palo}`, 50, 70, 40)];
    }
    // Como en las barajas clásicas, los símbolos de la mitad de abajo van invertidos.
    return pips(valor).map(([x, y]) => uso(`palo-${palo}`, x, y, 20, y > 70 ? 180 : 0));
  },
  sprite: SPRITE.texto,
};
