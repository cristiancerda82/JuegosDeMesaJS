<script lang="ts">
  import Carta from '../cartas/Carta.svelte';
  import type { EjemploJugadas } from './tipos';

  let { ejemplo }: { ejemplo: EjemploJugadas } = $props();
</script>

<ol class="jugadas">
  {#each ejemplo.filas as fila, i (i)}
    <li>
      <span class="nombre">{fila.nombre}</span>
      <div class="fila-cartas">
        {#each fila.cartas as id, k (k)}
          <div class="hueco"><Carta {id} /></div>
        {/each}
      </div>
    </li>
  {/each}
</ol>
{#if ejemplo.nota}<p class="nota">{ejemplo.nota}</p>{/if}

<style>
  .jugadas {
    --ancho-carta: 36px;
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .jugadas li {
    display: grid;
    grid-template-columns: 9.5em 1fr;
    align-items: center;
    gap: 8px;
  }

  .jugadas .fila-cartas {
    gap: 3px;
  }

  .nombre {
    font-size: 0.85rem;
    font-weight: 700;
  }

  @media (max-width: 480px) {
    .jugadas li {
      grid-template-columns: 1fr;
      gap: 3px;
    }
  }
</style>
