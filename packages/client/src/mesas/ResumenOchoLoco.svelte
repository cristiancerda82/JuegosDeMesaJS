<script lang="ts">
  import type { Asiento, ResultadoManoOchoLoco } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoOchoLoco;
    /** Nombre de cada asiento visto desde el jugador. */
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const asientos = $derived(resultado.puntosEnMano.map((_, a) => a));
  const ganados = $derived(resultado.ganador === null ? 0 : resultado.ganados[resultado.ganador]!);
</script>

{#if resultado.bloqueada}
  <p class="nota" data-testid="bloqueada">{T.ochoLoco.bloqueada}</p>
{/if}
<p class="veredicto" data-testid="gana-mano">
  {resultado.ganador === null
    ? T.ochoLoco.empate
    : T.ochoLoco.ganaMano(nombre(resultado.ganador), ganados)}
</p>
<table data-testid="resumen-ocho-loco">
  <thead>
    <tr>
      <th scope="col">{T.ochoLoco.jugadorCol}</th>
      <th scope="col">{T.ochoLoco.enManoCol}</th>
      <th scope="col">{T.ochoLoco.ganaCol}</th>
      <th scope="col">{T.ochoLoco.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each asientos as a (a)}
      <tr class:ganador={a === resultado.ganador} data-testid="fila-{a}">
        <th scope="row">{nombre(a)}</th>
        <td>{resultado.puntosEnMano[a]}</td>
        <td data-testid="ganados-{a}">{resultado.ganados[a] ? `+${resultado.ganados[a]}` : '—'}</td>
        <td>{resultado.totalesTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .nota {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }

  .veredicto {
    margin: 0 0 8px;
    font-weight: 600;
    color: #9fe39f;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
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

  .ganador th {
    color: var(--acento);
  }
</style>
