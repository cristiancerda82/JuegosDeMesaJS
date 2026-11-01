<script lang="ts">
  import type { Asiento, ResultadoManoBarbu } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBarbu;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2, 3].map((i) => (yo + i) % 4));
</script>

<p class="modo" data-testid="resumen-contrato">
  {T.barbu.eligio(nombre(resultado.repartidor), T.barbu.contrato(resultado.contrato, resultado.triunfo))}
</p>
<table data-testid="resumen-barbu">
  <thead>
    <tr>
      <th scope="col">{T.barbu.jugadorCol}</th>
      <th scope="col">{T.barbu.manoCol}</th>
      <th scope="col">{T.barbu.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="mano-{i}">{resultado.puntos[a]}</td>
        <td data-testid="total-{i}">{resultado.totalesTras[a]}</td>
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

  .modo {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }
</style>
