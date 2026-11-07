import type { Palo } from '@juegos/engine';
import { guardarClave, leerClave } from '../menu/preferencias';
import { esFrancesa } from './dibujo';
import { CARGAR, CLAVES_TEMA, leerTema } from './temas';
import { MINIMAL } from './temas/minimal';
import type { Baraja, IdTema, TemaNaipes } from './temas/tipos';

/**
 * Tema elegido para cada baraja y temas ya cargados (design, decisiones 5 y 6). El tema efectivo
 * es el elegido si ya está listo, y Minimal mientras se carga o si falla.
 */
class Temas {
  elegido = $state<Record<Baraja, IdTema>>({
    espanola: leerTema('espanola', leerClave(CLAVES_TEMA.espanola)),
    francesa: leerTema('francesa', leerClave(CLAVES_TEMA.francesa)),
  });
  #listos = $state.raw<Partial<Record<IdTema, TemaNaipes>>>({ minimal: MINIMAL });
  #cargando = new Map<IdTema, Promise<void>>();

  /** El tema ya cargado, o `null`. */
  listo(id: IdTema): TemaNaipes | null {
    return this.#listos[id] ?? null;
  }

  /** El tema con el que se dibuja una carta de ese palo. */
  dePalo(palo: Palo): TemaNaipes {
    return this.listo(this.elegido[esFrancesa(palo) ? 'francesa' : 'espanola']) ?? MINIMAL;
  }

  /** Carga un tema e inserta su sprite; si falla, se queda Minimal sin romper nada. */
  cargar(id: IdTema): Promise<void> {
    if (this.#listos[id]) return Promise.resolve();
    let carga = this.#cargando.get(id);
    if (!carga) {
      carga = CARGAR[id]()
        .then((tema) => {
          insertarSprite(tema);
          this.#listos = { ...this.#listos, [id]: tema };
        })
        .catch((e: unknown) => {
          console.warn(`No se pudo cargar el tema de naipes «${id}»; se usa Minimal.`, e);
          this.#cargando.delete(id);
        });
      this.#cargando.set(id, carga);
    }
    return carga;
  }

  elegir(baraja: Baraja, id: IdTema): void {
    this.elegido[baraja] = id;
    guardarClave(CLAVES_TEMA[baraja], id);
    void this.cargar(id);
  }

  /** Carga los temas elegidos, esperando como mucho `maxMs` (para no retrasar el arranque). */
  precargar(maxMs: number): Promise<void> {
    const cargas = Promise.all([
      this.cargar(this.elegido.espanola),
      this.cargar(this.elegido.francesa),
    ]);
    return Promise.race([
      cargas.then(() => undefined),
      new Promise<void>((ok) => setTimeout(ok, maxMs)),
    ]);
  }
}

/** Inserta una sola vez los símbolos del tema en un `<svg>` oculto del documento. */
function insertarSprite(tema: TemaNaipes): void {
  if (!tema.sprite || typeof document === 'undefined') return;
  const id = `sprite-${tema.id}`;
  if (document.getElementById(id)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = id;
  svg.setAttribute('aria-hidden', 'true');
  // No `display: none`: algunos navegadores no pintan los degradados de símbolos ocultos así.
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  svg.innerHTML = tema.sprite;
  document.body.prepend(svg);
}

export const temas = new Temas();
