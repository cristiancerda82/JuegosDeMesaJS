import { describe, expect, it } from 'vitest';
import { aplicar, repetir } from '../../src/motor/aplicar';
import { igualesJSON } from '../../src/motor/json';
import {
  juguete,
  jugueteNoDeterminista,
  jugueteQueFiltra,
  jugueteQueMuta,
  ocultasJuguete,
} from './juego-juguete';
import { describirContrato, verificarPropiedad } from './verificar-contrato';

const opciones = {
  configs: [{ cartas: 1 }, { cartas: 5 }],
  cartasOcultas: ocultasJuguete,
  pasosMaximos: 12,
};

describirContrato(juguete, opciones);

describe('la suite del contrato detecta juegos defectuosos', () => {
  it('una vista que muestra manos ajenas', () => {
    expect(verificarPropiedad(jugueteQueFiltra, opciones, 'vistas-sin-cartas-ocultas')).toMatch(
      /cartas ocultas/,
    );
  });

  it('una transición que modifica el estado de entrada', () => {
    expect(verificarPropiedad(jugueteQueMuta, opciones, 'inmutabilidad')).not.toBeNull();
  });

  it('una creación que no depende solo de la semilla', () => {
    expect(verificarPropiedad(jugueteNoDeterminista, opciones, 'determinismo')).not.toBeNull();
  });
});

describe('aplicar', () => {
  const inicio = juguete.crear({ cartas: 3 }, 'aplicar');
  if (!inicio.ok) throw new Error(inicio.error);
  const estado = inicio.valor;
  const [primera] = juguete.accionesLegales(estado, 0);

  it('acepta una acción legal y devuelve un estado nuevo', () => {
    const r = aplicar(juguete, estado, 0, primera!);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.valor).not.toBe(estado);
  });

  it('compara acciones por estructura, no por referencia ni orden de claves', () => {
    const misma = JSON.parse(JSON.stringify({ carta: primera!.carta, tipo: 'jugar' }));
    expect(aplicar(juguete, estado, 0, misma).ok).toBe(true);
  });

  it('rechaza el asiento fuera de turno, inexistente o con la partida terminada', () => {
    expect(aplicar(juguete, estado, 1, primera!)).toMatchObject({ ok: false });
    expect(aplicar(juguete, estado, 2, primera!)).toMatchObject({ ok: false, error: /Asiento/ });
    let e = juguete.crear({ cartas: 1 }, 'fin');
    if (!e.ok) throw new Error(e.error);
    for (const asiento of [0, 1]) {
      const [accion] = juguete.accionesLegales(e.valor, asiento);
      if (accion) e = aplicar(juguete, e.valor, asiento, accion);
      if (!e.ok) throw new Error(e.error);
    }
    expect(juguete.resultado(e.valor)).not.toBeNull();
    expect(aplicar(juguete, e.valor, 0, primera!)).toMatchObject({ ok: false, error: /terminó/ });
  });
});

describe('repetir', () => {
  it('reconstruye el mismo estado desde el registro', () => {
    const r = juguete.crear({ cartas: 2 }, 'repetir');
    if (!r.ok) throw new Error(r.error);
    const a1 = juguete.accionesLegales(r.valor, 0)[1]!;
    const e1 = aplicar(juguete, r.valor, 0, a1);
    if (!e1.ok) throw new Error(e1.error);
    const a2 = juguete.accionesLegales(e1.valor, 1)[0]!;
    const e2 = aplicar(juguete, e1.valor, 1, a2);
    if (!e2.ok) throw new Error(e2.error);
    const jugadas = [
      { asiento: 0, accion: a1 },
      { asiento: 1, accion: a2 },
    ];
    const repetido = repetir(juguete, { config: { cartas: 2 }, semilla: 'repetir', jugadas });
    expect(repetido.ok && igualesJSON(repetido.valor, e2.valor)).toBe(true);
  });

  it('informa qué jugada no se pudo repetir', () => {
    const r = repetir(juguete, {
      config: { cartas: 2 },
      semilla: 'repetir',
      jugadas: [{ asiento: 1, accion: { tipo: 'jugar', carta: 'oros-1' } }],
    });
    expect(r).toMatchObject({ ok: false, error: /jugada 1/ });
  });

  it('propaga el error de una configuración inválida', () => {
    expect(repetir(juguete, { config: { cartas: 0 }, semilla: 'x', jugadas: [] }).ok).toBe(false);
  });
});

describe('igualesJSON', () => {
  it('ignora el orden de las claves y distingue arrays de objetos', () => {
    expect(igualesJSON({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(igualesJSON([1, 2], { 0: 1, 1: 2 })).toBe(false);
    expect(igualesJSON({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(igualesJSON(null, {})).toBe(false);
  });
});
