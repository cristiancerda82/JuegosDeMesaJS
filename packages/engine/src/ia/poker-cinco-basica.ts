import { Generador } from '../baraja/azar';
import { cartaDeId, cartasFuera, crearBaraja, type IdCarta } from '../baraja/cartas';
import { CATEGORIAS_POKER, mejorManoPoker, rangoPoker } from '../juegos/holdem-manos';
import { ordenarCambio, type AccionPokerCinco, type VistaPokerCinco } from '../juegos/poker-cinco';
import type { Agente } from './agente';

/**
 * IAs del Póker de cinco cartas (design, decisión 3): la básica juega por su jugada y cambia lo
 * que no forma parte de ella; la experta estima su probabilidad de ganar, como la del Hold'em.
 */

type Subir = Extract<AccionPokerCinco, { tipo: 'subir' }>;

const PAREJA = CATEGORIAS_POKER.indexOf('pareja');
const DOBLE_PAREJA = CATEGORIAS_POKER.indexOf('doblePareja');
const TRIO = CATEGORIAS_POKER.indexOf('trio');
const ESCALERA = CATEGORIAS_POKER.indexOf('escalera');
const JOTA = 11;

const categoria = (mano: readonly IdCarta[]) =>
  CATEGORIAS_POKER.indexOf(mejorManoPoker(mano).categoria);

/** Cuántas veces aparece cada número en la mano. */
function cuentas(mano: readonly IdCarta[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const c of mano) m.set(rangoPoker(c), (m.get(rangoPoker(c)) ?? 0) + 1);
  return m;
}

/** Si la mano tiene una pareja de J o mejor (o algo más alto que una pareja). */
function parejaDeJotas(mano: readonly IdCarta[]): boolean {
  const cat = categoria(mano);
  if (cat > PAREJA) return true;
  if (cat < PAREJA) return false;
  return [...cuentas(mano)].some(([r, n]) => n === 2 && r >= JOTA);
}

/** Las cuatro cartas del mismo palo, si las hay. */
function cuatroAlColor(mano: readonly IdCarta[]): IdCarta[] | null {
  const porPalo = new Map<string, IdCarta[]>();
  for (const c of mano) {
    const p = cartaDeId(c)!.palo;
    porPalo.set(p, [...(porPalo.get(p) ?? []), c]);
  }
  return [...porPalo.values()].find((cs) => cs.length === 4) ?? null;
}

/** Cuatro números seguidos que se pueden completar por los dos lados, si los hay. */
function escaleraAbierta(mano: readonly IdCarta[]): IdCarta[] | null {
  for (let desde = 2; desde <= 10; desde++) {
    const cartas = [0, 1, 2, 3].map((k) => mano.find((c) => rangoPoker(c) === desde + k));
    if (cartas.every((c) => c !== undefined)) return cartas as IdCarta[];
  }
  return null;
}

const tieneProyecto = (mano: readonly IdCarta[]) =>
  cuatroAlColor(mano) !== null || escaleraAbierta(mano) !== null;

/** Las cartas que cambia la IA básica (spec ia-jugadores), ordenadas. */
export function descartePokerCinco(mano: readonly IdCarta[]): IdCarta[] {
  const cat = categoria(mano);
  if (cat >= ESCALERA) return [];
  const veces = cuentas(mano);
  // Trío, doble pareja o pareja: cambia lo que no está repetido.
  if (cat >= PAREJA) return ordenarCambio(mano.filter((c) => veces.get(rangoPoker(c)) === 1));
  const proyecto = cuatroAlColor(mano) ?? escaleraAbierta(mano);
  if (proyecto) return ordenarCambio(mano.filter((c) => !proyecto.includes(c)));
  const porValor = [...mano].sort((a, b) => rangoPoker(b) - rangoPoker(a) || a.localeCompare(b));
  // Se queda con el As y cambia 4; si no, con las dos más altas.
  if (rangoPoker(porValor[0]!) === 14) return ordenarCambio(porValor.slice(1));
  return ordenarCambio(porValor.slice(2));
}

// ── Apuestas ─────────────────────────────────────────────────────────────────

function situacion(vista: VistaPokerCinco) {
  const yo = vista.asiento ?? 0;
  const aIgualar = vista.apuestaMaxima - vista.apuestas[yo]!;
  const bote = vista.aportado.reduce((s, x) => s + x, 0);
  const grande = vista.ciegas[1];
  const pila = vista.fichas[yo]! + vista.apuestas[yo]!;
  return { yo, aIgualar, bote, grande, pila };
}

/** La subida legal más cercana a `hasta` (la mínima si se pide menos, el all-in si más). */
function subirA(acciones: readonly AccionPokerCinco[], hasta: number): Subir | null {
  const subidas = acciones.filter((a): a is Subir => a.tipo === 'subir');
  if (subidas.length === 0) return null;
  const objetivo = Math.round(hasta);
  return (
    subidas.find((a) => a.hasta === objetivo) ??
    (objetivo < subidas[0]!.hasta ? subidas[0]! : subidas.at(-1)!)
  );
}

const pasarORetirarse = (acciones: readonly AccionPokerCinco[]): AccionPokerCinco =>
  acciones.find((a) => a.tipo === 'pasar') ?? { tipo: 'retirarse' };

const igualarOPasar = (acciones: readonly AccionPokerCinco[]): AccionPokerCinco =>
  acciones.find((a) => a.tipo === 'pasar' || a.tipo === 'igualar')!;

/** Probabilidad a ojo de ganar con `rivales` en la mano, a partir de la de uno solo. */
const aOjo = (base: number, rivales: number) => base ** Math.max(1, rivales);

export function elegirPokerCincoBasica(
  vista: VistaPokerCinco,
  acciones: readonly AccionPokerCinco[],
): AccionPokerCinco {
  const mano = vista.miMano ?? [];
  if (vista.fase === 'descarte') return { tipo: 'cambiar', cartas: descartePokerCinco(mano) };
  const { aIgualar, bote, grande, pila } = situacion(vista);
  const rivales = vista.cartasEnMano.filter((n, a) => n > 0 && !vista.retirados[a]).length - 1;
  const precio = aIgualar === 0 ? 0 : aIgualar / (bote + aIgualar);
  const seguirSiCompensa = (base: number) =>
    precio <= aOjo(base, rivales) ? igualarOPasar(acciones) : pasarORetirarse(acciones);
  const cat = categoria(mano);
  const nadieSubio = vista.apuestaMaxima <= grande;

  if (vista.fase === 'antes') {
    // Con pocas fichas, todo o nada.
    if (pila < 10 * grande) {
      if (parejaDeJotas(mano)) return subirA(acciones, Infinity) ?? igualarOPasar(acciones);
      return pasarORetirarse(acciones);
    }
    const objetivo = nadieSubio ? 3 * grande : 3 * vista.apuestaMaxima;
    if (cat >= TRIO) return subirA(acciones, objetivo) ?? igualarOPasar(acciones);
    if (cat === DOBLE_PAREJA) {
      return nadieSubio
        ? (subirA(acciones, objetivo) ?? igualarOPasar(acciones))
        : igualarOPasar(acciones);
    }
    if (parejaDeJotas(mano)) {
      return nadieSubio
        ? (subirA(acciones, objetivo) ?? igualarOPasar(acciones))
        : igualarOPasar(acciones);
    }
    if (cat === PAREJA) return seguirSiCompensa(0.5);
    if (tieneProyecto(mano)) return seguirSiCompensa(0.4);
    return pasarORetirarse(acciones);
  }

  // Después del descarte.
  if (cat >= ESCALERA) {
    return subirA(acciones, vista.apuestaMaxima + bote * 0.75) ?? igualarOPasar(acciones);
  }
  if (cat >= DOBLE_PAREJA) {
    if (aIgualar === 0) return subirA(acciones, bote * 0.5) ?? igualarOPasar(acciones);
    return seguirSiCompensa(0.6);
  }
  if (cat === PAREJA) return seguirSiCompensa(0.45);
  return pasarORetirarse(acciones);
}

export const iaPokerCincoBasica: Agente<VistaPokerCinco, AccionPokerCinco> = {
  id: 'poker-cinco-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirPokerCincoBasica(vista, acciones), azar };
  },
};

// ── Experta: equity ──────────────────────────────────────────────────────────

/** Simulaciones para estimar la equity antes y después del descarte. */
const SIMULACIONES_ANTES = 150;
const SIMULACIONES_DESPUES = 300;
/** Probabilidad de ir de farol cuando nadie ha apostado y la mano es mala. */
const FAROL = 0.1;
/** Intentos para darle a un rival una mano de lo que se sabe de él. */
const INTENTOS = 20;

/**
 * Probabilidad de ganar repartiendo al azar las cartas que no ve (spec niveles-ia): cinco a cada
 * rival que sigue en la mano. Antes del descarte simula también los cambios de todos. A quien ha
 * subido se le da una pareja o mejor, a quien fue servido una escalera o mejor y a quien enseñó un
 * As, ese As, si sale en unos intentos. Los empates cuentan su parte.
 */
export function equityPokerCinco(
  vista: VistaPokerCinco,
  simulaciones: number,
  g: Generador,
): number {
  const yo = vista.asiento ?? 0;
  const mano = vista.miMano ?? [];
  const rivales = vista.cartasEnMano.flatMap((n, a) =>
    a !== yo && n > 0 && !vista.retirados[a] ? [a] : [],
  );
  if (rivales.length === 0) return 1;
  const antes = vista.fase === 'antes';
  const umbral = antes ? vista.ciegas[1] : 0;
  const agresor = (a: number) =>
    vista.apuestaMaxima > umbral && vista.apuestas[a] === vista.apuestaMaxima;
  const minimo = (a: number) => {
    if (!antes && vista.cambiadas[a] === 0) return ESCALERA;
    return agresor(a) ? PAREJA : 0;
  };
  const ases = vista.asEnsenado.filter((c): c is IdCarta => c !== null);
  const ocultas = cartasFuera(crearBaraja('francesa52'), mano, ases);
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
    const robar = (m: readonly IdCarta[]) => {
      const cambia = descartePokerCinco(m);
      return [...m.filter((c) => !cambia.includes(c)), ...cambia.map(() => sacar())];
    };
    const manos = rivales.map((a) => {
      const as = vista.asEnsenado[a];
      const nueva = () =>
        as ? [as, ...Array.from({ length: 4 }, sacar)] : Array.from({ length: 5 }, sacar);
      let m = nueva();
      for (let k = 0; k < INTENTOS && categoria(m) < minimo(a); k++) {
        resto.push(...m.filter((c) => c !== as));
        m = nueva();
      }
      return m;
    });
    const finales = antes ? manos.map(robar) : manos;
    const mia = antes ? robar(mano) : mano;
    const mio = mejorManoPoker(mia).valor;
    const valores = finales.map((m) => mejorManoPoker(m).valor);
    const mejorRival = Math.max(...valores);
    if (mio > mejorRival) ganadas += 1;
    else if (mio === mejorRival) ganadas += 1 / (1 + valores.filter((v) => v === mio).length);
  }
  return ganadas / simulaciones;
}

export function elegirPokerCincoExperta(
  vista: VistaPokerCinco,
  acciones: readonly AccionPokerCinco[],
  g: Generador,
): AccionPokerCinco {
  // Las cartas que cambia, como la normal.
  if (vista.fase === 'descarte') return elegirPokerCincoBasica(vista, acciones);
  const { aIgualar, bote } = situacion(vista);
  const enMano = vista.cartasEnMano.filter((n, a) => n > 0 && !vista.retirados[a]).length;
  const equity = equityPokerCinco(
    vista,
    vista.fase === 'antes' ? SIMULACIONES_ANTES : SIMULACIONES_DESPUES,
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

export const iaPokerCincoExperta: Agente<VistaPokerCinco, AccionPokerCinco> = {
  id: 'poker-cinco-experta',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (acciones.length === 1) return { accion: acciones[0]!, azar };
    const g = new Generador(azar);
    const accion = elegirPokerCincoExperta(vista, acciones, g);
    return { accion, azar: g.estado() };
  },
};
