<script lang="ts">
  import type { Asiento, ResultadoManoTuteSubastado } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTuteSubastado;
    /** Nombre de cada asiento visto desde el jugador. */
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const quien = $derived(nombre(resultado.pujador));
  const signo = (n: number) => (n > 0 ? `+${n}` : T.tuteSubastado.numero(n));
</script>

<p class="nota" data-testid="puja-mano">
  {T.tuteSubastado.puja(resultado.puja, quien)} · {T.tuteSubastado.triunfo}:
  <b class="palo">{resultado.triunfo}</b>
</p>
{#if resultado.tute !== null}
  <p class="tute" data-testid="tute-mano">{T.tuteSubastado.tuteDe(nombre(resultado.tute))}</p>
{/if}
<p class="nota" data-testid="puntos-mano">
  {T.tuteSubastado.puntosMano(resultado.puntosPujador, resultado.puntosDefensores)}
</p>
<p class="veredicto" class:falla={!resultado.cumple} data-testid="cumple">
  {resultado.cumple
    ? T.tuteSubastado.cumple(quien, resultado.puja)
    : T.tuteSubastado.falla(quien, resultado.puja)}
</p>
<table data-testid="resumen-tute-subastado">
  <thead>
    <tr>
      <th scope="col">{T.tuteSubastado.jugador}</th>
      <th scope="col">{T.tuteSubastado.cambioCol}</th>
      <th scope="col">{T.tuteSubastado.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each [0, 1, 2, 3] as a (a)}
      <tr class:pujador={a === resultado.pujador} data-testid="fila-{a}">
        <th scope="row">{nombre(a)}</th>
        <td data-testid="cambio-{a}">{signo(resultado.cambio[a]!)}</td>
        <td>{T.tuteSubastado.numero(resultado.fichasTras[a]!)}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .nota {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }

  .palo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .tute {
    margin: 0 0 6px;
    font-weight: 600;
    color: var(--acento);
  }

  .veredicto {
    margin: 0 0 8px;
    font-weight: 600;
    color: #9fe39f;
  }

  .veredicto.falla {
    color: #ff9a9a;
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

  .pujador th {
    color: var(--acento);
  }
</style>
