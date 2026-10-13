<script lang="ts">
  import { puntosDe, valorEscoba, type IdCarta } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { IdJuego } from '../sesion/juegos';
  import { T } from '../textos';

  interface Props {
    juego: IdJuego;
    cerrar: () => void;
  }

  let { juego, cerrar }: Props = $props();

  const secciones = $derived(T.ayuda[juego]);

  /** Escalera de Klondike: bajando de uno en uno y alternando colores. */
  const ESCALERA: readonly IdCarta[] = ['corazones-13', 'picas-12', 'diamantes-11', 'treboles-10'];
  /** Las cartas que dan puntos en la Brisca, de mayor a menor. */
  const VALORES: readonly IdCarta[] = ['oros-1', 'oros-3', 'oros-12', 'oros-11', 'oros-10'];
  /** Una pareja que se canta en el Tute: rey y caballo del mismo palo. */
  const CANTE: readonly IdCarta[] = ['copas-12', 'copas-11'];
  /** Valores para sumar en la Escoba. */
  const SUMAS: readonly IdCarta[] = ['bastos-1', 'bastos-5', 'bastos-7', 'bastos-10', 'bastos-11', 'bastos-12'];
  /** Una captura de la Escoba: el caballo de la mano (9) con el 6 de la mesa. */
  const CAPTURA: readonly IdCarta[] = ['oros-11', 'copas-6'];

  let dialogo: HTMLDialogElement | undefined = $state();
  $effect(() => {
    dialogo?.showModal();
  });
</script>

<dialog
  bind:this={dialogo}
  class="ayuda"
  aria-labelledby="ayuda-titulo"
  data-testid="como-se-juega"
  onclose={cerrar}
  onclick={(e) => e.target === dialogo && dialogo.close()}
>
  <div class="contenido">
    <h2 id="ayuda-titulo">{T.ayuda.titulo[juego]}</h2>

    {#each secciones as seccion, i (i)}
      <section>
        {#if seccion.titulo}<h3>{seccion.titulo}</h3>{/if}
        {#each seccion.texto as parrafo, j (j)}
          <p>{parrafo}</p>
        {/each}

        {#if 'ejemplo' in seccion && seccion.ejemplo === 'escalera'}
          <div class="escalera" aria-hidden="true">
            {#each ESCALERA as id, k (id)}
              <div class="hueco" style:top="{k * 30}px"><Carta {id} /></div>
            {/each}
          </div>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'valores'}
          <ul class="valores">
            {#each VALORES as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.ayuda.puntos(puntosDe(id))}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'cante'}
          <ul class="valores">
            {#each CANTE as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
            <li class="resultado">= 20 / 40</li>
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'sumas'}
          <ul class="valores">
            {#each SUMAS as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{valorEscoba(id)}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'captura'}
          <ul class="valores">
            {#each CAPTURA as id, k (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{k === 0 ? `${valorEscoba(id)} +` : valorEscoba(id)}</span>
              </li>
            {/each}
            <li class="resultado">= 15</li>
          </ul>
        {/if}
      </section>
    {/each}
  </div>

  <form method="dialog" class="pie">
    <button class="principal" data-testid="cerrar-ayuda">{T.ayuda.cerrar}</button>
  </form>
</dialog>

<style>
  .ayuda {
    width: min(100% - 24px, 560px);
    max-height: min(100dvh - 24px, 760px);
    padding: 0;
    border: 1px solid rgb(255 255 255 / 0.2);
    border-radius: 16px;
    color: var(--texto);
    background: var(--tapete-oscuro);
    box-shadow: var(--sombra-alta);
    display: flex;
    flex-direction: column;
  }

  .ayuda:not([open]) {
    display: none;
  }

  .ayuda::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .contenido {
    overflow-y: auto;
    padding: 20px 20px 8px;
  }

  h2 {
    font-size: 1.35rem;
    margin-bottom: 4px;
  }

  h3 {
    margin: 16px 0 4px;
    font-size: 1.02rem;
    color: var(--acento);
  }

  p {
    margin: 6px 0;
    line-height: 1.45;
  }

  .hueco {
    width: 52px;
    aspect-ratio: 100 / 140;
  }

  .escalera {
    position: relative;
    height: calc(3 * 30px + 52px * 1.4);
    margin: 10px 0 4px 8px;
  }

  .escalera .hueco {
    position: absolute;
    left: 0;
  }

  .valores {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0 4px;
    padding: 0;
    list-style: none;
  }

  .valores li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .valores .resultado {
    align-self: center;
    font-size: 1.05rem;
    color: var(--acento);
  }

  .pie {
    display: flex;
    justify-content: flex-end;
    padding: 12px 20px 16px;
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }
</style>
