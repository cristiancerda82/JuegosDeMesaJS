import type { Baraja } from '../tipos';

/**
 * Diseños propios del usuario (spec temas-naipes; design, decisión 9): cada uno es un generador
 * de SVG copiado sin cambios en `vendor/`, que al cargarse publica un objeto global.
 */
export interface DisenoPropio {
  readonly id: IdPropio;
  readonly baraja: Baraja;
  readonly archivo: string;
  /** Nombre del objeto global que publica el generador. */
  readonly global: string;
}

export type IdPropio =
  | 'esp-tradicional'
  | 'esp-clasica'
  | 'esp-egipto'
  | 'esp-espacial'
  | 'esp-fantasia'
  | 'esp-horror'
  | 'esp-mitologia'
  | 'esp-muertos'
  | 'esp-navidad'
  | 'esp-piratas'
  | 'esp-samurai'
  | 'fr-tradicional'
  | 'fr-antiguos'
  | 'fr-clasicos'
  | 'fr-egipto'
  | 'fr-espacial'
  | 'fr-fantasia'
  | 'fr-gala'
  | 'fr-horror'
  | 'fr-mitologia'
  | 'fr-muertos'
  | 'fr-navidad'
  | 'fr-piratas'
  | 'fr-samurai';

const esp = (id: IdPropio, archivo: string, global: string): DisenoPropio => ({
  id,
  baraja: 'espanola',
  archivo,
  global,
});
const fr = (id: IdPropio, archivo: string, global: string): DisenoPropio => ({
  id,
  baraja: 'francesa',
  archivo,
  global,
});

export const PROPIOS: readonly DisenoPropio[] = [
  esp('esp-tradicional', 'baraja-espanola.js', 'BarajaEspanola'),
  esp('esp-clasica', 'baraja-espanola-clasica.js', 'EspanolaClasica'),
  esp('esp-egipto', 'baraja-espanola-egipto.js', 'EspanolaEgipto'),
  esp('esp-espacial', 'baraja-espanola-espacial.js', 'EspanolaEspacial'),
  esp('esp-fantasia', 'baraja-espanola-fantasia.js', 'EspanolaFantasia'),
  esp('esp-horror', 'baraja-espanola-horror.js', 'EspanolaHorror'),
  esp('esp-mitologia', 'baraja-espanola-mitologia.js', 'EspanolaMitologia'),
  esp('esp-muertos', 'baraja-espanola-muertos.js', 'EspanolaMuertos'),
  esp('esp-navidad', 'baraja-espanola-navidad.js', 'EspanolaNavidad'),
  esp('esp-piratas', 'baraja-espanola-piratas.js', 'EspanolaPiratas'),
  esp('esp-samurai', 'baraja-espanola-samurai.js', 'EspanolaSamurai'),
  fr('fr-tradicional', 'naipes.js', 'Naipes'),
  fr('fr-antiguos', 'naipes-antiguos.js', 'NaipesAntiguos'),
  fr('fr-clasicos', 'naipes-clasicos.js', 'NaipesClasicos'),
  fr('fr-egipto', 'naipes-egipto.js', 'NaipesEgipto'),
  fr('fr-espacial', 'naipes-espacial.js', 'NaipesEspacial'),
  fr('fr-fantasia', 'naipes-fantasia.js', 'NaipesFantasia'),
  fr('fr-gala', 'naipes-gala.js', 'NaipesGala'),
  fr('fr-horror', 'naipes-horror.js', 'NaipesHorror'),
  fr('fr-mitologia', 'naipes-mitologia.js', 'NaipesMitologia'),
  fr('fr-muertos', 'naipes-muertos.js', 'NaipesMuertos'),
  fr('fr-navidad', 'naipes-navidad.js', 'NaipesNavidad'),
  fr('fr-piratas', 'naipes-piratas.js', 'NaipesPiratas'),
  fr('fr-samurai', 'naipes-samurai.js', 'NaipesSamurai'),
];
