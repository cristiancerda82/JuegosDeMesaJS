import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_PIQUET,
  paloPiquet,
  piquet,
  type AccionPiquet,
  type ConfigPiquet,
  type EstadoPiquet,
  type VistaPiquet,
} from '../../juegos/piquet';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Piquet coherente con la vista: la mano del rival, sus descartes y el montón al
 * azar entre las cartas que no se ven. Las cartas de las combinaciones que el rival ganó en las
 * declaraciones y no ha jugado se quedan en su mano, y su mano no tiene los palos que no siguió.
 */
export function reconstruirPiquet(vista: VistaPiquet, azar: EstadoAzar): EstadoPiquet {
  const yo = vista.asiento ?? 0;
  const rival: Asiento = yo === 0 ? 1 : 0;
  const jugadasIds = [...vista.jugadas, ...vista.mesa].map((j) => j.carta);
  const fijas: IdCarta[] = vista.declaraciones
    ? Object.values(vista.declaraciones)
        .filter((d) => d.ganador === rival)
        .flatMap((d) => d.cartas)
        .filter((c) => !jugadasIds.includes(c))
    : [];
  const unicas = [...new Set(fijas)];
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_PIQUET, vista.miMano ?? [], vista.misDescartes, jugadasIds, unicas),
    azar,
  );
  // Palos que el rival no siguió en esta mano.
  const sinPalo = new Set<string>();
  for (let i = 0; i + 1 < vista.jugadas.length; i += 2) {
    const [a, b] = [vista.jugadas[i]!, vista.jugadas[i + 1]!];
    if (b.asiento === rival && paloPiquet(b.carta) !== paloPiquet(a.carta))
      sinPalo.add(paloPiquet(a.carta));
  }
  // Huecos: la mano del rival, sus descartes y el montón.
  const huecos = [
    vista.cartasEnMano[rival]! - unicas.length,
    vista.enDescarte[rival]!,
    vista.enMonton,
  ];
  let repartidas: IdCarta[][];
  try {
    repartidas = repartirConPermitidos(
      cartas,
      huecos,
      (s, c) => s !== 0 || !sinPalo.has(paloPiquet(c)),
      new Generador(azarReparto),
    );
  } catch {
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = cartas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  const manos: IdCarta[][] = [[], []];
  manos[yo] = [...(vista.miMano ?? [])];
  manos[rival] = [...unicas, ...repartidas[0]!];
  const descartes: IdCarta[][] = [[], []];
  descartes[yo] = [...vista.misDescartes];
  descartes[rival] = repartidas[1]!;
  return {
    config: vista.config,
    azar,
    mayor: vista.mayor,
    manos,
    monton: repartidas[2]!,
    descartes,
    cambiadas: [...vista.cambiadas],
    fase: vista.fase,
    turno: vista.turno ?? 0,
    declaraciones: vista.declaraciones,
    porDeclaraciones: vista.porDeclaraciones,
    repique: vista.repique,
    pique: vista.pique,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadas: [...vista.jugadas],
    bazas: vista.bazas,
    puntosMano: vista.puntosMano,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_PIQUET: Simulable<ConfigPiquet, EstadoPiquet, AccionPiquet, VistaPiquet> = {
  juego: piquet,
  reconstruir: reconstruirPiquet,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El cambio lo decide la base; se simulan las bazas.
  decideLaBase: (vista) => vista.fase === 'cambio',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(piquet.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const mio = r.puntosMano[asiento as 0 | 1];
    const suyo = r.puntosMano[asiento === 0 ? 1 : 0];
    return (mio - suyo) / 10 + bono;
  },
  reconstrucciones: 10,
  presupuesto: 80,
};
