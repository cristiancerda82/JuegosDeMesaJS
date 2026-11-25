import { afterEach, describe, expect, it, vi } from 'vitest';
import { enlaceSala, leerInvitacion, sinInvitacion, URL_PUBLICA } from './invitacion';
import { servidorPorDefecto } from './red.svelte';

const BASE = 'https://ejemplo.github.io/Juegos/';

afterEach(() => vi.unstubAllGlobals());

describe('enlace de una sala', () => {
  it('con el servidor por defecto solo lleva el código', () => {
    expect(enlaceSala('XCCRB', servidorPorDefecto(), BASE)).toBe(`${BASE}?sala=XCCRB`);
  });

  it('con otro servidor lo añade', () => {
    const enlace = enlaceSala('XCCRB', 'wss://otro.example', BASE);
    expect(new URL(enlace).searchParams.get('servidor')).toBe('wss://otro.example');
  });

  it('quita los parámetros de la página (como ?rapido)', () => {
    expect(enlaceSala('XCCRB', servidorPorDefecto(), `${BASE}?rapido#x`)).toBe(
      `${BASE}?sala=XCCRB`,
    );
  });

  it('en la app usa la dirección pública, no https://localhost', () => {
    vi.stubGlobal('Capacitor', { isNativePlatform: () => true });
    expect(enlaceSala('XCCRB', servidorPorDefecto())).toBe(`${URL_PUBLICA}?sala=XCCRB`);
  });
});

describe('leer una invitación', () => {
  it('lee el código, en mayúsculas', () => {
    expect(leerInvitacion(`${BASE}?sala=xccrb`)).toEqual({ codigo: 'XCCRB', servidor: null });
  });

  it('ignora los códigos mal formados y las direcciones sin invitación', () => {
    expect(leerInvitacion(`${BASE}?sala=ABC`)).toBeNull();
    expect(leerInvitacion(`${BASE}?sala=OIABC`)).toBeNull();
    expect(leerInvitacion(BASE)).toBeNull();
    expect(leerInvitacion('no es una dirección')).toBeNull();
  });

  it('acepta un servidor wss:// y descarta lo que no es un servidor', () => {
    expect(leerInvitacion(`${BASE}?sala=XCCRB&servidor=wss://otro.example`)?.servidor).toBe(
      'wss://otro.example',
    );
    expect(leerInvitacion(`${BASE}?sala=XCCRB&servidor=javascript:alert(1)`)?.servidor).toBeNull();
  });

  it('en la app descarta un servidor ws://', () => {
    vi.stubGlobal('Capacitor', { isNativePlatform: () => true });
    expect(leerInvitacion(`${BASE}?sala=XCCRB&servidor=ws://192.168.1.20:8787`)).toEqual({
      codigo: 'XCCRB',
      servidor: null,
    });
  });

  it('sinInvitacion deja la dirección sin la sala ni el servidor', () => {
    expect(sinInvitacion(`${BASE}?rapido&sala=XCCRB&servidor=wss://x`)).toBe(`${BASE}?rapido=`);
  });
});
