import {
  asistir,
  comentar,
  crearAzar,
  igualesJSON,
  leer,
  type CodigoComentario,
  type CodigoMotivo,
} from '@juegos/engine';
import { describe, expect, it } from 'vitest';
import { JUEGOS, type DefJuego, type IdJuego } from '../sesion/juegos';
import { contextoAsistente } from './contexto';
import { claveConsejo, consejoDe, CONSEJOS_JUEGO, fraseLectura, fraseMotivo } from './textos';

// Contrato del modo asistido en cada juego con IA (tarea 3.7) y lo que tarda (tarea 3.8).

const MOTIVOS: readonly CodigoMotivo[] = [
  'unica',
  'gana-baza-puntos',
  'gana-baza',
  'entrega-poco',
  'guarda-carta',
  'opciones-baza',
  'arriesga-poco',
  'evita-baza',
  'evita-baza-probable',
  'gana-sin-castigo',
  'escoba',
  'captura-siete-oros',
  'captura',
  'sin-captura',
  'accion',
  'mejor-simulada',
  'mejor-media',
  'jugada',
];
const COMENTARIOS: readonly CodigoComentario[] = [
  'puntos-regalados',
  'baza-perdida',
  'triunfo-gastado',
  'castigo-evitable',
  'escoba-perdida',
  'captura-menor',
  'peor-simulada',
];

type Def = DefJuego<unknown, unknown, unknown, unknown>;
const CON_IA = (Object.entries(JUEGOS) as [IdJuego, Def][]).filter(([, def]) => def.ia !== null);

/** Decisiones del asiento 0 que se miden en cada juego, repartidas por la partida. */
const MEDIDAS = 4;
const CADA = 3;
/**
 * Sugerencia, explicación y comentario: menos de 1 s (spec modo-asistido). Como en los tests de
 * la IA (`niveles-juegos.test.ts`), el tiempo medido aquí hace de referencia del móvil medio.
 */
const MAX_MS = 1_000;

interface Medida {
  readonly juego: IdJuego;
  readonly motivos: CodigoMotivo[];
  readonly comentarios: (CodigoComentario | null)[];
  /** Frases de las jugadas de los rivales leídas. */
  readonly lecturas: string[];
  readonly lecturasMs: number;
  readonly maxMs: number;
}

/** Juega con la IA normal en todos los asientos y mide al asistente en algunas decisiones del 0. */
function medir(id: IdJuego, def: Def, semilla: string, parar?: (m: Medida) => boolean): Medida {
  const juego = def.juego;
  const config = def.configPorDefecto;
  const ctx = contextoAsistente(def, config)!;
  const r = juego.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  let e = r.valor;
  const medida: Medida = {
    juego: id,
    motivos: [],
    comentarios: [],
    lecturas: [],
    lecturasMs: 0,
    maxMs: 0,
  };
  let decisiones = 0;
  let maxMs = 0;
  let lecturasMs = 0;
  for (let paso = 0; paso < 3_000 && juego.resultado(e) === null; paso++) {
    let asiento = -1;
    let legales: readonly unknown[] = [];
    for (let i = 0; i < juego.asientos(e) && asiento === -1; i++) {
      legales = juego.accionesLegales(e, i);
      if (legales.length > 0) asiento = i;
    }
    if (asiento === -1) break;
    const vista = juego.vistaDe(e, asiento);
    const azar = crearAzar(`${semilla}/${paso}`);
    if (asiento === 0 && decisiones++ % CADA === 0) {
      const inicio = performance.now();
      const { sugerida, motivo, simulacion } = asistir(def.ia!.dificil, ctx, vista, legales, azar);
      const otra = legales.find((a) => !igualesJSON(a, sugerida)) ?? sugerida;
      const comentario = comentar(ctx, vista, sugerida, otra, azar, simulacion);
      maxMs = Math.max(maxMs, performance.now() - inicio);
      expect(legales, `${id}: sugerencia ilegal`).toContainEqual(sugerida);
      expect(sugerida, `${id}: no es la jugada de la IA difícil`).toEqual(
        def.ia!.dificil.decidir(vista, legales, azar).accion,
      );
      medida.motivos.push(motivo.codigo);
      medida.comentarios.push(comentario?.codigo ?? null);
      if (parar ? parar(medida) : medida.motivos.length >= MEDIDAS) break;
    }
    const d = def.ia!.normal.decidir(vista, legales, azar);
    if (asiento !== 0 && medida.lecturas.length < MEDIDAS) {
      const inicio = performance.now();
      const motivo = leer(ctx, vista, legales, d.accion, azar);
      lecturasMs = Math.max(lecturasMs, performance.now() - inicio);
      expect(MOTIVOS, `${id}: lectura con un motivo desconocido`).toContain(motivo.codigo);
      expect(motivo.codigo, `${id}: la lectura delata que era su única jugada`).not.toBe('unica');
      medida.lecturas.push(fraseLectura(motivo.codigo, motivo.datos, 'Rival 1'));
    }
    e = juego.transicion(e, asiento, d.accion);
  }
  return { ...medida, maxMs, lecturasMs };
}

describe('modo asistido en cada juego con IA', () => {
  it('hay 70 juegos con IA', () => {
    expect(CON_IA).toHaveLength(70);
  });

  const tiempos: string[] = [];
  it.each(CON_IA)(
    '%s: sugiere una acción legal y la explica con un motivo conocido, a tiempo',
    (id, def) => {
      const m = medir(id, def, `asistente-${id}`);
      expect(m.motivos.length, `${id}: el jugador no llegó a decidir`).toBeGreaterThan(0);
      for (const c of m.motivos) expect(MOTIVOS).toContain(c);
      for (const c of m.comentarios) if (c !== null) expect(COMENTARIOS).toContain(c);
      tiempos.push(`${id}: ${Math.round(m.maxMs)} ms (lectura ${Math.round(m.lecturasMs)} ms)`);
      expect(m.maxMs, `${id}: la sugerencia tarda demasiado`).toBeLessThan(MAX_MS);
      expect(m.lecturas.length, `${id}: ningún rival llegó a jugar`).toBeGreaterThan(0);
      for (const f of m.lecturas) {
        expect(f, `${id}: lectura mal escrita`).toMatch(/^Rival 1 .+\.$/);
        expect(f).not.toMatch(/undefined|NaN|\(\)/);
      }
      expect(m.lecturasMs, `${id}: la lectura tarda demasiado`).toBeLessThan(MAX_MS);
    },
    60_000,
  );

  it('tabla de tiempos (tarea 3.8)', () => {
    console.log(['Asistente, decisión más lenta por juego:', ...tiempos].join('\n'));
    expect(tiempos).toHaveLength(CON_IA.length);
  });
});

describe('explicaciones concretas en partidas reales', () => {
  /** Juega hasta que aparece `codigo` en una explicación (o se acaba la partida). */
  const aparece = (id: IdJuego, codigo: CodigoMotivo) =>
    medir(id, JUEGOS[id] as Def, `aparece-${id}`, (m) => m.motivos.includes(codigo)).motivos;

  it('en el Tute se explica ganar una baza con sus puntos', () => {
    expect(aparece('tute', 'gana-baza-puntos')).toContain('gana-baza-puntos');
  });

  it('en los Corazones se explica escaparse de la baza', () => {
    expect(aparece('corazones', 'evita-baza')).toContain('evita-baza');
  });

  it('en los juegos sin bazas ni captura se explica lo que simuló la IA difícil', () => {
    expect(aparece('sieteYMedia', 'mejor-simulada')).toContain('mejor-simulada');
  });

  it('en la Escoba se explica la captura', () => {
    const motivos = aparece('escoba', 'captura');
    expect(
      motivos.some((c) => c === 'captura' || c === 'escoba' || c === 'captura-siete-oros'),
    ).toBe(true);
  });
});

describe('consejos de fase', () => {
  it('cada juego con IA tiene el consejo de su jugada principal', () => {
    const sinConsejo = CON_IA.map(([id]) => id).filter((id) => !CONSEJOS_JUEGO[id]);
    expect(sinConsejo).toEqual([]);
  });

  it('las fases comunes tienen su consejo y las demás usan el de la jugada principal', () => {
    expect(claveConsejo('subasta')).toBe('subasta');
    expect(consejoDe('tuteSubastado', 'subasta')).toMatch(/pujar/);
    expect(claveConsejo('bazas')).toBe('juego');
    expect(consejoDe('brisca', 'juego')).toMatch(/Brisca/);
  });
});

describe('frases de la sugerencia', () => {
  const DATOS = { carta: 'copas-1', puntos: 3, n: 2, porcentaje: 60, ganadas: 7, total: 12 };
  it.each(MOTIVOS)('%s lleva siempre el porqué', (codigo) => {
    for (const tipo of ['jugar', 'pasar', 'descartar', 'tipoRaro']) {
      const f = fraseMotivo(codigo, { ...DATOS, tipo });
      // «Qué jugar: por qué.»
      expect(f).toMatch(/^[^:]+: .{12,}\.$/);
      expect(f).not.toMatch(/undefined|NaN|Te conviene/);
    }
  });
});
