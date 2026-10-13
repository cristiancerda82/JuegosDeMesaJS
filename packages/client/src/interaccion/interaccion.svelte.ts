import { fijarPosicion, volverAlOrigen } from './flip';

/**
 * Reglas de interacción de una mesa. Los orígenes y destinos son identificadores de texto
 * propios de cada juego (p. ej. "c3:2" o "oros-7" como origen, "f0" o "mesa" como destino);
 * los destinos legales salen siempre de las acciones legales del motor.
 */
export interface ReglasInteraccion {
  destinos(origen: string): readonly string[];
  /** Destino del doble toque, si hay uno evidente (en Klondike, la fundación). */
  destinoObvio(origen: string): string | null;
  mover(origen: string, destino: string): void;
  /** Elementos que se arrastran con el origen (en Klondike, la secuencia que tiene encima). */
  elementos(origen: string, el: HTMLElement): HTMLElement[];
}

/** Distancia mínima, en píxeles, para que un toque se convierta en arrastre. */
const UMBRAL_ARRASTRE = 6;
/** Tiempo máximo entre dos toques para contarlos como doble toque. */
const DOBLE_TOQUE_MS = 350;

/**
 * Arrastrar y tocar comparten la misma lógica (design, decisión 10): se elige un origen, se
 * resaltan sus destinos legales y la acción se aplica al soltar o al tocar el destino.
 * Con Pointer Events hay un único camino para ratón y para toque.
 */
export class Interaccion {
  readonly #reglas: ReglasInteraccion;
  /** Origen elegido (tocado o arrastrándose). */
  seleccion = $state<string | null>(null);
  readonly resaltados: ReadonlySet<string> = $derived.by(
    () => new Set(this.seleccion === null ? [] : this.#reglas.destinos(this.seleccion)),
  );
  #ultimoToque: { origen: string; t: number } | null = null;

  constructor(reglas: ReglasInteraccion) {
    this.#reglas = reglas;
  }

  /** Acción de Svelte para un elemento que puede moverse: `use:interaccion.origen={id}`. */
  origen = (nodo: HTMLElement, origenInicial: string) => {
    let origen = origenInicial;
    let inicio: { x: number; y: number; id: number } | null = null;
    let grupo: HTMLElement[] = [];
    let arrastrando = false;

    const limpiar = () => {
      for (const el of grupo) {
        el.classList.remove('arrastrando');
        el.style.removeProperty('pointer-events');
        el.style.removeProperty('z-index');
      }
      grupo = [];
      arrastrando = false;
      inicio = null;
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', cancelar);
    };

    const mover = (ev: PointerEvent) => {
      if (inicio === null || ev.pointerId !== inicio.id) return;
      const dx = ev.clientX - inicio.x;
      const dy = ev.clientY - inicio.y;
      if (!arrastrando) {
        if (Math.hypot(dx, dy) < UMBRAL_ARRASTRE) return;
        if (this.#reglas.destinos(origen).length === 0) return;
        arrastrando = true;
        this.seleccion = origen;
        grupo = this.#reglas.elementos(origen, nodo);
        for (const el of grupo) {
          el.classList.add('arrastrando');
          el.style.pointerEvents = 'none';
          el.style.zIndex = '1000';
        }
      }
      ev.preventDefault();
      for (const el of grupo) el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const soltar = (ev: PointerEvent) => {
      if (inicio === null || ev.pointerId !== inicio.id) return;
      if (!arrastrando) {
        limpiar();
        this.#tocar(origen, nodo);
        return;
      }
      const destino = destinoEn(ev.clientX, ev.clientY);
      const elementos = grupo;
      limpiar();
      if (destino !== null && this.resaltados.has(destino)) {
        // La animación posterior parte de donde se soltó la carta.
        for (const el of elementos) {
          if (el.dataset.carta) fijarPosicion(el.dataset.carta, el.getBoundingClientRect());
          el.style.transform = '';
        }
        this.seleccion = null;
        this.#reglas.mover(origen, destino);
      } else {
        volverAlOrigen(elementos);
        this.seleccion = null;
      }
    };

    const cancelar = () => {
      volverAlOrigen(grupo);
      this.seleccion = null;
      limpiar();
    };

    const pulsar = (ev: PointerEvent) => {
      if (ev.button !== 0 || inicio !== null) return;
      inicio = { x: ev.clientX, y: ev.clientY, id: ev.pointerId };
      window.addEventListener('pointermove', mover, { passive: false });
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', cancelar);
    };

    // El toque ya se resolvió en `soltar`; el click no debe llegar a la zona que lo contiene.
    const click = (ev: MouseEvent) => ev.stopPropagation();

    nodo.addEventListener('pointerdown', pulsar);
    nodo.addEventListener('click', click);
    return {
      update(nuevo: string) {
        origen = nuevo;
      },
      destroy() {
        limpiar();
        nodo.removeEventListener('pointerdown', pulsar);
        nodo.removeEventListener('click', click);
      },
    };
  };

  /** Toque sobre una zona de destino (columna vacía, fundación, mesa…). */
  tocarDestino(destino: string): void {
    if (this.seleccion !== null && this.resaltados.has(destino)) {
      const origen = this.seleccion;
      this.seleccion = null;
      this.#reglas.mover(origen, destino);
    } else {
      this.seleccion = null;
    }
  }

  cancelar(): void {
    this.seleccion = null;
  }

  #tocar(origen: string, nodo: HTMLElement): void {
    const ahora = Date.now();
    const doble =
      this.#ultimoToque?.origen === origen && ahora - this.#ultimoToque.t < DOBLE_TOQUE_MS;
    this.#ultimoToque = doble ? null : { origen, t: ahora };

    if (doble) {
      const destino = this.#reglas.destinoObvio(origen);
      if (destino !== null) {
        this.seleccion = null;
        this.#reglas.mover(origen, destino);
        return;
      }
    }

    // Con otra carta elegida, tocar una carta cuenta como tocar la zona que la contiene.
    if (this.seleccion !== null && this.seleccion !== origen) {
      const zona = nodo.closest<HTMLElement>('[data-destino]')?.dataset.destino;
      if (zona !== undefined && this.resaltados.has(zona)) {
        const elegido = this.seleccion;
        this.seleccion = null;
        this.#ultimoToque = null;
        this.#reglas.mover(elegido, zona);
        return;
      }
    }

    if (this.seleccion === origen && !doble) this.seleccion = null;
    else this.seleccion = this.#reglas.destinos(origen).length > 0 ? origen : null;
  }
}

/** Zona de destino bajo el puntero (las cartas arrastradas no reciben eventos). */
function destinoEn(x: number, y: number): string | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const zona = (el as HTMLElement).closest?.<HTMLElement>('[data-destino]');
    if (zona?.dataset.destino) return zona.dataset.destino;
  }
  return null;
}
