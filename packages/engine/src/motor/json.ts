/** Igualdad estructural de valores JSON planos (sin depender del orden de las claves). */
export function igualesJSON(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => igualesJSON(x, b[i]));
  }
  const oa = a as Record<string, unknown>;
  const ob = b as Record<string, unknown>;
  const claves = Object.keys(oa).filter((k) => oa[k] !== undefined);
  const clavesB = Object.keys(ob).filter((k) => ob[k] !== undefined);
  return claves.length === clavesB.length && claves.every((k) => igualesJSON(oa[k], ob[k]));
}
