import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, esComodin, PALOS_FRANCESES, type PaloFrances } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { basePinacle, cartasPinacle, type CartaPinacle } from './pinacle-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Carta de la Canasta: las mismas 108 del Pinacle, p. ej. "picas-12#1". */
export type CartaCanasta = CartaPinacle;

export interface ConfigCanasta {
  /** 4 jugadores en dos parejas: 0 y 2 contra 1 y 3. */
  readonly jugadores: 4;
}

export const CONFIG_CANASTA_POR_DEFECTO: ConfigCanasta = { jugadores: 4 };

/** Puntos con los que termina la partida. */
export const OBJETIVO_CANASTA = 5000;
export const CARTAS_MANO_CANASTA = 11;
/** Cartas de una canasta. */
export const TAMANO_CANASTA = 7;
export const MAXIMO_COMODINES_CANASTA = 3;
export const PREMIO_CANASTA_LIMPIA = 500;
export const PREMIO_CANASTA_SUCIA = 300;
export const PREMIO_CIERRE_CANASTA = 100;

export interface CombinacionCanasta {
  readonly id: number;
  readonly bando: number;
  /** Valor de la carta (1 el As; 3 los treses negros). */
  readonly valor: number;
  readonly cartas: readonly CartaCanasta[];
}

export type AccionCanasta =
  | { readonly tipo: 'robar' }
  | {
      readonly tipo: 'tomarPozo';
      /** Cartas de la mano que van con la de arriba. */
      readonly cartas: readonly CartaCanasta[];
      /** La combinación de la pareja a la que va la de arriba; `null` si es nueva. */
      readonly combinacion: number | null;
    }
  | { readonly tipo: 'bajar'; readonly cartas: readonly CartaCanasta[] }
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly cartas: readonly CartaCanasta[];
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'descartar'; readonly carta: CartaCanasta }
  | { readonly tipo: 'acabar' };

/** La primera bajada en curso de una pareja, mientras no llega al mínimo. */
export interface AperturaCanasta {
  /** Las combinaciones al empezar a bajar (con la del pozo, si se lo llevó). */
  readonly combinaciones: readonly CombinacionCanasta[];
  readonly siguienteId: number;
  /** Cartas que se llevó del pozo y no puede bajar hasta llegar al mínimo. */
  readonly bloqueadas: readonly CartaCanasta[];
  /** Empezó llevándose el pozo: la combinación del pozo no se deshace. */
  readonly pozo: boolean;
}

export interface DesgloseCanasta {
  readonly cartas: number;
  readonly limpias: number;
  readonly sucias: number;
  readonly canastas: number;
  readonly treses: number;
  readonly cierre: number;
  /** Lo que queda en la mano de los dos, en negativo. */
  readonly mano: number;
  readonly total: number;
}

export interface ResultadoManoCanasta {
  readonly numero: number;
  /** Quién cerró; `null` si se acabó el mazo. */
  readonly cierra: Asiento | null;
  readonly desglose: readonly DesgloseCanasta[];
  readonly puntosTras: readonly number[];
}

export interface EstadoCanasta {
  readonly config: ConfigCanasta;
  readonly azar: EstadoAzar;
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly turno: Asiento;
  readonly fase: 'robar' | 'bajar';
  /** Ordenadas como en `ordenarCanasta`. */
  readonly manos: readonly (readonly CartaCanasta[])[];
  /** Cartas que cada uno se llevó del pozo y siguen en su mano. */
  readonly conocidas: readonly (readonly CartaCanasta[])[];
  /** Boca abajo; se roba la última. */
  readonly mazo: readonly CartaCanasta[];
  /** Boca arriba; la de arriba es la última. */
  readonly pozo: readonly CartaCanasta[];
  /** Hay un comodín (o un 3 rojo del principio) en el pozo. */
  readonly congelado: boolean;
  readonly combinaciones: readonly CombinacionCanasta[];
  readonly siguienteId: number;
  /** Treses rojos de cada pareja. */
  readonly treses: readonly (readonly CartaCanasta[])[];
  /** Por pareja: ya ha llegado al mínimo en la mano. */
  readonly abierto: readonly boolean[];
  readonly apertura: AperturaCanasta | null;
  readonly puntos: readonly number[];
  readonly puntosInicioMano: readonly number[];
  readonly ultimaAccion: { readonly asiento: Asiento; readonly accion: AccionCanasta } | null;
  readonly resultadosManos: readonly ResultadoManoCanasta[];
  readonly terminada: boolean;
}

export interface VistaCanasta {
  readonly config: ConfigCanasta;
  readonly asiento: Asiento | null;
  readonly miMano: readonly CartaCanasta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly conocidas: readonly (readonly CartaCanasta[])[];
  readonly cartasEnMazo: number;
  readonly pozo: readonly CartaCanasta[];
  readonly congelado: boolean;
  readonly combinaciones: readonly CombinacionCanasta[];
  readonly siguienteId: number;
  readonly treses: readonly (readonly CartaCanasta[])[];
  readonly abierto: readonly boolean[];
  readonly apertura: AperturaCanasta | null;
  /** Mínimo de la primera bajada de cada pareja en esta mano. */
  readonly minimos: readonly number[];
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly fase: 'robar' | 'bajar';
  readonly puntos: readonly number[];
  readonly puntosInicioMano: readonly number[];
  readonly ultimaAccion: EstadoCanasta['ultimaAccion'];
  readonly resultadosManos: readonly ResultadoManoCanasta[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const bandoCanasta = (a: Asiento) => a % 2;

export const esJokerCanasta = (c: CartaCanasta) => esComodin(basePinacle(c));

/** Valor de la carta (1 el As); 0 para un joker. */
export const valorCanasta = (c: CartaCanasta) =>
  esJokerCanasta(c) ? 0 : cartaDeId(basePinacle(c))!.valor;

const paloDe = (c: CartaCanasta) =>
  esJokerCanasta(c) ? null : (cartaDeId(basePinacle(c))!.palo as PaloFrances);

export const esDosCanasta = (c: CartaCanasta) => valorCanasta(c) === 2;
export const esComodinCanasta = (c: CartaCanasta) => esJokerCanasta(c) || esDosCanasta(c);
const esRojo = (c: CartaCanasta) => paloDe(c) === 'corazones' || paloDe(c) === 'diamantes';
export const esTresRojo = (c: CartaCanasta) => valorCanasta(c) === 3 && esRojo(c);
export const esTresNegro = (c: CartaCanasta) => valorCanasta(c) === 3 && !esRojo(c);
/** Carta natural que se puede combinar: del 4 al As. */
export const esNaturalCanasta = (c: CartaCanasta) => !esComodinCanasta(c) && valorCanasta(c) !== 3;

/** Valor en puntos: joker 50, 2 y As 20, del 8 al K 10, del 4 al 7 y el 3 negro 5. */
export function puntosCanasta(c: CartaCanasta): number {
  if (esJokerCanasta(c)) return 50;
  const v = valorCanasta(c);
  if (v === 2 || v === 1) return 20;
  if (v === 3) return esRojo(c) ? 0 : 5;
  return v >= 8 ? 10 : 5;
}

const sumaPuntos = (cartas: readonly CartaCanasta[]) =>
  cartas.reduce((s, c) => s + puntosCanasta(c), 0);

/** Orden de la mano: treses negros, del 4 al As, doses y jokers; dentro, por palo y copia. */
function claveOrden(c: CartaCanasta): number {
  const copia = Number(c.slice(c.lastIndexOf('#') + 1));
  if (esJokerCanasta(c)) return 1700 + copia;
  const v = valorCanasta(c);
  const r = v === 3 ? 3 : v === 2 ? 15 : v === 1 ? 14 : v;
  return r * 100 + PALOS_FRANCESES.indexOf(paloDe(c)!) * 10 + copia;
}

export const compararCanasta = (a: CartaCanasta, b: CartaCanasta) => claveOrden(a) - claveOrden(b);
const ordenar = (cartas: readonly CartaCanasta[]) => [...cartas].sort(compararCanasta);
const quitar = (de: readonly CartaCanasta[], cartas: readonly CartaCanasta[]) =>
  de.filter((c) => !cartas.includes(c));

// ── Combinaciones ────────────────────────────────────────────────────────────

export const comodinesDe = (cartas: readonly CartaCanasta[]) =>
  cartas.filter(esComodinCanasta).length;

export const esCanasta = (comb: CombinacionCanasta) => comb.cartas.length >= TAMANO_CANASTA;
export const esCanastaLimpia = (comb: CombinacionCanasta) =>
  esCanasta(comb) && comodinesDe(comb.cartas) === 0;

/** Las cartas forman una combinación válida de valor `valor`. */
export function combinacionValida(valor: number, cartas: readonly CartaCanasta[]): boolean {
  const comodines = comodinesDe(cartas);
  const naturales = cartas.length - comodines;
  if (cartas.length < 3 || naturales < 2 || comodines > MAXIMO_COMODINES_CANASTA) return false;
  return cartas.every((c) => esComodinCanasta(c) || valorCanasta(c) === valor);
}

/** Mínimo de la primera bajada según los puntos de la pareja. */
export function minimoCanasta(puntos: number): number {
  if (puntos < 0) return 15;
  if (puntos < 1500) return 50;
  if (puntos < 3000) return 90;
  return 120;
}

const tieneCanasta = (combinaciones: readonly CombinacionCanasta[], bando: number) =>
  combinaciones.some((c) => c.bando === bando && esCanasta(c));

const puntosBando = (combinaciones: readonly CombinacionCanasta[], bando: number) =>
  combinaciones.filter((c) => c.bando === bando).reduce((s, c) => s + sumaPuntos(c.cartas), 0);

/** Las cartas de la mano por tipo, en el orden de la mano. */
function clasificar(mano: readonly CartaCanasta[]) {
  const naturales = new Map<number, CartaCanasta[]>();
  const jokers: CartaCanasta[] = [];
  const doses: CartaCanasta[] = [];
  const tresesNegros: CartaCanasta[] = [];
  for (const c of mano) {
    if (esJokerCanasta(c)) jokers.push(c);
    else if (esDosCanasta(c)) doses.push(c);
    else if (esTresNegro(c)) tresesNegros.push(c);
    else if (esNaturalCanasta(c))
      naturales.set(valorCanasta(c), [...(naturales.get(valorCanasta(c)) ?? []), c]);
  }
  return { naturales, jokers, doses, tresesNegros };
}

/** Las formas de elegir comodines: `j` jokers y `d` doses, hasta `maximo` en total. */
function formasComodin(jokers: number, doses: number, maximo: number): [number, number][] {
  const formas: [number, number][] = [];
  for (let j = 0; j <= Math.min(jokers, maximo); j++) {
    for (let d = 0; d <= Math.min(doses, maximo - j); d++) formas.push([j, d]);
  }
  return formas;
}

/**
 * Cota alcanzable de la primera bajada con estas cartas: los valores con tres naturales o más,
 * las parejas con un comodín y el resto de comodines donde quepan. `base` son las combinaciones
 * ya hechas: su valor (los naturales de ese valor se les añaden) y cuántos comodines les caben.
 * Solo cuenta si deja al menos `reservar` cartas.
 */
export function cotaBajadaCanasta(
  mano: readonly CartaCanasta[],
  base: readonly { readonly valor: number; readonly hueco: number }[] = [],
  reservar = 0,
): number {
  const { naturales, jokers, doses } = clasificar(mano);
  const comodines = [...jokers, ...doses];
  let puntos = 0;
  let usadas = 0;
  let hueco = base.reduce((s, b) => s + b.hueco, 0);
  const parejas: CartaCanasta[][] = [];
  const yaBajados = new Set(base.map((b) => b.valor));
  for (const [valor, grupo] of naturales) {
    if (yaBajados.has(valor)) {
      puntos += sumaPuntos(grupo);
      usadas += grupo.length;
    } else if (grupo.length >= 3) {
      puntos += sumaPuntos(grupo);
      usadas += grupo.length;
      hueco += MAXIMO_COMODINES_CANASTA;
    } else if (grupo.length === 2) parejas.push(grupo);
  }
  parejas.sort((a, b) => sumaPuntos(b) - sumaPuntos(a));
  let libres = comodines.length;
  let siguiente = 0;
  for (const p of parejas) {
    if (libres === 0) break;
    puntos += sumaPuntos(p) + puntosCanasta(comodines[siguiente]!);
    siguiente++;
    libres--;
    usadas += 3;
    hueco += MAXIMO_COMODINES_CANASTA - 1;
  }
  while (libres > 0 && hueco > 0) {
    puntos += puntosCanasta(comodines[siguiente]!);
    siguiente++;
    libres--;
    hueco--;
    usadas++;
  }
  return mano.length - usadas >= reservar ? puntos : 0;
}

// ── Reparto ──────────────────────────────────────────────────────────────────

/** Baja los treses rojos de la mano y roba otra por cada uno. */
function reponerTreses(mano: CartaCanasta[], mazo: CartaCanasta[], treses: CartaCanasta[]): void {
  for (;;) {
    const rojos = mano.filter(esTresRojo);
    if (rojos.length === 0) return;
    for (const r of rojos) {
      mano.splice(mano.indexOf(r), 1);
      treses.push(r);
      if (mazo.length > 0) mano.push(mazo.pop()!);
    }
  }
}

function nuevaMano(
  config: ConfigCanasta,
  azar: EstadoAzar,
  repartidor: Asiento,
  numeroMano: number,
  puntos: readonly number[],
  resultadosManos: readonly ResultadoManoCanasta[],
): EstadoCanasta {
  const { cartas, azar: azarSiguiente } = barajar(cartasPinacle(), azar);
  const mazo = [...cartas];
  const manos: CartaCanasta[][] = [[], [], [], []];
  for (let k = 0; k < CARTAS_MANO_CANASTA; k++) {
    for (let i = 1; i <= 4; i++) manos[(repartidor + i) % 4]!.push(mazo.pop()!);
  }
  const treses: CartaCanasta[][] = [[], []];
  for (let i = 1; i <= 4; i++) {
    const a = (repartidor + i) % 4;
    reponerTreses(manos[a]!, mazo, treses[bandoCanasta(a)]!);
  }
  // El pozo empieza con una carta; si es un comodín o un 3 rojo, se tapa y queda congelado.
  const pozo = [mazo.pop()!];
  let congelado = false;
  while (esComodinCanasta(pozo.at(-1)!) || esTresRojo(pozo.at(-1)!)) {
    congelado = true;
    pozo.push(mazo.pop()!);
  }
  return {
    config,
    azar: azarSiguiente,
    numeroMano,
    repartidor,
    turno: (repartidor + 1) % 4,
    fase: 'robar',
    manos: manos.map(ordenar),
    conocidas: [[], [], [], []],
    mazo,
    pozo,
    congelado,
    combinaciones: [],
    siguienteId: 0,
    treses,
    abierto: [false, false],
    apertura: null,
    puntos,
    puntosInicioMano: puntos,
    ultimaAccion: null,
    resultadosManos,
    terminada: false,
  };
}

// ── Puntuación ───────────────────────────────────────────────────────────────

export function puntuarManoCanasta(
  e: Pick<EstadoCanasta, 'combinaciones' | 'treses' | 'abierto' | 'manos'>,
  cierra: Asiento | null,
): DesgloseCanasta[] {
  return [0, 1].map((b) => {
    const propias = e.combinaciones.filter((c) => c.bando === b);
    const cartas = propias.reduce((s, c) => s + sumaPuntos(c.cartas), 0);
    const limpias = propias.filter(esCanastaLimpia).length;
    const sucias = propias.filter((c) => esCanasta(c) && !esCanastaLimpia(c)).length;
    const canastas = limpias * PREMIO_CANASTA_LIMPIA + sucias * PREMIO_CANASTA_SUCIA;
    const t = e.treses[b]!.length;
    const treses = (t === 4 ? 800 : t * 100) * (propias.length > 0 ? 1 : -1);
    const cierre = cierra !== null && bandoCanasta(cierra) === b ? PREMIO_CIERRE_CANASTA : 0;
    const mano = -e.manos
      .filter((_, a) => bandoCanasta(a) === b)
      .reduce((s, m) => s + sumaPuntos(m), 0);
    return {
      cartas,
      limpias,
      sucias,
      canastas,
      treses,
      cierre,
      mano,
      total: cartas + canastas + treses + cierre + mano,
    };
  });
}

function cerrarMano(e: EstadoCanasta, cierra: Asiento | null): EstadoCanasta {
  const desglose = puntuarManoCanasta(e, cierra);
  const puntos = e.puntos.map((p, b) => p + desglose[b]!.total);
  const resultadosManos = [
    ...e.resultadosManos,
    { numero: e.numeroMano, cierra, desglose, puntosTras: puntos },
  ];
  const maximo = Math.max(...puntos);
  if (maximo >= OBJETIVO_CANASTA && puntos[0] !== puntos[1]) {
    return { ...e, puntos, resultadosManos, terminada: true };
  }
  return nuevaMano(
    e.config,
    e.azar,
    (e.repartidor + 1) % 4,
    e.numeroMano + 1,
    puntos,
    resultadosManos,
  );
}

// ── Acciones legales ─────────────────────────────────────────────────────────

/** Sin canasta, hay que quedarse con al menos 2 cartas para poder descartar sin cerrar. */
const cartasMinimas = (combinaciones: readonly CombinacionCanasta[], bando: number) =>
  tieneCanasta(combinaciones, bando) ? 0 : 2;

/** Las combinaciones tras añadir `cartas` a la de `id`, o crear una nueva. */
function conCartas(
  combinaciones: readonly CombinacionCanasta[],
  id: number | null,
  nueva: Omit<CombinacionCanasta, 'id'> & { readonly id: number },
  cartas: readonly CartaCanasta[],
): CombinacionCanasta[] {
  if (id === null) return [...combinaciones, nueva];
  return combinaciones.map((c) => (c.id === id ? { ...c, cartas: [...c.cartas, ...cartas] } : c));
}

function accionesPozo(e: EstadoCanasta, asiento: Asiento): AccionCanasta[] {
  const arriba = e.pozo.at(-1);
  if (arriba === undefined || esTresNegro(arriba) || esComodinCanasta(arriba)) return [];
  const bando = bandoCanasta(asiento);
  const abierto = e.abierto[bando]!;
  const congelado = e.congelado || !abierto;
  const valor = valorCanasta(arriba);
  const mano = e.manos[asiento]!;
  const { naturales, jokers, doses } = clasificar(mano);
  const propios = naturales.get(valor) ?? [];
  const existente = e.combinaciones.find((c) => c.bando === bando && c.valor === valor) ?? null;
  const resto = e.pozo.slice(0, -1).filter((c) => !esTresRojo(c));
  const acciones: AccionCanasta[] = [];
  const base = existente?.cartas ?? [];
  const huecoComodines = MAXIMO_COMODINES_CANASTA - comodinesDe(base);
  for (let k = congelado ? 2 : 0; k <= propios.length; k++) {
    for (const [j, d] of formasComodin(jokers.length, doses.length, huecoComodines)) {
      if (k === 0 && j + d > 0) continue;
      if (!congelado && existente === null && k === 0) continue;
      const usadas = [...propios.slice(0, k), ...jokers.slice(0, j), ...doses.slice(0, d)];
      const cartasComb = [...base, arriba, ...usadas];
      if (!combinacionValida(valor, cartasComb)) continue;
      const quedan = mano.length - usadas.length + resto.length;
      const combs = conCartas(
        e.combinaciones,
        existente?.id ?? null,
        { id: e.siguienteId, bando, valor, cartas: cartasComb },
        [arriba, ...usadas],
      );
      if (quedan < cartasMinimas(combs, bando)) continue;
      if (!abierto) {
        // Para la primera bajada solo cuentan la de arriba y la mano.
        const hechas = sumaPuntos(cartasComb);
        const libre = quitar(mano, usadas);
        // Tiene que quedarse con 2 cartas contando las del pozo.
        const cota = cotaBajadaCanasta(
          libre,
          [{ valor, hueco: MAXIMO_COMODINES_CANASTA - comodinesDe(cartasComb) }],
          Math.max(0, 2 - resto.length),
        );
        if (hechas + cota < minimoCanasta(e.puntosInicioMano[bando]!)) continue;
      }
      acciones.push({ tipo: 'tomarPozo', cartas: usadas, combinacion: existente?.id ?? null });
    }
  }
  return acciones;
}

function accionesBajar(e: EstadoCanasta, asiento: Asiento): AccionCanasta[] {
  const bando = bandoCanasta(asiento);
  const manoEntera = e.manos[asiento]!;
  const bloqueadas = e.apertura?.bloqueadas ?? [];
  const mano = quitar(manoEntera, bloqueadas);
  const { naturales, jokers, doses, tresesNegros } = clasificar(mano);
  const acciones: AccionCanasta[] = [];
  const propias = e.combinaciones.filter((c) => c.bando === bando);
  const admite = (cartas: readonly CartaCanasta[], combs: readonly CombinacionCanasta[]) =>
    manoEntera.length - cartas.length >= cartasMinimas(combs, bando);

  // Combinaciones nuevas.
  for (const [valor, grupo] of naturales) {
    if (propias.some((c) => c.valor === valor)) continue;
    for (let k = 2; k <= grupo.length; k++) {
      for (const [j, d] of formasComodin(jokers.length, doses.length, MAXIMO_COMODINES_CANASTA)) {
        const cartas = [...grupo.slice(0, k), ...jokers.slice(0, j), ...doses.slice(0, d)];
        if (!combinacionValida(valor, cartas)) continue;
        const combs = [...e.combinaciones, { id: e.siguienteId, bando, valor, cartas }];
        if (admite(cartas, combs)) acciones.push({ tipo: 'bajar', cartas });
      }
    }
  }
  // Los treses negros, solo para cerrar.
  if (e.abierto[bando] || e.apertura !== null) {
    for (let k = 3; k <= tresesNegros.length; k++) {
      const cartas = tresesNegros.slice(0, k);
      const quedan = manoEntera.length - k;
      if (quedan <= 1 && tieneCanasta(e.combinaciones, bando))
        acciones.push({ tipo: 'bajar', cartas });
    }
  }
  // Añadir a las de la pareja.
  for (const comb of propias) {
    if (comb.valor === 3) continue;
    const grupo = naturales.get(comb.valor) ?? [];
    const hueco = MAXIMO_COMODINES_CANASTA - comodinesDe(comb.cartas);
    for (let k = 0; k <= grupo.length; k++) {
      for (const [j, d] of formasComodin(jokers.length, doses.length, hueco)) {
        if (k + j + d === 0) continue;
        const cartas = [...grupo.slice(0, k), ...jokers.slice(0, j), ...doses.slice(0, d)];
        const combs = conCartas(e.combinaciones, comb.id, comb, cartas);
        if (admite(cartas, combs)) acciones.push({ tipo: 'anadir', combinacion: comb.id, cartas });
      }
    }
  }
  return acciones;
}

/** Hay algo bajado en la primera bajada en curso que se pueda deshacer. */
function hayQueDeshacer(e: EstadoCanasta): boolean {
  const a = e.apertura;
  if (a === null) return false;
  const antes = a.combinaciones.reduce((s, c) => s + c.cartas.length, 0);
  return e.combinaciones.reduce((s, c) => s + c.cartas.length, 0) > antes;
}

function accionesLegales(e: EstadoCanasta, asiento: Asiento): AccionCanasta[] {
  if (e.terminada || asiento !== e.turno) return [];
  if (e.fase === 'robar') {
    const pozo = accionesPozo(e, asiento);
    if (e.mazo.length === 0) return pozo.length > 0 ? [...pozo, { tipo: 'acabar' }] : [];
    return [{ tipo: 'robar' }, ...pozo];
  }
  const acciones = accionesBajar(e, asiento);
  if (hayQueDeshacer(e)) acciones.push({ tipo: 'deshacer' });
  if (e.apertura === null) {
    const mano = e.manos[asiento]!;
    const puedeCerrar = tieneCanasta(e.combinaciones, bandoCanasta(asiento));
    if (mano.length > 1 || puedeCerrar) {
      const vistas = new Set<string>();
      for (const carta of mano) {
        const base = basePinacle(carta);
        if (vistas.has(base)) continue;
        vistas.add(base);
        acciones.push({ tipo: 'descartar', carta });
      }
    }
  }
  return acciones;
}

// ── Transiciones ─────────────────────────────────────────────────────────────

/** Si el bando llegó al mínimo de la primera bajada, la cierra. */
function comprobarApertura(e: EstadoCanasta, asiento: Asiento): EstadoCanasta {
  const bando = bandoCanasta(asiento);
  if (e.apertura === null) return e;
  if (puntosBando(e.combinaciones, bando) < minimoCanasta(e.puntosInicioMano[bando]!)) return e;
  return { ...e, apertura: null, abierto: e.abierto.map((x, b) => x || b === bando) };
}

/** Tras pasar el turno: si el siguiente tiene que robar sin mazo y no puede llevarse el pozo, acaba. */
function siguienteTurno(e: EstadoCanasta, asiento: Asiento): EstadoCanasta {
  const tras: EstadoCanasta = { ...e, turno: (asiento + 1) % 4, fase: 'robar' };
  if (tras.mazo.length === 0 && accionesPozo(tras, tras.turno).length === 0) {
    return cerrarMano(tras, null);
  }
  return tras;
}

/** Cartas que se bajan de la mano: salen de ella y de las conocidas. */
function sinCartas(e: EstadoCanasta, asiento: Asiento, cartas: readonly CartaCanasta[]) {
  return {
    manos: e.manos.map((m, a) => (a === asiento ? quitar(m, cartas) : m)),
    conocidas: e.conocidas.map((m, a) => (a === asiento ? quitar(m, cartas) : m)),
  };
}

function transicion(e: EstadoCanasta, asiento: Asiento, accion: AccionCanasta): EstadoCanasta {
  const bando = bandoCanasta(asiento);
  const marcada = { ...e, ultimaAccion: { asiento, accion } };
  switch (accion.tipo) {
    case 'robar': {
      const mazo = [...e.mazo];
      const mano = [...e.manos[asiento]!, mazo.pop()!];
      const treses = e.treses.map((t) => [...t]);
      reponerTreses(mano, mazo, treses[bando]!);
      const tras: EstadoCanasta = {
        ...marcada,
        mazo,
        treses,
        manos: e.manos.map((m, a) => (a === asiento ? ordenar(mano) : m)),
        fase: 'bajar',
      };
      // Si la última carta del mazo era un 3 rojo, la mano termina.
      if (mazo.length === 0 && treses[bando]!.length > e.treses[bando]!.length) {
        return cerrarMano(tras, null);
      }
      return tras;
    }
    case 'tomarPozo': {
      const arriba = e.pozo.at(-1)!;
      const resto = e.pozo.slice(0, -1);
      const rojos = resto.filter(esTresRojo);
      const aMano = resto.filter((c) => !esTresRojo(c));
      const existente = e.combinaciones.find((c) => c.id === accion.combinacion) ?? null;
      const nuevas = [arriba, ...accion.cartas];
      const combinaciones = conCartas(
        e.combinaciones,
        existente?.id ?? null,
        { id: e.siguienteId, bando, valor: valorCanasta(arriba), cartas: nuevas },
        nuevas,
      );
      const siguienteId = existente ? e.siguienteId : e.siguienteId + 1;
      const quitadas = sinCartas(e, asiento, accion.cartas);
      const tras: EstadoCanasta = {
        ...marcada,
        manos: quitadas.manos.map((m, a) => (a === asiento ? ordenar([...m, ...aMano]) : m)),
        conocidas: quitadas.conocidas.map((m, a) => (a === asiento ? [...m, ...aMano] : m)),
        pozo: [],
        congelado: false,
        combinaciones,
        siguienteId,
        treses: e.treses.map((t, b) => (b === bando ? [...t, ...rojos] : t)),
        fase: 'bajar',
        apertura: e.abierto[bando]
          ? null
          : { combinaciones, siguienteId, bloqueadas: aMano, pozo: true },
      };
      if (tras.manos[asiento]!.length === 0) return cerrarMano(tras, asiento);
      return comprobarApertura(tras, asiento);
    }
    case 'bajar':
    case 'anadir': {
      const apertura =
        e.apertura ??
        (e.abierto[bando]
          ? null
          : {
              combinaciones: e.combinaciones,
              siguienteId: e.siguienteId,
              bloqueadas: [],
              pozo: false,
            });
      const combinaciones =
        accion.tipo === 'bajar'
          ? [
              ...e.combinaciones,
              {
                id: e.siguienteId,
                bando,
                valor: valorCanasta(accion.cartas.find((c) => !esComodinCanasta(c))!),
                cartas: accion.cartas,
              },
            ]
          : conCartas(e.combinaciones, accion.combinacion, e.combinaciones[0]!, accion.cartas);
      const tras: EstadoCanasta = comprobarApertura(
        {
          ...marcada,
          ...sinCartas(e, asiento, accion.cartas),
          combinaciones,
          siguienteId: accion.tipo === 'bajar' ? e.siguienteId + 1 : e.siguienteId,
          apertura,
        },
        asiento,
      );
      if (tras.manos[asiento]!.length === 0) return cerrarMano(tras, asiento);
      return tras;
    }
    case 'deshacer': {
      const a = e.apertura!;
      const antes = new Set(a.combinaciones.flatMap((c) => c.cartas));
      const vuelven = e.combinaciones.flatMap((c) => c.cartas).filter((c) => !antes.has(c));
      // Sin el pozo, deshacer lo deja como antes de empezar a bajar.
      return {
        ...marcada,
        manos: e.manos.map((m, i) => (i === asiento ? ordenar([...m, ...vuelven]) : m)),
        combinaciones: a.combinaciones,
        siguienteId: a.siguienteId,
        apertura: a.pozo ? a : null,
      };
    }
    case 'descartar': {
      const tras: EstadoCanasta = {
        ...marcada,
        ...sinCartas(e, asiento, [accion.carta]),
        pozo: [...e.pozo, accion.carta],
        congelado: e.congelado || esComodinCanasta(accion.carta),
      };
      if (tras.manos[asiento]!.length === 0) return cerrarMano(tras, asiento);
      return siguienteTurno(tras, asiento);
    }
    case 'acabar':
      return cerrarMano(marcada, null);
  }
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const canasta: Juego<ConfigCanasta, EstadoCanasta, AccionCanasta, VistaCanasta> = {
  id: 'canasta',

  crear(config, semilla) {
    if (config.jugadores !== 4) return error('La Canasta se juega con 4 jugadores en parejas');
    return ok(nuevaMano({ jugadores: 4 }, crearAzar(semilla), 3, 1, [0, 0], []));
  },

  asientos: () => 4,

  accionesLegales,

  transicion,

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      conocidas: e.conocidas,
      cartasEnMazo: e.mazo.length,
      pozo: [...e.pozo],
      congelado: e.congelado,
      combinaciones: e.combinaciones,
      siguienteId: e.siguienteId,
      treses: e.treses,
      abierto: [...e.abierto],
      apertura: e.apertura,
      minimos: e.puntosInicioMano.map(minimoCanasta),
      numeroMano: e.numeroMano,
      repartidor: e.repartidor,
      turno: e.terminada ? null : e.turno,
      fase: e.fase,
      puntos: [...e.puntos],
      puntosInicioMano: [...e.puntosInicioMano],
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!e.terminada) return null;
    const gana = e.puntos[0]! > e.puntos[1]! ? 0 : 1;
    return {
      ganadores: [0, 1, 2, 3].filter((a) => bandoCanasta(a) === gana),
      empate: false,
      puntos: [0, 1, 2, 3].map((a) => e.puntos[bandoCanasta(a)]!),
    };
  },
};

/** La acción legal de la misma firma que estas cartas (mismo valor, naturales, jokers y doses). */
export function firmaCanasta(cartas: readonly CartaCanasta[]): string {
  const naturales = cartas.filter((c) => !esComodinCanasta(c));
  const valor = naturales[0] ? valorCanasta(naturales[0]) : 0;
  return `${valor}:${naturales.length}:${cartas.filter(esJokerCanasta).length}:${cartas.filter(esDosCanasta).length}`;
}
