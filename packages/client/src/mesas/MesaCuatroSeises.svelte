<script lang="ts">
  import {
    ordenCuatroSeises,
    type AccionCuatroSeises,
    type Asiento,
    type ConfigCuatroSeises,
    type EstadoCuatroSeises,
    type VistaCuatroSeises,
  } from '@juegos/engine';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import MesaEscaleras from './escaleras/MesaEscaleras.svelte';
  import ResumenCuatroSeises from './ResumenCuatroSeises.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCuatroSeises, EstadoCuatroSeises, AccionCuatroSeises, VistaCuatroSeises>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);

  const detalle = (asiento: Asiento) => [
    T.cinquillo.cartas(vista.cartasEnMano[asiento] ?? 0),
    T.cuatroSeises.fichasDe(vista.saldos[asiento] ?? 0),
  ];
</script>

<MesaEscaleras
  {sesion}
  orden={ordenCuatroSeises(vista.config.baraja)}
  inicial={6}
  {detalle}
  salida={T.cuatroSeises.salidaOros}
  pasa={T.cuatroSeises.pasa}
>
  {#snippet info()}
    <b data-testid="fondo-cuatro-seises">{T.cuatroSeises.fondo(vista.fondo)}</b>
    <span class="suave" data-testid="mano-cuatro-seises"
      >{T.cuatroSeises.manoDe(vista.manoNumero, vista.config.manos)}</span
    >
  {/snippet}
  {#snippet resumen(i: number, nombre: (asiento: Asiento) => string)}
    <ResumenCuatroSeises resultado={vista.resultadosManos[i]!} yo={sesion.asiento} {nombre} />
  {/snippet}
</MesaEscaleras>

<style>
  .suave {
    color: var(--texto-suave);
  }
</style>
