<script lang="ts">
  import type { Asiento, ResultadoManoRummy500 } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoRummy500;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const signo = (n: number) => (n > 0 ? `+${n}` : String(n));
</script>

<div data-testid="resumen-rummy">
  <p class="cierre" data-testid="quien-cierra">
    {resultado.cerro === null ? T.rummy500.sinMazo : T.rummy500.cierra(nombre(resultado.cerro))}
  </p>
  <ul class="jugadores">
    {#each resultado.puntosMano as puntos, a (a)}
      <li data-testid="resultado-{a}">
        <div class="cabecera">
          <b>{nombre(a)}</b>
          <span class="puntos">
            {T.rummy500.bajado}: <b>{resultado.bajado[a]}</b> · {T.rummy500.enMano}: <b>{resultado.enMano[a]}</b>
            · {T.rummy500.manoCol}: <b data-testid="mano-{a}">{signo(puntos)}</b> · {T.rummy500.total}:
            <b data-testid="total-{a}">{resultado.totalesTras[a]}</b>
          </span>
        </div>
        {#if (resultado.cartasEnMano[a] ?? []).length > 0}
          <div class="cartas">
            {#each resultado.cartasEnMano[a] ?? [] as id (id)}
              <span class="mini"><Carta {id} /></span>
            {/each}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .cierre {
    margin: 0 0 10px;
    font-weight: 700;
    color: var(--acento);
  }

  .jugadores {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
  }

  .cabecera {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 10px;
    margin-bottom: 4px;
  }

  .puntos {
    color: var(--texto-suave);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  .puntos b {
    color: var(--texto);
  }

  .cartas {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  .mini {
    display: block;
    width: 28px;
    aspect-ratio: 100 / 140;
  }
</style>
