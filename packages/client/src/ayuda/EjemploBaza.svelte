<script lang="ts">
  import { cartaDeId, PALOS_ESPANOLES, PALOS_FRANCESES, type IdCarta, type Palo } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';
  import type { EjemploBaza } from './tipos';

  let { ejemplo }: { ejemplo: EjemploBaza } = $props();

  const PALOS: readonly string[] = [...PALOS_ESPANOLES, ...PALOS_FRANCESES];
  /** El triunfo es un palo o la carta que lo marca. */
  const paloTriunfo = $derived.by((): Palo | null => {
    const t = ejemplo.triunfo;
    if (t === undefined) return null;
    return PALOS.includes(t) ? (t as Palo) : (cartaDeId(t)?.palo ?? null);
  });
  const muestra = $derived(
    ejemplo.triunfo !== undefined && !PALOS.includes(ejemplo.triunfo) ? (ejemplo.triunfo as IdCarta) : null,
  );
</script>

<div class="baza">
  <p class="triunfo">
    {#if muestra}<span class="hueco muestra"><Carta id={muestra} /></span>{/if}
    {ejemplo.textoTriunfo ??
      (paloTriunfo ? T.ayuda.triunfo(T.cartas.palos[paloTriunfo] ?? paloTriunfo) : T.ayuda.sinTriunfo)}
  </p>
  <ol class="fila-cartas">
    {#each ejemplo.jugadas as { quien, id }, i (i)}
      <li class:gana={i === ejemplo.gana}>
        <span class="quien">{quien}</span>
        <div class="hueco" class:resaltada={i === ejemplo.gana}><Carta {id} /></div>
        {#if i === ejemplo.gana}<span class="marca">{T.ayuda.gana}</span>{/if}
      </li>
    {/each}
  </ol>
  <p class="nota">{ejemplo.porque}</p>
</div>

<style>
  .triunfo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .muestra {
    --ancho-carta: 30px;
  }

  .quien {
    font-weight: 600;
    color: var(--texto-suave);
  }

  .marca {
    color: var(--acento);
  }

  li:not(.gana) .quien + .hueco {
    margin-bottom: calc(0.8rem + 4px);
  }
</style>
