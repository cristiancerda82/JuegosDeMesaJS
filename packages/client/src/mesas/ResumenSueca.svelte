<script lang="ts">
  import type { ResultadoManoSueca } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSueca;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
  }

  let { resultado, lados, bando }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

<table data-testid="resumen-sueca">
  <thead>
    <tr>
      <th scope="col">{T.sueca.parejaCol}</th>
      <th scope="col">{T.sueca.puntosCol}</th>
      <th scope="col">{T.sueca.juegosCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="puntos-mano-{i}">{resultado.puntos[p]}</td>
        <td data-testid="juegos-{i}">{resultado.juegosTras[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
<p class="aviso" data-testid="gana-juegos">
  {resultado.gana === null
    ? T.sueca.empate
    : T.sueca.ganan(lados[resultado.gana === bando ? 0 : 1]!, resultado.juegosGanados)}
</p>

<style>
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

  .nuestro th {
    color: var(--acento);
  }

  .aviso {
    margin: 0 0 4px;
    font-weight: 700;
    color: var(--acento);
  }
</style>
