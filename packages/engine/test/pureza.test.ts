import { describe, expect, it } from 'vitest';
import paquete from '../package.json' with { type: 'json' };

// El resto de la pureza (sin DOM, Node, hora ni Math.random) lo garantizan
// el tsconfig del motor y las reglas de ESLint para packages/engine/src.
describe('pureza del motor', () => {
  it('no tiene dependencias de runtime', () => {
    const dependencias = (paquete as { dependencies?: Record<string, string> }).dependencies ?? {};
    expect(Object.keys(dependencias)).toEqual([]);
  });
});
