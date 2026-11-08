import { guardarClave, leerClave } from '../menu/preferencias';
import { CLAVE_VELOCIDAD, factorPausas, leerVelocidad, type Velocidad } from './ritmo';

/** Velocidad elegida, guardada en el dispositivo; si no se puede guardar, vale para la visita. */
class Ritmo {
  velocidad = $state<Velocidad>(leerVelocidad(leerClave(CLAVE_VELOCIDAD)));

  /** Factor que multiplica las pausas; se lee en cada jugada, así que un cambio vale desde la siguiente. */
  get factor(): number {
    return factorPausas(this.velocidad);
  }

  /** En Pausada la baza terminada espera a que el jugador toque la mesa. */
  get retieneBazas(): boolean {
    return this.velocidad === 'pausada';
  }

  /** Tapetes montados que ofrecen su propio botón «Seguir» (así no se repite el general). */
  tapetes = $state(0);

  elegir(velocidad: Velocidad): void {
    this.velocidad = velocidad;
    guardarClave(CLAVE_VELOCIDAD, velocidad);
  }
}

export const ritmo = new Ritmo();
