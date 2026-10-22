import { PALOS_FRANCESES, type IdCarta } from '../baraja/cartas';
import {
  esPica,
  ganadoraPicas,
  NIL,
  paloPicas,
  parejaPicas,
  rangoPicas,
  type AccionPicas,
  type VistaPicas,
} from '../juegos/picas';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

/**
 * IA básica de Picas: apuesta contando sus bazas seguras y dice Nil con una mano muy baja. Al
 * jugar intenta cumplir el contrato de la pareja sin sumar sacos, juega su Nil sin ganar bazas
 * y protege el Nil del compañero. Es determinista: no usa el azar que recibe.
 */
export const iaPicasBasica: Agente<VistaPicas, AccionPicas> = {
  id: 'picas-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'apuesta')
      return { accion: { tipo: 'apostar', bazas: apuestaPicas(vista) }, azar };
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    return { accion: { tipo: 'jugar', carta: cartaPicas(vista, cartas) }, azar };
  },
};

/** Bazas que espera hacer con esta mano. */
export function bazasEsperadasPicas(mano: readonly IdCarta[]): number {
  let bazas = 0;
  for (const palo of PALOS_FRANCESES) {
    const delPalo = mano.filter((c) => paloPicas(c) === palo).map(rangoPicas);
    const tiene = (r: number) => delPalo.includes(r);
    if (palo === 'picas') {
      // Las picas altas son bazas casi seguras, y las largas acaban ganando.
      bazas += [14, 13, 12].filter(tiene).length + Math.max(0, delPalo.length - 3);
      continue;
    }
    if (tiene(14)) bazas += 1;
    if (tiene(13) && delPalo.length >= 2) bazas += 1;
    if (tiene(12) && delPalo.length >= 3) bazas += 0.5;
  }
  return bazas;
}

/** La apuesta: las bazas esperadas (al menos 1), o Nil con una mano muy baja. */
export function apuestaPicas(vista: VistaPicas): number {
  const mano = vista.miMano ?? [];
  const esperadas = bazasEsperadasPicas(mano);
  const companero = (vista.asiento! + 2) % 4;
  const picaAlta = mano.some((c) => esPica(c) && rangoPicas(c) > 9);
  if (esperadas < 0.5 && !picaAlta && vista.apuestas[companero] !== NIL) return NIL;
  return Math.max(1, Math.min(13, Math.round(esperadas)));
}

/** Coste de soltar una carta: las picas valen más que el resto, y dentro, el rango. */
const peso = (c: IdCarta) => (esPica(c) ? 100 : 0) + rangoPicas(c);
const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
const masAlta = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(b) - peso(a))[0]!;

/** Lo que necesita saber la IA de la mano para elegir carta. */
function situacion(vista: VistaPicas) {
  const yo = vista.asiento!;
  const companero = (yo + 2) % 4;
  const pareja = parejaPicas(yo);
  const nilVivo = (a: Asiento) => vista.apuestas[a] === NIL && vista.bazas[a] === 0;
  const bazasContrato = [0, 1, 2, 3]
    .filter((a) => parejaPicas(a) === pareja && vista.apuestas[a] !== NIL)
    .reduce((s, a) => s + vista.bazas[a]!, 0);
  return {
    yo,
    companero,
    nilPropio: nilVivo(yo),
    nilCompanero: nilVivo(companero),
    faltan: vista.contratos[pareja] - bazasContrato,
  };
}

export function cartaPicas(vista: VistaPicas, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const s = situacion(vista);
  const mesa = vista.mesa;

  if (mesa.length === 0) return salida(vista, cartas, s.nilPropio, s.faltan > 0);

  const gana = (c: IdCarta) =>
    ganadoraPicas([...mesa, { asiento: s.yo, carta: c }]).asiento === s.yo;
  const ganadoras = cartas.filter(gana);
  const perdedoras = cartas.filter((c) => !gana(c));
  const ganaAhora = ganadoraPicas(mesa).asiento;
  const companeroJugo = mesa.some((j) => j.asiento === s.companero);

  // Nil propio: la más alta que no gane; si todas ganan, la más baja.
  if (s.nilPropio) return perdedoras.length > 0 ? masAlta(perdedoras) : masBaja(cartas);

  // Nil del compañero: si se está llevando la baza, quitársela; si aún no ha jugado, cubrirle.
  if (s.nilCompanero && ganadoras.length > 0) {
    if (ganaAhora === s.companero) return masBaja(ganadoras);
    if (!companeroJugo) return masAlta(ganadoras);
  }

  if (s.faltan > 0) {
    if (ganaAhora === s.companero && !s.nilCompanero) return masBaja(cartas);
    return ganadoras.length > 0 ? masBaja(ganadoras) : masBaja(cartas);
  }
  // Con el contrato cumplido, sin sumar sacos: la más alta que no gane.
  return perdedoras.length > 0 ? masAlta(perdedoras) : masBaja(cartas);
}

/** Al salir: con contrato pendiente, sus ganadoras seguras; si no, la más baja del palo más largo. */
function salida(
  vista: VistaPicas,
  cartas: readonly IdCarta[],
  nilPropio: boolean,
  faltanBazas: boolean,
): IdCarta {
  if (nilPropio) return masBaja(cartas);
  if (faltanBazas) {
    const fuera = new Set([...vista.jugadas, ...(vista.miMano ?? [])]);
    // La más alta de su palo que queda: ya no hay ninguna mayor por jugar.
    const seguras = cartas.filter(
      (c) =>
        !esPica(c) &&
        Array.from({ length: 14 - rangoPicas(c) }, (_, i) => rangoPicas(c) + 1 + i).every((r) =>
          fuera.has(`${paloPicas(c)}-${r === 14 ? 1 : r}` as IdCarta),
        ),
    );
    if (seguras.length > 0) return masAlta(seguras);
  }
  const noPicas = cartas.filter((c) => !esPica(c));
  const candidatas = noPicas.length > 0 ? noPicas : cartas;
  const largo = (c: IdCarta) => candidatas.filter((x) => paloPicas(x) === paloPicas(c)).length;
  return [...candidatas].sort((a, b) => largo(b) - largo(a) || peso(a) - peso(b))[0]!;
}
