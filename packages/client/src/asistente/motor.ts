import { calcular, type Peticion, type Respuesta } from './calculo';

/**
 * Puerta al cálculo del asistente. En el navegador va a un Web Worker compartido, que se crea la
 * primera vez que se usa; donde no hay workers (los tests unitarios) se calcula en el mismo hilo,
 * después de un `setTimeout(0)`, con el mismo resultado.
 */
interface Pendiente {
  readonly resolver: (valor: unknown) => void;
  readonly rechazar: (error: Error) => void;
}

let worker: Worker | null = null;
let siguiente = 0;
const pendientes = new Map<number, Pendiente>();

function crearWorker(): Worker {
  const w = new Worker(new URL('./asistente.worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (
    ev: MessageEvent<{ id: number; ok: boolean; valor?: unknown; error?: string }>,
  ) => {
    const p = pendientes.get(ev.data.id);
    pendientes.delete(ev.data.id);
    if (ev.data.ok) p?.resolver(ev.data.valor);
    else p?.rechazar(new Error(ev.data.error));
  };
  return w;
}

export function pedir<P extends Peticion>(peticion: P): Promise<Respuesta<P>> {
  if (typeof Worker === 'undefined') {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        try {
          resolver(calcular(peticion));
        } catch (e) {
          rechazar(e as Error);
        }
      }, 0);
    });
  }
  worker ??= crearWorker();
  const id = siguiente++;
  return new Promise((resolver, rechazar) => {
    pendientes.set(id, { resolver: resolver as (v: unknown) => void, rechazar });
    // La configuración puede ser un proxy de Svelte, que no se puede clonar: van como JSON.
    worker!.postMessage({ id, peticion: JSON.parse(JSON.stringify(peticion)) as P });
  });
}
