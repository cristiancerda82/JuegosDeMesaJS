<script lang="ts">
  import type { Asiento, ResultadoManoSevens } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSevens;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();
</script>

<p class="gana" data-testid="gana-mano">{T.sevens.ganaMano(nombre(resultado.ganador))}</p>
<table data-testid="resumen-sevens">
  <thead>
    <tr>
      <th></th>
      <th scope="col">{T.sevens.quedan}</th>
      <th scope="col">{T.sevens.totalPartida}</th>
    </tr>
  </thead>
  <tbody>
    {#each resultado.cartasRestantes as quedan, a (a)}
      <tr class:ganador={a === resultado.ganador}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="quedan-{a}">{T.sevens.cartas(quedan)}</td>
        <td data-testid="total-mano-{a}">{resultado.totalesTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .gana {
    margin: 0 0 8px;
    font-weight: 700;
    color: var(--acento);
  }

  table {
    margin: 0 auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 10px;
  }

  thead th {
    color: var(--texto-suave);
    font-size: 0.85rem;
    font-weight: 600;
  }

  tbody th {
    text-align: left;
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  tr.ganador td,
  tr.ganador th {
    color: var(--acento);
  }
</style>
