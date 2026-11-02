<script lang="ts">
  import type { Asiento, ResultadoManoSchafkopf } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSchafkopf;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2, 3].map((i) => (yo + i) % 4));
  const extras = $derived(
    [
      resultado.schneider ? T.schafkopf.schneider : null,
      resultado.schwarz ? T.schafkopf.schwarz : null,
      resultado.laufende > 0 ? T.schafkopf.laufende(resultado.laufende) : null,
    ].filter((x) => x !== null),
  );
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
</script>

{#if resultado.contrato === null || resultado.jugador === null}
  <p class="modo" data-testid="resumen-contrato">{T.schafkopf.nadieJuega}</p>
{:else}
  <p class="modo" data-testid="resumen-contrato">
    {T.schafkopf.juega(nombre(resultado.jugador), T.schafkopf.contrato(resultado.contrato))}
    {#if resultado.companero !== null}· {T.schafkopf.companero(nombre(resultado.companero))}{/if}
  </p>
  <p class="aviso" data-testid="resumen-puntos">
    {T.schafkopf.puntosLados(resultado.puntosJugador, 120 - resultado.puntosJugador)} ·
    {resultado.ganaJugador ? T.schafkopf.gana : T.schafkopf.pierde}
  </p>
  <p class="modo" data-testid="resumen-tarifa">
    {[...extras, T.schafkopf.tarifa(resultado.tarifa)].join(' · ')}
  </p>
{/if}
<table data-testid="resumen-schafkopf">
  <thead>
    <tr>
      <th scope="col">{T.schafkopf.jugadorCol}</th>
      <th scope="col">{T.schafkopf.manoCol}</th>
      <th scope="col">{T.schafkopf.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="mano-{i}">{signo(resultado.fichasMano[a]!)}</td>
        <td data-testid="total-{i}">{resultado.fichasTras[a]}</td>
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
    color: var(--texto-suave);
  }

  .aviso {
    margin: 0 0 6px;
    font-weight: 700;
    color: var(--acento);
  }
</style>
