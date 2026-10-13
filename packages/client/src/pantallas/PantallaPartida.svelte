<script lang="ts">
  import MesaBrisca from '../mesas/MesaBrisca.svelte';
  import MesaKlondike from '../mesas/MesaKlondike.svelte';
  import MesaTute from '../mesas/MesaTute.svelte';
  import type { Partida } from '../sesion/partida';
  import { T } from '../textos';
  import ComoSeJuega from './ComoSeJuega.svelte';
  import Fin from './Fin.svelte';

  interface Props {
    partida: Partida;
    menu: () => void;
    revancha: () => void;
  }

  let { partida, menu, revancha }: Props = $props();

  let verAyuda = $state(false);

  // Mientras se consulta la guía, la IA espera: la partida sigue en el mismo punto al cerrarla.
  $effect(() => {
    if (!verAyuda) return;
    const sesion = partida.sesion;
    sesion.pausar();
    return () => sesion.reanudar();
  });
</script>

<div class="partida">
  <header>
    <button onclick={menu} data-testid="volver-menu">← {T.partida.menu}</button>
    <h1>{partida.sesion.def.nombre}</h1>
    <button
      class="ayuda"
      onclick={() => (verAyuda = true)}
      aria-label={T.ayuda.botonCorto}
      title={T.ayuda.botonCorto}
      data-testid="ver-ayuda">?</button
    >
  </header>

  {#if partida.id === 'klondike'}
    <MesaKlondike sesion={partida.sesion} />
  {:else if partida.id === 'tute'}
    <MesaTute sesion={partida.sesion} />
  {:else}
    <MesaBrisca sesion={partida.sesion} />
  {/if}

  {#if partida.sesion.fin !== null}
    <Fin {partida} {revancha} {menu} />
  {/if}

  {#if verAyuda}
    <ComoSeJuega juego={partida.id} cerrar={() => (verAyuda = false)} />
  {/if}
</div>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 8px 4px;
    max-width: 860px;
    margin: 0 auto;
  }

  header button {
    padding: 0.3rem 0.8rem;
    min-height: 40px;
  }

  h1 {
    font-size: 1.15rem;
  }

  .ayuda {
    margin-left: auto;
    width: 40px;
    padding: 0;
    border-radius: 50%;
    font-weight: 800;
    font-size: 1.1rem;
  }
</style>
