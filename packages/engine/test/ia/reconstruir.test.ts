import { iaBriscaBasica } from '../../src/ia/brisca-basica';
import { reconstruirBrisca } from '../../src/ia/reconstruir/brisca';
import { reconstruirTute } from '../../src/ia/reconstruir/tute';
import { iaTuteBasica } from '../../src/ia/tute-basica';
import { brisca, CONFIG_BRISCA_POR_DEFECTO } from '../../src/juegos/brisca';
import { CONFIG_TUTE_POR_DEFECTO, tute } from '../../src/juegos/tute';
import { iaGuinoteBasica } from '../../src/ia/guinote-basica';
import { reconstruirGuinote } from '../../src/ia/reconstruir/guinote';
import { CONFIG_GUINOTE_POR_DEFECTO, guinote } from '../../src/juegos/guinote';
import { iaEscobaBasica } from '../../src/ia/escoba-basica';
import { reconstruirEscoba } from '../../src/ia/reconstruir/escoba';
import { CONFIG_ESCOBA_POR_DEFECTO, escoba } from '../../src/juegos/escoba';
import { iaChinchonBasica } from '../../src/ia/chinchon-basica';
import { reconstruirChinchon } from '../../src/ia/reconstruir/chinchon';
import { chinchon, CONFIG_CHINCHON_POR_DEFECTO } from '../../src/juegos/chinchon';
import { reconstruirSieteYMedia } from '../../src/ia/reconstruir/siete-y-media';
import { iaSieteYMediaBasica } from '../../src/ia/siete-y-media-basica';
import { CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, sieteYMedia } from '../../src/juegos/siete-y-media';
import { iaCinquilloBasica } from '../../src/ia/cinquillo-basica';
import { reconstruirCinquillo } from '../../src/ia/reconstruir/cinquillo';
import { cinquillo, CONFIG_CINQUILLO_POR_DEFECTO } from '../../src/juegos/cinquillo';
import { iaPochaBasica } from '../../src/ia/pocha-basica';
import { reconstruirPocha } from '../../src/ia/reconstruir/pocha';
import { CONFIG_POCHA_POR_DEFECTO, pocha } from '../../src/juegos/pocha';
import { iaMusBasica } from '../../src/ia/mus-basica';
import { reconstruirMus } from '../../src/ia/reconstruir/mus';
import { CONFIG_MUS_POR_DEFECTO, mus, pares, tieneJuego } from '../../src/juegos/mus';
import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { iaCorazonesBasica } from '../../src/ia/corazones-basica';
import { reconstruirCorazones } from '../../src/ia/reconstruir/corazones';
import { CONFIG_CORAZONES_POR_DEFECTO, corazones } from '../../src/juegos/corazones';
import { iaPinacleBasica } from '../../src/ia/pinacle-basica';
import { reconstruirPinacle } from '../../src/ia/reconstruir/pinacle';
import { CONFIG_PINACLE_POR_DEFECTO, pinacle } from '../../src/juegos/pinacle';
import { describirReconstruccion } from '../contrato/verificar-reconstruccion';

// Una suite por juego (spec niveles-ia: reconstrucción de las cartas ocultas).

describirReconstruccion(brisca, reconstruirBrisca, {
  configs: [
    CONFIG_BRISCA_POR_DEFECTO,
    { jugadores: 4, cambioMuestra: 'trasGanarBaza', arrastreFinal: true, manos: 3 },
  ],
  base: iaBriscaBasica,
});

describirReconstruccion(tute, reconstruirTute, {
  configs: [CONFIG_TUTE_POR_DEFECTO, { ...CONFIG_TUTE_POR_DEFECTO, jugadores: 4, manos: 3 }],
  base: iaTuteBasica,
});

describirReconstruccion(guinote, reconstruirGuinote, {
  configs: [
    CONFIG_GUINOTE_POR_DEFECTO,
    { jugadores: 4, cambioSiete: 'libre', montarSobreCompanero: true, meta: 51 },
  ],
  base: iaGuinoteBasica,
});

describirReconstruccion(escoba, reconstruirEscoba, {
  configs: [
    CONFIG_ESCOBA_POR_DEFECTO,
    { jugadores: 4, puntosPartida: 15, capturaObligatoria: true, escobaInicial: false },
  ],
  base: iaEscobaBasica,
});

describirReconstruccion(chinchon, reconstruirChinchon, {
  configs: [
    CONFIG_CHINCHON_POR_DEFECTO,
    { jugadores: 4, baraja: 'espanola48', comodines: false, limite: 50, cierreMaximo: 5 },
  ],
  base: iaChinchonBasica,
  // Las acciones legales del Chinchón son caras (cada cierre busca combinaciones).
  partidas: 3,
  pasosMaximos: 300,
  pasosFinales: 300,
});

describirReconstruccion(sieteYMedia, reconstruirSieteYMedia, {
  configs: [
    CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
    {
      jugadores: 4,
      manos: 5,
      fichasIniciales: 20,
      apuestaMaxima: 5,
      pagoDoble: false,
      cambioBanca: 'sieteYMedia',
    },
  ],
  base: iaSieteYMediaBasica,
});

describirReconstruccion(cinquillo, reconstruirCinquillo, {
  configs: [CONFIG_CINQUILLO_POR_DEFECTO, { jugadores: 3, manos: 1 }, { jugadores: 2, manos: 1 }],
  base: iaCinquilloBasica,
});

describirReconstruccion(pocha, reconstruirPocha, {
  configs: [
    CONFIG_POCHA_POR_DEFECTO,
    { jugadores: 3, duracion: 'completa', restriccionRepartidor: false },
  ],
  base: iaPochaBasica,
});

describirReconstruccion(mus, reconstruirMus, {
  configs: [CONFIG_MUS_POR_DEFECTO, { reyes: 4, puntos: 30, juegos: 1 }],
  base: iaMusBasica,
});

describe('reconstrucción del Mus', () => {
  it('las manos ajenas cuadran con lo declarado de pares y juego', () => {
    let revisadas = 0;
    for (let i = 0; i < 300; i++) {
      const creado = mus.crear(CONFIG_MUS_POR_DEFECTO, `declaraciones-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      // Se corta el mus para llegar a los lances, y se pasa hasta el lance de Juego.
      for (let paso = 0; paso < 40 && e.declaraciones.juego === null; paso++) {
        const t = e.turno;
        const acciones = mus.accionesLegales(e, t);
        if (acciones.length === 0) break;
        const accion =
          acciones.find((a) => a.tipo === 'cortar') ??
          acciones.find((a) => a.tipo === 'paso') ??
          acciones.find((a) => a.tipo === 'noQuiero') ??
          acciones[0]!;
        e = mus.transicion(e, t, accion);
      }
      const { pares: conPares, juego: conJuego } = e.declaraciones;
      if (conPares === null || mus.resultado(e) !== null) continue;
      const r = reconstruirMus(mus.vistaDe(e, 0), crearAzar(`mus-${i}`));
      for (let a = 1; a < 4; a++) {
        expect(pares(r.manos[a]!, 8) !== null).toBe(conPares[a]);
        if (conJuego) expect(tieneJuego(r.manos[a]!, 8)).toBe(conJuego[a]);
      }
      revisadas++;
    }
    expect(revisadas).toBeGreaterThan(50);
  });
});

describirReconstruccion(corazones, reconstruirCorazones, {
  configs: [CONFIG_CORAZONES_POR_DEFECTO, { pase: false, fin: 50 }],
  base: iaCorazonesBasica,
  partidas: 4,
});

describirReconstruccion(pinacle, reconstruirPinacle, {
  configs: [CONFIG_PINACLE_POR_DEFECTO, { jugadores: 4 }],
  base: iaPinacleBasica,
  partidas: 3,
  pasosMaximos: 600,
});
