<script lang="ts">
  import type { Asiento, ResultadoManoCuatrola } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCuatrola;
    /** Nombre de cada asiento visto desde el jugador. */
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  const quien = $derived(nombre(resultado.jugador));
  const signo = (n: number) => (n > 0 ? `+${n}` : T.cuatrola.numero(n));
</script>

<p class="nota" data-testid="modalidad-mano">
  {T.cuatrola.juega(quien, resultado.modalidad)} · {T.cuatrola.triunfo}:
  <b class="palo">{resultado.triunfo}</b>
</p>
{#if resultado.llamada !== null && resultado.companero !== null}
  <p class="nota" data-testid="llamada-mano">
    {T.cuatrola.llama(nombreCarta(resultado.llamada).toLowerCase())} ·
    {T.cuatrola.companero(nombre(resultado.companero))}
  </p>
{/if}
<p class="nota" data-testid="bazas-mano">
  {T.cuatrola.bazasMano(resultado.bazasJugador, resultado.bazasDefensores)}
</p>
<p class="veredicto" class:pierde={!resultado.gana} data-testid="gana">
  {T.cuatrola.resultado(quien, resultado.gana, resultado.bola)}
</p>
<table data-testid="resumen-cuatrola">
  <thead>
    <tr>
      <th scope="col">{T.cuatrola.jugadorCol}</th>
      <th scope="col">{T.cuatrola.cambioCol}</th>
      <th scope="col">{T.cuatrola.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each [0, 1, 2, 3] as a (a)}
      <tr
        class:jugador={a === resultado.jugador || a === resultado.companero}
        data-testid="fila-{a}"
      >
        <th scope="row">{nombre(a)}</th>
        <td data-testid="cambio-{a}">{signo(resultado.cambio[a]!)}</td>
        <td>{T.cuatrola.numero(resultado.fichasTras[a]!)}</td>
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

  .veredicto {
    margin: 0 0 8px;
    font-weight: 600;
    color: #9fe39f;
  }

  .veredicto.pierde {
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

  .jugador th {
    color: var(--acento);
  }
</style>
