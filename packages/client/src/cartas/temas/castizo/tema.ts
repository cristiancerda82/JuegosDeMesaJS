import type { Palo } from '@juegos/engine';
import { figuraDe, pips } from '../../dibujo';
import { crearSprite } from '../sprite';
import type { Pieza, TemaNaipes } from '../tipos';

/**
 * Castizo: inspirado en el naipe español clásico de fines del XIX (colores planos con contorno,
 * marco con «pintas», bastos nudosos y espadas rectas), con arte propio del proyecto.
 */

const ARTE = import.meta.glob<string>('./arte/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const SPRITE = crearSprite('castizo', ARTE);

const TINTA = '#1d1d1b';

/** Color de cada palo: índice y paleta de las figuras (ropa y capa). */
const COLORES: Readonly<Record<string, { indice: string; ropa: string; capa: string }>> = {
  oros: { indice: '#a8740a', ropa: '#c8402f', capa: '#3a8fd6' },
  copas: { indice: '#c8402f', ropa: '#3a8fd6', capa: '#c8402f' },
  espadas: { indice: '#2b6cb0', ropa: '#c8402f', capa: '#3e9a4a' },
  bastos: { indice: '#2e7d32', ropa: '#3e9a4a', capa: '#c8402f' },
};

const uso = (
  ref: string,
  cx: number,
  cy: number,
  tamano: number,
  giro = 0,
  estilo?: string,
): Pieza => ({
  tipo: 'uso',
  ref: `castizo-${ref}`,
  x: cx - tamano / 2,
  y: cy - tamano / 2,
  ancho: tamano,
  alto: tamano,
  ...(giro ? { transform: `rotate(${giro} ${cx} ${cy})` } : {}),
  ...(estilo ? { estilo } : {}),
});

const esLargo = (palo: Palo) => palo === 'espadas' || palo === 'bastos';

// ── Marco con pintas ──────────────────────────────────────────────────────────

/** Cortes («pintas») del marco según el palo: oros ninguno, copas 1, espadas 2, bastos 3. */
const PINTAS: Readonly<Record<string, number>> = { oros: 0, copas: 1, espadas: 2, bastos: 3 };

/** Un tramo horizontal del marco de `x0` a `x1`, con `n` cortes centrados. */
function tramo(x0: number, x1: number, y: number, n: number): Pieza[] {
  const corte = 3.4;
  const separacion = 2.6;
  const ancho = n * corte + (n - 1) * separacion;
  const centro = (x0 + x1) / 2;
  const huecos = Array.from({ length: n }, (_, i) => centro - ancho / 2 + i * (corte + separacion));
  const tramos: [number, number][] = [];
  let desde = x0;
  for (const h of huecos) {
    tramos.push([desde, h]);
    desde = h + corte;
  }
  tramos.push([desde, x1]);
  return tramos.map(([a, b]) => ({
    tipo: 'rect',
    x: a,
    y,
    ancho: b - a,
    alto: 1.3,
    rx: 0,
    fill: TINTA,
  }));
}

/**
 * El marco deja libres las esquinas de los índices (arriba a la izquierda y abajo a la derecha,
 * como en el naipe tradicional) y lleva las pintas en los tramos de arriba y de abajo.
 */
function marco(palo: Palo): Pieza[] {
  const n = PINTAS[palo] ?? 0;
  const linea = (x: number, y: number, ancho: number, alto: number): Pieza => ({
    tipo: 'rect',
    x,
    y,
    ancho,
    alto,
    rx: 0,
    fill: TINTA,
  });
  return [
    ...tramo(24, 94, 6, n),
    linea(92.7, 6, 1.3, 86),
    ...tramo(6, 76, 132.7, n),
    linea(6, 48, 1.3, 86),
  ];
}

// ── Numerales ─────────────────────────────────────────────────────────────────

/** Bastos o espadas cruzados en aspa, con centro en (cx, cy): para el 2 y el 3. */
function aspa(palo: Palo, n: number): Pieza[] {
  const giros = n === 2 ? [-28, 28] : [-30, 0, 30];
  return giros.map((g) => uso(`palo-${palo}`, 50, 70, 84, g));
}

/** Una fila de `n` piezas sueltas, algo inclinadas a un lado y a otro, centrada en `y`. */
function fila(palo: Palo, n: number, y: number, tamano: number): Pieza[] {
  const paso = n > 1 ? Math.min(44 / (n - 1), 22) : 0;
  const x0 = 50 - (paso * (n - 1)) / 2;
  return Array.from({ length: n }, (_, i) =>
    uso(`palo-${palo}`, x0 + i * paso, y, tamano, i % 2 ? 10 : -10),
  );
}

/** Piezas por fila de bastos y espadas: dos filas hasta el 6 y tres del 7 al 9. */
const FILAS: Readonly<Record<number, readonly number[]>> = {
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [3, 1, 3],
  8: [3, 2, 3],
  9: [3, 3, 3],
};

function numeral(palo: Palo, valor: number): Pieza[] {
  if (!esLargo(palo)) return pips(valor).map(([x, y]) => uso(`palo-${palo}`, x, y, 21));
  // Bastos y espadas: el 2 y el 3 en aspa; del 4 en adelante, en filas que se cuentan bien.
  if (valor <= 3) return aspa(palo, valor);
  const filas = FILAS[valor] ?? [valor];
  const ys = filas.length === 2 ? [46, 95] : [37, 70, 103];
  const tamano = filas.length === 2 ? 46 : 34;
  return filas.flatMap((n, i) => fila(palo, n, ys[i]!, tamano));
}

// ── Figuras ───────────────────────────────────────────────────────────────────

/** Dónde lleva cada figura el atributo del palo (en la carta), y su giro si es largo. */
const MANO: Readonly<Record<string, { x: number; y: number; giro: number }>> = {
  rey: { x: 66, y: 63, giro: 14 },
  sota: { x: 67, y: 56, giro: 18 },
  caballo: { x: 65, y: 48, giro: 22 },
};

function figura(palo: Palo, tipo: 'rey' | 'sota' | 'caballo'): Pieza[] {
  const c = COLORES[palo]!;
  const mano = MANO[tipo]!;
  return [
    {
      tipo: 'uso',
      ref: `castizo-figura-${tipo}`,
      x: 20,
      y: 16,
      ancho: 60,
      alto: 100,
      estilo: `--ropa:${c.ropa};--capa:${c.capa}`,
    },
    esLargo(palo)
      ? uso(`palo-${palo}`, mano.x, mano.y - 6, 34, mano.giro)
      : uso(`palo-${palo}`, mano.x, mano.y, 16),
  ];
}

export const CASTIZO: TemaNaipes = {
  id: 'castizo',
  papel: '#fbf7ec',
  borde: '#9d9480',
  indice: {
    fuente: "Georgia, 'Times New Roman', serif",
    peso: 700,
    color: (palo) => COLORES[palo]?.indice ?? TINTA,
  },
  paloEsquina: (palo, cx, cy, tamano) => uso(`palo-${palo}`, cx, cy, tamano),
  marco,
  cuerpo(palo, valor) {
    const f = figuraDe(palo, valor);
    if (f === 'rey' || f === 'sota' || f === 'caballo') return figura(palo, f);
    if (valor === 1) return [uso(`palo-${palo}`, 50, 70, esLargo(palo) ? 96 : 62)];
    return numeral(palo, valor);
  },
  sprite: SPRITE.texto,
};

/** Ids de los símbolos del sprite, para el test de contrato. */
export const IDS_CASTIZO = SPRITE.ids;
