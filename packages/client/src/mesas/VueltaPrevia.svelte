<script lang="ts">
  import type { Asiento, IdCarta } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  /**
   * Las jugadas de la vuelta en curso anteriores a la de la mesa (spec mesa-cliente, «Información
   * visible en la mesa»): en escalera, de la primera a la penúltima, pequeñas y con su autor, sin
   * tapar el índice ni el palo de ninguna carta. La jugada que hay que superar la dibuja la mesa.
   */
  interface Props {
    vuelta: readonly { readonly asiento: Asiento; readonly cartas: readonly IdCarta[] }[];
    nombre: (asiento: Asiento) => string;
  }

  let { vuelta, nombre }: Props = $props();

  const previas = $derived(vuelta.slice(0, -1));
</script>

{#if previas.length > 0}
  <ol class="previas" aria-label={T.partida.vuelta} data-testid="vuelta">
    {#each previas as jugada, i (i)}
      <li class="previa" data-testid="previa">
        <span class="cartas">
          {#each jugada.cartas as c (c)}
            <span class="naipe" data-previa={c}><Carta id={c} /></span>
          {/each}
        </span>
        <span class="autor">{nombre(jugada.asiento)}</span>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .previas {
    --ancho-previa: calc(var(--ancho-mesa, var(--ancho-carta, 64px)) * 0.55);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
    gap: 4px 10px;
    margin: 0 0 6px;
    padding: 0;
    list-style: none;
    opacity: 0.85;
  }

  .previa {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .cartas {
    display: flex;
  }

  /* Cada carta tapa la mitad derecha de la anterior: el índice de la esquina sigue a la vista. */
  .naipe {
    width: var(--ancho-previa);
    height: calc(var(--ancho-previa) * 1.4);
  }

  .naipe + .naipe {
    margin-left: calc(var(--ancho-previa) * -0.5);
  }

  .autor {
    max-width: 9em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.72rem;
    color: var(--texto-suave);
  }
</style>
