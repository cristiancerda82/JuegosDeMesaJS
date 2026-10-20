<script lang="ts">
  import { BAZAS_MANO_JULEPE, type Asiento, type ResultadoManoJulepe } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoJulepe;
    /** Nombre de cada asiento visto desde el jugador. */
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  /** Los asientos que estaban en la mano: los eliminados antes no deciden (`null`). */
  const filas = $derived(resultado.juega.flatMap((j, a) => (j === null ? [] : [a])));
</script>

{#if resultado.nadieJugo}
  <p class="nota" data-testid="nadie-juega">{T.julepe.nadieJuega(nombre(resultado.repartidor))}</p>
{:else}
  <p class="nota" data-testid="valor-baza">
    {T.julepe.boteMano(resultado.boteMano, Math.floor(resultado.boteMano / BAZAS_MANO_JULEPE))}
  </p>
{/if}
<table data-testid="resumen-julepe">
  <thead>
    <tr>
      <th scope="col">{T.julepe.jugador}</th>
      <th scope="col">{T.julepe.bazasCol}</th>
      <th scope="col">{T.julepe.cobraCol}</th>
      <th scope="col">{T.julepe.julepeCol}</th>
      <th scope="col">{T.julepe.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as a (a)}
      <tr class:pagan={resultado.julepe[a]! > 0} data-testid="fila-{a}">
        <th scope="row">{nombre(a)}</th>
        {#if resultado.juega[a] === true}
          <td>{resultado.bazas[a]}</td>
        {:else}
          <td class="paso">{T.julepe.pasoCelda}</td>
        {/if}
        <td>{resultado.cobrado[a] ? `+${resultado.cobrado[a]}` : ''}</td>
        <td data-testid="julepe-{a}">{resultado.julepe[a] ? `−${resultado.julepe[a]}` : ''}</td>
        <td>
          {resultado.eliminadosTras[a] ? T.julepe.eliminado : resultado.fichasTras[a]}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .nota {
    margin: 0 0 8px;
    color: var(--texto-suave);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
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

  .paso {
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  .pagan td {
    color: #ff9a9a;
    font-weight: 700;
  }
</style>
