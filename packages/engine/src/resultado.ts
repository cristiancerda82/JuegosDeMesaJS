/** Resultado de una operación que puede fallar de forma esperada (sin excepciones). */
export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

export const ok = <T>(valor: T): Resultado<T> => ({ ok: true, valor });

export const error = <T = never>(mensaje: string): Resultado<T> => ({ ok: false, error: mensaje });
