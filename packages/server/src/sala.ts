import {
  crearAzar,
  Generador,
  igualesJSON,
  JUEGOS_EN_RED,
  type Asiento,
  type EstadoAzar,
  type IdJuegoRed,
  type JuegoEnRed,
  type NivelIA,
} from '@juegos/engine';
import {
  MENSAJES_ERROR,
  type CodigoError,
  type InfoAsiento,
  type MensajeServidor,
} from './protocolo';

/**
 * Una sala de juego en red (spec partidas-en-red; design, decisión 4). Es pura: no conoce los
 * sockets ni el reloj. Recibe la hora en cada llamada, envía los mensajes con `enviar` y dice
 * cuándo hay que despertarla (`proximoDespertar`) para que juegue la IA.
 */

/** La IA juega por un jugador desconectado pasado este tiempo. */
export const RELEVO_MS = 10_000;
/** Pausa de la IA en los juegos por turnos, para que se pueda seguir la partida. */
export const PAUSA_IA_MS = 900;
/** Una pausa pedida por un jugador (resumen de mano, guía) dura como mucho esto. */
export const PAUSA_MAXIMA_MS = 60_000;

export type IdConexion = number;

export interface Dependencias {
  /** Envía un mensaje a una conexión. */
  enviar(conexion: IdConexion, mensaje: MensajeServidor): void;
  /** Un testigo secreto nuevo para un jugador. */
  testigo(): string;
  /** Una semilla nueva para una partida. */
  semilla(): string;
}

interface Jugador {
  readonly nombre: string;
  readonly testigo: string;
  conexion: IdConexion | null;
  /** Hora a la que se desconectó, o `null` si está conectado. */
  desconectadoDesde: number | null;
  /** Hora a la que pidió una pausa, o `null`. */
  pausaDesde: number | null;
}

/** Una jugada de la IA programada. */
interface Programada {
  readonly cuando: number;
  readonly accion: unknown;
}

export type Respuesta<T = undefined> =
  { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly codigo: CodigoError };

const bien = <T>(valor: T): Respuesta<T> => ({ ok: true, valor });
const mal = (codigo: CodigoError): Respuesta<never> => ({ ok: false, codigo });

export class Sala {
  readonly codigo: string;
  readonly juego: IdJuegoRed;
  readonly config: unknown;
  readonly nivel: NivelIA;
  readonly #def: JuegoEnRed;
  readonly #deps: Dependencias;
  readonly #jugadores: (Jugador | null)[];
  #anfitrion: Asiento = 0;
  #partida = 0;
  #estado: unknown = null;
  #jugadas = 0;
  #azares: EstadoAzar[] = [];
  #programadas = new Map<Asiento, Programada>();
  /** Hora desde la que no hay nadie conectado, o `null`. */
  #vaciaDesde: number | null = null;

  private constructor(
    codigo: string,
    juego: IdJuegoRed,
    config: unknown,
    nivel: NivelIA,
    asientos: number,
    deps: Dependencias,
  ) {
    this.codigo = codigo;
    this.juego = juego;
    this.config = config;
    this.nivel = nivel;
    this.#def = JUEGOS_EN_RED[juego];
    this.#deps = deps;
    this.#jugadores = new Array<Jugador | null>(asientos).fill(null);
  }

  /** Crea la sala con el anfitrión en el asiento 0; falla si las opciones no son válidas. */
  static crear(
    datos: {
      codigo: string;
      juego: IdJuegoRed;
      config: unknown;
      nivel: NivelIA;
      nombre: string;
      conexion: IdConexion;
    },
    deps: Dependencias,
  ): Respuesta<Sala> {
    const def = JUEGOS_EN_RED[datos.juego];
    const prueba = def.juego.crear(datos.config, 'prueba');
    if (!prueba.ok) return mal('config-invalida');
    const sala = new Sala(
      datos.codigo,
      datos.juego,
      datos.config,
      datos.nivel,
      def.juego.asientos(prueba.valor),
      deps,
    );
    sala.#sentar(0, datos.nombre, datos.conexion);
    sala.#enviarSala();
    return bien(sala);
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  get empezada(): boolean {
    return this.#estado !== null;
  }

  get asientos(): number {
    return this.#jugadores.length;
  }

  get anfitrion(): Asiento {
    return this.#anfitrion;
  }

  /** Asiento de una conexión, o `null`. */
  asientoDe(conexion: IdConexion): Asiento | null {
    const a = this.#jugadores.findIndex((j) => j?.conexion === conexion);
    return a < 0 ? null : a;
  }

  /** Lleva vacía (sin nadie conectado) desde esta hora, o `null`. */
  get vaciaDesde(): number | null {
    return this.#vaciaDesde;
  }

  /** Estado completo de la partida (solo para tests y diagnóstico; nunca se envía). */
  get estado(): unknown {
    return this.#estado;
  }

  // ── Entrar y salir ─────────────────────────────────────────────────────────

  /** Un jugador nuevo entra en el primer asiento libre (solo antes de empezar). */
  unirse(nombre: string, conexion: IdConexion, ahora: number): Respuesta<Asiento> {
    if (this.empezada) return mal('empezada');
    const libre = this.#jugadores.findIndex((j) => j === null);
    if (libre < 0) return mal('sala-llena');
    this.#sentar(libre, nombre, conexion);
    this.#actualizar(ahora);
    return bien(libre);
  }

  /** Un jugador vuelve con su testigo: recupera su asiento. */
  volver(testigo: string, conexion: IdConexion, ahora: number): Respuesta<Asiento> {
    const a = this.#jugadores.findIndex((j) => j?.testigo === testigo);
    if (a < 0) return mal('testigo');
    const j = this.#jugadores[a]!;
    j.conexion = conexion;
    j.desconectadoDesde = null;
    j.pausaDesde = null;
    this.#deps.enviar(conexion, { tipo: 'entrada', codigo: this.codigo, asiento: a, testigo });
    this.#actualizar(ahora);
    return bien(a);
  }

  /**
   * Se cierra la conexión de un jugador. Antes de empezar deja libre su asiento; con la partida
   * empezada queda desconectado y la IA lo releva pasado `RELEVO_MS`.
   */
  desconectar(asiento: Asiento, ahora: number): void {
    const j = this.#jugadores[asiento];
    if (!j) return;
    if (!this.empezada) {
      this.#jugadores[asiento] = null;
      if (asiento === this.#anfitrion) {
        const otro = this.#jugadores.findIndex((x) => x?.conexion != null);
        this.#anfitrion = otro < 0 ? 0 : otro;
      }
    } else {
      j.conexion = null;
      j.desconectadoDesde = ahora;
      j.pausaDesde = null;
    }
    this.#actualizar(ahora);
  }

  /** Cambia de asiento antes de empezar. */
  cambiarAsiento(asiento: Asiento, nuevo: Asiento, ahora: number): Respuesta {
    if (this.empezada) return mal('empezada');
    if (nuevo >= this.asientos || this.#jugadores[nuevo] !== null) return mal('asiento-ocupado');
    this.#jugadores[nuevo] = this.#jugadores[asiento]!;
    this.#jugadores[asiento] = null;
    if (this.#anfitrion === asiento) this.#anfitrion = nuevo;
    this.#deps.enviar(this.#jugadores[nuevo]!.conexion!, {
      tipo: 'entrada',
      codigo: this.codigo,
      asiento: nuevo,
      testigo: this.#jugadores[nuevo]!.testigo,
    });
    this.#actualizar(ahora);
    return bien(undefined);
  }

  // ── Partida ────────────────────────────────────────────────────────────────

  /** Empieza la partida (solo el anfitrión): los asientos libres los juega la IA. */
  empezar(asiento: Asiento, ahora: number): Respuesta {
    if (asiento !== this.#anfitrion) return mal('no-anfitrion');
    if (this.empezada) return mal('empezada');
    this.#nuevaPartida();
    this.#actualizar(ahora);
    return bien(undefined);
  }

  /** Otra partida con las mismas opciones y asientos (solo el anfitrión, al terminar). */
  revancha(asiento: Asiento, ahora: number): Respuesta {
    if (asiento !== this.#anfitrion) return mal('no-anfitrion');
    if (!this.empezada) return mal('no-empezada');
    if (this.#def.juego.resultado(this.#estado) === null) return mal('empezada');
    this.#nuevaPartida();
    this.#actualizar(ahora);
    return bien(undefined);
  }

  /**
   * Aplica la jugada de un jugador. `n` son las jugadas que había visto: si la partida ha
   * avanzado desde entonces (salvo en los juegos en tiempo real), se rechaza.
   */
  jugar(asiento: Asiento, accion: unknown, n: number, ahora: number): Respuesta {
    if (!this.empezada) return mal('no-empezada');
    if (n !== this.#jugadas && this.#def.retrasoIA === null) return mal('desfase');
    const legales = this.#def.juego.accionesLegales(this.#estado, asiento);
    if (!legales.some((a) => igualesJSON(a, accion))) return mal('accion-ilegal');
    this.#aplicar(asiento, accion);
    this.#actualizar(ahora);
    return bien(undefined);
  }

  /** Un jugador abre o cierra un panel que pide pausar a la IA. */
  pausa(asiento: Asiento, activa: boolean, ahora: number): void {
    const j = this.#jugadores[asiento];
    if (!j) return;
    j.pausaDesde = activa ? ahora : null;
    this.#actualizar(ahora);
  }

  /** Mensaje de error para una conexión. */
  error(conexion: IdConexion, codigo: CodigoError): void {
    this.#deps.enviar(conexion, { tipo: 'error', codigo, mensaje: MENSAJES_ERROR[codigo] });
  }

  // ── Tiempo ─────────────────────────────────────────────────────────────────

  /** Milisegundos hasta que haya que llamar a `despertar`, o `null` si no hace falta. */
  proximoDespertar(ahora: number): number | null {
    const momentos: number[] = [];
    if (this.empezada) {
      for (const j of this.#jugadores) {
        if (j?.desconectadoDesde != null && ahora - j.desconectadoDesde < RELEVO_MS) {
          momentos.push(j.desconectadoDesde + RELEVO_MS);
        }
        if (j?.pausaDesde != null) momentos.push(j.pausaDesde + PAUSA_MAXIMA_MS);
      }
      const pausada = this.#pausada(ahora);
      if (!pausada) for (const p of this.#programadas.values()) momentos.push(p.cuando);
    }
    if (momentos.length === 0) return null;
    return Math.max(0, Math.min(...momentos) - ahora);
  }

  /** Juega lo que le toque a la IA y avisa de los relevos que hayan vencido. */
  despertar(ahora: number): void {
    if (!this.empezada) return;
    for (const j of this.#jugadores) {
      if (j?.pausaDesde != null && ahora - j.pausaDesde >= PAUSA_MAXIMA_MS) j.pausaDesde = null;
    }
    if (!this.#pausada(ahora)) {
      const vencidas = [...this.#programadas.entries()]
        .filter(([, p]) => p.cuando <= ahora)
        .sort(([a, x], [b, y]) => x.cuando - y.cuando || a - b);
      for (const [asiento] of vencidas) {
        if (!this.#programadas.has(asiento)) continue;
        this.#programadas.delete(asiento);
        this.#jugarIA(asiento);
      }
    }
    this.#actualizar(ahora);
  }

  // ── Interno ────────────────────────────────────────────────────────────────

  #sentar(asiento: Asiento, nombre: string, conexion: IdConexion) {
    const testigo = this.#deps.testigo();
    this.#jugadores[asiento] = {
      nombre,
      testigo,
      conexion,
      desconectadoDesde: null,
      pausaDesde: null,
    };
    this.#deps.enviar(conexion, { tipo: 'entrada', codigo: this.codigo, asiento, testigo });
  }

  #nuevaPartida() {
    const semilla = this.#deps.semilla();
    const creado = this.#def.juego.crear(this.config, semilla);
    if (!creado.ok) throw new Error(creado.error);
    this.#estado = creado.valor;
    this.#jugadas = 0;
    this.#partida++;
    this.#azares = this.#jugadores.map((_, a) => crearAzar(`${semilla}/ia${a}`));
    this.#programadas.clear();
  }

  #aplicar(asiento: Asiento, accion: unknown) {
    this.#estado = this.#def.juego.transicion(this.#estado, asiento, accion);
    this.#jugadas++;
  }

  /** La IA juega por este asiento: libre, o de un jugador desconectado hace tiempo. */
  #juegaIA(asiento: Asiento, ahora: number): boolean {
    const j = this.#jugadores[asiento];
    return j === null || (j?.desconectadoDesde != null && ahora - j.desconectadoDesde >= RELEVO_MS);
  }

  #pausada(ahora: number): boolean {
    return this.#jugadores.some(
      (j) => j?.conexion != null && j.pausaDesde != null && ahora - j.pausaDesde < PAUSA_MAXIMA_MS,
    );
  }

  /** Lo que haría ahora la IA del asiento, sin gastar su azar. */
  #decisionIA(asiento: Asiento, legales: readonly unknown[]) {
    const vista = this.#def.juego.vistaDe(this.#estado, asiento);
    return this.#def.ias[this.nivel].decidir(vista, legales, this.#azares[asiento]!);
  }

  #jugarIA(asiento: Asiento) {
    const legales = this.#def.juego.accionesLegales(this.#estado, asiento);
    if (legales.length === 0) return;
    const d = this.#decisionIA(asiento, legales);
    this.#azares[asiento] = d.azar;
    this.#aplicar(asiento, d.accion);
  }

  /** Reprograma la IA y envía la sala y la partida a todos los conectados. */
  #actualizar(ahora: number) {
    const conectados = this.#jugadores.some((j) => j?.conexion != null);
    this.#vaciaDesde = conectados ? null : (this.#vaciaDesde ?? ahora);
    if (this.empezada) this.#programar(ahora);
    this.#enviarSala(ahora);
    if (this.empezada) this.#enviarPartida();
  }

  #programar(ahora: number) {
    const juego = this.#def.juego;
    if (juego.resultado(this.#estado) !== null) {
      this.#programadas.clear();
      return;
    }
    const nuevas = new Map<Asiento, Programada>();
    for (let a = 0; a < this.asientos; a++) {
      const legales = juego.accionesLegales(this.#estado, a);
      if (legales.length === 0 || !this.#juegaIA(a, ahora)) continue;
      const previa = this.#programadas.get(a);
      if (this.#def.retrasoIA === null) {
        // Por turnos: una sola jugada pendiente, con la pausa fija desde que le toca.
        nuevas.set(a, previa ?? { cuando: ahora + PAUSA_IA_MS, accion: null });
        continue;
      }
      // En tiempo real: se conserva el plazo mientras la acción prevista no cambie.
      const d = this.#decisionIA(a, legales);
      if (previa && igualesJSON(previa.accion, d.accion)) {
        nuevas.set(a, previa);
      } else {
        const vista = juego.vistaDe(this.#estado, a);
        const g = new Generador(crearAzar(`${this.codigo}/${this.#partida}/${this.#jugadas}/${a}`));
        const espera = this.#def.retrasoIA(vista, d.accion, g, this.nivel);
        nuevas.set(a, { cuando: ahora + espera, accion: d.accion });
      }
    }
    this.#programadas = nuevas;
  }

  #infoAsientos(ahora: number): (InfoAsiento | null)[] {
    return this.#jugadores.map((j) =>
      j === null
        ? null
        : {
            nombre: j.nombre,
            conectado: j.conexion !== null,
            relevado: this.empezada && this.#juegaIA(this.#jugadores.indexOf(j), ahora),
          },
    );
  }

  #enviarSala(ahora = 0) {
    const mensaje: MensajeServidor = {
      tipo: 'sala',
      codigo: this.codigo,
      juego: this.juego,
      config: this.config,
      nivel: this.nivel,
      anfitrion: this.#anfitrion,
      asientos: this.#infoAsientos(ahora),
      empezada: this.empezada,
      partida: this.#partida,
    };
    for (const j of this.#jugadores)
      if (j?.conexion != null) this.#deps.enviar(j.conexion, mensaje);
  }

  #enviarPartida() {
    const juego = this.#def.juego;
    const fin = juego.resultado(this.#estado);
    // El asiento de la IA que juega antes (en los juegos por turnos, el único).
    let piensa: Asiento | null = null;
    let antes = Infinity;
    for (const [a, p] of this.#programadas) {
      if (p.cuando < antes) {
        antes = p.cuando;
        piensa = a;
      }
    }
    this.#jugadores.forEach((j, a) => {
      if (j?.conexion == null) return;
      this.#deps.enviar(j.conexion, {
        tipo: 'partida',
        partida: this.#partida,
        n: this.#jugadas,
        vista: juego.vistaDe(this.#estado, a),
        legales: juego.accionesLegales(this.#estado, a),
        fin,
        piensa: this.#def.retrasoIA === null ? piensa : null,
      });
    });
  }
}
