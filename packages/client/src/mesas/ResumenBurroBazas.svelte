<script lang="ts">
  import type { Asiento, ResultadoManoBurroBazas } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBurroBazas;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.penalizacionesTras.length);
  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived(Array.from({ length: n }, (_, i) => (yo + i) % n));
</script>

<p class="burro" class:propio={resultado.burro === yo} data-testid="resumen-burro">
  {resultado.burro === null
    ? T.burroBazas.sinBurro
    : T.burroBazas.esBurro(nombre(resultado.burro), resultado.cartasBurro)}
</p>
{#if resultado.orden.length > 0}
  <p class="orden" data-testid="resumen-orden">
    {T.burroBazas.orden}: {resultado.orden.map(nombre).join(', ')}
  </p>
{/if}
<table data-testid="resumen-burro-bazas">
  <thead>
    <tr>
      <th scope="col">{T.burroBazas.jugadorCol}</th>
      <th scope="col">{T.burroBazas.penalizacionesCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0} class:burro-fila={a === resultado.burro}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="penalizaciones-{i}">{resultado.penalizacionesTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

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

  .burro-fila td {
    font-weight: 700;
  }

  .burro {
    margin: 0 0 6px;
    font-weight: 600;
    color: var(--acento);
  }

  .burro.propio {
    color: #ff9a9a;
  }

  .orden {
    margin: 0 0 6px;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }
</style>
