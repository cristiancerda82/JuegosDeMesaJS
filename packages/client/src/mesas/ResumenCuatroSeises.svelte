<script lang="ts">
  import type { Asiento, ResultadoManoCuatroSeises } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCuatroSeises;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.fichas.length);
  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived(Array.from({ length: n }, (_, i) => (yo + i) % n));
</script>

<p class="gana" data-testid="gana-mano">{T.cuatroSeises.seLleva(nombre(resultado.ganador), resultado.fondo)}</p>
<table data-testid="resumen-cuatro-seises">
  <thead>
    <tr>
      <th></th>
      <th scope="col">{T.cuatroSeises.pasesCol}</th>
      <th scope="col">{T.cuatroSeises.manoCol}</th>
      <th scope="col">{T.cuatroSeises.saldoCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:ganador={a === resultado.ganador}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="pases-{i}">{resultado.pases[a]}</td>
        <td data-testid="mano-{i}">{T.cuatroSeises.signo(resultado.fichas[a]!)}</td>
        <td data-testid="saldo-{i}">{T.cuatroSeises.signo(resultado.saldosTras[a]!)}</td>
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
