<script lang="ts">
  import Carta from '../cartas/Carta.svelte';
  import type { EjemploCartas } from './tipos';

  let { ejemplo }: { ejemplo: EjemploCartas } = $props();
</script>

<ul class="fila-cartas">
  {#each ejemplo.cartas as { id, etiqueta }, i (i)}
    <li>
      <div class="hueco"><Carta {id} /></div>
      {#if etiqueta}<span>{etiqueta}</span>{/if}
    </li>
  {/each}
  {#if ejemplo.resultado}<li class="resultado">{ejemplo.resultado}</li>{/if}
</ul>
{#if ejemplo.nota}<p class="nota">{ejemplo.nota}</p>{/if}
