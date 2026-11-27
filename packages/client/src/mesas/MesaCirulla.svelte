<script lang="ts">
  import {
    valorScopa,
    type AccionCirulla,
    type Asiento,
    type ConfigCirulla,
    type EstadoCirulla,
    type IdCarta,
    type VistaCirulla,
  } from '@juegos/engine';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';
  import MesaCaptura from './captura/MesaCaptura.svelte';
  import ResumenCirulla from './ResumenCirulla.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCirulla, EstadoCirulla, AccionCirulla, VistaCirulla>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);
  const lados = $derived<[string, string]>(
    n === 2 ? [T.brisca.tu, T.brisca.rival] : [T.brisca.nosotros, T.brisca.ellos],
  );
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n, yo, sesion.red);

  /** La suma de las elegidas, frente al valor de la carta y lo que le falta para 15. */
  const suma = (s: number, carta: IdCarta) => {
    const valor = valorScopa(carta);
    return { texto: T.cirulla.suma(s, valor), completa: s === valor || s === 15 - valor };
  };

  /** Las cartas acusadas de cada rival, boca arriba mientras las tenga. */
  const abiertas = (asiento: Asiento) => {
    const cartas = vista.acusadas[asiento] ?? [];
    return cartas.length > 0 ? cartas : null;
  };

  /**
   * Al empezar cada ronda, mientras nadie ha jugado, se avisan los acuses y la mesa inicial.
   * Antes de la primera jugada de la mano no hay `ultimaJugada`; en las rondas siguientes, la
   * jugada que cerró la anterior es de otra mano (todas vacías antes de repartir).
   */
  const avisoExtra = $derived.by(() => {
    const recienRepartida = vista.cartasEnMano.every((c) => c === 3);
    if (!recienRepartida) return null;
    const textos = vista.acuses.map((a) =>
      T.cirulla.acuse(nombre(a.asiento), a.escobas, a.tipo === 'iguales'),
    );
    if (vista.mesaInicial !== null && vista.ultimaJugada === null) {
      const m = vista.mesaInicial;
      textos.unshift(T.cirulla.mesaInicial(nombre(m.asiento), m.suma, m.escobas));
    }
    return textos.length > 0 ? textos.join(' · ') : null;
  });
</script>

<MesaCaptura
  {sesion}
  puntos={T.scopa.puntos(...porBando(vista.puntos, yo), vista.config.meta)}
  {suma}
  {abiertas}
  {avisoExtra}
  escobas={{ monton: T.cirulla.montonEscobas, de: T.cirulla.escobaDe }}
>
  {#snippet resumen(i: number)}
    <ResumenCirulla resultado={vista.resultadosManos[i]!} {lados} bando={bandoDe(yo) as 0 | 1} />
  {/snippet}
</MesaCaptura>
