<script lang="ts">
  import type { Asiento, ResultadoManoRams } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoRams;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.fichasTras.length);
  /** El jugador primero y los demás en el orden de la mesa, solo los que tenían cartas. */
  const orden = $derived(
    Array.from({ length: n }, (_, i) => (yo + i) % n).filter((a) => resultado.dichos[a] !== null),
  );
  const dicho = (a: Asiento) => {
    const d = resultado.dichos[a];
    return d === 'nina' ? T.rams.nina : d === 'rams' ? T.rams.juega : T.rams.pasa;
  };
  const retirados = $derived(
    orden.filter((a) => resultado.fichasTras[a] === 0 && resultado.dichos[a] !== 'paso'),
  );
</script>

{#if resultado.sinJugar}
  <p class="nota" data-testid="sin-jugar">{T.rams.sinJugar(nombre(resultado.repartidor))}</p>
{/if}
<table data-testid="resumen-rams">
  <thead>
    <tr>
      <th></th>
      <th scope="col">{T.rams.dichoCol}</th>
      <th scope="col">{T.rams.bazasCol}</th>
      <th scope="col">{T.rams.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={a === yo} class:ramse={resultado.ramses.includes(a)}>
        <th scope="row">{nombre(a)}</th>
        <td>{dicho(a)}</td>
        <td data-testid="bazas-{i}">{resultado.dichos[a] === 'paso' ? '–' : resultado.bazas[a]}</td>
        <td data-testid="fichas-{i}">{resultado.fichasTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.ramses.length > 0}
  <p class="nota ramse" data-testid="ramses">{T.rams.ramse(resultado.ramses.map(nombre))}</p>
{/if}
{#if retirados.length > 0}
  <p class="nota" data-testid="retirados">{T.rams.retira(retirados.map(nombre))}</p>
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

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .ramse td {
    color: #ff9a9a;
  }

  .nota {
    margin: 0 0 6px;
    font-weight: 600;
  }

  .nota.ramse {
    color: #ff9a9a;
  }
</style>
