import type { IdJuego } from '../../sesion/juegos';
import type { EjemplosJuego } from '../tipos';
import { BAZAS_CONTRATO } from './bazas-contrato';
import { BAZAS_EVITAR } from './bazas-evitar';
import { BAZAS_PUNTOS } from './bazas-puntos';
import { CAPTURA } from './captura';
import { COMBINACIONES } from './combinaciones';
import { DESCARTE } from './descarte';
import { ENVITE } from './envite';
import { SOLITARIOS } from './solitarios';

/** Los ejemplos de las guías de todos los juegos, un archivo por familia del catálogo. */
export const EJEMPLOS: Partial<Record<IdJuego, EjemplosJuego>> = {
  ...SOLITARIOS,
  ...BAZAS_PUNTOS,
  ...BAZAS_CONTRATO,
  ...BAZAS_EVITAR,
  ...COMBINACIONES,
  ...CAPTURA,
  ...DESCARTE,
  ...ENVITE,
};
