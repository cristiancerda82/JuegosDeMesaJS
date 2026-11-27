import type { IdCarta } from '../baraja/cartas';
import type { AccionCuarentaYTres, VistaCuarentaYTres } from '../juegos/cuarenta-y-tres';
import { cartaGanadora, fuerza, paloDe, puntosDe, VALORES_BRISCA } from '../motor/bazas';
import type { Agente } from './agente';
import { cartaParaResponder, cartaParaSalir } from './bazas-heuristica';

/** Triunfos en la mano a partir de los que se arrastra al salir. */
const TRIUNFOS_PARA_ARRASTRAR = 5;

/** Cartas que el jugador ya conoce: las jugadas en la mano, las suyas y la muestra. */
function conocidas(vista: VistaCuarentaYTres): Set<IdCarta> {
  return new Set([
    ...vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
    ...vista.mesa.map((j) => j.carta),
    ...(vista.miMano ?? []),
    vista.muestra,
  ]);
}

/** Si la carta es la más alta que queda por jugar de su palo. */
function esMaestra(carta: IdCarta, vistas: ReadonlySet<IdCarta>): boolean {
  return !VALORES_BRISCA.orden
    .map((v) => `${paloDe(carta)}-${v}` as IdCarta)
    .some((c) => !vistas.has(c) && fuerza(c) > fuerza(carta));
}

/**
 * Al salir con muchos triunfos, se arrastra: con el más alto que queda por jugar si se tiene,
 * para no perderlo; si no, con el más bajo. `null` si no toca arrastrar.
 */
export function arrastre(vista: VistaCuarentaYTres, cartas: readonly IdCarta[]): IdCarta | null {
  const triunfos = cartas
    .filter((c) => paloDe(c) === vista.triunfo)
    .sort((a, b) => fuerza(b) - fuerza(a));
  if (triunfos.length < TRIUNFOS_PARA_ARRASTRAR) return null;
  const mayor = triunfos[0]!;
  return esMaestra(mayor, conocidas(vista)) ? mayor : triunfos.at(-1)!;
}

/**
 * Al salir, una carta con puntos de otro palo que nadie puede superar sin fallar (el As, o el
 * Tres cuando ya salió el As): así se «arañan» esos tantos. `null` si no hay ninguna.
 */
export function maestraConPuntos(
  vista: VistaCuarentaYTres,
  cartas: readonly IdCarta[],
): IdCarta | null {
  const vistas = conocidas(vista);
  const maestras = cartas
    .filter((c) => paloDe(c) !== vista.triunfo && puntosDe(c) > 0 && esMaestra(c, vistas))
    .sort((a, b) => puntosDe(b) - puntosDe(a));
  return maestras[0] ?? null;
}

/**
 * Jugando en medio, una carta de puntos del palo de salida que gana la baza y que nadie puede
 * superar sin fallar. `null` si no hay ninguna.
 */
function segura(vista: VistaCuarentaYTres, cartas: readonly IdCarta[]): IdCarta | null {
  if (vista.mesa.length !== 1) return null;
  const salida = paloDe(vista.mesa[0]!.carta);
  if (salida === vista.triunfo) return null;
  const vistas = conocidas(vista);
  const yo = vista.asiento!;
  const buenas = cartas
    .filter(
      (c) =>
        paloDe(c) === salida &&
        puntosDe(c) > 0 &&
        esMaestra(c, vistas) &&
        cartaGanadora([...vista.mesa, { asiento: yo, carta: c }], vista.triunfo).asiento === yo,
    )
    .sort((x, y) => puntosDe(y) - puntosDe(x));
  return buenas[0] ?? null;
}

/**
 * IA básica del Cuarenta y tres: cambia siempre la muestra, arrastra con muchos triunfos y, en
 * lo demás, juega con la heurística de bazas del Tute, cada uno por su cuenta.
 * Es determinista: no usa el azar que recibe.
 */
export const iaCuarentaYTresBasica: Agente<VistaCuarentaYTres, AccionCuarentaYTres> = {
  id: 'cuarenta-y-tres-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    // La muestra que se recibe vale lo mismo o más que la carta que se entrega.
    const cambio = acciones.find((a) => a.tipo === 'cambiarSiete');
    if (cambio) return { accion: cambio, azar };
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    const carta =
      segura(vista, cartas) ??
      (vista.mesa.length === 0
        ? (arrastre(vista, cartas) ??
          maestraConPuntos(vista, cartas) ??
          cartaParaSalir(vista.triunfo, cartas))
        : cartaParaResponder(
            {
              asiento: vista.asiento!,
              jugadores: vista.config.jugadores,
              triunfo: vista.triunfo,
              mesa: vista.mesa,
            },
            cartas,
          ));
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
