<script lang="ts">
  import type { Asiento, ResultadoManoBelote } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBelote;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, lados, bando, nombre }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

<p class="elige" data-testid="eligio">
  {T.belote.eligio(nombre(resultado.elige), T.belote.paloCorto(resultado.triunfo))}
</p>
<table data-testid="resumen-belote">
  <thead>
    <tr>
      <th scope="col">{T.belote.parejaCol}</th>
      <th scope="col">{T.belote.cartasCol}</th>
      <th scope="col">{T.belote.ultimasCol}</th>
      <th scope="col">{T.belote.beloteCol}</th>
      <th scope="col">{T.belote.manoCol}</th>
      <th scope="col">{T.belote.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="cartas-{i}">{resultado.cartas[p]}</td>
        <td>{resultado.ultimas === p ? 10 : 0}</td>
        <td>{resultado.belote === p ? 20 : 0}</td>
        <td data-testid="mano-{i}">+{resultado.puntosMano[p]}</td>
        <td data-testid="total-{i}">{resultado.totales[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.capot !== null}
  <p class="aviso" data-testid="capot">{T.belote.capot(lados[resultado.capot === bando ? 0 : 1])}</p>
{:else if resultado.dentro}
  <p class="aviso" data-testid="dentro">{T.belote.dentro}</p>
{/if}

<style>
  .elige {
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
    padding: 3px 4px;
  }

  thead th {
    font-size: 0.75rem;
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

  .aviso {
    margin: 0;
    font-weight: 700;
    color: var(--acento);
  }
</style>
