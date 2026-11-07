import { describe, expect, it } from 'vitest';
import { ID_JUEGOS, JUEGOS } from '../sesion/juegos';
import {
  CATALOGO,
  FAMILIAS,
  juegosDeFamilia,
  juegosEnOrden,
  normalizar,
  pasaFiltro,
} from './catalogo';

describe('catálogo del menú', () => {
  it('tiene todos los juegos de la suite, y solo esos', () => {
    expect(Object.keys(CATALOGO).sort()).toEqual([...ID_JUEGOS].sort());
  });

  it('cada juego aparece exactamente una vez al recorrer las familias', () => {
    const recorridos = FAMILIAS.flatMap((f) => juegosDeFamilia(f.id));
    expect(recorridos).toHaveLength(ID_JUEGOS.length);
    expect(new Set(recorridos).size).toBe(ID_JUEGOS.length);
    expect(juegosEnOrden()).toEqual(recorridos);
  });

  it('cada familia tiene al menos un juego', () => {
    for (const f of FAMILIAS) expect(juegosDeFamilia(f.id).length).toBeGreaterThan(0);
  });

  it('clasifica los juegos como la tabla del spec', () => {
    expect(juegosDeFamilia('solitarios')).toHaveLength(11);
    expect(juegosDeFamilia('bazasPuntos')).toHaveLength(19);
    expect(juegosDeFamilia('bazasContrato')).toHaveLength(14);
    expect(juegosDeFamilia('bazasEvitar')).toEqual(['corazones', 'barbu', 'rentz']);
    expect(juegosDeFamilia('combinaciones')).toHaveLength(8);
    expect(juegosDeFamilia('captura')).toHaveLength(6);
    expect(juegosDeFamilia('descarte')).toHaveLength(10);
    expect(juegosDeFamilia('envite')).toHaveLength(7);
  });

  it('cada juego tiene al menos una baraja, descripción y tres cartas', () => {
    for (const id of ID_JUEGOS) {
      expect(CATALOGO[id].barajas.length).toBeGreaterThan(0);
      expect(CATALOGO[id].desc.length).toBeGreaterThan(0);
      expect(CATALOGO[id].cartas).toHaveLength(3);
    }
  });

  it('filtra por baraja como los ejemplos del spec', () => {
    for (const id of ['brisca', 'tute', 'guinote'] as const)
      expect(pasaFiltro(id, 'espanola')).toBe(true);
    expect(pasaFiltro('skat', 'espanola')).toBe(false);
    expect(juegosDeFamilia('solitarios').some((id) => pasaFiltro(id, 'espanola'))).toBe(false);
    expect(pasaFiltro('tarot', 'francesa')).toBe(true);
    for (const id of ID_JUEGOS) expect(pasaFiltro(id, 'todas')).toBe(true);
  });

  it('normaliza sin tildes ni mayúsculas', () => {
    expect(normalizar(JUEGOS.guinote.nombre)).toContain('guinote');
    expect(normalizar('  ÉCARTÉ ')).toBe('ecarte');
  });
});
