import type { IdJuego } from '../sesion/juegos';
import {
  alternarFavorito,
  CLAVES,
  guardarClave,
  leerClave,
  leerFiltro,
  leerLista,
  registrarReciente,
  type FiltroBaraja,
} from './preferencias';

/**
 * Favoritos, últimos jugados y filtro de baraja del menú, guardados en el dispositivo
 * (design, decisión 2). Si no se puede guardar, el estado en memoria sigue valiendo.
 */
class PreferenciasMenu {
  favoritos = $state.raw<readonly IdJuego[]>(leerLista(leerClave(CLAVES.favoritos)));
  recientes = $state.raw<readonly IdJuego[]>(leerLista(leerClave(CLAVES.recientes)));
  filtro = $state<FiltroBaraja>(leerFiltro(leerClave(CLAVES.filtro)));

  esFavorito(id: IdJuego): boolean {
    return this.favoritos.includes(id);
  }

  alternarFavorito(id: IdJuego): void {
    this.favoritos = alternarFavorito(this.favoritos, id);
    guardarClave(CLAVES.favoritos, JSON.stringify(this.favoritos));
  }

  registrarReciente(id: IdJuego): void {
    this.recientes = registrarReciente(this.recientes, id);
    guardarClave(CLAVES.recientes, JSON.stringify(this.recientes));
  }

  cambiarFiltro(filtro: FiltroBaraja): void {
    this.filtro = filtro;
    guardarClave(CLAVES.filtro, filtro);
  }
}

export const preferencias = new PreferenciasMenu();
