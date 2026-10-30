<script lang="ts">
  import type { Asiento, ResultadoManoTarot } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTarot;
    yo: Asiento;
    n: number;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, n, nombre }: Props = $props();

  const asientos = $derived(Array.from({ length: n }, (_, i) => (yo + i) % n));
  const signo = (x: number) => (x > 0 ? `+${x}` : `${x}`);
  const medios = (m: number) => T.tarot.medios(m);
</script>

<div data-testid="resumen-tarot">
  {#if resultado.nula}
    <p class="ganador">{T.tarot.nula}</p>
  {:else}
    <p data-testid="resumen-contrato">
      {T.tarot.contratoDe(resultado.contrato!, nombre(resultado.preneur!))}
      {#if resultado.pareja !== null}· {T.tarot.conPareja(nombre(resultado.pareja))}{/if}
    </p>
    <p data-testid="resumen-puntos">
      {T.tarot.puntosAtaque(medios(resultado.mediosAtaque), resultado.oudlers, resultado.necesarios)}
    </p>
    <p class="ganador" data-testid="ganador-mano">
      {resultado.gana ? T.tarot.ganaPor(resultado.diferencia) : T.tarot.pierdePor(resultado.diferencia)}
    </p>
    {#if resultado.petitAuBout}<p>{T.tarot.petitAuBout(resultado.petitAuBout)}</p>{/if}
    {#if resultado.poignees > 0}<p>{T.tarot.poignees(resultado.poignees)}</p>{/if}
  {/if}
  <table>
    <thead>
      <tr>
        <th scope="col">{T.tarot.jugadorCol}</th>
        <th scope="col">{T.tarot.manoCol}</th>
        <th scope="col">{T.tarot.totalCol}</th>
      </tr>
    </thead>
    <tbody>
      {#each asientos as a, i (a)}
        <tr class:nuestro={i === 0}>
          <th scope="row">{nombre(a)}</th>
          <td data-testid="cambio-{i}">{signo(resultado.cambio[a]!)}</td>
          <td data-testid="total-{i}">{resultado.puntosTras[a]}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  p {
    margin: 2px 0;
    font-size: 0.9rem;
  }

  .ganador {
    margin: 4px 0;
    font-weight: 700;
    color: var(--acento);
  }

  table {
    width: 100%;
    margin: 6px 0 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 2px 4px;
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
</style>
