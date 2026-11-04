<script lang="ts">
  import type { ResultadoManoPishti } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoPishti;
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
      concepto: T.pishti.cartas,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].cartas),
      puntos: (b: 0 | 1) => resultado.puntos[b].cartas,
    },
    {
      concepto: T.pishti.asesYJotas,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].ases + resultado.recuento[b].jotas),
      puntos: (b: 0 | 1) => resultado.puntos[b].asesYJotas,
    },
    {
      concepto: T.pishti.dosTreboles,
      detalle: (b: 0 | 1) => (resultado.recuento[b].dosTreboles ? '✓' : '–'),
      puntos: (b: 0 | 1) => resultado.puntos[b].dosTreboles,
    },
    {
      concepto: T.pishti.diezDiamantes,
      detalle: (b: 0 | 1) => (resultado.recuento[b].diezDiamantes ? '✓' : '–'),
      puntos: (b: 0 | 1) => resultado.puntos[b].diezDiamantes,
    },
    {
      concepto: T.pishti.pishtis,
      detalle: (b: 0 | 1) => String(resultado.recuento[b].pishtis),
      puntos: (b: 0 | 1) => resultado.puntos[b].pishtis,
    },
  ]);
</script>

<table class="desglose" data-testid="resumen-pishti">
  <thead>
    <tr>
      <th scope="col">{T.pishti.concepto}</th>
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
      <th scope="row">{T.pishti.totalMano}</th>
      <td><b>{resultado.puntos[orden[0]].total}</b></td>
      <td><b>{resultado.puntos[orden[1]].total}</b></td>
    </tr>
    <tr class="partida">
      <th scope="row">{T.pishti.totalPartida}</th>
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
