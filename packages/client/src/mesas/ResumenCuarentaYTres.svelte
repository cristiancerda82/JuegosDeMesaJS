<script lang="ts">
  import {
    liquidacion,
    NUEVE_DE_ULTIMAS,
    type Asiento,
    type ResultadoManoCuarentaYTres,
  } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCuarentaYTres;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.tantos.length);
  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived(Array.from({ length: n }, (_, i) => (yo + i) % n));
  const ultimas = (a: Asiento) => (a === resultado.ultimas ? NUEVE_DE_ULTIMAS : 0);
  const muestra = $derived(nombreCarta(resultado.muestra).toLowerCase());
  const nota = $derived(
    resultado.cambio === null
      ? T.cuarentaYTres.muestraSinCambiar(muestra)
      : T.cuarentaYTres.muestraCambiada(muestra, nombre(resultado.cambio.asiento)),
  );
</script>

<table data-testid="resumen-cuarenta-y-tres">
  <thead>
    <tr>
      <th scope="col">{T.burroBazas.jugadorCol}</th>
      <th scope="col">{T.tuteGanaPierde.cartasCol}</th>
      <th scope="col">{T.cuarentaYTres.ultimasCol}</th>
      <th scope="col">{T.cuarentaYTres.tantosCol}</th>
      <th scope="col">{T.cuarentaYTres.cobraCol}</th>
      <th scope="col">{T.cuarentaYTres.saldoCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td>{resultado.tantos[a]! - ultimas(a)}</td>
        <td>{ultimas(a)}</td>
        <td class="total" data-testid="tantos-{i}">{resultado.tantos[a]}</td>
        <td data-testid="cobra-{i}">{T.cuarentaYTres.saldo(liquidacion(resultado.tantos[a]!))}</td>
        <td data-testid="saldo-{i}">{T.cuarentaYTres.saldo(resultado.saldosTras[a]!)}</td>
      </tr>
    {/each}
  </tbody>
</table>
<p class="nota" data-testid="resumen-muestra">{nota}</p>

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
    font-size: 0.75rem;
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

  .total {
    font-weight: 700;
  }

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .nota {
    margin: 0 0 6px;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }
</style>
