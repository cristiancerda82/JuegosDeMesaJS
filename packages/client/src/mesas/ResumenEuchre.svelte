<script lang="ts">
  import type { Asiento, ResultadoManoEuchre } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoEuchre;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, lados, bando, nombre }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

<p class="elige" data-testid="eligio">
  {T.euchre.eligio(nombre(resultado.elige), T.euchre.paloCorto(resultado.triunfo), resultado.solo)}
</p>
<table data-testid="resumen-euchre">
  <thead>
    <tr>
      <th scope="col">{T.euchre.parejaCol}</th>
      <th scope="col">{T.euchre.bazasCol}</th>
      <th scope="col">{T.euchre.manoCol}</th>
      <th scope="col">{T.euchre.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="bazas-{i}">{resultado.bazas[p]}</td>
        <td data-testid="mano-{i}">+{resultado.puntosMano[p]}</td>
        <td data-testid="total-{i}">{resultado.totales[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.euchre}
  <p class="aviso" data-testid="euchre">{T.euchre.euchre}</p>
{/if}

<style>
  .elige {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }

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
    font-weight: 600;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  tr.nuestro td {
    color: var(--acento);
  }

  .aviso {
    margin: 0;
    font-weight: 700;
    color: var(--acento);
  }
</style>
