import { Generador, type EstadoAzar } from '../../baraja/azar';
import {
  bandoPinacle,
  cartasDe,
  cartasPinacle,
  pinacle,
  puntosCartaPinacle,
  valorCombinacion,
  type AccionPinacle,
  type ConfigPinacle,
  type EstadoPinacle,
  type VistaPinacle,
} from '../../juegos/pinacle';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { descartesOrdenados } from '../pinacle-basica';
import { bonoPartida, Ocultas } from './comun';

/** Montón y mano a partir de los que no se simula. */
const MONTON_GRANDE = 10;
const MANO_GRANDE = 18;

/** Descartes que se simulan: los mejores para la normal. */
const DESCARTES_SIMULADOS = 3;

/** Intentos para que el rival que se llevó el montón pueda bajar su carta de arriba. */
const INTENTOS = 100;

/**
 * Un estado de Pinacle coherente con la vista: las manos ajenas (con las cartas que cada uno se
 * llevó del montón, que se conocen) y el mazo, al azar entre las cartas que no se ven.
 */
export function reconstruirPinacle(vista: VistaPinacle, azar: EstadoAzar): EstadoPinacle {
  const g = new Generador(azar);
  let estado = repartirOcultas(vista, azar);
  // Un rival que se llevó el montón tiene en la mano cartas para bajar su carta de arriba.
  const debe = vista.debeBajar !== null && vista.turno !== null && vista.turno !== vista.asiento;
  for (let intento = 1; debe && intento < INTENTOS; intento++) {
    if (pinacle.accionesLegales(estado, vista.turno!).length > 0) break;
    estado = repartirOcultas(vista, [g.siguiente(), g.siguiente(), g.siguiente(), 1]);
  }
  return estado;
}

function repartirOcultas(vista: VistaPinacle, azar: EstadoAzar): EstadoPinacle {
  const vistas = new Set([
    ...(vista.miMano ?? []),
    ...vista.monton,
    ...vista.combinaciones.flatMap(cartasDe),
    ...vista.conocidas.flat(),
  ]);
  const ocultas = new Ocultas(
    cartasPinacle().filter((c) => !vistas.has(c)),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    const conocidas = vista.conocidas[a]!;
    return [...ocultas.tomar(n - conocidas.length), ...conocidas];
  });
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    repartidor: vista.repartidor,
    turno: vista.turno ?? 0,
    fase: vista.fase,
    numeroTurno: vista.numeroTurno,
    manos,
    mazo: ocultas.tomar(vista.cartasEnMazo),
    monton: [...vista.monton],
    conocidas: vista.conocidas.map((c) => [...c]),
    combinaciones: [...vista.combinaciones],
    siguienteId: vista.siguienteId,
    debeBajar: vista.debeBajar,
    puntos: [...vista.puntos],
    puntosInicioMano: [...vista.puntosInicioMano],
    barbele: [...vista.barbele],
    abierto: [...vista.abierto],
    bajo: [...vista.bajo],
    penalizaciones: [...vista.penalizaciones],
    cambios: [...vista.cambios],
    cambiosTurno: vista.cambiosTurno,
    turnoActual: vista.turnoActual,
    ultimaAccion: vista.ultimaAccion,
    ultimaMano: vista.ultimaMano,
    terminada: vista.turno === null,
  };
}

/** Lo que va sumando un bando en la mano si terminara ahora, sin premios por cerrar. */
function provisional(e: EstadoPinacle, bando: number): number {
  const enMesa = e.combinaciones
    .filter((c) => c.bando === bando)
    .reduce((s, c) => s + valorCombinacion(c).valor, 0);
  const enMano = e.manos
    .filter((_, a) => bandoPinacle(a) === bando)
    .flat()
    .reduce((s, c) => s + puntosCartaPinacle(c), 0);
  return enMesa - enMano + e.cambios[bando]! - 50 * e.penalizaciones[bando]!;
}

/** Lo que ha sumado cada bando en la mano de `inicio`, terminada o no en `final`. */
function sumaDeLaMano(inicio: EstadoPinacle, final: EstadoPinacle, bando: number): number {
  const cerrada = final.ultimaMano;
  if (cerrada && cerrada.numero === inicio.numeroMano) return cerrada.desglose[bando]!.total;
  return provisional(final, bando);
}

export const SIMULABLE_PINACLE: Simulable<
  ConfigPinacle,
  EstadoPinacle,
  AccionPinacle,
  VistaPinacle
> = {
  juego: pinacle,
  reconstruir: reconstruirPinacle,
  manoTerminada: (inicio, e) => e.numeroMano > inicio.numeroMano || e.terminada,
  valorar(inicio, final, asiento: Asiento) {
    const mio = bandoPinacle(asiento);
    return (
      sumaDeLaMano(inicio, final, mio) -
      sumaDeLaMano(inicio, final, 1 - mio) +
      bonoPartida(pinacle.resultado(final), asiento)
    );
  },
  // Con un montón o unas manos grandes, cada jugada simulada cuesta mucho más (quien se lleva el
  // montón acaba con muchas cartas): ahí decide la normal, para no pasar de 250 ms.
  decideLaBase: (vista) =>
    vista.monton.length >= MONTON_GRANDE || vista.cartasEnMano.some((n) => n > MANO_GRANDE),
  // Solo se simula robar (mazo o montón) y qué descartar; lo que se baja lo decide la normal.
  candidatas(vista, acciones, deLaBase) {
    if (vista.fase === 'robar') return acciones;
    if (deLaBase.tipo === 'descartar') {
      return descartesOrdenados(vista, acciones).slice(0, DESCARTES_SIMULADOS);
    }
    return [deLaBase];
  },
  reconstrucciones: 6,
  presupuesto: 18,
  // Las manos son largas: se simulan unos turnos y se valora lo que hay en ese punto.
  horizonte: 12,
};
