<script lang="ts" module>
  /** Tercios de punto como puntos con fracción: 16 → «5⅓», 2 → «⅔». */
  export function conTercios(tercios: number): string {
    const enteros = Math.floor(tercios / 3);
    const fraccion = ['', '⅓', '⅔'][tercios % 3]!;
    return enteros === 0 && fraccion !== '' ? fraccion : `${enteros}${fraccion}`;
  }
</script>

<script lang="ts">
  import type { ResultadoManoTressette } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTressette;
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
  }

  let { resultado, lados, bando }: Props = $props();

  const parejas = $derived([bando, (1 - bando) as 0 | 1] as const);
</script>

<table data-testid="resumen-tressette">
  <thead>
    <tr>
      <th scope="col">{T.tressette.parejaCol}</th>
      <th scope="col">{T.tressette.cartasCol}</th>
      <th scope="col">{T.tressette.anotaCol}</th>
      <th scope="col">{T.tressette.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each parejas as p, i (p)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{lados[i]}</th>
        <td data-testid="cartas-{i}">{conTercios(resultado.tercios[p])}</td>
        <td data-testid="anota-{i}">{resultado.puntos[p]}</td>
        <td data-testid="total-{i}"><b>{resultado.puntosTras[p]}</b></td>
      </tr>
    {/each}
  </tbody>
</table>
<p class="aviso" data-testid="ultima-baza">
  {T.tressette.ultima(lados[resultado.ultima === bando ? 0 : 1]!)}
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
    color: var(--texto-suave);
  }
</style>
