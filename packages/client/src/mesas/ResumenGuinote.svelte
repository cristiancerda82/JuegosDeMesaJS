<script lang="ts">
  import type { ResultadoManoGuinote } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoGuinote;
    /** Nombre de cada bando: el del humano primero. */
    lados: readonly [string, string];
  }

  let { resultado, lados }: Props = $props();

  const filas = $derived([
    { concepto: T.guinote.bazas, valores: resultado.bazas },
    { concepto: T.guinote.cantes, valores: resultado.cantes },
    {
      concepto: T.guinote.ultimas,
      valores: [resultado.ultimas === 0 ? 10 : 0, resultado.ultimas === 1 ? 10 : 0],
    },
  ]);
</script>

<table class="resumen" data-testid="resumen-guinote">
  <thead>
    <tr>
      <th scope="col">{T.guinote.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as fila (fila.concepto)}
      <tr>
        <th scope="row">{fila.concepto}</th>
        <td>{fila.valores[0]}</td>
        <td>{fila.valores[1]}</td>
      </tr>
    {/each}
    <tr class="total">
      <th scope="row">{T.guinote.totalMano}</th>
      <td>{resultado.puntos[0]}</td>
      <td>{resultado.puntos[1]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.guinote.totalPartida}</th>
      <td data-testid="total-0">{resultado.totalesTras[0]}</td>
      <td data-testid="total-1">{resultado.totalesTras[1]}</td>
    </tr>
  </tbody>
</table>

<style>
  .resumen {
    margin: 6px auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 10px;
  }

  thead th {
    color: var(--texto-suave);
    font-weight: 600;
    font-size: 0.88rem;
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  .total th,
  .total td {
    border-top: 1px solid rgb(255 255 255 / 0.2);
  }

  .total td {
    color: var(--acento);
  }
</style>
