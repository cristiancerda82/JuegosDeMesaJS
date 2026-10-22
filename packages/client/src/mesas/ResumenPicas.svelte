<script lang="ts">
  import type { Asiento, ResultadoManoPicas } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoPicas;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, lados, bando, nombre }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
  const conSigno = (n: number) => (n > 0 ? `+${n}` : String(n));
</script>

<table data-testid="apuestas-picas">
  <thead>
    <tr>
      <th scope="col">{T.picas.jugadorCol}</th>
      <th scope="col">{T.picas.apuestaCol}</th>
      <th scope="col">{T.picas.bazasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each [0, 1, 2, 3] as a (a)}
      <tr class:nuestro={a % 2 === bando}>
        <th scope="row">{nombre(a)}</th>
        <td>{T.picas.apuesta(resultado.apuestas[a]!)}</td>
        <td data-testid="bazas-{a}">{resultado.bazas[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<table data-testid="resumen-picas">
  <thead>
    <tr>
      <th scope="col">{T.picas.parejaCol}</th>
      <th scope="col">{T.picas.contratoCol}</th>
      <th scope="col">{T.picas.manoCol}</th>
      <th scope="col">{T.picas.sacosCol}</th>
      <th scope="col">{T.picas.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td>{resultado.bazasContrato[p]} / {resultado.contratos[p]}</td>
        <td data-testid="mano-{i}">{conSigno(resultado.puntosMano[p])}</td>
        <td>{resultado.sacosTras[p]}</td>
        <td data-testid="total-{i}">{resultado.puntosTras[p]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#each parejas as p, i (p)}
  {#if resultado.penalizacion[p]}
    <p class="aviso" data-testid="penalizacion-{i}">{T.picas.penalizacion(lados[i]!)}</p>
  {/if}
{/each}

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
    margin: 0 0 8px;
    color: #ff9a9a;
  }
</style>
