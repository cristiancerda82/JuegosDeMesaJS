<script lang="ts">
  import type { Asiento, ResultadoManoChinchon } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoChinchon;
    nombre: (asiento: Asiento) => string;
    /** Eliminados antes de esta mano, para marcar solo a los que caen ahora. */
    eliminadosAntes: readonly boolean[];
  }

  let { resultado, nombre, eliminadosAntes }: Props = $props();

  const COLORES_GRUPO = ['#f2c14e', '#52b788', '#6aa9ff', '#ff8fab'];
</script>

<p class="cierre" data-testid="quien-cierra">
  {resultado.chinchon ? T.chinchon.chinchon(nombre(resultado.cierra)) : T.chinchon.cierra(nombre(resultado.cierra))}
</p>

<ul class="jugadores">
  {#each resultado.manos as mano (mano.asiento)}
    {@const cae = resultado.eliminadosTras[mano.asiento] && !eliminadosAntes[mano.asiento]}
    <li data-testid="resultado-{mano.asiento}">
      <div class="cabecera">
        <b>{nombre(mano.asiento)}</b>
        <span class="puntos">
          {T.chinchon.puntosMano}: <b>{mano.puntos > 0 ? `+${mano.puntos}` : mano.puntos}</b>
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
        {#if mano.sueltas.length > 0}
          <span class="grupo sueltas">
            {#each mano.sueltas as id (id)}
              <span class="mini"><Carta {id} /></span>
            {/each}
          </span>
        {/if}
      </div>
      {#if cae}
        <p class="eliminado">{T.chinchon.quedaEliminado}</p>
      {/if}
    </li>
  {/each}
</ul>

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

  .grupo.sueltas {
    border-bottom-color: var(--peligro);
  }

  .mini {
    display: block;
    width: 30px;
    aspect-ratio: 100 / 140;
  }

  .eliminado {
    margin: 4px 0 0;
    color: var(--peligro);
    font-weight: 700;
    font-size: 0.88rem;
  }
</style>
