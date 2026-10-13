/**
 * Animaciones FLIP (design, decisión 10): se mide dónde estaba cada carta antes de un cambio
 * de la vista y dónde queda después, y se interpola con la Web Animations API. Así cualquier
 * cambio del motor se anima solo, sin coreografía por juego. Solo se anima `transform`.
 *
 * Cada carta animable lleva `data-carta="<id>"`. Una carta que aparece sin posición previa
 * (p. ej. la que juega la IA desde su mano oculta) puede indicar con `data-desde="<zona>"` el
 * elemento `[data-zona="<zona>"]` desde el que entra.
 */

export type Posiciones = Map<string, DOMRect>;

const DURACION_MS = 300;

/** Posiciones fijadas a mano, que mandan sobre la medición (p. ej. donde se soltó un arrastre). */
const fijadas: Posiciones = new Map();

export function fijarPosicion(id: string, rect: DOMRect): void {
  fijadas.set(id, rect);
}

function sinMovimiento(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function medir(raiz: HTMLElement): Posiciones {
  const posiciones: Posiciones = new Map();
  for (const el of raiz.querySelectorAll<HTMLElement>('[data-carta]')) {
    posiciones.set(el.dataset.carta!, el.getBoundingClientRect());
  }
  for (const [id, rect] of fijadas) posiciones.set(id, rect);
  fijadas.clear();
  return posiciones;
}

export function animar(raiz: HTMLElement, antes: Posiciones): void {
  if (sinMovimiento()) return;
  for (const el of raiz.querySelectorAll<HTMLElement>('[data-carta]')) {
    let previo = antes.get(el.dataset.carta!);
    if (previo === undefined && el.dataset.desde) {
      previo = raiz.querySelector(`[data-zona="${el.dataset.desde}"]`)?.getBoundingClientRect();
    }
    if (previo === undefined) continue;
    const ahora = el.getBoundingClientRect();
    if (ahora.width === 0) continue;
    const dx = previo.left - ahora.left;
    const dy = previo.top - ahora.top;
    const escala = previo.width / ahora.width;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(escala - 1) < 0.01) continue;
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${escala})`, transformOrigin: '0 0' },
        { transform: 'none', transformOrigin: '0 0' },
      ],
      { duration: DURACION_MS, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
    );
  }
}

/** Devuelve elementos a su sitio con una animación (movimiento ilegal o cancelado). */
export function volverAlOrigen(elementos: readonly HTMLElement[]): void {
  for (const el of elementos) {
    const desde = el.style.transform;
    el.style.transform = '';
    if (!sinMovimiento() && desde) {
      el.animate([{ transform: desde }, { transform: 'none' }], {
        duration: 220,
        easing: 'ease-out',
      });
    }
  }
}
