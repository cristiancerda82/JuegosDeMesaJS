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
  /** El nivel difícil simula (todos menos el Burro). */
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
];
