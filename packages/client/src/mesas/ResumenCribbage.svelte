<script lang="ts">
  import type { Asiento, ResultadoManoCribbage } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCribbage;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const CONCEPTOS = ['quinces', 'parejas', 'escaleras', 'color', 'nobs'] as const;
</script>

<div class="recuentos" data-testid="resumen-cribbage">
  {#each resultado.recuentos as r, i (i)}
    <section class="recuento" data-testid="recuento-{i}">
      <h3>{r.crib ? T.cribbage.cribDe(nombre(r.asiento)) : T.cribbage.manoDe(nombre(r.asiento))}</h3>
      <div class="cartas">
        {#each r.cartas as c (c)}
          <span class="mini"><Carta id={c} /></span>
        {/each}
        {#if resultado.starter}
          <span class="mini starter"><Carta id={resultado.starter} /></span>
        {/if}
      </div>
      <p class="desglose">
        {#each CONCEPTOS.filter((k) => r.desglose[k] > 0) as k (k)}
          <span>{T.cribbage[k]} {r.desglose[k]}</span>
        {/each}
        <b data-testid="total-recuento-{i}">{T.cribbage.total} {r.desglose.total}</b>
      </p>
    </section>
  {/each}
</div>
<table>
  <thead>
    <tr>
      <th></th>
      <th scope="col">{T.cribbage.juegoCartas}</th>
      <th scope="col">{T.cribbage.totales}</th>
    </tr>
  </thead>
  <tbody>
    {#each [0, 1] as a (a)}
      <tr>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="juego-{a}">+{resultado.puntosJuego[a]}</td>
        <td data-testid="totales-{a}">{resultado.totales[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .recuentos {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }

  .recuento h3 {
    margin: 0 0 2px;
    font-size: 0.9rem;
  }

  .cartas {
    display: flex;
    justify-content: center;
    gap: 3px;
  }

  .mini {
    width: 34px;
    aspect-ratio: 100 / 140;
  }

  .mini.starter {
    margin-left: 6px;
    outline: 2px solid var(--acento);
    border-radius: 7%;
  }

  .desglose {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 10px;
    margin: 2px 0 0;
    font-size: 0.82rem;
    color: var(--texto-suave);
  }

  .desglose b {
    color: var(--acento);
  }

  table {
    margin: 0 auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 8px;
  }

  thead th {
    color: var(--texto-suave);
    font-size: 0.8rem;
    font-weight: 600;
  }

  td {
    text-align: center;
    font-weight: 700;
  }
</style>
