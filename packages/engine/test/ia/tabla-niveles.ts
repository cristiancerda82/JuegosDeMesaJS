import { IAS, type IasPorNivel } from '../../src/ia/ias';
import { brisca, CONFIG_BRISCA_POR_DEFECTO } from '../../src/juegos/brisca';
import { burro, CONFIG_BURRO_POR_DEFECTO } from '../../src/juegos/burro';
import { butifarra, CONFIG_BUTIFARRA_POR_DEFECTO } from '../../src/juegos/butifarra';
import { chinchon, CONFIG_CHINCHON_POR_DEFECTO } from '../../src/juegos/chinchon';
import { cinquillo, CONFIG_CINQUILLO_POR_DEFECTO } from '../../src/juegos/cinquillo';
import { CONFIG_CORAZONES_POR_DEFECTO, corazones } from '../../src/juegos/corazones';
import { CONFIG_ESCOBA_POR_DEFECTO, escoba } from '../../src/juegos/escoba';
import { CONFIG_GUINOTE_POR_DEFECTO, guinote } from '../../src/juegos/guinote';
import { CONFIG_MUS_POR_DEFECTO, mus } from '../../src/juegos/mus';
import { CONFIG_PINACLE_POR_DEFECTO, pinacle } from '../../src/juegos/pinacle';
import { CONFIG_POCHA_POR_DEFECTO, pocha } from '../../src/juegos/pocha';
import { CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, sieteYMedia } from '../../src/juegos/siete-y-media';
import { CONFIG_JULEPE_POR_DEFECTO, julepe } from '../../src/juegos/julepe';
import { CONFIG_REMIGIO_POR_DEFECTO, remigio } from '../../src/juegos/remigio';
import { CONFIG_TRUC_POR_DEFECTO, truc } from '../../src/juegos/truc';
import { CONFIG_TUTE_POR_DEFECTO, tute } from '../../src/juegos/tute';
import { CONFIG_CUATROLA_POR_DEFECTO, cuatrola } from '../../src/juegos/cuatrola';
import { CONFIG_MENTIROSO_POR_DEFECTO, mentiroso } from '../../src/juegos/mentiroso';
import { CONFIG_OCHO_LOCO_POR_DEFECTO, ochoLoco } from '../../src/juegos/ocho-loco';
import { CONFIG_PICAS_POR_DEFECTO, picas } from '../../src/juegos/picas';
import { blackjack, CONFIG_BLACKJACK_POR_DEFECTO } from '../../src/juegos/blackjack';
import { CONFIG_GIN_RUMMY_POR_DEFECTO, ginRummy } from '../../src/juegos/gin-rummy';
import { CONFIG_RUMMY_500_POR_DEFECTO, rummy500 } from '../../src/juegos/rummy-500';
import { CONFIG_HOLDEM_POR_DEFECTO, holdem } from '../../src/juegos/holdem';
import { CONFIG_CULO_POR_DEFECTO, culo } from '../../src/juegos/culo';
import { canasta, CONFIG_CANASTA_POR_DEFECTO } from '../../src/juegos/canasta';
import { CONFIG_TUTE_SUBASTADO_POR_DEFECTO, tuteSubastado } from '../../src/juegos/tute-subastado';
import type { Asiento, Juego } from '../../src/motor/contrato';
import { porBandos, unoContraTodos } from './duelo';

/** Un juego con sus IAs por nivel, la configuración de las pruebas y cómo se forman los lados. */
export interface JuegoConNiveles {
  readonly nombre: string;
  readonly juego: Juego<unknown, unknown, unknown, unknown>;
  readonly config: unknown;
  readonly ias: IasPorNivel<unknown, unknown>;
  readonly esA: (asiento: Asiento, i: number) => boolean;
  /** Parte de las partidas que ganaría un lado si las dos IAs fueran iguales. */
  readonly parteJusta: number;
  /** El difícil tiene que ganar a la normal en la prueba de fuerza (todos menos el Burro y el Mus). */
  readonly simula: boolean;
}

function entrada<C, E, A, V>(
  nombre: string,
  juego: Juego<C, E, A, V>,
  config: C,
  ias: IasPorNivel<V, A>,
  lados: 'bandos' | number,
  simula = true,
): JuegoConNiveles {
  return {
    nombre,
    juego: juego as unknown as Juego<unknown, unknown, unknown, unknown>,
    config,
    ias: ias as unknown as IasPorNivel<unknown, unknown>,
    esA: lados === 'bandos' ? porBandos : unoContraTodos(lados),
    parteJusta: lados === 'bandos' ? 1 / 2 : 1 / lados,
    simula,
  };
}

/** Las configuraciones son las de por defecto: las que más se juegan. */
export const JUEGOS_CON_NIVELES: readonly JuegoConNiveles[] = [
  entrada('Brisca', brisca, CONFIG_BRISCA_POR_DEFECTO, IAS.brisca, 'bandos'),
  entrada('Tute', tute, CONFIG_TUTE_POR_DEFECTO, IAS.tute, 'bandos'),
  entrada('Guiñote', guinote, CONFIG_GUINOTE_POR_DEFECTO, IAS.guinote, 'bandos'),
  entrada('Escoba', escoba, CONFIG_ESCOBA_POR_DEFECTO, IAS.escoba, 'bandos'),
  entrada('Chinchón', chinchon, CONFIG_CHINCHON_POR_DEFECTO, IAS.chinchon, 2),
  entrada('Siete y media', sieteYMedia, CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, IAS.sieteYMedia, 2),
  entrada('Cinquillo', cinquillo, CONFIG_CINQUILLO_POR_DEFECTO, IAS.cinquillo, 4),
  entrada('Pocha', pocha, CONFIG_POCHA_POR_DEFECTO, IAS.pocha, 4),
  entrada('Mus', mus, CONFIG_MUS_POR_DEFECTO, IAS.mus, 'bandos', false),
  entrada('Corazones', corazones, CONFIG_CORAZONES_POR_DEFECTO, IAS.corazones, 4),
  entrada('Burro', burro, CONFIG_BURRO_POR_DEFECTO, IAS.burro, 4, false),
  entrada('Pinacle', pinacle, CONFIG_PINACLE_POR_DEFECTO, IAS.pinacle, 'bandos'),
  entrada('Butifarra', butifarra, CONFIG_BUTIFARRA_POR_DEFECTO, IAS.butifarra, 'bandos'),
  entrada('Truc', truc, CONFIG_TRUC_POR_DEFECTO, IAS.truc, 'bandos'),
  entrada('Julepe', julepe, CONFIG_JULEPE_POR_DEFECTO, IAS.julepe, 4),
  entrada('Remigio', remigio, CONFIG_REMIGIO_POR_DEFECTO, IAS.remigio, 2),
  entrada('Tute subastado', tuteSubastado, CONFIG_TUTE_SUBASTADO_POR_DEFECTO, IAS.tuteSubastado, 4),
  entrada('Cuatrola', cuatrola, CONFIG_CUATROLA_POR_DEFECTO, IAS.cuatrola, 4),
  // No simula, pero su difícil (con memoria) tiene que ganar a la normal: entra en la prueba.
  entrada('Mentiroso', mentiroso, CONFIG_MENTIROSO_POR_DEFECTO, IAS.mentiroso, 4),
  entrada('Ocho loco', ochoLoco, CONFIG_OCHO_LOCO_POR_DEFECTO, IAS.ochoLoco, 4),
  entrada('Picas', picas, CONFIG_PICAS_POR_DEFECTO, IAS.picas, 'bandos'),
  // Gana claramente más fichas por mano, pero en 10 manos manda la suerte: su prueba de fuerza
  // es por fichas (test de fuerza propio).
  entrada('Blackjack', blackjack, CONFIG_BLACKJACK_POR_DEFECTO, IAS.blackjack, 2, false),
  entrada('Gin Rummy', ginRummy, CONFIG_GIN_RUMMY_POR_DEFECTO, IAS.ginRummy, 2),
  entrada('Rummy 500', rummy500, CONFIG_RUMMY_500_POR_DEFECTO, IAS.rummy500, 2),
  // No simula partidas, pero su difícil (por equity) tiene que ganar a la normal.
  entrada("Texas Hold'em", holdem, CONFIG_HOLDEM_POR_DEFECTO, IAS.holdem, 4),
  entrada('Culo', culo, CONFIG_CULO_POR_DEFECTO, IAS.culo, 4),
  entrada('Canasta', canasta, CONFIG_CANASTA_POR_DEFECTO, IAS.canasta, 'bandos'),
];
