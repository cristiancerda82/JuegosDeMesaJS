import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  cartaGanadora,
  paloDe,
  puntosDe,
  valorDe,
  VALORES_BRISCA,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Briscola Chiamata para 5; las manos van en la config para que las pruebas sean cortas. */
export interface ConfigBriscolaChiamata {
  readonly manos: number;
}

export const CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO: ConfigBriscolaChiamata = { manos: 5 };

export type FaseBriscolaChiamata = 'subasta' | 'llamada' | 'bazas';

/**
 * Una puja es un nivel: de 0 a 9 las cartas (As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2), con 61
 * puntos; de 10 a 68, «2 con N» con N = nivel + 52 (de 62 a 120).
 */
export const NIVEL_MAXIMO_BRISCOLA_CHIAMATA = 68;
const NIVELES_DE_CARTA = VALORES_BRISCA.orden.length;
const PUNTOS_MINIMOS = 61;

/** El valor de la carta que se llama con la puja (un 2 en las de puntos). */
export const cartaDeNivel = (nivel: number) =>
  VALORES_BRISCA.orden[Math.min(nivel, NIVELES_DE_CARTA - 1)]!;
/** Los puntos que pide la puja. */
export const puntosDeNivel = (nivel: number) =>
  nivel < NIVELES_DE_CARTA ? PUNTOS_MINIMOS : nivel + PUNTOS_MINIMOS - NIVELES_DE_CARTA + 1;
/** La puja de puntos que pide `puntos` (de 62 a 120). */
export const nivelDePuntos = (puntos: number) => puntos - PUNTOS_MINIMOS + NIVELES_DE_CARTA - 1;

export type AccionBriscolaChiamata =
  | { readonly tipo: 'pujar'; readonly nivel: number }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'llamar'; readonly palo: PaloEspanol }
  | { readonly tipo: 'jugarCarta'; readonly carta: IdCarta };

export interface ResultadoManoBriscolaChiamata {
  readonly repartidor: Asiento;
  readonly llamador: Asiento;
  readonly nivel: number;
  /** Los puntos que pedía la puja. */
  readonly objetivo: number;
  readonly llamada: IdCarta;
  readonly companero: Asiento;
  readonly solo: boolean;
  readonly puntosBando: number;
  readonly ganada: boolean;
  /** Los puntos de partida de cada asiento en la mano. */
  readonly cambio: readonly number[];
  readonly marcadorTras: readonly number[];
}

export interface EstadoBriscolaChiamata {
  readonly config: ConfigBriscolaChiamata;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: FaseBriscolaChiamata;
  readonly turno: Asiento;
  /** Lo último que pujó cada uno (un nivel), `'paso'` si pasó, `null` si aún nada. */
  readonly pujas: readonly (number | 'paso' | null)[];
  readonly nivel: number | null;
  readonly llamador: Asiento | null;
  readonly llamada: IdCarta | null;
  readonly triunfo: PaloEspanol | null;
  /** Quien tiene la carta llamada (el llamador si juega solo). */
  readonly companero: Asiento | null;
  readonly solo: boolean;
  /** Ya se ha jugado la carta llamada. */
  readonly descubierto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly puntosMano: readonly number[];
  readonly marcador: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBriscolaChiamata[];
}

export interface VistaBriscolaChiamata {
  readonly config: ConfigBriscolaChiamata;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  readonly fase: FaseBriscolaChiamata;
  readonly turno: Asiento | null;
  readonly pujas: EstadoBriscolaChiamata['pujas'];
  readonly nivel: number | null;
  readonly llamador: Asiento | null;
  readonly llamada: IdCarta | null;
  readonly triunfo: PaloEspanol | null;
  /** El compañero si este asiento lo sabe; si no, `null`. */
  readonly companero: Asiento | null;
  /** Si el llamador juega solo, cuando este asiento lo sabe; si no, `null`. */
  readonly solo: boolean | null;
  readonly descubierto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoBriscolaChiamata['ultimaBaza'];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly puntosMano: readonly number[];
  readonly marcador: readonly number[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoBriscolaChiamata[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_BRISCOLA_CHIAMATA: readonly IdCarta[] = crearBaraja('espanola40');

/** Carta que gana la baza: el triunfo más alto o, si no hay, la más alta del palo de salida. */
export const ganadoraBriscolaChiamata = (
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol | null,
) => cartaGanadora(mesa, triunfo);

export const puntosBriscolaChiamata = (c: IdCarta) => puntosDe(c);

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 5;
const CARTAS_POR_MANO = 8;
const ASIENTOS = [0, 1, 2, 3, 4] as const;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

const terminada = (e: Pick<EstadoBriscolaChiamata, 'config' | 'resultadosManos'>) =>
  e.resultadosManos.length >= e.config.manos;

/** Los asientos del bando del llamador (él solo si no tiene compañero). */
export const bandoLlamador = (
  e: Pick<EstadoBriscolaChiamata, 'llamador' | 'companero' | 'solo'>,
): Asiento[] => (e.solo ? [e.llamador!] : [e.llamador!, e.companero!]);

function nuevaMano(
  base: Pick<EstadoBriscolaChiamata, 'config' | 'marcador' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoBriscolaChiamata {
  const { cartas, azar: sig } = barajar(BARAJA_BRISCOLA_CHIAMATA, azar);
  const manos: IdCarta[][] = ASIENTOS.map(() => []);
  [1, 2, 3, 4, 5].forEach((k, i) => {
    manos[(repartidor + k) % JUGADORES] = cartas.slice(
      CARTAS_POR_MANO * i,
      CARTAS_POR_MANO * (i + 1),
    );
  });
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    fase: 'subasta',
    turno: siguiente(repartidor),
    pujas: ASIENTOS.map(() => null),
    nivel: null,
    llamador: null,
    llamada: null,
    triunfo: null,
    companero: null,
    solo: false,
    descubierto: false,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadasPor: ASIENTOS.map(() => []),
    puntosMano: ASIENTOS.map(() => 0),
  };
}

function cerrarMano(e: EstadoBriscolaChiamata): EstadoBriscolaChiamata {
  const bando = bandoLlamador(e);
  const puntosBando = bando.reduce((s, a) => s + e.puntosMano[a]!, 0);
  const objetivo = puntosDeNivel(e.nivel!);
  const ganada = puntosBando >= objetivo;
  const signo = ganada ? 1 : -1;
  const cambio = ASIENTOS.map((a) => {
    if (a === e.llamador) return signo * (e.solo ? 4 : 2);
    if (bando.includes(a)) return signo;
    return -signo;
  });
  const marcadorTras = e.marcador.map((m, a) => m + cambio[a]!);
  const resultado: ResultadoManoBriscolaChiamata = {
    repartidor: e.repartidor,
    llamador: e.llamador!,
    nivel: e.nivel!,
    objetivo,
    llamada: e.llamada!,
    companero: e.companero!,
    solo: e.solo,
    puntosBando,
    ganada,
    cambio,
    marcadorTras,
  };
  const cerrado: EstadoBriscolaChiamata = {
    ...e,
    marcador: marcadorTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoBriscolaChiamata): EstadoBriscolaChiamata {
  const ganador = ganadoraBriscolaChiamata(e.mesa, e.triunfo).asiento;
  const puntos = e.mesa.reduce((s, j) => s + puntosBriscolaChiamata(j.carta), 0);
  const r: EstadoBriscolaChiamata = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p + puntos : p)),
  };
  return r.manos.every((m) => m.length === 0) ? cerrarMano(r) : r;
}

/** El que reparte está obligado a pujar si los otros cuatro han pasado sin pujar nadie. */
const obligado = (e: EstadoBriscolaChiamata, asiento: Asiento) =>
  e.nivel === null && e.pujas.every((p, a) => a === asiento || p === 'paso');

// ── Juego ────────────────────────────────────────────────────────────────────

export const briscolaChiamata: Juego<
  ConfigBriscolaChiamata,
  EstadoBriscolaChiamata,
  AccionBriscolaChiamata,
  VistaBriscolaChiamata
> = {
  id: 'briscolaChiamata',

  crear(config, semilla) {
    if (!Number.isInteger(config.manos) || config.manos < 1) {
      return error('El número de manos debe ser un entero positivo');
    }
    // Reparte el asiento 4, así el asiento 0 puja y sale primero.
    return ok(
      nuevaMano(
        {
          config: { manos: config.manos },
          marcador: ASIENTOS.map(() => 0),
          resultadosManos: [],
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'subasta': {
        if (obligado(e, asiento)) return [{ tipo: 'pujar', nivel: 0 }];
        const r: AccionBriscolaChiamata[] = [{ tipo: 'pasar' }];
        for (let n = (e.nivel ?? -1) + 1; n <= NIVEL_MAXIMO_BRISCOLA_CHIAMATA; n++) {
          r.push({ tipo: 'pujar', nivel: n });
        }
        return r;
      }
      case 'llamada':
        return PALOS_ESPANOLES.map((palo): AccionBriscolaChiamata => ({ tipo: 'llamar', palo }));
      case 'bazas':
        return [...e.manos[asiento]!].sort().map((carta) => ({ tipo: 'jugarCarta', carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pujar':
      case 'pasar': {
        const r: EstadoBriscolaChiamata = {
          ...e,
          pujas: e.pujas.map((p, a) =>
            a === asiento ? (accion.tipo === 'pujar' ? accion.nivel : 'paso') : p,
          ),
          nivel: accion.tipo === 'pujar' ? accion.nivel : e.nivel,
        };
        const quedan = ASIENTOS.filter((a) => r.pujas[a] !== 'paso');
        if (
          r.nivel !== null &&
          (quedan.length === 1 || r.nivel === NIVEL_MAXIMO_BRISCOLA_CHIAMATA)
        ) {
          // Con 120 nadie puede pujar más.
          const llamador = accion.tipo === 'pujar' ? asiento : quedan[0]!;
          return { ...r, llamador, fase: 'llamada', turno: llamador };
        }
        let sig = siguiente(asiento);
        while (r.pujas[sig] === 'paso') sig = siguiente(sig);
        return { ...r, turno: sig };
      }
      case 'llamar': {
        const llamada = `${accion.palo}-${cartaDeNivel(e.nivel!)}` as IdCarta;
        const companero = ASIENTOS.find((a) => e.manos[a]!.includes(llamada))!;
        return {
          ...e,
          llamada,
          triunfo: accion.palo,
          companero,
          solo: companero === asiento,
          fase: 'bazas',
          turno: siguiente(e.repartidor),
        };
      }
      case 'jugarCarta': {
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoBriscolaChiamata = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          mesa,
          jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          descubierto: e.descubierto || accion.carta === e.llamada,
        };
        if (mesa.length < JUGADORES) return { ...jugado, turno: siguiente(asiento) };
        return resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const llamador = asiento !== null && asiento === e.llamador;
    const conoce =
      e.descubierto || (asiento !== null && asiento === e.companero) || (llamador && e.solo);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      pujas: [...e.pujas],
      nivel: e.nivel,
      llamador: e.llamador,
      llamada: e.llamada,
      triunfo: e.triunfo,
      companero: conoce ? e.companero : null,
      solo: e.llamada === null ? null : conoce || llamador ? e.solo : null,
      descubierto: e.descubierto,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      puntosMano: [...e.puntosMano],
      marcador: [...e.marcador],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const maximo = Math.max(...e.marcador);
    const ganadores = ASIENTOS.filter((a) => e.marcador[a] === maximo);
    const puntos = [...e.marcador];
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};

export { paloDe as paloBriscolaChiamata, valorDe as valorBriscolaChiamata };
