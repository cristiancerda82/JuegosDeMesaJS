<script lang="ts">
  import type { Asiento, ResultadoManoCulo } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCulo;
    /** Número de la mano, desde 1. */
    numero: number;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, numero, nombre }: Props = $props();
</script>

<table class="resumen-culo" data-testid="resumen-culo" data-mano={numero}>
  <thead>
    <tr>
      <th scope="col">{T.culo.colPuesto}</th>
      <th scope="col"></th>
      <th scope="col">{T.culo.colCargo}</th>
      <th scope="col">{T.culo.colMano}</th>
      <th scope="col">{T.culo.colTotal}</th>
    </tr>
  </thead>
  <tbody>
    {#each resultado.orden as a, p (a)}
      <tr data-testid="fila-{a}">
        <td>{T.culo.puesto(p + 1)}</td>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="cargo-mano-{a}">{T.culo.cargos[resultado.cargos[a]!]}</td>
        <td>{T.culo.masPuntos(resultado.puntosMano[a]!)}</td>
        <td data-testid="total-{a}"><b>{resultado.totalesTras[a]}</b></td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .resumen-culo {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 4px 6px;
    text-align: left;
  }

  tbody th {
    white-space: nowrap;
  }

  thead th {
    font-size: 0.78rem;
    color: var(--texto-suave);
  }

  tbody tr + tr {
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }
</style>
