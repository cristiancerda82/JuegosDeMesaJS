<script lang="ts">
  import type { Asiento, ResultadoManoTysiacha } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTysiacha;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2].map((i) => (yo + i) % 3));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const linea = $derived(
    `${T.tysiacha.contrato(nombre(resultado.declarante), resultado.contrato)} · ${
      resultado.cumplido ? T.tysiacha.cumple : T.tysiacha.falla
    }`,
  );
</script>

<p class="modo" data-testid="resumen-contrato">{linea}</p>
<table data-testid="resumen-tysiacha">
  <thead>
    <tr>
      <th scope="col">{T.tysiacha.jugadorCol}</th>
      <th scope="col">{T.tysiacha.cartasCol}</th>
      <th scope="col">{T.tysiacha.matrimoniosCol}</th>
      <th scope="col">{T.tysiacha.anotaCol}</th>
      <th scope="col">{T.tysiacha.marcadorCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td>{resultado.puntosCartas[a]}</td>
        <td>{resultado.matrimonios[a]}</td>
        <td data-testid="anota-{i}">{signo(resultado.anotado[a]!)}</td>
        <td data-testid="total-{i}">
          {resultado.marcadorTras[a]}{#if resultado.barrilTras[a] !== null}
            {' '}{T.tysiacha.enBarril}{/if}
        </td>
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
    padding: 3px 4px;
  }

  thead th {
    font-size: 0.78rem;
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
    white-space: nowrap;
  }

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .modo {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }
</style>
