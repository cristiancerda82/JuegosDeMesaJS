<script lang="ts">
  import type { ResultadoManoKlaverjas } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoKlaverjas;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
  }

  let { resultado, lados, bando }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
  const lado = (p: number) => lados[p === bando ? 0 : 1]!;
</script>

<p class="modo" data-testid="resumen-triunfo">
  {T.klaverjas.triunfo(resultado.triunfo, lado(resultado.juega))}
</p>
<table data-testid="resumen-klaverjas">
  <thead>
    <tr>
      <th scope="col">{T.klaverjas.parejaCol}</th>
      <th scope="col">{T.klaverjas.cartasCol}</th>
      <th scope="col">{T.klaverjas.roemCol}</th>
      <th scope="col">{T.klaverjas.anotaCol}</th>
      <th scope="col">{T.klaverjas.partidaCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="cartas-{i}">{resultado.cartas[p]}</td>
        <td data-testid="roem-{i}">{resultado.roem[p]}</td>
        <td data-testid="anota-{i}">{resultado.anotado[p]}</td>
        <td data-testid="partida-{i}">{resultado.puntosTras[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.nat}
  <p class="aviso" data-testid="nat">{T.klaverjas.nat(lado(resultado.juega))}</p>
{/if}
{#if resultado.pit !== null}
  <p class="aviso" data-testid="pit">{T.klaverjas.pit(lado(resultado.pit))}</p>
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
