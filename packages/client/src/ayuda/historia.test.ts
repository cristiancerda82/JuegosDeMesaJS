import { describe, expect, test } from 'vitest';
import { ID_JUEGOS } from '../sesion/juegos';
import { T } from '../textos';

interface Seccion {
  readonly titulo: string;
  readonly texto: readonly string[];
  readonly plegada?: true;
}

describe.each(ID_JUEGOS)('guía de %s', (juego) => {
  const secciones = T.ayuda[juego] as readonly Seccion[];

  test('termina con «Un poco de historia», plegada y con texto', () => {
    const ultima = secciones.at(-1);
    expect(ultima?.titulo).toBe('Un poco de historia');
    expect(ultima?.plegada).toBe(true);
    expect(ultima?.texto.length).toBeGreaterThan(0);
    for (const parrafo of ultima?.texto ?? []) expect(parrafo.length).toBeGreaterThan(80);
  });

  test('solo la historia va plegada', () => {
    expect(secciones.filter((s) => s.plegada)).toHaveLength(1);
  });
});
