import { bandoCasino, numBandosCasino, type Asiento, type ConfigCasino } from '@juegos/engine';
import type { InfoRed } from '../sesion/sesion-mesa';
import { T } from '../textos';
import { nombreAsiento, nombreNumerado } from './bazas/asientos';

/** Nombre de un asiento en el Casino: en parejas, «Compañero»; si no, «Rival 1», «Rival 2»… */
export function nombreCasino(
  config: ConfigCasino,
  asiento: Asiento,
  yo: Asiento,
  red: InfoRed | null,
): string {
  return config.parejas
    ? nombreAsiento(asiento, config.jugadores, yo, red)
    : nombreNumerado(asiento, config.jugadores, yo, red, T.brisca.rivalN, T.brisca.rival);
}

/** Nombre de cada jugador o pareja, por bando: «Tú» o «Nosotros» para el del jugador. */
export function nombresBandoCasino(
  config: ConfigCasino,
  yo: Asiento,
  red: InfoRed | null,
): string[] {
  const mio = bandoCasino(config, yo);
  return Array.from({ length: numBandosCasino(config) }, (_, b) =>
    config.parejas
      ? b === mio
        ? T.brisca.nosotros
        : T.brisca.ellos
      : nombreCasino(config, b, yo, red),
  );
}
