/**
 * Registro del service worker y estado de la aplicación instalable: si hay una versión nueva
 * esperando, si el navegador ofrece instalarla y si estamos en iOS (que no lo ofrece).
 */

/** Evento `beforeinstallprompt` (no está en los tipos del DOM). */
interface EventoInstalar extends Event {
  prompt(): Promise<void>;
}

class EstadoPwa {
  hayActualizacion = $state(false);
  puedeInstalar = $state(false);
  readonly instalada: boolean;
  readonly esIOS: boolean;

  #esperando: ServiceWorker | null = null;
  #instalar: EventoInstalar | null = null;
  #actualizando = false;

  constructor() {
    const nav = typeof navigator === 'undefined' ? null : navigator;
    this.instalada =
      typeof matchMedia !== 'undefined' &&
      (matchMedia('(display-mode: standalone)').matches ||
        (nav as { standalone?: boolean } | null)?.standalone === true);
    this.esIOS = nav !== null && /iphone|ipad|ipod/i.test(nav.userAgent);
  }

  iniciar(): void {
    addEventListener('beforeinstallprompt', (evento) => {
      evento.preventDefault();
      this.#instalar = evento as EventoInstalar;
      this.puedeInstalar = !this.instalada;
    });
    addEventListener('appinstalled', () => (this.puedeInstalar = false));

    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    // Solo se recarga cuando el jugador pidió actualizar: en la primera visita el service
    // worker también toma el control (`clients.claim`) y eso no debe recargar la página.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!this.#actualizando) return;
      this.#actualizando = false;
      location.reload();
    });
    void navigator.serviceWorker.register('./sw.js').then((registro) => {
      if (registro.waiting && navigator.serviceWorker.controller) this.#avisar(registro.waiting);
      registro.addEventListener('updatefound', () => {
        const nuevo = registro.installing;
        nuevo?.addEventListener('statechange', () => {
          // Solo es una actualización si ya había una versión controlando la página.
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
            this.#avisar(nuevo);
          }
        });
      });
    });
  }

  #avisar(worker: ServiceWorker): void {
    this.#esperando = worker;
    this.hayActualizacion = true;
  }

  /** Activa la versión nueva; la página se recarga al cambiar de controlador. */
  actualizar(): void {
    if (!this.#esperando) return;
    this.#actualizando = true;
    this.#esperando.postMessage('activar');
  }

  async instalar(): Promise<void> {
    if (!this.#instalar) return;
    await this.#instalar.prompt();
    this.#instalar = null;
    this.puedeInstalar = false;
  }
}

export const pwa = new EstadoPwa();
