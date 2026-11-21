<script lang="ts">
  import {
    cartaDeCambio,
    valorDe,
    type AccionBrisca,
    type ConfigBrisca,
    type EstadoBrisca,
    type IdCarta,
    type VistaBrisca,
  } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import { porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import MesaBazas from './bazas/MesaBazas.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const cambio = $derived(legales.find((a) => a.tipo === 'cambiarMuestra'));

  const senas = $derived(
    vista.senas === null
      ? null
      : vista.senas.sinTriunfo
        ? T.brisca.senasSinTriunfo
        : vista.senas.cartas.length === 0
          ? T.brisca.senasNinguna
          : vista.senas.cartas.map((c) => T.brisca.cartaSena[valorDe(c)]).join(', '),
  );

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
    {#if senas !== null}
      <span data-testid="senas" title={T.brisca.senasTitulo}>{T.brisca.senas}: <b>{senas}</b></span>
    {/if}
    {#if vista.config.manos > 1}
      <span>{T.brisca.manosGanadas(...porBando(vista.manosGanadas, sesion.asiento))}</span>
    {/if}
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if cambio && vista.muestra}
      <button data-accion={cambio.tipo} data-jugada={JSON.stringify(cambio)}
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
