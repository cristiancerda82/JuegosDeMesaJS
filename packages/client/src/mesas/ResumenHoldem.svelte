<script lang="ts">
  import { NOMBRES_MANO_POKER, type Asiento, type ResultadoManoHoldem } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoHoldem;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const nombres = (asientos: readonly Asiento[]) => asientos.map(nombre).join(', ');
</script>

<div data-testid="resumen-holdem">
  {#if resultado.comunes.length > 0}
    <div class="comunes">
      {#each resultado.comunes as id (id)}
        <span class="mini"><Carta {id} /></span>
      {/each}
    </div>
  {/if}

  {#if resultado.sinShowdown !== null}
    <p class="titular" data-testid="sin-showdown">
      {T.holdem.sinShowdown(nombre(resultado.sinShowdown), resultado.botes[0]?.cantidad ?? 0)}
    </p>
  {:else}
    <ul class="manos">
      {#each resultado.ensenadas as m (m.asiento)}
        <li data-testid="ensenada-{m.asiento}">
          <b>{nombre(m.asiento)}</b>
          <span class="cartas">
            {#each m.cartas as id (id)}
              <span class="mini"><Carta {id} /></span>
            {/each}
          </span>
          <span class="jugada" data-testid="jugada-{m.asiento}">{NOMBRES_MANO_POKER[m.categoria]}</span>
        </li>
      {/each}
    </ul>
    <ul class="botes">
      {#each resultado.botes as b, i (i)}
        <li data-testid="bote-{i}">
          {i === 0 ? T.holdem.bote(b.cantidad) : T.holdem.boteN(i + 1, b.cantidad)}:
          <b>{nombres(b.ganadores)}</b>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .comunes {
    display: flex;
    justify-content: center;
    gap: 3px;
    margin-bottom: 8px;
  }

  .mini {
    display: block;
    width: 30px;
    aspect-ratio: 100 / 140;
  }

  .titular {
    margin: 4px 0;
    font-weight: 700;
    color: var(--acento);
  }

  .manos,
  .botes {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0 0 8px;
    padding: 0;
    list-style: none;
    text-align: left;
  }

  .manos li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
  }

  .cartas {
    display: flex;
    gap: 2px;
  }

  .jugada {
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .botes li {
    font-size: 0.9rem;
  }
</style>
