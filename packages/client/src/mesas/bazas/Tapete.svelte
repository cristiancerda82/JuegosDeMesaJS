<script lang="ts">
  import type { CartaJugada } from '@juegos/engine';
  import type { Snippet } from 'svelte';
  import Carta from '../../cartas/Carta.svelte';
  import type { Interaccion } from '../../interaccion/interaccion.svelte';
  import { T } from '../../textos';
  import { lado } from './asientos';

  interface Props {
    jugadas: readonly CartaJugada[];
    jugadores: number;
    /** Asiento del jugador: su carta se dibuja abajo. */
    yo?: number;
    interaccion: Interaccion;
    aviso: string | null;
    /** Contenido extra del aviso (p. ej. las cartas de un cante). */
    detalleAviso?: Snippet | undefined;
  }

  let { jugadas, jugadores, yo = 0, interaccion, aviso, detalleAviso }: Props = $props();
</script>

<div
  class="tapete"
  class:cuatro={jugadores === 4}
  class:legal={interaccion.resaltados.has('mesa')}
  data-destino="mesa"
  data-testid="mesa"
  aria-label={T.brisca.mesa}
  role="button"
  tabindex="-1"
  onclick={() => interaccion.tocarDestino('mesa')}
  onkeydown={() => {}}
>
  {#each jugadas as jugada (jugada.carta)}
    <div
      class="jugada {lado(jugada.asiento, jugadores, yo)}"
      data-carta={jugada.carta}
      data-desde="mano-{jugada.asiento}"
    >
      <Carta id={jugada.carta} />
    </div>
  {/each}
  {#if aviso}
    <div class="aviso" role="status" data-testid="aviso">
      <span>{aviso}</span>
      {@render detalleAviso?.()}
    </div>
  {/if}
</div>

<style>
  .tapete {
    position: relative;
    flex: 1;
    min-width: calc(var(--ancho-carta) * 2.2);
    max-width: calc(var(--ancho-carta) * 3.4);
    height: calc(var(--alto-carta) * 1.9);
    border-radius: 18px;
    background: rgb(0 0 0 / 0.12);
    outline: 2px dashed rgb(255 255 255 / 0.15);
    outline-offset: -2px;
  }

  .tapete.cuatro {
    height: calc(var(--alto-carta) * 2.2);
  }

  .tapete.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .jugada {
    position: absolute;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    left: 50%;
    top: 50%;
    margin-left: calc(var(--ancho-carta) / -2);
    margin-top: calc(var(--alto-carta) / -2);
  }

  .jugada.abajo {
    translate: 0 28%;
  }

  .jugada.arriba {
    translate: 0 -28%;
  }

  .cuatro .jugada.abajo {
    translate: 0 36%;
  }

  .cuatro .jugada.arriba {
    translate: 0 -36%;
  }

  .jugada.derecha {
    translate: 45% 0;
  }

  .jugada.izquierda {
    translate: -45% 0;
  }

  .aviso {
    position: absolute;
    left: 50%;
    bottom: -6px;
    transform: translate(-50%, 100%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 14px;
    white-space: nowrap;
    font-weight: 700;
    background: rgb(0 0 0 / 0.6);
    z-index: 5;
  }
</style>
