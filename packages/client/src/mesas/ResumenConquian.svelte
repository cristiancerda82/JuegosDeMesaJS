<script lang="ts">
  import type { Asiento, ResultadoManoConquian } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoConquian;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero. */
  const orden = $derived([yo, 1 - yo]);
  const linea = $derived(
    resultado.ganador === null ? T.conquian.tablas : T.conquian.gana(nombre(resultado.ganador)),
  );
</script>

<p class="modo" data-testid="resumen-linea">{linea}</p>
<table data-testid="resumen-conquian">
  <thead>
    <tr>
      <th scope="col">{T.conquian.jugadorCol}</th>
      <th scope="col">{T.conquian.bajadasCol}</th>
      <th scope="col">{T.conquian.ganadasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td>{resultado.bajadas[a]}</td>
        <td data-testid="ganadas-{i}">{resultado.ganadas[a]}</td>
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
    font-size: 0.78rem;
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
