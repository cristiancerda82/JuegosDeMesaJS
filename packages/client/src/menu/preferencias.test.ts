import { afterEach, describe, expect, it, vi } from 'vitest';
import { ID_JUEGOS } from '../sesion/juegos';
import {
  alternarFavorito,
  guardarClave,
  leerClave,
  leerFiltro,
  leerLista,
  MAX_RECIENTES,
  registrarReciente,
} from './preferencias';

describe('últimos jugados', () => {
  it('el último jugado va primero y no se repite', () => {
    let lista = registrarReciente([], 'klondike');
    lista = registrarReciente(lista, 'mus');
    lista = registrarReciente(lista, 'klondike');
    expect(lista).toEqual(['klondike', 'mus']);
  });

  it('guarda como mucho diez: el undécimo juego distinto saca al más antiguo', () => {
    const once = ID_JUEGOS.slice(0, 11);
    const lista = once.reduce(
      (l, id) => registrarReciente(l, id),
      [] as readonly (typeof once)[number][],
    );
    expect(lista).toHaveLength(MAX_RECIENTES);
    expect(lista[0]).toBe(once[10]);
    expect(lista).not.toContain(once[0]);
  });
});

describe('favoritos', () => {
  it('el último marcado va primero y marcar otra vez lo quita', () => {
    let lista = alternarFavorito([], 'brisca');
    lista = alternarFavorito(lista, 'mus');
    lista = alternarFavorito(lista, 'tute');
    expect(lista).toEqual(['tute', 'mus', 'brisca']);
    expect(alternarFavorito(lista, 'mus')).toEqual(['tute', 'brisca']);
  });
});

describe('datos guardados', () => {
  it('ignora JSON roto, otros tipos y juegos que no existen', () => {
    expect(leerLista(null)).toEqual([]);
    expect(leerLista('{roto')).toEqual([]);
    expect(leerLista('{"a":1}')).toEqual([]);
    expect(leerLista('["mus", "noExiste", 3, "mus", "tute"]')).toEqual(['mus', 'tute']);
  });

  it('el filtro inválido vuelve a «Todas»', () => {
    expect(leerFiltro('espanola')).toBe('espanola');
    expect(leerFiltro('francesa')).toBe('francesa');
    expect(leerFiltro('otra')).toBe('todas');
    expect(leerFiltro(null)).toBe('todas');
  });
});

describe('almacenamiento que falla', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('leer y guardar no lanzan errores', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('lleno');
      },
    });
    expect(leerClave('x')).toBeNull();
    expect(() => guardarClave('x', '1')).not.toThrow();
  });

  it('sin almacenamiento, leer devuelve null', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(leerClave('x')).toBeNull();
    expect(() => guardarClave('x', '1')).not.toThrow();
  });
});
