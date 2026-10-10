import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { aplicar, repetir } from '../../src/motor/aplicar';
import type { Asiento, Juego, Jugada } from '../../src/motor/contrato';
import { igualesJSON } from '../../src/motor/json';

/**
 * Suite genérica de propiedades que todo juego de la suite debe cumplir (spec motor-reglas).
 * Juega partidas al azar con fast-check y verifica cada estado visitado.
 */
export interface OpcionesContrato<C, E> {
  /** Configuraciones a probar (se elige una por partida). */
  configs: readonly C[];
  /**
   * Oráculo del test: identificadores de cartas que ese asiento (o el espectador, `null`)
   * no debe poder ver en este estado.
   */
  cartasOcultas(estado: E, asiento: Asiento | null): readonly string[];
  /** Máximo de jugadas por partida generada. Por defecto 200. */
  pasosMaximos?: number;
  /** Partidas generadas por propiedad. Por defecto 60. */
  ejecuciones?: number;
}

export const PROPIEDADES = [
  'determinismo',
  'inmutabilidad',
  'accion-ilegal',
  'serializacion',
  'fin-de-partida',
  'vistas-sin-cartas-ocultas',
] as const;
export type Propiedad = (typeof PROPIEDADES)[number];

interface Partida<C, E, A> {
  config: C;
  semilla: string;
  estados: E[];
  jugadas: Jugada<A>[];
}

const ACCION_INVENTADA = { tipo: '__accion-que-no-existe__' };

function asientosDe<E>(juego: Juego<unknown, E, unknown, unknown>, estado: E): Asiento[] {
  return Array.from({ length: juego.asientos(estado) }, (_, i) => i);
}

/** Juega eligiendo asiento y acción con los números dados, hasta que se acaben o termine. */
function jugar<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  config: C,
  semilla: string,
  elecciones: readonly number[],
  alAplicar?: (antes: E, despues: E) => void,
): Partida<C, E, A> {
  const inicio = juego.crear(config, semilla);
  if (!inicio.ok) throw new Error(`crear falló con una configuración de prueba: ${inicio.error}`);
  const partida: Partida<C, E, A> = { config, semilla, estados: [inicio.valor], jugadas: [] };
  let estado = inicio.valor;
  for (const eleccion of elecciones) {
    if (juego.resultado(estado) !== null) break;
    const conAcciones = asientosDe(juego, estado).filter(
      (a) => juego.accionesLegales(estado, a).length > 0,
    );
    if (conAcciones.length === 0) break;
    const asiento = conAcciones[eleccion % conAcciones.length]!;
    const legales = juego.accionesLegales(estado, asiento);
    const accion = legales[Math.floor(eleccion / conAcciones.length) % legales.length]!;
    const r = aplicar(juego, estado, asiento, accion);
    if (!r.ok) throw new Error(`Una acción legal fue rechazada: ${r.error}`);
    alAplicar?.(estado, r.valor);
    partida.jugadas.push({ asiento, accion });
    partida.estados.push(r.valor);
    estado = r.valor;
  }
  return partida;
}

/** Todos los strings contenidos en un valor JSON. */
function textos(valor: unknown, acumulado: Set<string> = new Set()): Set<string> {
  if (typeof valor === 'string') acumulado.add(valor);
  else if (Array.isArray(valor)) valor.forEach((v) => textos(v, acumulado));
  else if (typeof valor === 'object' && valor !== null) {
    Object.values(valor).forEach((v) => textos(v, acumulado));
  }
  return acumulado;
}

/** Comprueba una propiedad y devuelve `null` si se cumple o el informe del contraejemplo. */
export function verificarPropiedad<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  opciones: OpcionesContrato<C, E>,
  propiedad: Propiedad,
): string | null {
  const pasos = opciones.pasosMaximos ?? 200;
  const arbitrario = fc.record({
    config: fc.constantFrom(...opciones.configs),
    semilla: fc.string({ maxLength: 12 }),
    elecciones: fc.array(fc.nat({ max: 10_000 }), { minLength: pasos, maxLength: pasos }),
  });

  const comprobaciones: Record<
    Propiedad,
    (p: { config: C; semilla: string; elecciones: number[] }) => void
  > = {
    determinismo: ({ config, semilla, elecciones }) => {
      const a = jugar(juego, config, semilla, elecciones);
      const b = jugar(juego, config, semilla, elecciones);
      if (!igualesJSON(a.estados[0], b.estados[0])) throw new Error('crear no es determinista');
      const repetido = repetir(juego, { config, semilla, jugadas: a.jugadas });
      if (!repetido.ok) throw new Error(repetido.error);
      if (!igualesJSON(repetido.valor, a.estados.at(-1))) {
        throw new Error('Repetir el historial no reproduce el estado final');
      }
    },
    inmutabilidad: ({ config, semilla, elecciones }) => {
      // Foto de cada estado en el momento en que se produce...
      const fotos: string[] = [];
      const p = jugar(juego, config, semilla, elecciones, (antes, despues) => {
        if (fotos.length === 0) fotos.push(JSON.stringify(antes));
        fotos.push(JSON.stringify(despues));
      });
      // ...que ninguna transición posterior debe haber alterado.
      p.estados.forEach((e, i) => {
        if (fotos[i] !== undefined && JSON.stringify(e) !== fotos[i]) {
          throw new Error(`El estado ${i} fue modificado por una transición posterior`);
        }
      });
      for (const [i, jugada] of p.jugadas.entries()) {
        const antes = p.estados[i]!;
        const foto = JSON.stringify(antes);
        aplicar(juego, antes, jugada.asiento, jugada.accion);
        if (JSON.stringify(antes) !== foto) {
          throw new Error(`Aplicar la jugada ${i + 1} modificó el estado de entrada`);
        }
      }
    },
    'accion-ilegal': ({ config, semilla, elecciones }) => {
      const p = jugar(juego, config, semilla, elecciones);
      for (const estado of p.estados) {
        const foto = JSON.stringify(estado);
        const asientos = asientosDe(juego, estado);
        const pruebas: { asiento: Asiento; accion: unknown }[] = [
          { asiento: -1, accion: ACCION_INVENTADA },
          { asiento: asientos.length, accion: ACCION_INVENTADA },
          ...asientos.map((asiento) => ({ asiento, accion: ACCION_INVENTADA })),
        ];
        // Acciones legales de un asiento intentadas por otro que no las tiene.
        for (const dueno of asientos) {
          for (const accion of juego.accionesLegales(estado, dueno)) {
            for (const otro of asientos) {
              const legalesOtro = juego.accionesLegales(estado, otro);
              if (!legalesOtro.some((l) => igualesJSON(l, accion)))
                pruebas.push({ asiento: otro, accion });
            }
          }
        }
        for (const { asiento, accion } of pruebas) {
          const r = aplicar(juego, estado, asiento, accion as A);
          if (r.ok)
            throw new Error(`Se aceptó una acción ilegal: ${JSON.stringify({ asiento, accion })}`);
        }
        if (JSON.stringify(estado) !== foto)
          throw new Error('Una acción ilegal modificó el estado');
      }
    },
    serializacion: ({ config, semilla, elecciones }) => {
      const p = jugar(juego, config, semilla, elecciones);
      for (const estado of p.estados) {
        const copia = JSON.parse(JSON.stringify(estado)) as E;
        if (!igualesJSON(copia, estado)) throw new Error('El estado no es JSON plano');
        if (!igualesJSON(juego.resultado(copia), juego.resultado(estado))) {
          throw new Error('El resultado cambia tras serializar');
        }
        for (const asiento of [...asientosDe(juego, estado), null]) {
          if (!igualesJSON(juego.vistaDe(copia, asiento), juego.vistaDe(estado, asiento))) {
            throw new Error(`La vista del asiento ${asiento} cambia tras serializar`);
          }
          if (
            asiento !== null &&
            !igualesJSON(
              juego.accionesLegales(copia, asiento),
              juego.accionesLegales(estado, asiento),
            )
          ) {
            throw new Error(`Las acciones legales del asiento ${asiento} cambian tras serializar`);
          }
        }
      }
    },
    'fin-de-partida': ({ config, semilla, elecciones }) => {
      const p = jugar(juego, config, semilla, elecciones);
      for (const estado of p.estados) {
        const asientos = asientosDe(juego, estado);
        const conAcciones = asientos.filter((a) => juego.accionesLegales(estado, a).length > 0);
        if (juego.resultado(estado) !== null && conAcciones.length > 0) {
          throw new Error('Hay acciones legales con la partida terminada');
        }
        if (juego.resultado(estado) === null && conAcciones.length === 0) {
          throw new Error('La partida no terminó pero nadie tiene acciones legales');
        }
      }
    },
    'vistas-sin-cartas-ocultas': ({ config, semilla, elecciones }) => {
      const p = jugar(juego, config, semilla, elecciones);
      for (const estado of p.estados) {
        for (const asiento of [...asientosDe(juego, estado), null]) {
          const vista = juego.vistaDe(estado, asiento);
          if (!igualesJSON(JSON.parse(JSON.stringify(vista)), vista)) {
            throw new Error('La vista no es JSON plano');
          }
          const visibles = textos(vista);
          const filtradas = opciones
            .cartasOcultas(estado, asiento)
            .filter((id) => visibles.has(id));
          if (filtradas.length > 0) {
            throw new Error(
              `La vista del asiento ${asiento} muestra cartas ocultas: ${filtradas.join(', ')}`,
            );
          }
        }
      }
    },
  };

  const resultado = fc.check(fc.property(arbitrario, comprobaciones[propiedad]), {
    numRuns: opciones.ejecuciones ?? 60,
  });
  if (!resultado.failed) return null;
  const causa =
    resultado.errorInstance instanceof Error
      ? resultado.errorInstance.message
      : String(resultado.errorInstance);
  return `${propiedad}: ${causa}\n${fc.defaultReportMessage(resultado) ?? ''}`;
}

/** Registra en Vitest un test por propiedad del contrato. */
export function describirContrato<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  opciones: OpcionesContrato<C, E>,
): void {
  describe(`contrato del motor: ${juego.id}`, () => {
    for (const propiedad of PROPIEDADES) {
      it(propiedad, () => {
        expect(verificarPropiedad(juego, opciones, propiedad)).toBeNull();
      });
    }
  });
}
