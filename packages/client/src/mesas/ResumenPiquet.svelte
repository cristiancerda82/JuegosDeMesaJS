<script lang="ts">
  import type { Asiento, ResultadoManoPiquet } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoPiquet;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const orden = $derived([yo, yo === 0 ? 1 : 0] as const);
  const repique = (a: number) => (resultado.repique === a ? 60 : 0);
  const pique = (a: number) => (resultado.pique === a ? 30 : 0);
  const cartas = (a: number) => (resultado.cartas === a ? (resultado.capote ? 40 : 10) : 0);
  /** Los puntos de las bazas: lo que queda de la mano. */
  const juego = (a: 0 | 1) =>
    resultado.puntosMano[a] - resultado.porDeclaraciones[a] - repique(a) - pique(a) - cartas(a);
</script>

<table data-testid="resumen-piquet">
  <thead>
    <tr>
      <th scope="col">{T.piquet.jugadorCol}</th>
      <th scope="col">{T.piquet.declaracionesCol}</th>
      <th scope="col">{T.piquet.primasCol}</th>
      <th scope="col">{T.piquet.bazasCol}</th>
      <th scope="col">{T.piquet.cartasCol}</th>
      <th scope="col">{T.piquet.manoCol}</th>
      <th scope="col">{T.piquet.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td>{resultado.porDeclaraciones[a as 0 | 1]}</td>
        <td>{repique(a) + pique(a)}</td>
        <td>{juego(a as 0 | 1)}</td>
        <td>{cartas(a)}</td>
        <td data-testid="mano-{i}">+{resultado.puntosMano[a as 0 | 1]}</td>
        <td data-testid="total-{i}">{resultado.puntosTras[a as 0 | 1]}</td>
      </tr>
    {/each}
  </tbody>
</table>
{#if resultado.capote}<p class="aviso">{T.piquet.capote}</p>{/if}

<style>
  table {
    width: 100%;
    margin-bottom: 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 3px;
  }

  thead th {
    font-size: 0.7rem;
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
    margin: 0 0 4px;
    font-weight: 700;
    color: var(--acento);
  }
</style>
