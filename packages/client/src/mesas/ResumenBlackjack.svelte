<script lang="ts">
  import type { Asiento, ResultadoManoBlackjack } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBlackjack;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const conSigno = (n: number) => (n > 0 ? `+${n}` : String(n));
</script>

<div class="banca">
  <span class="etiqueta">{T.blackjack.banca}</span>
  <span class="cartas">
    {#each resultado.banca as id (id)}
      <span class="mini"><Carta {id} /></span>
    {/each}
  </span>
  <b data-testid="resumen-valor-banca">{resultado.valorBanca}</b>
</div>

<table data-testid="resumen-blackjack">
  <thead>
    <tr>
      <th scope="col">{T.blackjack.jugadorCol}</th>
      <th scope="col">{T.blackjack.manosCol}</th>
      <th scope="col">{T.blackjack.ganaCol}</th>
      <th scope="col">{T.blackjack.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each resultado.manos as manos, a (a)}
      {#if manos.length > 0}
        <tr data-testid="fila-{a}">
          <th scope="row">{nombre(a)}</th>
          <td>
            {#each manos as m, i (i)}
              <span class="resultado {m.resultado}" data-testid="resultado-{a}-{i}">
                {m.valor} · {T.blackjack.resultado[m.resultado]}
              </span>
            {/each}
          </td>
          <td data-testid="ganancia-{a}">{conSigno(resultado.ganancias[a]!)}</td>
          <td>{resultado.fichasTras[a]}</td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>

<style>
  .banca {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .etiqueta {
    color: var(--texto-suave);
  }

  .cartas {
    display: inline-flex;
    gap: 2px;
  }

  .mini {
    display: block;
    width: 30px;
    aspect-ratio: 100 / 140;
  }

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

  .resultado {
    display: block;
    font-size: 0.85rem;
  }

  .resultado.gana,
  .resultado.blackjack {
    color: #9fe39f;
  }

  .resultado.pierde,
  .resultado.pasa {
    color: #ff9a9a;
  }
</style>
