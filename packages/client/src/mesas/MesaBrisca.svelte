<script lang="ts">
  import {
    cartaDeCambio,
    type AccionBrisca,
    type ConfigBrisca,
    type EstadoBrisca,
    type IdCarta,
    type VistaBrisca,
  } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import type { Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';
  import MesaBazas from './bazas/MesaBazas.svelte';

  interface Props {
    sesion: Sesion<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const cambio = $derived(legales.find((a) => a.tipo === 'cambiarMuestra'));

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
</script>

<MesaBazas
  {vista}
  {sesion}
  {jugable}
  jugar={(carta) => sesion.jugar({ tipo: 'jugar', carta })}
>
  {#snippet info()}
    <span>{T.brisca.triunfo}: <b class="triunfo">{vista.triunfo}</b></span>
    {#if vista.config.manos > 1}
      <span>{T.brisca.manosGanadas(vista.manosGanadas[0], vista.manosGanadas[1])}</span>
    {/if}
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if cambio && vista.muestra}
      <button
        class="principal"
        data-testid="cambiar-muestra"
        onclick={() => {
          cancelar();
          sesion.jugar(cambio);
        }}
      >
        {T.brisca.cambiarMuestra(nombreCarta(cartaDeCambio(vista.muestra)).toLowerCase())}
      </button>
    {/if}
  {/snippet}
</MesaBazas>

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }
</style>
