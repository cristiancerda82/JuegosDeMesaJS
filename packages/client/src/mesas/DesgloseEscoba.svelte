<script lang="ts">
  import type { ResultadoManoEscoba } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoEscoba;
    /** Nombres de los dos bandos. */
    lados: readonly [string, string];
    /** Puntos acumulados de la partida tras esta mano. */
    totales: readonly [number, number];
  }

  let { resultado, lados, totales }: Props = $props();

  const filas = $derived([
    {
      concepto: T.escoba.escobas,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].escobas),
      puntos: (b: 0 | 1) => resultado.puntos[b].escobas,
    },
    {
      concepto: T.escoba.cartas,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].cartas),
      puntos: (b: 0 | 1) => resultado.puntos[b].cartas,
    },
    {
      concepto: T.escoba.oros,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].oros),
      puntos: (b: 0 | 1) => resultado.puntos[b].oros,
    },
    {
      concepto: T.escoba.sieteOros,
      detalle: (b: 0 | 1) => (resultado.recuento[b].sieteOros ? '✓' : '–'),
      puntos: (b: 0 | 1) => resultado.puntos[b].sieteOros,
    },
    {
      concepto: T.escoba.sietes,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].sietes),
      puntos: (b: 0 | 1) => resultado.puntos[b].sietes,
    },
  ]);
</script>

<table class="desglose" data-testid="desglose">
  <thead>
    <tr>
      <th scope="col">{T.escoba.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as fila (fila.concepto)}
      <tr>
        <th scope="row">{fila.concepto}</th>
        {#each [0, 1] as const as b (b)}
          <td>
            <span class="detalle">{fila.detalle(b)}</span>
            <b class:gana={fila.puntos(b) > 0}>+{fila.puntos(b)}</b>
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">{T.escoba.totalMano}</th>
      <td><b>{resultado.puntos[0].total}</b></td>
      <td><b>{resultado.puntos[1].total}</b></td>
    </tr>
    <tr class="partida">
      <th scope="row">{T.escoba.totalPartida}</th>
      <td data-testid="total-0"><b>{totales[0]}</b></td>
      <td data-testid="total-1"><b>{totales[1]}</b></td>
    </tr>
  </tfoot>
</table>

<style>
  .desglose {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }

  th,
  td {
    padding: 4px 6px;
    text-align: center;
  }

  th[scope='row'] {
    text-align: left;
    font-weight: 500;
  }

  thead th {
    color: var(--texto-suave);
    font-weight: 600;
  }

  td {
    font-variant-numeric: tabular-nums;
  }

  .detalle {
    color: var(--texto-suave);
    margin-right: 6px;
  }

  b {
    color: var(--texto-suave);
  }

  b.gana {
    color: var(--acento);
  }

  tfoot tr {
    border-top: 1px solid rgb(255 255 255 / 0.2);
  }

  tfoot b {
    color: var(--texto);
    font-size: 1.05rem;
  }

  .partida th,
  .partida b {
    font-weight: 800;
  }
</style>
