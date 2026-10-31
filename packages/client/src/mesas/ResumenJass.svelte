<script lang="ts">
  import { MULTIPLICADOR_JASS, type Asiento, type ResultadoManoJass } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoJass;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, lados, bando, nombre }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

<p class="modo" data-testid="resumen-modo">
  {T.jass.modoDe(nombre(resultado.eligio), resultado.modo, MULTIPLICADOR_JASS[resultado.modo])}
</p>
<table data-testid="resumen-jass">
  <thead>
    <tr>
      <th scope="col">{T.jass.parejaCol}</th>
      <th scope="col">{T.jass.weisCol}</th>
      <th scope="col">{T.jass.stockCol}</th>
      <th scope="col">{T.jass.bazasCol}</th>
      <th scope="col">{T.jass.manoCol}</th>
      <th scope="col">{T.jass.partidaCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="weis-{i}">{resultado.weis[p]}</td>
        <td data-testid="stock-{i}">{resultado.stock[p]}</td>
        <td data-testid="bazas-{i}">{resultado.bazas[p]}</td>
        <td data-testid="mano-{i}">{resultado.total[p]}</td>
        <td data-testid="partida-{i}">{resultado.puntosTras[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.match !== null}
  <p class="aviso" data-testid="match">{T.jass.match(lados[resultado.match === bando ? 0 : 1]!)}</p>
{/if}
{#if !resultado.completa}
  <p class="aviso" data-testid="incompleta">{T.jass.incompleta}</p>
{/if}

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
    font-size: 0.75rem;
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

  .aviso {
    margin: 0 0 4px;
    font-weight: 700;
    color: var(--acento);
  }
</style>
