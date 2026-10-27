<script lang="ts">
  import type { Asiento, ResultadoManoSkat } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSkat;
    /** Asiento del jugador: su fila va primero. */
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado: r, yo, nombre }: Props = $props();

  const filas = $derived([yo, (yo + 1) % 3, (yo + 2) % 3]);
</script>

<p class="juego" data-testid="resumen-juego">
  {T.skat.juegaSolista(nombre(r.solista), T.skat.juego(r.juego), r.mano, r.anuncio, r.puja)}
</p>
<div class="skat">
  {T.skat.elSkat}
  {#each r.skat as c (c)}
    <span class="mini"><Carta id={c} /></span>
  {/each}
</div>
<table data-testid="resumen-skat">
  <tbody>
    {#if r.juego !== 'nulo'}
      <tr>
        <th scope="row">{T.skat.puntosCartas}</th>
        <td data-testid="puntos-solista">{r.puntosSolista}</td>
      </tr>
      <tr>
        <th scope="row">{T.skat.multiplicador}</th>
        <td>{T.skat.conSin(r.matadores!.con, r.matadores!.n)} · × {r.multiplicador}</td>
      </tr>
    {:else}
      <tr>
        <th scope="row">{T.skat.bazasSolista}</th>
        <td>{r.bazasSolista}</td>
      </tr>
    {/if}
    <tr>
      <th scope="row">{T.skat.valor}</th>
      <td data-testid="valor">{r.valor}</td>
    </tr>
  </tbody>
</table>
<p class="aviso" data-testid="resultado-solista">
  {T.skat.resultado(nombre(r.solista), r.gana, r.pasado, r.delta)}
</p>
<table class="totales">
  <tbody>
    {#each filas as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="total-{i}">{r.totales[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .juego {
    margin: 0 0 6px;
    font-weight: 600;
  }

  .skat {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
    color: var(--texto-suave);
  }

  .mini {
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

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: right;
    font-weight: 700;
  }

  tr.nuestro td {
    color: var(--acento);
  }

  .aviso {
    margin: 0 0 6px;
    font-weight: 700;
    color: var(--acento);
  }
</style>
