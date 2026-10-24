import { Generador } from '../baraja/azar';
import { cartaDeId, cartasFuera, crearBaraja, type IdCarta } from '../baraja/cartas';
import {
  CATEGORIAS_POKER,
  mejorManoPoker,
  rangoPoker,
  valorMejorMano,
  type AccionHoldem,
  type VistaHoldem,
} from '../juegos/holdem';
import type { Agente } from './agente';

/**
 * IAs del Texas Hold'em (design, decisión 6): la básica juega por la fuerza de su mano; la
 * experta estima su probabilidad de ganar y la compara con las probabilidades del bote.
 */

type Subir = Extract<AccionHoldem, { tipo: 'subir' }>;

/** Lo que tiene que poner para igualar, el bote entero y sus datos. */
function situacion(vista: VistaHoldem) {
  const yo = vista.asiento ?? 0;
  const aIgualar = vista.apuestaMaxima - vista.apuestas[yo]!;
  const bote = vista.aportado.reduce((s, x) => s + x, 0);
  const grande = vista.ciegas[1];
  const pila = vista.fichas[yo]! + vista.apuestas[yo]!;
  return { yo, aIgualar, bote, grande, pila };
}

/** La subida legal más cercana a `hasta` (la mínima si se pide menos, el all-in si más). */
function subirA(acciones: readonly AccionHoldem[], hasta: number): Subir | null {
  const subidas = acciones.filter((a): a is Subir => a.tipo === 'subir');
  if (subidas.length === 0) return null;
  const objetivo = Math.round(hasta);
  return (
    subidas.find((a) => a.hasta === objetivo) ??
    (objetivo < subidas[0]!.hasta ? subidas[0]! : subidas.at(-1)!)
  );
}

const pasarORetirarse = (acciones: readonly AccionHoldem[]): AccionHoldem =>
  acciones.find((a) => a.tipo === 'pasar') ?? { tipo: 'retirarse' };

const igualarOPasar = (acciones: readonly AccionHoldem[]): AccionHoldem =>
  acciones.find((a) => a.tipo === 'pasar' || a.tipo === 'igualar')!;

/** Puntuación de las dos cartas antes del flop, al estilo de la fórmula de Chen. */
export function puntosPreflop(mano: readonly IdCarta[]): number {
  const [x, y] = mano.map(rangoPoker).sort((a, b) => b - a) as [number, number];
  const alta = (r: number) => (r === 14 ? 10 : r === 13 ? 8 : r === 12 ? 7 : r === 11 ? 6 : r / 2);
  let puntos = alta(x);
  if (x === y) return Math.max(5, puntos * 2);
  if (cartaDeId(mano[0]!)!.palo === cartaDeId(mano[1]!)!.palo) puntos += 2;
  const hueco = x - y - 1;
  puntos -= [0, 1, 2, 4, 5][Math.min(hueco, 4)]!;
  if (hueco <= 1 && x < 12) puntos += 1;
  return puntos;
}

/** Proyecto de color o de escalera abierta con las cartas propias. */
function tieneProyecto(mano: readonly IdCarta[], comunes: readonly IdCarta[]): boolean {
  if (comunes.length >= 5) return false;
  const todas = [...mano, ...comunes];
  const porPalo = new Map<string, number>();
  for (const c of todas)
    porPalo.set(cartaDeId(c)!.palo, (porPalo.get(cartaDeId(c)!.palo) ?? 0) + 1);
  const color = mano.some((c) => porPalo.get(cartaDeId(c)!.palo)! >= 4);
  const rangos = new Set(todas.map(rangoPoker));
  if (rangos.has(14)) rangos.add(1);
  let escalera = false;
  for (let desde = 1; desde <= 11 && !escalera; desde++) {
    escalera = [0, 1, 2, 3].every((k) => rangos.has(desde + k));
  }
  return color || escalera;
}

/** Fuerza tras el flop: 2 jugada fuerte, 1 pareja baja, 0 nada. */
function fuerzaPostflop(mano: readonly IdCarta[], comunes: readonly IdCarta[]): 0 | 1 | 2 {
  const m = mejorManoPoker([...mano, ...comunes]);
  const categoria = CATEGORIAS_POKER.indexOf(m.categoria);
  if (categoria >= 2) return 2;
  if (categoria === 1) {
    // Pareja alta: con la carta más alta de la mesa, o pareja en mano por encima de la mesa.
    const mesaAlta = Math.max(...comunes.map(rangoPoker));
    const propias = mano.map(rangoPoker);
    const parejaEnMano = propias[0] === propias[1];
    const conLaAlta = propias.includes(mesaAlta);
    if (conLaAlta || (parejaEnMano && propias[0]! > mesaAlta)) return 2;
    return 1;
  }
  return 0;
}

/**
 * Probabilidad aproximada de ganar según la fuerza de la mano contra un rival (`base`), con
 * `rivales` en la mano: la básica no simula, solo estima a ojo.
 */
const aOjo = (base: number, rivales: number) => base ** Math.max(1, rivales);

export function elegirHoldemBasica(
  vista: VistaHoldem,
  acciones: readonly AccionHoldem[],
): AccionHoldem {
  const mano = vista.miMano ?? [];
  const { aIgualar, bote, grande, pila } = situacion(vista);
  const rivales = vista.cartasEnMano.filter((n, a) => n > 0 && !vista.retirados[a]).length - 1;
  // Lo que cuesta seguir frente a lo que hay en juego (las probabilidades del bote).
  const precio = aIgualar === 0 ? 0 : aIgualar / (bote + aIgualar);
  const seguirSiCompensa = (base: number) =>
    precio <= aOjo(base, rivales) ? igualarOPasar(acciones) : pasarORetirarse(acciones);

  if (vista.fase === 'preflop') {
    const puntos = puntosPreflop(mano);
    // Con pocas fichas, todo o nada.
    if (pila < 10 * grande) {
      if (puntos >= 8) return subirA(acciones, Infinity) ?? igualarOPasar(acciones);
      return pasarORetirarse(acciones);
    }
    const objetivo = vista.apuestaMaxima <= grande ? 3 * grande : 3 * vista.apuestaMaxima;
    // Las mejores: sube, o resube si son muy buenas; si no, iguala lo que sea.
    if (puntos >= 10) {
      if (vista.apuestaMaxima <= grande || puntos >= 12) {
        return subirA(acciones, objetivo) ?? igualarOPasar(acciones);
      }
      return igualarOPasar(acciones);
    }
    // Buenas: abre subiendo.
    if (puntos >= 8 && vista.apuestaMaxima <= grande) {
      return subirA(acciones, objetivo) ?? igualarOPasar(acciones);
    }
    // El resto, si el precio lo compensa: de un 35 % a un 65 % contra un rival, según las cartas.
    return seguirSiCompensa(Math.min(0.35 + 0.03 * puntos, 0.65));
  }

  const fuerza = fuerzaPostflop(mano, vista.comunes);
  if (fuerza === 2) {
    if (aIgualar === 0) return subirA(acciones, bote * 0.75) ?? igualarOPasar(acciones);
    const m = mejorManoPoker([...mano, ...vista.comunes]);
    if (CATEGORIAS_POKER.indexOf(m.categoria) >= 3) {
      return subirA(acciones, vista.apuestaMaxima + bote * 0.75) ?? igualarOPasar(acciones);
    }
    return igualarOPasar(acciones);
  }
  if (fuerza === 1) return seguirSiCompensa(0.55);
  if (tieneProyecto(mano, vista.comunes)) return seguirSiCompensa(0.35);
  return pasarORetirarse(acciones);
}

export const iaHoldemBasica: Agente<VistaHoldem, AccionHoldem> = {
  id: 'holdem-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirHoldemBasica(vista, acciones), azar };
  },
};

// ── Experta: equity ──────────────────────────────────────────────────────────

/** Simulaciones para estimar la equity tras el flop y antes. */
const SIMULACIONES = 300;
const SIMULACIONES_PREFLOP = 150;
/** Probabilidad de ir de farol cuando nadie ha apostado y la mano es mala. */
const FAROL = 0.1;

/** Quien ha apostado o subido en la ronda tiene, casi siempre, una mano jugable. */
const MINIMO_AGRESOR = 7;
/** Intentos para darle a un agresor una mano de su rango antes de quedarse con la que salga. */
const INTENTOS_RANGO = 20;

/**
 * Probabilidad de ganar repartiendo al azar las cartas que no ve: dos a cada rival que sigue en
 * la mano y las comunes que faltan. A quien ha apostado o subido en la ronda se le dan manos de
 * su rango (las jugables antes del flop), como haría un jugador. Los empates cuentan su parte.
 */
export function equityHoldem(vista: VistaHoldem, simulaciones: number, g: Generador): number {
  const yo = vista.asiento ?? 0;
  const mano = vista.miMano ?? [];
  const rivales = vista.cartasEnMano.flatMap((n, a) =>
    a !== yo && n > 0 && !vista.retirados[a] ? [a] : [],
  );
  if (rivales.length === 0) return 1;
  const ciegaGrande = vista.ciegas[1];
  const umbral = vista.fase === 'preflop' ? ciegaGrande : 0;
  const agresor = (a: number) =>
    vista.apuestaMaxima > umbral && vista.apuestas[a] === vista.apuestaMaxima;
  const ocultas = cartasFuera(crearBaraja('francesa52'), mano, vista.comunes);
  const faltan = 5 - vista.comunes.length;
  let ganadas = 0;
  for (let s = 0; s < simulaciones; s++) {
    const resto = [...ocultas];
    const sacar = () => {
      const i = g.enteroHasta(resto.length);
      const carta = resto[i]!;
      resto[i] = resto[resto.length - 1]!;
      resto.pop();
      return carta;
    };
    const manos = rivales.map((a) => {
      let par = [sacar(), sacar()];
      for (
        let k = 0;
        agresor(a) && puntosPreflop(par) < MINIMO_AGRESOR && k < INTENTOS_RANGO;
        k++
      ) {
        resto.push(...par);
        par = [sacar(), sacar()];
      }
      return par;
    });
    const comunes = [...vista.comunes, ...Array.from({ length: faltan }, sacar)];
    const mio = valorMejorMano([...mano, ...comunes]);
    const valores = manos.map((par) => valorMejorMano([...par, ...comunes]));
    const mejorRival = Math.max(...valores);
    if (mio > mejorRival) ganadas += 1;
    else if (mio === mejorRival) ganadas += 1 / (1 + valores.filter((v) => v === mio).length);
  }
  return ganadas / simulaciones;
}

export function elegirHoldemExperta(
  vista: VistaHoldem,
  acciones: readonly AccionHoldem[],
  g: Generador,
): AccionHoldem {
  const { aIgualar, bote } = situacion(vista);
  const enMano = vista.cartasEnMano.filter((n, a) => n > 0 && !vista.retirados[a]).length;
  const equity = equityHoldem(
    vista,
    vista.fase === 'preflop' ? SIMULACIONES_PREFLOP : SIMULACIONES,
    g,
  );
  const justa = 1 / Math.max(1, enMano);
  const precio = aIgualar === 0 ? 0 : aIgualar / (bote + aIgualar);

  // Buena ventaja: apuesta o sube entre medio bote y el bote.
  if (equity > justa * 1.5 && equity > precio) {
    const tamano = bote * Math.min(1, 0.5 + (equity - justa));
    const subida = subirA(acciones, vista.apuestaMaxima + Math.max(tamano, vista.ciegas[1]));
    if (subida) return subida;
    return igualarOPasar(acciones);
  }
  if (equity >= precio) {
    // Farol de vez en cuando si nadie ha apostado y la mano no da para seguir.
    if (aIgualar === 0 && equity < justa && g.enteroHasta(1000) < FAROL * 1000) {
      const farol = subirA(acciones, bote * 0.5);
      if (farol) return farol;
    }
    return igualarOPasar(acciones);
  }
  return pasarORetirarse(acciones);
}

export const iaHoldemExperta: Agente<VistaHoldem, AccionHoldem> = {
  id: 'holdem-experta',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (acciones.length === 1) return { accion: acciones[0]!, azar };
    const g = new Generador(azar);
    const accion = elegirHoldemExperta(vista, acciones, g);
    return { accion, azar: g.estado() };
  },
};
