import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigDurak {
  readonly jugadores: 2 | 3 | 4 | 5 | 6;
}

export const CONFIG_DURAK_POR_DEFECTO: ConfigDurak = { jugadores: 2 };

/** Cartas con las que se juega y hasta las que se roba. */
export const CARTAS_MANO_DURAK = 6;
/** Ataques como mucho en una ronda. */
export const ATAQUES_MAXIMOS_DURAK = 6;

export interface ParDurak {
  readonly ataque: IdCarta;
  /** La carta que lo gana; `null` mientras no se ha ganado. */
  readonly defensa: IdCarta | null;
}

export type AccionDurak =
  /** Primera carta de la ronda, o echar otra de un número que ya está en la mesa. */
  | { readonly tipo: 'atacar'; readonly carta: IdCarta }
  /** Ganar el ataque que está sin ganar. */
  | { readonly tipo: 'defender'; readonly carta: IdCarta }
  /** El defensor se lleva toda la mesa. */
  | { readonly tipo: 'tomar' }
  /** Un atacante que podía echar no lo hace. */
  | { readonly tipo: 'pasar' };

export interface AccionDurakHecha {
  readonly asiento: Asiento;
  readonly accion: AccionDurak;
}

export interface EstadoDurak {
  readonly config: ConfigDurak;
  readonly azar: EstadoAzar;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Se roba del principio; la última es la carta del triunfo. */
  readonly mazo: readonly IdCarta[];
  readonly triunfo: PaloFrances;
  readonly cartaTriunfo: IdCarta;
  readonly mesa: readonly ParDurak[];
  readonly descarte: readonly IdCarta[];
  readonly atacante: Asiento;
  readonly defensor: Asiento;
  readonly turno: Asiento;
  /** Atacantes que han pasado desde la última carta echada. */
  readonly pasaron: readonly Asiento[];
  /** Cartas que se sabe que tiene cada uno: las que se llevó de la mesa o el triunfo robado. */
  readonly conocidas: readonly (readonly IdCarta[])[];
  /** Los que han salido, en orden. */
  readonly salidos: readonly Asiento[];
  readonly ultimaAccion: AccionDurakHecha | null;
}

export interface VistaDurak {
  readonly config: ConfigDurak;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly triunfo: PaloFrances;
  readonly cartaTriunfo: IdCarta;
  readonly mesa: readonly ParDurak[];
  readonly descarte: readonly IdCarta[];
  readonly atacante: Asiento;
  readonly defensor: Asiento;
  readonly turno: Asiento | null;
  readonly pasaron: readonly Asiento[];
  readonly conocidas: readonly (readonly IdCarta[])[];
  readonly salidos: readonly Asiento[];
  readonly ultimaAccion: AccionDurakHecha | null;
  /** El que pierde, al terminar; `null` si no ha terminado o hay empate. */
  readonly durak: Asiento | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La baraja de 36: del 6 al As de cada palo. */
export const BARAJA_DURAK: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 6;
});

export const paloDurak = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** Rango para ganar: del 6 al K su número y el As 14. */
export const rangoDurak = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};

/** `defensa` gana a `ataque`: más alta del mismo palo, o triunfo contra no triunfo. */
export function ganaDurak(defensa: IdCarta, ataque: IdCarta, triunfo: PaloFrances): boolean {
  const [pd, pa] = [paloDurak(defensa), paloDurak(ataque)];
  if (pd === pa) return rangoDurak(defensa) > rangoDurak(ataque);
  return pd === triunfo;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

type Mesa = Pick<
  EstadoDurak,
  'config' | 'manos' | 'mesa' | 'atacante' | 'defensor' | 'salidos' | 'pasaron'
>;

const enJuego = (e: Pick<EstadoDurak, 'config' | 'salidos'>) =>
  Array.from({ length: e.config.jugadores }, (_, a) => a).filter((a) => !e.salidos.includes(a));

const partidaTerminada = (e: Pick<EstadoDurak, 'config' | 'salidos'>) => enJuego(e).length <= 1;

/** El primero en juego desde `desde` (incluido), en el sentido del juego. */
function siguienteEnJuego(e: Pick<EstadoDurak, 'config' | 'salidos'>, desde: Asiento): Asiento {
  const n = e.config.jugadores;
  for (let i = 0; i < n; i++) {
    const a = (desde + i) % n;
    if (!e.salidos.includes(a)) return a;
  }
  return desde;
}

/** Los atacantes en su orden: el principal y después los demás, sin el defensor. */
function ordenAtacantes(e: Mesa): Asiento[] {
  const n = e.config.jugadores;
  return Array.from({ length: n }, (_, i) => (e.atacante + i) % n).filter(
    (a) => a !== e.defensor && !e.salidos.includes(a),
  );
}

/** Las cartas que `asiento` puede echar ahora. */
export function cartasParaEchar(e: Mesa, asiento: Asiento): IdCarta[] {
  if (asiento === e.defensor || e.mesa.length === 0) return [];
  if (e.mesa.some((p) => p.defensa === null)) return [];
  if (e.mesa.length >= ATAQUES_MAXIMOS_DURAK || e.manos[e.defensor]!.length === 0) return [];
  const rangos = new Set(e.mesa.flatMap((p) => [p.ataque, p.defensa!]).map(rangoDurak));
  return e.manos[asiento]!.filter((c) => rangos.has(rangoDurak(c)));
}

/** El siguiente atacante que puede echar y no ha pasado; `null` si no queda ninguno. */
function siguienteQueEcha(e: Mesa): Asiento | null {
  return (
    ordenAtacantes(e).find((a) => !e.pasaron.includes(a) && cartasParaEchar(e, a).length > 0) ??
    null
  );
}

/** Roba hasta 6 cartas en el orden dado; devuelve manos, mazo y conocidas nuevas. */
function robar(
  e: EstadoDurak,
  manos: IdCarta[][],
  conocidas: IdCarta[][],
  orden: readonly Asiento[],
): IdCarta[] {
  let mazo = [...e.mazo];
  for (const a of orden) {
    const faltan = Math.max(0, CARTAS_MANO_DURAK - manos[a]!.length);
    const robadas = mazo.slice(0, faltan);
    mazo = mazo.slice(faltan);
    manos[a]!.push(...robadas);
    if (robadas.includes(e.cartaTriunfo)) conocidas[a]!.push(e.cartaTriunfo);
  }
  return mazo;
}

/** Cierra la ronda: la mesa al descarte o al defensor, se roba, salen los que pueden y sigue. */
function cerrarRonda(e: EstadoDurak, defendida: boolean): EstadoDurak {
  const manos = e.manos.map((m) => [...m]);
  const conocidas = e.conocidas.map((c) => [...c]);
  const cartasMesa = e.mesa.flatMap((p) =>
    p.defensa === null ? [p.ataque] : [p.ataque, p.defensa],
  );
  let descarte = e.descarte;
  if (defendida) descarte = [...descarte, ...cartasMesa];
  else {
    manos[e.defensor]!.push(...cartasMesa);
    conocidas[e.defensor]!.push(...cartasMesa);
  }
  const orden = [...ordenAtacantes(e), e.defensor];
  const mazo = robar(e, manos, conocidas, orden);
  const salidos = [...e.salidos];
  if (mazo.length === 0) {
    for (const a of orden) if (manos[a]!.length === 0 && !salidos.includes(a)) salidos.push(a);
  }
  const cerrado = { ...e, manos, conocidas, mazo, descarte, salidos, mesa: [], pasaron: [] };
  if (partidaTerminada(cerrado)) return cerrado;
  const n = e.config.jugadores;
  const atacante = siguienteEnJuego(cerrado, defendida ? e.defensor : (e.defensor + 1) % n);
  const defensor = siguienteEnJuego(cerrado, (atacante + 1) % n);
  return { ...cerrado, atacante, defensor, turno: atacante };
}

/** Tras ganar un ataque o pasar: le toca al siguiente que puede echar, o se cierra la ronda. */
function seguirEchando(e: EstadoDurak): EstadoDurak {
  const siguiente = siguienteQueEcha(e);
  return siguiente === null ? cerrarRonda(e, true) : { ...e, turno: siguiente };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const durak: Juego<ConfigDurak, EstadoDurak, AccionDurak, VistaDurak> = {
  id: 'durak',

  crear(config, semilla) {
    if (![2, 3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Durak se juega de 2 a 6 jugadores');
    }
    const n = config.jugadores;
    const { cartas, azar } = barajar(BARAJA_DURAK, crearAzar(semilla));
    const manos = Array.from({ length: n }, (_, a) =>
      cartas.slice(a * CARTAS_MANO_DURAK, (a + 1) * CARTAS_MANO_DURAK),
    );
    const cartaTriunfo = cartas.at(-1)!;
    const triunfo = paloDurak(cartaTriunfo);
    // Con 6 no queda mazo: la carta del triunfo es la última repartida y se sabe quién la tiene.
    const conocidas = manos.map((m) => (m.includes(cartaTriunfo) ? [cartaTriunfo] : []));
    // Empieza quien tiene el triunfo más bajo; si nadie tiene triunfos, el asiento 0.
    let atacante = 0;
    let menor = Infinity;
    manos.forEach((m, a) => {
      for (const c of m) {
        if (paloDurak(c) === triunfo && rangoDurak(c) < menor) {
          menor = rangoDurak(c);
          atacante = a;
        }
      }
    });
    return ok({
      config: { jugadores: n },
      azar,
      manos,
      mazo: cartas.slice(n * CARTAS_MANO_DURAK),
      triunfo,
      cartaTriunfo,
      mesa: [],
      descarte: [],
      atacante,
      defensor: (atacante + 1) % n,
      turno: atacante,
      pasaron: [],
      conocidas,
      salidos: [],
      ultimaAccion: null,
    });
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.mesa.length === 0) return mano.map((carta) => ({ tipo: 'atacar', carta }));
    if (asiento === e.defensor) {
      const ataque = e.mesa.find((p) => p.defensa === null)!.ataque;
      return [
        ...mano
          .filter((c) => ganaDurak(c, ataque, e.triunfo))
          .map((carta): AccionDurak => ({ tipo: 'defender', carta })),
        { tipo: 'tomar' },
      ];
    }
    return [
      ...cartasParaEchar(e, asiento).map((carta): AccionDurak => ({ tipo: 'atacar', carta })),
      { tipo: 'pasar' },
    ];
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoDurak = { ...e, ultimaAccion: { asiento, accion } };
    if (accion.tipo === 'tomar') return cerrarRonda(hecha, false);
    if (accion.tipo === 'pasar')
      return seguirEchando({ ...hecha, pasaron: [...e.pasaron, asiento] });

    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const conocidas = e.conocidas.map((c, a) =>
      a === asiento ? c.filter((x) => x !== accion.carta) : c,
    );
    if (accion.tipo === 'atacar') {
      return {
        ...hecha,
        manos,
        conocidas,
        mesa: [...e.mesa, { ataque: accion.carta, defensa: null }],
        pasaron: [],
        turno: e.defensor,
      };
    }
    const defendido: EstadoDurak = {
      ...hecha,
      manos,
      conocidas,
      mesa: e.mesa.map((p) => (p.defensa === null ? { ...p, defensa: accion.carta } : p)),
    };
    return seguirEchando(defendido);
  },

  vistaDe(e, asiento) {
    const fin = partidaTerminada(e);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      triunfo: e.triunfo,
      cartaTriunfo: e.cartaTriunfo,
      mesa: [...e.mesa],
      descarte: [...e.descarte],
      atacante: e.atacante,
      defensor: e.defensor,
      turno: fin ? null : e.turno,
      pasaron: [...e.pasaron],
      conocidas: e.conocidas.map((c) => [...c]),
      salidos: [...e.salidos],
      ultimaAccion: e.ultimaAccion,
      durak: fin ? (enJuego(e)[0] ?? null) : null,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const perdedor = enJuego(e)[0];
    if (perdedor === undefined) return { ganadores: [], empate: true };
    return {
      ganadores: Array.from({ length: e.config.jugadores }, (_, a) => a).filter(
        (a) => a !== perdedor,
      ),
      empate: false,
    };
  },
};
