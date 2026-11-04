<script lang="ts">
  import type { ResultadoManoCuarenta } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCuarenta;
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
      concepto: T.cuarenta.rondas,
      detalle: (b: 0 | 1) => String(resultado.puntos[b].rondas / 4),
      puntos: (b: 0 | 1) => resultado.puntos[b].rondas,
    },
    {
      concepto: T.cuarenta.caidas,
      detalle: (b: 0 | 1) => String(resultado.puntos[b].caidas / 2),
      puntos: (b: 0 | 1) => resultado.puntos[b].caidas,
    },
    {
      concepto: T.cuarenta.limpias,
      detalle: (b: 0 | 1) => String(resultado.puntos[b].limpias / 2),
      puntos: (b: 0 | 1) => resultado.puntos[b].limpias,
    },
    {
      concepto: T.cuarenta.cartones,
      detalle: (b: 0 | 1) => T.cuarenta.montonCartas(resultado.cartas[b]),
      puntos: (b: 0 | 1) => resultado.puntos[b].cartones,
    },
  ]);
</script>

<table class="desglose" data-testid="resumen-cuarenta">
  <thead>
    <tr>
      <th scope="col">{T.cuarenta.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as fila (fila.concepto)}
      <tr>
        <th scope="row">{fila.concepto}</th>
        {#each orden as b (b)}
          <td data-testid="{fila.concepto === T.cuarenta.cartones ? 'cartones' : 'fila'}-{b === bando ? 0 : 1}">
            <span class="detalle">{fila.detalle(b)}</span>
            <b class:gana={fila.puntos(b) > 0}>+{fila.puntos(b)}</b>
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">{T.cuarenta.totalMano}</th>
      <td><b>{resultado.puntos[orden[0]].total}</b></td>
      <td><b>{resultado.puntos[orden[1]].total}</b></td>
    </tr>
    <tr class="partida">
      <th scope="row">{T.cuarenta.totalPartida}</th>
      <td data-testid="total-0"><b>{resultado.puntosTras[orden[0]]}</b></td>
      <td data-testid="total-1"><b>{resultado.puntosTras[orden[1]]}</b></td>
    </tr>
  </tfoot>
</table>
{#if !resultado.completa}
  <p class="nota" data-testid="a-medias">{T.cuarenta.aMedias}</p>
{/if}

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

  .nota {
    margin: 8px 0 0;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }
</style>
