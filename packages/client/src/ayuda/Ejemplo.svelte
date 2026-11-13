<script lang="ts">
  import EjemploAntesDespues from './EjemploAntesDespues.svelte';
  import EjemploBaza from './EjemploBaza.svelte';
  import EjemploCartas from './EjemploCartas.svelte';
  import EjemploJugadas from './EjemploJugadas.svelte';
  import EjemploTabla from './EjemploTabla.svelte';
  import type { Ejemplo } from './tipos';

  interface Props {
    clave: string;
    ejemplo: Ejemplo;
  }

  let { clave, ejemplo }: Props = $props();
</script>

<figure class="ejemplo" data-testid="ejemplo-{clave}" aria-label={ejemplo.descripcion}>
  {#if ejemplo.tipo === 'cartas'}
    <EjemploCartas {ejemplo} />
  {:else if ejemplo.tipo === 'jugadas'}
    <EjemploJugadas {ejemplo} />
  {:else if ejemplo.tipo === 'baza'}
    <EjemploBaza {ejemplo} />
  {:else if ejemplo.tipo === 'antesDespues'}
    <EjemploAntesDespues {ejemplo} />
  {:else}
    <EjemploTabla {ejemplo} />
  {/if}
</figure>

<style>
  .ejemplo {
    margin: 10px 0 6px;
    padding: 10px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.18);
    min-width: 0;
  }

  /* Estilos comunes de los ejemplos (los componentes de cada tipo los usan). */
  .ejemplo :global(.hueco) {
    width: var(--ancho-carta, 52px);
    aspect-ratio: 100 / 140;
    flex: none;
    border-radius: 6px;
  }

  .ejemplo :global(.hueco.resaltada) {
    outline: 3px solid var(--acento);
    outline-offset: 1px;
  }

  .ejemplo :global(.fila-cartas) {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ejemplo :global(.fila-cartas li) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .ejemplo :global(.resultado) {
    align-self: center;
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--acento);
  }

  .ejemplo :global(.nota) {
    margin: 8px 0 0;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }
</style>
