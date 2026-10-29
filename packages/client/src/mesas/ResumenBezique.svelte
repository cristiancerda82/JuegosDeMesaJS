<script lang="ts">
  import type { Asiento, ResultadoManoBezique } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBezique;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const orden = $derived([yo, yo === 0 ? 1 : 0] as const);
  /** Los puntos de la vuelta (el 7) y de los cantes, juntos. */
  const otros = (a: 0 | 1) =>
    resultado.puntosMano[a] - resultado.brisques[a] - (resultado.ultimaBaza === a ? 10 : 0);
</script>

<table data-testid="resumen-bezique">
  <thead>
    <tr>
      <th scope="col">{T.bezique.jugadorCol}</th>
      <th scope="col">{T.bezique.cantesCol}</th>
      <th scope="col">{T.bezique.brisquesCol}</th>
      <th scope="col">{T.bezique.ultimaCol}</th>
      <th scope="col">{T.bezique.manoCol}</th>
      <th scope="col">{T.bezique.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="cantes-{i}">{otros(a as 0 | 1)}</td>
        <td data-testid="brisques-{i}">{resultado.brisques[a as 0 | 1]}</td>
        <td>{resultado.ultimaBaza === a ? 10 : 0}</td>
        <td data-testid="mano-{i}">+{resultado.puntosMano[a as 0 | 1]}</td>
        <td data-testid="total-{i}">{resultado.puntosTras[a as 0 | 1]}</td>
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
    padding: 3px 4px;
  }

  thead th {
    font-size: 0.75rem;
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
</style>
