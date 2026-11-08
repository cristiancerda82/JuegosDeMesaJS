<script lang="ts">
  import type { CartaJugada } from '@juegos/engine';
  import { untrack, type Snippet } from 'svelte';
  import Carta from '../../cartas/Carta.svelte';
  import type { Interaccion } from '../../interaccion/interaccion.svelte';
  import { ritmo } from '../../ritmo/ritmo.svelte';
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
    /** Baza retenida (velocidad Pausada): tocar la mesa la recoge. */
    seguir?: (() => void) | undefined;
    /** Nombre de cada asiento: la última carta de un rival se marca con el suyo. */
    nombre?: ((asiento: number) => string) | undefined;
    /** Repaso de una baza: cada carta lleva el nombre de quien la jugó. */
    conNombres?: boolean;
  }

  let {
    jugadas,
    jugadores,
    yo = 0,
    interaccion,
    aviso,
    detalleAviso,
    seguir,
    nombre,
    conNombres = false,
  }: Props = $props();

  // Este tapete ofrece su propio «Seguir»: la partida no pone el general.
  $effect(() => {
    untrack(() => ritmo.tapetes++);
    return () => untrack(() => ritmo.tapetes--);
  });

  /** La carta que acaba de llegar, si es de un rival: queda marcada hasta la siguiente. */
  const ultima = $derived.by(() => {
    const j = jugadas.at(-1);
    return j && j.asiento !== yo && nombre ? j : null;
  });
</script>

<div
  class="tapete"
  class:cuatro={jugadores >= 4}
  class:muchos={jugadores >= 5}
  data-jugadores={Math.min(Math.max(jugadores, 2), 6)}
  class:legal={interaccion.resaltados.has('mesa')}
  data-destino="mesa"
  data-testid="mesa"
  aria-label={T.brisca.mesa}
  role="button"
  tabindex="-1"
  onclick={() => (seguir ? seguir() : interaccion.tocarDestino('mesa'))}
  onkeydown={() => {}}
>
  {#each jugadas as jugada (`${jugada.asiento}-${jugada.carta}`)}
    <div
      class="jugada {lado(jugada.asiento, jugadores, yo)}"
      class:ultima={jugada === ultima}
      data-carta={jugada.carta}
      data-desde="mano-{jugada.asiento}"
    >
      <Carta id={jugada.carta} />
      {#if conNombres && nombre}
        <span class="autor">{nombre(jugada.asiento)}</span>
      {:else if jugada === ultima}
        <span class="autor" data-testid="ultima-jugada">{nombre!(jugada.asiento)}</span>
      {/if}
    </div>
  {/each}
  {#if aviso}
    <div class="aviso" role="status" data-testid="aviso">
      <span>{aviso}</span>
      {@render detalleAviso?.()}
      {#if seguir}
        <button
          class="seguir"
          onclick={(e) => {
            e.stopPropagation();
            seguir();
          }}
          data-testid="seguir">{T.partida.seguir}</button
        >
      {/if}
    </div>
  {/if}
</div>

<style>
  .tapete {
    position: relative;
    flex: 1;
    min-width: calc(var(--ancho-carta) * 2.2);
    max-width: calc(var(--ancho-carta) * 3.4);
    height: calc(var(--alto-carta) * 2.1);
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

  /*
   * Las cartas de la baza no se tocan (spec mesa-cliente, «Información visible en la mesa»):
   * cada una se aparta algo más de su propio tamaño de las demás, así ninguna tapa el índice de
   * otra sea cual sea el orden en que se jueguen. De 4 jugadores en adelante son algo más
   * pequeñas para caber. Los desplazamientos son en % del tamaño de la propia carta.
   */
  .tapete {
    --carta-mesa: var(--ancho-carta);
  }

  .tapete.cuatro {
    --carta-mesa: calc(var(--ancho-carta) * 0.75);
  }

  .jugada {
    position: absolute;
    width: var(--carta-mesa);
    height: calc(var(--carta-mesa) * 1.4);
    left: 50%;
    top: 50%;
    margin-left: calc(var(--carta-mesa) / -2);
    margin-top: calc(var(--carta-mesa) * -0.7);
  }

  .jugada.abajo {
    translate: 0 52%;
  }

  .jugada.arriba {
    translate: 0 -52%;
  }

  /* Con 3: los dos rivales arriba, uno junto al otro. */
  [data-jugadores='3'] .jugada.derecha {
    translate: 52% -52%;
  }

  [data-jugadores='3'] .jugada.izquierda {
    translate: -52% -52%;
  }

  /* Con 4: en rombo. */
  [data-jugadores='4'] .jugada.derecha {
    translate: 104% 0;
  }

  [data-jugadores='4'] .jugada.izquierda {
    translate: -104% 0;
  }

  /* Con 5 y 6: dos filas; abajo el jugador y los laterales, arriba los de enfrente. */
  .muchos .jugada.derecha {
    translate: 104% 52%;
  }

  .muchos .jugada.izquierda {
    translate: -104% 52%;
  }

  [data-jugadores='5'] .jugada.arriba-izquierda {
    translate: -52% -52%;
  }

  [data-jugadores='5'] .jugada.arriba-derecha {
    translate: 52% -52%;
  }

  [data-jugadores='6'] .jugada.arriba-izquierda {
    translate: -104% -52%;
  }

  [data-jugadores='6'] .jugada.arriba-derecha {
    translate: 104% -52%;
  }

  /* La carta que acaba de llegar va delante y resaltada, con el nombre de quien la jugó. */
  .jugada.ultima {
    z-index: 2;
    border-radius: 8px;
    box-shadow:
      0 0 0 3px var(--acento),
      0 0 14px rgb(255 224 102 / 0.55);
  }

  /* Dentro de la parte de abajo de su carta: no tapa el índice de ninguna. */
  .autor {
    position: absolute;
    left: 50%;
    bottom: 3px;
    translate: -50% 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 1px 4px;
    border-radius: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    background: var(--acento);
    color: #2b2005;
    pointer-events: none;
  }

  .cuatro .autor {
    font-size: 0.6rem;
  }

  .seguir {
    min-height: 32px;
    padding: 0.1rem 0.9rem;
    font-weight: 700;
    background: var(--acento);
    color: #2b2005;
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
