<script lang="ts">
  import { BARAJA_TAROT, crearBaraja } from '@juegos/engine';
  import { T } from '../textos';
  import Carta from './Carta.svelte';
  import SelectorTemas from './SelectorTemas.svelte';

  interface Props {
    volver: () => void;
  }

  let { volver }: Props = $props();

  let verDiseno = $state(false);

  const barajas = [
    { titulo: T.cartas.barajaEspanola, cartas: crearBaraja('espanola48', { comodines: true }) },
    { titulo: T.cartas.barajaFrancesa, cartas: crearBaraja('francesa52') },
    { titulo: T.cartas.barajaTarot, cartas: [...BARAJA_TAROT] },
  ];
</script>

<main class="muestrario">
  <header>
    <button onclick={volver}>← {T.opciones.volver}</button>
    <h1>{T.cartas.muestrario}</h1>
  </header>

  <!-- Las vistas previas solo se montan al abrir: así no se descargan todos los temas. -->
  <details class="diseno" bind:open={verDiseno}>
    <summary>{T.cartas.diseno}</summary>
    {#if verDiseno}<SelectorTemas />{/if}
  </details>

  {#each barajas as baraja (baraja.titulo)}
    <section>
      <h2>{baraja.titulo}</h2>
      <div class="rejilla">
        {#each baraja.cartas as id (id)}
          <div class="hueco"><Carta {id} /></div>
        {/each}
      </div>
    </section>
  {/each}

  <section>
    <h2>{T.cartas.dorsos}</h2>
    <div class="rejilla">
      {#each Object.keys(T.dorsos) as dorso (dorso)}
        <figure data-dorso={dorso}>
          <div class="hueco"><Carta /></div>
          <figcaption>{T.dorsos[dorso]}</figcaption>
        </figure>
      {/each}
    </div>
  </section>
</main>

<style>
  .muestrario {
    max-width: 1100px;
    margin: 0 auto;
    padding: 12px 16px 32px;
    --ancho-carta: 72px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .diseno summary {
    min-height: 32px;
    cursor: pointer;
    font-weight: 600;
  }

  .diseno[open] summary {
    margin-bottom: 10px;
  }

  h2 {
    margin: 20px 0 10px;
    font-size: 1.1rem;
    color: var(--texto-suave);
  }

  .rejilla {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hueco {
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
  }

  figure {
    margin: 0;
    text-align: center;
  }

  /* Cada muestra de dorso redefine sus colores localmente. */
  figure[data-dorso='azul'] {
    --dorso: #1d4f91;
    --dorso-claro: #3f74bd;
  }

  figure[data-dorso='rojo'] {
    --dorso: #9b2226;
    --dorso-claro: #c8553d;
  }

  figure[data-dorso='verde'] {
    --dorso: #2d6a4f;
    --dorso-claro: #52b788;
  }

  figcaption {
    margin-top: 4px;
    font-size: 0.85rem;
  }
</style>
