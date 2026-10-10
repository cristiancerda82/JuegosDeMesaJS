import { describe, expect, it } from 'vitest';
import { VERSION_MOTOR } from '../src/index';

describe('humo', () => {
  it('el paquete del motor se importa', () => {
    expect(VERSION_MOTOR).toBeGreaterThan(0);
  });
});
