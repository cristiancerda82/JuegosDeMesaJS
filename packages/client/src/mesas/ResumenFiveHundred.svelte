<script lang="ts">
  import type { Asiento, ResultadoManoFiveHundred } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoFiveHundred;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, lados, bando, nombre }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

{#if resultado.contrato === null || resultado.juega === null}
  <p class="aviso" data-testid="sin-contrato">{T.fiveHundred.sinContrato}</p>
{:else}
  <p class="modo" data-testid="resumen-contrato">
    {T.fiveHundred.jugo(nombre(resultado.juega), resultado.contrato)}
  </p>
  <table data-testid="resumen-500">
    <thead>
      <tr>
        <th scope="col">{T.fiveHundred.parejaCol}</th>
        <th scope="col">{T.fiveHundred.bazasCol}</th>
        <th scope="col">{T.fiveHundred.sumaCol}</th>
        <th scope="col">{T.fiveHundred.partidaCol}</th>
      </tr>
    </thead>
    <tbody>
      {#each parejas as p, i (p)}
        <tr class:nuestro={i === 0}>
          <th scope="row">{lados[i]}</th>
          <td data-testid="bazas-{i}">{resultado.bazas[p]}</td>
          <td data-testid="suma-{i}">{resultado.suma[p] > 0 ? `+${resultado.suma[p]}` : resultado.suma[p]}</td>
          <td data-testid="partida-{i}">{resultado.puntosTras[p]}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="aviso" data-testid="cumple">{resultado.cumple ? T.fiveHundred.cumple : T.fiveHundred.noCumple}</p>
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
