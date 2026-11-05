import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_TYSIACHA,
  paloTysiacha,
  rivalesTysiacha,
  tysiacha,
  type AccionTysiacha,
  type ConfigTysiacha,
  type EstadoTysiacha,
  type VistaTysiacha,
} from '../../juegos/tysiacha';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Hueco que se reparte además de las tres manos: el prikup sin enseñar. */
const PRIKUP = 3;
const INTENTOS = 20;

/**
 * Un estado de Tysiącha coherente con la vista: las manos ajenas y el prikup sin enseñar al azar
 * entre las cartas que no se ven, sin los palos que cada uno no tiene. Se quedan donde están las
 * cartas dadas que se conocen y la pareja de cada matrimonio cantado; las cartas del prikup
 * enseñado van al declarante o, una como mucho, al rival que no es el jugador.
 */
export function reconstruirTysiacha(vista: VistaTysiacha, azar: EstadoAzar): EstadoTysiacha {
  const yo = vista.asiento;
  const decl = vista.declarante;
  const mia = vista.miMano ?? [];
  const jugadas = vista.jugadasPor.flat();
  const enJuego = new Set<IdCarta>([...mia, ...jugadas]);

  // Cartas cuyo dueño se sabe: las dadas que se ven y la pareja de cada matrimonio.
  const fijas: IdCarta[][] = [[], [], []];
  for (const [a, d] of vista.dadas.entries()) {
    if (d !== null && a !== yo && !enJuego.has(d)) fijas[a]!.push(d);
  }
  for (const m of vista.matrimonios) {
    if (m.asiento === yo) continue;
    for (const v of [12, 13]) {
      const c = `${m.palo}-${v}` as IdCarta;
      if (!enJuego.has(c) && !fijas[m.asiento]!.includes(c)) fijas[m.asiento]!.push(c);
    }
  }
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_TYSIACHA, mia, jugadas, ...fijas),
    azar,
  );
  const prikupVisto = vista.prikup;
  // El rival que no es el jugador puede tener como mucho una carta del prikup (la que le dieron).
  const otroRival =
    decl !== null && yo !== null && yo !== decl
      ? rivalesTysiacha(decl).find((r) => r !== yo)!
      : null;
  const delPrikup = new Set(prikupVisto ?? []);
  const huecos = [
    ...vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n - fijas[a]!.length)),
    prikupVisto === null ? 3 : 0,
  ];
  const admite = (a: Asiento, c: IdCarta) => {
    if (delPrikup.has(c)) return a === decl || a === otroRival;
    if (a >= PRIKUP) return true;
    if (a === yo) return false;
    return !vista.fallos[a]!.includes(paloTysiacha(c));
  };
  const g = new Generador(azarReparto);
  let repartidas: IdCarta[][] | null = null;
  for (let i = 0; i < INTENTOS && repartidas === null; i++) {
    try {
      const r = repartirConPermitidos(cartas, huecos, admite, g);
      if (otroRival === null || r[otroRival]!.filter((c) => delPrikup.has(c)).length <= 1) {
        repartidas = r;
      }
    } catch {
      break;
    }
  }
  if (repartidas === null) {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = cartas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  const manos = [0, 1, 2].map((a) =>
    a === yo && vista.miMano ? [...vista.miMano] : [...fijas[a]!, ...repartidas![a]!],
  );
  // La carta que recibió un rival y no se ve: la del prikup que tenga, o una cualquiera suya.
  const recibio = (a: Asiento) =>
    decl !== null && a !== decl && vista.cartasDadas >= (a === rivalesTysiacha(decl)[0] ? 1 : 2);
  const dadas = vista.dadas.map((d, a) => {
    if (d !== null || !recibio(a)) return d;
    const suyas = [...manos[a]!, ...vista.jugadasPor[a]!];
    return suyas.find((c) => delPrikup.has(c)) ?? suyas[0] ?? null;
  });
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    prikup: prikupVisto === null ? repartidas[PRIKUP]! : [...prikupVisto],
    prikupVisto: prikupVisto !== null,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pujas: [...vista.pujas],
    puja: vista.puja,
    pujador: vista.pujador,
    declarante: decl,
    contrato: vista.contrato,
    dadas,
    triunfo: vista.triunfo,
    matrimonios: [...vista.matrimonios],
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => [...f]),
    bazasGanadas: [...vista.bazasGanadas],
    puntosCartas: [...vista.puntosCartas],
    puntosMatrimonios: [...vista.puntosMatrimonios],
    marcador: [...vista.marcador],
    barril: [...vista.barril],
    ganador: vista.ganador,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_TYSIACHA: Simulable<
  ConfigTysiacha,
  EstadoTysiacha,
  AccionTysiacha,
  VistaTysiacha
> = {
  juego: tysiacha,
  reconstruir: reconstruirTysiacha,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // Pujar, dar y fijar el contrato, como la normal: solo se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(tysiacha.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const otros = r.anotado.filter((_, a) => a !== asiento);
    return r.anotado[asiento]! - (otros[0]! + otros[1]!) / 2 + bono;
  },
  reconstrucciones: 40,
  presupuesto: 400,
};
