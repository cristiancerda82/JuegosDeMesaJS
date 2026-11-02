<script lang="ts">
  import type { ResultadoManoScopa } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoScopa;
    /** Nombres de los dos bandos. */
    lados: readonly [string, string];
    /** Bando del jugador: sus valores van en la primera columna. */
    bando?: 0 | 1;
  }

  let { resultado, lados, bando = 0 }: Props = $props();

  /** Bandos en el orden de las columnas. */
  const orden = $derived(bando === 0 ? ([0, 1] as const) : ([1, 0] as const));

  const filas = $derived([
    {
      concepto: T.scopa.scopas,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].scopas),
      puntos: (b: 0 | 1) => resultado.puntos[b].scopas,
    },
    {
      concepto: T.scopa.cartas,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].cartas),
      puntos: (b: 0 | 1) => resultado.puntos[b].cartas,
    },
    {
      concepto: T.scopa.oros,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].oros),
      puntos: (b: 0 | 1) => resultado.puntos[b].oros,
    },
    {
      concepto: T.scopa.settebello,
      detalle: (b: 0 | 1) => (resultado.recuento[b].settebello ? '✓' : '–'),
      puntos: (b: 0 | 1) => resultado.puntos[b].settebello,
    },
    {
      concepto: T.scopa.primiera,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].primiera),
      puntos: (b: 0 | 1) => resultado.puntos[b].primiera,
    },
  ]);
</script>

<table class="desglose" data-testid="resumen-scopa">
  <thead>
    <tr>
      <th scope="col">{T.scopa.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as fila (fila.concepto)}
      <tr>
        <th scope="row">{fila.concepto}</th>
        {#each orden as b (b)}
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
      <th scope="row">{T.scopa.totalMano}</th>
      <td><b>{resultado.puntos[orden[0]].total}</b></td>
      <td><b>{resultado.puntos[orden[1]].total}</b></td>
    </tr>
    <tr class="partida">
      <th scope="row">{T.scopa.totalPartida}</th>
      <td data-testid="total-0"><b>{resultado.puntosTras[orden[0]]}</b></td>
      <td data-testid="total-1"><b>{resultado.puntosTras[orden[1]]}</b></td>
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
