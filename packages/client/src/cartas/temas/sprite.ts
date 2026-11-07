/**
 * Convierte el arte de un tema (un SVG por pieza, editable en cualquier programa de dibujo) en
 * un sprite de `<symbol>` (design, decisión 4). Cada archivo `arte/<nombre>.svg` se convierte
 * en `<symbol id="<tema>-<nombre>">` con su `viewBox`.
 */
export interface Sprite {
  readonly texto: string;
  readonly ids: ReadonlySet<string>;
}

export function crearSprite(tema: string, archivos: Readonly<Record<string, string>>): Sprite {
  const ids = new Set<string>();
  const simbolos = Object.entries(archivos).map(([ruta, svg]) => {
    const nombre = ruta.replace(/^.*\//, '').replace(/\.svg$/, '');
    const m = /<svg\b[^>]*\bviewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/.exec(svg.trim());
    if (!m) throw new Error(`Arte sin <svg viewBox> válido: ${ruta}`);
    const id = `${tema}-${nombre}`;
    ids.add(id);
    return `<symbol id="${id}" viewBox="${m[1]}">${m[2]!.trim()}</symbol>`;
  });
  return { texto: simbolos.join(''), ids };
}
