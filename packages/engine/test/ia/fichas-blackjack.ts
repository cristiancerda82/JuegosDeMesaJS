import { crearAzar } from '../../src/baraja/azar';
import type { Agente } from '../../src/ia/agente';
import { blackjack, type AccionBlackjack, type VistaBlackjack } from '../../src/juegos/blackjack';

/**
 * Fichas ganadas por mano de media jugando solo, con las semillas `prefijo-i`. Las cartas de
 * cada mano dependen solo de la semilla: dos agentes juegan con las mismas cartas.
 */
export function fichasPorMano(
  agente: Agente<VistaBlackjack, AccionBlackjack>,
  partidas: number,
  prefijo: string,
): number {
  let ganadas = 0;
  let manos = 0;
  for (let i = 0; i < partidas; i++) {
    const r = blackjack.crear({ jugadores: 1, manos: 20 }, `${prefijo}-${i}`);
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    let azar = crearAzar(`${prefijo}-${i}/ia`);
    while (blackjack.resultado(e) === null) {
      const d = agente.decidir(blackjack.vistaDe(e, 0), blackjack.accionesLegales(e, 0), azar);
      azar = d.azar;
      e = blackjack.transicion(e, 0, d.accion);
    }
    ganadas += e.fichas[0]! - 100;
    manos += e.resultadosManos.length;
  }
  return ganadas / manos;
}
