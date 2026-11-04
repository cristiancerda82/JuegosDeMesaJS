import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  esReyEcarte,
  ganaSegundaEcarte,
  paloEcarte,
  rangoEcarte,
  type AccionEcarte,
  type VistaEcarte,
} from '../juegos/ecarte';
import type { Agente } from './agente';

/** Rango desde el que un triunfo cuenta como baza segura: la J. */
const J = 6;
/** Bazas para jugar de autoridad o rehusar. */
const BAZAS_PARA_JUGAR = 3;

/**
 * Las bazas que espera una mano: cada triunfo 1 si es K, Q o J o si hay 3 triunfos o más, y
 * medio si no; cada rey de otro palo 1 y cada dama de otro palo medio.
 */
export function bazasEsperadasEcarte(mano: readonly IdCarta[], triunfo: PaloFrances): number {
  const triunfos = mano.filter((c) => paloEcarte(c) === triunfo);
  let bazas = 0;
  for (const c of triunfos) bazas += rangoEcarte(c) >= J || triunfos.length >= 3 ? 1 : 0.5;
  for (const c of mano) {
    if (paloEcarte(c) === triunfo) continue;
    if (esReyEcarte(c)) bazas += 1;
    else if (rangoEcarte(c) === J + 1) bazas += 0.5;
  }
  return bazas;
}

const porRango = (a: IdCarta, b: IdCarta) => rangoEcarte(a) - rangoEcarte(b) || a.localeCompare(b);

/** Las cartas de las que se quiere descartar: las que no son triunfo ni rey, de la más baja. */
const flojas = (mano: readonly IdCarta[], triunfo: PaloFrances) =>
  mano.filter((c) => paloEcarte(c) !== triunfo && !esReyEcarte(c)).sort(porRango);

function salir(mano: readonly IdCarta[], triunfo: PaloFrances): IdCarta {
  const reyes = mano.filter((c) => esReyEcarte(c) && paloEcarte(c) !== triunfo).sort();
  if (reyes.length > 0) return reyes[0]!;
  const triunfos = mano.filter((c) => paloEcarte(c) === triunfo).sort(porRango);
  if (triunfos.length >= 2) return triunfos.at(-1)!;
  const largos = new Map<PaloFrances, number>();
  for (const c of mano) largos.set(paloEcarte(c), (largos.get(paloEcarte(c)) ?? 0) + 1);
  const largo = Math.max(...largos.values());
  return [...mano].filter((c) => largos.get(paloEcarte(c)) === largo).sort(porRango)[0]!;
}

/**
 * IA básica del Écarté (spec ia-jugadores): juega de autoridad o rehúsa con 3 bazas esperadas,
 * se descarta de lo que no es triunfo ni rey y juega las bazas con reglas sencillas.
 */
export const iaEcarteBasica: Agente<VistaEcarte, AccionEcarte> = {
  id: 'ecarte-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const mano = vista.miMano ?? [];
    const triunfo = paloEcarte(vista.vuelta);
    const hay = (tipo: AccionEcarte['tipo']) => acciones.find((a) => a.tipo === tipo);
    const elegir = (a: AccionEcarte | undefined) => ({ accion: a ?? acciones[0]!, azar });
    const fuerte = bazasEsperadasEcarte(mano, triunfo) >= BAZAS_PARA_JUGAR;

    switch (vista.fase) {
      case 'cambio':
        return elegir(hay(fuerte ? 'jugar' : 'proponer'));
      case 'respuesta':
        return elegir(hay(fuerte ? 'rehusar' : 'aceptar'));
      case 'descarte': {
        const descartar = (carta: IdCarta) =>
          acciones.find((a) => a.tipo === 'descartar' && a.carta === carta);
        const floja = flojas(mano, triunfo)[0];
        if (floja !== undefined && descartar(floja)) return elegir(descartar(floja));
        const robar = hay('robar');
        if (robar) return elegir(robar);
        // El mano tiene que cambiar al menos una: la más baja que no sea triunfo, o la más baja.
        const resto = [...mano].sort(porRango);
        const peor = resto.find((c) => paloEcarte(c) !== triunfo) ?? resto[0]!;
        return elegir(descartar(peor));
      }
      case 'bazas': {
        const cartas = acciones.flatMap((a) => (a.tipo === 'jugarCarta' ? [a.carta] : []));
        const jugar = (carta: IdCarta) =>
          elegir(acciones.find((a) => a.tipo === 'jugarCarta' && a.carta === carta));
        if (vista.mesa.length === 0) return jugar(salir(cartas, triunfo));
        const salida = vista.mesa[0]!.carta;
        const ganan = cartas.filter((c) => ganaSegundaEcarte(salida, c, triunfo)).sort(porRango);
        return jugar(ganan[0] ?? [...cartas].sort(porRango)[0]!);
      }
    }
  },
};
