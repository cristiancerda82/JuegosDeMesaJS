<script lang="ts">
  import type { ResultadoManoWhist } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoWhist;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
  }

  let { resultado, lados, bando }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

<table data-testid="resumen-whist">
  <thead>
    <tr>
      <th scope="col">{T.whist.parejaCol}</th>
      <th scope="col">{T.whist.bazasCol}</th>
      <th scope="col">{T.whist.manoCol}</th>
      <th scope="col">{T.whist.juegoCol}</th>
      <th scope="col">{T.whist.juegosCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="bazas-{i}">{resultado.bazas[p]}</td>
        <td data-testid="mano-{i}">+{resultado.puntosMano[p]}</td>
        <td data-testid="total-{i}">{resultado.puntosTras[p]}</td>
        <td data-testid="juegos-{i}">{resultado.juegosTras[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.ganaJuego !== null}
  <p class="aviso" data-testid="gana-juego">
    {T.whist.ganaJuego(lados[resultado.ganaJuego === bando ? 0 : 1]!)}
  </p>
{/if}

<style>
  table {
    width: 100%;
    margin-bottom: 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 6px;
  }

  thead th {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    text-align: center;
  }

  .nuestro th {
    color: var(--acento);
  }

  .aviso {
    margin: 0 0 4px;
    font-weight: 700;
    color: var(--acento);
  }
</style>
