<script lang="ts">
  import type { Asiento, ResultadoManoOhHell } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoOhHell;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado: r, nombre }: Props = $props();
</script>

<table data-testid="resumen-oh-hell">
  <thead>
    <tr>
      <th scope="col">{T.ohHell.jugador}</th>
      <th scope="col">{T.ohHell.apuestaCol}</th>
      <th scope="col">{T.ohHell.bazasCol}</th>
      <th scope="col">{T.ohHell.puntosCol}</th>
      <th scope="col">{T.ohHell.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each r.apuestas as apuesta, a (a)}
      {@const acierta = apuesta === r.bazas[a]}
      <tr class:acierta data-testid="fila-{a}" data-acierta={acierta}>
        <th scope="row">
          <span class="marca" aria-label={acierta ? T.ohHell.acierto : T.ohHell.fallo}>{acierta ? '✓' : '✗'}</span>
          {nombre(a)}
        </th>
        <td>{apuesta}</td>
        <td>{r.bazas[a]}</td>
        <td data-testid="puntos-mano-{a}">+{r.puntos[a]}</td>
        <td>{r.totales[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
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

  .marca {
    display: inline-block;
    width: 1.2em;
    color: #f08080;
  }

  .acierta .marca {
    color: #8fe08f;
  }

  .acierta td {
    font-weight: 700;
  }
</style>
