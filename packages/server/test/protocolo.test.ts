import { describe, expect, it } from 'vitest';
import { leerMensajeCliente, normalizarCodigo, TAMANO_MAXIMO } from '../src/protocolo';

const leer = (m: unknown) => leerMensajeCliente(JSON.stringify(m));

describe('mensajes del cliente', () => {
  it('acepta los mensajes válidos', () => {
    expect(
      leer({ tipo: 'crear', juego: 'mus', config: { reyes: 8 }, nivel: 'normal', nombre: ' Ana ' }),
    ).toEqual({
      tipo: 'crear',
      juego: 'mus',
      config: { reyes: 8 },
      nivel: 'normal',
      nombre: 'Ana',
    });
    expect(leer({ tipo: 'unirse', codigo: 'ABCDE', nombre: 'Luis' })).toMatchObject({
      tipo: 'unirse',
    });
    expect(leer({ tipo: 'volver', codigo: 'ABCDE', testigo: 'x'.repeat(32) })).toMatchObject({
      tipo: 'volver',
    });
    expect(leer({ tipo: 'asiento', asiento: 2 })).toEqual({ tipo: 'asiento', asiento: 2 });
    expect(leer({ tipo: 'jugar', accion: { tipo: 'jugar', carta: 'oros-1' }, n: 3 })).toMatchObject(
      {
        tipo: 'jugar',
        n: 3,
      },
    );
    expect(leer({ tipo: 'pausa', activa: true })).toEqual({ tipo: 'pausa', activa: true });
    for (const tipo of ['empezar', 'revancha', 'salir', 'ping'])
      expect(leer({ tipo })).toEqual({ tipo });
  });

  it('rechaza los mensajes inválidos', () => {
    expect(leerMensajeCliente('no es json')).toBeNull();
    expect(leer(['crear'])).toBeNull();
    expect(leer({ tipo: 'otro' })).toBeNull();
    expect(
      leer({ tipo: 'crear', juego: 'klondike', config: {}, nivel: 'normal', nombre: 'A' }),
    ).toBeNull();
    expect(
      leer({ tipo: 'crear', juego: 'mus', config: {}, nivel: 'experto', nombre: 'A' }),
    ).toBeNull();
    expect(
      leer({ tipo: 'crear', juego: 'mus', config: {}, nivel: 'normal', nombre: '   ' }),
    ).toBeNull();
    expect(leer({ tipo: 'unirse', codigo: 'ABCDE', nombre: 'x'.repeat(21) })).toBeNull();
    // La O y la I no forman parte de los códigos.
    expect(leer({ tipo: 'unirse', codigo: 'OIABC', nombre: 'Ana' })).toBeNull();
    expect(leer({ tipo: 'asiento', asiento: -1 })).toBeNull();
    expect(leer({ tipo: 'jugar', accion: {}, n: 1.5 })).toBeNull();
    expect(leer({ tipo: 'pausa', activa: 'si' })).toBeNull();
    expect(leerMensajeCliente(' '.repeat(TAMANO_MAXIMO + 1))).toBeNull();
  });

  it('normaliza el código escrito', () => {
    expect(normalizarCodigo(' ab cde ')).toBe('ABCDE');
  });
});
