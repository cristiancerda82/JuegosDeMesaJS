<script lang="ts">
  import type { Asiento, ResultadoManoGinRummy } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoGinRummy;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const COLORES_GRUPO = ['#f2c14e', '#52b788', '#6aa9ff', '#ff8fab'];

  const titular = $derived.by(() => {
    const { tipo, cierra, gana, puntosMano } = resultado;
    if (tipo === 'nula' || cierra === null || gana === null) return T.ginRummy.nula;
    return T.ginRummy.titular(tipo, nombre(cierra), nombre(gana), puntosMano);
  });
</script>

<div data-testid="resumen-gin">
  <p class="titular" data-testid="tipo-cierre" data-tipo={resultado.tipo}>{titular}</p>

  <ul class="jugadores">
    {#each resultado.manos as mano (mano.asiento)}
      <li data-testid="resultado-{mano.asiento}">
        <div class="cabecera">
          <b>{nombre(mano.asiento)}</b>
          <span class="puntos">
            {T.ginRummy.sueltos}: <b data-testid="sueltos-{mano.asiento}">{mano.puntos}</b>
            · {T.chinchon.total}: <b data-testid="total-{mano.asiento}">{resultado.puntosTras[mano.asiento]}</b>
          </span>
        </div>
        <div class="cartas">
          {#each mano.combinaciones as combinacion, g (g)}
            <span class="grupo" style:--color-grupo={COLORES_GRUPO[g % COLORES_GRUPO.length]}>
              {#each combinacion as id (id)}
                <span class="mini"><Carta {id} /></span>
              {/each}
            </span>
          {/each}
          {#if mano.colocadas.length > 0}
            <span class="grupo colocadas" title={T.ginRummy.colocadas} data-testid="colocadas-{mano.asiento}">
              {#each mano.colocadas as id (id)}
                <span class="mini"><Carta {id} /></span>
              {/each}
            </span>
          {/if}
          {#if mano.sueltas.length > 0}
            <span class="grupo sueltas">
              {#each mano.sueltas as id (id)}
                <span class="mini"><Carta {id} /></span>
              {/each}
            </span>
          {/if}
        </div>
        {#if mano.colocadas.length > 0}
          <p class="nota">{T.ginRummy.colocaN(mano.colocadas.length)}</p>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .titular {
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
    font-size: 0.88rem;
    font-variant-numeric: tabular-nums;
  }

  .puntos b {
    color: var(--texto);
  }

  .cartas {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .grupo {
    display: inline-flex;
    gap: 2px;
    padding-bottom: 4px;
    border-bottom: 3px solid var(--color-grupo);
  }

  .grupo.colocadas {
    border-bottom: 3px dashed var(--acento);
  }

  .grupo.sueltas {
    border-bottom-color: var(--peligro);
  }

  .mini {
    display: block;
    width: 30px;
    aspect-ratio: 100 / 140;
  }

  .nota {
    margin: 4px 0 0;
    font-size: 0.82rem;
    color: var(--texto-suave);
  }
</style>
