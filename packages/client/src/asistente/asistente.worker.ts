import { calcular, type Peticion } from './calculo';

// El asistente calcula aquí, fuera del hilo de la página: así nunca frena un arrastre ni una
// animación (design, decisión 2).

self.onmessage = (ev: MessageEvent<{ readonly id: number; readonly peticion: Peticion }>) => {
  const { id, peticion } = ev.data;
  try {
    self.postMessage({ id, ok: true, valor: calcular(peticion) });
  } catch (e) {
    self.postMessage({ id, ok: false, error: String(e) });
  }
};
