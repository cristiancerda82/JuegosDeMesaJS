<script lang="ts">
  import type { Asiento, ResultadoManoPolignac } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoPolignac;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.puntos.length);
  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived(Array.from({ length: n }, (_, i) => (yo + i) % n));
</script>

{#if resultado.general !== null}
  <p class="modo" class:fallido={!resultado.cumplido} data-testid="resumen-general">
    {resultado.cumplido
      ? T.polignac.generalCumplido(nombre(resultado.general))
      : T.polignac.generalFallido(nombre(resultado.general))}
  </p>
{/if}
<table data-testid="resumen-polignac">
  <thead>
    <tr>
      <th scope="col">{T.polignac.jugadorCol}</th>
      <th scope="col">{T.polignac.manoCol}</th>
      <th scope="col">{T.polignac.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="mano-{i}">{resultado.puntos[a]}</td>
        <td data-testid="total-{i}">{resultado.totalesTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

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
    font-weight: 600;
    color: var(--acento);
  }

  .modo.fallido {
    color: #ff9a9a;
  }
</style>
