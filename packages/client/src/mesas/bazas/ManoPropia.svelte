<script lang="ts">
  import type { IdCarta } from '@juegos/engine';
  import Carta from '../../cartas/Carta.svelte';
  import type { Interaccion } from '../../interaccion/interaccion.svelte';

  interface Props {
    cartas: readonly IdCarta[];
    jugable: (carta: IdCarta) => boolean;
    interaccion: Interaccion;
  }

  let { cartas, jugable, interaccion }: Props = $props();
</script>

<!--
  Cada carta ocupa una ranura que puede encogerse hasta dejar a la vista el índice (≈ 30 % de
  la carta); la carta dentro conserva su tamaño y la siguiente la tapa en parte. Así la mano
  cabe entera, sin scroll horizontal, tenga 3 o 10 cartas.
-->
<div class="mano" data-testid="mano">
  {#each cartas as id (id)}
    <div class="ranura">
      <div
        class="carta-mano"
        class:jugable={jugable(id)}
        class:seleccionada={interaccion.seleccion === id}
        data-carta={id}
        data-desde="mazo"
        data-testid="mano-{id}"
        use:interaccion.origen={id}
      >
        <Carta {id} />
      </div>
    </div>
  {/each}
</div>

<style>
  .mano {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: var(--alto-carta);
    padding-top: 10px;
  }

  .ranura {
    flex: 0 1 var(--ancho-carta);
    min-width: calc(var(--ancho-carta) * 0.3);
    margin-right: clamp(4px, 2vw, 14px);
  }

  .ranura:last-child {
    flex-shrink: 0;
    margin-right: 0;
  }

  .carta-mano {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    cursor: default;
    touch-action: none;
    transition: translate 120ms;
  }

  .carta-mano.jugable {
    cursor: grab;
  }

  .carta-mano.jugable:hover,
  .carta-mano.seleccionada {
    translate: 0 -8px;
  }

  .carta-mano.seleccionada {
    outline: 3px solid var(--resalte);
    z-index: 2;
  }

  :global(.carta-mano.arrastrando) {
    cursor: grabbing;
    filter: drop-shadow(var(--sombra-alta));
  }
</style>
