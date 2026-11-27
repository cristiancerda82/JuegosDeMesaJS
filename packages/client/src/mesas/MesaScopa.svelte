<script lang="ts">
  import {
    valorScopa,
    type AccionScopa,
    type ConfigScopa,
    type EstadoScopa,
    type IdCarta,
    type VistaScopa,
  } from '@juegos/engine';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import MesaCaptura from './captura/MesaCaptura.svelte';
  import ResumenScopa from './ResumenScopa.svelte';

  interface Props {
    sesion: SesionMesa<ConfigScopa, EstadoScopa, AccionScopa, VistaScopa>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const yo = $derived(sesion.asiento);
  const lados = $derived<[string, string]>(
    vista.config.jugadores === 2
      ? [T.brisca.tu, T.brisca.rival]
      : [T.brisca.nosotros, T.brisca.ellos],
  );

  const suma = (s: number, carta: IdCarta) => ({
    texto: T.scopa.suma(s, valorScopa(carta)),
    completa: s === valorScopa(carta),
  });
</script>

<MesaCaptura {sesion} puntos={T.scopa.puntos(...porBando(vista.puntos, yo), vista.config.meta)} {suma}>
  {#snippet resumen(i: number)}
    <ResumenScopa resultado={vista.resultadosManos[i]!} {lados} bando={bandoDe(yo) as 0 | 1} />
  {/snippet}
</MesaCaptura>
