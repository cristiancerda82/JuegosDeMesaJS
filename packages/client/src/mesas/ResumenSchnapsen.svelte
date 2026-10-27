<script lang="ts">
  import type { Asiento, ResultadoManoSchnapsen } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSchnapsen;
    /** Asiento del jugador: su fila va primero. */
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const filas = $derived([yo, yo === 0 ? 1 : 0] as const);
</script>

<p class="ganador" data-testid="ganador-mano">
  {T.schnapsen.gana(nombre(resultado.ganador), resultado.motivo, resultado.cerro === null ? null : nombre(resultado.cerro))}
</p>
<table data-testid="resumen-schnapsen">
  <thead>
    <tr>
      <th scope="col"></th>
      <th scope="col">{T.schnapsen.puntosCol}</th>
      <th scope="col">{T.schnapsen.bazasCol}</th>
      <th scope="col">{T.schnapsen.partidaCol}</th>
      <th scope="col">{T.schnapsen.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="puntos-{i}">{resultado.puntosMano[a]}</td>
        <td>{resultado.bazas[a]}</td>
        <td data-testid="partida-{i}">+{resultado.ganador === a ? resultado.puntosPartida : 0}</td>
        <td data-testid="total-{i}">{resultado.totales[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .ganador {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }

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
